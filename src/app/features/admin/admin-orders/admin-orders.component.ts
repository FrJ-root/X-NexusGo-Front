import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesOrderService } from '../../../core/services/sales-order.service';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { ToastService } from '../../../shared/services/toast.service';
import { SalesOrder } from '../../../shared/models/business.models';
@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Toutes les Commandes Clients</h1>
        <div class="filters">
          <select (change)="onStatusFilter($event)" class="filter-select">
            <option value="">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="CONFIRMED">Confirmé</option>
            <option value="RESERVED">Réservé</option>
            <option value="SHIPPED">Expédié</option>
            <option value="DELIVERED">Livré</option>
            <option value="CANCELED">Annulé</option>
          </select>
        </div>
      </div>

      <app-data-table
        [columns]="columns"
        [data]="orders().content || []"
        [totalElements]="orders().totalElements || 0"
        (pageChange)="onPageChange($event)"
        (actionClick)="onAction($event)">
      </app-data-table>

      <!-- Details Modal -->
      <div class="modal" *ngIf="showDetailsModal()" (click)="closeDetailsModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Détails Commande #{{ selectedOrder()?.id }}</h2>
            <button class="btn-close" (click)="closeDetailsModal()">×</button>
          </div>
          <div class="modal-body" *ngIf="selectedOrder() as order">
            <div class="detail-section">
              <h3>Informations Client</h3>
              <p><strong>Client:</strong> {{ order.client?.name || 'Client #' + order.clientId }}</p>
              <p><strong>Statut:</strong> <span class="badge" [class]="'badge-' + order.status">{{ order.status }}</span></p>
              <p><strong>Date:</strong> {{ order.createdAt | date:'short' }}</p>
            </div>
            <div class="detail-section">
              <h3>Produits</h3>
              <table class="details-table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Quantité</th>
                    <th>Prix Unitaire</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let line of order.lines">
                    <td>{{ line.product?.name || 'Produit #' + line.productId }}</td>
                    <td>{{ line.quantity }}</td>
                    <td>{{ line.unitPrice | currency:'EUR' }}</td>
                    <td>{{ (line.quantity * line.unitPrice) | currency:'EUR' }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3"><strong>Total</strong></td>
                    <td><strong>{{ calculateTotal(order) | currency:'EUR' }}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" (click)="closeDetailsModal()">Fermer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; }
    .page-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .filters {
      display: flex;
      gap: 0.5rem;
    }
    .filter-select {
      padding: 0.5rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      background: white;
      cursor: pointer;
    }
    .filter-select:focus {
      outline: none;
      border-color: #3b82f6;
    }
    
    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .badge-PENDING { background: #fef3c7; color: #92400e; }
    .badge-CONFIRMED { background: #dbeafe; color: #1e40af; }
    .badge-RESERVED { background: #e0e7ff; color: #3730a3; }
    .badge-SHIPPED { background: #fce7 pink; color: #831843; } /* typo fixed below */
    .badge-SHIPPED { background: #fce7f3; color: #831843; }
    .badge-DELIVERED { background: #d1fae5; color: #065f46; }
    .badge-CANCELED { background: #fee2e2; color: #991b1b; }
    
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      background: white;
      border-radius: 0.5rem;
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      position: sticky;
      top: 0;
      background: white;
      z-index: 1;
    }
    .modal-header h2 { margin: 0; font-size: 1.25rem; }
    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal-body { padding: 1.5rem; }
    .detail-section {
      margin-bottom: 1.5rem;
    }
    .detail-section h3 {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
      color: #111827;
    }
    .detail-section p {
      margin: 0.5rem 0;
      color: #6b7280;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 0.75rem;
    }
    .details-table th,
    .details-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    .details-table th {
      background: #f9fafb;
      font-weight: 600;
      font-size: 0.875rem;
      color: #374151;
    }
    .details-table td {
      font-size: 0.875rem;
      color: #6b7280;
    }
    .details-table tfoot td {
      font-weight: 600;
      color: #111827;
      border-top: 2px solid #e5e7eb;
    }
    .modal-footer {
      padding: 1.5rem;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      position: sticky;
      bottom: 0;
      background: white;
    }
    .btn { 
      padding: 0.5rem 1rem; 
      border-radius: 0.375rem;
      border: none;
      cursor: pointer;
      font-weight: 500;
    }
    .btn-outline { background: white; border: 1px solid #e5e7eb; color: #374151; }
    .btn-outline:hover { background: #f9fafb; }
  `]
})
export class AdminOrdersComponent implements OnInit {
  private salesOrderService = inject(SalesOrderService);
  private toastService = inject(ToastService);

  orders = signal<any>({ content: [], totalElements: 0 });
  showDetailsModal = signal(false);
  selectedOrder = signal<SalesOrder | null>(null);
  currentPage = 0;
  pageSize = 10;
  statusFilter = '';

  columns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'clientId', label: 'Client ID' },
    { key: 'status', label: 'Statut', template: 'badge' },
    { key: 'createdAt', label: 'Date', template: 'date' },
    { key: 'actions', label: 'Actions', template: 'actions' }
  ];

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.salesOrderService.getAllOrders(this.currentPage, this.pageSize).subscribe({
      next: (data: any) => this.orders.set(data),
      error: () => this.toastService.show('Erreur lors du chargement', 'error')
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadOrders();
  }

  onStatusFilter(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.statusFilter = target.value;
    this.currentPage = 0;
    this.loadOrders();
  }

  onAction(event: { action: string, row: SalesOrder }) {
    if (event.action === 'view' || event.action === 'details') {
      this.viewDetails(event.row.id);
    }
  }

  viewDetails(id: number) {
    this.salesOrderService.getOrderById(id).subscribe({
      next: (order: SalesOrder) => {
        this.selectedOrder.set(order);
        this.showDetailsModal.set(true);
      },
      error: () => this.toastService.show('Erreur lors du chargement des détails', 'error')
    });
  }

  calculateTotal(order: SalesOrder): number {
    return order.lines?.reduce((sum, line) => sum + (line.quantity * line.unitPrice), 0) || 0;
  }

  closeDetailsModal() {
    this.showDetailsModal.set(false);
    this.selectedOrder.set(null);
  }
}
