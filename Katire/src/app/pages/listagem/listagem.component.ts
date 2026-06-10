import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProdutoService } from '../../services/produto.service';
import { AuthService } from '../../services/auth.service';
import { Produto, CATEGORIAS, CONDICOES, Favorito } from '../../models/produto.model';

@Component({
  selector: 'app-listagem',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Explorar Produtos</h1>
          <p>Encontre itens para permutar</p>
        </div>
        <a routerLink="/app/anunciar" class="btn-primary">+ Anunciar produto</a>
      </div>

      <div class="filters">
        <div class="search-box">
          <span>🔍</span>
          <input [(ngModel)]="busca" (input)="filtrar()" list="sugestoes"
            placeholder="Buscar por título ou descrição..." />
          <datalist id="sugestoes">
            <option *ngFor="let sugestao of sugestoes" [value]="sugestao"></option>
          </datalist>
        </div>
        <select [(ngModel)]="categoriaFiltro" (change)="filtrar()">
          <option value="">Todas as categorias</option>
          <option *ngFor="let c of categorias" [value]="c">{{ c }}</option>
        </select>
        <select [(ngModel)]="condicaoFiltro" (change)="filtrar()">
          <option value="">Qualquer estado</option>
          <option *ngFor="let c of condicoes" [value]="c">{{ c }}</option>
        </select>
        <select [(ngModel)]="cidadeFiltro" (change)="filtrar()">
          <option value="">Todas as cidades</option>
          <option *ngFor="let cidade of cidades" [value]="cidade">{{ cidade }}</option>
        </select>
        <select [(ngModel)]="dataFiltro" (change)="filtrar()">
          <option value="">Qualquer data</option>
          <option value="7">Últimos 7 dias</option>
          <option value="30">Últimos 30 dias</option>
          <option value="365">Último ano</option>
        </select>
        <button class="btn-limpar" *ngIf="temFiltros" (click)="limparFiltros()">Limpar</button>
      </div>

      <div class="result-count" *ngIf="!carregando">
        {{ produtosFiltrados.length }} produto{{ produtosFiltrados.length === 1 ? '' : 's' }} encontrado{{ produtosFiltrados.length === 1 ? '' : 's' }}
      </div>
      <div *ngIf="carregando" class="loading">Carregando produtos...</div>
      <div *ngIf="!carregando && produtosFiltrados.length === 0" class="empty">
        <span>📦</span><p>Nenhum produto encontrado com esses filtros.</p>
      </div>

      <div class="grid" *ngIf="!carregando">
        <article class="card" *ngFor="let p of produtosFiltrados">
          <a [routerLink]="['/app/produtos', p.id]" class="card-link">
            <div class="card-img">
              <img [src]="p.fotos[0]" [alt]="p.titulo" />
              <span class="badge">{{ p.condicao }}</span>
            </div>
            <div class="card-body">
              <span class="categoria">{{ p.categoria }}</span>
              <h3>{{ p.titulo }}</h3>
              <p>{{ p.descricao | slice:0:95 }}{{ p.descricao.length > 95 ? '...' : '' }}</p>
              <div class="card-footer">
                <span>👤 {{ p.usuario }}</span>
                <span>📍 {{ p.cidade }}/{{ p.estado }}</span>
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
    .page { padding:2rem; max-width:1250px; }
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem; gap:1rem; }
    h1 { font-size:1.75rem; font-weight:800; color:#111827; margin:0; }
    p { color:#6b7280; margin:.25rem 0 0; }
    .btn-primary { background:#f97316; color:#fff; padding:.65rem 1.25rem; border-radius:10px; text-decoration:none; font-weight:700; font-size:.9rem; white-space:nowrap; }
    .filters { display:flex; gap:.75rem; margin-bottom:.75rem; flex-wrap:wrap; }
    .search-box { display:flex; align-items:center; gap:.5rem; background:#fff; border:1.5px solid #e5e7eb; border-radius:10px; padding:0 1rem; flex:1; min-width:260px; }
    .search-box input { border:none; outline:none; padding:.7rem 0; font-size:.95rem; width:100%; background:transparent; }
    select,.btn-limpar { padding:.7rem .8rem; border:1.5px solid #e5e7eb; border-radius:10px; background:#fff; font-size:.88rem; outline:none; cursor:pointer; }
    .btn-limpar { color:#c2410c; background:#fff7ed; border-color:#fed7aa; font-weight:700; }
    .result-count { margin-bottom:1.25rem; color:#9ca3af; font-size:.82rem; }
    .loading,.empty { text-align:center; padding:3rem; color:#9ca3af; }
    .empty span { font-size:3rem; display:block; }
    .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(270px,1fr)); gap:1.25rem; }
    .card { position:relative; background:#fff; border-radius:14px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.06); border:1px solid #f3f4f6; transition:transform .2s,box-shadow .2s; }
    .card:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,0,0,.12); }
    .card-link { text-decoration:none; color:inherit; display:block; }
    .card-img { position:relative; height:180px; overflow:hidden; }
    .card-img img { width:100%; height:100%; object-fit:cover; }
    .badge { position:absolute; top:.6rem; left:.6rem; background:rgba(0,0,0,.65); color:#fff; padding:.2rem .5rem; border-radius:6px; font-size:.72rem; }
    .favorite-btn { position:absolute; top:.55rem; right:.55rem; width:38px; height:38px; border:0; border-radius:50%; background:rgba(255,255,255,.92); color:#9ca3af; font-size:1.65rem; cursor:pointer; display:grid; place-items:center; box-shadow:0 2px 8px rgba(0,0,0,.15); }
    .favorite-btn.ativo { color:#ef4444; }
    .card-body { padding:1rem; }
    .categoria { font-size:.75rem; color:#f97316; font-weight:700; text-transform:uppercase; }
    .card-body h3 { margin:.35rem 0 .5rem; font-size:1rem; color:#111827; }
    .card-body p { font-size:.85rem; color:#6b7280; margin:0 0 .75rem; line-height:1.4; }
    .card-footer { display:flex; justify-content:space-between; gap:.5rem; font-size:.76rem; color:#9ca3af; border-top:1px solid #f3f4f6; padding-top:.6rem; }
    @media (max-width:640px) { .page { padding:1rem; } .page-header { align-items:center; } .btn-primary { padding:.55rem .7rem; } .filters>* { width:100%; } .grid { grid-template-columns:1fr; } }
  `]
})
export class ListagemComponent implements OnInit {
  produtos: Produto[] = [];
  produtosFiltrados: Produto[] = [];
  favoritos: Record<string, Favorito> = {};
  busca = '';
  categoriaFiltro = '';
  condicaoFiltro = '';
  cidadeFiltro = '';
  dataFiltro = '';
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
    return !!(this.busca || this.categoriaFiltro || this.condicaoFiltro || this.cidadeFiltro || this.dataFiltro);
  }

  constructor(private service: ProdutoService, private auth: AuthService) {}

  ngOnInit() {
    this.service.getProdutos().subscribe({
      next: produtos => {
        this.produtos = produtos;
        this.produtosFiltrados = produtos;
        this.carregando = false;
      },
      error: () => this.carregando = false
    });
    this.service.getFavoritos(this.auth.getId()).subscribe(favoritos => {
      this.favoritos = Object.fromEntries(favoritos.map(f => [f.produtoId, f]));
    });
  }

  filtrar() {
    const termo = this.busca.trim().toLocaleLowerCase('pt-BR');
    const limite = this.dataFiltro ? Date.now() - Number(this.dataFiltro) * 86400000 : 0;
    this.produtosFiltrados = this.produtos.filter(p => {
      const texto = `${p.titulo} ${p.descricao} ${p.interesse}`.toLocaleLowerCase('pt-BR');
      return (!termo || texto.includes(termo))
        && (!this.categoriaFiltro || p.categoria === this.categoriaFiltro)
        && (!this.condicaoFiltro || p.condicao === this.condicaoFiltro)
        && (!this.cidadeFiltro || p.cidade === this.cidadeFiltro)
        && (!limite || new Date(p.criadoEm ?? 0).getTime() >= limite);
    });
  }

  limparFiltros() {
    this.busca = this.categoriaFiltro = this.condicaoFiltro = this.cidadeFiltro = this.dataFiltro = '';
    this.filtrar();
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
