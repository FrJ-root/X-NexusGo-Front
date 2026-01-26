import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SalesOrdersApiService } from '../../../api/sales-orders-api.service';
import { ShipmentsApiService } from '../../../api/shipments-api.service';
import { AuthService, User } from '../../../core/auth/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { SalesOrder, Shipment, Page, OrderStatus, ShipmentStatus } from '../../../shared/models';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="dashboard">
      <!-- Welcome Banner -->
      <div class="welcome-banner">
        <div class="welcome-content">
          <div class="welcome-text">
            <span class="greeting-label">{{ getGreeting() }}</span>
            <h1>{{ userName() }} 👋</h1>
            <p>Bienvenue sur votre espace client. Suivez vos commandes et gérez vos livraisons en temps réel.</p>
          </div>
          <div class="welcome-actions">
            <a routerLink="/client/orders/create" class="btn btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
              Nouvelle commande
            </a>
            <a routerLink="/client/orders" class="btn btn-outline">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z"/></svg>
              Mes commandes
            </a>
          </div>
        </div>
        <div class="welcome-illustration">
          <div class="illustration-circles">
            <div class="circle circle-1"></div>
            <div class="circle circle-2"></div>
            <div class="circle circle-3"></div>
          </div>
          <div class="truck-icon">🚚</div>
        </div>
      </div>

      @if (loading()) {
        <app-loading-spinner message="Chargement de vos données..." />
      } @else {
        <!-- Stats Cards -->
        <div class="stats-row">
          <div class="stat-card stat-primary">
            <div class="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ totalOrders() }}</span>
              <span class="stat-label">Total commandes</span>
            </div>
            <div class="stat-badge">Tout temps</div>
          </div>

          <div class="stat-card stat-warning">
            <div class="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ pendingOrders() }}</span>
              <span class="stat-label">En cours</span>
            </div>
            <div class="stat-badge">À suivre</div>
          </div>

          <div class="stat-card stat-success">
            <div class="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ deliveredOrders() }}</span>
              <span class="stat-label">Livrées</span>
            </div>
            <div class="stat-badge">Terminées</div>
          </div>

          <div class="stat-card stat-info">
            <div class="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ activeShipments() }}</span>
              <span class="stat-label">En transit</span>
            </div>
            <div class="stat-badge">Actif</div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="main-grid">
          <!-- Quick Actions -->
          <div class="card quick-actions-card">
            <div class="card-header">
              <h2>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Actions rapides
              </h2>
            </div>
            <div class="actions-grid">
              <a routerLink="/client/products" class="action-tile">
                <div class="action-icon catalog">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                </div>
                <div class="action-info">
                  <span class="action-title">Catalogue produits</span>
                  <span class="action-desc">Parcourir les articles disponibles</span>
                </div>
                <svg class="action-arrow" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>

              <a routerLink="/client/orders/create" class="action-tile highlight">
                <div class="action-icon order">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                </div>
                <div class="action-info">
                  <span class="action-title">Passer commande</span>
                  <span class="action-desc">Créer une nouvelle commande</span>
                </div>
                <svg class="action-arrow" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>

              <a routerLink="/client/orders" class="action-tile">
                <div class="action-icon history">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                </div>
                <div class="action-info">
                  <span class="action-title">Historique</span>
                  <span class="action-desc">Voir toutes mes commandes</span>
                </div>
                <svg class="action-arrow" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>

              <a routerLink="/client/shipments" class="action-tile">
                <div class="action-icon tracking">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div class="action-info">
                  <span class="action-title">Suivi livraisons</span>
                  <span class="action-desc">Tracker mes expéditions</span>
                </div>
                <svg class="action-arrow" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
            </div>
          </div>

          <!-- Active Shipments -->
          <div class="card shipments-card">
            <div class="card-header">
              <h2>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
                Expéditions actives
              </h2>
              <a routerLink="/client/shipments" class="card-link">Voir tout →</a>
            </div>
            <div class="shipments-list">
              @for (shipment of recentShipments(); track shipment.id) {
                <div class="shipment-card">
                  <div class="shipment-header">
                    <span class="shipment-id">#{{ shipment.id }}</span>
                    <span class="shipment-status" [class]="'status-' + (shipment.status?.toLowerCase() || 'pending')">
                      {{ getStatusLabel(shipment.status!) }}
                    </span>
                  </div>
                  <div class="shipment-body">
                    <div class="shipment-detail">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><circle cx="7" cy="18" r="2"/></svg>
                      <span>{{ shipment.carrierName || 'Transporteur' }}</span>
                    </div>
                    @if (shipment.trackingNumber) {
                      <div class="shipment-detail">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h10"/><path d="M7 12h10"/><path d="M7 17h10"/></svg>
                        <span>{{ shipment.trackingNumber }}</span>
                      </div>
                    }
                  </div>
                  <div class="shipment-progress">
                    <div class="progress-bar">
                      <div class="progress-fill" [style.width.%]="getShipmentProgress(shipment.status!)"></div>
                    </div>
                    <div class="progress-steps">
                      <span [class.active]="true">Préparé</span>
                      <span [class.active]="shipment.status === 'IN_TRANSIT' || shipment.status === 'DELIVERED'">En transit</span>
                      <span [class.active]="shipment.status === 'DELIVERED'">Livré</span>
                    </div>
                  </div>
                </div>
              }
              @if (recentShipments().length === 0) {
                <div class="empty-state">
                  <div class="empty-icon">📦</div>
                  <span>Aucune expédition en cours</span>
                  <p>Vos livraisons actives apparaîtront ici</p>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Recent Orders Table -->
        <div class="card orders-card">
          <div class="card-header">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z"/></svg>
              Commandes récentes
            </h2>
            <a routerLink="/client/orders" class="card-link">Toutes les commandes →</a>
          </div>
          <div class="orders-table-wrapper">
            <table class="orders-table">
              <thead>
                <tr>
                  <th>N° Commande</th>
                  <th>Date</th>
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
                      <span class="order-date">{{ order.createdAt | date:'dd MMM yyyy' }}</span>
                    </td>
                    <td>
                      <span class="order-items">{{ order.lines?.length || 0 }} article(s)</span>
                    </td>
                    <td>
                      <span class="order-amount">{{ order.totalAmount | number:'1.2-2' }} €</span>
                    </td>
                    <td>
                      <span class="status-pill" [class]="'status-' + order.status?.toLowerCase()">
                        {{ getOrderStatusLabel(order.status!) }}
                      </span>
                    </td>
                    <td>
                      <a [routerLink]="['/client/orders']" [queryParams]="{orderId: order.id}" class="view-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                        Détails
                      </a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
            @if (recentOrders().length === 0) {
              <div class="empty-table">
                <div class="empty-icon">📋</div>
                <span>Aucune commande</span>
                <p>Passez votre première commande dès maintenant !</p>
                <a routerLink="/client/orders/create" class="btn btn-primary btn-sm">Commander</a>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      --primary: #0f172a;
      --primary-dark: #020617;
      --primary-light: #1e293b;
      --primary-gradient: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);
      --secondary: #f97316;
      --secondary-light: #fb923c;
      --secondary-dark: #ea580c;
      --accent: #6366f1;
      --accent-light: #818cf8;
      --success: #059669;
      --success-light: #d1fae5;
      --success-dark: #047857;
      --warning: #d97706;
      --warning-light: #fef3c7;
      --danger: #dc2626;
      --danger-light: #fee2e2;
      --info: #0284c7;
      --info-light: #e0f2fe;
      --gray-900: #0f172a;
      --gray-800: #1e293b;
      --gray-700: #334155;
      --gray-600: #475569;
      --gray-500: #64748b;
      --gray-400: #94a3b8;
      --gray-300: #cbd5e1;
      --gray-200: #e2e8f0;
      --gray-100: #f1f5f9;
      --gray-50: #f8fafc;
      --white: #ffffff;
      --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
      --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
      --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
      --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      --shadow-xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      --shadow-glow: 0 0 40px rgba(249, 115, 22, 0.15);
      --radius-xl: 24px;
      --radius-lg: 16px;
      --radius: 12px;
      --radius-sm: 8px;
      --radius-xs: 6px;
      display: block;
      background: linear-gradient(180deg, var(--gray-50) 0%, var(--gray-100) 100%);
      min-height: 100%;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeInScale {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(-30px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-12px) rotate(3deg); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    @keyframes glow {
      0%, 100% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.3); }
      50% { box-shadow: 0 0 40px rgba(249, 115, 22, 0.5); }
    }

    .dashboard {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 1.5rem 2rem;
      animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    }

    /* Welcome Banner - Professional Hero Section */
    .welcome-banner {
      background: var(--primary-gradient);
      border-radius: var(--radius-xl);
      padding: 2.5rem 3rem;
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      overflow: hidden;
      color: var(--white);
      box-shadow: var(--shadow-lg), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }

    .welcome-banner::before {
      content: '';
      position: absolute;
      top: -100%;
      right: -20%;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, transparent 70%);
      border-radius: 50%;
      animation: pulse 4s ease-in-out infinite;
    }

    .welcome-banner::after {
      content: '';
      position: absolute;
      bottom: -80%;
      left: -10%;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
      border-radius: 50%;
    }

    .welcome-content {
      position: relative;
      z-index: 2;
      max-width: 55%;
    }

    .greeting-label {
      font-size: 0.8125rem;
      font-weight: 500;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      opacity: 0.7;
      display: block;
      margin-bottom: 0.5rem;
    }

    .welcome-banner h1 {
      margin: 0 0 0.75rem;
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.5px;
      line-height: 1.2;
      background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.9) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .welcome-banner p {
      margin: 0 0 2rem;
      opacity: 0.8;
      font-size: 1rem;
      line-height: 1.7;
      max-width: 500px;
    }

    .welcome-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.625rem;
      padding: 0.875rem 1.75rem;
      font-size: 0.9375rem;
      font-weight: 600;
      border-radius: var(--radius);
      text-decoration: none;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      border: none;
      letter-spacing: 0.2px;
      position: relative;
      overflow: hidden;
    }

    .btn::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transform: translateX(-100%);
      transition: transform 0.5s ease;
    }

    .btn:hover::before {
      transform: translateX(100%);
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--secondary), var(--secondary-light));
      color: var(--white);
      box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);
    }

    .btn-primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(249, 115, 22, 0.5);
    }

    .btn-primary:active {
      transform: translateY(-1px);
    }

    .btn-outline {
      background: rgba(255, 255, 255, 0.1);
      color: var(--white);
      border: 2px solid rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(10px);
    }

    .btn-outline:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.5);
      transform: translateY(-3px);
    }

    .btn-sm {
      padding: 0.625rem 1.25rem;
      font-size: 0.875rem;
    }

    .welcome-illustration {
      position: relative;
      width: 180px;
      height: 180px;
      flex-shrink: 0;
    }

    .illustration-circles {
      position: absolute;
      inset: 0;
    }

    .circle {
      position: absolute;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.1);
      background: transparent;
    }

    .circle-1 { 
      width: 100%; 
      height: 100%; 
      animation: pulse 3s ease-in-out infinite;
    }
    
    .circle-2 { 
      width: 75%; 
      height: 75%; 
      top: 12.5%; 
      left: 12.5%; 
      animation: pulse 3s ease-in-out infinite 0.5s;
    }
    
    .circle-3 { 
      width: 50%; 
      height: 50%; 
      top: 25%; 
      left: 25%; 
      background: rgba(249, 115, 22, 0.2);
      border: none;
      animation: glow 2s ease-in-out infinite;
    }

    .truck-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 3.5rem;
      animation: float 4s ease-in-out infinite;
      filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3));
    }

    @media (max-width: 900px) {
      .welcome-banner { 
        flex-direction: column; 
        text-align: center; 
        padding: 2rem;
      }
      .welcome-content { max-width: 100%; }
      .welcome-banner p { max-width: 100%; }
      .welcome-actions { justify-content: center; }
      .welcome-illustration { margin-top: 1.5rem; width: 140px; height: 140px; }
    }

    @media (max-width: 600px) {
      .welcome-banner h1 { font-size: 1.5rem; }
      .welcome-illustration { display: none; }
    }

    /* Stats Row - Modern Dashboard Cards */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    @media (max-width: 1200px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px) { .stats-row { grid-template-columns: 1fr; gap: 1rem; } }

    .stat-card {
      background: var(--white);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      box-shadow: var(--shadow-sm);
      position: relative;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      animation: fadeInScale 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
      border: 1px solid var(--gray-100);
    }

    .stat-card:nth-child(1) { animation-delay: 0.1s; }
    .stat-card:nth-child(2) { animation-delay: 0.15s; }
    .stat-card:nth-child(3) { animation-delay: 0.2s; }
    .stat-card:nth-child(4) { animation-delay: 0.25s; }

    .stat-card:hover {
      transform: translateY(-6px);
      box-shadow: var(--shadow-lg);
      border-color: transparent;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      border-radius: 0 4px 4px 0;
    }

    .stat-card::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      opacity: 0.05;
      transform: translate(30%, -30%);
      transition: all 0.4s ease;
    }

    .stat-card:hover::after {
      transform: translate(20%, -20%) scale(1.2);
      opacity: 0.1;
    }

    .stat-primary::before { background: linear-gradient(180deg, var(--primary), var(--primary-light)); }
    .stat-primary::after { background: var(--primary); }
    .stat-warning::before { background: linear-gradient(180deg, var(--secondary), var(--secondary-light)); }
    .stat-warning::after { background: var(--secondary); }
    .stat-success::before { background: linear-gradient(180deg, var(--success), var(--success-dark)); }
    .stat-success::after { background: var(--success); }
    .stat-info::before { background: linear-gradient(180deg, var(--info), #0369a1); }
    .stat-info::after { background: var(--info); }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      position: relative;
    }

    .stat-card:hover .stat-icon {
      transform: scale(1.1) rotate(5deg);
    }

    .stat-primary .stat-icon { 
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.1), rgba(15, 23, 42, 0.05)); 
      color: var(--primary); 
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
    }
    .stat-warning .stat-icon { 
      background: linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(249, 115, 22, 0.05)); 
      color: var(--secondary); 
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
    }
    .stat-success .stat-icon { 
      background: linear-gradient(135deg, rgba(5, 150, 105, 0.15), rgba(5, 150, 105, 0.05)); 
      color: var(--success); 
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
    }
    .stat-info .stat-icon { 
      background: linear-gradient(135deg, rgba(2, 132, 199, 0.15), rgba(2, 132, 199, 0.05)); 
      color: var(--info); 
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
    }

    .stat-content {
      flex: 1;
      min-width: 0;
    }

    .stat-value {
      display: block;
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--gray-900);
      line-height: 1.1;
      letter-spacing: -0.5px;
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--gray-500);
      font-weight: 500;
      margin-top: 0.25rem;
      display: block;
    }

    .stat-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      padding: 0.25rem 0.625rem;
      font-size: 0.6875rem;
      font-weight: 600;
      border-radius: var(--radius-xs);
      background: var(--gray-100);
      color: var(--gray-500);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Cards - Professional Design */
    .card {
      background: var(--white);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
      border: 1px solid var(--gray-100);
      overflow: hidden;
    }

    .card:hover {
      box-shadow: var(--shadow-md);
      border-color: transparent;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--gray-100);
      background: linear-gradient(180deg, var(--white), var(--gray-50));
    }

    .card-header h2 {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
      color: var(--gray-900);
      display: flex;
      align-items: center;
      gap: 0.625rem;
      letter-spacing: -0.2px;
    }

    .card-header h2 svg {
      color: var(--secondary);
      filter: drop-shadow(0 2px 4px rgba(249, 115, 22, 0.2));
    }

    .card-link {
      font-size: 0.8125rem;
      color: var(--secondary);
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .card-link:hover {
      color: var(--secondary-dark);
      transform: translateX(2px);
    }

    /* Main Grid */
    .main-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    @media (max-width: 1000px) {
      .main-grid { grid-template-columns: 1fr; }
    }

    /* Actions Grid - Professional Tiles */
    .actions-grid {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
    }

    .action-tile {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.25rem 1.5rem;
      border-radius: var(--radius);
      text-decoration: none;
      background: var(--gray-50);
      transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      animation: slideInRight 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
      border: 1px solid transparent;
      position: relative;
      overflow: hidden;
    }

    .action-tile::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
      transform: translateX(-100%);
      transition: transform 0.6s ease;
    }

    .action-tile:hover::before {
      transform: translateX(100%);
    }

    .action-tile:nth-child(1) { animation-delay: 0.1s; }
    .action-tile:nth-child(2) { animation-delay: 0.15s; }
    .action-tile:nth-child(3) { animation-delay: 0.2s; }
    .action-tile:nth-child(4) { animation-delay: 0.25s; }

    .action-tile:hover {
      background: var(--white);
      border-color: var(--gray-200);
      transform: translateX(8px);
      box-shadow: var(--shadow);
    }

    .action-tile.highlight {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
      color: var(--white);
      border: none;
      box-shadow: var(--shadow), 0 4px 20px rgba(15, 23, 42, 0.3);
    }

    .action-tile.highlight:hover {
      box-shadow: var(--shadow-lg), 0 8px 30px rgba(15, 23, 42, 0.4);
      transform: translateX(8px) scale(1.01);
    }

    .action-tile.highlight .action-title,
    .action-tile.highlight .action-desc {
      color: var(--white);
    }

    .action-tile.highlight .action-desc {
      opacity: 0.75;
    }

    .action-icon {
      width: 56px;
      height: 56px;
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      position: relative;
    }

    .action-tile:hover .action-icon {
      transform: scale(1.1) rotate(5deg);
    }

    .action-icon.catalog { 
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.12), rgba(15, 23, 42, 0.06)); 
      color: var(--primary); 
    }
    .action-icon.order { 
      background: linear-gradient(135deg, rgba(249, 115, 22, 0.3), rgba(249, 115, 22, 0.15)); 
      color: var(--white); 
    }
    .action-icon.history { 
      background: linear-gradient(135deg, rgba(5, 150, 105, 0.15), rgba(5, 150, 105, 0.06)); 
      color: var(--success); 
    }
    .action-icon.tracking { 
      background: linear-gradient(135deg, rgba(2, 132, 199, 0.15), rgba(2, 132, 199, 0.06)); 
      color: var(--info); 
    }

    .action-info { 
      flex: 1; 
      min-width: 0;
    }
    
    .action-title { 
      display: block; 
      font-weight: 700; 
      font-size: 0.9375rem; 
      color: var(--gray-900); 
      letter-spacing: -0.2px;
    }
    
    .action-desc { 
      display: block; 
      font-size: 0.8125rem; 
      color: var(--gray-500); 
      margin-top: 0.25rem; 
      font-weight: 450;
    }

    .action-arrow {
      color: var(--gray-300);
      transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      flex-shrink: 0;
    }

    .action-tile:hover .action-arrow {
      transform: translateX(6px);
      color: var(--secondary);
    }

    .action-tile.highlight .action-arrow {
      color: rgba(255, 255, 255, 0.5);
    }

    .action-tile.highlight:hover .action-arrow {
      color: var(--white);
    }

    /* Shipments List - Modern Cards */
    .shipments-list {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .shipment-card {
      border: 1px solid var(--gray-200);
      border-radius: var(--radius);
      padding: 1.25rem;
      background: linear-gradient(180deg, var(--white), var(--gray-50));
      transition: all 0.3s ease;
    }

    .shipment-card:hover {
      border-color: var(--gray-300);
      box-shadow: var(--shadow-sm);
    }

    .shipment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .shipment-id {
      font-weight: 700;
      color: var(--gray-900);
      font-size: 0.9375rem;
    }

    .shipment-status {
      padding: 0.375rem 0.875rem;
      border-radius: 50px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .shipment-status.status-pending { 
      background: linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(249, 115, 22, 0.08)); 
      color: var(--secondary-dark); 
    }
    .shipment-status.status-in_transit { 
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.12), rgba(15, 23, 42, 0.06)); 
      color: var(--primary); 
    }
    .shipment-status.status-delivered { 
      background: linear-gradient(135deg, rgba(5, 150, 105, 0.15), rgba(5, 150, 105, 0.08)); 
      color: var(--success-dark); 
    }
    .shipment-status.status-canceled { 
      background: linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(220, 38, 38, 0.08)); 
      color: var(--danger); 
    }

    .shipment-body {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
    }

    .shipment-detail {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: var(--gray-600);
      font-weight: 500;
    }

    .shipment-detail svg {
      color: var(--gray-400);
    }

    .shipment-progress {
      margin-top: 0.75rem;
    }

    .progress-bar {
      height: 8px;
      background: var(--gray-200);
      border-radius: 4px;
      overflow: hidden;
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--primary), var(--secondary), var(--success));
      background-size: 200% 100%;
      border-radius: 4px;
      transition: width 1s cubic-bezier(0.22, 1, 0.36, 1);
      box-shadow: 0 0 10px rgba(249, 115, 22, 0.3);
    }

    .progress-steps {
      display: flex;
      justify-content: space-between;
      margin-top: 0.625rem;
      font-size: 0.75rem;
      color: var(--gray-400);
      font-weight: 500;
    }

    .progress-steps span.active {
      color: var(--primary);
      font-weight: 600;
    }

    /* Orders Table - Professional Design */
    .orders-card {
      margin-bottom: 2rem;
      animation-delay: 0.3s;
    }

    .orders-table-wrapper {
      overflow-x: auto;
    }

    .orders-table {
      width: 100%;
      border-collapse: collapse;
    }

    .orders-table th {
      padding: 1rem 1.5rem;
      text-align: left;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--gray-500);
      background: var(--gray-50);
      border-bottom: 2px solid var(--gray-200);
    }

    .orders-table td {
      padding: 1.125rem 1.5rem;
      border-bottom: 1px solid var(--gray-100);
      vertical-align: middle;
    }

    .orders-table tbody tr {
      transition: all 0.3s ease;
    }

    .orders-table tbody tr:hover {
      background: linear-gradient(90deg, var(--gray-50), var(--white));
    }

    .order-id { 
      font-weight: 700; 
      color: var(--gray-900); 
      font-size: 0.9375rem;
    }
    
    .order-date { 
      color: var(--gray-600); 
      font-size: 0.875rem; 
      font-weight: 500;
    }
    
    .order-items { 
      color: var(--gray-500); 
      font-size: 0.875rem; 
      font-weight: 500;
    }
    
    .order-amount { 
      font-weight: 700; 
      color: var(--gray-900); 
      font-size: 0.9375rem;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      padding: 0.375rem 0.875rem;
      border-radius: 50px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .status-pill.status-created { 
      background: var(--gray-100); 
      color: var(--gray-600); 
    }
    .status-pill.status-confirmed { 
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.12), rgba(15, 23, 42, 0.06)); 
      color: var(--primary); 
    }
    .status-pill.status-reserved,
    .status-pill.status-partially_reserved { 
      background: linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(249, 115, 22, 0.08)); 
      color: var(--secondary-dark); 
    }
    .status-pill.status-shipped { 
      background: linear-gradient(135deg, rgba(2, 132, 199, 0.15), rgba(2, 132, 199, 0.08)); 
      color: var(--info); 
    }
    .status-pill.status-delivered { 
      background: linear-gradient(135deg, rgba(5, 150, 105, 0.15), rgba(5, 150, 105, 0.08)); 
      color: var(--success-dark); 
    }
    .status-pill.status-canceled { 
      background: linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(220, 38, 38, 0.08)); 
      color: var(--danger); 
    }

    .view-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--secondary);
      text-decoration: none;
      border-radius: var(--radius-sm);
      transition: all 0.3s ease;
      background: transparent;
      border: 1px solid transparent;
    }

    .view-btn:hover {
      background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(249, 115, 22, 0.05));
      border-color: rgba(249, 115, 22, 0.2);
      transform: translateX(2px);
    }

    /* Empty States - Professional Design */
    .empty-state, .empty-table {
      padding: 3.5rem 2rem;
      text-align: center;
      background: linear-gradient(180deg, var(--gray-50), var(--white));
      border-radius: var(--radius);
      margin: 1rem;
    }

    .empty-icon {
      font-size: 3.5rem;
      margin-bottom: 1rem;
      filter: grayscale(0.2);
      animation: float 4s ease-in-out infinite;
    }

    .empty-state span, .empty-table span {
      display: block;
      font-weight: 700;
      color: var(--gray-700);
      margin-bottom: 0.5rem;
      font-size: 1rem;
    }

    .empty-state p, .empty-table p {
      margin: 0 0 1.5rem;
      color: var(--gray-500);
      font-size: 0.9375rem;
      line-height: 1.6;
    }
  `]
})
export class ClientDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private ordersApi = inject(SalesOrdersApiService);
  private shipmentsApi = inject(ShipmentsApiService);

  loading = signal(true);
  userName = signal('');
  totalOrders = signal(0);
  pendingOrders = signal(0);
  deliveredOrders = signal(0);
  activeShipments = signal(0);
  recentOrders = signal<SalesOrder[]>([]);
  recentShipments = signal<Shipment[]>([]);

  ngOnInit(): void {
    const user: User | null = this.authService.currentUser();
    this.userName.set(user?.username || 'Client');
    this.loadDashboardData();
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  getShipmentProgress(status: string): number {
    switch (status) {
      case 'PENDING': return 33;
      case 'IN_TRANSIT': return 66;
      case 'DELIVERED': return 100;
      default: return 0;
    }
  }

  loadDashboardData(): void {
    this.loading.set(true);
    
    this.ordersApi.getMyOrders({ size: 100 }).subscribe({
      next: (page: Page<SalesOrder>) => {
        this.totalOrders.set(page.totalElements);
        const orders = page.content;
        this.pendingOrders.set(orders.filter((o: SalesOrder) => [OrderStatus.CREATED, OrderStatus.CONFIRMED, OrderStatus.RESERVED, OrderStatus.PARTIALLY_RESERVED, OrderStatus.SHIPPED].includes(o.status!)).length);
        this.deliveredOrders.set(orders.filter((o: SalesOrder) => o.status === OrderStatus.DELIVERED).length);
        this.recentOrders.set(orders.slice(0, 5));
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.loading.set(false);
        // Set defaults on error
        this.totalOrders.set(0);
        this.pendingOrders.set(0);
        this.deliveredOrders.set(0);
        this.recentOrders.set([]);
      }
    });

    this.shipmentsApi.getMyShipments({ size: 10 }).subscribe({
      next: (page: Page<Shipment>) => {
        this.activeShipments.set(page.content.filter((s: Shipment) => s.status === ShipmentStatus.IN_TRANSIT || s.status === ShipmentStatus.PENDING).length);
        this.recentShipments.set(page.content.filter((s: Shipment) => s.status === ShipmentStatus.PENDING || s.status === ShipmentStatus.IN_TRANSIT).slice(0, 3));
      },
      error: (err) => {
        console.error('Error loading shipments:', err);
        this.activeShipments.set(0);
        this.recentShipments.set([]);
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': 'En préparation',
      'IN_TRANSIT': 'En transit',
      'DELIVERED': 'Livré',
      'CANCELED': 'Annulé'
    };
    return labels[status] || status;
  }

  getOrderStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'CREATED': 'Créée',
      'CONFIRMED': 'Confirmée',
      'RESERVED': 'Réservée',
      'PARTIALLY_RESERVED': 'Partiellement réservée',
      'SHIPPED': 'Expédiée',
      'DELIVERED': 'Livrée',
      'CANCELED': 'Annulée'
    };
    return labels[status] || status;
  }
}
