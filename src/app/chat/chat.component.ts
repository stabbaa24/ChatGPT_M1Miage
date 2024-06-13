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
    
    switch (commandKey) {
      case '/image':
        const text = "Génère l'image : " + description;
        this.messages.push({ sender: 'User', content: text });
        this.handleImageCommand(description);
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
}