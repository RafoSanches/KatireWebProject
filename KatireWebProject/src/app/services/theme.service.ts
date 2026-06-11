import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'katire_tema';
  escuro = signal(localStorage.getItem(this.storageKey) === 'escuro');

  constructor() {
    this.aplicar();
  }

  alternar() {
    this.escuro.update(valor => !valor);
    localStorage.setItem(this.storageKey, this.escuro() ? 'escuro' : 'claro');
    this.aplicar();
  }

  private aplicar() {
    document.body.classList.toggle('dark-theme', this.escuro());
  }
}
