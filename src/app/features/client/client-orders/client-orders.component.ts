import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SalesOrdersApiService } from '../../../api/sales-orders-api.service';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { SearchFiltersComponent, FilterField } from '../../../shared/components/search-filters/search-filters.component';
import { ToastService } from '../../../shared/services/toast.service';
import { SalesOrder, OrderStatus, Page } from '../../../shared/models';

@Component({
  selector: 'app-client-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DataTableComponent,
    SearchFiltersComponent
  ],
  template: `
    <div class="page">
      <!-- Hero Header Section -->
      <div class="page-header-hero">
        <div class="header-content">
          <div class="header-icon">📦</div>
          <div class="header-text">
            <h1>Mes Commandes</h1>
            <p class="subtitle">Suivez vos commandes en temps réel</p>
          </div>
        </div>
        <a routerLink="/client/orders/create" class="btn btn-primary btn-glow">
          <span class="btn-icon">✨</span> Nouvelle commande
        </a>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card stat-total">
          <div class="stat-icon">📋</div>
          <div class="stat-content">
            <span class="stat-value">{{ totalElements() }}</span>
            <span class="stat-label">Commandes totales</span>
          </div>
        </div>
        <div class="stat-card stat-pending">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <span class="stat-value">{{ pendingCount() }}</span>
            <span class="stat-label">En attente</span>
          </div>
        </div>
        <div class="stat-card stat-shipped">
          <div class="stat-icon">🚚</div>
          <div class="stat-content">
            <span class="stat-value">{{ shippedCount() }}</span>
            <span class="stat-label">En livraison</span>
          </div>
        </div>
        <div class="stat-card stat-delivered">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <span class="stat-value">{{ deliveredCount() }}</span>
            <span class="stat-label">Livrées</span>
          </div>
        </div>
      </div>

      <!-- Quick Status Filters -->
      <div class="quick-filters">
        <button 
          class="quick-filter-btn" 
          [class.active]="!selectedQuickFilter()"
          (click)="setQuickFilter(null)"
        >
          Toutes
        </button>
        <button 
          class="quick-filter-btn status-created" 
          [class.active]="selectedQuickFilter() === 'CREATED'"
          (click)="setQuickFilter('CREATED')"
        >
          🆕 Créées
        </button>
        <button 
          class="quick-filter-btn status-reserved" 
          [class.active]="selectedQuickFilter() === 'RESERVED'"
          (click)="setQuickFilter('RESERVED')"
        >
          📦 Réservées
        </button>
        <button 
          class="quick-filter-btn status-shipped" 
          [class.active]="selectedQuickFilter() === 'SHIPPED'"
          (click)="setQuickFilter('SHIPPED')"
        >
          🚚 Expédiées
        </button>
        <button 
          class="quick-filter-btn status-delivered" 
          [class.active]="selectedQuickFilter() === 'DELIVERED'"
          (click)="setQuickFilter('DELIVERED')"
        >
          ✅ Livrées
        </button>
        <button 
          class="quick-filter-btn status-canceled" 
          [class.active]="selectedQuickFilter() === 'CANCELED'"
          (click)="setQuickFilter('CANCELED')"
        >
          ❌ Annulées
        </button>
      </div>

      <!-- Advanced Filters (Collapsible) -->
      <div class="filters-section">
        <button class="toggle-filters-btn" (click)="showAdvancedFilters.set(!showAdvancedFilters())">
          🔍 Filtres avancés 
          <span class="toggle-icon">{{ showAdvancedFilters() ? '▲' : '▼' }}</span>
        </button>
        @if (showAdvancedFilters()) {
          <app-search-filters
            [fields]="filterFields"
            [values]="filterValues()"
            (valuesChange)="filterValues.set($event)"
            (search)="onSearch($event)"
            (reset)="onReset()"
          />
        }
      </div>

      <!-- Orders Table -->
      <div class="orders-table-container">
        <app-data-table
          [columns]="columns"
          [data]="orders()"
          [actions]="actions"
          [loading]="loading()"
          [totalElements]="totalElements()"
          [totalPages]="totalPages()"
          [currentPage]="currentPage()"
          [pageSize]="pageSize()"
          (pageChange)="onPageChange($event)"
          (pageSizeChange)="onPageSizeChange($event)"
          (actionClick)="onAction($event)"
        />
      </div>

      <!-- Order Detail Modal -->
      @if (showDetailModal()) {
        <div class="modal-overlay" (click)="closeDetailModal()">
          <div class="modal modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Commande #{{ selectedOrder()?.id }}</h2>
              <button class="close-btn" (click)="closeDetailModal()">×</button>
            </div>
            <div class="modal-body">
              <div class="order-info">
                <div class="info-item">
                  <span class="label">Statut</span>
                  <span class="status-badge status-{{ selectedOrder()?.status?.toLowerCase() }}">
                    {{ getStatusLabel(selectedOrder()?.status!) }}
                  </span>
                </div>
                <div class="info-item">
                  <span class="label">Date</span>
                  <span>{{ selectedOrder()?.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Total</span>
                  <span class="total">{{ selectedOrder()?.totalAmount | number:'1.2-2' }} €</span>
                </div>
              </div>

              <h3 class="section-title">Articles commandés</h3>
              <table class="lines-table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>SKU</th>
                    <th class="text-right">Qté</th>
                    <th class="text-right">Prix unit.</th>
                    <th class="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  @for (line of selectedOrder()?.lines; track line.id) {
                    <tr>
                      <td>{{ line.productName }}</td>
                      <td class="sku">{{ line.productSku }}</td>
                      <td class="text-right">{{ line.quantity }}</td>
                      <td class="text-right">{{ line.unitPrice | number:'1.2-2' }} €</td>
                      <td class="text-right">{{ (line.quantity * (line.unitPrice || 0)) | number:'1.2-2' }} €</td>
                    </tr>
                  }
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="4" class="text-right"><strong>Total:</strong></td>
                    <td class="text-right"><strong>{{ selectedOrder()?.totalAmount | number:'1.2-2' }} €</strong></td>
                  </tr>
                </tfoot>
              </table>

              <!-- Order Timeline -->
              <h3 class="section-title">Suivi</h3>
              <div class="timeline">
                <div class="timeline-item" [class.completed]="isStatusReached(OrderStatus.CREATED)">
                  <div class="timeline-marker"></div>
                  <div class="timeline-content">
                    <span class="timeline-title">Commande créée</span>
                  </div>
                </div>
                <div class="timeline-item" [class.completed]="isStatusReached(OrderStatus.CONFIRMED)">
                  <div class="timeline-marker"></div>
                  <div class="timeline-content">
                    <span class="timeline-title">Confirmée</span>
                  </div>
                </div>
                <div class="timeline-item" [class.completed]="isStatusReached(OrderStatus.RESERVED)">
                  <div class="timeline-marker"></div>
                  <div class="timeline-content">
                    <span class="timeline-title">Stock réservé</span>
                  </div>
                </div>
                <div class="timeline-item" [class.completed]="isStatusReached(OrderStatus.SHIPPED)">
                  <div class="timeline-marker"></div>
                  <div class="timeline-content">
                    <span class="timeline-title">Expédiée</span>
                  </div>
                </div>
                <div class="timeline-item" [class.completed]="isStatusReached(OrderStatus.DELIVERED)">
                  <div class="timeline-marker"></div>
                  <div class="timeline-content">
                    <span class="timeline-title">Livrée</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              @if (selectedOrder()?.status === OrderStatus.CREATED) {
                <button class="btn btn-success" (click)="showReserveDialog.set(true)">
                  📦 Réserver le stock
                </button>
              }
              <button class="btn btn-secondary" (click)="closeDetailModal()">Fermer</button>
            </div>
          </div>
        </div>
      }

      <!-- Reserve Stock Dialog -->
      @if (showReserveDialog()) {
        <div class="modal-overlay" (click)="showReserveDialog.set(false)">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>📦 Réserver le stock</h2>
              <button class="close-btn" (click)="showReserveDialog.set(false)">×</button>
            </div>
            <div class="modal-body">
              <p>Voulez-vous réserver le stock pour la commande #{{ selectedOrder()?.id }} ?</p>
              
              <div class="reserve-option">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="allowPartialReserve">
                  <span>Autoriser la réservation partielle</span>
                </label>
                <p class="option-hint">
                  Si activé, la commande sera partiellement réservée si tout le stock n'est pas disponible.
                </p>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="showReserveDialog.set(false)">Annuler</button>
              <button class="btn btn-success" (click)="reserveStock()" [disabled]="reserving()">
                @if (reserving()) {
                  <span class="spinner-small"></span> Réservation...
                } @else {
                  ✓ Confirmer la réservation
                }
              </button>
            </div>
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
      --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
      --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
      --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
      --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      --radius-xl: 24px;
      --radius-lg: 16px;
      --radius: 12px;
      --radius-sm: 8px;
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

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    @keyframes glow {
      0%, 100% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.3); }
      50% { box-shadow: 0 0 40px rgba(249, 115, 22, 0.5); }
    }

    .page { 
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 1.5rem 2rem;
      animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    }
    
    /* Hero Header - Premium Design */
    .page-header-hero {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--primary-gradient);
      border-radius: var(--radius-xl);
      padding: 2.5rem 3rem;
      margin-bottom: 2rem;
      color: var(--white);
      position: relative;
      overflow: hidden;
      box-shadow: var(--shadow-lg), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }

    .page-header-hero::before {
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

    .page-header-hero::after {
      content: '';
      position: absolute;
      bottom: -80%;
      left: -10%;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
      border-radius: 50%;
    }

    .header-content { 
      display: flex; 
      align-items: center; 
      gap: 1.5rem;
      position: relative;
      z-index: 2;
    }

    .header-icon { 
      font-size: 3.5rem; 
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      padding: 1.25rem; 
      border-radius: var(--radius-lg);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .header-text h1 { 
      margin: 0; 
      font-size: 2.25rem; 
      font-weight: 800;
      letter-spacing: -0.5px;
      background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.9) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .header-text .subtitle { 
      margin: 0.5rem 0 0; 
      opacity: 0.8; 
      font-size: 1.0625rem;
      font-weight: 450;
    }
    
    .btn-glow {
      background: linear-gradient(135deg, var(--secondary), var(--secondary-light)) !important;
      color: var(--white) !important;
      font-weight: 700;
      padding: 1rem 2rem !important;
      box-shadow: 0 4px 20px rgba(249, 115, 22, 0.4);
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      border-radius: var(--radius) !important;
      position: relative;
      z-index: 2;
    }

    .btn-glow:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 30px rgba(249, 115, 22, 0.5);
    }

    .btn-icon { margin-right: 0.375rem; }

    /* Stats Grid - Modern Cards */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    @media (max-width: 1200px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px) { .stats-grid { grid-template-columns: 1fr; } }
    
    .stat-card {
      background: var(--white);
      border-radius: var(--radius-lg);
      padding: 1.5rem 1.75rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-100);
      position: relative;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      animation: fadeInScale 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
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

    .stat-total::before { background: linear-gradient(180deg, var(--primary), var(--primary-light)); }
    .stat-pending::before { background: linear-gradient(180deg, var(--secondary), var(--secondary-light)); }
    .stat-shipped::before { background: linear-gradient(180deg, var(--accent), var(--accent-light)); }
    .stat-delivered::before { background: linear-gradient(180deg, var(--success), var(--success-dark)); }
    
    .stat-icon { 
      font-size: 2.5rem;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius);
      background: var(--gray-50);
      transition: transform 0.3s ease;
    }

    .stat-card:hover .stat-icon {
      transform: scale(1.1) rotate(5deg);
    }

    .stat-content { 
      display: flex; 
      flex-direction: column;
    }

    .stat-value { 
      font-size: 2rem; 
      font-weight: 800; 
      color: var(--gray-900);
      line-height: 1.1;
      letter-spacing: -0.5px;
    }

    .stat-label { 
      font-size: 0.8125rem; 
      color: var(--gray-500); 
      text-transform: uppercase; 
      letter-spacing: 0.5px;
      font-weight: 600;
      margin-top: 0.25rem;
    }

    /* Quick Filters - Pill Style */
    .quick-filters {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      padding: 1.25rem;
      background: var(--white);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-100);
    }

    .quick-filter-btn {
      padding: 0.75rem 1.5rem;
      border-radius: 50px;
      border: 2px solid var(--gray-200);
      background: var(--white);
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--gray-600);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .quick-filter-btn:hover { 
      border-color: var(--gray-300); 
      background: var(--gray-50);
      transform: translateY(-2px);
    }

    .quick-filter-btn.active { 
      background: var(--primary);
      color: var(--white); 
      border-color: var(--primary);
      box-shadow: 0 4px 15px rgba(15, 23, 42, 0.25);
    }

    .quick-filter-btn.status-created.active { background: var(--gray-600); border-color: var(--gray-600); }
    .quick-filter-btn.status-reserved.active { background: var(--secondary); border-color: var(--secondary); box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3); }
    .quick-filter-btn.status-shipped.active { background: var(--accent); border-color: var(--accent); box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3); }
    .quick-filter-btn.status-delivered.active { background: var(--success); border-color: var(--success); box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3); }
    .quick-filter-btn.status-canceled.active { background: var(--danger); border-color: var(--danger); box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3); }

    /* Filters Section */
    .filters-section { 
      margin-bottom: 1.5rem;
    }

    .toggle-filters-btn {
      background: var(--white);
      border: 1px solid var(--gray-200);
      padding: 0.875rem 1.5rem;
      border-radius: var(--radius);
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--gray-700);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.625rem;
      margin-bottom: 1rem;
      transition: all 0.3s ease;
    }

    .toggle-filters-btn:hover { 
      background: var(--gray-50); 
      border-color: var(--gray-300);
    }

    .toggle-icon { 
      font-size: 0.75rem; 
      color: var(--gray-400);
    }

    /* Orders Table Container */
    .orders-table-container {
      background: var(--white);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-100);
      overflow: hidden;
      animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
    }

    /* Buttons */
    .btn { 
      padding: 0.75rem 1.5rem; 
      border-radius: var(--radius); 
      font-weight: 600; 
      font-size: 0.9375rem; 
      cursor: pointer; 
      border: none; 
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1); 
      display: inline-flex; 
      align-items: center; 
      gap: 0.5rem; 
      text-decoration: none;
    }

    .btn-primary { 
      background: linear-gradient(135deg, var(--primary), var(--primary-light));
      color: var(--white);
    }

    .btn-primary:hover { 
      transform: translateY(-2px);
      box-shadow: var(--shadow);
    }

    .btn-secondary { 
      background: var(--gray-100); 
      color: var(--gray-700);
    }

    .btn-secondary:hover {
      background: var(--gray-200);
    }

    .btn-danger { 
      background: linear-gradient(135deg, var(--danger), #ef4444);
      color: var(--white);
    }

    .btn-danger:hover { 
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
    }

    /* Modal Styles - Premium Design */
    .modal-overlay { 
      position: fixed; 
      top: 0; 
      left: 0; 
      right: 0; 
      bottom: 0; 
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(8px); 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      z-index: 1000; 
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .modal { 
      background: var(--white); 
      border-radius: var(--radius-xl); 
      width: 100%; 
      max-width: 550px; 
      max-height: 90vh; 
      overflow-y: auto; 
      animation: slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      box-shadow: var(--shadow-lg);
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .modal::-webkit-scrollbar {
      display: none;
    }

    .modal-lg { max-width: 800px; }

    .modal-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      padding: 1.75rem 2rem; 
      border-bottom: 1px solid var(--gray-100);
      background: var(--primary-gradient);
      color: var(--white); 
      border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    }

    .modal-header h2 { 
      margin: 0; 
      font-size: 1.375rem; 
      font-weight: 700;
    }

    .close-btn { 
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      font-size: 1.25rem; 
      color: var(--white); 
      cursor: pointer; 
      width: 40px; 
      height: 40px; 
      border-radius: 50%; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      transition: all 0.3s ease;
    }

    .close-btn:hover { 
      background: rgba(255, 255, 255, 0.25);
    }

    .modal-body { 
      padding: 2rem;
    }

    .modal-footer { 
      display: flex; 
      justify-content: flex-end; 
      gap: 1rem; 
      padding: 1.5rem 2rem; 
      border-top: 1px solid var(--gray-100); 
      background: var(--gray-50); 
      border-radius: 0 0 var(--radius-xl) var(--radius-xl);
    }

    /* Order Info Grid */
    .order-info { 
      display: grid; 
      grid-template-columns: repeat(3, 1fr); 
      gap: 1.5rem; 
      margin-bottom: 2rem; 
      padding: 1.75rem; 
      background: linear-gradient(135deg, var(--gray-50), var(--white));
      border-radius: var(--radius-lg);
      border: 1px solid var(--gray-100);
    }

    .info-item { 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      text-align: center;
    }

    .info-item .label { 
      font-size: 0.75rem; 
      color: var(--gray-500); 
      text-transform: uppercase; 
      margin-bottom: 0.625rem; 
      letter-spacing: 0.5px; 
      font-weight: 600;
    }

    .info-item .total { 
      font-size: 1.625rem; 
      font-weight: 800; 
      color: var(--gray-900);
      letter-spacing: -0.5px;
    }

    .section-title { 
      font-size: 1.0625rem; 
      font-weight: 700; 
      color: var(--gray-900); 
      margin: 2rem 0 1.25rem; 
      display: flex; 
      align-items: center; 
      gap: 0.625rem;
    }

    .section-title::before { 
      content: ''; 
      width: 4px; 
      height: 24px; 
      background: linear-gradient(180deg, var(--secondary), var(--secondary-light));
      border-radius: 2px;
    }

    /* Lines Table */
    .lines-table { 
      width: 100%; 
      border-collapse: collapse; 
      margin-bottom: 1.5rem; 
      background: var(--white); 
      border-radius: var(--radius); 
      overflow: hidden; 
      box-shadow: var(--shadow-sm);
    }

    .lines-table th, .lines-table td { 
      padding: 1rem 1.25rem; 
      text-align: left; 
      border-bottom: 1px solid var(--gray-100);
    }

    .lines-table th { 
      background: linear-gradient(135deg, var(--gray-50), var(--gray-100));
      font-weight: 700; 
      font-size: 0.75rem; 
      text-transform: uppercase; 
      color: var(--gray-500); 
      letter-spacing: 0.5px;
    }

    .lines-table tbody tr:hover { 
      background: var(--gray-50);
    }

    .lines-table tbody tr:last-child td { 
      border-bottom: none;
    }

    .lines-table tfoot td { 
      border-top: 2px solid var(--gray-200); 
      border-bottom: none; 
      background: var(--gray-50); 
      font-weight: 700;
    }

    .text-right { text-align: right !important; }

    .sku { 
      color: var(--gray-500); 
      font-size: 0.8125rem; 
      font-family: 'SF Mono', Monaco, monospace;
      background: var(--gray-100); 
      padding: 0.25rem 0.625rem; 
      border-radius: var(--radius-sm);
    }

    /* Status Badges */
    .status-badge { 
      display: inline-flex; 
      align-items: center; 
      gap: 0.375rem; 
      padding: 0.5rem 1.125rem; 
      border-radius: 50px; 
      font-size: 0.8125rem; 
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .status-created { 
      background: linear-gradient(135deg, var(--gray-100), var(--gray-200)); 
      color: var(--gray-600);
    }

    .status-confirmed { 
      background: linear-gradient(135deg, var(--info-light), rgba(224, 242, 254, 0.5)); 
      color: var(--info);
    }

    .status-reserved, .status-partially_reserved { 
      background: linear-gradient(135deg, var(--warning-light), rgba(254, 243, 199, 0.5)); 
      color: var(--warning);
    }

    .status-shipped { 
      background: linear-gradient(135deg, rgba(237, 233, 254, 1), rgba(221, 214, 254, 0.5)); 
      color: var(--accent);
    }

    .status-delivered { 
      background: linear-gradient(135deg, var(--success-light), rgba(209, 250, 229, 0.5)); 
      color: var(--success-dark);
    }

    .status-canceled { 
      background: linear-gradient(135deg, var(--danger-light), rgba(254, 226, 226, 0.5)); 
      color: var(--danger);
    }

    /* Timeline */
    .timeline { 
      display: flex; 
      flex-direction: column; 
      gap: 0; 
      padding: 1.75rem; 
      background: linear-gradient(135deg, var(--gray-50), var(--white));
      border-radius: var(--radius-lg);
      border: 1px solid var(--gray-100);
    }

    .timeline-item { 
      display: flex; 
      align-items: center; 
      gap: 1.25rem; 
      padding: 1.125rem 0; 
      position: relative;
    }

    .timeline-item::before { 
      content: ''; 
      position: absolute; 
      left: 13px; 
      top: 0; 
      bottom: 0; 
      width: 2px; 
      background: var(--gray-200);
    }

    .timeline-item:first-child::before { top: 50%; }
    .timeline-item:last-child::before { bottom: 50%; }

    .timeline-marker { 
      width: 28px; 
      height: 28px; 
      border-radius: 50%; 
      background: var(--gray-200); 
      border: 3px solid var(--white); 
      position: relative; 
      z-index: 1; 
      box-shadow: var(--shadow-sm);
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-size: 0.75rem;
      flex-shrink: 0;
    }

    .timeline-item.completed .timeline-marker { 
      background: linear-gradient(135deg, var(--success), var(--success-dark));
    }

    .timeline-item.completed .timeline-marker::after { 
      content: '✓'; 
      color: var(--white); 
      font-weight: bold;
    }

    .timeline-title { 
      font-size: 0.9375rem; 
      color: var(--gray-500);
      font-weight: 500;
    }

    .timeline-item.completed .timeline-title { 
      color: var(--gray-900); 
      font-weight: 600;
    }

    /* Success Button */
    .btn-success { 
      background: linear-gradient(135deg, var(--success), var(--success-dark));
      color: var(--white); 
      box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);
    }

    .btn-success:hover { 
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4);
    }

    .btn-success:disabled { 
      background: var(--gray-300); 
      cursor: not-allowed; 
      box-shadow: none; 
      transform: none;
    }

    /* Reserve Option */
    .reserve-option { 
      background: var(--white); 
      padding: 1.5rem; 
      border-radius: var(--radius); 
      margin-top: 1.25rem; 
      border: 2px solid var(--gray-200);
    }

    .checkbox-label { 
      display: flex; 
      align-items: center; 
      gap: 0.875rem; 
      cursor: pointer; 
      font-weight: 600;
      color: var(--gray-700);
    }

    .checkbox-label input { 
      width: 22px; 
      height: 22px; 
      accent-color: var(--primary); 
      cursor: pointer;
    }

    .option-hint { 
      margin: 0.875rem 0 0; 
      font-size: 0.875rem; 
      color: var(--gray-500); 
      padding-left: 2.25rem;
      line-height: 1.5;
    }

    .spinner-small { 
      display: inline-block; 
      width: 18px; 
      height: 18px; 
      border: 2px solid rgba(255, 255, 255, 0.3); 
      border-top-color: var(--white); 
      border-radius: 50%; 
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 768px) {
      .page-header-hero {
        flex-direction: column;
        text-align: center;
        gap: 1.5rem;
        padding: 2rem;
      }
      
      .header-content {
        flex-direction: column;
      }
      
      .order-info {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ClientOrdersComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private ordersApi = inject(SalesOrdersApiService);
  private toast = inject(ToastService);

  // Expose enum to template
  OrderStatus = OrderStatus;

  orders = signal<SalesOrder[]>([]);
  loading = signal(false);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);
  filterValues = signal<Record<string, any>>({});

  // UI state
  showDetailModal = signal(false);
  selectedOrder = signal<SalesOrder | null>(null);
  showAdvancedFilters = signal(false);
  selectedQuickFilter = signal<string | null>(null);

  // Computed stats from orders
  pendingCount = computed(() => this.orders().filter(o => o.status === 'CREATED' || o.status === 'CONFIRMED' || o.status === 'RESERVED').length);
  shippedCount = computed(() => this.orders().filter(o => o.status === 'SHIPPED').length);
  deliveredCount = computed(() => this.orders().filter(o => o.status === 'DELIVERED').length);

  // Reserve stock
  showReserveDialog = signal(false);
  allowPartialReserve = false;
  reserving = signal(false);

  private statusOrder: OrderStatus[] = [OrderStatus.CREATED, OrderStatus.CONFIRMED, OrderStatus.RESERVED, OrderStatus.SHIPPED, OrderStatus.DELIVERED];

  columns: TableColumn[] = [
    { key: 'id', label: 'N° Commande', width: '100px' },
    { key: 'createdAt', label: 'Date', template: 'date', sortable: true },
    { key: 'status', label: 'Statut', template: 'status' },
    { key: 'totalAmount', label: 'Montant Total', template: 'currency', align: 'right' }
  ];

  actions: TableAction[] = [
    { icon: '⦿', label: 'Voir détails', action: 'view', variant: 'primary' }
  ];

  filterFields: FilterField[] = [
    { key: 'status', label: 'Statut', type: 'select', options: [
      { value: 'CREATED', label: 'Créé' },
      { value: 'CONFIRMED', label: 'Confirmé' },
      { value: 'RESERVED', label: 'Réservé' },
      { value: 'SHIPPED', label: 'Expédié' },
      { value: 'DELIVERED', label: 'Livré' },
      { value: 'CANCELED', label: 'Annulé' }
    ]}
  ];

  ngOnInit(): void {
    this.loadOrders();

    this.route.queryParams.subscribe(params => {
      if (params['orderId']) {
        this.loadOrderById(Number(params['orderId']));
      }
    });
  }

  loadOrders(): void {
    this.loading.set(true);
    this.ordersApi.getMyOrders({ page: this.currentPage(), size: this.pageSize(), ...this.filterValues() }).subscribe({
      next: (page: Page<SalesOrder>) => {
        this.orders.set(page.content);
        this.totalElements.set(page.totalElements);
        this.totalPages.set(page.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadOrderById(id: number): void {
    this.ordersApi.getById(id).subscribe({
      next: (order: SalesOrder) => {
        this.selectedOrder.set(order);
        this.showDetailModal.set(true);
      }
    });
  }

  onSearch(filters: Record<string, any>): void {
    this.filterValues.set(filters);
    this.selectedQuickFilter.set(null);
    this.currentPage.set(0);
    this.loadOrders();
  }

  onReset(): void {
    this.filterValues.set({});
    this.selectedQuickFilter.set(null);
    this.currentPage.set(0);
    this.loadOrders();
  }

  setQuickFilter(status: string | null): void {
    this.selectedQuickFilter.set(status);
    if (status) {
      this.filterValues.set({ status });
    } else {
      this.filterValues.set({});
    }
    this.currentPage.set(0);
    this.loadOrders();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadOrders();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.loadOrders();
  }

  onAction(event: { action: string; row: SalesOrder }): void {
    if (event.action === 'view') {
      this.loadOrderById(event.row.id!);
    }
  }

  closeDetailModal(): void {
    this.showDetailModal.set(false);
    this.selectedOrder.set(null);
  }

  reserveStock(): void {
    const order = this.selectedOrder();
    if (!order?.id) return;
    this.reserving.set(true);

    this.ordersApi.reserve(order.id, this.allowPartialReserve).subscribe({
      next: (updatedOrder: SalesOrder) => {
        if (updatedOrder.status === 'PARTIALLY_RESERVED') {
          this.toast.warning('Stock partiellement réservé. Certains articles sont indisponibles.');
        } else {
          this.toast.success('Stock réservé avec succès !');
        }
        this.showReserveDialog.set(false);
        this.selectedOrder.set(updatedOrder);
        this.loadOrders();
        this.reserving.set(false);
        this.allowPartialReserve = false;
      },
      error: (err) => {
        if (err.status === 400) {
          this.toast.error('Stock insuffisant pour cette commande');
        } else {
          this.toast.error('Erreur lors de la réservation');
        }
        this.reserving.set(false);
      }
    });
  }

  isStatusReached(status: OrderStatus): boolean {
    const order = this.selectedOrder();
    if (!order?.status) return false;
    if (order.status === 'CANCELED') return status === 'CREATED';
    return this.statusOrder.indexOf(order.status) >= this.statusOrder.indexOf(status);
  }

  getStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      'CREATED': 'Créé',
      'CONFIRMED': 'Confirmé',
      'RESERVED': 'Réservé',
      'PARTIALLY_RESERVED': 'Part. Réservé',
      'SHIPPED': 'Expédié',
      'DELIVERED': 'Livré',
      'CANCELED': 'Annulé'
    };
    return labels[status] || status;
  }
}
