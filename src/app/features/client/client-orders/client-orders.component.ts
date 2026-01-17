import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SalesOrdersApiService } from '../../../api/sales-orders-api.service';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { SearchFiltersComponent, FilterField } from '../../../shared/components/search-filters/search-filters.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../shared/services/toast.service';
import { SalesOrder, OrderStatus, Page } from '../../../shared/models';

@Component({
  selector: 'app-client-orders',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DataTableComponent,
    SearchFiltersComponent,
    ConfirmDialogComponent
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Mes commandes</h1>
          <p class="subtitle">Historique et suivi de vos commandes</p>
        </div>
        <a routerLink="/client/orders/create" class="btn btn-primary">
          ➕ Nouvelle commande
        </a>
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
                <button class="btn btn-danger" (click)="showCancelConfirm.set(true)">
                  Annuler la commande
                </button>
              }
              <button class="btn btn-secondary" (click)="closeDetailModal()">Fermer</button>
            </div>
          </div>
        </div>
      }

      <app-confirm-dialog
        [isOpen]="showCancelConfirm()"
        title="Annuler la commande"
        message="Êtes-vous sûr de vouloir annuler cette commande ?"
        confirmText="Oui, annuler"
        variant="danger"
        [loading]="canceling()"
        (confirm)="cancelOrder()"
        (cancel)="showCancelConfirm.set(false)"
      />
    </div>
  `,
  styles: [`
    .page { max-width: 1200px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.5rem; color: #111827; }
    .subtitle { margin: 0.25rem 0 0; color: #6b7280; font-size: 0.875rem; }

    .btn { padding: 0.625rem 1.25rem; border-radius: 8px; font-weight: 500; font-size: 0.875rem; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none; }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-primary:hover { background: #2563eb; }
    .btn-secondary { background: #f3f4f6; color: #374151; }
    .btn-danger { background: #ef4444; color: white; }
    .btn-danger:hover { background: #dc2626; }

    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 12px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
    .modal-lg { max-width: 700px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e5e7eb; }
    .modal-header h2 { margin: 0; font-size: 1.125rem; }
    .close-btn { background: none; border: none; font-size: 1.5rem; color: #6b7280; cursor: pointer; }
    .modal-body { padding: 1.5rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb; }

    .order-info { display: flex; gap: 2rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #f3f4f6; }
    .info-item { display: flex; flex-direction: column; }
    .info-item .label { font-size: 0.75rem; color: #6b7280; text-transform: uppercase; margin-bottom: 0.25rem; }
    .info-item .total { font-size: 1.25rem; font-weight: 700; color: #111827; }

    .section-title { font-size: 1rem; font-weight: 600; color: #374151; margin: 1.5rem 0 1rem; }

    .lines-table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
    .lines-table th, .lines-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
    .lines-table th { background: #f9fafb; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; color: #6b7280; }
    .lines-table tfoot td { border-top: 2px solid #e5e7eb; border-bottom: none; }
    .text-right { text-align: right !important; }
    .sku { color: #9ca3af; font-size: 0.75rem; }

    .status-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
    .status-created { background: #f3f4f6; color: #4b5563; }
    .status-confirmed { background: #dbeafe; color: #1d4ed8; }
    .status-reserved, .status-partially_reserved { background: #fef3c7; color: #b45309; }
    .status-shipped { background: #ede9fe; color: #7c3aed; }
    .status-delivered { background: #d1fae5; color: #047857; }
    .status-canceled { background: #fee2e2; color: #b91c1c; }

    .timeline { display: flex; flex-direction: column; gap: 0; padding-left: 1rem; }
    .timeline-item { display: flex; align-items: center; gap: 1rem; padding: 0.75rem 0; position: relative; }
    .timeline-item::before { content: ''; position: absolute; left: 7px; top: 0; bottom: 0; width: 2px; background: #e5e7eb; }
    .timeline-item:first-child::before { top: 50%; }
    .timeline-item:last-child::before { bottom: 50%; }
    .timeline-marker { width: 16px; height: 16px; border-radius: 50%; background: #e5e7eb; border: 2px solid white; position: relative; z-index: 1; }
    .timeline-item.completed .timeline-marker { background: #10b981; }
    .timeline-title { font-size: 0.875rem; color: #6b7280; }
    .timeline-item.completed .timeline-title { color: #111827; font-weight: 500; }
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

  showDetailModal = signal(false);
  selectedOrder = signal<SalesOrder | null>(null);
  showCancelConfirm = signal(false);
  canceling = signal(false);

  private statusOrder: OrderStatus[] = [OrderStatus.CREATED, OrderStatus.CONFIRMED, OrderStatus.RESERVED, OrderStatus.SHIPPED, OrderStatus.DELIVERED];

  columns: TableColumn[] = [
    { key: 'id', label: 'N°', width: '60px' },
    { key: 'createdAt', label: 'Date', template: 'date', sortable: true },
    { key: 'status', label: 'Statut', template: 'status' },
    { key: 'totalAmount', label: 'Total', template: 'currency', align: 'right' }
  ];

  actions: TableAction[] = [
    { icon: '👁️', label: 'Détail', action: 'view', variant: 'primary' }
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
      this.loadOrderById(event.row.id!);
    }
  }

  closeDetailModal(): void {
    this.showDetailModal.set(false);
    this.selectedOrder.set(null);
  }

  cancelOrder(): void {
    const order = this.selectedOrder();
    if (!order?.id) return;
    this.canceling.set(true);

    this.ordersApi.cancel(order.id).subscribe({
      next: (_: SalesOrder) => {
        this.toast.success('Commande annulée');
        this.showCancelConfirm.set(false);
        this.closeDetailModal();
        this.loadOrders();
        this.canceling.set(false);
      },
      error: () => this.canceling.set(false)
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
