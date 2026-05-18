import { Component } from '@angular/core';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [],
  template: `
    <div>
      <h2>Perfil</h2>
      <p>Seus dados e configurações.</p>
    </div>
  `,
  styles: [`
    h2 { color: #111827; margin-bottom: 0.5rem; }
    p { color: #6b7280; }
  `]
})
export class PerfilComponent {}