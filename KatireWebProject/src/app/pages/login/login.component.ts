import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProdutoService } from '../../services/produto.service';
import { AuthService } from '../../services/auth.service';
import { GoogleLoginButtonComponent } from '../../components/google-login-button/google-login-button.component';
import { GoogleAuthResult, GoogleAuthService } from '../../services/google-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, GoogleLoginButtonComponent],
  template: `
    <div class="auth-container">
      <section class="brand-panel">
        <img src="/katire-logo.svg" alt="Katire" class="logo" />
        <div class="brand-copy">
          <span class="eyebrow">Da quebrada de BH para o Brasil</span>
          <h1>O próximo grande negócio pode ser seu.</h1>
          <p>A plataforma onde o corre encontra oportunidade, conexão e crescimento.</p>
        </div>
        <div class="benefits">
          <div><strong>Conexão real</strong><span>Gente da comunidade fazendo negócio.</span></div>
          <div><strong>Oportunidades reais</strong><span>Produtos, propostas e novos caminhos.</span></div>
          <div><strong>Crescimento contínuo</strong><span>Reputação construída no corre.</span></div>
        </div>
        <div class="brand-footer"><span>KATIRE</span><small>DO CORRE PARA O SUCESSO.</small></div>
      </section>

      <section class="form-panel">
        <div class="auth-card">
          <div class="mobile-brand"><img src="/katire-logo.svg" alt="Katire" /></div>
          <span class="form-kicker">Bem-vindo de volta</span>
          <h2>Acesse sua conta</h2>
          <p class="subtitle">Continue suas conversas, propostas e trocas.</p>

          <div *ngIf="erroServidor" class="msg-erro-global">{{ erroServidor }}</div>

          <form [formGroup]="form" (ngSubmit)="entrar()">
            <div class="field">
              <label for="email">E-mail</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                autocomplete="email"
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
                autocomplete="current-password"
                placeholder="Digite sua senha"
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
              <span>{{ carregando ? 'Entrando...' : 'Entrar na Katire' }}</span>
              <b *ngIf="!carregando">→</b>
            </button>
          </form>

          <div class="divider"><span>ou</span></div>
          <app-google-login-button (autenticado)="entrarComGoogle($event)" />

          <p class="link-text">Ainda não faz parte? <a (click)="irParaCadastro()">Criar conta grátis</a></p>
          <div class="demo-hint">
            <span>ACESSO DE DEMONSTRAÇÃO</span>
            <small>ana&#64;email.com</small>
            <small>Senha: 123456</small>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .auth-container { min-height:100vh; display:grid; grid-template-columns:minmax(440px,1.05fr) minmax(440px,.95fr); background:#f4f4f5; }
    .brand-panel { position:relative; overflow:hidden; min-height:100vh; padding:3rem clamp(2.5rem,6vw,6rem); display:flex; flex-direction:column; color:#fff; background:#111; }
    .brand-panel::before { content:""; position:absolute; width:520px; height:520px; right:-220px; top:-180px; border:110px solid rgba(255,107,0,.12); border-radius:50%; }
    .brand-panel::after { content:""; position:absolute; width:260px; height:260px; left:-120px; bottom:70px; border:70px solid rgba(255,255,255,.04); border-radius:50%; }
    .logo { position:relative; z-index:1; width:154px; padding:.55rem .7rem; border-radius:13px; background:#fff; }
    .brand-copy { position:relative; z-index:1; max-width:640px; margin:auto 0 2.6rem; }
    .eyebrow,.form-kicker { display:block; color:#ff7a1a; font-size:.72rem; font-weight:900; letter-spacing:.14em; text-transform:uppercase; }
    h1 { max-width:610px; margin:1rem 0 1.15rem; font-size:clamp(2.5rem,4.5vw,4.9rem); line-height:.98; letter-spacing:-.055em; }
    .brand-copy p { max-width:550px; color:#a1a1aa; font-size:1.02rem; line-height:1.7; }
    .benefits { position:relative; z-index:1; display:grid; grid-template-columns:repeat(3,1fr); gap:.8rem; }
    .benefits div { padding:1rem; border:1px solid #2b2b2b; border-radius:14px; background:rgba(255,255,255,.035); }
    .benefits strong,.benefits span { display:block; }
    .benefits strong { margin-bottom:.4rem; color:#fff; font-size:.8rem; }
    .benefits span { color:#808087; font-size:.7rem; line-height:1.45; }
    .brand-footer { position:relative; z-index:1; display:flex; align-items:center; justify-content:space-between; margin-top:1.5rem; color:#71717a; }
    .brand-footer span { color:#ff6b00; font-weight:900; }
    .brand-footer small { font-size:.7rem; }
    .form-panel { padding:2rem; display:grid; place-items:center; }
    .auth-card { width:100%; max-width:430px; display:flex; flex-direction:column; gap:1rem; }
    .mobile-brand { display:none; }
    h2 { margin:.15rem 0 0; color:#111; font-size:2rem; letter-spacing:-.04em; }
    .subtitle { margin:0 0 .8rem; color:#71717a; font-size:.92rem; }
    .field { display:flex; flex-direction:column; gap:.42rem; }
    label { color:#27272a; font-size:.78rem; font-weight:800; }
    input { min-height:50px; padding:.8rem 1rem; border:1.5px solid #d4d4d8; border-radius:12px; color:#111; background:#fff; outline:none; transition:border-color .2s,box-shadow .2s; }
    input:focus { border-color:#ff6b00; box-shadow:0 0 0 4px rgba(255,107,0,.1); }
    input.invalido { border-color:#ef4444; background:#fef2f2; }
    .erro-campo { color:#dc2626; font-size:.73rem; }
    form { display:flex; flex-direction:column; gap:1rem; }
    form button { width:100%; min-height:52px; margin-top:.25rem; padding:.8rem 1rem; display:flex; align-items:center; justify-content:space-between; border:0; border-radius:12px; color:#fff; background:#ff6b00; box-shadow:0 10px 24px rgba(255,107,0,.22); font-weight:850; cursor:pointer; transition:background .2s,transform .2s; }
    form button:hover:not(:disabled) { background:#e85f00; transform:translateY(-1px); }
    form button b { font-size:1.25rem; }
    form button:disabled { opacity:.6; cursor:not-allowed; }
    .divider { display:flex; align-items:center; gap:.75rem; color:#a1a1aa; font-size:.72rem; }
    .divider::before,.divider::after { content:""; flex:1; height:1px; background:#e4e4e7; }
    .link-text { text-align:center; color:#71717a; font-size:.84rem; }
    .link-text a { margin-left:.25rem; color:#111; cursor:pointer; font-weight:850; text-decoration:underline; text-decoration-color:#ff6b00; text-underline-offset:4px; }
    .msg-erro-global { padding:.8rem; border:1px solid #fecaca; border-radius:10px; color:#b91c1c; background:#fef2f2; font-size:.82rem; }
    .demo-hint { padding:.85rem 1rem; display:grid; grid-template-columns:1fr auto; gap:.2rem 1rem; border:1px solid #e4e4e7; border-radius:12px; color:#71717a; background:#fafafa; }
    .demo-hint span { grid-column:1/-1; color:#a1a1aa; font-size:.62rem; font-weight:900; letter-spacing:.1em; }
    .demo-hint small { color:#52525b; font-size:.72rem; }
    @media (max-width:900px) {
      .auth-container { grid-template-columns:1fr; }
      .brand-panel { display:none; }
      .form-panel { min-height:100vh; padding:1.25rem; background:linear-gradient(145deg,#f4f4f5,#fff); }
      .mobile-brand { display:block; margin-bottom:1.5rem; }
      .mobile-brand img { width:142px; }
      .auth-card { padding:1.5rem; border:1px solid #e4e4e7; border-radius:20px; background:#fff; box-shadow:0 20px 50px rgba(0,0,0,.08); }
    }
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
    private authService: AuthService,
    private googleAuth: GoogleAuthService
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

  entrarComGoogle(resultado: GoogleAuthResult) {
    if (resultado.usuario) {
      this.authService.login(resultado.usuario);
      this.router.navigate(['/app/produtos']);
      return;
    }

    this.googleAuth.prepararCadastro(resultado);
    this.router.navigate(['/cadastro']);
  }

  irParaCadastro() { this.router.navigate(['/cadastro']); }
}
