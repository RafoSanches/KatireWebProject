import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'cadastro',
    loadComponent: () =>
      import('./pages/cadastro/cadastro.component').then(m => m.CadastroComponent),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/sidebar/layout.component').then(m => m.LayoutComponent),
    children: [
      { path: '', redirectTo: 'produtos', pathMatch: 'full' },
      {
        path: 'produtos',
        loadComponent: () =>
          import('./pages/listagem/listagem.component').then(m => m.ListagemComponent),
      },
      {
        path: 'produtos/:id',
        loadComponent: () =>
          import('./pages/detalhes/detalhes.component').then(m => m.DetalhesComponent),
      },
      {
        path: 'anunciar',
        loadComponent: () =>
          import('./pages/cadastro-produto/cadastro-produto.component').then(m => m.CadastroProdutoComponent),
      },
      {
        path: 'anunciar/:id',
        loadComponent: () =>
          import('./pages/cadastro-produto/cadastro-produto.component').then(m => m.CadastroProdutoComponent),
      },
      {
        path: 'propostas',
        loadComponent: () =>
          import('./pages/propostas/propostas.component').then(m => m.PropostasComponent),
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./pages/perfil/perfil.component').then(m => m.PerfilComponent),
      },
      {
        path: 'favoritos',
        loadComponent: () =>
          import('./pages/favoritos/favoritos.component').then(m => m.FavoritosComponent),
      },
      {
        path: 'notificacoes',
        loadComponent: () =>
          import('./pages/notificacoes/notificacoes.component').then(m => m.NotificacoesComponent),
      },
      {
        path: 'chat/:id',
        loadComponent: () =>
          import('./pages/chat/chat.component').then(m => m.ChatComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
