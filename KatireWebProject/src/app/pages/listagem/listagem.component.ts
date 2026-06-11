import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, startWith } from 'rxjs';
import { ProdutoService } from '../../services/produto.service';
import { AuthService } from '../../services/auth.service';
import { Produto, CATEGORIAS, CONDICOES, Favorito } from '../../models/produto.model';

@Component({
  selector: 'app-listagem',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page">
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">Da quebrada para o mundo</span>
          <h1>Negócios que movem histórias.</h1>
          <p>Encontre oportunidades, faça sua proposta e transforme o corre em crescimento.</p>
        </div>
        <div class="hero-side">
          <div class="hero-number"><strong>{{ produtos.length }}</strong><span>itens disponíveis</span></div>
          <a routerLink="/app/anunciar" class="btn-primary"><span>＋</span> Anunciar produto</a>
        </div>
      </section>

      <form class="filters" [formGroup]="filtrosForm">
        <div class="filter-title">
          <div><strong>O que você procura?</strong><span>Use a busca ou refine os resultados</span></div>
          <button type="button" class="btn-limpar" *ngIf="temFiltros" (click)="limparFiltros()">Limpar filtros</button>
        </div>
        <div class="search-box">
          <span class="search-icon">⌕</span>
          <input formControlName="busca" list="sugestoes"
            placeholder="Busque por produto, descrição ou interesse..." />
          <datalist id="sugestoes">
            <option *ngFor="let sugestao of sugestoes" [value]="sugestao"></option>
          </datalist>
        </div>
        <div class="filter-grid">
          <label><span>Categoria</span><select formControlName="categoria">
            <option value="">Todas</option>
            <option *ngFor="let c of categorias" [value]="c">{{ c }}</option>
          </select></label>
          <label><span>Condição</span><select formControlName="condicao">
            <option value="">Qualquer estado</option>
            <option *ngFor="let c of condicoes" [value]="c">{{ c }}</option>
          </select></label>
          <label><span>Cidade</span><select formControlName="cidade">
            <option value="">Todas as cidades</option>
            <option *ngFor="let cidade of cidades" [value]="cidade">{{ cidade }}</option>
          </select></label>
          <label><span>Publicado</span><select formControlName="dias">
            <option value="">Qualquer data</option>
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="365">Último ano</option>
          </select></label>
        </div>
      </form>

      <div class="results-header" *ngIf="!carregando">
        <div><strong>Produtos para trocar</strong><span>{{ produtosFiltrados.length }} resultado{{ produtosFiltrados.length === 1 ? '' : 's' }}</span></div>
        <span class="results-tag">Atualizado agora</span>
      </div>
      <div *ngIf="carregando" class="loading"><span></span>Carregando produtos...</div>
      <div *ngIf="!carregando && produtosFiltrados.length === 0" class="empty">
        <span>⌕</span><strong>Nenhum produto encontrado</strong><p>Tente remover algum filtro ou buscar por outro termo.</p>
      </div>

      <div class="grid" *ngIf="!carregando">
        <article class="card" *ngFor="let p of produtosFiltrados">
          <a [routerLink]="['/app/produtos', p.id]" class="card-link">
            <div class="card-img">
              <img *ngIf="p.fotos.length; else semFoto" [src]="p.fotos[0]" [alt]="p.titulo" />
              <ng-template #semFoto>
                <div class="sem-foto"><span>{{ p.categoria.charAt(0) }}</span><small>{{ p.categoria }}</small></div>
              </ng-template>
              <span class="badge">{{ p.condicao.replace('Usado - ', '') }}</span>
            </div>
            <div class="card-body">
              <span class="categoria">{{ p.categoria }}</span>
              <h3>{{ p.titulo }}</h3>
              <p>{{ p.descricao | slice:0:95 }}{{ p.descricao.length > 95 ? '...' : '' }}</p>
              <div class="interest"><span>Aceita</span><strong>{{ p.interesse || 'Propostas variadas' }}</strong></div>
              <div class="card-footer">
                <span class="owner">{{ p.usuario.charAt(0) }}</span>
                <div><strong>{{ p.usuario }}</strong><small>{{ p.cidade }}/{{ p.estado }}</small></div>
                <b>Ver item →</b>
              </div>
            </div>
          </a>
          <button class="favorite-btn" [class.ativo]="favoritos[p.id!]"
            (click)="alternarFavorito(p)" [title]="favoritos[p.id!] ? 'Remover dos favoritos' : 'Adicionar aos favoritos'">
            {{ favoritos[p.id!] ? '♥' : '♡' }}
          </button>
        </article>
      </div>
    </div>
  `,
  styles: [`
    .page { width:100%; max-width:1420px; padding:2rem clamp(1rem,3vw,3rem) 3rem; }
    .hero { position:relative; overflow:hidden; min-height:245px; margin-bottom:1.25rem; padding:clamp(1.6rem,4vw,3rem); display:flex; align-items:flex-end; justify-content:space-between; gap:2rem; border-radius:24px; color:#fff; background:#111; }
    .hero::before { content:""; position:absolute; width:390px; height:390px; right:-110px; top:-210px; border:80px solid rgba(255,107,0,.24); border-radius:50%; }
    .hero::after { content:""; position:absolute; width:170px; height:170px; right:250px; bottom:-120px; border:35px solid rgba(255,255,255,.05); border-radius:50%; }
    .hero-copy,.hero-side { position:relative; z-index:1; }
    .hero-copy { max-width:700px; }
    .eyebrow { color:#ff7a1a; font-size:.7rem; font-weight:900; letter-spacing:.13em; text-transform:uppercase; }
    h1 { max-width:720px; margin:.8rem 0; color:#fff; font-size:clamp(2rem,4vw,3.7rem); line-height:1.02; letter-spacing:-.05em; }
    .hero p { max-width:580px; color:#a1a1aa; line-height:1.6; }
    .hero-side { display:flex; flex-direction:column; align-items:flex-end; gap:1.1rem; }
    .hero-number { text-align:right; }
    .hero-number strong,.hero-number span { display:block; }
    .hero-number strong { color:#ff6b00; font-size:2.4rem; line-height:1; }
    .hero-number span { margin-top:.2rem; color:#a1a1aa; font-size:.72rem; }
    .filters { margin-bottom:1.6rem; padding:1.2rem; display:grid; grid-template-columns:minmax(280px,1.2fr) minmax(480px,2fr); gap:1rem; border:1px solid var(--border); border-radius:18px; background:var(--surface); box-shadow:var(--shadow-sm); }
    .filter-title { grid-column:1/-1; display:flex; align-items:center; justify-content:space-between; }
    .filter-title div { display:flex; flex-direction:column; gap:.18rem; }
    .filter-title strong { color:var(--text); font-size:.88rem; }
    .filter-title span { color:var(--text-muted); font-size:.72rem; }
    .search-box { min-height:52px; display:flex; align-items:center; gap:.65rem; padding:0 1rem; border:1.5px solid var(--border-strong); border-radius:12px; background:var(--surface-muted); }
    .search-icon { color:var(--accent); font-size:1.25rem; font-weight:900; }
    .search-box input { width:100%; border:0; outline:none; color:var(--text); background:transparent; font-size:.86rem; }
    .filter-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:.65rem; }
    .filter-grid label { display:flex; flex-direction:column; gap:.3rem; }
    .filter-grid label>span { padding-left:.15rem; color:var(--text-muted); font-size:.62rem; font-weight:800; text-transform:uppercase; letter-spacing:.07em; }
    select { width:100%; min-height:34px; padding:.45rem .55rem; border:1px solid var(--border); border-radius:9px; color:var(--text-soft); background:var(--surface-muted); outline:none; cursor:pointer; font-size:.72rem; }
    .btn-limpar { padding:.45rem .7rem; border:0; border-radius:8px; color:var(--accent); background:var(--accent-soft); font-size:.7rem; font-weight:800; cursor:pointer; }
    .results-header { margin-bottom:1rem; display:flex; align-items:flex-end; justify-content:space-between; }
    .results-header div { display:flex; flex-direction:column; gap:.2rem; }
    .results-header strong { color:var(--text); font-size:1rem; }
    .results-header div span { color:var(--text-muted); font-size:.72rem; }
    .results-tag { padding:.35rem .55rem; border:1px solid var(--border); border-radius:20px; color:var(--text-muted); background:var(--surface); font-size:.65rem; }
    .loading,.empty { min-height:220px; display:grid; place-content:center; gap:.45rem; text-align:center; color:var(--text-muted); }
    .loading span { width:28px; height:28px; margin:auto; border:3px solid var(--border); border-top-color:var(--accent); border-radius:50%; animation:girar .8s linear infinite; }
    @keyframes girar { to { transform:rotate(360deg); } }
    .empty { padding:3rem; border:1px dashed var(--border-strong); border-radius:18px; background:var(--surface); }
    .empty>span { color:var(--accent); font-size:2.5rem; font-weight:900; }
    .empty strong { color:var(--text); }
    .empty p { color:var(--text-muted); font-size:.8rem; }
    .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(270px,1fr)); gap:1rem; }
    .card { position:relative; overflow:hidden; border:1px solid var(--border); border-radius:18px; background:var(--surface); box-shadow:var(--shadow-sm); transition:transform .25s,box-shadow .25s,border-color .25s; }
    .card:hover { transform:translateY(-5px); border-color:#ffb37c; box-shadow:var(--shadow-md); }
    .card-link { text-decoration:none; color:inherit; display:block; }
    .card-img { position:relative; height:190px; overflow:hidden; background:#e4e4e7; }
    .card-img::after { content:""; position:absolute; inset:auto 0 0; height:45%; background:linear-gradient(transparent,rgba(0,0,0,.28)); pointer-events:none; }
    .card-img img { width:100%; height:100%; object-fit:cover; transition:transform .4s; }
    .card:hover .card-img img { transform:scale(1.035); }
    .sem-foto { width:100%; height:100%; display:grid; place-content:center; gap:.4rem; text-align:center; color:#71717a; background:linear-gradient(145deg,#ededee,#d8d8dc); }
    .sem-foto span { color:#b4b4ba; font-size:4rem; font-weight:900; line-height:1; }
    .sem-foto small { font-size:.65rem; font-weight:850; text-transform:uppercase; letter-spacing:.1em; }
    .badge { position:absolute; z-index:1; left:.7rem; bottom:.7rem; padding:.3rem .52rem; border:1px solid rgba(255,255,255,.15); border-radius:7px; color:#fff; background:rgba(17,17,17,.82); backdrop-filter:blur(8px); font-size:.64rem; font-weight:750; }
    .favorite-btn { position:absolute; z-index:2; top:.65rem; right:.65rem; width:38px; height:38px; border:1px solid rgba(255,255,255,.35); border-radius:11px; color:#52525b; background:rgba(255,255,255,.9); backdrop-filter:blur(8px); font-size:1.4rem; cursor:pointer; display:grid; place-items:center; box-shadow:0 4px 12px rgba(0,0,0,.14); }
    .favorite-btn.ativo { color:#fff; border-color:var(--accent); background:var(--accent); }
    .card-body { padding:1rem; }
    .categoria { color:var(--accent); font-size:.62rem; font-weight:900; letter-spacing:.1em; text-transform:uppercase; }
    .card-body h3 { min-height:42px; margin:.4rem 0 .45rem; color:var(--text); font-size:1rem; line-height:1.3; }
    .card-body>p { min-height:38px; margin:0 0 .8rem; color:var(--text-muted); font-size:.76rem; line-height:1.5; }
    .interest { margin-bottom:.8rem; padding:.55rem .65rem; display:flex; flex-direction:column; gap:.16rem; border-radius:9px; background:var(--surface-muted); }
    .interest span { color:var(--text-muted); font-size:.58rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; }
    .interest strong { overflow:hidden; color:var(--text-soft); font-size:.7rem; text-overflow:ellipsis; white-space:nowrap; }
    .card-footer { padding-top:.75rem; display:grid; grid-template-columns:32px 1fr auto; align-items:center; gap:.55rem; border-top:1px solid var(--border); }
    .owner { width:32px; height:32px; display:grid; place-items:center; border-radius:9px; color:#fff; background:#111; font-size:.72rem; font-weight:900; }
    .card-footer div { min-width:0; display:flex; flex-direction:column; }
    .card-footer strong { overflow:hidden; color:var(--text-soft); font-size:.68rem; text-overflow:ellipsis; white-space:nowrap; }
    .card-footer small { margin-top:.12rem; color:var(--text-muted); font-size:.62rem; }
    .card-footer>b { color:var(--accent); font-size:.65rem; white-space:nowrap; }
    @media (max-width:1050px) { .filters { grid-template-columns:1fr; } .filter-grid { grid-template-columns:repeat(4,1fr); } }
    @media (max-width:700px) {
      .page { padding:1rem; }
      .hero { min-height:285px; align-items:flex-start; flex-direction:column; }
      .hero-side { width:100%; align-items:flex-start; flex-direction:row; justify-content:space-between; }
      .hero-number { text-align:left; }
      .filters { padding:1rem; }
      .filter-grid { grid-template-columns:1fr 1fr; }
      .grid { grid-template-columns:1fr; }
    }
    @media (max-width:430px) { .hero-side { align-items:flex-start; flex-direction:column; } .filter-grid { grid-template-columns:1fr; } }
  `]
})
export class ListagemComponent implements OnInit {
  produtos: Produto[] = [];
  produtosFiltrados: Produto[] = [];
  favoritos: Record<string, Favorito> = {};
  filtrosForm: FormGroup;
  carregando = true;
  categorias = CATEGORIAS;
  condicoes = CONDICOES;

  get cidades() {
    return [...new Set(this.produtos.map(p => p.cidade).filter(Boolean))].sort();
  }

  get sugestoes() {
    const termos = this.produtos.flatMap(p => [p.titulo, p.categoria, ...p.interesse.split(',')]);
    return [...new Set(termos.map(t => t.trim()).filter(Boolean))].slice(0, 25);
  }

  get temFiltros() {
    return Object.values(this.filtrosForm.value).some(Boolean);
  }

  constructor(
    private fb: FormBuilder,
    private service: ProdutoService,
    private auth: AuthService
  ) {
    this.filtrosForm = this.fb.group({
      busca: [''],
      categoria: [''],
      condicao: [''],
      cidade: [''],
      dias: ['']
    });
  }

  ngOnInit() {
    this.service.getProdutos().subscribe({
      next: produtos => {
        this.produtos = produtos;
        this.filtrosForm.valueChanges.pipe(
          startWith(this.filtrosForm.value),
          debounceTime(250)
        ).subscribe(() => this.filtrar());
      },
      error: () => this.carregando = false
    });
    this.service.getFavoritos(this.auth.getId()).subscribe(favoritos => {
      this.favoritos = Object.fromEntries(favoritos.map(f => [f.produtoId, f]));
    });
  }

  filtrar() {
    const { busca, categoria, condicao, cidade, dias } = this.filtrosForm.value;
    this.carregando = true;
    this.service.buscarProdutos({
      busca: busca?.trim(),
      categoria,
      condicao,
      cidade
    }).subscribe({
      next: produtos => {
        const limite = dias ? Date.now() - Number(dias) * 86400000 : 0;
        this.produtosFiltrados = produtos.filter(p =>
          !limite || new Date(p.criadoEm ?? 0).getTime() >= limite
        );
        this.carregando = false;
      },
      error: () => {
        this.produtosFiltrados = [];
        this.carregando = false;
      }
    });
  }

  limparFiltros() {
    this.filtrosForm.reset({
      busca: '', categoria: '', condicao: '', cidade: '', dias: ''
    });
  }

  alternarFavorito(produto: Produto) {
    const atual = this.favoritos[produto.id!];
    if (atual) {
      this.service.removerFavorito(atual.id!).subscribe(() => delete this.favoritos[produto.id!]);
      return;
    }
    this.service.criarFavorito({
      usuarioId: this.auth.getId(),
      produtoId: produto.id!,
      criadoEm: new Date().toISOString()
    }).subscribe(favorito => {
      this.favoritos[produto.id!] = favorito;
      if (produto.usuarioId !== this.auth.getId()) {
        this.service.criarNotificacao({
          usuarioId: produto.usuarioId,
          tipo: 'favorito',
          titulo: 'Seu produto foi favoritado',
          mensagem: `${this.auth.getUsuario()?.nome} favoritou "${produto.titulo}".`,
          link: `/app/produtos/${produto.id}`,
          lida: false,
          criadaEm: new Date().toISOString()
        }).subscribe();
      }
    });
  }
}
