import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ProdutoService } from '../../services/produto.service';
import { Favorito, Produto } from '../../models/produto.model';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Meus favoritos</h1>
          <p>Sua lista de desejos para acompanhar depois.</p>
        </div>
        <a routerLink="/app/produtos" class="btn-primary">Explorar produtos</a>
      </div>

      <div class="loading" *ngIf="carregando">Carregando favoritos...</div>
      <div class="empty" *ngIf="!carregando && itens.length === 0">
        <span>♡</span>
        <h2>Sua lista ainda está vazia</h2>
        <p>Favorite produtos interessantes para encontrá-los rapidamente.</p>
      </div>

      <div class="grid" *ngIf="!carregando">
        <article class="card" *ngFor="let item of itens">
          <a [routerLink]="['/app/produtos', item.produto.id]" class="card-link">
            <img *ngIf="item.produto.fotos.length; else semFoto" [src]="item.produto.fotos[0]" [alt]="item.produto.titulo" />
            <ng-template #semFoto><div class="sem-foto">▧<small>Sem foto</small></div></ng-template>
            <div class="card-body">
              <span>{{ item.produto.categoria }}</span>
              <h3>{{ item.produto.titulo }}</h3>
              <p>{{ item.produto.cidade }}/{{ item.produto.estado }}</p>
            </div>
          </a>
          <button (click)="remover(item.favorito.id!)">Remover dos favoritos</button>
        </article>
      </div>
    </div>
  `,
  styles: [`
    .page { padding:2rem; max-width:1100px; }
    .page-header { display:flex; justify-content:space-between; gap:1rem; align-items:flex-start; margin-bottom:1.5rem; }
    h1 { margin:0; font-size:1.75rem; color:#111827; }
    p { margin:.25rem 0 0; color:#6b7280; }
    .btn-primary { background:#f97316; color:#fff; padding:.7rem 1rem; border-radius:10px; text-decoration:none; font-weight:700; }
    .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:1rem; }
    .card { background:#fff; border:1px solid #f3f4f6; border-radius:14px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.05); }
    .card-link { color:inherit; text-decoration:none; }
    img { width:100%; height:170px; object-fit:cover; display:block; }
    .sem-foto { width:100%; height:170px; display:grid; place-content:center; gap:.25rem; text-align:center; background:linear-gradient(135deg,#f8fafc,#e5e7eb); color:#94a3b8; font-size:2rem; }
    .sem-foto small { font-size:.72rem; font-weight:700; text-transform:uppercase; }
    .card-body { padding:1rem; }
    .card-body span { color:#f97316; font-size:.75rem; font-weight:800; text-transform:uppercase; }
    h3 { margin:.35rem 0; font-size:1rem; color:#111827; }
    .card button { width:100%; padding:.7rem; border:0; border-top:1px solid #f3f4f6; background:#fff7ed; color:#c2410c; cursor:pointer; font-weight:700; }
    .loading,.empty { text-align:center; padding:4rem 1rem; color:#9ca3af; }
    .empty span { display:block; font-size:4rem; color:#f97316; }
    .empty h2 { color:#374151; margin:.5rem 0; }
    @media (max-width:640px) { .page { padding:1rem; } .page-header { flex-direction:column; } }
  `]
})
export class FavoritosComponent implements OnInit {
  itens: { favorito: Favorito; produto: Produto }[] = [];
  carregando = true;

  constructor(private service: ProdutoService, private auth: AuthService) {}

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.service.getFavoritos(this.auth.getId()).subscribe(favoritos => {
      if (!favoritos.length) {
        this.itens = [];
        this.carregando = false;
        return;
      }
      forkJoin(favoritos.map(f => this.service.getProduto(f.produtoId))).subscribe({
        next: produtos => {
          this.itens = produtos.map((produto, i) => ({ favorito: favoritos[i], produto }));
          this.carregando = false;
        },
        error: () => {
          this.itens = [];
          this.carregando = false;
        }
      });
    });
  }

  remover(id: string) {
    this.service.removerFavorito(id).subscribe(() => {
      this.itens = this.itens.filter(item => item.favorito.id !== id);
    });
  }
}
