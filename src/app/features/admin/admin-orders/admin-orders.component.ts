import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesOrdersApiService } from '../../../api/sales-orders-api.service';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { SearchFiltersComponent, FilterField } from '../../../shared/components/search-filters/search-filters.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../shared/services/toast.service';
import { SalesOrder, OrderStatus } from '../../../shared/models';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    SearchFiltersComponent,
    ConfirmDialogComponent
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Commandes clients</h1>
          <p class="subtitle">Suivez et gérez toutes les commandes</p>
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
                <div class="info-row">
                  <span class="label">Client:</span>
                  <span>{{ selectedOrder()?.customerName }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Email:</span>
                  <span>{{ selectedOrder()?.customerEmail }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Statut:</span>
                  <span class="status-badge status-{{ selectedOrder()?.status?.toLowerCase() }}">
                    {{ getStatusLabel(selectedOrder()?.status!) }}
                  </span>
                </div>
                <div class="info-row">
                  <span class="label">Créé le:</span>
                  <span>{{ selectedOrder()?.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
              </div>

              <h3 class="section-title">Lignes de commande</h3>
              <table class="lines-table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>SKU</th>
                    <th class="text-right">Quantité</th>
                    <th class="text-right">Réservé</th>
                    <th class="text-right">Prix</th>
                    <th class="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  @for (line of selectedOrder()?.lines; track line.id) {
                    <tr>
                      <td>{{ line.productName }}</td>
                      <td>{{ line.productSku }}</td>
                      <td class="text-right">{{ line.quantity }}</td>
                      <td class="text-right">{{ line.reservedQty || 0 }}</td>
                      <td class="text-right">{{ line.unitPrice | number:'1.2-2' }} €</td>
                      <td class="text-right">{{ (line.quantity * (line.unitPrice || 0)) | number:'1.2-2' }} €</td>
                    </tr>
                  }
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="5" class="text-right"><strong>Total:</strong></td>
                    <td class="text-right"><strong>{{ selectedOrder()?.totalAmount | number:'1.2-2' }} €</strong></td>
                  </tr>
                </tfoot>
              </table>

              @if (selectedOrder()?.backorders && selectedOrder()!.backorders!.length > 0) {
                <h3 class="section-title warning">⚠️ Backorders</h3>
                <ul class="backorder-list">
                  @for (bo of selectedOrder()?.backorders; track bo.productId) {
                    <li>{{ bo.productName }}: {{ bo.missingQty }} unités manquantes</li>
                  }
                </ul>
              }
            </div>
            <div class="modal-footer">
              @switch (selectedOrder()?.status) {
                @case ('CREATED') {
                  <button class="btn btn-success" (click)="confirmOrder()" [disabled]="processing()">
                    @if (processing()) { <span class="spinner-sm"></span> }
                    Confirmer
                  </button>
                  <button class="btn btn-danger" (click)="showCancelConfirm.set(true)">Annuler</button>
                }
                @case ('CONFIRMED') {
                  <button class="btn btn-primary" (click)="reserveOrder()" [disabled]="processing()">
                    @if (processing()) { <span class="spinner-sm"></span> }
                    Réserver le stock
                  </button>
                  <button class="btn btn-danger" (click)="showCancelConfirm.set(true)">Annuler</button>
                }
                @case ('RESERVED') {
                  <span class="info-text">✓ Stock réservé - Prêt pour expédition</span>
                }
                @case ('PARTIALLY_RESERVED') {
                  <span class="warning-text">⚠️ Partiellement réservé - Vérifier les backorders</span>
                }
              }
              <button class="btn btn-secondary" (click)="closeDetailModal()">Fermer</button>
            </div>
          </div>
        </div>
      }

      <app-confirm-dialog
        [isOpen]="showCancelConfirm()"
        title="Annuler la commande"
        message="Êtes-vous sûr de vouloir annuler cette commande ? Cette action est irréversible."
        confirmText="Annuler la commande"
        variant="danger"
        [loading]="processing()"
        (confirm)="cancelOrder()"
        (cancel)="showCancelConfirm.set(false)"
      />
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
    .btn-secondary { background: #f3f4f6; color: #374151; }
    .btn-success { background: #10b981; color: white; }
    .btn-success:hover:not(:disabled) { background: #059669; }
    .btn-danger { background: #ef4444; color: white; }
    .btn-danger:hover:not(:disabled) { background: #dc2626; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 12px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
    .modal-lg { max-width: 800px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e5e7eb; }
    .modal-header h2 { margin: 0; font-size: 1.125rem; }
    .close-btn { background: none; border: none; font-size: 1.5rem; color: #6b7280; cursor: pointer; }
    .modal-body { padding: 1.5rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb; align-items: center; }

    .order-info { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .info-row { display: flex; flex-direction: column; }
    .info-row .label { font-size: 0.75rem; color: #6b7280; text-transform: uppercase; margin-bottom: 0.25rem; }

    .section-title { font-size: 1rem; font-weight: 600; color: #374151; margin: 1.5rem 0 1rem; }
    .section-title.warning { color: #b45309; }

    .lines-table { width: 100%; border-collapse: collapse; }
    .lines-table th, .lines-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
    .lines-table th { background: #f9fafb; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; color: #6b7280; }
    .lines-table tfoot td { border-top: 2px solid #e5e7eb; border-bottom: none; }
    .text-right { text-align: right !important; }

    .backorder-list { list-style: none; padding: 0; margin: 0; background: #fef3c7; border-radius: 8px; padding: 1rem; }
    .backorder-list li { padding: 0.5rem 0; color: #92400e; }

    .status-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
    .status-created { background: #f3f4f6; color: #4b5563; }
    .status-confirmed { background: #dbeafe; color: #1d4ed8; }
    .status-reserved { background: #d1fae5; color: #047857; }
    .status-partially_reserved { background: #fef3c7; color: #b45309; }
    .status-shipped { background: #ede9fe; color: #7c3aed; }
    .status-delivered { background: #d1fae5; color: #047857; }
    .status-canceled { background: #fee2e2; color: #b91c1c; }

    .info-text { color: #047857; font-size: 0.875rem; margin-right: auto; }
    .warning-text { color: #b45309; font-size: 0.875rem; margin-right: auto; }

    .spinner-sm { width: 16px; height: 16px; border: 2px solid rgba(255, 255, 255, 0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AdminOrdersComponent implements OnInit {
  private ordersApi = inject(SalesOrdersApiService);
  private toast = inject(ToastService);

  orders = signal<SalesOrder[]>([]);
  loading = signal(false);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);
  filterValues = signal<Record<string, any>>({});

  showDetailModal = signal(false);
  selectedOrder = signal<SalesOrder | null>(null);
  processing = signal(false);
  showCancelConfirm = signal(false);

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'customerName', label: 'Client', sortable: true },
    { key: 'customerEmail', label: 'Email' },
    { key: 'status', label: 'Statut', template: 'status' },
    { key: 'totalAmount', label: 'Total', template: 'currency', align: 'right' },
    { key: 'createdAt', label: 'Date', template: 'date', sortable: true }
  ];

  actions: TableAction[] = [
    { icon: '⦿', label: 'Détail', action: 'view', variant: 'primary' }
  ];

  filterFields: FilterField[] = [
    { key: 'customerName', label: 'Client', type: 'text', placeholder: 'Nom du client...' },
    { key: 'status', label: 'Statut', type: 'select', options: [
      { value: 'CREATED', label: 'Créé' },
      { value: 'CONFIRMED', label: 'Confirmé' },
      { value: 'RESERVED', label: 'Réservé' },
      { value: 'PARTIALLY_RESERVED', label: 'Part. Réservé' },
      { value: 'SHIPPED', label: 'Expédié' },
      { value: 'DELIVERED', label: 'Livré' },
      { value: 'CANCELED', label: 'Annulé' }
    ]}
  ];

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.ordersApi.search(this.filterValues(), { page: this.currentPage(), size: this.pageSize() }).subscribe({
      next: (page) => {
        this.orders.set(page.content);
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
    this.loadOrders();
  }

  onReset(): void {
    this.filterValues.set({});
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
      this.openDetailModal(event.row);
    }
  }

  openDetailModal(order: SalesOrder): void {
    this.ordersApi.getById(order.id!).subscribe({
      next: (data) => {
        this.selectedOrder.set(data);
        this.showDetailModal.set(true);
      }
    });
  }

  closeDetailModal(): void {
    this.showDetailModal.set(false);
    this.selectedOrder.set(null);
  }

  confirmOrder(): void {
    const order = this.selectedOrder();
    if (!order?.id) return;
    this.processing.set(true);

    this.ordersApi.confirm(order.id).subscribe({
      next: (updated: SalesOrder) => {
        this.toast.success('Commande confirmée');
        this.selectedOrder.set(updated);
        this.loadOrders();
        this.processing.set(false);
      },
      error: () => this.processing.set(false)
    });
  }

  reserveOrder(): void {
    const order = this.selectedOrder();
    if (!order?.id) return;
    this.processing.set(true);

    this.ordersApi.reserveStock(order.id, true).subscribe({
      next: (updatedOrder: SalesOrder) => {
        if (updatedOrder.status === 'RESERVED') {
          this.toast.success('Stock entièrement réservé');
        } else if (updatedOrder.status === 'PARTIALLY_RESERVED') {
          this.toast.warning('Réservation partielle - Vérifiez les backorders');
        }
        this.selectedOrder.set(updatedOrder);
        this.loadOrders();
        this.processing.set(false);
      },
      error: () => this.processing.set(false)
    });
  }

  cancelOrder(): void {
    const order = this.selectedOrder();
    if (!order?.id) return;
    this.processing.set(true);

    this.ordersApi.cancel(order.id).subscribe({
      next: () => {
        this.toast.success('Commande annulée');
        this.showCancelConfirm.set(false);
        this.closeDetailModal();
        this.loadOrders();
        this.processing.set(false);
      },
      error: () => this.processing.set(false)
    });
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
