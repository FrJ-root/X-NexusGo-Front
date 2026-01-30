import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SalesOrderService } from '../../../core/services/sales-order.service';
import { OrderStatus } from '../../../shared/models/business.models';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss'
})
export class OrderListComponent implements OnInit {
  private orderService = inject(SalesOrderService);
  private toastService = inject(ToastService);

  // Signals
  orders = signal<any[]>([]);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);
  pageSize = 10;
  loading = signal(false);

  // Filters
  selectedStatus = signal<string>('');

  // Status options for filter
  statusOptions = Object.values(OrderStatus);

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders(page: number = 0) {
    this.loading.set(true);
    this.currentPage.set(page);

    const status = this.selectedStatus() ? (this.selectedStatus() as OrderStatus) : undefined;

    this.orderService.getMyOrders(page, this.pageSize, status).subscribe({
      next: (data) => {
        // Handle both plain array and Page object responses
        if (Array.isArray(data)) {
          // Plain array response
          this.orders.set(data);
          this.totalElements.set(data.length);
          this.totalPages.set(1);
        } else {
          // Page object response
          this.orders.set(data.content || []);
          this.totalElements.set(data.totalElements || 0);
          this.totalPages.set(data.totalPages || 0);
        }
        this.loading.set(false);
      },
      error: () => {
        this.toastService.show('Erreur lors du chargement des commandes', 'error');
        this.loading.set(false);
      }
    });
  }

  onStatusChange(status: string) {
    this.selectedStatus.set(status);
    this.loadOrders(0);
  }

  clearFilter() {
    this.selectedStatus.set('');
    this.loadOrders(0);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.loadOrders(this.currentPage() + 1);
    }
  }

  previousPage() {
    if (this.currentPage() > 0) {
      this.loadOrders(this.currentPage() - 1);
    }
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'CREATED': 'Créée',
      'RESERVED': 'Réservée',
      'SHIPPED': 'Expédiée',
      'DELIVERED': 'Livrée',
      'CANCELLED': 'Annulée'
    };
    return labels[status] || status;
  }

  getTotalAmount(order: any): number {
    if (order.totalAmount) return order.totalAmount;
    if (order.lines) {
      return order.lines.reduce((sum: number, line: any) =>
        sum + (line.quantity * line.unitPrice), 0
      );
    }
    return 0;
  }
}
