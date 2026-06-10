import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProdutoService } from '../../services/produto.service';
import { AuthService } from '../../services/auth.service';
import { Proposta, Avaliacao } from '../../models/produto.model';

@Component({
  selector: 'app-propostas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Propostas</h1>
        <p>Gerencie suas propostas de troca</p>
      </div>

      <div class="tabs">
        <button [class.active]="aba === 'recebidas'" (click)="aba = 'recebidas'">
          📬 Recebidas <span class="count">{{ recebidas.length }}</span>
        </button>
        <button [class.active]="aba === 'enviadas'" (click)="aba = 'enviadas'">
          📤 Enviadas <span class="count">{{ enviadas.length }}</span>
        </button>
      </div>

      <div *ngIf="carregando" class="loading">Carregando...</div>

      <div *ngIf="!carregando">
        <div *ngIf="listaAtual.length === 0" class="empty">
          <span>📭</span>
          <p>Nenhuma proposta {{ aba === 'recebidas' ? 'recebida' : 'enviada' }} ainda.</p>
        </div>

        <div class="lista">
          <div class="card-proposta" *ngFor="let p of listaAtual">
            <div class="proposta-header">
              <div class="proposta-info">
                <span class="direcao">
                  {{ aba === 'recebidas' ? '📬 De ' + p.remetente : '📤 Para ' + p.destinatario }}
                </span>
                <span class="data">{{ p.criadaEm | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              <span class="status" [class]="p.status">{{ statusLabel(p.status) }}</span>
            </div>

            <div class="proposta-body">
              <div class="troca">
                <div class="item-troca">
                  <small>Produto ofertado</small>
                  <strong>{{ p.produtoOfertado }}</strong>
                </div>
                <span class="seta">⇄</span>
                <div class="item-troca">
                  <small>Produto desejado</small>
                  <strong>{{ p.produtoDesejado }}</strong>
                </div>
              </div>
              <div class="mensagem">
                <small>Mensagem:</small>
                <p>{{ p.mensagem }}</p>
              </div>
            </div>

            <!-- Ações para recebidas pendentes -->
            <div class="proposta-actions" *ngIf="aba === 'recebidas' && p.status === 'pendente'">
              <button class="btn-aceitar" (click)="responder(p.id!, 'aceita')">✅ Aceitar</button>
              <button class="btn-recusar" (click)="responder(p.id!, 'recusada')">❌ Recusar</button>
            </div>

            <div class="proposta-actions">
              <a class="btn-chat" [routerLink]="['/app/chat', p.id]">💬 Abrir conversa</a>
            </div>

            <!-- Botão avaliar para trocas aceitas ainda não avaliadas -->
            <div class="proposta-actions" *ngIf="p.status === 'aceita' && !jaAvaliado[p.id!]">
              <button class="btn-avaliar" (click)="abrirModal(p)">⭐ Avaliar troca</button>
            </div>
            <div class="ja-avaliado" *ngIf="p.status === 'aceita' && jaAvaliado[p.id!]">
              ✅ Avaliação enviada
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de avaliação -->
      <div class="modal-overlay" *ngIf="modalAberto" (click)="fecharModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>⭐ Avaliar troca</h2>
            <button class="btn-fechar" (click)="fecharModal()">✕</button>
          </div>

          <div class="modal-body">
            <p class="modal-sub">Como foi a troca com <strong>{{ nomeAvaliado }}</strong>?</p>

            <form [formGroup]="formAvaliacao" (ngSubmit)="enviarAvaliacao()">
              <!-- Estrelas -->
              <div class="field">
                <label>Nota *</label>
                <div class="estrelas">
                  <span
                    *ngFor="let n of [1,2,3,4,5]"
                    class="estrela"
                    [class.ativa]="n <= (hoveredStar || notaSelecionada)"
                    (mouseenter)="hoveredStar = n"
                    (mouseleave)="hoveredStar = 0"
                    (click)="selecionarNota(n)">★</span>
                </div>
                <span class="nota-label">{{ notaLabel(notaSelecionada) }}</span>
              </div>

              <!-- Comentário -->
              <div class="field">
                <label>Comentário *</label>
                <textarea
                  formControlName="comentario"
                  rows="4"
                  placeholder="Descreva como foi a experiência da troca..."
                  [class.invalido]="formAvaliacao.get('comentario')!.invalid && formAvaliacao.get('comentario')!.touched">
                </textarea>
                <span class="erro-campo" *ngIf="formAvaliacao.get('comentario')!.touched && formAvaliacao.get('comentario')!.hasError('required')">
                  Comentário é obrigatório.
                </span>
                <span class="erro-campo" *ngIf="formAvaliacao.get('comentario')!.touched && formAvaliacao.get('comentario')!.hasError('minlength')">
                  Mínimo de 10 caracteres.
                </span>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn-cancelar" (click)="fecharModal()">Cancelar</button>
                <button type="submit" class="btn-enviar" [disabled]="enviandoAvaliacao || notaSelecionada === 0">
                  {{ enviandoAvaliacao ? 'Enviando...' : 'Enviar avaliação' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 2rem; max-width: 800px; }
    .page-header { margin-bottom: 1.5rem; }
    h1 { font-size: 1.75rem; font-weight: 800; color: #111827; margin: 0; }
    p { color: #6b7280; margin: 0.25rem 0 0; }
    .tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
    .tabs button {
      padding: 0.65rem 1.25rem; border: 1.5px solid #e5e7eb;
      border-radius: 10px; background: #fff; cursor: pointer;
      font-size: 0.9rem; font-weight: 600; color: #6b7280;
      transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem;
    }
    .tabs button.active { background: #fff7ed; border-color: #f97316; color: #f97316; }
    .count { background: #f3f4f6; padding: 0.1rem 0.4rem; border-radius: 20px; font-size: 0.75rem; }
    .tabs button.active .count { background: #ffedd5; }
    .loading { padding: 2rem; text-align: center; color: #9ca3af; }
    .empty { text-align: center; padding: 3rem; color: #9ca3af; }
    .empty span { font-size: 3rem; display: block; margin-bottom: 0.5rem; }
    .lista { display: flex; flex-direction: column; gap: 1rem; }
    .card-proposta {
      background: #fff; border-radius: 14px; padding: 1.25rem;
      border: 1px solid #f3f4f6; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .proposta-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .proposta-info { display: flex; flex-direction: column; gap: 0.2rem; }
    .direcao { font-size: 0.9rem; font-weight: 600; color: #374151; }
    .data { font-size: 0.78rem; color: #9ca3af; }
    .status { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 700; }
    .status.pendente { background: #fef9c3; color: #ca8a04; }
    .status.aceita { background: #f0fdf4; color: #16a34a; }
    .status.recusada { background: #fef2f2; color: #dc2626; }
    .troca {
      display: flex; align-items: center; gap: 1rem;
      background: #f9fafb; padding: 1rem; border-radius: 10px; margin-bottom: 0.75rem;
    }
    .item-troca { display: flex; flex-direction: column; gap: 0.2rem; flex: 1; }
    .item-troca small { font-size: 0.75rem; color: #9ca3af; }
    .item-troca strong { font-size: 0.9rem; color: #111827; }
    .seta { font-size: 1.25rem; color: #f97316; }
    .mensagem small { font-size: 0.75rem; color: #9ca3af; font-weight: 600; }
    .mensagem p { margin: 0.25rem 0 0; font-size: 0.9rem; color: #374151; }
    .proposta-actions { display: flex; gap: 0.75rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #f3f4f6; }
    .btn-aceitar {
      flex: 1; padding: 0.65rem; background: #f0fdf4; color: #16a34a;
      border: 1.5px solid #86efac; border-radius: 8px; cursor: pointer; font-weight: 600; transition: background 0.2s;
    }
    .btn-aceitar:hover { background: #dcfce7; }
    .btn-recusar {
      flex: 1; padding: 0.65rem; background: #fef2f2; color: #dc2626;
      border: 1.5px solid #fca5a5; border-radius: 8px; cursor: pointer; font-weight: 600; transition: background 0.2s;
    }
    .btn-recusar:hover { background: #fee2e2; }
    .btn-avaliar {
      flex: 1; padding: 0.65rem; background: #fffbeb; color: #d97706;
      border: 1.5px solid #fcd34d; border-radius: 8px; cursor: pointer; font-weight: 600; transition: background 0.2s;
    }
    .btn-avaliar:hover { background: #fef3c7; }
    .btn-chat {
      flex: 1; padding: 0.65rem; background: #eff6ff; color: #2563eb;
      border: 1.5px solid #93c5fd; border-radius: 8px; text-decoration: none;
      text-align: center; font-weight: 700;
    }
    .ja-avaliado {
      margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #f3f4f6;
      font-size: 0.85rem; color: #16a34a; font-weight: 600;
    }
    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.45);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
    }
    .modal {
      background: #fff; border-radius: 18px; padding: 0; width: 100%; max-width: 480px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2); overflow: hidden;
    }
    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1.25rem 1.5rem; border-bottom: 1px solid #f3f4f6;
    }
    .modal-header h2 { font-size: 1.1rem; font-weight: 800; color: #111827; margin: 0; }
    .btn-fechar {
      background: none; border: none; font-size: 1.1rem; cursor: pointer;
      color: #9ca3af; padding: 0.25rem 0.5rem; border-radius: 6px;
    }
    .btn-fechar:hover { background: #f3f4f6; color: #374151; }
    .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
    .modal-sub { margin: 0; font-size: 0.95rem; color: #374151; }
    .field { display: flex; flex-direction: column; gap: 0.4rem; }
    label { font-size: 0.85rem; font-weight: 600; color: #374151; }
    .estrelas { display: flex; gap: 0.25rem; }
    .estrela {
      font-size: 2rem; cursor: pointer; color: #d1d5db; transition: color 0.15s; line-height: 1;
    }
    .estrela.ativa { color: #f59e0b; }
    .nota-label { font-size: 0.85rem; color: #6b7280; min-height: 1.2em; }
    textarea {
      padding: 0.75rem 1rem; border: 1.5px solid #e5e7eb; border-radius: 10px;
      font-size: 0.95rem; outline: none; resize: vertical; font-family: inherit;
      transition: border-color 0.2s;
    }
    textarea:focus { border-color: #f97316; }
    textarea.invalido { border-color: #ef4444; background: #fef2f2; }
    .erro-campo { font-size: 0.78rem; color: #ef4444; }
    .modal-actions { display: flex; gap: 0.75rem; padding-top: 0.5rem; }
    .btn-cancelar {
      flex: 1; padding: 0.75rem; background: #f9fafb; color: #374151;
      border: 1.5px solid #e5e7eb; border-radius: 10px; cursor: pointer; font-weight: 600;
    }
    .btn-cancelar:hover { background: #f3f4f6; }
    .btn-enviar {
      flex: 2; padding: 0.75rem; background: #f97316; color: #fff;
      border: none; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 0.95rem;
      transition: background 0.2s;
    }
    .btn-enviar:hover:not(:disabled) { background: #ea6009; }
    .btn-enviar:disabled { opacity: 0.6; cursor: not-allowed; }
  `]
})
export class PropostasComponent implements OnInit {
  recebidas: Proposta[] = [];
  enviadas: Proposta[] = [];
  aba: 'recebidas' | 'enviadas' = 'recebidas';
  carregando = true;

  // Avaliação
  modalAberto = false;
  propostaAtual: Proposta | null = null;
  nomeAvaliado = '';
  avaliadoId = '';
  notaSelecionada = 0;
  hoveredStar = 0;
  enviandoAvaliacao = false;
  formAvaliacao: FormGroup;
  jaAvaliado: Record<string, boolean> = {};

  get listaAtual() { return this.aba === 'recebidas' ? this.recebidas : this.enviadas; }

  statusLabel(s: string) {
    return { pendente: '⏳ Pendente', aceita: '✅ Aceita', recusada: '❌ Recusada' }[s] ?? s;
  }

  notaLabel(n: number): string {
    return ['', 'Péssimo 😞', 'Ruim 😐', 'Ok 😊', 'Bom 😄', 'Excelente 🤩'][n] ?? '';
  }

  constructor(
    private produtoService: ProdutoService,
    private auth: AuthService,
    private fb: FormBuilder
  ) {
    this.formAvaliacao = this.fb.group({
      comentario: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit() {
    const id = this.auth.getId();
    this.produtoService.getPropostasRecebidas(id).subscribe(p => {
      this.recebidas = p;
      this.carregando = false;
      this.verificarAvaliacoes(p, id);
    });
    this.produtoService.getPropostasEnviadas(id).subscribe(p => {
      this.enviadas = p;
      this.verificarAvaliacoes(p, id);
    });
  }

  verificarAvaliacoes(propostas: Proposta[], meuId: string) {
    propostas.filter(p => p.status === 'aceita').forEach(p => {
      this.produtoService.getAvaliacaoPorProposta(p.id!, meuId).subscribe(avs => {
        if (avs.length > 0) this.jaAvaliado[p.id!] = true;
      });
    });
  }

  responder(id: string, status: 'aceita' | 'recusada') {
    this.produtoService.atualizarProposta(id, { status }).subscribe(() => {
      const p = this.recebidas.find(x => x.id === id);
      if (p) {
        p.status = status;
        this.produtoService.criarNotificacao({
          usuarioId: p.remetenteId,
          tipo: 'status',
          titulo: status === 'aceita' ? 'Proposta aceita' : 'Proposta recusada',
          mensagem: `${p.destinatario} ${status === 'aceita' ? 'aceitou' : 'recusou'} sua proposta por "${p.produtoDesejado}".`,
          link: '/app/propostas',
          lida: false,
          criadaEm: new Date().toISOString()
        }).subscribe();
      }
    });
  }

  abrirModal(proposta: Proposta) {
    this.propostaAtual = proposta;
    const meuId = this.auth.getId();
    // Quem vou avaliar? o outro lado da troca
    if (proposta.remetenteId === meuId) {
      this.nomeAvaliado = proposta.destinatario ?? '';
      this.avaliadoId = proposta.destinatarioId;
    } else {
      this.nomeAvaliado = proposta.remetente ?? '';
      this.avaliadoId = proposta.remetenteId;
    }
    this.notaSelecionada = 0;
    this.hoveredStar = 0;
    this.formAvaliacao.reset();
    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
    this.propostaAtual = null;
  }

  selecionarNota(n: number) {
    this.notaSelecionada = n;
  }

  enviarAvaliacao() {
    if (this.formAvaliacao.invalid || this.notaSelecionada === 0) {
      this.formAvaliacao.markAllAsTouched();
      return;
    }
    const meuId = this.auth.getId();
    const usuario = this.auth.getUsuario();
    this.enviandoAvaliacao = true;

    const avaliacao: import('../../models/produto.model').Avaliacao = {
      propostaId: this.propostaAtual!.id!,
      autorId: meuId,
      autorNome: usuario?.nome ?? '',
      autorAvatar: usuario?.avatar ?? '',
      avaliadoId: this.avaliadoId,
      nota: this.notaSelecionada,
      comentario: this.formAvaliacao.value.comentario,
      criadaEm: new Date().toISOString()
    };

    this.produtoService.criarAvaliacao(avaliacao).subscribe(() => {
      this.produtoService.recalcularMediaAvaliacao(this.avaliadoId).subscribe(() => {
        this.jaAvaliado[this.propostaAtual!.id!] = true;
        this.enviandoAvaliacao = false;
        this.fecharModal();
      });
    });
  }
}
