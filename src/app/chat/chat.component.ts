import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { OpenaiService } from '../services/openai.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface Message {
  sender: string;
  content: string | SafeHtml;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    OpenaiService,
    HttpClient
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})

export class ChatComponent {
  messages: Message[] = [{ sender: 'MiageGPT', content: 'Bienvenue sur MiageGPT!' }];
  userInput = '';
  selectedModel = 'gpt-3.5-turbo';
  selectedDalleModel = 'dall-e-2';
  selectedVoice = 'alloy';
  selectedStableDiffusionModel = 'stable-diffusion-v1';
  selectedLanguage = 'python';

  constructor(private openaiService: OpenaiService, private sanitizer: DomSanitizer) { }

  sendMessage() {
    const trimmedInput = this.userInput.trim();
    this.userInput = '';
    if (!trimmedInput) return;

    if (trimmedInput.startsWith('/')) {
      this.handleCommand(trimmedInput);
    } else {
      this.sendTextMessage(trimmedInput);
    }
  }

  sendTextMessage(text: string) {
    this.messages.push({ sender: 'User', content: text });
    this.openaiService.sendMessage(text, this.selectedModel).subscribe({
      next: (response) => {
        const botResponse = response.choices[0].message.content;
        this.messages.push({ sender: 'MiageGPT', content: botResponse });
      },
      error: (err) => {
        console.error('Error when calling OpenAI:', err);
        this.messages.push({ sender: 'MiageGPT', content: 'Erreur lors de la connexion à OpenAI.' });
      }
    });
  }

  handleCommand(command: string) {
    const [commandKey, ...args] = command.split(' ');
    const description = args.join(' ');

    this.messages.push({ sender: 'User', content: command });

    switch (commandKey) {
      case '/image':
        const text = "Génère l'image : " + description;
        this.messages.push({ sender: 'User', content: text });
        this.handleImageCommand(description);
        break;
      case '/speech':
        this.handleSpeechCommand(description);
        break;
      case '/stable-diffusion':
        this.handleStableDiffusionCommand(description);
        break;
      case '/code':
        this.handleCodeCommand(description);
        break;
      case '/translate':
        this.handleTranslateCommand(description);
        break;
      case '/weather':
        this.handleWeatherCommand(description);
        break;
      case '/define':
        this.handleDefineCommand(description);
        break;
      case '/news':
        this.handleNewsCommand(description);
        break;
      case '/math':
        this.handleMathCommand(description);
        break;
      default:
        this.messages.push({ sender: 'System', content: "Commande inconnue. Essayez de nouveau!" });
    }
  }

  handleImageCommand(description: string) {
    if (!description) {
      this.messages.push({ sender: 'System', content: "Veuillez fournir une description pour l'image." });
      return;
    }

    console.log('Demande d\'image:', description);

    this.openaiService.sendImageRequest(description, this.selectedDalleModel).subscribe({
      next: (response) => {
        console.log('Réponse de l\'API pour l\'image:', response);

        const imageUrl = response.data[0].url;
        console.log('URL de l\'image:', imageUrl);

        const imageHtml = this.sanitizer.bypassSecurityTrustHtml(`<img src="${imageUrl}" alt="Generated Image" style="max-width:100%; height:auto;">`);
        this.messages.push({ sender: 'MiageGPT', content: imageHtml as string });
      },
      error: (err) => {
        console.error('Error when calling OpenAI:', err);
        this.messages.push({ sender: 'MiageGPT', content: 'Erreur lors de la connexion à OpenAI.' });
      }
    });
  }

