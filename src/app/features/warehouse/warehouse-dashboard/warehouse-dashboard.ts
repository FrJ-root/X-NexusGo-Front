import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InventoryService } from '../../../core/services/inventory.service';
import { SalesOrderService } from '../../../core/services/sales-order.service';
import { ShipmentService } from '../../../core/services/shipment.service';
import { WarehouseService } from '../../../core/services/warehouse.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { OrderStatus } from '../../../shared/models/business.models';

@Component({
  selector: 'app-warehouse-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent, RouterLink],
  templateUrl: './warehouse-dashboard.html',
  styleUrl: './warehouse-dashboard.scss',
})
export class WarehouseDashboard implements OnInit {
  private inventoryService = inject(InventoryService);
  private orderService = inject(SalesOrderService);
  private shipmentService = inject(ShipmentService);
  private warehouseService = inject(WarehouseService);

  // Signals
  stats = signal({
    totalStockUnits: 0,
    pendingReservations: 0,
    shipmentsToday: 0,
    lowStockCount: 0
  });

  warehouses = signal<any[]>([]);
  recentMovements = signal<any[]>([]);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // 1. Get Warehouses
    this.warehouseService.getAll().subscribe(data => this.warehouses.set(data));

    // 2. Fetch all orders with RESERVED status
    this.orderService.getAllOrders(0, 100, OrderStatus.RESERVED).subscribe(data => {
      this.stats.update(s => ({ ...s, pendingReservations: data.totalElements }));
    });

    // 3. Fetch shipments for today (simplified check)
    this.shipmentService.getAll(0, 100).subscribe(data => {
      const today = new Date().toISOString().split('T')[0];
      const todayShipments = data.content.filter((s: any) => s.plannedDate.startsWith(today));
      this.stats.update(s => ({ ...s, shipmentsToday: todayShipments.length }));
    });

    // 4. Low stock check (simplified: items with qty < 10)
    // In a real scenario, this would be a backend endpoint or search filter
    this.inventoryService.getMovements().subscribe(data => {
      // Just to populate some data for demo
      this.recentMovements.set(data.slice(0, 5));
    });
  }
}
