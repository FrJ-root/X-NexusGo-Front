import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesOrderService } from '../../../core/services/sales-order.service';
import { OrderStatus } from '../../../shared/models/business.models';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { ToastService } from '../../../shared/services/toast.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-order-fulfillment',
    standalone: true,
    imports: [CommonModule, DataTableComponent],
    template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Commandes à Expédier</h1>
      </div>

      <app-data-table
        [columns]="columns"
        [data]="orders()"
        [totalElements]="totalElements()"
        (actionClick)="onShipOrder($event)">
      </app-data-table>
    </div>
  `,
    styles: [`
    .page-container { padding: 2rem; }
  `]
})
export class OrderFulfillmentListComponent implements OnInit {
    private orderService = inject(SalesOrderService);
    private toastService = inject(ToastService);
    private router = inject(Router);

    orders = signal<any[]>([]);
    totalElements = signal(0);

    columns: TableColumn[] = [
        { key: 'id', label: 'ID' },
        { key: 'clientId', label: 'Client ID' },
        { key: 'createdAt', label: 'Date', format: (v) => new Date(v).toLocaleDateString() },
        { key: 'status', label: 'Statut', template: 'status' },
        { key: 'actions', label: 'Expédier', template: 'actions' }
    ];

    ngOnInit() {
        this.loadOrders();
    }

    loadOrders() {
        this.orderService.getAllOrders(0, 100, OrderStatus.RESERVED).subscribe({
            next: (data) => {
                this.orders.set(data.content || []);
                this.totalElements.set(data.totalElements || 0);
            },
            error: () => this.toastService.show('Erreur chargement commandes', 'error')
        });
    }

    onShipOrder(order: any) {
        this.router.navigate(['/warehouse/shipments/new'], { queryParams: { orderId: order.id } });
    }
}
