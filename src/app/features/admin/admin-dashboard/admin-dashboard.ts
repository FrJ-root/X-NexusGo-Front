import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReportingService } from '../../../core/services/reporting.service';
import { UserService } from '../../../core/services/user.service';
import { ProductService } from '../../../core/services/product.service';
import { SalesOrderService } from '../../../core/services/sales-order.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard implements OnInit {
  private reportingService = inject(ReportingService);
  private userService = inject(UserService);
  private productService = inject(ProductService);
  private orderService = inject(SalesOrderService);

  // Signals
  stats = signal({
    activeUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0
  });

  performanceStats = signal<any>(null);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // Global Stats
    this.reportingService.getGlobalStats().subscribe(data => {
      this.stats.set({
        activeUsers: data.userCount || 0,
        totalProducts: data.productCount || 0,
        totalOrders: data.orderCount || 0,
        revenue: data.totalRevenue || 0
      });
    });

    // Performance
    this.reportingService.getDeliveryPerformance().subscribe(data => {
      this.performanceStats.set(data);
    });

    // Fallback if global stats not available, fetch individual counts
    if (this.stats().activeUsers === 0) {
      this.userService.getAll(0, 1).subscribe({
        next: (data: any) => this.stats.update(s => ({ ...s, activeUsers: data.totalElements }))
      });
      this.productService.getActivePaginated(0, 1).subscribe({
        next: (data: any) => this.stats.update(s => ({ ...s, totalProducts: data.totalElements }))
      });
    }
  }
}
