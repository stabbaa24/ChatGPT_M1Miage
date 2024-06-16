import { Injectable } from '@angular/core';
import { Message } from '../chat/chat.component'; // Assurez-vous que le chemin est correct

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private history: Message[][] = [];

  constructor() { }

  addSession(messages: Message[]): void {
    this.history.push(messages);
  }

  getHistory(): Message[][] {
    return this.history;
  }
}