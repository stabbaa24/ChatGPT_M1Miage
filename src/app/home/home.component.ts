import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  openaiApiKey !: string;

  saveApiKey() {
    if (this.openaiApiKey) {
      localStorage.setItem('openaiApiKey', this.openaiApiKey);
      alert('Clé OpenAI enregistrée avec succès');
    } else {
      alert('Veuillez entrer une clé OpenAI valide');
    }
  }
}
