import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProdutoService } from '../../services/produto.service';
import { AuthService } from '../../services/auth.service';
import { Produto } from '../../models/produto.model';

@Component({
  selector: 'app-detalhes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page" *ngIf="produto; else loading">
      <a routerLink="/app/produtos" class="back">← Voltar</a>

      <div class="layout">
        <!-- GALERIA -->
        <div class="gallery">
          <div class="main-foto">
            <img *ngIf="produto.fotos.length; else semFoto" [src]="fotoAtiva" [alt]="produto.titulo" />
            <ng-template #semFoto>
              <div class="sem-foto"><span>▧</span><strong>Produto sem foto</strong></div>
            </ng-template>
            <button *ngIf="produto.fotos.length > 1" class="nav-btn prev" (click)="navFoto(-1)">‹</button>
            <button *ngIf="produto.fotos.length > 1" class="nav-btn next" (click)="navFoto(1)">›</button>
            <div class="foto-counter" *ngIf="produto.fotos.length > 1">{{ fotoIndex + 1 }} / {{ produto.fotos.length }}</div>
          </div>
          <div class="thumbs" *ngIf="produto.fotos.length > 1">
            <img *ngFor="let f of produto.fotos; let i = index" [src]="f" [alt]="'Foto ' + (i+1)"
              [class.active]="i === fotoIndex" (click)="fotoIndex = i" />
          </div>
        </div>

        <!-- INFO -->
        <div class="info">
          <span class="categoria">{{ produto.categoria }}</span>
          <h1>{{ produto.titulo }}</h1>
          <span class="condicao">{{ produto.condicao }}</span>

          <div class="meta">
            <div class="meta-item"><span class="meta-label">Anunciante</span><span class="meta-value">{{ produto.usuario }}</span></div>
            <div class="meta-item"><span class="meta-label">Localização</span><span class="meta-value">📍 {{ produto.cidade }}/{{ produto.estado }}</span></div>
          </div>

          <div class="descricao"><h3>Descrição</h3><p>{{ produto.descricao }}</p></div>
          <div class="interesse-box"><h3>Aceita em troca</h3><p>{{ produto.interesse }}</p></div>

          <!-- PROPOSTA — Reactive Form -->
          <div *ngIf="!ehDono()" class="proposta-area">
            <h3>Fazer proposta de troca</h3>
            <form [formGroup]="formProposta" (ngSubmit)="enviarProposta()">

              <div class="field">
                <label>O que você oferece em troca *</label>
                <textarea formControlName="mensagem" rows="3"
                  placeholder="Descreva o item ou serviço que você oferece..."
                  [class.invalido]="cp('mensagem').invalid && cp('mensagem').touched"></textarea>
                <div class="field-footer">
                  <span class="erro-campo" *ngIf="cp('mensagem').touched && cp('mensagem').hasError('required')">Descreva sua oferta.</span>
                  <span class="erro-campo" *ngIf="cp('mensagem').touched && cp('mensagem').hasError('minlength')">Mínimo de 10 caracteres.</span>
                  <span class="char-count">{{ cp('mensagem').value?.length ?? 0 }}/300</span>
                </div>
              </div>

              <button type="submit" class="btn-proposta" [disabled]="enviando">
                {{ enviando ? 'Enviando...' : '🤝 Fazer proposta' }}
              </button>

              <div *ngIf="sucesso" class="msg-sucesso">{{ sucesso }}</div>
              <div *ngIf="erroProposta" class="msg-erro">{{ erroProposta }}</div>
            </form>
          </div>

          <div *ngIf="ehDono()" class="dono-actions">
            <a [routerLink]="['/app/anunciar', produto.id]" class="btn-editar">✏️ Editar anúncio</a>
            <button class="btn-excluir" (click)="excluir()">🗑️ Excluir</button>
          </div>
        </div>
      </div>
    </div>

    <ng-template #loading><div class="loading">Carregando produto...</div></ng-template>
  `,
  styles: [`
    .page { padding:2rem; max-width:1000px; }
    .back { color:#f97316; text-decoration:none; font-weight:600; display:inline-block; margin-bottom:1.5rem; }
    .layout { display:grid; grid-template-columns:1fr 1fr; gap:2rem; }
    .gallery { display:flex; flex-direction:column; gap:.75rem; }
    .main-foto { position:relative; border-radius:14px; overflow:hidden; aspect-ratio:4/3; background:#f3f4f6; }
    .main-foto img { width:100%; height:100%; object-fit:cover; display:block; }
    .sem-foto { width:100%; height:100%; display:grid; place-content:center; gap:.5rem; text-align:center; color:#94a3b8; background:linear-gradient(135deg,#f8fafc,#e5e7eb); }
    .sem-foto span { font-size:3rem; }
    .nav-btn { position:absolute; top:50%; transform:translateY(-50%); background:rgba(0,0,0,.45); color:#fff; border:none; width:36px; height:36px; border-radius:50%; cursor:pointer; font-size:1.4rem; display:flex; align-items:center; justify-content:center; transition:background .2s; }
    .nav-btn:hover { background:rgba(0,0,0,.7); }
    .nav-btn.prev { left:.6rem; } .nav-btn.next { right:.6rem; }
    .foto-counter { position:absolute; bottom:.6rem; right:.6rem; background:rgba(0,0,0,.55); color:#fff; padding:.2rem .6rem; border-radius:20px; font-size:.78rem; }
    .thumbs { display:flex; gap:.5rem; flex-wrap:wrap; }
    .thumbs img { width:64px; height:64px; object-fit:cover; border-radius:8px; cursor:pointer; border:2.5px solid transparent; transition:border-color .15s; }
    .thumbs img.active { border-color:#f97316; }
    .categoria { font-size:.75rem; color:#f97316; font-weight:700; text-transform:uppercase; }
    h1 { font-size:1.75rem; font-weight:800; color:#111827; margin:.5rem 0; }
    .condicao { display:inline-block; background:#f0fdf4; color:#16a34a; padding:.25rem .75rem; border-radius:20px; font-size:.85rem; font-weight:600; }
    .meta { display:flex; gap:1.5rem; margin:1.25rem 0; }
    .meta-item { display:flex; flex-direction:column; gap:.2rem; }
    .meta-label { font-size:.75rem; color:#9ca3af; font-weight:600; text-transform:uppercase; }
    .meta-value { font-size:.9rem; color:#374151; font-weight:600; }
    .descricao, .interesse-box { margin-bottom:1.25rem; }
    h3 { font-size:1rem; font-weight:700; color:#111827; margin:0 0 .5rem; }
    p { color:#6b7280; line-height:1.6; margin:0; }
    .interesse-box { background:#fff7ed; border-radius:10px; padding:1rem; border-left:3px solid #f97316; }
    .proposta-area { background:#f9fafb; border-radius:12px; padding:1.25rem; }
    .field { display:flex; flex-direction:column; gap:.35rem; }
    label { font-size:.85rem; font-weight:600; color:#374151; }
    textarea { width:100%; padding:.75rem; border:1.5px solid #e5e7eb; border-radius:10px; font-size:.95rem; resize:vertical; outline:none; box-sizing:border-box; font-family:inherit; transition:border-color .2s; }
    textarea:focus { border-color:#f97316; }
    textarea.invalido { border-color:#ef4444; background:#fef2f2; }
    .field-footer { display:flex; justify-content:space-between; }
    .erro-campo { font-size:.78rem; color:#ef4444; }
    .char-count { font-size:.75rem; color:#9ca3af; }
    .btn-proposta { width:100%; margin-top:.75rem; padding:.8rem; background:#f97316; color:#fff; border:none; border-radius:10px; font-size:1rem; font-weight:700; cursor:pointer; transition:background .2s; }
    .btn-proposta:hover:not(:disabled) { background:#ea6009; }
    .btn-proposta:disabled { opacity:.6; cursor:not-allowed; }
    .msg-sucesso { color:#16a34a; font-size:.9rem; margin-top:.5rem; text-align:center; }
    .msg-erro { color:#dc2626; font-size:.9rem; margin-top:.5rem; text-align:center; }
    .dono-actions { display:flex; gap:.75rem; }
    .btn-editar { flex:1; padding:.7rem; background:#f97316; color:#fff; text-decoration:none; border-radius:10px; text-align:center; font-weight:600; }
    .btn-excluir { flex:1; padding:.7rem; background:#fef2f2; color:#dc2626; border:1.5px solid #fca5a5; border-radius:10px; cursor:pointer; font-weight:600; }
    .loading { padding:3rem; text-align:center; color:#9ca3af; }
    @media (max-width:768px) { .layout { grid-template-columns:1fr; } }
  `]
})
export class DetalhesComponent implements OnInit {
  produto: Produto | null = null;
  fotoIndex = 0;
  formProposta: FormGroup;
  enviando = false; sucesso = ''; erroProposta = '';

  get fotoAtiva() { return this.produto?.fotos[this.fotoIndex] ?? ''; }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private produtoService: ProdutoService,
    public auth: AuthService
  ) {
    this.formProposta = this.fb.group({
      mensagem: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(300)]]
    });
  }

  cp(nome: string) { return this.formProposta.get(nome)!; }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.produtoService.getProduto(id).subscribe(p => { this.produto = p; this.fotoIndex = 0; });
  }

  navFoto(dir: number) {
    if (!this.produto) return;
    const total = this.produto.fotos.length;
    if (!total) return;
    this.fotoIndex = (this.fotoIndex + dir + total) % total;
  }

  ehDono() { return this.produto?.usuarioId === this.auth.getId(); }

  enviarProposta() {
    if (this.formProposta.invalid) { this.formProposta.markAllAsTouched(); return; }
    if (!this.auth.isLogado()) { this.router.navigate(['/login']); return; }

    this.enviando = true; this.erroProposta = '';
    const usuario = this.auth.usuarioAtual()!;
    const proposta = {
      produtoOfertadoId: '',
      produtoDesejadoId: this.produto!.id!,
      remetenteId: this.auth.getId(),
      destinatarioId: this.produto!.usuarioId,
      remetente: usuario.nome, destinatario: this.produto!.usuario,
      produtoOfertado: 'Ver mensagem', produtoDesejado: this.produto!.titulo,
      mensagem: this.formProposta.value.mensagem,
      status: 'pendente' as const, criadaEm: new Date().toISOString()
    };

    this.produtoService.criarProposta(proposta).subscribe({
      next: () => {
        this.produtoService.criarNotificacao({
          usuarioId: this.produto!.usuarioId,
          tipo: 'proposta',
          titulo: 'Nova proposta recebida',
          mensagem: `${usuario.nome} enviou uma proposta por "${this.produto!.titulo}".`,
          link: '/app/propostas',
          lida: false,
          criadaEm: new Date().toISOString()
        }).subscribe();
        this.sucesso = 'Proposta enviada com sucesso! 🎉';
        this.formProposta.reset();
        this.enviando = false;
      },
      error: () => { this.erroProposta = 'Erro ao enviar proposta.'; this.enviando = false; }
    });
  }

  excluir() {
    if (confirm('Tem certeza que deseja excluir este anúncio?')) {
      this.produtoService.excluirProduto(this.produto!.id!).subscribe(() => this.router.navigate(['/app/produtos']));
    }
  }
}
