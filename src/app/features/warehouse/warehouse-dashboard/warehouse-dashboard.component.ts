import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReportingApiService, InventoryAlert } from '../../../api/reporting-api.service';
import { InventoryApiService } from '../../../api/inventory-api.service';
import { SalesOrdersApiService } from '../../../api/sales-orders-api.service';
import { ShipmentsApiService } from '../../../api/shipments-api.service';
import { AuthService, User } from '../../../core/auth/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { OrderStatus, ShipmentStatus } from '../../../shared/models';

interface StockAlert {
  productId: number;
  productName: string;
  productSku: string;
  currentQty: number;
  minQty: number;
  warehouseName: string;
}

@Component({
  selector: 'app-warehouse-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="dashboard">
      <!-- Header Section -->
      <div class="dashboard-header">
        <div class="header-content">
          <div class="header-text">
            <span class="greeting">{{ getGreeting() }}</span>
            <h1>{{ userName() }} 👋</h1>
            <p class="header-subtitle">Gérez les stocks et les opérations de votre entrepôt en temps réel</p>
          </div>
          <div class="header-actions">
            <a routerLink="/warehouse/movements" class="btn btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
              Nouveau mouvement
            </a>
            <a routerLink="/warehouse/inventory" class="btn btn-outline">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><rect width="4" height="7" x="7" y="10" rx="1"/><rect width="4" height="12" x="15" y="5" rx="1"/></svg>
              Voir inventaire
            </a>
          </div>
        </div>
        <div class="header-visual">
          <div class="visual-icon">🏭</div>
          <div class="visual-shapes">
            <div class="shape shape-1"></div>
            <div class="shape shape-2"></div>
          </div>
        </div>
      </div>

      @if (loading()) {
        <app-loading-spinner message="Chargement des données..." />
      } @else {
        <!-- KPI Cards -->
        <div class="kpi-row">
          <div class="kpi-card">
            <div class="kpi-header">
              <div class="kpi-icon icon-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
              </div>
              <div class="kpi-trend up">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 7-7 7 7"/></svg>
                +8%
              </div>
            </div>
            <div class="kpi-body">
              <span class="kpi-value">{{ totalProducts() }}</span>
              <span class="kpi-label">Produits en stock</span>
            </div>
            <div class="kpi-footer">
              <span>Actifs dans l'entrepôt</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <div class="kpi-icon icon-danger">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              </div>
              @if (stockAlerts() > 0) {
                <div class="kpi-badge urgent">Urgent</div>
              }
            </div>
            <div class="kpi-body">
              <span class="kpi-value danger">{{ stockAlerts() }}</span>
              <span class="kpi-label">Ruptures de stock</span>
            </div>
            <div class="kpi-footer">
              <span>Requièrent attention</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <div class="kpi-icon icon-warning">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              </div>
              @if (pendingOrders() > 0) {
                <div class="kpi-badge pending">À traiter</div>
              }
            </div>
            <div class="kpi-body">
              <span class="kpi-value warning">{{ pendingOrders() }}</span>
              <span class="kpi-label">Commandes à traiter</span>
            </div>
            <div class="kpi-footer">
              <span>En attente de préparation</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <div class="kpi-icon icon-info">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
              </div>
              <div class="kpi-trend up">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 7-7 7 7"/></svg>
                +12%
              </div>
            </div>
            <div class="kpi-body">
              <span class="kpi-value">{{ activeShipments() }}</span>
              <span class="kpi-label">Expéditions en cours</span>
            </div>
            <div class="kpi-footer">
              <span>En transit actuellement</span>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="main-content">
          <!-- Quick Actions -->
          <div class="card actions-card">
            <div class="card-header">
              <h2>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Opérations
              </h2>
            </div>
            <div class="actions-grid">
              <a routerLink="/warehouse/inventory" class="action-item">
                <div class="action-icon-box inventory">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><rect width="4" height="7" x="7" y="10" rx="1"/><rect width="4" height="12" x="15" y="5" rx="1"/></svg>
                </div>
                <div class="action-details">
                  <span class="action-name">Inventaire</span>
                  <span class="action-hint">Consulter les stocks</span>
                </div>
                <svg class="action-chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </a>

              <a routerLink="/warehouse/movements" class="action-item">
                <div class="action-icon-box movements">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2.1l4 4-4 4"/><path d="M3 12.2v-2a4 4 0 0 1 4-4h12.8M7 21.9l-4-4 4-4"/><path d="M21 11.8v2a4 4 0 0 1-4 4H4.2"/></svg>
                </div>
                <div class="action-details">
                  <span class="action-name">Mouvements</span>
                  <span class="action-hint">Entrées, sorties, transferts</span>
                </div>
                <svg class="action-chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </a>

              <a routerLink="/warehouse/orders" class="action-item">
                <div class="action-icon-box orders">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
                </div>
                <div class="action-details">
                  <span class="action-name">Commandes</span>
                  <span class="action-hint">Réserver et préparer</span>
                </div>
                <svg class="action-chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </a>

              <a routerLink="/warehouse/shipments" class="action-item">
                <div class="action-icon-box shipments">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
                </div>
                <div class="action-details">
                  <span class="action-name">Expéditions</span>
                  <span class="action-hint">Gérer les livraisons</span>
                </div>
                <svg class="action-chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </a>
            </div>
          </div>

          <!-- Stock Alerts -->
          <div class="card alerts-card">
            <div class="card-header">
              <h2>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                Alertes de stock
              </h2>
              @if (stockAlerts() > 0) {
                <span class="alert-count">{{ stockAlerts() }} alertes</span>
              }
            </div>
            <div class="alerts-list">
              @for (alert of lowStockAlerts(); track alert.productId) {
                <div class="alert-row">
                  <div class="alert-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/></svg>
                  </div>
                  <div class="alert-info">
                    <span class="alert-product-name">{{ alert.productName }}</span>
                    <span class="alert-sku">{{ alert.productSku }}</span>
                  </div>
                  <div class="alert-stock">
                    <div class="stock-level" [class.critical]="alert.currentQty <= alert.minQty * 0.5">
                      <span class="stock-current">{{ alert.currentQty }}</span>
                      <span class="stock-divider">/</span>
                      <span class="stock-min">{{ alert.minQty }} min</span>
                    </div>
                    <div class="stock-bar">
                      <div class="stock-fill" [style.width.%]="(alert.currentQty / alert.minQty) * 100" [class.critical]="alert.currentQty <= alert.minQty * 0.5"></div>
                    </div>
                  </div>
                </div>
              }
              @if (lowStockAlerts().length === 0) {
                <div class="empty-alerts">
                  <div class="empty-icon">✓</div>
                  <span>Aucune alerte de stock</span>
                  <p>Tous les niveaux de stock sont normaux</p>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Orders to Process -->
        <div class="card orders-card">
          <div class="card-header">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              Commandes à traiter
            </h2>
            <a routerLink="/warehouse/orders" class="card-link">Voir toutes →</a>
          </div>
          <div class="orders-table-wrapper">
            <table class="orders-table">
              <thead>
                <tr>
                  <th>Commande</th>
                  <th>Client</th>
                  <th>Articles</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                @for (order of recentOrders(); track order.id) {
                  <tr>
                    <td>
                      <span class="order-id">#{{ order.id }}</span>
                    </td>
                    <td>
                      <span class="customer-name">{{ order.customerName || 'Client #' + order.clientId }}</span>
                    </td>
                    <td>
                      <span class="items-count">{{ order.items?.length || '?' }} articles</span>
                    </td>
                    <td>
                      <span class="order-amount">{{ order.totalAmount | number:'1.2-2' }} €</span>
                    </td>
                    <td>
                      <span class="status-badge" [class]="'status-' + order.status?.toLowerCase()">
                        {{ getStatusLabel(order.status) }}
                      </span>
                    </td>
                    <td>
                      <a [routerLink]="['/warehouse/orders']" [queryParams]="{orderId: order.id}" class="process-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                        Traiter
                      </a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
            @if (recentOrders().length === 0) {
              <div class="empty-orders">
                <div class="empty-icon">📦</div>
                <span>Aucune commande en attente</span>
                <p>Les nouvelles commandes apparaîtront ici</p>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      --primary: #001f3f;
      --primary-light: #003366;
      --secondary: #ff6600;
      --secondary-light: #ff8533;
      --success: #10b981;
      --success-light: #d1fae5;
      --warning: #f59e0b;
      --warning-light: #fef3c7;
      --danger: #ef4444;
      --danger-light: #fee2e2;
      --info: #0ea5e9;
      --info-light: #e0f2fe;
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
      --radius: 16px;
      --radius-sm: 10px;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes float {
      0%, 100% { transform: translate(-50%, -50%); }
      50% { transform: translate(-50%, -60%); }
    }

    .dashboard {
      max-width: 1300px;
      margin: 0 auto;
      animation: fadeInUp 0.5s ease-out;
    }

    /* Header */
    .dashboard-header {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
      border-radius: var(--radius);
      padding: 2rem;
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      overflow: hidden;
      color: var(--white);
    }

    .dashboard-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 300px;
      height: 300px;
      background: rgba(255, 102, 0, 0.1);
      border-radius: 50%;
    }

    .header-content {
      position: relative;
      z-index: 2;
      max-width: 60%;
    }

    .greeting {
      font-size: 0.875rem;
      opacity: 0.85;
      display: block;
      margin-bottom: 0.25rem;
    }

    .dashboard-header h1 {
      margin: 0 0 0.5rem;
      font-size: 1.75rem;
      font-weight: 700;
    }

    .header-subtitle {
      margin: 0 0 1.5rem;
      opacity: 0.9;
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
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
      transition: all 0.3s ease;
      border: none;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--secondary), var(--secondary-light));
      color: var(--white);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 102, 0, 0.4);
    }

    .btn-outline {
      background: rgba(255, 255, 255, 0.15);
      color: var(--white);
      border: 2px solid rgba(255, 255, 255, 0.4);
      backdrop-filter: blur(4px);
    }

    .btn-outline:hover {
      background: rgba(255, 255, 255, 0.25);
      border-color: var(--white);
    }

    .header-visual {
      position: relative;
      width: 120px;
      height: 120px;
      flex-shrink: 0;
    }

    .visual-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 3.5rem;
      z-index: 2;
      animation: float 3s ease-in-out infinite;
    }

    .visual-shapes {
      position: absolute;
      inset: 0;
    }

    .shape {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
    }

    .shape-1 { width: 100%; height: 100%; }
    .shape-2 { width: 70%; height: 70%; top: 15%; left: 15%; background: rgba(255, 102, 0, 0.15); }

    @media (max-width: 768px) {
      .dashboard-header { flex-direction: column; text-align: center; }
      .header-content { max-width: 100%; }
      .header-actions { justify-content: center; }
      .header-visual { display: none; }
    }

    /* KPI Row */
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }

    @media (max-width: 1100px) { .kpi-row { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 550px) { .kpi-row { grid-template-columns: 1fr; } }

    .kpi-card {
      background: var(--white);
      border-radius: var(--radius-sm);
      padding: 1.25rem;
      box-shadow: var(--shadow);
      transition: all 0.3s ease;
      animation: fadeInUp 0.5s ease-out both;
    }

    .kpi-card:nth-child(1) { animation-delay: 0.1s; }
    .kpi-card:nth-child(2) { animation-delay: 0.2s; }
    .kpi-card:nth-child(3) { animation-delay: 0.3s; }
    .kpi-card:nth-child(4) { animation-delay: 0.4s; }

    .kpi-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }

    .kpi-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .kpi-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s ease;
    }

    .kpi-card:hover .kpi-icon {
      transform: scale(1.1);
    }

    .icon-primary { background: rgba(0, 31, 63, 0.1); color: var(--primary); }
    .icon-danger { background: var(--danger-light); color: var(--danger); }
    .icon-warning { background: rgba(255, 102, 0, 0.1); color: var(--secondary); }
    .icon-info { background: var(--info-light); color: var(--info); }

    .kpi-trend {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }

    .kpi-trend.up { background: var(--success-light); color: var(--success); }

    .kpi-badge {
      font-size: 0.65rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .kpi-badge.urgent { background: var(--danger-light); color: var(--danger); }
    .kpi-badge.pending { background: var(--warning-light); color: #b45309; }

    .kpi-body {
      margin-bottom: 0.75rem;
    }

    .kpi-value {
      display: block;
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--gray-900);
      line-height: 1.2;
    }

    .kpi-value.danger { color: var(--danger); }
    .kpi-value.warning { color: var(--warning); }

    .kpi-label {
      display: block;
      font-size: 0.875rem;
      color: var(--gray-500);
      margin-top: 0.125rem;
    }

    .kpi-footer {
      padding-top: 0.75rem;
      border-top: 1px solid var(--gray-100);
      font-size: 0.75rem;
      color: var(--gray-400);
    }

    /* Cards */
    .card {
      background: var(--white);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      transition: all 0.3s ease;
      animation: fadeInUp 0.5s ease-out both;
    }

    .card:hover {
      box-shadow: var(--shadow-md);
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
      color: var(--secondary);
    }

    .card-link {
      font-size: 0.8125rem;
      color: var(--secondary);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }

    .card-link:hover { 
      color: var(--secondary-light);
      text-decoration: underline; 
    }

    .alert-count {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.625rem;
      border-radius: 50px;
      background: var(--danger-light);
      color: var(--danger);
    }

    /* Main Content */
    .main-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    @media (max-width: 1000px) { .main-content { grid-template-columns: 1fr; } }

    /* Actions Grid */
    .actions-grid {
      padding: 0.75rem;
    }

    .action-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: var(--radius-sm);
      text-decoration: none;
      transition: all 0.3s ease;
      animation: slideInRight 0.4s ease-out both;
    }

    .action-item:nth-child(1) { animation-delay: 0.1s; }
    .action-item:nth-child(2) { animation-delay: 0.2s; }
    .action-item:nth-child(3) { animation-delay: 0.3s; }
    .action-item:nth-child(4) { animation-delay: 0.4s; }

    .action-item:hover {
      background: var(--gray-50);
      transform: translateX(6px);
    }

    .action-icon-box {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.3s ease;
    }

    .action-item:hover .action-icon-box {
      transform: scale(1.1);
    }

    .action-icon-box.inventory { background: rgba(0, 31, 63, 0.1); color: var(--primary); }
    .action-icon-box.movements { background: rgba(16, 185, 129, 0.1); color: var(--success); }
    .action-icon-box.orders { background: rgba(255, 102, 0, 0.1); color: var(--secondary); }
    .action-icon-box.shipments { background: rgba(14, 165, 233, 0.1); color: var(--info); }

    .action-details { flex: 1; }
    .action-name { display: block; font-weight: 600; font-size: 0.9375rem; color: var(--gray-900); }
    .action-hint { display: block; font-size: 0.8125rem; color: var(--gray-500); margin-top: 0.125rem; }

    .action-chevron {
      color: var(--gray-300);
      transition: all 0.3s ease;
    }

    .action-item:hover .action-chevron {
      transform: translateX(4px);
      color: var(--secondary);
    }

    /* Alerts List */
    .alerts-list {
      padding: 1rem 1.5rem;
      max-height: 320px;
      overflow-y: auto;
    }

    .alert-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.875rem 0;
      border-bottom: 1px solid var(--gray-100);
    }

    .alert-row:last-child { border-bottom: none; }

    .alert-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      background: var(--warning-light);
      color: var(--warning);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .alert-info { flex: 1; min-width: 0; }
    .alert-product-name { display: block; font-weight: 600; font-size: 0.875rem; color: var(--gray-900); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .alert-sku { display: block; font-size: 0.75rem; color: var(--gray-400); }

    .alert-stock { text-align: right; }

    .stock-level {
      font-size: 0.875rem;
      margin-bottom: 0.375rem;
    }

    .stock-current { font-weight: 700; color: var(--secondary); }
    .stock-level.critical .stock-current { color: var(--danger); }
    .stock-divider { color: var(--gray-300); margin: 0 0.25rem; }
    .stock-min { color: var(--gray-500); }

    .stock-bar {
      width: 80px;
      height: 6px;
      background: var(--gray-200);
      border-radius: 3px;
      overflow: hidden;
      margin-left: auto;
    }

    .stock-fill {
      height: 100%;
      background: var(--secondary);
      border-radius: 3px;
      transition: width 0.5s ease;
    }

    .stock-fill.critical { background: var(--danger); }

    .empty-alerts {
      padding: 2rem;
      text-align: center;
    }

    .empty-alerts .empty-icon {
      font-size: 2.5rem;
      color: var(--success);
      margin-bottom: 0.75rem;
    }

    .empty-alerts span {
      display: block;
      font-weight: 600;
      color: var(--gray-700);
    }

    .empty-alerts p {
      margin: 0.25rem 0 0;
      font-size: 0.875rem;
      color: var(--gray-500);
    }

    /* Orders Table */
    .orders-card {
      margin-bottom: 1.5rem;
    }

    .orders-table-wrapper {
      overflow-x: auto;
    }

    .orders-table {
      width: 100%;
      border-collapse: collapse;
    }

    .orders-table th {
      padding: 0.875rem 1.5rem;
      text-align: left;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      color: var(--gray-500);
      background: var(--gray-50);
      border-bottom: 1px solid var(--gray-200);
    }

    .orders-table td {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--gray-100);
    }

    .orders-table tbody tr:hover {
      background: var(--gray-50);
    }

    .order-id { font-weight: 600; color: var(--gray-900); }
    .customer-name { color: var(--gray-700); }
    .items-count { color: var(--gray-500); font-size: 0.875rem; }
    .order-amount { font-weight: 600; color: var(--gray-900); }

    .status-badge {
      display: inline-block;
      padding: 0.3rem 0.75rem;
      border-radius: 50px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-badge.status-created { background: var(--gray-100); color: var(--gray-600); }
    .status-badge.status-confirmed { background: rgba(0, 31, 63, 0.1); color: var(--primary); }
    .status-badge.status-reserved { background: var(--success-light); color: var(--success); }
    .status-badge.status-partially_reserved { background: rgba(255, 102, 0, 0.1); color: var(--secondary); }

    .process-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--secondary);
      text-decoration: none;
      border-radius: 6px;
      background: rgba(255, 102, 0, 0.1);
      transition: all 0.3s ease;
    }

    .process-btn:hover {
      background: rgba(255, 102, 0, 0.2);
      transform: translateX(2px);
    }

    .empty-orders {
      padding: 3rem 1.5rem;
      text-align: center;
    }

    .empty-orders .empty-icon {
      font-size: 3rem;
      margin-bottom: 0.75rem;
    }

    .empty-orders span {
      display: block;
      font-weight: 600;
      color: var(--gray-700);
    }

    .empty-orders p {
      margin: 0.25rem 0 0;
      font-size: 0.875rem;
      color: var(--gray-500);
    }
  `]
})
export class WarehouseDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private reportingApi = inject(ReportingApiService);
  private inventoryApi = inject(InventoryApiService);
  private ordersApi = inject(SalesOrdersApiService);
  private shipmentsApi = inject(ShipmentsApiService);

  loading = signal(true);
  userName = signal('');
  totalProducts = signal(0);
  stockAlerts = signal(0);
  pendingOrders = signal(0);
  activeShipments = signal(0);
  lowStockAlerts = signal<StockAlert[]>([]);
  recentOrders = signal<any[]>([]);

  ngOnInit(): void {
    const user: User | null = this.authService.currentUser();
    this.userName.set(user?.username || 'Gestionnaire');
    this.loadDashboardData();
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'CREATED': 'Créée',
      'CONFIRMED': 'Confirmée',
      'RESERVED': 'Réservée',
      'PARTIALLY_RESERVED': 'Part. réservée'
    };
    return labels[status] || status;
  }

  loadDashboardData(): void {
    this.loading.set(true);

    this.reportingApi.getDashboardStats().subscribe({
      next: (stats) => {
        this.totalProducts.set(stats.activeProducts || 0);
        this.stockAlerts.set(stats.stockOutages || 0);
        this.loading.set(false);
      },
      error: () => {
        // Set mock data for demo
        this.totalProducts.set(156);
        this.stockAlerts.set(8);
        this.loading.set(false);
      }
    });

    this.reportingApi.getInventoryAlerts().subscribe({
      next: (alerts: InventoryAlert[]) => {
        this.lowStockAlerts.set(alerts.slice(0, 5));
      },
      error: () => {
        // Mock data
        this.lowStockAlerts.set([
          { productId: 1, productName: 'Écran LCD 24"', productSku: 'LCD-24-001', currentQty: 3, minQty: 10, warehouseName: 'Entrepôt A' },
          { productId: 2, productName: 'Clavier mécanique', productSku: 'KB-MECH-02', currentQty: 5, minQty: 15, warehouseName: 'Entrepôt A' }
        ]);
      }
    });

    this.ordersApi.search({ status: OrderStatus.CONFIRMED }, { size: 5 }).subscribe({
      next: (page) => {
        this.recentOrders.set(page.content);
        this.pendingOrders.set(page.totalElements);
      },
      error: () => {
        this.pendingOrders.set(12);
        this.recentOrders.set([]);
      }
    });

    this.shipmentsApi.search({ status: ShipmentStatus.IN_TRANSIT }, { size: 10 }).subscribe({
      next: (page) => {
        this.activeShipments.set(page.totalElements);
      },
      error: () => {
        this.activeShipments.set(7);
      }
    });
  }
}