  handleSpeechCommand(text: string) {
    if (!text) {
      this.messages.push({ sender: 'System', content: "Veuillez fournir du texte à convertir en parole." });
      return;
    }

    this.messages.push({ sender: 'User', content: `/speech ${text}` });

    this.openaiService.sendSpeechRequest(text, 'tts-1', this.selectedVoice, 'mp3', 1.0).subscribe({
      next: (response) => {
        const audioUrl = URL.createObjectURL(response);
        console.log('URL de l\'audio:', audioUrl);

        const audioHtml = this.sanitizer.bypassSecurityTrustHtml(`<audio controls><source src="${audioUrl}" type="audio/mp3"></audio>`);
        this.messages.push({ sender: 'MiageGPT', content: audioHtml as string });
      },
      error: (err) => {
        console.error('Error when calling OpenAI:', err);
        this.messages.push({ sender: 'MiageGPT', content: 'Erreur lors de la connexion à OpenAI.' });
      }
    });
  }

  handleStableDiffusionCommand(description: string) {
    if (!description) {
      this.messages.push({ sender: 'System', content: "Veuillez fournir une description pour l'image." });
      return;
    }

    console.log('Demande de Stable Diffusion:', description);

    this.openaiService.sendStableDiffusionRequest(description, this.selectedStableDiffusionModel).subscribe({
      next: (response) => {
        console.log('Réponse de l\'API pour Stable Diffusion:', response);

        const imageUrl = response.data[0].url;
        console.log('URL de l\'image Stable Diffusion:', imageUrl);

        const imageHtml = this.sanitizer.bypassSecurityTrustHtml(`<img src="${imageUrl}" alt="Generated Image" style="max-width:100%; height:auto;">`);
        this.messages.push({ sender: 'MiageGPT', content: imageHtml as string });
      },
      error: (err) => {
        console.error('Error when calling Stable Diffusion API:', err);
        this.messages.push({ sender: 'MiageGPT', content: 'Erreur lors de la connexion à l\'API Stable Diffusion.' });
      }
    });
  }

  handleCodeCommand(description: string) {
    if (!description) {
      this.messages.push({ sender: 'System', content: "Veuillez fournir une description pour le code." });
      return;
    }

    console.log('Demande de code:', description);

    const prompt = `Please generate ${this.selectedLanguage} code for: ${description}`;

    this.openaiService.sendMessage(prompt, this.selectedModel).subscribe({
      next: (response) => {
        console.log('Réponse de l\'API pour le code:', response);

        const code = response.choices[0].message.content;
        const codeHtml = this.sanitizer.bypassSecurityTrustHtml(`<pre><code>${code}</code></pre>`);
        this.messages.push({ sender: 'MiageGPT', content: codeHtml as string });
      },
      error: (err) => {
        console.error('Error when calling OpenAI:', err);
        this.messages.push({ sender: 'MiageGPT', content: 'Erreur lors de la connexion à OpenAI.' });
      }
    });
  }

  handleTranslateCommand(text: string) {
    if (!text) {
      this.messages.push({ sender: 'System', content: "Veuillez fournir du texte à traduire." });
      return;
    }

    // Implémentation de la commande /translate (par exemple, en utilisant une API de traduction)
  }

  handleWeatherCommand(location: string) {
    if (!location) {
      this.messages.push({ sender: 'System', content: "Veuillez fournir une localisation pour obtenir les informations météorologiques." });
      return;
    }

    // Implémentation de la commande /weather (par exemple, en utilisant une API météorologique)
  }

  handleDefineCommand(word: string) {
    if (!word) {
      this.messages.push({ sender: 'System', content: "Veuillez fournir un mot à définir." });
      return;
    }

    // Implémentation de la commande /define (par exemple, en utilisant une API de dictionnaire)
  }

  handleNewsCommand(topic: string) {
    if (!topic) {
      this.messages.push({ sender: 'System', content: "Veuillez fournir un sujet pour obtenir les dernières nouvelles." });
      return;
    }

    // Implémentation de la commande /news (par exemple, en utilisant une API de nouvelles)
  }

  handleMathCommand(expression: string) {
    if (!expression) {
      this.messages.push({ sender: 'System', content: "Veuillez fournir une expression mathématique à calculer." });
      return;
    }

    // Implémentation de la commande /math (par exemple, en utilisant une API de calcul)
  }
}