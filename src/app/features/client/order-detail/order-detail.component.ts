import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SalesOrderService } from '../../../core/services/sales-order.service';
import { ShipmentService } from '../../../core/services/shipment.service';
import { SalesOrder, Shipment } from '../../../shared/models/business.models';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
    selector: 'app-order-detail',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <div class="page-container" *ngIf="order() as o">
      <div class="page-header">
        <a routerLink="/client/orders" class="back-link">← Retour aux commandes</a>
        <h1>Commande #{{ o.id }}</h1>
      </div>

      <div class="detail-grid">
        <!-- Main Order Info -->
        <div class="card order-main">
          <h3>Informations Générales</h3>
          <div class="info-row">
            <span class="label">Statut:</span>
            <span class="value" [class]="'status-' + o.status.toLowerCase()">{{ o.status }}</span>
          </div>
          <div class="info-row">
            <span class="label">Date de création:</span>
            <span class="value">{{ o.createdAt | date:'medium' }}</span>
          </div>
          <div class="info-row" *ngIf="o.reservedAt">
            <span class="label">Réservé le:</span>
            <span class="value">{{ o.reservedAt | date:'medium' }}</span>
          </div>

          <div class="order-actions" *ngIf="o.status === 'CREATED'">
            <button (click)="onReserve(o.id)" class="btn btn-warning">Demander Réservation</button>
            <button (click)="onCancel(o.id)" class="btn btn-danger-outline">Annuler</button>
          </div>
        </div>

        <!-- Shipment Info -->
        <div class="card order-shipment" *ngIf="shipment() as s">
          <h3>Suivi Expédition</h3>
          <div class="info-row">
            <span class="label">Numéro de suivi:</span>
            <span class="value"><strong>{{ s.trackingNumber }}</strong></span>
          </div>
          <div class="info-row">
            <span class="label">Statut Suivi:</span>
            <span class="value">{{ s.status }}</span>
          </div>
          <div class="info-row" *ngIf="s.plannedDate">
            <span class="label">Prévu le:</span>
            <span class="value">{{ s.plannedDate | date:'shortDate' }}</span>
          </div>
        </div>

        <!-- Order Lines -->
        <div class="card order-lines">
          <h3>Articles</h3>
          <table class="table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Prix Univ.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let line of o.lines">
                <td>#{{ line.productId }}</td>
                <td>{{ line.quantity }}</td>
                <td>{{ line.unitPrice }} €</td>
                <td>{{ (line.quantity * line.unitPrice) }} €</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="text-right"><strong>Total</strong></td>
                <td><strong>{{ getTotal(o) }} €</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .page-container { padding: 2rem; }
    .back-link { display: block; margin-bottom: 1rem; color: var(--primary-color); text-decoration: none; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem; }
    .order-lines { grid-column: 1 / -1; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; padding: 0.5rem 0; border-bottom: 1px solid #eee; }
    .order-actions { margin-top: 2rem; display: flex; gap: 1rem; }
  `]
})
export class OrderDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private orderService = inject(SalesOrderService);
    private shipmentService = inject(ShipmentService);
    private toastService = inject(ToastService);

    order = signal<SalesOrder | null>(null);
    shipment = signal<Shipment | null>(null);

    ngOnInit() {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (id) {
            this.loadOrder(id);
            this.loadShipment(id);
        }
    }

    loadOrder(id: number) {
        this.orderService.getOrderById(id).subscribe({
            next: (order) => this.order.set(order),
            error: () => this.toastService.show('Erreur chargement commande', 'error')
        });
    }

    loadShipment(orderId: number) {
        this.shipmentService.getBySalesOrder(orderId).subscribe({
            next: (shipment) => this.shipment.set(shipment),
            error: () => { } // Shipment might not exist yet
        });
    }

    getTotal(order: SalesOrder): number {
        return order.lines.reduce((acc, l) => acc + (l.quantity * l.unitPrice), 0);
    }

    onReserve(id: number) {
        this.orderService.reserve(id).subscribe({
            next: (updated) => {
                this.order.set(updated);
                this.toastService.show('Réservation réussie !', 'success');
            },
            error: (err) => {
                const msg = err.status === 409 ? 'Stock insuffisant ou partiel' : 'Erreur lors de la réservation';
                this.toastService.show(msg, 'error');
                this.loadOrder(id); // Reload to show partial status if backend updated it
            }
        });
    }

    onCancel(id: number) {
        if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
            this.orderService.cancel(id).subscribe({
                next: (updated) => {
                    this.order.set(updated);
                    this.toastService.show('Commande annulée', 'info');
                },
                error: () => this.toastService.show('Erreur lors de l’annulation', 'error')
            });
        }
    }
}
