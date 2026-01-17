import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="error-page">
      <div class="error-content">
        <div class="error-icon">🚫</div>
        <h1 class="error-code">403</h1>
        <h2 class="error-title">Accès refusé</h2>
        <p class="error-message">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <div class="error-actions">
          <a routerLink="/" class="btn btn-primary">Retour à l'accueil</a>
          <a routerLink="/login" class="btn btn-secondary">Se reconnecter</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 2rem;
    }

    .error-content {
      text-align: center;
      background: white;
      padding: 3rem;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      max-width: 480px;
    }

    .error-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .error-code {
      font-size: 6rem;
      font-weight: 800;
      color: #ef4444;
      margin: 0;
      line-height: 1;
    }

    .error-title {
      font-size: 1.5rem;
      color: #374151;
      margin: 1rem 0;
    }

    .error-message {
      color: #6b7280;
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .error-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover {
      background: #2563eb;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }
  `]
})
export class UnauthorizedComponent {}
