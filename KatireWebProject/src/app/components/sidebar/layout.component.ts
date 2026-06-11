import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ProdutoService } from '../../services/produto.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <img src="/katire-logo.svg" alt="Katire" />
          <span>DA QUEBRADA PARA O BRASIL</span>
        </div>

        <nav>
          <a routerLink="/app/produtos" routerLinkActive="active">
            <span class="nav-icon">⌕</span><span class="nav-label">Explorar</span>
          </a>
          <a routerLink="/app/anunciar" routerLinkActive="active">
            <span class="nav-icon">＋</span><span class="nav-label">Anunciar</span>
          </a>
          <a routerLink="/app/propostas" routerLinkActive="active">
            <span class="nav-icon">⇄</span><span class="nav-label">Propostas</span>
          </a>
          <a routerLink="/app/favoritos" routerLinkActive="active">
            <span class="nav-icon">♡</span><span class="nav-label">Favoritos</span>
          </a>
          <a routerLink="/app/dashboard" routerLinkActive="active">
            <span class="nav-icon">▥</span><span class="nav-label">Dashboard</span>
          </a>
          <a routerLink="/app/perfil" routerLinkActive="active">
            <span class="nav-icon">○</span><span class="nav-label">Perfil</span>
          </a>
          <a routerLink="/pontos-seguros" routerLinkActive="active">
            <span class="nav-icon">⌖</span><span class="nav-label">Pontos seguros</span>
          </a>
        </nav>

        <div class="quick-actions">
          <a routerLink="/app/notificacoes" class="icon-btn" title="Notificações" aria-label="Notificações">
            <span>!</span>
            <span class="notification-count" *ngIf="notificacoesNaoLidas > 0">
              {{ notificacoesNaoLidas > 9 ? '9+' : notificacoesNaoLidas }}
            </span>
          </a>
          <button class="icon-btn" (click)="theme.alternar()" [title]="theme.escuro() ? 'Usar tema claro' : 'Usar tema escuro'">
            {{ theme.escuro() ? 'CL' : 'ES' }}
          </button>
        </div>

        <div class="sidebar-footer">
          <div class="user-info" *ngIf="auth.usuarioAtual() as usuario">
            <img *ngIf="usuario.avatar; else avatarIniciais" [src]="usuario.avatar" [alt]="usuario.nome" class="avatar" />
            <ng-template #avatarIniciais>
              <span class="avatar avatar-placeholder">{{ iniciais(usuario.nome) }}</span>
            </ng-template>
            <div class="user-details">
              <span class="user-name">{{ usuario.nome }}</span>
              <span class="user-city">{{ usuario.cidade || 'Sem cidade' }}</span>
            </div>
          </div>
          <button class="logout-btn" (click)="sair()">Sair da conta <span>→</span></button>
        </div>
      </aside>

      <main class="content">
        <header class="mobile-header">
          <img src="/katire-logo.svg" alt="Katire" />
          <div class="mobile-actions">
            <a routerLink="/app/notificacoes" aria-label="Notificações">!</a>
            <button (click)="theme.alternar()" aria-label="Alternar tema">{{ theme.escuro() ? 'CL' : 'ES' }}</button>
          </div>
        </header>
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .shell { display:flex; min-height:100vh; background:var(--background); }
    .sidebar {
      width:268px; background:var(--surface); border-right:1px solid var(--border);
      padding:1.5rem 1.15rem; position:sticky; top:0; height:100vh;
      display:flex; flex-direction:column; z-index:20;
      box-shadow:var(--shadow-sm);
    }
    .brand { padding:.2rem .55rem 1.5rem; border-bottom:1px solid var(--border); margin-bottom:1.2rem; }
    .brand img { display:block; width:158px; height:auto; padding:.3rem .45rem; border-radius:10px; background:#fff; }
    .brand>span { display:block; margin:.4rem 0 0 53px; color:var(--text-muted); font-size:.67rem; font-weight:700; letter-spacing:.04em; }
    nav { display:flex; flex-direction:column; gap:.38rem; flex:1; }
    nav a {
      position:relative; display:flex; align-items:center; gap:.8rem; padding:.68rem .75rem;
      border-radius:12px; color:var(--text-soft); text-decoration:none;
      font-size:.88rem; font-weight:650; transition:background .2s,color .2s,transform .2s;
    }
    nav a:hover { background:var(--surface-muted); transform:translateX(2px); }
    nav a.active { color:var(--accent); background:var(--accent-soft); font-weight:800; }
    nav a.active::before { content:""; position:absolute; left:-1.15rem; width:4px; height:24px; border-radius:0 4px 4px 0; background:var(--accent); }
    .nav-icon { width:32px; height:32px; display:grid; place-items:center; border:1px solid var(--border); border-radius:9px; background:var(--surface); color:var(--text); font-size:1.05rem; font-weight:900; }
    nav a.active .nav-icon { color:#fff; border-color:var(--accent); background:var(--accent); }
    .quick-actions { display:flex; gap:.55rem; padding:.9rem .5rem; border-top:1px solid var(--border); }
    .icon-btn {
      width:40px; height:40px; border:1px solid var(--border); border-radius:11px;
      background:var(--surface-muted); display:grid; place-items:center; cursor:pointer;
      text-decoration:none; position:relative; color:var(--text); font-size:.72rem; font-weight:900;
    }
    .notification-count {
      position:absolute; top:-6px; right:-6px; min-width:19px; height:19px; padding:0 4px;
      border-radius:10px; background:var(--accent); color:#fff; font-size:.62rem;
      display:grid; place-items:center; font-weight:800; border:2px solid var(--surface);
    }
    .sidebar-footer { border-top:1px solid var(--border); padding-top:.9rem; display:flex; flex-direction:column; gap:.65rem; }
    .user-info { display:flex; align-items:center; gap:.75rem; padding:.55rem; border-radius:12px; background:var(--surface-muted); }
    .avatar { width:40px; height:40px; border-radius:12px; border:0; flex-shrink:0; }
    .avatar-placeholder { display:grid; place-items:center; background:var(--surface-strong); color:#fff; font-size:.72rem; font-weight:900; }
    .user-details { display:flex; flex-direction:column; overflow:hidden; }
    .user-name { font-size:.82rem; font-weight:800; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .user-city { margin-top:.15rem; font-size:.7rem; color:var(--text-muted); }
    .logout-btn { width:100%; padding:.62rem .7rem; display:flex; justify-content:space-between; background:transparent; border:0; border-radius:9px; color:var(--text-muted); cursor:pointer; font-size:.76rem; font-weight:700; }
    .logout-btn:hover { background:#fef2f2; color:var(--danger); }
    .content { flex:1; min-width:0; overflow-y:auto; background:var(--background); }
    .mobile-header { display:none; }
    @media (max-width:760px) {
      .shell { display:block; padding-bottom:72px; }
      .sidebar {
        position:fixed; inset:auto 0 0 0; width:100%; height:72px; padding:.48rem .6rem;
        border-right:0; border-top:1px solid var(--border); flex-direction:row; align-items:center; box-shadow:0 -8px 24px rgba(0,0,0,.08);
      }
      .brand,.sidebar-footer { display:none; }
      nav { flex-direction:row; justify-content:flex-start; order:1; overflow-x:auto; scrollbar-width:none; }
      nav::-webkit-scrollbar { display:none; }
      nav a { flex:0 0 58px; flex-direction:column; gap:.12rem; padding:.28rem; font-size:.62rem; min-width:48px; }
      nav a.active::before { display:none; }
      .nav-icon { width:28px; height:28px; border:0; background:transparent; font-size:.95rem; }
      .quick-actions { display:none; }
      .mobile-header { height:64px; padding:.75rem 1rem; display:flex; align-items:center; justify-content:space-between; background:var(--surface); border-bottom:1px solid var(--border); position:sticky; top:0; z-index:10; }
      .mobile-header img { width:132px; padding:.2rem .35rem; border-radius:8px; background:#fff; }
      .mobile-actions { display:flex; gap:.4rem; }
      .mobile-actions a,.mobile-actions button { width:36px; height:36px; border:1px solid var(--border); border-radius:10px; display:grid; place-items:center; color:var(--text); background:var(--surface-muted); text-decoration:none; font-size:.7rem; font-weight:900; }
    }
  `]
})
export class LayoutComponent implements OnInit, OnDestroy {
  notificacoesNaoLidas = 0;
  private atualizador?: ReturnType<typeof setInterval>;

  constructor(
    public auth: AuthService,
    public theme: ThemeService,
    private service: ProdutoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.atualizarNotificacoes();
    this.atualizador = setInterval(() => this.atualizarNotificacoes(), 10000);
  }

  ngOnDestroy() {
    if (this.atualizador) clearInterval(this.atualizador);
  }

  atualizarNotificacoes() {
    this.service.getNotificacoes(this.auth.getId()).subscribe({
      next: notificacoes => this.notificacoesNaoLidas = notificacoes.filter(n => !n.lida).length,
      error: () => this.notificacoesNaoLidas = 0
    });
  }

  iniciais(nome: string) {
    return nome.split(/\s+/).slice(0, 2).map(parte => parte[0]).join('').toUpperCase();
  }

  sair() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
