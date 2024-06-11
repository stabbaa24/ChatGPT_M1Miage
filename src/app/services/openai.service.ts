import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class OpenaiService {
  private apiURL = 'https://api.openai.com/v1/chat/completions';

  constructor(private http: HttpClient) { }

  sendMessage(prompt: string, model: string = "gpt-3.5-turbo"): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${environment.openaiApiKey}`
    });

    const body = {
      model: model,
      messages: [{ role: "user", content: prompt }]
    };

    console.log('Sending request to OpenAI:', body);

    return this.http.post(this.apiURL, body, { headers });
  }
}