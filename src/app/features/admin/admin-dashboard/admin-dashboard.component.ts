import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReportingApiService } from '../../../api/reporting-api.service';
import { SalesOrdersApiService } from '../../../api/sales-orders-api.service';
import { ProductsApiService } from '../../../api/products-api.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { DashboardStats, SalesOrder, Product, Page } from '../../../shared/models';
import { AuthService } from '../../../core/auth/auth.service';

interface ActivityItem {
  id: number;
  type: 'order' | 'product' | 'shipment' | 'user';
  title: string;
  description: string;
  time: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="dashboard">
      <!-- Welcome Header -->
      <div class="welcome-header">
        <div class="welcome-content">
          <div class="welcome-text">
            <span class="greeting">{{ getGreeting() }}, {{ userName() }} 👋</span>
            <h1>Tableau de bord Administrateur</h1>
            <p>Voici un aperçu de l'activité de votre plateforme logistique</p>
          </div>
          <div class="header-actions">
            <a routerLink="/admin/reporting" class="btn btn-outline">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Exporter
            </a>
            <a routerLink="/admin/orders" class="btn btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
              Nouvelle commande
            </a>
          </div>
        </div>
        <div class="date-display">
          <span class="date-icon">📅</span>
          <span>{{ currentDate }}</span>
        </div>
      </div>

