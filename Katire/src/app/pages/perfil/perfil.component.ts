import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ProdutoService } from '../../services/produto.service';
import { AuthService } from '../../services/auth.service';
import { Usuario, Avaliacao } from '../../models/produto.model';

function senhasIguaisValidator(control: AbstractControl): ValidationErrors | null {
  const nova = control.get('novaSenha');
  const confirmar = control.get('confirmarSenha');
  if (nova?.value && confirmar && nova.value !== confirmar.value) {
    confirmar.setErrors({ senhasDiferentes: true });
    return { senhasDiferentes: true };
  }
  if (confirmar?.hasError('senhasDiferentes')) confirmar.setErrors(null);
  return null;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <h1>Meu Perfil</h1>
      <p class="subtitle">Gerencie suas informações pessoais</p>

      <div *ngIf="sucesso" class="msg-sucesso">{{ sucesso }}</div>
      <div *ngIf="erroServidor" class="msg-erro">{{ erroServidor }}</div>

      <div class="layout" *ngIf="usuario">
        <!-- Card lateral -->
        <div class="sidebar">
          <div class="avatar-card">
            <img [src]="usuario.avatar" [alt]="usuario.nome" class="avatar" />
            <h2>{{ usuario.nome }}</h2>
            <p>{{ usuario.email }}</p>
            <div class="stats">
              <div class="stat"><strong>{{ usuario.totalTrocas }}</strong><span>Trocas</span></div>
              <div class="stat"><strong>{{ usuario.avaliacoes | number:'1.1-1' }} ⭐</strong><span>Avaliação</span></div>
            </div>
          </div>

          <!-- Reputação -->
          <div class="reputacao-card">
            <h3>⭐ Reputação</h3>
            <div class="media-geral" *ngIf="avaliacoes.length > 0">
              <div class="nota-grande">{{ mediaAvaliacoes | number:'1.1-1' }}</div>
              <div class="estrelas-display">
                <span *ngFor="let n of [1,2,3,4,5]" class="estrela-sm" [class.ativa]="n <= mediaArredondada">★</span>
              </div>
              <div class="total-avs">{{ avaliacoes.length }} avaliação{{ avaliacoes.length !== 1 ? 'ões' : '' }}</div>
            </div>

            <div *ngIf="avaliacoes.length === 0" class="sem-avaliacoes">
              Nenhuma avaliação recebida ainda.
            </div>

            <div class="lista-avaliacoes" *ngIf="avaliacoes.length > 0">
              <div class="card-avaliacao" *ngFor="let av of avaliacoes">
                <div class="av-header">
                  <img [src]="av.autorAvatar" [alt]="av.autorNome" class="av-avatar" />
                  <div class="av-info">
                    <span class="av-nome">{{ av.autorNome }}</span>
                    <div class="av-estrelas">
                      <span *ngFor="let n of [1,2,3,4,5]" class="estrela-xs" [class.ativa]="n <= av.nota">★</span>
                    </div>
                  </div>
                  <span class="av-data">{{ av.criadaEm | date:'dd/MM/yy' }}</span>
                </div>
                <p class="av-comentario">{{ av.comentario }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Formulário de edição -->
        <form [formGroup]="form" (ngSubmit)="salvar()" class="form-card">
          <h3>Editar informações</h3>

          <div class="field">
            <label>Nome completo *</label>
            <input type="text" formControlName="nome"
              [class.invalido]="c('nome').invalid && c('nome').touched" />
            <span class="erro-campo" *ngIf="c('nome').touched && c('nome').hasError('required')">Nome é obrigatório.</span>
            <span class="erro-campo" *ngIf="c('nome').touched && c('nome').hasError('minlength')">Mínimo de 3 caracteres.</span>
          </div>

          <div class="field">
            <label>E-mail *</label>
            <input type="email" formControlName="email"
              [class.invalido]="c('email').invalid && c('email').touched" />
            <span class="erro-campo" *ngIf="c('email').touched && c('email').hasError('required')">E-mail é obrigatório.</span>
            <span class="erro-campo" *ngIf="c('email').touched && c('email').hasError('email')">E-mail inválido.</span>
          </div>

          <div class="row">
            <div class="field">
              <label>Cidade</label>
              <input type="text" formControlName="cidade" />
            </div>
            <div class="field" style="max-width:90px">
              <label>Estado</label>
              <input type="text" formControlName="estado" maxlength="2"
                [class.invalido]="c('estado').invalid && c('estado').touched" />
              <span class="erro-campo" *ngIf="c('estado').touched && c('estado').hasError('pattern')">Use 2 letras.</span>
            </div>
          </div>

          <hr />
          <p class="section-label">Alterar senha (opcional)</p>

          <div class="field">
            <label>Nova senha</label>
            <input type="password" formControlName="novaSenha" placeholder="Deixe em branco para manter"
              [class.invalido]="c('novaSenha').invalid && c('novaSenha').touched" />
            <span class="erro-campo" *ngIf="c('novaSenha').touched && c('novaSenha').hasError('minlength')">Mínimo de 6 caracteres.</span>
          </div>

          <div class="field" *ngIf="c('novaSenha').value">
            <label>Confirmar nova senha</label>
            <input type="password" formControlName="confirmarSenha"
              [class.invalido]="c('confirmarSenha').invalid && c('confirmarSenha').touched" />
            <span class="erro-campo" *ngIf="c('confirmarSenha').touched && c('confirmarSenha').hasError('senhasDiferentes')">As senhas não coincidem.</span>
          </div>

          <div class="resumo-erros" *ngIf="form.invalid && formSubmetido">
            ⚠️ Corrija os campos destacados antes de salvar.
          </div>

          <button type="submit" [disabled]="salvando">
            {{ salvando ? 'Salvando...' : 'Salvar alterações' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page { padding:2rem; max-width:900px; }
    h1 { font-size:1.75rem; font-weight:800; color:#111827; margin:0; }
    .subtitle { color:#6b7280; margin:.25rem 0 2rem; }
    .layout { display:grid; grid-template-columns:280px 1fr; gap:1.5rem; align-items:start; }
    .sidebar { display:flex; flex-direction:column; gap:1rem; }

    /* Avatar card */
    .avatar-card { background:#fff; border-radius:14px; padding:1.5rem; display:flex; flex-direction:column; align-items:center; gap:.75rem; border:1px solid #f3f4f6; text-align:center; }
    .avatar { width:100px; height:100px; border-radius:50%; border:3px solid #f97316; }
    h2 { font-size:1.1rem; font-weight:700; color:#111827; margin:0; }
    p { color:#6b7280; font-size:.85rem; margin:0; }
    .stats { display:flex; gap:1.5rem; margin-top:.75rem; }
    .stat { display:flex; flex-direction:column; align-items:center; }
    .stat strong { font-size:1.1rem; font-weight:700; color:#f97316; }
    .stat span { font-size:.75rem; color:#9ca3af; }

    /* Reputação */
    .reputacao-card { background:#fff; border-radius:14px; padding:1.25rem; border:1px solid #f3f4f6; }
    .reputacao-card h3 { font-size:.95rem; font-weight:700; color:#111827; margin:0 0 1rem; }
    .media-geral { display:flex; flex-direction:column; align-items:center; gap:.3rem; margin-bottom:1rem; padding-bottom:1rem; border-bottom:1px solid #f3f4f6; }
    .nota-grande { font-size:2.5rem; font-weight:800; color:#f59e0b; line-height:1; }
    .estrelas-display { display:flex; gap:.1rem; }
    .estrela-sm { font-size:1.4rem; color:#d1d5db; }
    .estrela-sm.ativa { color:#f59e0b; }
    .total-avs { font-size:.78rem; color:#9ca3af; }
    .sem-avaliacoes { font-size:.85rem; color:#9ca3af; text-align:center; padding:.5rem 0; }

    .lista-avaliacoes { display:flex; flex-direction:column; gap:.75rem; max-height:320px; overflow-y:auto; }
    .card-avaliacao { background:#f9fafb; border-radius:10px; padding:.85rem; }
    .av-header { display:flex; align-items:center; gap:.6rem; margin-bottom:.5rem; }
    .av-avatar { width:32px; height:32px; border-radius:50%; flex-shrink:0; }
    .av-info { display:flex; flex-direction:column; gap:.1rem; flex:1; }
    .av-nome { font-size:.82rem; font-weight:700; color:#111827; }
    .av-estrelas { display:flex; gap:.05rem; }
    .estrela-xs { font-size:.9rem; color:#d1d5db; }
    .estrela-xs.ativa { color:#f59e0b; }
    .av-data { font-size:.72rem; color:#9ca3af; flex-shrink:0; }
    .av-comentario { margin:0; font-size:.82rem; color:#4b5563; line-height:1.4; }

    /* Form */
    .form-card { background:#fff; border-radius:14px; padding:1.5rem; border:1px solid #f3f4f6; display:flex; flex-direction:column; gap:.75rem; }
    h3 { font-size:1rem; font-weight:700; color:#111827; margin:0 0 .5rem; }
    .section-label { font-size:.85rem; font-weight:600; color:#374151; margin:0; }
    hr { border:none; border-top:1px solid #f3f4f6; }
    .field { display:flex; flex-direction:column; gap:.35rem; flex:1; }
    .row { display:flex; gap:.75rem; }
    label { font-size:.85rem; font-weight:600; color:#374151; }
    input { padding:.75rem 1rem; border:1.5px solid #e5e7eb; border-radius:10px; font-size:.95rem; outline:none; transition:border-color .2s; box-sizing:border-box; width:100%; }
    input:focus { border-color:#f97316; }
    input.invalido { border-color:#ef4444; background:#fef2f2; }
    .erro-campo { font-size:.78rem; color:#ef4444; }
    .resumo-erros { background:#fef2f2; color:#dc2626; padding:.6rem 1rem; border-radius:8px; font-size:.85rem; border-left:3px solid #ef4444; }
    button[type=submit] { width:100%; padding:.8rem; background:#f97316; color:#fff; border:none; border-radius:10px; font-size:1rem; font-weight:700; cursor:pointer; transition:background .2s; margin-top:.5rem; }
    button[type=submit]:hover:not(:disabled) { background:#ea6009; }
    button[type=submit]:disabled { opacity:.6; cursor:not-allowed; }
    .msg-sucesso { background:#f0fdf4; color:#16a34a; padding:.75rem; border-radius:8px; margin-bottom:1rem; }
    .msg-erro { background:#fef2f2; color:#dc2626; padding:.75rem; border-radius:8px; margin-bottom:1rem; }
    @media (max-width:700px) { .layout { grid-template-columns:1fr; } }
  `]
})
export class PerfilComponent implements OnInit {
  usuario: Usuario | null = null;
  avaliacoes: Avaliacao[] = [];
  form: FormGroup;
  salvando = false; sucesso = ''; erroServidor = '';
  formSubmetido = false;

  get mediaAvaliacoes(): number {
    if (!this.avaliacoes.length) return 0;
    return this.avaliacoes.reduce((s, a) => s + a.nota, 0) / this.avaliacoes.length;
  }

  get mediaArredondada(): number {
    return Math.round(this.mediaAvaliacoes);
  }

  constructor(
    private fb: FormBuilder,
    private produtoService: ProdutoService,
    public auth: AuthService
  ) {
    this.form = this.fb.group({
      nome:           ['', [Validators.required, Validators.minLength(3)]],
      email:          ['', [Validators.required, Validators.email]],
      cidade:         [''],
      estado:         ['', Validators.pattern(/^[A-Za-z]{2}$/)],
      novaSenha:      ['', Validators.minLength(6)],
      confirmarSenha: [''  ]
    }, { validators: senhasIguaisValidator });
  }

  c(nome: string) { return this.form.get(nome)!; }

  ngOnInit() {
    const id = this.auth.getId();
    if (id) {
      this.produtoService.getUsuario(id).subscribe(u => {
        this.usuario = u;
        this.form.patchValue({ nome: u.nome, email: u.email, cidade: u.cidade ?? '', estado: u.estado ?? '' });
      });
      this.produtoService.getAvaliacoesPorAvaliado(id).subscribe(avs => {
        this.avaliacoes = avs.sort((a, b) =>
          new Date(b.criadaEm ?? 0).getTime() - new Date(a.criadaEm ?? 0).getTime()
        );
      });
    }
  }

  salvar() {
    this.formSubmetido = true;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const id = this.auth.getId();
    if (!id) return;
    this.salvando = true; this.erroServidor = '';

    const { nome, email, cidade, estado, novaSenha } = this.form.value;
    const dados: Partial<Usuario> = {
      nome, email, cidade, estado: estado?.toUpperCase() ?? '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nome}`
    };
    if (novaSenha) dados['senha'] = novaSenha;

    this.produtoService.atualizarUsuario(id, dados).subscribe({
      next: u => {
        this.auth.login(u); this.usuario = u;
        this.form.patchValue({ novaSenha: '', confirmarSenha: '' });
        this.sucesso = 'Perfil atualizado com sucesso!'; this.salvando = false;
        setTimeout(() => this.sucesso = '', 3000);
      },
      error: () => { this.erroServidor = 'Erro ao salvar perfil.'; this.salvando = false; }
    });
  }
}
