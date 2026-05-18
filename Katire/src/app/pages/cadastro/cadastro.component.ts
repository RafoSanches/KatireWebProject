import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>Katire</h1>
        <p>Crie sua conta</p>
        <form (ngSubmit)="cadastrar()">
          <input type="text" [(ngModel)]="nome" name="nome" placeholder="Nome completo" required />
          <input type="email" [(ngModel)]="email" name="email" placeholder="E-mail" required />
          <input type="password" [(ngModel)]="senha" name="senha" placeholder="Senha" required />
          <button type="submit">Criar conta</button>
        </form>
        <a (click)="irParaLogin()">Já tem conta? Entre</a>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #fff7ed 0%, #f0fdf4 100%);
    }
    .auth-card {
      background: #fff;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      width: 100%;
      max-width: 380px;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    h1 { color: #f97316; margin: 0; font-size: 2rem; }
    p { color: #6b7280; margin: 0; }
    input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1.5px solid #e5e7eb;
      border-radius: 10px;
      font-size: 1rem;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.2s;
    }
    input:focus { border-color: #f97316; }
    button {
      width: 100%;
      padding: 0.75rem;
      background: #f97316;
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover { background: #ea6009; }
    a { color: #f97316; cursor: pointer; text-align: center; font-size: 0.9rem; }
    form { display: flex; flex-direction: column; gap: 0.75rem; }
  `]
})
export class CadastroComponent {
  nome = '';
  email = '';
  senha = '';

  constructor(private router: Router) {}

  cadastrar() {
    this.router.navigate(['/app/produtos']);
  }

  irParaLogin() {
    this.router.navigate(['/login']);
  }
}