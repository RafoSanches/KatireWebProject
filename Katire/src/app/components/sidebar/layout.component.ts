import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <div class="logo">Katire</div>
        <nav>
          <a routerLink="/app/produtos" routerLinkActive="active">Produtos</a>
          <a routerLink="/app/anunciar" routerLinkActive="active">Anunciar</a>
          <a routerLink="/app/propostas" routerLinkActive="active">Propostas</a>
          <a routerLink="/app/dashboard" routerLinkActive="active">Dashboard</a>
          <a routerLink="/app/perfil" routerLinkActive="active">Perfil</a>
        </nav>
      </aside>
      <main class="content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .shell {
      display: flex;
      min-height: 100vh;
    }
    .sidebar {
      width: 220px;
      background: #fff;
      border-right: 1px solid #e5e7eb;
      padding: 1.5rem 1rem;
      position: sticky;
      top: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      gap: 2rem;
      box-shadow: 2px 0 8px rgba(0,0,0,0.04);
    }
    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      color: #f97316;
      padding: 0 0.5rem;
    }
    nav {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    nav a {
      display: block;
      padding: 0.65rem 0.75rem;
      border-radius: 10px;
      color: #374151;
      text-decoration: none;
      font-size: 0.95rem;
      transition: background 0.15s, color 0.15s;
    }
    nav a:hover { background: #fff7ed; color: #f97316; }
    nav a.active { background: #fff7ed; color: #f97316; font-weight: 600; }
    .content {
      flex: 1;
      overflow-y: auto;
      background: #f9fafb;
      padding: 2rem;
    }
  `]
})
export class LayoutComponent {}