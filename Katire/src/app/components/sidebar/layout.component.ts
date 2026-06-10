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
        <div class="logo">
          <span class="logo-icon">🔄</span>
          <span>Katire</span>
        </div>

        <nav>
          <a routerLink="/app/produtos" routerLinkActive="active">
            <span class="nav-icon">🛍️</span><span class="nav-label">Explorar</span>
          </a>
          <a routerLink="/app/anunciar" routerLinkActive="active">
            <span class="nav-icon">➕</span><span class="nav-label">Anunciar</span>
          </a>
          <a routerLink="/app/propostas" routerLinkActive="active">
            <span class="nav-icon">📬</span><span class="nav-label">Propostas</span>
          </a>
          <a routerLink="/app/favoritos" routerLinkActive="active">
            <span class="nav-icon">❤️</span><span class="nav-label">Favoritos</span>
          </a>
          <a routerLink="/app/dashboard" routerLinkActive="active">
            <span class="nav-icon">📊</span><span class="nav-label">Dashboard</span>
          </a>
          <a routerLink="/app/perfil" routerLinkActive="active">
            <span class="nav-icon">👤</span><span class="nav-label">Perfil</span>
          </a>
        </nav>

        <div class="quick-actions">
          <a routerLink="/app/notificacoes" class="icon-btn" title="Notificações">
            🔔
            <span class="notification-count" *ngIf="notificacoesNaoLidas > 0">
              {{ notificacoesNaoLidas > 9 ? '9+' : notificacoesNaoLidas }}
            </span>
          </a>
          <button class="icon-btn" (click)="theme.alternar()" [title]="theme.escuro() ? 'Usar tema claro' : 'Usar tema escuro'">
            {{ theme.escuro() ? '☀️' : '🌙' }}
          </button>
        </div>

        <div class="sidebar-footer">
          <div class="user-info" *ngIf="auth.usuarioAtual() as usuario">
            <img [src]="usuario.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'" [alt]="usuario.nome" class="avatar" />
            <div class="user-details">
              <span class="user-name">{{ usuario.nome }}</span>
              <span class="user-city">{{ usuario.cidade || 'Sem cidade' }}</span>
            </div>
          </div>
          <button class="logout-btn" (click)="sair()">↩ Sair</button>
        </div>
      </aside>

      <main class="content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .shell { display:flex; min-height:100vh; }
    .sidebar {
      width:240px; background:var(--surface); border-right:1px solid var(--border);
      padding:1.5rem 1rem; position:sticky; top:0; height:100vh;
      display:flex; flex-direction:column; z-index:20;
      box-shadow:2px 0 12px rgba(0,0,0,.04);
    }
    .logo { display:flex; align-items:center; gap:.5rem; font-size:1.5rem; font-weight:800; color:#f97316; padding:0 .5rem; margin-bottom:2rem; }
    .logo-icon { font-size:1.75rem; }
    nav { display:flex; flex-direction:column; gap:.25rem; flex:1; }
    nav a {
      display:flex; align-items:center; gap:.75rem; padding:.7rem .75rem;
      border-radius:10px; color:var(--text-soft); text-decoration:none;
      font-size:.95rem; font-weight:500; transition:background .15s,color .15s;
    }
    nav a:hover, nav a.active { background:var(--accent-soft); color:#f97316; }
    nav a.active { font-weight:700; }
    .nav-icon { font-size:1.1rem; }
    .quick-actions { display:flex; gap:.5rem; padding:.75rem .5rem; border-top:1px solid var(--border); }
    .icon-btn {
      width:40px; height:40px; border:1px solid var(--border); border-radius:10px;
      background:var(--surface-muted); display:grid; place-items:center; cursor:pointer;
      text-decoration:none; position:relative; font-size:1rem;
    }
    .notification-count {
      position:absolute; top:-5px; right:-5px; min-width:18px; height:18px; padding:0 4px;
      border-radius:10px; background:#ef4444; color:#fff; font-size:.65rem;
      display:grid; place-items:center; font-weight:800; border:2px solid var(--surface);
    }
    .sidebar-footer { border-top:1px solid var(--border); padding-top:1rem; display:flex; flex-direction:column; gap:.75rem; }
    .user-info { display:flex; align-items:center; gap:.75rem; padding:.5rem; }
    .avatar { width:38px; height:38px; border-radius:50%; border:2px solid #f97316; }
    .user-details { display:flex; flex-direction:column; overflow:hidden; }
    .user-name { font-size:.85rem; font-weight:700; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .user-city { font-size:.75rem; color:var(--text-muted); }
    .logout-btn { width:100%; padding:.6rem; background:transparent; border:1.5px solid var(--border); border-radius:8px; color:var(--text-muted); cursor:pointer; font-size:.85rem; }
    .logout-btn:hover { background:#fef2f2; border-color:#fca5a5; color:#dc2626; }
    .content { flex:1; min-width:0; overflow-y:auto; background:var(--background); }
    @media (max-width:760px) {
      .shell { display:block; padding-bottom:68px; }
      .sidebar {
        position:fixed; inset:auto 0 0 0; width:100%; height:68px; padding:.45rem .5rem;
        border-right:0; border-top:1px solid var(--border); flex-direction:row; align-items:center;
      }
      .logo,.sidebar-footer { display:none; }
      nav { flex-direction:row; justify-content:space-around; order:1; }
      nav a { flex-direction:column; gap:.1rem; padding:.35rem; font-size:.65rem; min-width:48px; }
      .nav-icon { font-size:1.05rem; }
      nav a:nth-child(5), nav a:nth-child(6) { display:none; }
      .quick-actions { order:2; border:0; padding:0; gap:.25rem; }
      .icon-btn { width:36px; height:36px; }
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

  sair() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
