import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { OpenaiService } from '../services/openai.service';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { Observable, of } from 'rxjs';

import { map } from 'rxjs/operators';

import { ModelService } from '../services/model.service';
import { HistoryService } from '../services/history.service';
import { environment } from '../environment/environment';

import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ChangeDetectorRef } from '@angular/core';


/**
 * Interface pour un message
 */
export interface Message {
  sender: string; // L'expéditeur du message
  content: string | SafeHtml; // Le contenu du message
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule
  ],
  providers: [
    OpenaiService,
    HttpClient
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})

export class ChatComponent {
  messages: Message[] = [{ sender: 'PrideGPT', content: 'Bienvenue sur PrideGPT!' }]; // Les messages de la conversation
  userInput = ''; // L'entrée utilisateur
  selectedModel = 'gpt-3.5-turbo'; // Le modèle OpenAI par défaut
  selectedDalleModel = 'dall-e-2'; // Le modèle DALL-E par défaut
  selectedVoice = 'alloy'; // La voix par défaut
  selectedStableDiffusionModel = 'stable-diffusion-v1'; // Le modèle Stable Diffusion par défaut
  selectedLanguage = 'python'; // Le langage de programmation par défaut
  selectedFile: File | null = null; // Le fichier audio sélectionné

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private openaiService: OpenaiService, 
    private modelService: ModelService, 
    private sanitizer: DomSanitizer, 
    private cdr: ChangeDetectorRef, 
    private HistoryService: HistoryService
  ) { }

  ngOnInit() {
    this.modelService.currentModel.subscribe(model => this.selectedModel = model);
  }

  private mediaRecorder: MediaRecorder | null = null; // L'enregistreur audio
  private audioChunks: Blob[] = []; // Les morceaux audio enregistrés
  isRecording = false; // Indique si l'enregistrement est en cours

  selectedResponseMode = 'text'; // Le mode de réponse par défaut

  commandList: string[] = ['/image', '/speech', '/code', '/translate', '/transcribe'];
  filteredCommands: Observable<string[]> = of([]);

  onInputChange() {
    if (this.userInput.startsWith('/')) {
      this.filteredCommands = of(this.commandList).pipe(
        map(commands => commands.filter(command => command.startsWith(this.userInput)))
      );
    } else {
      this.filteredCommands = of([]);
    }
  }

  private escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&#039;');
  }
  

  saveSession() {
    this.HistoryService.addSession([...this.messages]); // Crée une copie des messages pour l'immuabilité
    this.messages = []; // Réinitialisez ou non selon vos besoins
  }

  loadHistory() {
    const allHistory = this.HistoryService.getHistory();
    console.log(allHistory); 
  }
  
  /**
   * Envoie un message
   */
  sendMessage() {
    const trimmedInput = this.userInput.trim(); // Supprime les espaces inutiles
    this.userInput = ''; // Réinitialise l'entrée utilisateur
    if (!trimmedInput) return; // Ignore les messages vides

    if (trimmedInput.startsWith('/')) { // Vérifie si l'entrée est une commande
      this.handleCommand(trimmedInput); // Traite la commande
    } else { // Sinon, envoie un message texte
      this.sendTextMessage(trimmedInput); // Envoie un message texte
    }
  }

  sendTextMessage(text: string) {
    console.log('Modele utilisé : ' + this.selectedModel);
    this.messages.push({ sender: 'User', content: text }); // Ajoute le message de l'utilisateur
    this.openaiService.sendMessage(text, this.selectedModel).subscribe({ // Envoie le message à OpenAI
      next: (response) => { // En cas de succès
        const botResponse = response.choices[0].message.content; // Récupère la réponse du bot
        const escapedResponse = this.escapeHtml(botResponse); // Échappe les caractères HTML
        this.typeWriterText(escapedResponse, 'PrideGPT'); // Affiche la réponse progressivement
      },
      error: (err) => { // En cas d'erreur
        console.error('Error when calling OpenAI:', err); // Affiche l'erreur dans la console
        this.messages.push({ sender: 'PrideGPT', content: 'Erreur lors de la connexion à OpenAI.' }); // Ajoute un message d'erreur
      }
    });
  }
  

  // sendTextMessage(text: string) { // Envoie un message texte
  //   this.messages.push({ sender: 'User', content: text }); // Ajoute le message de l'utilisateur
  //   this.openaiService.sendMessage(text, this.selectedModel).subscribe({ // Envoie le message à OpenAI
  //     next: (response) => { // En cas de succès
  //       const botResponse = response.choices[0].message.content; // Récupère la réponse du bot
  //       this.messages.push({ sender: 'PrideGPT', content: botResponse }); // Ajoute la réponse du bot
  //     },
  //     error: (err) => { // En cas d'erreur
  //       console.error('Error when calling OpenAI:', err); // Affiche l'erreur dans la console
  //       this.messages.push({ sender: 'PrideGPT', content: 'Erreur lors de la connexion à OpenAI.' }); // Ajoute un message d'erreur
  //     }
  //   });
  // }

  /**
   * Méthode pour traiter les commandes
   * @param command Commande à traiter
   */
  handleCommand(command: string) {
    const [commandKey, ...args] = command.split(' '); // Découpe la commande en clé et arguments
    const description = args.join(' '); // Concatène les arguments en une description

    this.messages.push({ sender: 'User', content: command }); // Ajoute la commande à la conversation

    switch (commandKey) { // Traite la commande en fonction de la clé
      case '/image': // Si la commande est '/image'
        const text = "Génère l'image : " + description; // Prépare la description
        this.messages.push({ sender: 'User', content: text }); // Ajoute la description à la conversation
        this.handleImageCommand(description); // Traite la commande d'image
        break; // Sort de la structure de contrôle
      case '/speech': // Si la commande est '/speech'
        this.handleSpeechCommand(description); // Traite la commande de parole
        break; // Sort de la structure de contrôle
      case '/stable-diffusion': // Si la commande est '/stable-diffusion'
        this.handleStableDiffusionCommand(description); // Traite la commande de Stable Diffusion
        break; // Sort de la structure de contrôle
      case '/code': // Si la commande est '/code'
        this.handleCodeCommand(description); // Traite la commande de code
        break; // Sort de la structure de contrôle
      case '/translate': // Si la commande est '/translate'
        this.handleTranslateCommand(description); // Traite la commande de traduction
        break; // Sort de la structure de contrôle
      case '/transcribe': // Si la commande est '/transcribe'
        this.handleTranscriptionCommand();  // Traite la commande de transcription
        break; // Sort de la structure de contrôle
      default: // Si la commande est inconnue
        this.messages.push({ sender: 'System', content: "Commande inconnue. Essayez de nouveau!" }); // Ajoute un message d'erreur
    }
  }

  /**
   * Méthode pour traiter la commande d'image
   * @param description  Description de l'image
   * @returns  
   */
  handleImageCommand(description: string) {
    if (!description) { // Vérifie si la description est vide 
      this.messages.push({ sender: 'System', content: "Veuillez fournir une description pour l'image." }); // Ajoute un message d'erreur
      return; // Sort de la méthode
    }

    console.log('Demande d\'image:', description); // Affiche la description dans la console

    this.openaiService.sendImageRequest(description, this.selectedDalleModel).subscribe({ // Envoie la demande d'image à OpenAI
      next: (response) => { // En cas de succès
        console.log('Réponse de l\'API pour l\'image:', response); // Affiche la réponse dans la console

        const imageUrl = response.data[0].url; // Récupère l'URL de l'image
        console.log('URL de l\'image:', imageUrl); // Affiche l'URL de l'image dans la console

        const imageHtml = this.sanitizer.bypassSecurityTrustHtml(`<img src="${imageUrl}" alt="Generated Image" style="max-width:500px; height:500px;">`); // Crée une balise HTML pour l'image
        this.messages.push({ sender: 'PrideGPT', content: imageHtml as string }); // Ajoute l'image à la conversation
      },
      error: (err) => { // En cas d'erreur
        console.error('Error when calling OpenAI:', err); // Affiche l'erreur dans la console
        this.messages.push({ sender: 'PrideGPT', content: 'Erreur lors de la connexion à OpenAI.' }); // Ajoute un message d'erreur
      }
    });
  }

  /**
   * Méthode pour traiter la commande de parole
   * @param text Texte à convertir en parole
   * @returns 
   */
  handleSpeechCommand(text: string) { // Traite la commande de parole
    if (!text) { // Vérifie si le texte est vide
      this.messages.push({ sender: 'System', content: "Veuillez fournir du texte à convertir en parole." }); // Ajoute un message d'erreur
      return; // Sort de la méthode
    }

    this.messages.push({ sender: 'User', content: `/speech ${text}` }); // Ajoute la commande à la conversation

    this.openaiService.sendSpeechRequest(text, 'tts-1', this.selectedVoice, 'mp3', 1.0).subscribe({ // Envoie la demande de parole à OpenAI
      next: (response) => { // En cas de succès
        const audioUrl = URL.createObjectURL(response); // Crée une URL pour l'audio
        console.log('URL de l\'audio:', audioUrl); // Affiche l'URL de l'audio dans la console

        const audioHtml = this.sanitizer.bypassSecurityTrustHtml(`<audio controls><source src="${audioUrl}" type="audio/mp3"></audio>`); // Crée une balise HTML pour l'audio
        this.messages.push({ sender: 'PrideGPT', content: audioHtml as string }); // Ajoute l'audio à la conversation
      },
      error: (err) => { // En cas d'erreur
        console.error('Error when calling OpenAI:', err); // Affiche l'erreur dans la console
        this.messages.push({ sender: 'PrideGPT', content: 'Erreur lors de la connexion à OpenAI.' }); // Ajoute un message d'erreur
      }
    });
  }

  /**
   * Méthode pour traiter la commande de Stable Diffusion
   */
  handleStableDiffusionCommand(description: string) {
    if (!description) { // Vérifie si la description est vide
      this.messages.push({ sender: 'System', content: "Veuillez fournir une description pour l'image." }); // Ajoute un message d'erreur
      return; // Sort de la méthode
    }

    console.log('Demande de Stable Diffusion:', description); // Affiche la description dans la console

    this.openaiService.sendStableDiffusionRequest(description, this.selectedStableDiffusionModel).subscribe({ // Envoie la demande de Stable Diffusion à OpenAI
      next: (response) => { // En cas de succès
        console.log('Réponse de l\'API pour Stable Diffusion:', response); // Affiche la réponse dans la console

        const imageUrl = response.data[0].url; // Récupère l'URL de l'image
        console.log('URL de l\'image Stable Diffusion:', imageUrl); // Affiche l'URL de l'image dans la console

        const imageHtml = this.sanitizer.bypassSecurityTrustHtml(`<img src="${imageUrl}" alt="Generated Image" style="max-width:100%; height:auto;">`); // Crée une balise HTML pour l'image
        this.messages.push({ sender: 'PrideGPT', content: imageHtml as string }); // Ajoute l'image à la conversation
      },
      error: (err) => { // En cas d'erreur
        console.error('Error when calling Stable Diffusion API:', err); // Affiche l'erreur dans la console
        this.messages.push({ sender: 'PrideGPT', content: 'Erreur lors de la connexion à l\'API Stable Diffusion.' }); // Ajoute un message d'erreur
      }
    });
  }

  /**
   * Méthode pour traiter la commande de code
   * @param description 
   * @returns 
   */
  handleCodeCommand(description: string) {
    if (!description) { // Vérifie si la description est vide
      this.messages.push({ sender: 'System', content: "Veuillez fournir une description pour le code." }); // Ajoute un message d'erreur
      return; // Sort de la méthode
    }

    console.log('Demande de code:', description); // Affiche la description dans la console

    const prompt = `Please generate ${this.selectedLanguage} code for: ${description}`; // Prépare le prompt

    this.openaiService.sendMessage(prompt, this.selectedModel).subscribe({ // Envoie la demande de code à OpenAI
      next: (response) => { // En cas de succès
        console.log('Réponse de l\'API pour le code:', response); // Affiche la réponse dans la console

        const code = response.choices[0].message.content; // Récupère le code généré
        const codeHtml = this.sanitizer.bypassSecurityTrustHtml(`<pre><code>${code}</code></pre>`); // Crée une balise HTML pour le code
        this.messages.push({ sender: 'PrideGPT', content: codeHtml as string }); // Ajoute le code à la conversation
      },
      error: (err) => { // En cas d'erreur
        console.error('Error when calling OpenAI:', err); // Affiche l'erreur dans la console
        this.messages.push({ sender: 'PrideGPT', content: 'Erreur lors de la connexion à OpenAI.' }); // Ajoute un message d'erreur
      }
    });
  }

  /**
   * Méthode pour traiter la commande de traduction
   * @param description Description de la traduction 
   * @returns 
   */
  handleTranslateCommand(description: string) {
    const [targetLanguage, ...textToTranslate] = description.split(' '); // Découpe la description en langue cible et texte à traduire
    const text = textToTranslate.join(' '); // Concatène le texte à traduire

    if (!text) { // Vérifie si le texte est vide
      this.messages.push({ sender: 'System', content: "Veuillez fournir du texte à traduire." }); // Ajoute un message d'erreur
      return; // Sort de la méthode
    }

    if (!targetLanguage) { // Vérifie si la langue cible est vide
      this.messages.push({ sender: 'System', content: "Veuillez fournir une langue cible pour la traduction." }); // Ajoute un message d'erreur
      return;
    }

    console.log('Demande de traduction:', text); // Affiche le texte à traduire dans la console

    const prompt = `Please translate the following text to ${targetLanguage}: ${text}`; // Prépare le prompt

    this.openaiService.sendMessage(prompt, this.selectedModel).subscribe({ // Envoie la demande de traduction à OpenAI
      next: (response) => { // En cas de succès
        console.log('Réponse de l\'API pour la traduction:', response); // Affiche la réponse dans la console

        const translation = response.choices[0].message.content; // Récupère la traduction
        this.messages.push({ sender: 'PrideGPT', content: translation }); // Ajoute la traduction à la conversation
      },
      error: (err) => { // En cas d'erreur
        console.error('Error when calling OpenAI:', err); // Affiche l'erreur dans la console
        this.messages.push({ sender: 'PrideGPT', content: 'Erreur lors de la connexion à OpenAI.' }); // Ajoute un message d'erreur
      }
    });
  }

  /**
   * Méthode pour traiter la commande de transcription
   */
  handleTranscriptionCommand() {
    if (!this.selectedFile) { // Vérifie si aucun fichier n'est sélectionné
      this.messages.push({ sender: 'System', content: "Veuillez sélectionner un fichier audio à transcrire." }); // Ajoute un message d'erreur
      return; // Sort de la méthode
    }

    this.messages.push({ sender: 'User', content: `/transcribe` }); // Ajoute la commande à la conversation

    this.openaiService.sendTranscriptionRequest(this.selectedFile).subscribe({ // Envoie la demande de transcription à OpenAI
      next: (response) => { // En cas de succès 
        const transcription = response.text; // Récupère la transcription
        this.messages.push({ sender: 'PrideGPT', content: transcription }); // Ajoute la transcription à la conversation
      },
      error: (err) => { // En cas d'erreur
        console.error('Error when calling OpenAI:', err); // Affiche l'erreur dans la console
        this.messages.push({ sender: 'PrideGPT', content: 'Erreur lors de la connexion à OpenAI.' }); // Ajoute un message d'erreur
      }
    });
  }

  /**
   * Méthode pour sélectionner un fichier audio
   * @param event Événement de sélection de fichier
   */
  onFileSelected(event: any) {
    const file: File = event.target.files[0]; // Récupère le fichier sélectionné
    if (file) { // Vérifie si un fichier est sélectionné
      this.selectedFile = file; // Met à jour le fichier sélectionné
    }
  }

  /**
   * Méthode pour supprimer un message
   * @param index Index du message à supprimer
   */
  toggleRecording() {
    console.log("Etat du record : ", this.isRecording); // Affiche l'état du record dans la console
    if (this.isRecording) { // Vérifie si l'enregistrement est en cours
      this.stopRecording(); // Arrête l'enregistrement
    } else { // Sinon
      this.startRecording(); // Démarre l'enregistrement
    }
  }

  /**
   * Méthode pour démarrer l'enregistrement audio
   */
  startRecording() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) { // Vérifie si les périphériques multimédias sont pris en charge
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => { // Demande l'accès à l'enregistrement audio
        this.mediaRecorder = new MediaRecorder(stream); // Crée un nouvel enregistreur audio
        this.audioChunks = []; // Réinitialise les morceaux audio
        this.mediaRecorder.ondataavailable = (event) => { // En cas de données disponibles
          this.audioChunks.push(event.data); // Ajoute les données audio aux morceaux
        };
        this.mediaRecorder.start(); // Démarre l'enregistrement
        this.isRecording = true; // Met à jour l'état de l'enregistrement
        console.log("Recording started."); // Affiche un message dans la console
      }).catch(error => { // En cas d'erreur
        console.error('Error accessing media devices.', error); // Affiche l'erreur dans la console
      });
    } else {
      console.error('Media devices are not supported by this browser.'); // Affiche un message d'erreur dans la console
    }
  }

  /**
   * Méthode pour arrêter l'enregistrement audio
   */
  stopRecording() {
    if (this.mediaRecorder) { // Vérifie si l'enregistreur audio existe
      this.mediaRecorder.onstop = async () => { // En cas d'arrêt de l'enregistrement
        console.log("Recording stopped, processing audio."); // Affiche un message dans la console
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/mp3' }); // Crée un blob audio à partir des morceaux
        await this.handleAudioBlob(audioBlob);  // Traite le blob audio
        this.isRecording = false;  // Met à jour l'état de l'enregistrement
        console.log("Processing complete, isRecording set to false."); // Affiche un message dans la console
        this.cdr.detectChanges();  // Force la mise à jour de l'interface utilisateur
      };
      this.mediaRecorder.stop(); // Arrête l'enregistrement
      console.log("Stopping recording..."); // Affiche un message dans la console
    }
  }

  /**
   * Méthode pour traiter un blob audio
   * @param audioBlob Blob audio à traiter
   */
  async handleAudioBlob(audioBlob: Blob) {
    const formData = new FormData(); // Crée un formulaire de données
    formData.append('file', audioBlob, 'audio.mp3'); // Ajoute le blob audio au formulaire
    formData.append('model', 'whisper-1'); // Ajoute le modèle de transcription au formulaire
  
    try {
      const transcribeResponse = await this.openaiService.transcribeAudio(formData).toPromise(); // Transcrit le fichier audio
      const transcript = transcribeResponse.text; // Récupère la transcription
      console.log("Transcription received:", transcript); // Affiche la transcription dans la console
      this.messages.push({ sender: 'User', content: transcript }); // Ajoute la transcription à la conversation

      const textResponse = await this.openaiService.sendMessage(transcript, this.selectedModel).toPromise(); // Envoie la transcription à OpenAI
      const text = textResponse.choices[0].message.content; // Récupère la réponse du bot
      console.log("Bot text response received:", text); // Affiche la réponse du bot dans la console
  
      if (this.selectedResponseMode === 'speech') { // Vérifie si le mode de réponse est vocal
        this.sendSpeechResponse(text); // Envoie une réponse vocale
      } else {
        this.messages.push({ sender: 'PrideGPT', content: text }); // Ajoute la réponse du bot à la conversation
        this.cdr.detectChanges(); // Force la mise à jour de l'interface utilisateur
      }
    } catch (err) { // En cas d'erreur
      console.error('Error when calling OpenAI:', err); // Affiche l'erreur dans la console
      this.messages.push({ sender: 'PrideGPT', content: 'Erreur lors de la connexion à OpenAI.' }); // Ajoute un message d'erreur
      this.cdr.detectChanges(); // Force la mise à jour de l'interface utilisateur
    }
  }
  
  /**
   * Méthode pour envoyer une réponse vocale
   * @param text Texte à convertir en parole
   */
  sendSpeechResponse(text: string) {
    this.openaiService.sendSpeechRequest(text, 'tts-1', this.selectedVoice, 'mp3', 1.0).subscribe({ // Envoie la demande de parole à OpenAI
      next: (response) => { // En cas de succès
        const audioUrl = URL.createObjectURL(response); // Crée une URL pour l'audio
        console.log('Audio URL:', audioUrl);  // Affiche l'URL de l'audio dans la console
        const audioHtml = this.sanitizer.bypassSecurityTrustHtml(`<audio controls><source src="${audioUrl}" type="audio/mp3"></audio>`); // Crée une balise HTML pour l'audio
        this.messages.push({ sender: 'PrideGPT', content: audioHtml as string }); // Ajoute l'audio à la conversation
        this.cdr.detectChanges(); // Force la mise à jour de l'interface utilisateur
      },
      error: (err) => { // En cas d'erreur
        console.error('Error when calling OpenAI for speech:', err); // Affiche l'erreur dans la console
        this.messages.push({ sender: 'PrideGPT', content: 'Erreur lors de la connexion à OpenAI pour la réponse vocale.' }); // Ajoute un message d'erreur
        this.cdr.detectChanges(); // Force la mise à jour de l'interface utilisateur
      }
    });
  }
  
  triggerFileUpload() {
    this.fileInput.nativeElement.click();
  } 

  private typeWriterText(content: string, sender: string) {
    const message: Message = { sender: sender, content: '' };
    this.messages.push(message);
  
    let index = 0;
    const interval = setInterval(() => {
      if (index < content.length) {
        message.content += content.charAt(index);
        this.cdr.detectChanges();
        index++;
      } else {
        clearInterval(interval);
      }
    }, 10); // Vitesse de saisie (50ms par caractère)
  }
}
