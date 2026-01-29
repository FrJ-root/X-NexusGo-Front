import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesOrderService } from '../../../core/services/sales-order.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent, RouterLink],
  templateUrl: './client-dashboard.html',
  styleUrl: './client-dashboard.scss'
})
export class ClientDashboard implements OnInit {
  private orderService = inject(SalesOrderService);

  // Signals for stats
  stats = signal({
    totalOrders: 0,
    activeOrders: 0,
    shippedOrders: 0
  });

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    // In a real app, you might have a dedicated /stats endpoint.
    // Here we simulate it by fetching recent orders or using a reporting service.
    this.orderService.getMyOrders(0, 100).subscribe({
      next: (data) => {
        const orders = data.content || [];
        this.stats.set({
          totalOrders: data.totalElements,
          activeOrders: orders.filter((o: any) => o.status === 'CREATED' || o.status === 'RESERVED').length,
          shippedOrders: orders.filter((o: any) => o.status === 'SHIPPED').length
        });
      }
    });
  }
}
