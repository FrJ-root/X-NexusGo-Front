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
      --primary: #001f3f;
      --primary-dark: #001530;
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
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
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
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .dashboard {
      max-width: 1300px;
      margin: 0 auto;
      animation: fadeInUp 0.5s ease-out;
    }

    /* Welcome Banner */
    .welcome-banner {
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

    .welcome-banner::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 300px;
      height: 300px;
      background: rgba(255, 102, 0, 0.1);
      border-radius: 50%;
    }

    .welcome-content {
      position: relative;
      z-index: 2;
      max-width: 60%;
    }

    .greeting-label {
      font-size: 0.875rem;
      opacity: 0.85;
      display: block;
      margin-bottom: 0.25rem;
    }

    .welcome-banner h1 {
      margin: 0 0 0.5rem;
      font-size: 1.75rem;
      font-weight: 700;
    }

    .welcome-banner p {
      margin: 0 0 1.5rem;
      opacity: 0.9;
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .welcome-actions {
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

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.8125rem;
    }

    .welcome-illustration {
      position: relative;
      width: 150px;
      height: 150px;
      flex-shrink: 0;
    }

    .illustration-circles {
      position: absolute;
      inset: 0;
    }

    .circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
    }

    .circle-1 { width: 100%; height: 100%; }
    .circle-2 { width: 70%; height: 70%; top: 15%; left: 15%; }
    .circle-3 { width: 40%; height: 40%; top: 30%; left: 30%; background: rgba(255, 102, 0, 0.2); }

    .truck-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 3rem;
      animation: float 3s ease-in-out infinite;
    }

    @media (max-width: 768px) {
      .welcome-banner { flex-direction: column; text-align: center; }
      .welcome-content { max-width: 100%; }
      .welcome-actions { justify-content: center; }
      .welcome-illustration { display: none; }
    }

    /* Stats Row */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }

    @media (max-width: 1100px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 550px) { .stats-row { grid-template-columns: 1fr; } }

    .stat-card {
      background: var(--white);
      border-radius: var(--radius-sm);
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: var(--shadow);
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      animation: fadeInUp 0.5s ease-out both;
    }

    .stat-card:nth-child(1) { animation-delay: 0.1s; }
    .stat-card:nth-child(2) { animation-delay: 0.2s; }
    .stat-card:nth-child(3) { animation-delay: 0.3s; }
    .stat-card:nth-child(4) { animation-delay: 0.4s; }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .stat-card::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
    }

    .stat-primary::before { background: var(--primary); }
    .stat-warning::before { background: var(--secondary); }
    .stat-success::before { background: var(--success); }
    .stat-info::before { background: var(--info); }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.3s ease;
    }

    .stat-card:hover .stat-icon {
      transform: scale(1.1);
    }

    .stat-primary .stat-icon { background: rgba(0, 31, 63, 0.1); color: var(--primary); }
    .stat-warning .stat-icon { background: rgba(255, 102, 0, 0.1); color: var(--secondary); }
    .stat-success .stat-icon { background: var(--success-light); color: var(--success); }
    .stat-info .stat-icon { background: var(--info-light); color: var(--info); }

    .stat-content {
      flex: 1;
    }

    .stat-value {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--gray-900);
      line-height: 1.2;
    }

    .stat-label {
      font-size: 0.8125rem;
      color: var(--gray-500);
    }

    .stat-badge {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      padding: 0.2rem 0.5rem;
      font-size: 0.65rem;
      font-weight: 600;
      border-radius: 4px;
      background: var(--gray-100);
      color: var(--gray-500);
      text-transform: uppercase;
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

    /* Main Grid */
    .main-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    @media (max-width: 1000px) {
      .main-grid { grid-template-columns: 1fr; }
    }

    /* Actions Grid */
    .actions-grid {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .action-tile {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border-radius: var(--radius-sm);
      text-decoration: none;
      background: var(--gray-50);
      transition: all 0.3s ease;
      animation: slideInRight 0.4s ease-out both;
    }

    .action-tile:nth-child(1) { animation-delay: 0.1s; }
    .action-tile:nth-child(2) { animation-delay: 0.2s; }
    .action-tile:nth-child(3) { animation-delay: 0.3s; }
    .action-tile:nth-child(4) { animation-delay: 0.4s; }

    .action-tile:hover {
      background: var(--gray-100);
      transform: translateX(6px);
    }

    .action-tile.highlight {
      background: linear-gradient(135deg, var(--primary), var(--primary-light));
      color: var(--white);
    }

    .action-tile.highlight:hover {
      box-shadow: var(--shadow-md);
      transform: translateX(6px);
    }

    .action-tile.highlight .action-title,
    .action-tile.highlight .action-desc {
      color: var(--white);
    }

    .action-tile.highlight .action-desc {
      opacity: 0.8;
    }

    .action-icon {
      width: 52px;
      height: 52px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.3s ease;
    }

    .action-tile:hover .action-icon {
      transform: scale(1.1);
    }

    .action-icon.catalog { background: rgba(0, 31, 63, 0.1); color: var(--primary); }
    .action-icon.order { background: rgba(255, 102, 0, 0.2); color: var(--white); }
    .action-icon.history { background: rgba(16, 185, 129, 0.1); color: var(--success); }
    .action-icon.tracking { background: rgba(14, 165, 233, 0.1); color: var(--info); }

    .action-info { flex: 1; }
    .action-title { display: block; font-weight: 600; font-size: 0.9375rem; color: var(--gray-900); }
    .action-desc { display: block; font-size: 0.8125rem; color: var(--gray-500); margin-top: 0.125rem; }

    .action-arrow {
      color: var(--gray-300);
      transition: all 0.3s ease;
    }

    .action-tile:hover .action-arrow {
      transform: translateX(4px);
      color: var(--secondary);
    }

    .action-tile.highlight .action-arrow {
      color: rgba(255, 255, 255, 0.6);
    }

    /* Shipments List */
    .shipments-list {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .shipment-card {
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-sm);
      padding: 1rem;
    }

    .shipment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .shipment-id {
      font-weight: 600;
      color: var(--gray-900);
    }

    .shipment-status {
      padding: 0.25rem 0.625rem;
      border-radius: 50px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .shipment-status.status-pending { background: rgba(255, 102, 0, 0.1); color: var(--secondary); }
    .shipment-status.status-in_transit { background: rgba(0, 31, 63, 0.1); color: var(--primary); }
    .shipment-status.status-delivered { background: var(--success-light); color: var(--success); }
    .shipment-status.status-canceled { background: var(--danger-light); color: var(--danger); }

    .shipment-body {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .shipment-detail {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.8125rem;
      color: var(--gray-600);
    }

    .shipment-detail svg {
      color: var(--gray-400);
    }

    .shipment-progress {
      margin-top: 0.5rem;
    }

    .progress-bar {
      height: 6px;
      background: var(--gray-200);
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--primary), var(--secondary));
      border-radius: 3px;
      transition: width 0.8s ease;
    }

    .progress-steps {
      display: flex;
      justify-content: space-between;
      margin-top: 0.5rem;
      font-size: 0.75rem;
      color: var(--gray-400);
    }

    .progress-steps span.active {
      color: var(--primary);
      font-weight: 500;
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
    .order-date { color: var(--gray-600); font-size: 0.875rem; }
    .order-items { color: var(--gray-500); font-size: 0.875rem; }
    .order-amount { font-weight: 600; color: var(--gray-900); }

    .status-pill {
      display: inline-block;
      padding: 0.3rem 0.75rem;
      border-radius: 50px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-pill.status-created { background: var(--gray-100); color: var(--gray-600); }
    .status-pill.status-confirmed { background: rgba(0, 31, 63, 0.1); color: var(--primary); }
    .status-pill.status-reserved,
    .status-pill.status-partially_reserved { background: rgba(255, 102, 0, 0.1); color: var(--secondary); }
    .status-pill.status-shipped { background: rgba(14, 165, 233, 0.1); color: var(--info); }
    .status-pill.status-delivered { background: var(--success-light); color: var(--success); }
    .status-pill.status-canceled { background: var(--danger-light); color: var(--danger); }

    .view-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--secondary);
      text-decoration: none;
      border-radius: 6px;
      transition: all 0.3s ease;
    }

    .view-btn:hover {
      background: rgba(255, 102, 0, 0.1);
    }

    /* Empty States */
    .empty-state, .empty-table {
      padding: 2.5rem 1.5rem;
      text-align: center;
    }

    .empty-icon {
      font-size: 2.5rem;
      margin-bottom: 0.75rem;
    }

    .empty-state span, .empty-table span {
      display: block;
      font-weight: 600;
      color: var(--gray-700);
      margin-bottom: 0.25rem;
    }

    .empty-state p, .empty-table p {
      margin: 0 0 1rem;
      color: var(--gray-500);
      font-size: 0.875rem;
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
      error: () => {
        this.loading.set(false);
      }
    });

    this.shipmentsApi.getMyShipments({ size: 10 }).subscribe({
      next: (page: Page<Shipment>) => {
        this.activeShipments.set(page.content.filter((s: Shipment) => s.status === ShipmentStatus.IN_TRANSIT || s.status === ShipmentStatus.PENDING).length);
        this.recentShipments.set(page.content.filter((s: Shipment) => s.status === ShipmentStatus.PENDING || s.status === ShipmentStatus.IN_TRANSIT).slice(0, 3));
      },
      error: () => {}
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
