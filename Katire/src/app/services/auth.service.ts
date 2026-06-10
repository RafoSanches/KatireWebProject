import { Injectable, signal } from '@angular/core';
import { Usuario } from '../models/produto.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'katire_usuario';

  usuarioAtual = signal<Usuario | null>(this.carregarUsuario());

  private carregarUsuario(): Usuario | null {
    const dados = localStorage.getItem(this.STORAGE_KEY);
    return dados ? JSON.parse(dados) : null;
  }

  login(usuario: Usuario) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usuario));
    this.usuarioAtual.set(usuario);
  }

  logout() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.usuarioAtual.set(null);
  }

  isLogado(): boolean {
    return !!this.usuarioAtual();
  }

  getId(): string {
    return this.usuarioAtual()?.id ?? '';
  }

  getUsuario(): Usuario | null {
    return this.usuarioAtual();
  }
}