      @if (loading()) {
        <app-loading-spinner message="Chargement des statistiques..." />
      } @else {
        <!-- KPI Cards -->
        <div class="kpi-grid">
          <div class="kpi-card kpi-primary">
            <div class="kpi-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <div class="kpi-content">
              <span class="kpi-value">{{ stats()?.totalOrders ?? 0 }}</span>
              <span class="kpi-label">Commandes totales</span>
              <div class="kpi-trend up">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                <span>+12% ce mois</span>
              </div>
            </div>
          </div>

          <div class="kpi-card kpi-success">
            <div class="kpi-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
            </div>
            <div class="kpi-content">
              <span class="kpi-value">{{ stats()?.activeProducts ?? 0 }}</span>
              <span class="kpi-label">Produits actifs</span>
              <div class="kpi-trend up">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                <span>+5 nouveaux</span>
              </div>
            </div>
          </div>

          <div class="kpi-card kpi-warning">
            <div class="kpi-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            </div>
            <div class="kpi-content">
              <span class="kpi-value">{{ stats()?.stockOutages ?? 0 }}</span>
              <span class="kpi-label">Ruptures de stock</span>
              <div class="kpi-trend down">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 12-7 7-7-7"/><path d="M12 5v14"/></svg>
                <span>-3 vs hier</span>
              </div>
            </div>
          </div>

          <div class="kpi-card kpi-info">
            <div class="kpi-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 18H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.19M15 6h2.81a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H16"/><circle cx="12" cy="12" r="3"/><path d="M12 4v3"/><path d="M12 17v3"/><path d="M8.5 5.5 7 7"/><path d="m17 17-1.5 1.5"/><path d="M5.5 15.5 7 17"/><path d="m17 7-1.5-1.5"/></svg>
            </div>
            <div class="kpi-content">
              <span class="kpi-value">{{ stats()?.deliveryRate ?? 0 }}%</span>
              <span class="kpi-label">Taux de livraison</span>
              <div class="kpi-trend up">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                <span>+2.5% vs semaine</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="content-grid">
          <!-- Orders Pipeline -->
          <div class="card orders-pipeline">
            <div class="card-header">
              <h2>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>
                Pipeline des commandes
              </h2>
              <a routerLink="/admin/orders" class="card-link">Voir tout →</a>
            </div>
            <div class="pipeline-content">
              <div class="pipeline-stage">
                <div class="stage-header">
                  <span class="stage-dot created"></span>
                  <span class="stage-name">Créées</span>
                </div>
                <div class="stage-value">{{ stats()?.ordersCreated ?? 0 }}</div>
                <div class="stage-bar">
                  <div class="stage-progress created" [style.width.%]="getPercentage(stats()?.ordersCreated)"></div>
                </div>
              </div>
              <div class="pipeline-stage">
                <div class="stage-header">
                  <span class="stage-dot reserved"></span>
                  <span class="stage-name">Réservées</span>
                </div>
                <div class="stage-value">{{ stats()?.ordersReserved ?? 0 }}</div>
                <div class="stage-bar">
                  <div class="stage-progress reserved" [style.width.%]="getPercentage(stats()?.ordersReserved)"></div>
                </div>
              </div>
              <div class="pipeline-stage">
                <div class="stage-header">
                  <span class="stage-dot shipped"></span>
                  <span class="stage-name">Expédiées</span>
                </div>
                <div class="stage-value">{{ stats()?.ordersShipped ?? 0 }}</div>
                <div class="stage-bar">
                  <div class="stage-progress shipped" [style.width.%]="getPercentage(stats()?.ordersShipped)"></div>
                </div>
              </div>
              <div class="pipeline-stage">
                <div class="stage-header">
                  <span class="stage-dot delivered"></span>
                  <span class="stage-name">Livrées</span>
                </div>
                <div class="stage-value">{{ stats()?.ordersDelivered ?? 0 }}</div>
                <div class="stage-bar">
                  <div class="stage-progress delivered" [style.width.%]="getPercentage(stats()?.ordersDelivered)"></div>
                </div>
              </div>
              <div class="pipeline-stage">
                <div class="stage-header">
                  <span class="stage-dot canceled"></span>
                  <span class="stage-name">Annulées</span>
                </div>
                <div class="stage-value">{{ stats()?.ordersCanceled ?? 0 }}</div>
                <div class="stage-bar">
                  <div class="stage-progress canceled" [style.width.%]="getPercentage(stats()?.ordersCanceled)"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="card activity-card">
            <div class="card-header">
              <h2>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                Activité récente
              </h2>
            </div>
            <div class="activity-list">
              @for (activity of recentActivity(); track activity.id) {
                <div class="activity-item">
                  <div class="activity-icon" [style.background-color]="activity.color + '20'" [style.color]="activity.color">
                    {{ activity.icon }}
                  </div>
                  <div class="activity-content">
                    <span class="activity-title">{{ activity.title }}</span>
                    <span class="activity-desc">{{ activity.description }}</span>
                  </div>
                  <span class="activity-time">{{ activity.time }}</span>
                </div>
              }
              @if (recentActivity().length === 0) {
                <div class="empty-state">
                  <span>Aucune activité récente</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Quick Actions Grid -->
        <div class="card quick-actions-card">
          <div class="card-header">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Actions rapides
            </h2>
          </div>
          <div class="quick-actions-grid">
            <a routerLink="/admin/users" class="quick-action">
              <div class="action-icon-wrapper users">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div class="action-info">
                <span class="action-title">Utilisateurs</span>
                <span class="action-desc">Gérer les comptes</span>
              </div>
              <svg class="action-arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>

            <a routerLink="/admin/products" class="quick-action">
              <div class="action-icon-wrapper products">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
              </div>
              <div class="action-info">
                <span class="action-title">Produits</span>
                <span class="action-desc">Catalogue & SKU</span>
              </div>
              <svg class="action-arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>

            <a routerLink="/admin/warehouses" class="quick-action">
              <div class="action-icon-wrapper warehouses">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
              </div>
              <div class="action-info">
                <span class="action-title">Entrepôts</span>
                <span class="action-desc">Sites de stockage</span>
              </div>
              <svg class="action-arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>

            <a routerLink="/admin/suppliers" class="quick-action">
              <div class="action-icon-wrapper suppliers">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
              </div>
              <div class="action-info">
                <span class="action-title">Fournisseurs</span>
                <span class="action-desc">Partenaires d'achat</span>
              </div>
              <svg class="action-arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>

            <a routerLink="/admin/purchase-orders" class="quick-action">
              <div class="action-icon-wrapper purchases">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </div>
              <div class="action-info">
                <span class="action-title">Achats</span>
                <span class="action-desc">Bons de commande</span>
              </div>
              <svg class="action-arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>

            <a routerLink="/admin/reporting" class="quick-action">
              <div class="action-icon-wrapper reporting">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
              </div>
              <div class="action-info">
                <span class="action-title">Rapports</span>
                <span class="action-desc">Statistiques & Analytics</span>
              </div>
              <svg class="action-arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
          </div>
        </div>

        <!-- Recent Orders & Products -->
        <div class="bottom-grid">
          <div class="card">
            <div class="card-header">
              <h2>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
                Commandes récentes
              </h2>
              <a routerLink="/admin/orders" class="card-link">Voir tout →</a>
            </div>
            <div class="orders-list">
              @for (order of recentOrders(); track order.id) {
                <div class="order-item">
                  <div class="order-info">
                    <span class="order-id">#{{ order.id }}</span>
                    <span class="order-client">{{ order.clientName || 'Client ' + order.clientId }}</span>
                  </div>
                  <span class="order-status" [class]="'status-' + order.status?.toLowerCase()">
                    {{ getStatusLabel(order.status!) }}
                  </span>
                </div>
              }
              @if (recentOrders().length === 0) {
                <div class="empty-state">Aucune commande récente</div>
              }
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h2>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                Produits populaires
              </h2>
              <a routerLink="/admin/products" class="card-link">Voir tout →</a>
            </div>
            <div class="products-list">
              @for (product of topProducts(); track product.id) {
                <div class="product-item">
                  <div class="product-icon">📦</div>
                  <div class="product-info">
                    <span class="product-name">{{ product.name }}</span>
                    <span class="product-sku">{{ product.sku }}</span>
                  </div>
                  <span class="product-status" [class.active]="product.active">
                    {{ product.active ? 'Actif' : 'Inactif' }}
                  </span>
                </div>
              }
              @if (topProducts().length === 0) {
                <div class="empty-state">Aucun produit</div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      --primary: #4f46e5;
      --primary-light: #818cf8;
      --success: #10b981;
      --success-light: #d1fae5;
      --warning: #f59e0b;
      --warning-light: #fef3c7;
      --danger: #ef4444;
      --danger-light: #fee2e2;
      --info: #06b6d4;
      --info-light: #cffafe;
      --gray-900: #111827;
      --gray-700: #374151;
      --gray-600: #4b5563;
      --gray-500: #6b7280;
      --gray-400: #9ca3af;
      --gray-300: #d1d5db;
      --gray-200: #e5e7eb;
      --gray-100: #f3f4f6;
      --gray-50: #f9fafb;
      --white: #ffffff;
      --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      --radius: 12px;
      --radius-sm: 8px;
    }

    .dashboard {
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Welcome Header */
    .welcome-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .welcome-content {
      display: flex;
      align-items: center;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .greeting {
      display: block;
      font-size: 0.9rem;
      color: var(--gray-500);
      margin-bottom: 0.25rem;
    }

    .welcome-text h1 {
      margin: 0 0 0.25rem;
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--gray-900);
    }

    .welcome-text p {
      margin: 0;
      color: var(--gray-500);
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      font-size: 0.875rem;
      font-weight: 600;
      border-radius: var(--radius-sm);
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--primary), #7c3aed);
      color: var(--white);
    }

    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

    .btn-outline {
      background: var(--white);
      color: var(--gray-700);
      border: 1px solid var(--gray-300);
    }

    .btn-outline:hover {
      background: var(--gray-50);
      border-color: var(--gray-400);
    }

    .date-display {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: var(--white);
      border-radius: var(--radius-sm);
      box-shadow: var(--shadow);
      font-size: 0.875rem;
      color: var(--gray-600);
    }

    /* KPI Cards */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .kpi-card {
      background: var(--white);
      border-radius: var(--radius);
      padding: 1.5rem;
      display: flex;
      gap: 1rem;
      box-shadow: var(--shadow);
      position: relative;
      overflow: hidden;
    }

    .kpi-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
    }

    .kpi-primary::before { background: linear-gradient(90deg, var(--primary), var(--primary-light)); }
    .kpi-success::before { background: linear-gradient(90deg, var(--success), #34d399); }
    .kpi-warning::before { background: linear-gradient(90deg, var(--warning), #fbbf24); }
    .kpi-info::before { background: linear-gradient(90deg, var(--info), #22d3ee); }

    .kpi-icon {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .kpi-primary .kpi-icon { background: rgba(79, 70, 229, 0.1); color: var(--primary); }
    .kpi-success .kpi-icon { background: var(--success-light); color: var(--success); }
    .kpi-warning .kpi-icon { background: var(--warning-light); color: var(--warning); }
    .kpi-info .kpi-icon { background: var(--info-light); color: var(--info); }

    .kpi-content {
      display: flex;
      flex-direction: column;
    }

    .kpi-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--gray-900);
      line-height: 1.2;
    }

    .kpi-label {
      font-size: 0.875rem;
      color: var(--gray-500);
      margin-bottom: 0.5rem;
    }

    .kpi-trend {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .kpi-trend.up { color: var(--success); }
    .kpi-trend.down { color: var(--danger); }

    @media (max-width: 1200px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 640px) {
      .kpi-grid { grid-template-columns: 1fr; }
    }

    /* Cards */
    .card {
      background: var(--white);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--gray-100);
    }

    .card-header h2 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--gray-900);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .card-header h2 svg {
      color: var(--gray-400);
    }

    .card-link {
      font-size: 0.875rem;
      color: var(--primary);
      text-decoration: none;
      font-weight: 500;
    }

    .card-link:hover {
      text-decoration: underline;
    }

    /* Content Grid */
    .content-grid {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    /* Orders Pipeline */
    .pipeline-content {
      padding: 1.5rem;
    }

    .pipeline-stage {
      margin-bottom: 1.25rem;
    }

    .pipeline-stage:last-child {
      margin-bottom: 0;
    }

    .stage-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.375rem;
    }

    .stage-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .stage-dot.created { background: var(--primary); }
    .stage-dot.reserved { background: #3b82f6; }
    .stage-dot.shipped { background: var(--warning); }
    .stage-dot.delivered { background: var(--success); }
    .stage-dot.canceled { background: var(--danger); }

    .stage-name {
      font-size: 0.875rem;
      color: var(--gray-600);
    }

    .stage-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: 0.375rem;
    }

    .stage-bar {
      height: 8px;
      background: var(--gray-100);
      border-radius: 4px;
      overflow: hidden;
    }

    .stage-progress {
      height: 100%;
      border-radius: 4px;
      transition: width 0.5s ease;
    }

    .stage-progress.created { background: linear-gradient(90deg, var(--primary), var(--primary-light)); }
    .stage-progress.reserved { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
    .stage-progress.shipped { background: linear-gradient(90deg, var(--warning), #fbbf24); }
    .stage-progress.delivered { background: linear-gradient(90deg, var(--success), #34d399); }
    .stage-progress.canceled { background: linear-gradient(90deg, var(--danger), #f87171); }

    /* Activity Card */
    .activity-list {
      padding: 0.5rem 0;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.875rem 1.5rem;
      transition: background 0.2s;
    }

    .activity-item:hover {
      background: var(--gray-50);
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .activity-content {
      flex: 1;
      min-width: 0;
    }

    .activity-title {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--gray-900);
    }

    .activity-desc {
      display: block;
      font-size: 0.8rem;
      color: var(--gray-500);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .activity-time {
      font-size: 0.75rem;
      color: var(--gray-400);
      flex-shrink: 0;
    }

    /* Quick Actions */
    .quick-actions-card {
      margin-bottom: 1.5rem;
    }

    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 1rem;
      padding: 1.5rem;
    }

    .quick-action {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: var(--radius-sm);
      text-decoration: none;
      background: var(--gray-50);
      transition: all 0.2s;
    }

    .quick-action:hover {
      background: var(--gray-100);
      transform: translateX(4px);
    }

    .action-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .action-icon-wrapper.users { background: rgba(79, 70, 229, 0.1); color: var(--primary); }
    .action-icon-wrapper.products { background: rgba(16, 185, 129, 0.1); color: var(--success); }
    .action-icon-wrapper.warehouses { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
    .action-icon-wrapper.suppliers { background: rgba(6, 182, 212, 0.1); color: var(--info); }
    .action-icon-wrapper.purchases { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
    .action-icon-wrapper.reporting { background: rgba(236, 72, 153, 0.1); color: #ec4899; }

    .action-info {
      flex: 1;
      min-width: 0;
    }

    .action-title {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--gray-900);
    }

    .action-desc {
      display: block;
      font-size: 0.75rem;
      color: var(--gray-500);
    }

    .action-arrow {
      color: var(--gray-300);
      flex-shrink: 0;
      transition: transform 0.2s;
    }

    .quick-action:hover .action-arrow {
      color: var(--gray-500);
      transform: translateX(4px);
    }

    @media (max-width: 1200px) {
      .quick-actions-grid { grid-template-columns: repeat(3, 1fr); }
    }

    @media (max-width: 768px) {
      .quick-actions-grid { grid-template-columns: repeat(2, 1fr); }
      .content-grid { grid-template-columns: 1fr; }
    }

    @media (max-width: 480px) {
      .quick-actions-grid { grid-template-columns: 1fr; }
    }

    /* Bottom Grid */
    .bottom-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    @media (max-width: 1024px) {
      .bottom-grid { grid-template-columns: 1fr; }
    }

    /* Orders List */
    .orders-list {
      padding: 0.5rem 0;
    }

    .order-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.875rem 1.5rem;
      border-bottom: 1px solid var(--gray-100);
    }

    .order-item:last-child {
      border-bottom: none;
    }

    .order-info {
      display: flex;
      flex-direction: column;
    }

    .order-id {
      font-weight: 600;
      color: var(--gray-900);
      font-size: 0.875rem;
    }

    .order-client {
      font-size: 0.8rem;
      color: var(--gray-500);
    }

    .order-status {
      padding: 0.25rem 0.75rem;
      border-radius: 50px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-created { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
    .status-reserved { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .status-shipped { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
    .status-delivered { background: var(--success-light); color: var(--success); }
    .status-canceled { background: var(--danger-light); color: var(--danger); }

    /* Products List */
    .products-list {
      padding: 0.5rem 0;
    }

    .product-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.875rem 1.5rem;
      border-bottom: 1px solid var(--gray-100);
    }

    .product-item:last-child {
      border-bottom: none;
    }

    .product-icon {
      width: 40px;
      height: 40px;
      background: var(--gray-100);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .product-info {
      flex: 1;
      min-width: 0;
    }

    .product-name {
      display: block;
      font-weight: 500;
      color: var(--gray-900);
      font-size: 0.875rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .product-sku {
      display: block;
      font-size: 0.75rem;
      color: var(--gray-500);
    }

    .product-status {
      padding: 0.25rem 0.75rem;
      border-radius: 50px;
      font-size: 0.75rem;
      font-weight: 500;
      background: var(--gray-100);
      color: var(--gray-500);
    }

    .product-status.active {
      background: var(--success-light);
      color: var(--success);
    }

    /* Empty State */
    .empty-state {
      padding: 2rem;
      text-align: center;
      color: var(--gray-400);
      font-size: 0.875rem;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private reportingApi = inject(ReportingApiService);
  private ordersApi = inject(SalesOrdersApiService);
  private productsApi = inject(ProductsApiService);
  private authService = inject(AuthService);

  loading = signal(true);
  stats = signal<DashboardStats | null>(null);
  recentOrders = signal<SalesOrder[]>([]);
  topProducts = signal<Product[]>([]);
  recentActivity = signal<ActivityItem[]>([]);
  userName = signal('Admin');

  currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  ngOnInit(): void {
    this.loadData();
    this.userName.set(this.authService.getUser()?.firstName || 'Admin');
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  getPercentage(value: number | undefined): number {
    const total = this.stats()?.totalOrders || 1;
    return ((value || 0) / total) * 100;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'CREATED': 'Créée',
      'RESERVED': 'Réservée',
      'SHIPPED': 'Expédiée',
      'DELIVERED': 'Livrée',
      'CANCELED': 'Annulée'
    };
    return labels[status] || status;
  }

  private loadData(): void {
    this.loading.set(true);

    // Load stats
    this.reportingApi.getAdminDashboardStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => {
        // Set mock data on error for demo
        this.stats.set({
          totalOrders: 1234,
          activeProducts: 456,
          stockOutages: 12,
          deliveryRate: 94.5,
          ordersCreated: 45,
          ordersReserved: 67,
          ordersShipped: 89,
          ordersDelivered: 1020,
          ordersCanceled: 13
        });
        this.loading.set(false);
      }
    });

    // Load recent orders
    this.ordersApi.getAll({ page: 0, size: 5, sort: 'createdAt,desc' }).subscribe({
      next: (response: Page<SalesOrder>) => this.recentOrders.set(response.content || []),
      error: () => this.recentOrders.set([])
    });

    // Load top products
    this.productsApi.getProducts({ page: 0, size: 5, active: true }).subscribe({
      next: (response: Page<Product>) => this.topProducts.set(response.content || []),
      error: () => this.topProducts.set([])
    });

    // Set mock activity
    this.recentActivity.set([
      { id: 1, type: 'order', title: 'Nouvelle commande #1234', description: 'Client: Entreprise ABC', time: 'Il y a 5 min', icon: '🛒', color: '#4f46e5' },
      { id: 2, type: 'shipment', title: 'Expédition confirmée', description: 'Commande #1230 en transit', time: 'Il y a 15 min', icon: '🚚', color: '#f59e0b' },
      { id: 3, type: 'product', title: 'Stock bas', description: 'Produit SKU-001 < 10 unités', time: 'Il y a 1h', icon: '⚠️', color: '#ef4444' },
      { id: 4, type: 'user', title: 'Nouvel utilisateur', description: 'Jean Dupont créé', time: 'Il y a 2h', icon: '👤', color: '#10b981' }
    ]);
  }
}
