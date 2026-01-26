import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShipmentsApiService } from '../../../api/shipments-api.service';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { SearchFiltersComponent, FilterField } from '../../../shared/components/search-filters/search-filters.component';
import { ToastService } from '../../../shared/services/toast.service';
import { Shipment, ShipmentStatus, Page } from '../../../shared/models';

@Component({
  selector: 'app-client-shipments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataTableComponent,
    SearchFiltersComponent
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Mes livraisons</h1>
          <p class="subtitle">Suivez vos expéditions en temps réel</p>
        </div>
        
        <!-- Quick Search by Order -->
        <div class="quick-search">
          <input 
            type="number" 
            [(ngModel)]="orderIdSearch" 
            placeholder="N° Commande..."
            class="order-input"
          />
          <button 
            class="btn btn-primary" 
            (click)="searchByOrderId()"
            [disabled]="orderSearching()"
          >
            @if (orderSearching()) {
              <span class="spinner-small"></span>
            } @else {
              🔍 Rechercher
            }
          </button>
        </div>
      </div>

      @if (orderSearchError()) {
        <div class="alert alert-warning">
          {{ orderSearchError() }}
        </div>
      }

      <app-search-filters
        [fields]="filterFields"
        [values]="filterValues()"
        (valuesChange)="filterValues.set($event)"
        (search)="onSearch($event)"
        (reset)="onReset()"
      />

      <app-data-table
        [columns]="columns"
        [data]="shipments()"
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

      <!-- Shipment Detail Modal -->
      @if (showDetailModal()) {
        <div class="modal-overlay" (click)="closeDetailModal()">
          <div class="modal modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>🚚 Expédition #{{ selectedShipment()?.id }}</h2>
              <button class="close-btn" (click)="closeDetailModal()">×</button>
            </div>
            <div class="modal-body">
              <!-- Shipment Status -->
              <div class="status-section">
                <div class="status-header">
                  <span class="status-badge status-{{ selectedShipment()?.status?.toLowerCase() }}">
                    {{ getStatusLabel(selectedShipment()?.status!) }}
                  </span>
                </div>
                
                <!-- Tracking Timeline -->
                <div class="tracking-timeline">
                  <div class="timeline-step" [class.completed]="isStatusReached(ShipmentStatus.PENDING)" [class.current]="selectedShipment()?.status === ShipmentStatus.PENDING">
                    <div class="step-icon">📦</div>
                    <div class="step-info">
                      <span class="step-title">Préparation</span>
                      <span class="step-desc">Commande en cours de préparation</span>
                    </div>
                  </div>
                  <div class="timeline-step" [class.completed]="isStatusReached(ShipmentStatus.IN_TRANSIT)" [class.current]="selectedShipment()?.status === ShipmentStatus.IN_TRANSIT">
                    <div class="step-icon">🚛</div>
                    <div class="step-info">
                      <span class="step-title">En transit</span>
                      <span class="step-desc">Votre colis est en route</span>
                    </div>
                  </div>
                  <div class="timeline-step" [class.completed]="isStatusReached(ShipmentStatus.DELIVERED)" [class.current]="selectedShipment()?.status === ShipmentStatus.DELIVERED">
                    <div class="step-icon">✓</div>
                    <div class="step-info">
                      <span class="step-title">Livré</span>
                      <span class="step-desc">Colis remis au destinataire</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Shipment Details -->
              <div class="details-grid">
                <div class="detail-card">
                  <span class="detail-label">Transporteur</span>
                  <span class="detail-value">{{ selectedShipment()?.carrierName }}</span>
                </div>
                <div class="detail-card">
                  <span class="detail-label">N° de suivi</span>
                  <span class="detail-value tracking">{{ selectedShipment()?.trackingNumber || 'Non disponible' }}</span>
                </div>
                <div class="detail-card">
                  <span class="detail-label">Expédié le</span>
                  <span class="detail-value">{{ selectedShipment()?.shippedDate | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="detail-card">
                  <span class="detail-label">Livraison estimée</span>
                  <span class="detail-value">{{ selectedShipment()?.plannedDate | date:'dd/MM/yyyy' }}</span>
                </div>
              </div>

              <!-- Carrier Info -->
              <div class="address-section">
                <h3>🚚 Transporteur</h3>
                <p class="address">{{ selectedShipment()?.carrierName }}</p>
              </div>

              <!-- Order Reference -->
              <div class="order-reference">
                <span class="ref-label">Commande associée:</span>
                <span class="ref-value">#{{ selectedShipment()?.salesOrderId }}</span>
              </div>
            </div>
            <div class="modal-footer">
              @if (selectedShipment()?.trackingNumber) {
                <button class="btn btn-primary" (click)="copyTrackingNumber()">
                  📋 Copier le n° de suivi
                </button>
              }
              <button class="btn btn-secondary" (click)="closeDetailModal()">Fermer</button>
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
      0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4); }
      50% { opacity: 0.9; box-shadow: 0 0 0 12px rgba(249, 115, 22, 0); }
    }

    @keyframes pulseRing {
      0%, 100% { box-shadow: 0 0 0 0 rgba(2, 132, 199, 0.4); }
      50% { box-shadow: 0 0 0 15px rgba(2, 132, 199, 0); }
    }

    .page { 
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 1.5rem 2rem;
      animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    }

    /* Page Header - Hero Style */
    .page-header { 
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

    .page-header::before {
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

    .page-header h1 { 
      margin: 0; 
      font-size: 2rem; 
      font-weight: 800;
      letter-spacing: -0.5px;
      background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.9) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .subtitle { 
      margin: 0.5rem 0 0; 
      opacity: 0.8; 
      font-size: 1rem;
      font-weight: 450;
    }

    /* Quick Search - Premium Design */
    .quick-search { 
      display: flex; 
      gap: 0.75rem; 
      align-items: center;
      position: relative;
      z-index: 2;
    }

    .order-input { 
      padding: 0.875rem 1.25rem; 
      border: 2px solid rgba(255, 255, 255, 0.3); 
      border-radius: var(--radius); 
      font-size: 0.9375rem; 
      width: 180px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      color: var(--white);
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .order-input::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }

    .order-input:focus { 
      outline: none; 
      border-color: var(--secondary);
      background: rgba(255, 255, 255, 0.15);
      box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.2);
    }

    /* Buttons */
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

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .btn-secondary { 
      background: var(--gray-100); 
      color: var(--gray-700);
    }

    .btn-secondary:hover {
      background: var(--gray-200);
    }

    /* Alert */
    .alert { 
      padding: 1rem 1.25rem; 
      border-radius: var(--radius); 
      margin-bottom: 1.5rem; 
      font-size: 0.9375rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      animation: fadeInScale 0.3s ease;
    }

    .alert-warning { 
      background: linear-gradient(135deg, var(--warning-light), rgba(254, 243, 199, 0.5)); 
      color: var(--warning); 
      border: 1px solid rgba(217, 119, 6, 0.2);
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

    .modal-lg { max-width: 650px; }

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

    /* Status Section */
    .status-section { 
      margin-bottom: 2rem;
    }

    .status-header { 
      text-align: center; 
      margin-bottom: 2rem;
    }

    .status-badge { 
      display: inline-flex;
      align-items: center;
      padding: 0.625rem 1.5rem; 
      border-radius: 50px; 
      font-size: 0.9375rem; 
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-pending { 
      background: linear-gradient(135deg, var(--warning-light), rgba(254, 243, 199, 0.5)); 
      color: var(--warning);
    }

    .status-in_transit { 
      background: linear-gradient(135deg, var(--info-light), rgba(224, 242, 254, 0.5)); 
      color: var(--info);
    }

    .status-delivered { 
      background: linear-gradient(135deg, var(--success-light), rgba(209, 250, 229, 0.5)); 
      color: var(--success-dark);
    }

    .status-canceled { 
      background: linear-gradient(135deg, var(--danger-light), rgba(254, 226, 226, 0.5)); 
      color: var(--danger);
    }

    /* Tracking Timeline - Premium Design */
    .tracking-timeline { 
      display: flex; 
      justify-content: space-between; 
      position: relative; 
      padding: 0 1.5rem;
    }

    .tracking-timeline::before { 
      content: ''; 
      position: absolute; 
      top: 28px; 
      left: 18%; 
      right: 18%; 
      height: 4px; 
      background: var(--gray-200);
      border-radius: 2px;
    }

    .timeline-step { 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      text-align: center; 
      position: relative; 
      z-index: 1; 
      flex: 1;
    }

    .step-icon { 
      width: 56px; 
      height: 56px; 
      border-radius: 50%; 
      background: var(--gray-100); 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-size: 1.5rem; 
      margin-bottom: 0.75rem; 
      border: 4px solid var(--white); 
      box-shadow: var(--shadow-sm);
      transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .timeline-step.completed .step-icon { 
      background: linear-gradient(135deg, var(--success), var(--success-dark));
      color: var(--white);
    }

    .timeline-step.current .step-icon { 
      background: linear-gradient(135deg, var(--info), #0369a1);
      color: var(--white); 
      animation: pulseRing 2s infinite;
    }

    .step-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .step-title { 
      font-weight: 700; 
      font-size: 0.8125rem; 
      color: var(--gray-500);
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .step-desc { 
      font-size: 0.6875rem; 
      color: var(--gray-400); 
      max-width: 100px;
    }

    .timeline-step.completed .step-title { 
      color: var(--success-dark);
    }

    .timeline-step.current .step-title { 
      color: var(--info);
    }

    /* Details Grid */
    .details-grid { 
      display: grid; 
      grid-template-columns: repeat(2, 1fr); 
      gap: 1rem; 
      margin: 2rem 0;
    }

    .detail-card { 
      background: linear-gradient(135deg, var(--gray-50), var(--white));
      border-radius: var(--radius); 
      padding: 1.25rem;
      border: 1px solid var(--gray-100);
      transition: all 0.3s ease;
    }

    .detail-card:hover {
      border-color: var(--gray-200);
      box-shadow: var(--shadow-sm);
    }

    .detail-label { 
      display: block; 
      font-size: 0.75rem; 
      color: var(--gray-500); 
      text-transform: uppercase; 
      margin-bottom: 0.5rem;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .detail-value { 
      font-weight: 700; 
      color: var(--gray-900);
      font-size: 0.9375rem;
    }

    .detail-value.tracking { 
      font-family: 'SF Mono', Monaco, monospace;
      color: var(--info);
      background: var(--info-light);
      padding: 0.375rem 0.75rem;
      border-radius: var(--radius-sm);
      display: inline-block;
    }

    /* Address Section */
    .address-section { 
      margin-bottom: 1.5rem;
    }

    .address-section h3 { 
      font-size: 0.9375rem; 
      color: var(--gray-700); 
      margin: 0 0 0.75rem;
      font-weight: 700;
    }

    .address { 
      margin: 0; 
      padding: 1.25rem; 
      background: linear-gradient(135deg, var(--gray-50), var(--white));
      border-radius: var(--radius); 
      font-size: 0.9375rem; 
      line-height: 1.6; 
      color: var(--gray-600);
      border: 1px solid var(--gray-100);
      font-weight: 500;
    }

    /* Order Reference */
    .order-reference { 
      display: flex; 
      align-items: center; 
      gap: 0.75rem; 
      padding: 1rem 1.25rem; 
      background: linear-gradient(135deg, var(--info-light), rgba(224, 242, 254, 0.5));
      border-radius: var(--radius);
      border: 1px solid rgba(2, 132, 199, 0.15);
    }

    .ref-label { 
      font-size: 0.9375rem; 
      color: var(--gray-600);
      font-weight: 500;
    }

    .ref-value { 
      font-weight: 700; 
      color: var(--info);
      font-size: 1rem;
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
      .page-header {
        flex-direction: column;
        text-align: center;
        gap: 1.5rem;
        padding: 2rem;
      }
      
      .quick-search {
        width: 100%;
        justify-content: center;
      }
      
      .order-input {
        flex: 1;
        max-width: 200px;
      }
      
      .tracking-timeline {
        flex-direction: column;
        gap: 1.5rem;
        align-items: flex-start;
        padding: 0;
      }
      
      .tracking-timeline::before {
        display: none;
      }
      
      .timeline-step {
        flex-direction: row;
        text-align: left;
        gap: 1rem;
      }
      
      .step-icon {
        margin-bottom: 0;
      }
      
      .details-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ClientShipmentsComponent implements OnInit {
  private shipmentsApi = inject(ShipmentsApiService);
  private toast = inject(ToastService);

  // Expose enum to template
  ShipmentStatus = ShipmentStatus;

  shipments = signal<Shipment[]>([]);
  loading = signal(false);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);
  filterValues = signal<Record<string, any>>({});

  showDetailModal = signal(false);
  selectedShipment = signal<Shipment | null>(null);

  // Order search
  orderIdSearch: number | null = null;
  orderSearching = signal(false);
  orderSearchError = signal<string | null>(null);

  private statusOrder: ShipmentStatus[] = [ShipmentStatus.PENDING, ShipmentStatus.IN_TRANSIT, ShipmentStatus.DELIVERED];

  columns: TableColumn[] = [
    { key: 'id', label: 'N°', width: '60px' },
    { key: 'salesOrderId', label: 'Commande' },
    { key: 'carrierName', label: 'Transporteur' },
    { key: 'trackingNumber', label: 'N° Suivi' },
    { key: 'status', label: 'Statut', template: 'status' },
    { key: 'estimatedDeliveryDate', label: 'Livraison prévue', template: 'date' }
  ];

  actions: TableAction[] = [
    { icon: '⌖', label: 'Suivre', action: 'track', variant: 'primary' }
  ];

  filterFields: FilterField[] = [
    { key: 'status', label: 'Statut', type: 'select', options: [
      { value: 'PENDING', label: 'En préparation' },
      { value: 'IN_TRANSIT', label: 'En transit' },
      { value: 'DELIVERED', label: 'Livré' }
    ]},
    { key: 'trackingNumber', label: 'N° de suivi', type: 'text', placeholder: 'Rechercher...' }
  ];

  ngOnInit(): void {
    this.loadShipments();
  }

  loadShipments(): void {
    this.loading.set(true);
    this.shipmentsApi.getMyShipments({ page: this.currentPage(), size: this.pageSize(), ...this.filterValues() }).subscribe({
      next: (page: Page<Shipment>) => {
        this.shipments.set(page.content);
        this.totalElements.set(page.totalElements);
        this.totalPages.set(page.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSearch(filters: Record<string, any>): void {
    this.filterValues.set(filters);
    this.currentPage.set(0);
    this.loadShipments();
  }

  onReset(): void {
    this.filterValues.set({});
    this.currentPage.set(0);
    this.loadShipments();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadShipments();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.loadShipments();
  }

  onAction(event: { action: string; row: Shipment }): void {
    if (event.action === 'track') {
      this.selectedShipment.set(event.row);
      this.showDetailModal.set(true);
    }
  }

  closeDetailModal(): void {
    this.showDetailModal.set(false);
    this.selectedShipment.set(null);
  }

  isStatusReached(status: ShipmentStatus): boolean {
    const shipment = this.selectedShipment();
    if (!shipment?.status) return false;
    if (shipment.status === ShipmentStatus.CANCELED) return false;
    return this.statusOrder.indexOf(shipment.status) >= this.statusOrder.indexOf(status);
  }

  getStatusLabel(status: ShipmentStatus): string {
    const labels: Record<ShipmentStatus, string> = {
      [ShipmentStatus.PENDING]: 'En préparation',
      [ShipmentStatus.PLANNED]: 'Planifié',
      [ShipmentStatus.IN_TRANSIT]: 'En transit',
      [ShipmentStatus.DELIVERED]: 'Livré',
      [ShipmentStatus.CANCELED]: 'Annulé'
    };
    return labels[status] || status;
  }

  copyTrackingNumber(): void {
    const trackingNumber = this.selectedShipment()?.trackingNumber;
    if (trackingNumber) {
      navigator.clipboard.writeText(trackingNumber);
      this.toast.success('Numéro de suivi copié !');
    }
  }

  searchByOrderId(): void {
    if (!this.orderIdSearch) return;
    
    this.orderSearching.set(true);
    this.orderSearchError.set(null);

    this.shipmentsApi.getShipmentForOrder(this.orderIdSearch).subscribe({
      next: (shipment: Shipment) => {
        this.selectedShipment.set(shipment);
        this.showDetailModal.set(true);
        this.orderSearching.set(false);
        this.toast.success('Expédition trouvée !');
      },
      error: (err) => {
        this.orderSearching.set(false);
        if (err.status === 404) {
          this.orderSearchError.set('Aucune expédition trouvée pour cette commande');
        } else {
          this.orderSearchError.set('Erreur lors de la recherche');
        }
        this.toast.error('Expédition non trouvée');
      }
    });
  }
}
