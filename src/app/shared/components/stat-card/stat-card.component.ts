import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card" [class]="'stat-card-' + variant">
      <div class="stat-icon" [class]="'icon-' + variant">
        <ng-content select="[icon]"></ng-content>
      </div>
      <div class="stat-content">
        <p class="stat-label">{{ label }}</p>
        <p class="stat-value">{{ value }}</p>
        @if (subtitle) {
          <p class="stat-subtitle">{{ subtitle }}</p>
        }
      </div>
      @if (trend !== undefined) {
        <div class="stat-trend" [class.positive]="trend >= 0" [class.negative]="trend < 0">
          {{ trend >= 0 ? '+' : '' }}{{ trend }}%
        </div>
      }
    </div>
  `,
  styles: [`
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .icon-primary { background: #dbeafe; color: #2563eb; }
    .icon-success { background: #d1fae5; color: #059669; }
    .icon-warning { background: #fef3c7; color: #d97706; }
    .icon-danger { background: #fee2e2; color: #dc2626; }
    .icon-info { background: #e0e7ff; color: #4f46e5; }

    .stat-content {
      flex: 1;
    }

    .stat-label {
      margin: 0;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .stat-value {
      margin: 0.25rem 0 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
    }

    .stat-subtitle {
      margin: 0.25rem 0 0;
      font-size: 0.75rem;
      color: #9ca3af;
    }

    .stat-trend {
      font-size: 0.875rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }

    .stat-trend.positive {
      background: #d1fae5;
      color: #059669;
    }

    .stat-trend.negative {
      background: #fee2e2;
      color: #dc2626;
    }
  `]
})
export class StatCardComponent {
  @Input() label: string = '';
  @Input() value: string | number = '';
  @Input() subtitle?: string;
  @Input() variant: 'primary' | 'success' | 'warning' | 'danger' | 'info' = 'primary';
  @Input() trend?: number;
}
