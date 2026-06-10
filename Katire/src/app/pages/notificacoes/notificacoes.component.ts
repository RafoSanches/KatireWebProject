import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProdutoService } from '../../services/produto.service';
import { Notificacao } from '../../models/produto.model';

@Component({
  selector: 'app-notificacoes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Notificações</h1>
          <p>Acompanhe propostas, mensagens e favoritos.</p>
        </div>
        <button *ngIf="naoLidas > 0" (click)="marcarTodas()">Marcar todas como lidas</button>
      </div>

      <div class="empty" *ngIf="notificacoes.length === 0">Você ainda não tem notificações.</div>
      <div class="lista">
        <button class="notificacao" *ngFor="let n of notificacoes"
          [class.nao-lida]="!n.lida" (click)="abrir(n)">
          <span class="icone">{{ icone(n.tipo) }}</span>
          <span class="conteudo">
            <strong>{{ n.titulo }}</strong>
            <span>{{ n.mensagem }}</span>
            <small>{{ n.criadaEm | date:'dd/MM/yyyy HH:mm' }}</small>
          </span>
          <span class="ponto" *ngIf="!n.lida"></span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .page { padding:2rem; max-width:850px; }
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; margin-bottom:1.5rem; }
    h1 { margin:0; color:#111827; font-size:1.75rem; }
    p { margin:.25rem 0 0; color:#6b7280; }
    .page-header button { border:1px solid #fed7aa; background:#fff7ed; color:#c2410c; border-radius:9px; padding:.6rem .9rem; cursor:pointer; font-weight:700; }
    .lista { display:flex; flex-direction:column; gap:.65rem; }
    .notificacao { width:100%; border:1px solid #f3f4f6; background:#fff; border-radius:12px; padding:1rem; display:flex; align-items:center; gap:1rem; text-align:left; cursor:pointer; }
    .notificacao.nao-lida { background:#fff7ed; border-color:#fed7aa; }
    .icone { width:42px; height:42px; border-radius:50%; display:grid; place-items:center; background:#f3f4f6; font-size:1.2rem; }
    .conteudo { flex:1; display:flex; flex-direction:column; gap:.2rem; }
    .conteudo strong { color:#111827; }
    .conteudo span { color:#6b7280; font-size:.9rem; }
    .conteudo small { color:#9ca3af; }
    .ponto { width:9px; height:9px; border-radius:50%; background:#f97316; }
    .empty { padding:3rem; text-align:center; color:#9ca3af; background:#fff; border-radius:12px; }
    @media (max-width:640px) { .page { padding:1rem; } .page-header { flex-direction:column; } }
  `]
})
export class NotificacoesComponent implements OnInit {
  notificacoes: Notificacao[] = [];
  get naoLidas() { return this.notificacoes.filter(n => !n.lida).length; }

  constructor(
    private service: ProdutoService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.service.getNotificacoes(this.auth.getId()).subscribe(n => this.notificacoes = n);
  }

  icone(tipo: Notificacao['tipo']) {
    return { proposta: '📬', status: '✅', favorito: '❤️', mensagem: '💬' }[tipo];
  }

  abrir(notificacao: Notificacao) {
    const navegar = () => notificacao.link && this.router.navigateByUrl(notificacao.link);
    if (notificacao.lida) {
      navegar();
      return;
    }
    this.service.marcarNotificacaoLida(notificacao.id!).subscribe(() => {
      notificacao.lida = true;
      navegar();
    });
  }

  marcarTodas() {
    this.notificacoes.filter(n => !n.lida).forEach(n => {
      this.service.marcarNotificacaoLida(n.id!).subscribe(() => n.lida = true);
    });
  }
}
