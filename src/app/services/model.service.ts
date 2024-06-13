import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModelService {
  private modelSource = new BehaviorSubject<string>('gpt-3.5-turbo');
  currentModel = this.modelSource.asObservable();

  changeModel(model: string) {
    this.modelSource.next(model);
  }
}
