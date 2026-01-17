import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShipmentsApiService } from '../../../api/shipments-api.service';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { SearchFiltersComponent, FilterField } from '../../../shared/components/search-filters/search-filters.component';
import { Shipment, ShipmentStatus, Page } from '../../../shared/models';

@Component({
  selector: 'app-client-shipments',
  standalone: true,
  imports: [
    CommonModule,
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
      </div>

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
    .page { max-width: 1200px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.5rem; color: #111827; }
    .subtitle { margin: 0.25rem 0 0; color: #6b7280; font-size: 0.875rem; }

    .btn { padding: 0.625rem 1.25rem; border-radius: 8px; font-weight: 500; font-size: 0.875rem; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.5rem; }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-primary:hover { background: #2563eb; }
    .btn-secondary { background: #f3f4f6; color: #374151; }

    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 12px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
    .modal-lg { max-width: 600px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e5e7eb; }
    .modal-header h2 { margin: 0; font-size: 1.125rem; }
    .close-btn { background: none; border: none; font-size: 1.5rem; color: #6b7280; cursor: pointer; }
    .modal-body { padding: 1.5rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb; }

    .status-section { margin-bottom: 1.5rem; }
    .status-header { text-align: center; margin-bottom: 1.5rem; }

    .status-badge { display: inline-block; padding: 0.5rem 1.5rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; }
    .status-pending { background: #fef3c7; color: #b45309; }
    .status-in_transit { background: #dbeafe; color: #1d4ed8; }
    .status-delivered { background: #d1fae5; color: #047857; }
    .status-canceled { background: #fee2e2; color: #b91c1c; }

    .tracking-timeline { display: flex; justify-content: space-between; position: relative; padding: 0 1rem; }
    .tracking-timeline::before { content: ''; position: absolute; top: 24px; left: 15%; right: 15%; height: 4px; background: #e5e7eb; }
    .timeline-step { display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; z-index: 1; flex: 1; }
    .step-icon { width: 48px; height: 48px; border-radius: 50%; background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; margin-bottom: 0.5rem; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .timeline-step.completed .step-icon { background: #10b981; color: white; }
    .timeline-step.current .step-icon { background: #3b82f6; color: white; animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); } 50% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); } }
    .step-title { font-weight: 600; font-size: 0.75rem; color: #374151; }
    .step-desc { font-size: 0.625rem; color: #9ca3af; margin-top: 0.125rem; }
    .timeline-step.completed .step-title { color: #047857; }
    .timeline-step.current .step-title { color: #1d4ed8; }

    .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .detail-card { background: #f9fafb; border-radius: 8px; padding: 1rem; }
    .detail-label { display: block; font-size: 0.75rem; color: #6b7280; text-transform: uppercase; margin-bottom: 0.25rem; }
    .detail-value { font-weight: 600; color: #111827; }
    .detail-value.tracking { font-family: monospace; color: #3b82f6; }

    .address-section { margin-bottom: 1.5rem; }
    .address-section h3 { font-size: 0.875rem; color: #374151; margin: 0 0 0.5rem; }
    .address { margin: 0; padding: 1rem; background: #f9fafb; border-radius: 8px; font-size: 0.875rem; line-height: 1.5; color: #4b5563; }

    .order-reference { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; background: #eff6ff; border-radius: 8px; }
    .ref-label { font-size: 0.875rem; color: #6b7280; }
    .ref-value { font-weight: 600; color: #1d4ed8; }
  `]
})
export class ClientShipmentsComponent implements OnInit {
  private shipmentsApi = inject(ShipmentsApiService);

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
    { icon: '📍', label: 'Suivre', action: 'track', variant: 'primary' }
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
    }
  }
}
