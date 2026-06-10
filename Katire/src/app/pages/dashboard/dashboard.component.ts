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
        <h1>Dashboard</h1>
        <p>Olá, {{ auth.usuarioAtual()?.nome }}! Aqui está um resumo da sua atividade.</p>
      </div>

      <div class="stats">
        <div class="stat-card"><span>📦</span><div><strong>{{ meusAnuncios.length }}</strong><small>Anúncios ativos</small></div></div>
        <div class="stat-card"><span>📬</span><div><strong>{{ propostasRecebidas.length }}</strong><small>Propostas recebidas</small></div></div>
        <div class="stat-card"><span>✅</span><div><strong>{{ trocas.length }}</strong><small>Trocas realizadas</small></div></div>
        <div class="stat-card"><span>⭐</span><div><strong>{{ auth.getUsuario()?.avaliacoes || 0 | number:'1.1-1' }}</strong><small>Reputação</small></div></div>
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
            <img [src]="a.fotos[0]" [alt]="a.titulo" />
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
    .page { padding:2rem; max-width:1180px; }
    .page-header { margin-bottom:1.5rem; }
    h1 { margin:0; font-size:1.75rem; color:#111827; }
    p { margin:.25rem 0 0; color:#6b7280; font-size:.88rem; }
    .stats { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:1.5rem; }
    .stat-card { background:#fff; border:1px solid #f3f4f6; border-radius:14px; padding:1.1rem; display:flex; align-items:center; gap:.85rem; box-shadow:0 2px 8px rgba(0,0,0,.04); }
    .stat-card>span { width:44px; height:44px; border-radius:12px; display:grid; place-items:center; background:#fff7ed; font-size:1.35rem; }
    .stat-card div { display:flex; flex-direction:column; }
    .stat-card strong { color:#f97316; font-size:1.7rem; line-height:1; }
    .stat-card small { color:#6b7280; margin-top:.25rem; }
    .charts,.sections { display:grid; grid-template-columns:1.25fr 1fr; gap:1rem; margin-bottom:1rem; }
    .sections { grid-template-columns:1fr 1fr; }
    .section { background:#fff; border:1px solid #f3f4f6; border-radius:14px; padding:1.25rem; min-width:0; }
    .section-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem; }
    h2 { margin:0; font-size:1rem; color:#111827; }
    .section-header p { font-size:.78rem; }
    .btn-sm { background:#f97316; color:#fff; border-radius:8px; padding:.4rem .75rem; text-decoration:none; font-size:.78rem; font-weight:700; }
    .link { color:#f97316; text-decoration:none; font-size:.8rem; font-weight:700; }
    .bar-chart { height:200px; display:flex; align-items:stretch; gap:.65rem; padding-top:.5rem; }
    .bar-column { flex:1; min-width:0; display:flex; flex-direction:column; align-items:center; }
    .bar-value { height:22px; font-size:.75rem; font-weight:800; color:#6b7280; }
    .bar-track { flex:1; width:min(34px,70%); background:#f3f4f6; border-radius:8px 8px 3px 3px; display:flex; align-items:flex-end; overflow:hidden; }
    .bar { width:100%; min-height:3px; background:linear-gradient(#fb923c,#f97316); border-radius:8px 8px 3px 3px; }
    .bar-column small { margin-top:.5rem; color:#9ca3af; font-size:.7rem; white-space:nowrap; }
    .ranking { display:flex; flex-direction:column; gap:.9rem; }
    .rank-item { display:grid; grid-template-columns:28px 1fr 24px; gap:.65rem; align-items:center; }
    .posicao { width:26px; height:26px; border-radius:50%; background:#fff7ed; color:#f97316; display:grid; place-items:center; font-size:.75rem; font-weight:800; }
    .rank-item div strong { font-size:.82rem; color:#374151; }
    .progress { height:6px; background:#f3f4f6; border-radius:4px; margin-top:.35rem; overflow:hidden; }
    .progress span { display:block; height:100%; background:#f97316; border-radius:4px; }
    .rank-item b { color:#f97316; }
    .anuncio-item,.troca-item { display:flex; align-items:center; gap:.75rem; padding:.7rem; border-radius:10px; text-decoration:none; color:inherit; background:#f9fafb; margin-top:.6rem; }
    .anuncio-item:hover,.troca-item:hover { background:#fff7ed; }
    .anuncio-item img { width:45px; height:45px; border-radius:8px; object-fit:cover; }
    .anuncio-item div,.troca-item div { display:flex; flex-direction:column; min-width:0; }
    .anuncio-item strong,.troca-item strong { color:#111827; font-size:.84rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .anuncio-item span,.troca-item small { color:#9ca3af; font-size:.75rem; }
    .troca-item>span { color:#f97316; font-size:1.35rem; font-weight:800; }
    .empty-section { color:#9ca3af; font-size:.85rem; padding:1rem 0; }
    @media (max-width:900px) { .stats { grid-template-columns:repeat(2,1fr); } .charts,.sections { grid-template-columns:1fr; } }
    @media (max-width:520px) { .page { padding:1rem; } .stats { gap:.65rem; } .stat-card { padding:.85rem; } .stat-card>span { display:none; } }
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
