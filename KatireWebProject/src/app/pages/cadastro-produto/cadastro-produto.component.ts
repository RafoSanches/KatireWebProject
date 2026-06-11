import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProdutoService } from '../../services/produto.service';
import { AuthService } from '../../services/auth.service';
import { CATEGORIAS, CONDICOES } from '../../models/produto.model';

@Component({
  selector: 'app-cadastro-produto',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="page">
      <a routerLink="/app/produtos" class="back">← Voltar</a>
      <h1>{{ id ? 'Editar Produto' : 'Anunciar Produto' }}</h1>
      <p class="subtitle">Preencha os dados do item que deseja permutar</p>

      <div *ngIf="sucesso" class="msg-sucesso">{{ sucesso }}</div>
      <div *ngIf="erroServidor" class="msg-erro">{{ erroServidor }}</div>

      <form [formGroup]="form" (ngSubmit)="salvar()" class="form">

        <!-- INFORMAÇÕES BÁSICAS -->
        <div class="form-section">
          <h3>Informações básicas</h3>

          <div class="field">
            <label>Título do anúncio *</label>
            <input type="text" formControlName="titulo" placeholder="Ex: Bicicleta Caloi 21 marchas"
              [class.invalido]="c('titulo').invalid && c('titulo').touched" />
            <span class="erro-campo" *ngIf="c('titulo').touched && c('titulo').hasError('required')">Título é obrigatório.</span>
            <span class="erro-campo" *ngIf="c('titulo').touched && c('titulo').hasError('minlength')">Mínimo de 5 caracteres.</span>
            <span class="erro-campo" *ngIf="c('titulo').touched && c('titulo').hasError('maxlength')">Máximo de 80 caracteres.</span>
          </div>

          <div class="row">
            <div class="field">
              <label>Categoria *</label>
              <select formControlName="categoria" [class.invalido]="c('categoria').invalid && c('categoria').touched">
                <option value="">Selecione...</option>
                <option *ngFor="let cat of categorias" [value]="cat">{{ cat }}</option>
              </select>
              <span class="erro-campo" *ngIf="c('categoria').touched && c('categoria').hasError('required')">Selecione uma categoria.</span>
            </div>
            <div class="field">
              <label>Condição *</label>
              <select formControlName="condicao" [class.invalido]="c('condicao').invalid && c('condicao').touched">
                <option value="">Selecione...</option>
                <option *ngFor="let cond of condicoes" [value]="cond">{{ cond }}</option>
              </select>
              <span class="erro-campo" *ngIf="c('condicao').touched && c('condicao').hasError('required')">Selecione a condição.</span>
            </div>
          </div>

          <div class="field">
            <label>Descrição *</label>
            <textarea formControlName="descricao" rows="4" placeholder="Descreva o item em detalhes..."
              [class.invalido]="c('descricao').invalid && c('descricao').touched"></textarea>
            <div class="field-footer">
              <span class="erro-campo" *ngIf="c('descricao').touched && c('descricao').hasError('required')">Descrição é obrigatória.</span>
              <span class="erro-campo" *ngIf="c('descricao').touched && c('descricao').hasError('minlength')">Mínimo de 20 caracteres.</span>
              <span class="char-count" [class.quase]="c('descricao').value?.length > 450">
                {{ c('descricao').value?.length ?? 0 }}/500
              </span>
            </div>
          </div>
        </div>

        <!-- FOTOS -->
        <div class="form-section">
          <h3>Fotos do produto</h3>
          <p class="section-hint">Adicione até 5 fotos. A primeira será a foto de capa.</p>

          <div class="upload-area"
            [class.dragover]="isDragOver"
            [class.upload-erro]="fotos.length === 0 && formSubmetido"
            (click)="fileInput.click()"
            (dragover)="onDragOver($event)"
            (dragleave)="isDragOver = false"
            (drop)="onDrop($event)">
            <span class="upload-icon">📷</span>
            <p>Clique ou arraste fotos aqui</p>
            <small>JPG, PNG, WEBP — máx 5MB por foto</small>
            <input #fileInput type="file" accept="image/*" multiple (change)="onFileSelect($event)" style="display:none" />
          </div>
          <span class="erro-campo" *ngIf="fotos.length === 0 && formSubmetido">
            Adicione ao menos uma foto do produto.
          </span>

          <div *ngIf="processando" class="progresso">
            <div class="progresso-bar" [style.width]="progressoPct + '%'"></div>
            <span>Processando {{ progressoAtual }} de {{ progressoTotal }} foto(s)...</span>
          </div>

          <div class="fotos-grid" *ngIf="fotos.length > 0">
            <div class="foto-item" *ngFor="let foto of fotos; let i = index">
              <img [src]="foto" [alt]="'Foto ' + (i+1)" />
              <div class="foto-overlay">
                <span class="foto-num" *ngIf="i === 0">⭐ Capa</span>
                <button type="button" class="btn-remove" (click)="removerFoto(i)">✕</button>
              </div>
              <div class="foto-actions" *ngIf="fotos.length > 1">
                <button type="button" (click)="moverEsquerda(i)" [disabled]="i === 0">‹</button>
                <button type="button" (click)="moverDireita(i)" [disabled]="i === fotos.length - 1">›</button>
              </div>
            </div>
            <div class="foto-add" *ngIf="fotos.length < 5" (click)="fileInput.click()">
              <span>+</span><small>Adicionar</small>
            </div>
          </div>
          <div *ngIf="erroFoto" class="msg-erro-foto">{{ erroFoto }}</div>
        </div>

        <!-- LOCALIZAÇÃO -->
        <div class="form-section">
          <h3>Localização</h3>
          <div class="row">
            <div class="field">
              <label>Cidade *</label>
              <input type="text" formControlName="cidade" placeholder="Sua cidade"
                [class.invalido]="c('cidade').invalid && c('cidade').touched" />
              <span class="erro-campo" *ngIf="c('cidade').touched && c('cidade').hasError('required')">Cidade é obrigatória.</span>
            </div>
            <div class="field" style="max-width:100px">
              <label>Estado *</label>
              <input type="text" formControlName="estado" placeholder="UF" maxlength="2"
                [class.invalido]="c('estado').invalid && c('estado').touched" />
              <span class="erro-campo" *ngIf="c('estado').touched && c('estado').hasError('required')">Obrigatório.</span>
              <span class="erro-campo" *ngIf="c('estado').touched && c('estado').hasError('pattern')">Use 2 letras.</span>
            </div>
          </div>
        </div>

        <!-- INTERESSE -->
        <div class="form-section">
          <h3>O que aceita em troca</h3>
          <div class="field">
            <label>Produtos de interesse</label>
            <input type="text" formControlName="interesse" placeholder="Ex: Eletrônicos, Livros, Roupas" />
            <small>Separe por vírgula</small>
          </div>
        </div>

        <!-- Resumo de erros quando tenta submeter com campos inválidos -->
        <div class="resumo-erros" *ngIf="form.invalid && formSubmetido">
          ⚠️ Corrija os campos destacados antes de publicar.
        </div>

        <div class="form-actions">
          <a routerLink="/app/produtos" class="btn-cancelar">Cancelar</a>
          <button type="submit" [disabled]="salvando || processando">
            {{ salvando ? 'Salvando...' : (id ? 'Salvar alterações' : 'Publicar anúncio') }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .page { padding:2rem; max-width:700px; }
    .back { color:#f97316; text-decoration:none; font-weight:600; display:inline-block; margin-bottom:1.5rem; }
    h1 { font-size:1.75rem; font-weight:800; color:#111827; margin:0; }
    .subtitle { color:#6b7280; margin:.25rem 0 2rem; }
    .section-hint { color:#9ca3af; font-size:.85rem; margin:-.5rem 0 1rem; }
    .form { display:flex; flex-direction:column; gap:1.5rem; }
    .form-section { background:#fff; padding:1.5rem; border-radius:14px; border:1px solid #f3f4f6; }
    h3 { font-size:1rem; font-weight:700; color:#111827; margin:0 0 1rem; }
    .field { display:flex; flex-direction:column; gap:.35rem; flex:1; }
    .row { display:flex; gap:1rem; }
    label { font-size:.85rem; font-weight:600; color:#374151; }
    small { font-size:.75rem; color:#9ca3af; }
    input, select, textarea {
      padding:.75rem 1rem; border:1.5px solid #e5e7eb; border-radius:10px;
      font-size:.95rem; outline:none; transition:border-color .2s;
      font-family:inherit; box-sizing:border-box; width:100%;
    }
    input:focus, select:focus, textarea:focus { border-color:#f97316; }
    input.invalido, select.invalido, textarea.invalido { border-color:#ef4444; background:#fef2f2; }
    textarea { resize:vertical; }
    .erro-campo { font-size:.78rem; color:#ef4444; }
    .field-footer { display:flex; justify-content:space-between; align-items:center; }
    .char-count { font-size:.75rem; color:#9ca3af; }
    .char-count.quase { color:#f59e0b; }

    /* Upload */
    .upload-area { border:2px dashed #d1d5db; border-radius:12px; padding:2rem 1rem; text-align:center; cursor:pointer; transition:all .2s; background:#f9fafb; display:flex; flex-direction:column; align-items:center; gap:.4rem; }
    .upload-area:hover { border-color:#f97316; background:#fff7ed; }
    .upload-area.dragover { border-color:#f97316; background:#fff7ed; transform:scale(1.01); }
    .upload-area.upload-erro { border-color:#ef4444; background:#fef2f2; }
    .upload-icon { font-size:2.5rem; }
    .upload-area p { color:#374151; font-weight:600; font-size:.95rem; margin:0; }
    .progresso { margin-top:.75rem; display:flex; flex-direction:column; gap:.4rem; }
    .progresso span { font-size:.8rem; color:#6b7280; }
    .progresso-bar { height:4px; background:#f97316; border-radius:2px; transition:width .3s; }
    .fotos-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(130px,1fr)); gap:.75rem; margin-top:1rem; }
    .foto-item { position:relative; border-radius:10px; overflow:hidden; aspect-ratio:1; border:1.5px solid #e5e7eb; }
    .foto-item img { width:100%; height:100%; object-fit:cover; display:block; }
    .foto-overlay { position:absolute; top:0; left:0; right:0; display:flex; justify-content:space-between; align-items:flex-start; padding:.4rem; }
    .foto-num { background:rgba(249,115,22,.9); color:#fff; font-size:.7rem; font-weight:700; padding:.15rem .4rem; border-radius:4px; }
    .btn-remove { background:rgba(0,0,0,.55); color:#fff; border:none; width:22px; height:22px; border-radius:50%; cursor:pointer; font-size:.7rem; display:flex; align-items:center; justify-content:center; }
    .btn-remove:hover { background:rgba(220,38,38,.9); }
    .foto-actions { position:absolute; bottom:0; left:0; right:0; display:flex; justify-content:center; gap:.25rem; padding:.3rem; background:rgba(0,0,0,.35); }
    .foto-actions button { background:rgba(255,255,255,.85); border:none; border-radius:4px; width:22px; height:22px; cursor:pointer; font-size:.9rem; display:flex; align-items:center; justify-content:center; padding:0; }
    .foto-actions button:disabled { opacity:.35; cursor:default; }
    .foto-add { aspect-ratio:1; border:2px dashed #d1d5db; border-radius:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; color:#9ca3af; gap:.25rem; transition:all .15s; }
    .foto-add:hover { border-color:#f97316; color:#f97316; background:#fff7ed; }
    .foto-add span { font-size:1.75rem; line-height:1; }
    .msg-erro-foto { color:#dc2626; font-size:.85rem; margin-top:.5rem; }

    .resumo-erros { background:#fef2f2; color:#dc2626; padding:.75rem 1rem; border-radius:10px; font-size:.9rem; border-left:3px solid #ef4444; }
    .form-actions { display:flex; gap:.75rem; justify-content:flex-end; }
    .btn-cancelar { padding:.8rem 1.5rem; background:#f9fafb; border:1.5px solid #e5e7eb; border-radius:10px; color:#374151; text-decoration:none; font-weight:600; }
    button[type=submit] { padding:.8rem 1.5rem; background:#f97316; color:#fff; border:none; border-radius:10px; font-size:1rem; font-weight:700; cursor:pointer; transition:background .2s; }
    button[type=submit]:hover:not(:disabled) { background:#ea6009; }
    button[type=submit]:disabled { opacity:.6; cursor:not-allowed; }
    .msg-sucesso { background:#f0fdf4; color:#16a34a; padding:.75rem; border-radius:8px; margin-bottom:1rem; }
    .msg-erro { background:#fef2f2; color:#dc2626; padding:.75rem; border-radius:8px; margin-bottom:1rem; }
  `]
})
export class CadastroProdutoComponent implements OnInit {
  id: string | null = null;
  form: FormGroup;
  fotos: string[] = [];
  salvando = false; sucesso = ''; erroServidor = ''; erroFoto = '';
  isDragOver = false; processando = false;
  progressoAtual = 0; progressoTotal = 0;
  formSubmetido = false;
  get progressoPct() { return this.progressoTotal ? (this.progressoAtual / this.progressoTotal) * 100 : 0; }
  categorias = CATEGORIAS; condicoes = CONDICOES;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private produtoService: ProdutoService,
    private auth: AuthService
  ) {
    const usuario = this.auth.usuarioAtual();
    this.form = this.fb.group({
      titulo:    ['', [Validators.required, Validators.minLength(5), Validators.maxLength(80)]],
      categoria: ['', Validators.required],
      condicao:  ['', Validators.required],
      descricao: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(500)]],
      cidade:    [usuario?.cidade ?? '', Validators.required],
      estado:    [usuario?.estado ?? '', [Validators.required, Validators.pattern(/^[A-Za-z]{2}$/)]],
      interesse: ['']
    });
  }

  c(nome: string) { return this.form.get(nome)!; }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.produtoService.getProduto(this.id).subscribe(p => {
        this.form.patchValue({
          titulo: p.titulo, categoria: p.categoria, condicao: p.condicao,
          descricao: p.descricao, cidade: p.cidade, estado: p.estado, interesse: p.interesse
        });
        this.fotos = [...p.fotos];
      });
    }
  }

  onDragOver(e: DragEvent) { e.preventDefault(); e.stopPropagation(); this.isDragOver = true; }
  onDrop(e: DragEvent) { e.preventDefault(); e.stopPropagation(); this.isDragOver = false; this.processarArquivos(Array.from(e.dataTransfer?.files ?? [])); }
  onFileSelect(e: Event) { const i = e.target as HTMLInputElement; this.processarArquivos(Array.from(i.files ?? [])); i.value = ''; }

  processarArquivos(files: File[]) {
    this.erroFoto = '';
    const validos = files.filter(f => {
      if (!f.type.startsWith('image/')) { this.erroFoto = 'Apenas imagens são permitidas.'; return false; }
      if (f.size > 5 * 1024 * 1024) { this.erroFoto = `"${f.name}" excede 5MB.`; return false; }
      return true;
    });
    const espacos = 5 - this.fotos.length;
    if (espacos <= 0) { this.erroFoto = 'Limite de 5 fotos atingido.'; return; }
    const para = validos.slice(0, espacos);
    this.processando = true; this.progressoAtual = 0; this.progressoTotal = para.length;
    let ok = 0;
    para.forEach(f => {
      this.redimensionarImagem(f, 1200, 0.82).then(b64 => {
        this.fotos.push(b64); ok++;
        this.progressoAtual = ok;
        if (ok === para.length) this.processando = false;
      }).catch(() => { ok++; this.erroFoto = `Erro ao processar "${f.name}".`; if (ok === para.length) this.processando = false; });
    });
  }

  redimensionarImagem(file: File, maxWidth: number, quality: number): Promise<string> {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > maxWidth) { height = Math.round(height * maxWidth / width); width = maxWidth; }
          canvas.width = width; canvas.height = height;
          canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
          res(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = rej; img.src = e.target!.result as string;
      };
      reader.onerror = rej; reader.readAsDataURL(file);
    });
  }

  removerFoto(i: number) { this.fotos.splice(i, 1); }
  moverEsquerda(i: number) { if (i > 0) [this.fotos[i - 1], this.fotos[i]] = [this.fotos[i], this.fotos[i - 1]]; }
  moverDireita(i: number) { if (i < this.fotos.length - 1) [this.fotos[i], this.fotos[i + 1]] = [this.fotos[i + 1], this.fotos[i]]; }

  salvar() {
    this.formSubmetido = true;
    if (this.form.invalid || (this.fotos.length === 0 && !this.id)) {
      this.form.markAllAsTouched();
      return;
    }
    const usuario = this.auth.usuarioAtual();
    if (!usuario) { this.router.navigate(['/login']); return; }
    this.salvando = true; this.erroServidor = '';

    const { titulo, categoria, condicao, descricao, cidade, estado, interesse } = this.form.value;
    const produto = {
      titulo, descricao, categoria, condicao, fotos: this.fotos,
      usuarioId: usuario.id!, usuario: usuario.nome,
      cidade, estado: estado.toUpperCase(), interesse, ativo: true,
      criadoEm: new Date().toISOString()
    };

    const req = this.id ? this.produtoService.editarProduto(this.id, produto) : this.produtoService.criarProduto(produto);
    req.subscribe({
      next: p => { this.sucesso = this.id ? 'Anúncio atualizado!' : 'Anúncio publicado! 🎉'; this.salvando = false; setTimeout(() => this.router.navigate(['/app/produtos', p.id]), 1500); },
      error: () => { this.erroServidor = 'Erro ao salvar. Tente novamente.'; this.salvando = false; }
    });
  }
}
