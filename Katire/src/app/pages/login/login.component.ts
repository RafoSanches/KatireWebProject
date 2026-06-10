import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProdutoService } from '../../services/produto.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="brand">
          <span class="brand-icon">🔄</span>
          <h1>Katire</h1>
        </div>
        <p class="subtitle">Plataforma de permutas sustentáveis</p>

        <div *ngIf="erroServidor" class="msg-erro-global">{{ erroServidor }}</div>

        <form [formGroup]="form" (ngSubmit)="entrar()">

          <div class="field">
            <label for="email">E-mail</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="seu@email.com"
              [class.invalido]="campo('email').invalid && campo('email').touched"
            />
            <span class="erro-campo" *ngIf="campo('email').touched && campo('email').hasError('required')">
              E-mail é obrigatório.
            </span>
            <span class="erro-campo" *ngIf="campo('email').touched && campo('email').hasError('email')">
              Informe um e-mail válido.
            </span>
          </div>

          <div class="field">
            <label for="senha">Senha</label>
            <input
              id="senha"
              type="password"
              formControlName="senha"
              placeholder="••••••"
              [class.invalido]="campo('senha').invalid && campo('senha').touched"
            />
            <span class="erro-campo" *ngIf="campo('senha').touched && campo('senha').hasError('required')">
              Senha é obrigatória.
            </span>
            <span class="erro-campo" *ngIf="campo('senha').touched && campo('senha').hasError('minlength')">
              Mínimo de 6 caracteres.
            </span>
          </div>

          <button type="submit" [disabled]="carregando">
            {{ carregando ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <p class="link-text">Não tem conta? <a (click)="irParaCadastro()">Cadastre-se grátis</a></p>
        <div class="demo-hint"><small>Demo: ana&#64;email.com / 123456</small></div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { min-height:100vh; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#fff7ed 0%,#f0fdf4 100%); }
    .auth-card { background:#fff; padding:2.5rem; border-radius:16px; box-shadow:0 8px 32px rgba(0,0,0,.1); width:100%; max-width:400px; display:flex; flex-direction:column; gap:1rem; }
    .brand { display:flex; align-items:center; gap:.5rem; }
    .brand-icon { font-size:2rem; }
    h1 { color:#f97316; margin:0; font-size:2rem; font-weight:800; }
    .subtitle { color:#6b7280; margin:0; font-size:.95rem; }
    .field { display:flex; flex-direction:column; gap:.35rem; }
    label { font-size:.85rem; font-weight:600; color:#374151; }
    input { padding:.75rem 1rem; border:1.5px solid #e5e7eb; border-radius:10px; font-size:1rem; outline:none; transition:border-color .2s; }
    input:focus { border-color:#f97316; }
    input.invalido { border-color:#ef4444; background:#fef2f2; }
    .erro-campo { font-size:.78rem; color:#ef4444; }
    form { display:flex; flex-direction:column; gap:.75rem; }
    button { width:100%; padding:.8rem; background:#f97316; color:#fff; border:none; border-radius:10px; font-size:1rem; font-weight:700; cursor:pointer; transition:background .2s; margin-top:.25rem; }
    button:hover:not(:disabled) { background:#ea6009; }
    button:disabled { opacity:.6; cursor:not-allowed; }
    .link-text { text-align:center; color:#6b7280; font-size:.9rem; }
    .link-text a { color:#f97316; cursor:pointer; font-weight:600; }
    .msg-erro-global { background:#fef2f2; color:#dc2626; padding:.75rem; border-radius:8px; font-size:.9rem; }
    .demo-hint { text-align:center; color:#9ca3af; }
  `]
})
export class LoginComponent {
  form: FormGroup;
  carregando = false;
  erroServidor = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private produtoService: ProdutoService,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  campo(nome: string) { return this.form.get(nome)!; }

  entrar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.carregando = true; this.erroServidor = '';

    const { email, senha } = this.form.value;
    this.produtoService.loginPorEmail(email).subscribe({
      next: (usuarios) => {
        const usuario = usuarios.find(u => u.senha === senha);
        if (usuario) { this.authService.login(usuario); this.router.navigate(['/app/produtos']); }
        else { this.erroServidor = 'E-mail ou senha incorretos.'; }
        this.carregando = false;
      },
      error: () => { this.erroServidor = 'Erro ao conectar. Verifique se o json-server está rodando.'; this.carregando = false; }
    });
  }

  irParaCadastro() { this.router.navigate(['/cadastro']); }
}
