import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  template: `
    <div>
      <h2>Dashboard</h2>
      <p>Métricas e resumo da sua atividade.</p>
    </div>
  `,
  styles: [`
    h2 { color: #111827; margin-bottom: 0.5rem; }
    p { color: #6b7280; }
  `]
})
export class DashboardComponent {}