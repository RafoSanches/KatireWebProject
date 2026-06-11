import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProdutoService } from '../../services/produto.service';
import { Mensagem, Proposta } from '../../models/produto.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page" *ngIf="proposta">
      <a routerLink="/app/propostas" class="back">← Voltar para propostas</a>
      <section class="chat">
        <header>
          <div>
            <h1>Conversa com {{ nomeContato }}</h1>
            <p>{{ proposta.produtoOfertado }} ⇄ {{ proposta.produtoDesejado }}</p>
          </div>
          <span [class]="proposta.status">{{ proposta.status }}</span>
        </header>

        <div class="mensagens">
          <div class="empty" *ngIf="mensagens.length === 0">
            Inicie a conversa para combinar os detalhes da troca.
          </div>
          <div class="linha" *ngFor="let m of mensagens" [class.minha]="m.autorId === auth.getId()">
            <div class="balao">
              <strong>{{ m.autorId === auth.getId() ? 'Você' : m.autorNome }}</strong>
              <p>{{ m.texto }}</p>
              <small>{{ m.criadaEm | date:'HH:mm' }}</small>
            </div>
          </div>
        </div>

        <form [formGroup]="mensagemForm" (ngSubmit)="enviar()">
          <textarea formControlName="texto" rows="2" maxlength="500"
            placeholder="Escreva uma mensagem..."></textarea>
          <button type="submit" [disabled]="enviando || mensagemForm.invalid">
            {{ enviando ? 'Enviando...' : 'Enviar' }}
          </button>
        </form>
      </section>
    </div>
  `,
  styles: [`
    .page { padding:2rem; max-width:900px; height:100vh; display:flex; flex-direction:column; }
    .back { color:#f97316; font-weight:700; text-decoration:none; margin-bottom:1rem; }
    .chat { background:#fff; border:1px solid #f3f4f6; border-radius:16px; overflow:hidden; display:flex; flex-direction:column; flex:1; min-height:0; box-shadow:0 4px 16px rgba(0,0,0,.05); }
    header { padding:1rem 1.25rem; border-bottom:1px solid #f3f4f6; display:flex; justify-content:space-between; align-items:center; gap:1rem; }
    h1 { margin:0; font-size:1.1rem; color:#111827; }
    header p { margin:.2rem 0 0; color:#6b7280; font-size:.85rem; }
    header > span { padding:.25rem .65rem; border-radius:20px; font-size:.75rem; font-weight:800; text-transform:capitalize; }
    header .pendente { background:#fef9c3; color:#a16207; }
    header .aceita { background:#dcfce7; color:#15803d; }
    header .recusada { background:#fee2e2; color:#b91c1c; }
    .mensagens { flex:1; min-height:280px; overflow-y:auto; padding:1.25rem; background:#f9fafb; display:flex; flex-direction:column; gap:.65rem; }
    .linha { display:flex; justify-content:flex-start; }
    .linha.minha { justify-content:flex-end; }
    .balao { max-width:75%; background:#fff; border:1px solid #e5e7eb; border-radius:4px 14px 14px 14px; padding:.65rem .8rem; }
    .minha .balao { background:#f97316; color:#fff; border-color:#f97316; border-radius:14px 4px 14px 14px; }
    .balao strong { display:block; font-size:.75rem; margin-bottom:.25rem; }
    .balao p { margin:0; line-height:1.45; white-space:pre-wrap; }
    .balao small { display:block; text-align:right; margin-top:.25rem; opacity:.7; }
    .empty { margin:auto; color:#9ca3af; text-align:center; }
    form { padding:1rem; display:flex; gap:.75rem; border-top:1px solid #f3f4f6; }
    textarea { flex:1; resize:none; border:1.5px solid #e5e7eb; border-radius:10px; padding:.7rem; font:inherit; outline:none; }
    textarea:focus { border-color:#f97316; }
    form button { border:0; border-radius:10px; padding:0 1.25rem; background:#f97316; color:#fff; font-weight:800; cursor:pointer; }
    form button:disabled { opacity:.5; cursor:not-allowed; }
    @media (max-width:640px) { .page { padding:1rem; height:calc(100vh - 72px); } .balao { max-width:88%; } }
  `]
})
export class ChatComponent implements OnInit, OnDestroy {
  proposta: Proposta | null = null;
  mensagens: Mensagem[] = [];
  mensagemForm: FormGroup;
  enviando = false;
  private atualizador?: ReturnType<typeof setInterval>;

  get nomeContato() {
    if (!this.proposta) return '';
    return this.proposta.remetenteId === this.auth.getId()
      ? this.proposta.destinatario
      : this.proposta.remetente;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ProdutoService,
    private fb: FormBuilder,
    public auth: AuthService
  ) {
    this.mensagemForm = this.fb.group({
      texto: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(500)]]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.service.getProposta(id).subscribe({
      next: proposta => {
        const participante = [proposta.remetenteId, proposta.destinatarioId].includes(this.auth.getId());
        if (!participante) {
          this.router.navigate(['/app/propostas']);
          return;
        }
        this.proposta = proposta;
        this.carregarMensagens();
        this.atualizador = setInterval(() => this.carregarMensagens(), 5000);
      },
      error: () => this.router.navigate(['/app/propostas'])
    });
  }

  ngOnDestroy() {
    if (this.atualizador) clearInterval(this.atualizador);
  }

  carregarMensagens() {
    if (!this.proposta?.id) return;
    this.service.getMensagens(this.proposta.id).subscribe(m => this.mensagens = m);
  }

  enviar() {
    if (this.mensagemForm.invalid || !this.proposta) {
      this.mensagemForm.markAllAsTouched();
      return;
    }
    const texto = this.mensagemForm.value.texto.trim();
    const usuario = this.auth.getUsuario()!;
    const destinatarioId = this.proposta.remetenteId === usuario.id
      ? this.proposta.destinatarioId
      : this.proposta.remetenteId;
    this.enviando = true;
    this.service.enviarMensagem({
      propostaId: this.proposta.id!,
      autorId: usuario.id!,
      autorNome: usuario.nome,
      texto,
      criadaEm: new Date().toISOString()
    }).subscribe(mensagem => {
      this.mensagens = [...this.mensagens, mensagem];
      this.mensagemForm.reset();
      this.enviando = false;
      this.service.criarNotificacao({
        usuarioId: destinatarioId,
        tipo: 'mensagem',
        titulo: 'Nova mensagem',
        mensagem: `${usuario.nome} enviou uma mensagem sobre a troca.`,
        link: `/app/chat/${this.proposta!.id}`,
        lida: false,
        criadaEm: new Date().toISOString()
      }).subscribe();
    });
  }
}
