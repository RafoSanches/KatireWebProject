import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProdutoService } from '../../services/produto.service';
import { AuthService } from '../../services/auth.service';

/** Validator customizado: confirma que senhas são iguais */
function senhasIguaisValidator(control: AbstractControl): ValidationErrors | null {
  const senha = control.get('senha');
  const confirmar = control.get('confirmarSenha');
  if (senha && confirmar && senha.value !== confirmar.value) {
    confirmar.setErrors({ senhasDiferentes: true });
    return { senhasDiferentes: true };
  }
  if (confirmar?.hasError('senhasDiferentes')) {
    confirmar.setErrors(null);
  }
  return null;
}

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="brand"><span class="brand-icon">🔄</span><h1>Katire</h1></div>
        <p class="subtitle">Crie sua conta gratuita</p>

        <div *ngIf="erroServidor" class="msg-erro-global">{{ erroServidor }}</div>

        <form [formGroup]="form" (ngSubmit)="cadastrar()">

          <div class="field">
            <label>Nome completo *</label>
            <input type="text" formControlName="nome" placeholder="Seu nome completo"
              [class.invalido]="c('nome').invalid && c('nome').touched" />
            <span class="erro-campo" *ngIf="c('nome').touched && c('nome').hasError('required')">Nome é obrigatório.</span>
            <span class="erro-campo" *ngIf="c('nome').touched && c('nome').hasError('minlength')">Mínimo de 3 caracteres.</span>
          </div>

          <div class="field">
            <label>E-mail *</label>
            <input type="email" formControlName="email" placeholder="seu@email.com"
              [class.invalido]="c('email').invalid && c('email').touched" />
            <span class="erro-campo" *ngIf="c('email').touched && c('email').hasError('required')">E-mail é obrigatório.</span>
            <span class="erro-campo" *ngIf="c('email').touched && c('email').hasError('email')">Informe um e-mail válido.</span>
          </div>

          <div class="row">
            <div class="field">
              <label>Cidade</label>
              <input type="text" formControlName="cidade" placeholder="Cidade" />
            </div>
            <div class="field" style="max-width:90px">
              <label>Estado</label>
              <input type="text" formControlName="estado" placeholder="UF"
                [class.invalido]="c('estado').invalid && c('estado').touched" />
              <span class="erro-campo" *ngIf="c('estado').touched && c('estado').hasError('pattern')">Use 2 letras.</span>
            </div>
          </div>

          <div class="field">
            <label>Senha *</label>
            <input type="password" formControlName="senha" placeholder="8 caracteres, maiúscula e número"
              [class.invalido]="c('senha').invalid && c('senha').touched" />
            <span class="erro-campo" *ngIf="c('senha').touched && c('senha').hasError('required')">Senha é obrigatória.</span>
            <span class="erro-campo" *ngIf="c('senha').touched && (c('senha').hasError('minlength') || c('senha').hasError('pattern'))">
              Use 8 caracteres, com letra maiúscula, minúscula e número.
            </span>
          </div>

          <div class="field">
            <label>Confirmar senha *</label>
            <input type="password" formControlName="confirmarSenha" placeholder="Repita a senha"
              [class.invalido]="c('confirmarSenha').invalid && c('confirmarSenha').touched" />
            <span class="erro-campo" *ngIf="c('confirmarSenha').touched && c('confirmarSenha').hasError('required')">Confirmação é obrigatória.</span>
            <span class="erro-campo" *ngIf="c('confirmarSenha').touched && c('confirmarSenha').hasError('senhasDiferentes')">As senhas não coincidem.</span>
          </div>

          <!-- Indicador de força da senha -->
          <div class="forca-senha" *ngIf="c('senha').value">
            <div class="barra">
              <div class="forca-fill" [style.width]="forcaSenhaPct + '%'" [class]="forcaSenhaClasse"></div>
            </div>
            <span>Senha: {{ forcaSenhaTexto }}</span>
          </div>

          <button type="submit" [disabled]="carregando">
            {{ carregando ? 'Criando conta...' : 'Criar conta' }}
          </button>
        </form>

        <p class="link-text">Já tem conta? <a (click)="irParaLogin()">Entrar</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { min-height:100vh; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#fff7ed 0%,#f0fdf4 100%); }
    .auth-card { background:#fff; padding:2.5rem; border-radius:16px; box-shadow:0 8px 32px rgba(0,0,0,.1); width:100%; max-width:420px; display:flex; flex-direction:column; gap:1rem; }
    .brand { display:flex; align-items:center; gap:.5rem; }
    .brand-icon { font-size:2rem; }
    h1 { color:#f97316; margin:0; font-size:2rem; font-weight:800; }
    .subtitle { color:#6b7280; margin:0; font-size:.95rem; }
    .field { display:flex; flex-direction:column; gap:.35rem; flex:1; }
    .row { display:flex; gap:.75rem; }
    label { font-size:.85rem; font-weight:600; color:#374151; }
    input { padding:.75rem 1rem; border:1.5px solid #e5e7eb; border-radius:10px; font-size:1rem; outline:none; transition:border-color .2s; width:100%; box-sizing:border-box; }
    input:focus { border-color:#f97316; }
    input.invalido { border-color:#ef4444; background:#fef2f2; }
    .erro-campo { font-size:.78rem; color:#ef4444; }
    form { display:flex; flex-direction:column; gap:.75rem; }
    .forca-senha { display:flex; flex-direction:column; gap:.3rem; }
    .forca-senha span { font-size:.78rem; color:#6b7280; }
    .barra { height:4px; background:#e5e7eb; border-radius:2px; }
    .forca-fill { height:100%; border-radius:2px; transition:width .3s, background .3s; }
    .forca-fill.fraca { background:#ef4444; }
    .forca-fill.media { background:#f59e0b; }
    .forca-fill.forte { background:#22c55e; }
    button { width:100%; padding:.8rem; background:#f97316; color:#fff; border:none; border-radius:10px; font-size:1rem; font-weight:700; cursor:pointer; transition:background .2s; margin-top:.25rem; }
    button:hover:not(:disabled) { background:#ea6009; }
    button:disabled { opacity:.6; cursor:not-allowed; }
    .link-text { text-align:center; color:#6b7280; font-size:.9rem; }
    .link-text a { color:#f97316; cursor:pointer; font-weight:600; }
    .msg-erro-global { background:#fef2f2; color:#dc2626; padding:.75rem; border-radius:8px; font-size:.9rem; }
  `]
})
export class CadastroComponent {
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
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      cidade: [''],
      estado: ['', [Validators.pattern(/^[A-Za-z]{2}$/)]],
      senha: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
      ]],
      confirmarSenha: ['', Validators.required]
    }, { validators: senhasIguaisValidator });
  }

  c(nome: string) { return this.form.get(nome)!; }

  get forcaSenhaPct(): number {
    const s = this.c('senha').value ?? '';
    if (s.length === 0) return 0;
    let pts = 0;
    if (s.length >= 8) pts++;
    if (s.length >= 10) pts++;
    if (/[A-Z]/.test(s)) pts++;
    if (/[0-9]/.test(s)) pts++;
    if (/[^A-Za-z0-9]/.test(s)) pts++;
    return Math.min(100, pts * 20);
  }

  get forcaSenhaClasse(): string {
    const p = this.forcaSenhaPct;
    if (p <= 40) return 'fraca';
    if (p <= 70) return 'media';
    return 'forte';
  }

  get forcaSenhaTexto(): string {
    const p = this.forcaSenhaPct;
    if (p <= 40) return 'Fraca';
    if (p <= 70) return 'Média';
    return 'Forte';
  }

  cadastrar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.carregando = true; this.erroServidor = '';
    const { nome, email, senha, cidade, estado } = this.form.value;

    const novoUsuario = {
      nome, email, senha,
      cidade, estado: estado?.toUpperCase() ?? '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nome}`,
      avaliacoes: 0, totalTrocas: 0
    };

    this.produtoService.loginPorEmail(email).subscribe({
      next: usuarios => {
        if (usuarios.length > 0) {
          this.erroServidor = 'Este e-mail já está cadastrado.';
          this.c('email').setErrors({ duplicado: true });
          this.carregando = false;
          return;
        }
        this.produtoService.criarUsuario(novoUsuario).subscribe({
          next: u => {
            this.authService.login(u);
            this.router.navigate(['/app/produtos']);
          },
          error: () => {
            this.erroServidor = 'Erro ao criar conta. Verifique se o json-server está rodando.';
            this.carregando = false;
          }
        });
      },
      error: () => {
        this.erroServidor = 'Não foi possível validar o e-mail.';
        this.carregando = false;
      }
    });
  }

  irParaLogin() { this.router.navigate(['/login']); }
}
