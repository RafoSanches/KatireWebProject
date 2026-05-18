import { Component } from '@angular/core';

@Component({
  selector: 'app-propostas',
  standalone: true,
  imports: [],
  template: `
    <div>
      <h2>Propostas</h2>
      <p>Gerencie suas propostas de troca.</p>
    </div>
  `,
  styles: [`
    h2 { color: #111827; margin-bottom: 0.5rem; }
    p { color: #6b7280; }
  `]
})
export class PropostasComponent {}