import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesOrderService } from '../../../core/services/sales-order.service';
import { ShipmentService } from '../../../core/services/shipment.service';
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
  private shipmentService = inject(ShipmentService);

  // Signals for order stats
  stats = signal({
    total: 0,
    created: 0,
    reserved: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  });

  // Signals for shipment stats
  shipmentStats = signal({
    planned: 0,
    inTransit: 0,
    delivered: 0
  });

  recentOrders = signal<any[]>([]);
  alerts = signal<{ type: 'warning' | 'info' | 'success', message: string, icon: string }[]>([]);

  // Cut-off time check
  isCutoffPassed = signal(false);
  nextBusinessDay = signal('');

  // TTL expiration tracking
  expiringReservations = signal<any[]>([]);

  ngOnInit() {
    this.loadData();
    this.loadShipmentStats();
    this.checkCutoff();
  }

  loadData() {
    // Load recent orders (first 5)
    this.orderService.getMyOrders(0, 5).subscribe({
      next: (data) => {
        this.recentOrders.set(data.content || []);
      }
    });

    // Load all orders for stats
    this.orderService.getMyOrders(0, 100).subscribe({
      next: (data) => {
        const orders = data.content || [];
        this.stats.set({
          total: data.totalElements,
          created: orders.filter((o: any) => o.status === 'CREATED').length,
          reserved: orders.filter((o: any) => o.status === 'RESERVED').length,
          shipped: orders.filter((o: any) => o.status === 'SHIPPED').length,
          delivered: orders.filter((o: any) => o.status === 'DELIVERED').length,
          cancelled: orders.filter((o: any) => o.status === 'CANCELLED').length
        });

        this.checkTTLAlerts(orders);
        this.checkBackorders(orders);
      }
    });
  }

  loadShipmentStats() {
    this.shipmentService.getClientShipments(0, 50).subscribe({
      next: (data) => {
        const shipments = data.content || [];
        this.shipmentStats.set({
          planned: shipments.filter((s: any) => s.status === 'PLANNED').length,
          inTransit: shipments.filter((s: any) => s.status === 'IN_TRANSIT').length,
          delivered: shipments.filter((s: any) => s.status === 'DELIVERED').length
        });

        // Add in-transit notification
        const inTransitCount = shipments.filter((s: any) => s.status === 'IN_TRANSIT').length;
        if (inTransitCount > 0) {
          this.alerts.update(a => [...a, {
            type: 'success',
            icon: '🚚',
            message: `${inTransitCount} colis en cours de livraison`
          }]);
        }
      }
    });
  }

  checkCutoff() {
    const now = new Date();
    if (now.getHours() >= 15) {
      this.isCutoffPassed.set(true);

      // Calculate next business day
      const nextDay = new Date(now);
      nextDay.setDate(nextDay.getDate() + 1);

      // Skip weekends
      while (nextDay.getDay() === 0 || nextDay.getDay() === 6) {
        nextDay.setDate(nextDay.getDate() + 1);
      }

      this.nextBusinessDay.set(nextDay.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      }));

      this.alerts.update(a => [...a, {
        type: 'info',
        icon: '🕒',
        message: `Cut-off de 15h dépassé. Les nouvelles commandes seront planifiées pour ${this.nextBusinessDay()}.`
      }]);
    }
  }

  checkTTLAlerts(orders: any[]) {
    const now = new Date();

    // Find reservations within 6 hours of expiring (24h TTL)
    const expiringSoon = orders.filter(o => {
      if (o.status !== 'RESERVED' || !o.reservedAt) return false;

      const reservedTime = new Date(o.reservedAt).getTime();
      const expiryTime = reservedTime + 24 * 60 * 60 * 1000; // 24 hours
      const hoursUntilExpiry = (expiryTime - now.getTime()) / (1000 * 60 * 60);

      return hoursUntilExpiry > 0 && hoursUntilExpiry <= 6;
    });

    this.expiringReservations.set(expiringSoon);

    if (expiringSoon.length > 0) {
      this.alerts.update(a => [...a, {
        type: 'warning',
        icon: '⏰',
        message: `${expiringSoon.length} réservation(s) expirent dans moins de 6h. Finalisez votre commande rapidement !`
      }]);
    }

    // Check for already expired reservations
    const expired = orders.filter(o => {
      if (o.status !== 'RESERVED' || !o.reservedAt) return false;

      const reservedTime = new Date(o.reservedAt).getTime();
      const expiryTime = reservedTime + 24 * 60 * 60 * 1000;
      return now.getTime() > expiryTime;
    });

    if (expired.length > 0) {
      this.alerts.update(a => [...a, {
        type: 'warning',
        icon: '⚠️',
        message: `${expired.length} réservation(s) ont expiré et ont été libérées.`
      }]);
    }
  }

  checkBackorders(orders: any[]) {
    // Find orders with partial reservations (if backend supports this info)
    const partialOrders = orders.filter(o => o.hasBackorder === true);

    if (partialOrders.length > 0) {
      this.alerts.update(a => [...a, {
        type: 'info',
        icon: '📋',
        message: `${partialOrders.length} commande(s) en attente de stock (backorder).`
      }]);
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

  getRemainingTTL(reservedAt: string): string {
    const now = new Date();
    const reservedTime = new Date(reservedAt).getTime();
    const expiryTime = reservedTime + 24 * 60 * 60 * 1000;
    const remainingMs = expiryTime - now.getTime();

    if (remainingMs <= 0) return 'Expirée';

    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}min restantes`;
  }
}
