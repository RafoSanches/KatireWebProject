import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-detalhes',
  standalone: true,
  imports: [],
  template: `
    <div>
      <h2>Detalhes do Produto</h2>
      <p>ID: {{ id }}</p>
    </div>
  `,
  styles: [`
    h2 { color: #111827; margin-bottom: 0.5rem; }
    p { color: #6b7280; }
  `]
})
export class DetalhesComponent {
  id: string | null = null;

  constructor(private route: ActivatedRoute) {
    this.id = this.route.snapshot.paramMap.get('id');
  }
}