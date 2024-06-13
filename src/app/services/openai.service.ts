import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})

export class OpenaiService {
  private textAPIURL = 'https://api.openai.com/v1/chat/completions';
  private imageAPIURL = 'https://api.openai.com/v1/images/generations';
  private speechAPIURL = 'https://api.openai.com/v1/audio/speech';
  private stableDiffusionAPIURL = 'https://api.openai.com/v1/stable-diffusion/generate';

  constructor(private http: HttpClient) { }

  sendMessage(prompt: string, model: string = "gpt-3.5-turbo"): Observable<any> {
    const headers = this.createHeaders();
    const body = {
      model: model,
      messages: [{ role: "user", content: prompt }]
    };

    return this.http.post(this.textAPIURL, body, { headers });
  }

  sendImageRequest(description: string, model: string = "dall-e-2"): Observable<any> {
    const headers = this.createHeaders();
    const body = {
      prompt: description,
      model: model,
      n: 1,
      size: "1024x1024"
    };

    return this.http.post(this.imageAPIURL, body, { headers });
  }

  sendSpeechRequest(text: string, model: string = "tts-1", voice: string = "alloy", responseFormat: string = "mp3", speed: number = 1.0): Observable<Blob> {
    const headers = this.createHeaders();
    const body = {
      model: model,
      input: text,
      voice: voice,
      response_format: responseFormat,
      speed: speed
    };

    return this.http.post(this.speechAPIURL, body, { headers, responseType: 'blob' });
  }

  sendStableDiffusionRequest(description: string, model: string = "stable-diffusion-v1"): Observable<any> {
    const headers = this.createHeaders();
    const body = {
      prompt: description,
      model: model,
      n: 1,
      size: "1024x1024"
    };

    return this.http.post(this.stableDiffusionAPIURL, body, { headers });
  }
  
  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${environment.openaiApiKey}`
    });
  }
}