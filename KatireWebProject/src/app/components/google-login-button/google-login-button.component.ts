import { AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { GoogleAuthResult, GoogleAuthService } from '../../services/google-auth.service';

@Component({
  selector: 'app-google-login-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="google-area">
      <div #googleButton class="google-button" [class.hidden]="!configurado"></div>
      <button *ngIf="!configurado && !carregando" type="button" class="google-placeholder" (click)="mostrarAjuda()">
        <span class="google-mark">G</span>
        <span>Continuar com Google</span>
      </button>
      <p *ngIf="mensagem" [class.erro]="erro">{{ mensagem }}</p>
    </div>
  `,
  styles: [`
    .google-area { width:100%; display:grid; gap:.45rem; }
    .google-button { min-height:44px; display:grid; place-items:center; }
    .google-button.hidden { display:none; }
    .google-placeholder { width:100%; min-height:46px; padding:.65rem 1rem; display:flex; align-items:center; justify-content:center; gap:.75rem; border:1px solid #d4d4d8; border-radius:10px; color:#27272a; background:#fff; font-weight:750; cursor:pointer; }
    .google-placeholder:hover { background:#fafafa; border-color:#a1a1aa; }
    .google-mark { width:24px; height:24px; display:grid; place-items:center; color:#4285f4; font-size:1.1rem; font-weight:900; }
    p { margin:0; color:#71717a; font-size:.72rem; text-align:center; line-height:1.4; }
    p.erro { color:#dc2626; }
  `]
})
export class GoogleLoginButtonComponent implements AfterViewInit {
  @ViewChild('googleButton', { static: true }) googleButton!: ElementRef<HTMLDivElement>;
  @Output() autenticado = new EventEmitter<GoogleAuthResult>();

  configurado = false;
  carregando = true;
  mensagem = '';
  erro = false;

  constructor(private googleAuth: GoogleAuthService) {}

  async ngAfterViewInit() {
    try {
      const config = await firstValueFrom(this.googleAuth.getConfiguracao());
      this.configurado = config.configurado;
      if (!config.configurado) {
        this.mensagem = 'Login Google aguardando o Client ID da Katire.';
        this.carregando = false;
        return;
      }

      await this.googleAuth.carregarBiblioteca();
      const google = (window as any).google;
      google.accounts.id.initialize({
        client_id: config.clientId,
        callback: (resposta: { credential?: string }) => this.processar(resposta.credential),
        ux_mode: 'popup',
        use_fedcm_for_prompt: true
      });
      google.accounts.id.renderButton(this.googleButton.nativeElement, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: Math.min(this.googleButton.nativeElement.clientWidth || 400, 400),
        locale: 'pt-BR'
      });
      this.carregando = false;
    } catch {
      this.erro = true;
      this.mensagem = 'Não foi possível carregar o login Google.';
      this.carregando = false;
    }
  }

  mostrarAjuda() {
    this.erro = false;
    this.mensagem = 'Adicione o Client ID em google.config.json e reinicie o servidor.';
  }

  private processar(credential?: string) {
    if (!credential) {
      this.erro = true;
      this.mensagem = 'O Google não retornou uma credencial válida.';
      return;
    }

    this.carregando = true;
    this.mensagem = 'Validando sua conta Google...';
    this.googleAuth.autenticar(credential).subscribe({
      next: resultado => {
        this.carregando = false;
        this.mensagem = '';
        this.autenticado.emit({ ...resultado, credential });
      },
      error: erro => {
        this.carregando = false;
        this.erro = true;
        this.mensagem = erro.error?.erro ?? 'Não foi possível entrar com Google.';
      }
    });
  }
}
