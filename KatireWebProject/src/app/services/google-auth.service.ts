import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/produto.model';

export interface GoogleProfile {
  googleId: string;
  nome: string;
  email: string;
  avatar: string;
}

export interface GoogleAuthResult {
  credential: string;
  usuario?: Usuario;
  precisaCadastro: boolean;
  perfil?: GoogleProfile;
}

export interface GoogleRegistrationData {
  dataNascimento: string;
  cep: string;
  endereco: string;
  bairro: string;
  numero: string;
  complemento?: string;
  cidade: string;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  private readonly api = 'http://localhost:3000';
  private scriptPromise?: Promise<void>;
  private cadastroPendente: GoogleAuthResult | null = null;

  constructor(private http: HttpClient) {}

  getConfiguracao(): Observable<{ clientId: string; configurado: boolean }> {
    return this.http.get<{ clientId: string; configurado: boolean }>(`${this.api}/config/google`);
  }

  autenticar(credential: string): Observable<Omit<GoogleAuthResult, 'credential'>> {
    return this.http.post<Omit<GoogleAuthResult, 'credential'>>(`${this.api}/auth/google`, { credential });
  }

  cadastrar(credential: string, dados: GoogleRegistrationData): Observable<{ usuario: Usuario }> {
    return this.http.post<{ usuario: Usuario }>(`${this.api}/auth/google/cadastro`, { credential, dados });
  }

  prepararCadastro(resultado: GoogleAuthResult) {
    this.cadastroPendente = resultado;
  }

  consumirCadastroPendente(): GoogleAuthResult | null {
    const resultado = this.cadastroPendente;
    this.cadastroPendente = null;
    return resultado;
  }

  carregarBiblioteca(): Promise<void> {
    const google = (window as any).google;
    if (google?.accounts?.id) return Promise.resolve();
    if (this.scriptPromise) return this.scriptPromise;

    this.scriptPromise = new Promise((resolve, reject) => {
      const existente = document.querySelector<HTMLScriptElement>('script[data-katire-google]');
      if (existente) {
        existente.addEventListener('load', () => resolve(), { once: true });
        existente.addEventListener('error', () => reject(new Error('Falha ao carregar o Google.')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client?hl=pt-BR';
      script.async = true;
      script.defer = true;
      script.dataset['katireGoogle'] = 'true';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Falha ao carregar o Google.'));
      document.head.appendChild(script);
    });

    return this.scriptPromise;
  }
}
