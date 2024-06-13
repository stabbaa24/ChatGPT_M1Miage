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
  private transcriptionAPIURL = 'https://api.openai.com/v1/audio/transcriptions';
  private translationAPIURL = 'https://api.openai.com/v1/audio/translations';

  /**
   * Constructeur du service OpenAI
   * @param http Client HTTP
   */
  constructor(private http: HttpClient) { }

  /**
   * Méthode pour envoyer un message à l'API OpenAI
   * @param prompt Le message à envoyer 
   * @param model Le modèle à utiliser
   * @returns  Observable<any> L'observable de la requête HTTP
   */
  sendMessage(prompt: string, model: string = "gpt-3.5-turbo"): Observable<any> {
    const headers = this.createHeaders(); // Création des headers
    const body = { // Création du corps de la requête
      model: model, // Modèle à utiliser
      messages: [{ role: "user", content: prompt }] // Message à envoyer
    };

    return this.http.post(this.textAPIURL, body, { headers }); // Envoi de la requête HTTP
  }

  /**
   * Méthode pour envoyer une requête d'image à l'API OpenAI
   * @param description Description de l'image à générer 
   * @param model Modèle à utiliser
   * @returns  Observable<any> L'observable de la requête HTTP
   */
  sendImageRequest(description: string, model: string = "dall-e-2"): Observable<any> {
    const headers = this.createHeaders(); // Création des headers
    const body = { // Création du corps de la requête
      prompt: description, // Description de l'image
      model: model, // Modèle à utiliser
      n: 1, // Nombre d'images à générer
      size: "1024x1024" // Taille de l'image
    };

    return this.http.post(this.imageAPIURL, body, { headers }); // Envoi de la requête HTTP
  }

  /**
   * Méthode pour envoyer une requête de synthèse vocale à l'API OpenAI
   * @param text   Texte à synthétiser
   * @param model  Modèle à utiliser
   * @param voice  Voix à utiliser
   * @param responseFormat  Format de la réponse
   * @param speed  Vitesse de la synthèse vocale
   * @returns 
   */
  sendSpeechRequest(text: string, model: string = "tts-1", voice: string = "alloy", responseFormat: string = "mp3", speed: number = 1.0): Observable<Blob> {
    const headers = this.createHeaders(); // Création des headers
    const body = { // Création du corps de la requête
      model: model, // Modèle à utiliser  
      input: text, // Texte à synthétiser
      voice: voice, // Voix à utiliser
      response_format: responseFormat, // Format de la réponse
      speed: speed // Vitesse de la synthèse vocale
    };

    return this.http.post(this.speechAPIURL, body, { headers, responseType: 'blob' }); // Envoi de la requête HTTP
  }

  /**
   * Méthode pour envoyer une requête de traduction à l'API OpenAI
   * @param description  Description à traduire
   * @param model  Modèle à utiliser
   * @returns  Observable<any> L'observable de la requête HTTP
   */
  sendStableDiffusionRequest(description: string, model: string = "stable-diffusion-v1"): Observable<any> {
    const headers = this.createHeaders(); // Création des headers
    const body = { // Création du corps de la requête
      prompt: description, // Description à traduire
      model: model, // Modèle à utiliser
      n: 1, // Nombre de traductions à générer
      size: "1024x1024" // Taille de l'image
    };

    return this.http.post(this.stableDiffusionAPIURL, body, { headers }); // Envoi de la requête HTTP
  }

  /**
   * Méthode pour envoyer une requête de traduction à l'API OpenAI
   * @param file  Fichier audio à transcrire
   * @param model  Modèle à utiliser
   * @param language  Langue du fichier audio
   * @param responseFormat  Format de la réponse
   * @param temperature  Température de la transcription
   * @returns  Observable<any> L'observable de la requête HTTP
   */
  sendTranscriptionRequest(file: File, model: string = "whisper-1", language?: string, responseFormat: string = "json", temperature: number = 0): Observable<any> {
    const headers = this.createHeaders(); // Création des headers
    const formData: FormData = new FormData(); // Création du formulaire
    formData.append('file', file); // Ajout du fichier audio
    formData.append('model', model); // Modèle à utiliser
    if (language) formData.append('language', language); // Langue du fichier audio
    formData.append('response_format', responseFormat); // Format de la réponse
    formData.append('temperature', temperature.toString()); // Température de la transcription

    return this.http.post(this.transcriptionAPIURL, formData, { headers: headers.delete('Content-Type') }); // Envoi de la requête HTTP
  }

  /**
   * Méthode pour envoyer une requête de traduction à l'API OpenAI
   * @param formData  Formulaire contenant le fichier audio à transcrire
   * @returns  Observable<any> L'observable de la requête HTTP
   */
  transcribeAudio(formData: FormData): Observable<any> {
    const headers = new HttpHeaders({ // Création des headers
      'Authorization': `Bearer ${environment.openaiApiKey}` // Clé d'API OpenAI
    });

    return this.http.post(this.transcriptionAPIURL, formData, { headers }); // Envoi de la requête HTTP
  }

  /**
   * Méthode pour envoyer une requête de traduction à l'API OpenAI
   * @param description  Description à traduire
   * @param model  Modèle à utiliser
   * @returns  Observable<any> L'observable de la requête HTTP
   */
  private createHeaders(): HttpHeaders {
    return new HttpHeaders({ // Création des headers
      'Content-Type': 'application/json', // Type de contenu
      'Authorization': `Bearer ${environment.openaiApiKey}` // Clé d'API OpenAI
    });
  }
}