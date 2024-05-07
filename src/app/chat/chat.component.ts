import { Component,  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  messages = [
    { sender: 'MiageGPT', content: 'Bienvenue sur MiageGPT!' }
  ];
  userInput = '';

  sendMessage() {
    if (this.userInput.trim()) {
      this.messages.push({ sender: 'User', content: this.userInput.trim() });
      this.userInput = '';
      this.respond();
    }
  }

  respond() {
    // Simule une réponse automatique du bot (vous pouvez remplacer cette logique par un appel API)
    this.messages.push({ sender: 'MiageGPT', content: 'Ceci est une réponse automatique.' });
  }
}