import { Injectable, signal } from '@angular/core';
import { Usuario } from '../models/produto.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'katire_usuario';

  usuarioAtual = signal<Usuario | null>(this.carregarUsuario());

  private carregarUsuario(): Usuario | null {
    const dados = localStorage.getItem(this.STORAGE_KEY);
    if (!dados) return null;
    const usuario = JSON.parse(dados) as Usuario;
    return { ...usuario, avatar: this.avatarLocal(usuario.avatar) };
  }

  login(usuario: Usuario) {
    const usuarioLimpo = { ...usuario, avatar: this.avatarLocal(usuario.avatar) };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usuarioLimpo));
    this.usuarioAtual.set(usuarioLimpo);
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

  private avatarLocal(avatar?: string) {
    if (avatar?.startsWith('data:image/')) return avatar;
    if (avatar?.startsWith('https://lh3.googleusercontent.com/')) return avatar;
    return '';
  }
}
