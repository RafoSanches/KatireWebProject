import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface PontoSeguro {
  nome: string;
  regiao: string;
  buscaMapa: string;
}

@Component({
  selector: 'app-pontos-seguros',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <section class="hero">
        <div>
          <span class="eyebrow">Segurança em primeiro lugar</span>
          <h1>Pontos Seguros para Troca</h1>
          <p>Para sua segurança, prefira realizar trocas em locais públicos,
            movimentados e próximos a bases policiais.</p>
        </div>
        <div class="shield" aria-hidden="true">✓</div>
      </section>

      <section class="safety">
        <strong>Antes de sair para a troca</strong>
        <div class="safety-grid">
          <span><b>01</b> Combine durante o dia</span>
          <span><b>02</b> Avise alguém de confiança</span>
          <span><b>03</b> Não encontre em local isolado</span>
          <span><b>04</b> Confira o produto no ponto</span>
        </div>
      </section>

      <div class="section-title">
        <div>
          <span class="eyebrow">Belo Horizonte</span>
          <h2>Bases policiais de referência</h2>
          <p>Use os links para localizar a região e confirme o funcionamento antes de sair.</p>
        </div>
        <button class="suggest-button" (click)="formularioAberto = !formularioAberto">
          + Sugerir novo ponto seguro
        </button>
      </div>

      <form class="suggest-form" *ngIf="formularioAberto" [formGroup]="sugestaoForm" (ngSubmit)="enviarSugestao()">
        <div>
          <label>Nome do ponto</label>
          <input formControlName="nome" placeholder="Ex: base policial ou equipamento público"
            [class.invalid]="c('nome').invalid && c('nome').touched">
          <small class="field-error" *ngIf="c('nome').invalid && c('nome').touched">
            Informe pelo menos 3 caracteres.
          </small>
        </div>
        <div>
          <label>Bairro ou região</label>
          <input formControlName="regiao" placeholder="Ex: Barreiro"
            [class.invalid]="c('regiao').invalid && c('regiao').touched">
          <small class="field-error" *ngIf="c('regiao').invalid && c('regiao').touched">
            Informe pelo menos 2 caracteres.
          </small>
        </div>
        <button type="submit" [disabled]="sugestaoForm.invalid">Enviar sugestão</button>
      </form>
      <div class="success" *ngIf="mensagemSucesso">{{ mensagemSucesso }}</div>

      <div class="grid">
        <article class="card" *ngFor="let ponto of pontos; let i = index">
          <div class="card-top">
            <span class="pin">⌖</span>
            <span class="number">{{ (i + 1).toString().padStart(2, '0') }}</span>
          </div>
          <span class="type">Base policial de referência</span>
          <h3>{{ ponto.nome }}</h3>
          <p>{{ ponto.regiao }}</p>
          <div class="warning">
            <span>!</span>
            <strong>Confirme o funcionamento antes de ir</strong>
          </div>
          <a [href]="mapaUrl(ponto)" target="_blank" rel="noopener noreferrer">
            Ver no mapa <span>↗</span>
          </a>
        </article>
      </div>

      <section class="notice">
        <div class="notice-icon">!</div>
        <div>
          <h2>O local ajuda, mas seus cuidados são essenciais.</h2>
          <p>Faça a troca em área pública, iluminada e com movimento. Prefira o período
            diurno, não aceite mudanças para endereços isolados e não compartilhe seu
            endereço residencial. Estes pontos são referências de região, não garantia
            de atendimento permanente.</p>
          <a href="https://www.policiamilitar.mg.gov.br/" target="_blank"
            rel="noopener noreferrer">Consultar canais oficiais da PMMG ↗</a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .page { width:100%; max-width:1380px; padding:2rem clamp(1rem,3vw,3rem) 3rem; }
    .hero { position:relative; overflow:hidden; min-height:250px; padding:clamp(1.8rem,4vw,3rem);
      display:flex; align-items:flex-end; justify-content:space-between; gap:2rem;
      border-radius:24px; color:#fff; background:#0d0d0d; }
    .hero::after { content:""; position:absolute; width:370px; height:370px; right:-110px;
      top:-210px; border:78px solid rgba(255,106,0,.24); border-radius:50%; }
    .hero>div { position:relative; z-index:1; }
    .eyebrow { color:#ff6a00; font-size:.68rem; font-weight:900; letter-spacing:.14em; text-transform:uppercase; }
    h1 { max-width:720px; margin:.8rem 0; font-size:clamp(2.2rem,4.3vw,4rem); line-height:1; letter-spacing:-.05em; }
    .hero p { max-width:650px; color:#b1b1b1; line-height:1.65; }
    .shield { width:92px; height:104px; display:grid; place-items:center; border:3px solid #ff6a00;
      border-radius:28px 28px 45px 45px; color:#ff6a00; font-size:2.4rem; font-weight:900; }
    .safety { margin:1rem 0 2rem; padding:1rem 1.2rem; border:1px solid var(--border);
      border-radius:15px; background:var(--surface); }
    .safety>strong { display:block; margin-bottom:.75rem; color:var(--text); }
    .safety-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:.7rem; }
    .safety-grid span { padding:.75rem; border-radius:10px; color:var(--text-soft);
      background:var(--surface-muted); font-size:.76rem; font-weight:700; }
    .safety-grid b { margin-right:.4rem; color:#ff6a00; }
    .section-title { display:flex; align-items:flex-end; justify-content:space-between; gap:1rem; margin-bottom:1rem; }
    h2 { margin:.35rem 0; color:var(--text); font-size:1.35rem; }
    .section-title p { margin:0; color:var(--text-muted); font-size:.8rem; }
    .suggest-button,.suggest-form button { min-height:44px; padding:.7rem 1rem; border:0;
      border-radius:10px; color:#fff; background:#ff6a00; font-weight:900; cursor:pointer; }
    .suggest-form { margin-bottom:1rem; padding:1rem; display:grid; grid-template-columns:1fr 1fr auto;
      align-items:end; gap:.75rem; border:1px solid var(--border); border-radius:14px; background:var(--surface); }
    .suggest-form div { display:flex; flex-direction:column; gap:.35rem; }
    label { color:var(--text-muted); font-size:.65rem; font-weight:900; letter-spacing:.08em; text-transform:uppercase; }
    input { min-height:44px; padding:.7rem; border:1px solid var(--border); border-radius:9px;
      color:var(--text); background:var(--surface-muted); }
    input.invalid { border-color:#ef4444; background:#fef2f2; }
    .field-error { color:#dc2626; font-size:.68rem; }
    .suggest-form button:disabled { opacity:.55; cursor:not-allowed; }
    .success { margin-bottom:1rem; padding:.8rem; border-radius:10px; color:#166534; background:#dcfce7; }
    .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(245px,1fr)); gap:1rem; }
    .card { padding:1.2rem; border:1px solid var(--border); border-radius:17px;
      background:var(--surface); box-shadow:var(--shadow-sm); transition:transform .2s,border-color .2s; }
    .card:hover { transform:translateY(-4px); border-color:#ffad73; }
    .card-top { display:flex; align-items:center; justify-content:space-between; }
    .pin { width:42px; height:42px; display:grid; place-items:center; border-radius:11px;
      color:#fff; background:#0d0d0d; font-size:1.25rem; font-weight:900; }
    .number { color:#d4d4d8; font-size:1.5rem; font-weight:900; }
    .type { display:block; margin-top:1rem; color:#ff6a00; font-size:.58rem;
      font-weight:900; letter-spacing:.1em; text-transform:uppercase; }
    h3 { min-height:44px; margin:.45rem 0 .2rem; color:var(--text); font-size:1rem; }
    .card>p { margin:0; color:var(--text-muted); font-size:.76rem; }
    .warning { margin:1rem 0; padding:.65rem; display:flex; align-items:center; gap:.5rem;
      border-radius:9px; color:#8a4b00; background:#fff3d6; font-size:.64rem; }
    .warning span { width:20px; height:20px; display:grid; place-items:center; border-radius:50%;
      color:#fff; background:#ff6a00; font-weight:900; }
    .card>a { display:flex; align-items:center; justify-content:space-between; padding-top:.75rem;
      border-top:1px solid var(--border); color:#ff6a00; text-decoration:none; font-size:.72rem; font-weight:900; }
    .notice { margin-top:1.5rem; padding:1.4rem; display:flex; gap:1rem; border-radius:17px;
      color:#fff; background:#0d0d0d; }
    .notice-icon { width:44px; height:44px; flex:0 0 44px; display:grid; place-items:center;
      border:2px solid #ff6a00; border-radius:12px; color:#ff6a00; font-weight:900; }
    .notice h2 { margin:0 0 .5rem; color:#fff; }
    .notice p { margin:0; color:#aaa; font-size:.78rem; line-height:1.6; }
    .notice a { display:inline-block; margin-top:.8rem; color:#ff6a00; text-decoration:none; font-size:.72rem; font-weight:900; }
    @media(max-width:850px) { .safety-grid { grid-template-columns:1fr 1fr; }
      .section-title { align-items:flex-start; flex-direction:column; } .suggest-form { grid-template-columns:1fr; } }
    @media(max-width:600px) { .page { padding:1rem; } .hero { min-height:300px; align-items:flex-start; flex-direction:column; }
      .shield { width:65px; height:72px; font-size:1.7rem; } .safety-grid { grid-template-columns:1fr; }
      .notice { flex-direction:column; } }
  `]
})
export class PontosSegurosComponent {
  formularioAberto = false;
  mensagemSucesso = '';
  sugestaoForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.sugestaoForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      regiao: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  c(nome: string) {
    return this.sugestaoForm.get(nome)!;
  }

  pontos: PontoSeguro[] = [
    { nome: 'Base Comunitária Nova Suíça', regiao: 'Nova Suíça · Região Oeste', buscaMapa: 'Base Comunitária Polícia Militar Nova Suíça Belo Horizonte MG' },
    { nome: 'Base Comunitária Rua Sapucaí', regiao: 'Floresta · Região Leste', buscaMapa: 'Base Comunitária Polícia Militar Rua Sapucaí Floresta Belo Horizonte MG' },
    { nome: 'Base Comunitária Estoril / Buritis', regiao: 'Estoril e Buritis · Região Oeste', buscaMapa: 'Base Comunitária Polícia Militar Estoril Buritis Belo Horizonte MG' },
    { nome: 'Base Comunitária Nazaré', regiao: 'Nazaré · Região Nordeste', buscaMapa: 'Base Comunitária Polícia Militar Nazaré Belo Horizonte MG' },
    { nome: 'Base Comunitária Guarani', regiao: 'Guarani · Região Norte', buscaMapa: 'Base Comunitária Polícia Militar Guarani Belo Horizonte MG' },
    { nome: 'Base Comunitária Av. Afonso Pena', regiao: 'Avenida Afonso Pena · Centro-Sul', buscaMapa: 'Base Comunitária Polícia Militar Avenida Afonso Pena Belo Horizonte MG' },
    { nome: 'Base Comunitária Pampulha', regiao: 'Pampulha', buscaMapa: 'Base Comunitária Polícia Militar Pampulha Belo Horizonte MG' },
    { nome: 'Base Comunitária Carlos Prates', regiao: 'Carlos Prates · Região Noroeste', buscaMapa: 'Base Comunitária Polícia Militar Carlos Prates Belo Horizonte MG' },
    { nome: 'Base Comunitária Padre Eustáquio', regiao: 'Padre Eustáquio · Região Noroeste', buscaMapa: 'Base Comunitária Polícia Militar Padre Eustáquio Belo Horizonte MG' },
    { nome: 'Base Comunitária Ouro Preto', regiao: 'Ouro Preto · Região Pampulha', buscaMapa: 'Base Comunitária Polícia Militar Ouro Preto Belo Horizonte MG' }
  ];

  mapaUrl(ponto: PontoSeguro) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ponto.buscaMapa)}`;
  }

  enviarSugestao() {
    if (this.sugestaoForm.invalid) {
      this.sugestaoForm.markAllAsTouched();
      return;
    }
    this.mensagemSucesso = 'Sugestão registrada para análise da equipe Katire.';
    this.sugestaoForm.reset();
    this.formularioAberto = false;
  }
}
