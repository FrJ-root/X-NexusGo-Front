import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ShipmentsApiService, CreateShipmentRequest } from '../../../api/shipments-api.service';
import { SalesOrdersApiService } from '../../../api/sales-orders-api.service';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { SearchFiltersComponent, FilterField } from '../../../shared/components/search-filters/search-filters.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../shared/services/toast.service';
import { Shipment, ShipmentStatus, SalesOrder, OrderStatus } from '../../../shared/models';

@Component({
  selector: 'app-warehouse-shipments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DataTableComponent,
    SearchFiltersComponent,
    ConfirmDialogComponent
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Gestion des expéditions</h1>
          <p class="subtitle">Création et suivi des livraisons</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">
          🚚 Nouvelle expédition
        </button>
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

      <!-- Create Modal -->
      @if (showCreateModal()) {
        <div class="modal-overlay" (click)="closeCreateModal()">
          <div class="modal modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Nouvelle expédition</h2>
              <button class="close-btn" (click)="closeCreateModal()">×</button>
            </div>
            <form [formGroup]="shipmentForm" (ngSubmit)="onSubmit()">
              <div class="modal-body">
                <div class="form-group">
                  <label for="orderId">Commande *</label>
                  <select id="orderId" formControlName="orderId" (change)="onOrderChange()">
                    <option value="">Sélectionner une commande...</option>
                    @for (o of readyOrders(); track o.id) {
                      <option [value]="o.id">#{{ o.id }} - {{ o.customerName }} ({{ o.totalAmount | number:'1.2-2' }} €)</option>
                    }
                  </select>
                  @if (readyOrders().length === 0) {
                    <small class="hint warning">Aucune commande prête à expédier</small>
                  }
                </div>

                @if (selectedOrderForShipment()) {
                  <div class="order-preview">
                    <h4>Détails de la commande</h4>
                    <div class="preview-grid">
                      <div><strong>Client:</strong> {{ selectedOrderForShipment()?.customerName }}</div>
                      <div><strong>Email:</strong> {{ selectedOrderForShipment()?.customerEmail }}</div>
                      <div><strong>Statut:</strong> {{ selectedOrderForShipment()?.status }}</div>
                    </div>
                    <table class="preview-table">
                      <thead>
                        <tr>
                          <th>Produit</th>
                          <th class="text-right">Quantité</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (line of selectedOrderForShipment()?.lines; track line.id) {
                          <tr>
                            <td>{{ line.productName }}</td>
                            <td class="text-right">{{ line.reservedQty || line.quantity }}</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                }

                <div class="form-row">
                  <div class="form-group">
                    <label for="carrier">Transporteur *</label>
                    <input type="text" id="carrier" formControlName="carrier" placeholder="DHL, UPS, Chronopost..." />
                  </div>
                  <div class="form-group">
                    <label for="trackingNumber">N° de suivi</label>
                    <input type="text" id="trackingNumber" formControlName="trackingNumber" />
                  </div>
                </div>

                <div class="form-group">
                  <label for="shippingAddress">Adresse de livraison *</label>
                  <textarea id="shippingAddress" formControlName="shippingAddress" rows="3"></textarea>
                </div>

                <div class="form-group">
                  <label for="estimatedDeliveryDate">Date de livraison estimée</label>
                  <input type="date" id="estimatedDeliveryDate" formControlName="estimatedDeliveryDate" />
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeCreateModal()">Annuler</button>
                <button type="submit" class="btn btn-primary" [disabled]="shipmentForm.invalid || saving()">
                  @if (saving()) { <span class="spinner-sm"></span> }
                  Créer l'expédition
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Status Update Modal -->
      @if (showStatusModal()) {
        <div class="modal-overlay" (click)="closeStatusModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Mise à jour du statut</h2>
              <button class="close-btn" (click)="closeStatusModal()">×</button>
            </div>
            <div class="modal-body">
              <p>Expédition #{{ selectedShipment()?.id }}</p>
              <p>Statut actuel: <strong>{{ getStatusLabel(selectedShipment()?.status) }}</strong></p>

              <div class="status-actions">
                @if (selectedShipment()?.status === ShipmentStatus.PENDING || selectedShipment()?.status === ShipmentStatus.PLANNED) {
                  <button class="btn btn-primary" (click)="updateStatus(ShipmentStatus.IN_TRANSIT)" [disabled]="updating()">
                    🚛 Marquer en transit
                  </button>
                }
                @if (selectedShipment()?.status === ShipmentStatus.IN_TRANSIT) {
                  <button class="btn btn-success" (click)="updateStatus(ShipmentStatus.DELIVERED)" [disabled]="updating()">
                    ✓ Marquer livré
                  </button>
                }
                @if (selectedShipment()?.status !== ShipmentStatus.DELIVERED && selectedShipment()?.status !== ShipmentStatus.CANCELED) {
                  <button class="btn btn-danger" (click)="updateStatus(ShipmentStatus.CANCELED)" [disabled]="updating()">
                    ✗ Annuler
                  </button>
                }
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="closeStatusModal()">Fermer</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1400px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.5rem; color: #111827; }
    .subtitle { margin: 0.25rem 0 0; color: #6b7280; font-size: 0.875rem; }

    .btn { padding: 0.625rem 1.25rem; border-radius: 8px; font-weight: 500; font-size: 0.875rem; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.5rem; }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-primary:hover:not(:disabled) { background: #2563eb; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { background: #f3f4f6; color: #374151; }
    .btn-success { background: #10b981; color: white; }
    .btn-success:hover:not(:disabled) { background: #059669; }
    .btn-danger { background: #ef4444; color: white; }
    .btn-danger:hover:not(:disabled) { background: #dc2626; }

    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 12px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
    .modal-lg { max-width: 700px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e5e7eb; }
    .modal-header h2 { margin: 0; font-size: 1.125rem; }
    .close-btn { background: none; border: none; font-size: 1.5rem; color: #6b7280; cursor: pointer; }
    .modal-body { padding: 1.5rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb; }

    .form-group { margin-bottom: 1rem; flex: 1; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #374151; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.625rem 0.875rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
    .form-row { display: flex; gap: 1rem; }
    .hint { display: block; margin-top: 0.375rem; font-size: 0.75rem; color: #6b7280; }
    .hint.warning { color: #b45309; }

    .order-preview { background: #f9fafb; border-radius: 8px; padding: 1rem; margin-top: 1rem; }
    .order-preview h4 { margin: 0 0 0.75rem; font-size: 0.875rem; color: #374151; }
    .preview-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-bottom: 1rem; font-size: 0.875rem; }
    .preview-table { width: 100%; border-collapse: collapse; }
    .preview-table th, .preview-table td { padding: 0.5rem; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 0.75rem; }
    .preview-table th { font-weight: 600; color: #6b7280; }
    .text-right { text-align: right !important; }

    .status-actions { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem; }

    .spinner-sm { width: 16px; height: 16px; border: 2px solid rgba(255, 255, 255, 0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class WarehouseShipmentsComponent implements OnInit {
  private shipmentsApi = inject(ShipmentsApiService);
  private ordersApi = inject(SalesOrdersApiService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  // Expose enum to template
  ShipmentStatus = ShipmentStatus;

  shipments = signal<Shipment[]>([]);
  readyOrders = signal<SalesOrder[]>([]);
  loading = signal(false);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);
  filterValues = signal<Record<string, any>>({});

  showCreateModal = signal(false);
  saving = signal(false);
  selectedOrderForShipment = signal<SalesOrder | null>(null);

  showStatusModal = signal(false);
  selectedShipment = signal<Shipment | null>(null);
  updating = signal(false);

  shipmentForm = this.fb.group({
    orderId: ['', Validators.required],
    carrier: ['', Validators.required],
    trackingNumber: [''],
    shippingAddress: ['', Validators.required],
    estimatedDeliveryDate: ['']
  });

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'orderId', label: 'Commande' },
    { key: 'carrier', label: 'Transporteur' },
    { key: 'trackingNumber', label: 'N° Suivi' },
    { key: 'status', label: 'Statut', template: 'status' },
    { key: 'shippedAt', label: 'Expédié le', template: 'date' },
    { key: 'estimatedDeliveryDate', label: 'Livraison prévue', template: 'date' }
  ];

  actions: TableAction[] = [
    { icon: '✏️', label: 'Statut', action: 'status', variant: 'primary' }
  ];

  filterFields: FilterField[] = [
    { key: 'status', label: 'Statut', type: 'select', options: [
      { value: 'PENDING', label: 'En attente' },
      { value: 'IN_TRANSIT', label: 'En transit' },
      { value: 'DELIVERED', label: 'Livré' },
      { value: 'CANCELED', label: 'Annulé' }
    ]},
    { key: 'trackingNumber', label: 'N° Suivi', type: 'text', placeholder: 'Numéro...' }
  ];

  ngOnInit(): void {
    this.loadShipments();
    this.loadReadyOrders();
  }

  loadShipments(): void {
    this.loading.set(true);
    this.shipmentsApi.search(this.filterValues(), { page: this.currentPage(), size: this.pageSize() }).subscribe({
      next: (page) => {
        this.shipments.set(page.content);
        this.totalElements.set(page.totalElements);
        this.totalPages.set(page.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadReadyOrders(): void {
    this.ordersApi.search({ status: OrderStatus.RESERVED }, { size: 50 }).subscribe(page => {
      this.readyOrders.set(page.content);
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
    if (event.action === 'status') {
      this.selectedShipment.set(event.row);
      this.showStatusModal.set(true);
    }
  }

  openCreateModal(): void {
    this.shipmentForm.reset();
    this.selectedOrderForShipment.set(null);
    this.loadReadyOrders();
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.selectedOrderForShipment.set(null);
  }

  onOrderChange(): void {
    const orderId = this.shipmentForm.get('orderId')?.value;
    if (orderId) {
      const order = this.readyOrders().find(o => o.id === Number(orderId));
      this.selectedOrderForShipment.set(order || null);
    } else {
      this.selectedOrderForShipment.set(null);
    }
  }

  onSubmit(): void {
    if (this.shipmentForm.invalid) return;
    this.saving.set(true);

    const formValue = this.shipmentForm.value;
    const request: CreateShipmentRequest = {
      salesOrderId: Number(formValue.orderId),
      carrierId: Number(formValue.carrier),
      plannedDate: formValue.estimatedDeliveryDate || undefined
    };

    this.shipmentsApi.create(request).subscribe({
      next: () => {
        this.toast.success('Expédition créée');
        this.closeCreateModal();
        this.loadShipments();
        this.loadReadyOrders();
        this.saving.set(false);
      },
      error: () => this.saving.set(false)
    });
  }

  closeStatusModal(): void {
    this.showStatusModal.set(false);
    this.selectedShipment.set(null);
  }

  getStatusLabel(status?: ShipmentStatus): string {
    if (!status) return 'Inconnu';
    const labels: Record<ShipmentStatus, string> = {
      [ShipmentStatus.PENDING]: 'En attente',
      [ShipmentStatus.PLANNED]: 'Planifié',
      [ShipmentStatus.IN_TRANSIT]: 'En transit',
      [ShipmentStatus.DELIVERED]: 'Livré',
      [ShipmentStatus.CANCELED]: 'Annulé'
    };
    return labels[status] || status;
  }

  updateStatus(status: ShipmentStatus): void {
    const shipment = this.selectedShipment();
    if (!shipment?.id) return;
    this.updating.set(true);

    this.shipmentsApi.updateStatus(shipment.id, status).subscribe({
      next: (updated: Shipment) => {
        const statusLabels: Record<ShipmentStatus, string> = {
          [ShipmentStatus.PENDING]: 'En attente',
          [ShipmentStatus.PLANNED]: 'Planifié',
          [ShipmentStatus.IN_TRANSIT]: 'En transit',
          [ShipmentStatus.DELIVERED]: 'Livré',
          [ShipmentStatus.CANCELED]: 'Annulé'
        };
        this.toast.success(`Statut mis à jour: ${statusLabels[status]}`);
        this.selectedShipment.set(updated);
        this.loadShipments();
        this.updating.set(false);
      },
      error: () => this.updating.set(false)
    });
  }
}
