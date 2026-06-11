import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProdutoService } from '../../services/produto.service';
import { AuthService } from '../../services/auth.service';
import { GoogleLoginButtonComponent } from '../../components/google-login-button/google-login-button.component';
import { GoogleAuthResult, GoogleAuthService, GoogleRegistrationData } from '../../services/google-auth.service';

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

function maiorDeIdadeValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const nascimento = new Date(`${control.value}T12:00:00`);
  if (Number.isNaN(nascimento.getTime())) return { dataInvalida: true };
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const diferencaMes = hoje.getMonth() - nascimento.getMonth();
  if (diferencaMes < 0 || (diferencaMes === 0 && hoje.getDate() < nascimento.getDate())) idade--;
  return idade >= 18 ? null : { menorDeIdade: true };
}

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, GoogleLoginButtonComponent],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="brand"><img src="/katire-logo.svg" alt="Katire" /></div>
        <span class="eyebrow">Entre para o corre</span>
        <h1>Crie sua conta.</h1>
        <p class="subtitle">Conecte-se, anuncie e encontre novas oportunidades.</p>

        <div *ngIf="erroServidor" class="msg-erro-global">{{ erroServidor }}</div>
        <div *ngIf="googleCredential" class="google-conectado">
          <span>G</span>
          <div><strong>Conta Google confirmada</strong><small>Complete sua data de nascimento e endereço.</small></div>
        </div>
        <app-google-login-button *ngIf="!googleCredential" (autenticado)="continuarComGoogle($event)" />
        <div class="divider" *ngIf="!googleCredential"><span>ou cadastre-se com e-mail</span></div>

        <form [formGroup]="form" (ngSubmit)="cadastrar()">

          <div class="field">
            <label>Nome completo *</label>
            <input type="text" formControlName="nome" placeholder="Seu nome completo" [readonly]="!!googleCredential"
              [class.invalido]="c('nome').invalid && c('nome').touched" />
            <span class="erro-campo" *ngIf="c('nome').touched && c('nome').hasError('required')">Nome é obrigatório.</span>
            <span class="erro-campo" *ngIf="c('nome').touched && c('nome').hasError('minlength')">Mínimo de 3 caracteres.</span>
          </div>

          <div class="field">
            <label>E-mail *</label>
            <input type="email" formControlName="email" placeholder="seu@email.com" [readonly]="!!googleCredential"
              [class.invalido]="c('email').invalid && c('email').touched" />
            <span class="erro-campo" *ngIf="c('email').touched && c('email').hasError('required')">E-mail é obrigatório.</span>
            <span class="erro-campo" *ngIf="c('email').touched && c('email').hasError('email')">Informe um e-mail válido.</span>
          </div>

          <div class="field">
            <label>Data de nascimento *</label>
            <input type="date" formControlName="dataNascimento" [max]="dataMaximaNascimento"
              [class.invalido]="c('dataNascimento').invalid && c('dataNascimento').touched" />
            <span class="erro-campo" *ngIf="c('dataNascimento').touched && c('dataNascimento').hasError('required')">Data de nascimento é obrigatória.</span>
            <span class="erro-campo" *ngIf="c('dataNascimento').touched && c('dataNascimento').hasError('menorDeIdade')">É necessário ter 18 anos ou mais.</span>
          </div>

          <div class="field">
            <label>CEP *</label>
            <div class="cep-row">
              <input type="text" formControlName="cep" maxlength="9" placeholder="00000-000"
                (input)="formatarCep()" (blur)="buscarCep()"
                [class.invalido]="c('cep').invalid && c('cep').touched" />
              <button type="button" class="btn-cep" (click)="buscarCep()" [disabled]="buscandoCep">
                {{ buscandoCep ? 'Buscando...' : 'Buscar CEP' }}
              </button>
            </div>
            <span class="cep-status" [class.erro]="erroCep" *ngIf="mensagemCep">{{ mensagemCep }}</span>
            <span class="erro-campo" *ngIf="c('cep').touched && c('cep').invalid">Informe um CEP com 8 números.</span>
          </div>

          <div class="field">
            <label>Rua / Avenida *</label>
            <input type="text" formControlName="endereco" placeholder="Preenchido pelo CEP"
              [class.invalido]="c('endereco').invalid && c('endereco').touched" />
          </div>

          <div class="row">
            <div class="field">
              <label>Bairro *</label>
              <input type="text" formControlName="bairro" placeholder="Bairro"
                [class.invalido]="c('bairro').invalid && c('bairro').touched" />
            </div>
            <div class="field">
              <label>Número *</label>
              <input type="text" formControlName="numero" placeholder="Ex: 120"
                [class.invalido]="c('numero').invalid && c('numero').touched" />
            </div>
          </div>

          <div class="field">
            <label>Complemento</label>
            <input type="text" formControlName="complemento" placeholder="Apartamento, bloco, referência..." />
          </div>

          <div class="row">
            <div class="field">
              <label>Cidade *</label>
              <input type="text" formControlName="cidade" placeholder="Cidade"
                [class.invalido]="c('cidade').invalid && c('cidade').touched" />
            </div>
            <div class="field" style="max-width:90px">
              <label>Estado *</label>
              <input type="text" formControlName="estado" placeholder="UF"
                [class.invalido]="c('estado').invalid && c('estado').touched" />
              <span class="erro-campo" *ngIf="c('estado').touched && c('estado').hasError('pattern')">Use 2 letras.</span>
            </div>
          </div>

          <div class="field" *ngIf="!googleCredential">
            <label>Senha *</label>
            <input type="password" formControlName="senha" placeholder="8 caracteres, maiúscula e número"
              [class.invalido]="c('senha').invalid && c('senha').touched" />
            <span class="erro-campo" *ngIf="c('senha').touched && c('senha').hasError('required')">Senha é obrigatória.</span>
            <span class="erro-campo" *ngIf="c('senha').touched && (c('senha').hasError('minlength') || c('senha').hasError('pattern'))">
              Use 8 caracteres, com letra maiúscula, minúscula e número.
            </span>
          </div>

          <div class="field" *ngIf="!googleCredential">
            <label>Confirmar senha *</label>
            <input type="password" formControlName="confirmarSenha" placeholder="Repita a senha"
              [class.invalido]="c('confirmarSenha').invalid && c('confirmarSenha').touched" />
            <span class="erro-campo" *ngIf="c('confirmarSenha').touched && c('confirmarSenha').hasError('required')">Confirmação é obrigatória.</span>
            <span class="erro-campo" *ngIf="c('confirmarSenha').touched && c('confirmarSenha').hasError('senhasDiferentes')">As senhas não coincidem.</span>
          </div>

          <!-- Indicador de força da senha -->
          <div class="forca-senha" *ngIf="!googleCredential && c('senha').value">
            <div class="barra">
              <div class="forca-fill" [style.width]="forcaSenhaPct + '%'" [class]="forcaSenhaClasse"></div>
            </div>
            <span>Senha: {{ forcaSenhaTexto }}</span>
          </div>

          <button type="submit" [disabled]="carregando">
            {{ carregando ? 'Criando conta...' : (googleCredential ? 'Concluir cadastro com Google' : 'Criar minha conta') }}
          </button>
        </form>

        <p class="link-text">Já tem conta? <a (click)="irParaLogin()">Entrar</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { min-height:100vh; padding:2rem 1rem; display:flex; align-items:center; justify-content:center; background:#0d0d0d; background-image:linear-gradient(135deg,rgba(255,106,0,.13),transparent 40%),repeating-linear-gradient(115deg,transparent 0 70px,rgba(255,255,255,.018) 70px 71px); }
    .auth-card { position:relative; overflow:hidden; width:100%; max-width:500px; padding:2.25rem; display:flex; flex-direction:column; gap:1rem; border:1px solid #2b2b2b; border-radius:20px; background:#fff; box-shadow:0 30px 80px rgba(0,0,0,.4); }
    .auth-card::before { content:""; position:absolute; width:160px; height:160px; right:-85px; top:-90px; border:35px solid rgba(255,106,0,.12); border-radius:50%; }
    .brand { position:relative; z-index:1; }
    .brand img { width:150px; }
    .eyebrow { margin-top:.5rem; color:#ff6a00; font-size:.68rem; font-weight:900; letter-spacing:.12em; text-transform:uppercase; }
    h1 { margin:-.25rem 0 0; color:#0d0d0d; font-size:2rem; font-weight:900; letter-spacing:-.04em; }
    .subtitle { color:#6f6f6f; margin:-.5rem 0 .4rem; font-size:.88rem; }
    .field { display:flex; flex-direction:column; gap:.35rem; flex:1; }
    .row { display:flex; gap:.75rem; }
    .cep-row { display:grid; grid-template-columns:1fr auto; gap:.5rem; }
    .btn-cep { width:auto; min-height:48px; margin:0; padding:.65rem 1rem; background:#111; white-space:nowrap; }
    .btn-cep:hover:not(:disabled) { background:#2b2b2b; }
    .cep-status { font-size:.76rem; color:#16a34a; }
    .cep-status.erro { color:#ef4444; }
    .google-conectado { padding:.85rem; display:flex; align-items:center; gap:.7rem; border:1px solid #bbf7d0; border-radius:11px; background:#f0fdf4; }
    .google-conectado>span { width:34px; height:34px; display:grid; place-items:center; border-radius:9px; color:#fff; background:#4285f4; font-weight:900; }
    .google-conectado strong,.google-conectado small { display:block; }
    .google-conectado strong { color:#166534; font-size:.82rem; }
    .google-conectado small { margin-top:.15rem; color:#4b5563; font-size:.72rem; }
    .divider { display:flex; align-items:center; gap:.65rem; color:#a1a1aa; font-size:.7rem; }
    .divider::before,.divider::after { content:""; flex:1; height:1px; background:#e4e4e7; }
    label { font-size:.76rem; font-weight:800; color:#27272a; }
    input { min-height:48px; padding:.75rem 1rem; border:1.5px solid #d4d4d8; border-radius:11px; font-size:.9rem; outline:none; transition:border-color .2s,box-shadow .2s; width:100%; box-sizing:border-box; }
    input:focus { border-color:#ff6a00; box-shadow:0 0 0 4px rgba(255,106,0,.1); }
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
    button { width:100%; min-height:50px; padding:.8rem; background:#ff6a00; color:#fff; border:none; border-radius:11px; font-size:.9rem; font-weight:900; cursor:pointer; transition:background .2s,transform .2s; margin-top:.25rem; }
    button:hover:not(:disabled) { background:#e95f00; transform:translateY(-1px); }
    button:disabled { opacity:.6; cursor:not-allowed; }
    .link-text { text-align:center; color:#6b7280; font-size:.9rem; }
    .link-text a { color:#0d0d0d; cursor:pointer; font-weight:900; text-decoration:underline; text-decoration-color:#ff6a00; text-underline-offset:4px; }
    .msg-erro-global { background:#fef2f2; color:#dc2626; padding:.75rem; border-radius:8px; font-size:.9rem; }
    @media (max-width:520px) { .auth-container { padding:0; align-items:stretch; } .auth-card { max-width:none; min-height:100vh; border:0; border-radius:0; padding:1.5rem; } .row { flex-direction:column; } .row .field { max-width:none !important; } .cep-row { grid-template-columns:1fr; } .btn-cep { width:100%; } }
  `]
})
export class CadastroComponent implements OnInit {
  form: FormGroup;
  carregando = false;
  erroServidor = '';
  buscandoCep = false;
  mensagemCep = '';
  erroCep = false;
  googleCredential = '';
  googleAvatar = '';

  get dataMaximaNascimento(): string {
    const data = new Date();
    data.setFullYear(data.getFullYear() - 18);
    return data.toISOString().split('T')[0];
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private produtoService: ProdutoService,
    private authService: AuthService,
    private googleAuth: GoogleAuthService
  ) {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      dataNascimento: ['', [Validators.required, maiorDeIdadeValidator]],
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
      endereco: ['', Validators.required],
      bairro: ['', Validators.required],
      numero: ['', Validators.required],
      complemento: [''],
      cidade: ['', Validators.required],
      estado: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{2}$/)]],
      senha: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
      ]],
      confirmarSenha: ['', Validators.required]
    }, { validators: senhasIguaisValidator });
  }

  ngOnInit() {
    const pendente = this.googleAuth.consumirCadastroPendente();
    if (pendente) this.aplicarContaGoogle(pendente);
  }

  c(nome: string) { return this.form.get(nome)!; }

  formatarCep() {
    const numeros = String(this.c('cep').value ?? '').replace(/\D/g, '').slice(0, 8);
    const formatado = numeros.length > 5 ? `${numeros.slice(0, 5)}-${numeros.slice(5)}` : numeros;
    this.c('cep').setValue(formatado, { emitEvent: false });
  }

  buscarCep() {
    const cep = String(this.c('cep').value ?? '').replace(/\D/g, '');
    if (cep.length !== 8 || this.buscandoCep) return;
    this.buscandoCep = true;
    this.erroCep = false;
    this.mensagemCep = 'Buscando endereço...';

    this.produtoService.buscarCep(cep).subscribe({
      next: endereco => {
        if (endereco.erro) {
          this.erroCep = true;
          this.mensagemCep = 'CEP não encontrado. Preencha o endereço manualmente.';
        } else {
          this.form.patchValue({
            cep: endereco.cep,
            endereco: endereco.logradouro,
            bairro: endereco.bairro,
            cidade: endereco.localidade,
            estado: endereco.uf
          });
          this.mensagemCep = 'Endereço encontrado. Confira os dados antes de continuar.';
        }
        this.buscandoCep = false;
      },
      error: () => {
        this.erroCep = true;
        this.mensagemCep = 'Não foi possível consultar o CEP. Preencha o endereço manualmente.';
        this.buscandoCep = false;
      }
    });
  }

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
    const {
      nome, email, senha, dataNascimento, cep, endereco, bairro,
      numero, complemento, cidade, estado
    } = this.form.value;

    if (this.googleCredential) {
      const dados: GoogleRegistrationData = {
        dataNascimento,
        cep: String(cep).replace(/\D/g, ''),
        endereco,
        bairro,
        numero,
        complemento,
        cidade,
        estado: estado?.toUpperCase() ?? ''
      };
      this.googleAuth.cadastrar(this.googleCredential, dados).subscribe({
        next: ({ usuario }) => {
          this.authService.login(usuario);
          this.router.navigate(['/app/produtos']);
        },
        error: erro => {
          this.erroServidor = erro.error?.erro ?? 'Não foi possível concluir o cadastro com Google.';
          this.carregando = false;
        }
      });
      return;
    }

    const novoUsuario = {
      nome, email, senha,
      dataNascimento,
      cep: String(cep).replace(/\D/g, ''),
      endereco, bairro, numero, complemento,
      cidade, estado: estado?.toUpperCase() ?? '',
      avatar: '',
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

  continuarComGoogle(resultado: GoogleAuthResult) {
    if (resultado.usuario) {
      this.authService.login(resultado.usuario);
      this.router.navigate(['/app/produtos']);
      return;
    }
    this.aplicarContaGoogle(resultado);
  }

  private aplicarContaGoogle(resultado: GoogleAuthResult) {
    if (!resultado.precisaCadastro || !resultado.perfil) return;
    this.googleCredential = resultado.credential;
    this.googleAvatar = resultado.perfil.avatar;
    this.form.patchValue({ nome: resultado.perfil.nome, email: resultado.perfil.email, senha: '', confirmarSenha: '' });
    this.c('senha').clearValidators();
    this.c('confirmarSenha').clearValidators();
    this.c('senha').updateValueAndValidity();
    this.c('confirmarSenha').updateValueAndValidity();
  }

  irParaLogin() { this.router.navigate(['/login']); }
}
