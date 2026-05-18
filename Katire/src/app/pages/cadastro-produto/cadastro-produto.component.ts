import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cadastro-produto',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div>
      <h2>{{ id ? 'Editar Produto' : 'Anunciar Produto' }}</h2>
      <p>Formulário de cadastro de produto.</p>
    </div>
  `,
  styles: [`
    h2 { color: #111827; margin-bottom: 0.5rem; }
    p { color: #6b7280; }
  `]
})
export class CadastroProdutoComponent {
  id: string | null = null;

  constructor(private route: ActivatedRoute) {
    this.id = this.route.snapshot.paramMap.get('id');
  }
}