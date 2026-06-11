import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ProdutoService } from '../../services/produto.service';
import { AuthService } from '../../services/auth.service';
import { Produto, Proposta } from '../../models/produto.model';

interface Barra {
  label: string;
  valor: number;
  percentual: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <span class="eyebrow">Do corre para o sucesso</span>
          <h1>Olá, {{ auth.usuarioAtual()?.nome?.split(' ')?.[0] }}.</h1>
          <p>Seus anúncios, conexões e resultados em um só lugar.</p>
        </div>
        <a routerLink="/app/anunciar" class="btn-primary">＋ Novo anúncio</a>
      </div>

      <div class="stats">
        <div class="stat-card"><span>AN</span><div><small>Anúncios ativos</small><strong>{{ meusAnuncios.length }}</strong><b>Itens publicados</b></div></div>
        <div class="stat-card"><span>PR</span><div><small>Propostas recebidas</small><strong>{{ propostasRecebidas.length }}</strong><b>Oportunidades</b></div></div>
        <div class="stat-card"><span>TR</span><div><small>Trocas realizadas</small><strong>{{ trocas.length }}</strong><b>Negócios concluídos</b></div></div>
        <div class="stat-card featured"><span>RP</span><div><small>Reputação</small><strong>{{ auth.getUsuario()?.avaliacoes || 0 | number:'1.1-1' }}</strong><b>Avaliação da comunidade</b></div></div>
      </div>

      <div class="charts">
        <section class="section">
          <div class="section-header">
            <div><h2>Propostas por mês</h2><p>Volume de propostas recebidas e enviadas</p></div>
          </div>
          <div class="bar-chart">
            <div class="bar-column" *ngFor="let item of propostasPorMes">
              <span class="bar-value">{{ item.valor }}</span>
              <div class="bar-track"><div class="bar" [style.height.%]="item.percentual"></div></div>
              <small>{{ item.label }}</small>
            </div>
          </div>
        </section>

        <section class="section">
          <div class="section-header">
            <div><h2>Categorias mais trocadas</h2><p>Ranking das trocas concluídas</p></div>
          </div>
          <div class="ranking" *ngIf="categoriasTrocadas.length; else semCategorias">
            <div class="rank-item" *ngFor="let item of categoriasTrocadas; let i = index">
              <span class="posicao">{{ i + 1 }}</span>
              <div><strong>{{ item.label }}</strong><div class="progress"><span [style.width.%]="item.percentual"></span></div></div>
              <b>{{ item.valor }}</b>
            </div>
          </div>
          <ng-template #semCategorias><div class="empty-section">Aceite propostas para formar o ranking.</div></ng-template>
        </section>
      </div>

      <div class="sections">
        <section class="section">
          <div class="section-header">
            <h2>Meus anúncios</h2>
            <a routerLink="/app/anunciar" class="btn-sm">+ Novo</a>
          </div>
          <div *ngIf="meusAnuncios.length === 0" class="empty-section">Nenhum anúncio ainda.</div>
          <a [routerLink]="['/app/produtos', a.id]" class="anuncio-item" *ngFor="let a of meusAnuncios.slice(0, 4)">
            <img *ngIf="a.fotos.length; else semFoto" [src]="a.fotos[0]" [alt]="a.titulo" />
            <ng-template #semFoto><span class="mini-placeholder">▧</span></ng-template>
            <div><strong>{{ a.titulo }}</strong><span>{{ a.categoria }}</span></div>
          </a>
        </section>

