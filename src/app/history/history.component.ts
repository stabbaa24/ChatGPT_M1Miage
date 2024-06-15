import { Component, OnInit } from '@angular/core';
import { HistoryService } from '../services/history.service'; // Assurez-vous que le chemin est correct
import { Message } from '../chat/chat.component'; 
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent {

  history: Message[][] = [];

  constructor(private HistoryService: HistoryService) { }

  ngOnInit(): void {
    this.history = this.HistoryService.getHistory();
  }

}
