import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { OpenaiService } from '../services/openai.service';
import { environment } from '../environment/environment';
import { ModelService } from '../services/model.service';

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
    ModelService,
    HttpClient
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  messages = [{ sender: 'MiageGPT', content: 'Bienvenue sur MiageGPT!' }];
  userInput = '';
  selectedModel = 'gpt-3.5-turbo';

  constructor(private openaiService: OpenaiService, private modelService: ModelService) { }

  ngOnInit() {
    this.modelService.currentModel.subscribe(model => this.selectedModel = model);
  }

  sendMessage() {
    const trimmedInput = this.userInput.trim();
    if (trimmedInput) {
      this.messages.push({ sender: 'User', content: trimmedInput });

      this.openaiService.sendMessage(trimmedInput, this.selectedModel).subscribe({
        next: (response) => {
          console.log('Response from OpenAI:', response);
          const botResponse = response.choices[0].message.content;
          this.messages.push({ sender: 'MiageGPT', content: botResponse });
        },
        error: (err) => {
          console.error('Error when calling OpenAI:', err);
          this.messages.push({ sender: 'MiageGPT', content: 'Erreur lors de la connexion à OpenAI.' });
        }
      });
      this.userInput = '';
    }
  }
}