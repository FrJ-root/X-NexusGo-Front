import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card" [class]="'stat-card-' + variant">
      <div class="stat-icon" [class]="'icon-' + variant">
        <span *ngIf="icon">{{ icon }}</span>
        <ng-content *ngIf="!icon" select="[icon]"></ng-content>
      </div>
      <div class="stat-content">
        <p class="stat-label">{{ label }}</p>
        <p class="stat-value">
          <ng-container [ngSwitch]="format">
            <span *ngSwitchCase="'currency'">{{ value | number:'1.2-2' }} €</span>
            <span *ngSwitchCase="'percent'">{{ value }}%</span>
            <span *ngSwitchDefault>{{ value }}</span>
          </ng-container>
        </p>
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
    :host {
      --primary: #001f3f;
      --secondary: #ff6600;
      --secondary-light: #ff8533;
      --success: #10b981;
      --success-light: #d1fae5;
      --success-dark: #047857;
      --warning: #f59e0b;
      --warning-light: #fef3c7;
      --warning-dark: #d97706;
      --danger: #ef4444;
      --danger-light: #fee2e2;
      --danger-dark: #dc2626;
      --info: #0284c7;
      --info-light: #e0f2fe;
      --info-dark: #0369a1;
      --gray-900: #0f172a;
      --gray-600: #475569;
      --gray-500: #64748b;
      --white: #ffffff;
      --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
      --shadow-xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      --radius-lg: 1rem;
      --radius: 0.75rem;
      --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
      --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
    }

    .stat-card {
      background: var(--white);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: var(--shadow-md);
      transition: transform var(--transition-base), box-shadow var(--transition-base);
      cursor: pointer;
      font-family: var(--font-family);
      border-left: 4px solid transparent;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-xl);
    }

    .stat-card-primary {
      border-left-color: var(--secondary);
    }

    .stat-card-success {
      border-left-color: var(--success);
    }

    .stat-card-warning {
      border-left-color: var(--warning);
    }

    .stat-card-danger {
      border-left-color: var(--danger);
    }

    .stat-card-info {
      border-left-color: var(--info);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      flex-shrink: 0;
    }

    .icon-primary { 
      background: rgba(255, 102, 0, 0.1); 
      color: var(--secondary); 
    }
    
    .icon-success { 
      background: var(--success-light); 
      color: var(--success-dark); 
    }
    
    .icon-warning { 
      background: var(--warning-light); 
      color: var(--warning-dark); 
    }
    
    .icon-danger { 
      background: var(--danger-light); 
      color: var(--danger-dark); 
    }
    
    .icon-info { 
      background: var(--info-light); 
      color: var(--info-dark); 
    }

    .stat-content {
      flex: 1;
    }

    .stat-label {
      margin: 0 0 0.5rem 0;
      font-size: 0.875rem;
      color: var(--gray-600);
      font-weight: 500;
      font-family: var(--font-family);
    }

    .stat-value {
      margin: 0;
      font-size: 1.875rem;
      font-weight: 700;
      color: var(--gray-900);
      font-family: var(--font-family);
      line-height: 1;
    }

    .stat-subtitle {
      margin: 0.5rem 0 0;
      font-size: 0.75rem;
      color: var(--gray-500);
      font-family: var(--font-family);
    }

    .stat-trend {
      font-size: 0.875rem;
      font-weight: 600;
      padding: 0.375rem 0.75rem;
      border-radius: 9999px;
      font-family: var(--font-family);
    }

    .stat-trend.positive {
      background: var(--success-light);
      color: var(--success-dark);
    }

    .stat-trend.negative {
      background: var(--danger-light);
      color: var(--danger-dark);
    }
  `]
})
export class StatCardComponent {
  @Input() label: string = '';
  @Input() value: string | number = '';
  @Input() subtitle?: string;
  @Input() variant: 'primary' | 'success' | 'warning' | 'danger' | 'info' = 'primary';
  @Input() trend?: number;
  @Input() icon?: string;
  @Input() format?: 'currency' | 'percent' | 'none' = 'none';
}
