import { Component } from '@angular/core';
@Component({
  selector: 'app-listagem',
  standalone: true,
  imports: [],
  template: `
    <div>
      <h2>Produtos</h2>
      <p>Lista de produtos disponíveis para troca.</p>
    </div>
  `,
  styles: [`
    h2 { color: #111827; margin-bottom: 0.5rem; }
    p { color: #6b7280; }
  `]
})
export class ListagemComponent {}