        <section class="section">
          <div class="section-header">
            <h2>Histórico de trocas</h2>
            <a routerLink="/app/propostas" class="link">Ver propostas</a>
          </div>
          <div *ngIf="trocas.length === 0" class="empty-section">Nenhuma troca concluída ainda.</div>
          <a [routerLink]="['/app/chat', p.id]" class="troca-item" *ngFor="let p of trocas.slice(0, 5)">
            <span>⇄</span>
            <div>
              <strong>{{ p.produtoOfertado }} por {{ p.produtoDesejado }}</strong>
              <small>{{ p.criadaEm | date:'dd/MM/yyyy' }} · abrir conversa</small>
            </div>
          </a>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .page { width:100%; max-width:1380px; padding:2rem clamp(1rem,3vw,3rem) 3rem; }
    .page-header { position:relative; overflow:hidden; min-height:190px; margin-bottom:1.2rem; padding:2rem; display:flex; align-items:flex-end; justify-content:space-between; gap:1.5rem; border-radius:22px; color:#fff; background:#111; }
    .page-header::after { content:""; position:absolute; width:300px; height:300px; right:-90px; top:-180px; border:65px solid rgba(255,107,0,.25); border-radius:50%; }
    .page-header>div,.page-header>a { position:relative; z-index:1; }
    .eyebrow { color:#ff7a1a; font-size:.68rem; font-weight:900; letter-spacing:.12em; text-transform:uppercase; }
    h1 { margin:.5rem 0 .25rem; color:#fff; font-size:clamp(2rem,4vw,3.4rem); letter-spacing:-.05em; }
    p { margin:.25rem 0 0; color:var(--text-muted); font-size:.82rem; }
    .page-header p { color:#a1a1aa; }
    .stats { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:1.5rem; }
    .stat-card { position:relative; overflow:hidden; min-height:138px; padding:1.1rem; display:flex; align-items:flex-start; gap:.85rem; border:1px solid var(--border); border-radius:16px; background:var(--surface); box-shadow:var(--shadow-sm); }
    .stat-card>span { width:38px; height:38px; flex-shrink:0; border-radius:10px; display:grid; place-items:center; color:var(--accent); background:var(--accent-soft); font-size:.62rem; font-weight:900; letter-spacing:.05em; }
    .stat-card div { display:flex; flex-direction:column; }
    .stat-card strong { margin:.4rem 0 .28rem; color:var(--text); font-size:2rem; line-height:1; letter-spacing:-.04em; }
    .stat-card small { color:var(--text-muted); font-size:.68rem; font-weight:750; }
    .stat-card b { color:var(--text-muted); font-size:.61rem; font-weight:550; }
    .stat-card.featured { color:#fff; border-color:#111; background:#111; }
    .stat-card.featured strong { color:#fff; }
    .stat-card.featured small,.stat-card.featured b { color:#a1a1aa; }
    .charts,.sections { display:grid; grid-template-columns:1.25fr 1fr; gap:1rem; margin-bottom:1rem; }
    .sections { grid-template-columns:1fr 1fr; }
    .section { min-width:0; padding:1.25rem; border:1px solid var(--border); border-radius:16px; background:var(--surface); box-shadow:var(--shadow-sm); }
    .section-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem; }
    h2 { margin:0; color:var(--text); font-size:.94rem; }
    .section-header p { font-size:.78rem; }
    .btn-sm { padding:.42rem .72rem; border-radius:8px; color:#fff; background:var(--accent); text-decoration:none; font-size:.7rem; font-weight:800; }
    .link { color:var(--accent); text-decoration:none; font-size:.72rem; font-weight:800; }
    .bar-chart { height:200px; display:flex; align-items:stretch; gap:.65rem; padding-top:.5rem; }
    .bar-column { flex:1; min-width:0; display:flex; flex-direction:column; align-items:center; }
    .bar-value { height:22px; color:var(--text-muted); font-size:.7rem; font-weight:800; }
    .bar-track { flex:1; width:min(34px,70%); background:var(--surface-muted); border-radius:8px 8px 3px 3px; display:flex; align-items:flex-end; overflow:hidden; }
    .bar { width:100%; min-height:3px; background:linear-gradient(#ff9a52,#ff6b00); border-radius:8px 8px 3px 3px; }
    .bar-column small { margin-top:.5rem; color:var(--text-muted); font-size:.66rem; white-space:nowrap; }
    .ranking { display:flex; flex-direction:column; gap:.9rem; }
    .rank-item { display:grid; grid-template-columns:28px 1fr 24px; gap:.65rem; align-items:center; }
    .posicao { width:26px; height:26px; border-radius:8px; background:var(--accent-soft); color:var(--accent); display:grid; place-items:center; font-size:.68rem; font-weight:900; }
    .rank-item div strong { color:var(--text-soft); font-size:.76rem; }
    .progress { height:6px; margin-top:.35rem; overflow:hidden; border-radius:4px; background:var(--surface-muted); }
    .progress span { display:block; height:100%; border-radius:4px; background:var(--accent); }
    .rank-item b { color:var(--accent); font-size:.75rem; }
    .anuncio-item,.troca-item { display:flex; align-items:center; gap:.75rem; margin-top:.6rem; padding:.7rem; border:1px solid transparent; border-radius:10px; color:inherit; background:var(--surface-muted); text-decoration:none; transition:border-color .2s,transform .2s; }
    .anuncio-item:hover,.troca-item:hover { transform:translateX(2px); border-color:#ffb37c; }
    .anuncio-item img { width:45px; height:45px; border-radius:8px; object-fit:cover; }
    .mini-placeholder { width:45px; height:45px; border-radius:8px; display:grid; place-items:center; background:#e4e4e7; color:#71717a; font-size:1.2rem; flex-shrink:0; }
    .anuncio-item div,.troca-item div { display:flex; flex-direction:column; min-width:0; }
    .anuncio-item strong,.troca-item strong { overflow:hidden; color:var(--text); font-size:.78rem; text-overflow:ellipsis; white-space:nowrap; }
    .anuncio-item span,.troca-item small { color:var(--text-muted); font-size:.68rem; }
    .troca-item>span { color:var(--accent); font-size:1.35rem; font-weight:800; }
    .empty-section { padding:1rem 0; color:var(--text-muted); font-size:.78rem; }
    @media (max-width:900px) { .stats { grid-template-columns:repeat(2,1fr); } .charts,.sections { grid-template-columns:1fr; } }
    @media (max-width:620px) {
      .page { padding:1rem; }
      .page-header { min-height:230px; align-items:flex-start; flex-direction:column; }
      .stats { gap:.65rem; }
      .stat-card { min-height:120px; padding:.85rem; }
      .stat-card>span { display:none; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  meusAnuncios: Produto[] = [];
  produtos: Produto[] = [];
  propostasRecebidas: Proposta[] = [];
  propostasEnviadas: Proposta[] = [];
  propostasPorMes: Barra[] = [];
  categoriasTrocadas: Barra[] = [];

  get todasPropostas() {
    return [...new Map([...this.propostasRecebidas, ...this.propostasEnviadas].map(p => [p.id, p])).values()];
  }

  get trocas() {
    return this.todasPropostas.filter(p => p.status === 'aceita')
      .sort((a, b) => new Date(b.criadaEm ?? 0).getTime() - new Date(a.criadaEm ?? 0).getTime());
  }

  constructor(private service: ProdutoService, public auth: AuthService) {}

  ngOnInit() {
    const id = this.auth.getId();
    forkJoin({
      anuncios: this.service.getProdutosPorUsuario(id),
      produtos: this.service.getProdutos(),
      recebidas: this.service.getPropostasRecebidas(id),
      enviadas: this.service.getPropostasEnviadas(id)
    }).subscribe(dados => {
      this.meusAnuncios = dados.anuncios;
      this.produtos = dados.produtos;
      this.propostasRecebidas = dados.recebidas;
      this.propostasEnviadas = dados.enviadas;
      this.montarGraficos();
    });
  }

  private montarGraficos() {
    const propostas = this.todasPropostas;
    const datas = propostas.map(p => new Date(p.criadaEm ?? Date.now()));
    const referencia = datas.length
      ? new Date(Math.max(...datas.map(d => d.getTime())))
      : new Date();
    const meses: { chave: string; label: string; valor: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const data = new Date(referencia.getFullYear(), referencia.getMonth() - i, 1);
      meses.push({
        chave: `${data.getFullYear()}-${data.getMonth()}`,
        label: data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        valor: 0
      });
    }
    propostas.forEach(p => {
      const data = new Date(p.criadaEm ?? 0);
      const item = meses.find(m => m.chave === `${data.getFullYear()}-${data.getMonth()}`);
      if (item) item.valor++;
    });
    const maxMes = Math.max(1, ...meses.map(m => m.valor));
    this.propostasPorMes = meses.map(m => ({ label: m.label, valor: m.valor, percentual: m.valor / maxMes * 100 }));

    const produtoPorId = new Map(this.produtos.map(p => [p.id, p]));
    const contagem = new Map<string, number>();
    this.trocas.forEach(troca => {
      const categoria = produtoPorId.get(troca.produtoDesejadoId)?.categoria ?? 'Outros';
      contagem.set(categoria, (contagem.get(categoria) ?? 0) + 1);
    });
    const ranking = [...contagem.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const maxCategoria = Math.max(1, ...ranking.map(([, valor]) => valor));
    this.categoriasTrocadas = ranking.map(([label, valor]) => ({
      label, valor, percentual: valor / maxCategoria * 100
    }));
  }
}
