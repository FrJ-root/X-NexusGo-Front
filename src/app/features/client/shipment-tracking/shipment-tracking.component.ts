import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ShipmentService } from '../../../core/services/shipment.service';
import { Shipment, ShipmentStatus } from '../../../shared/models/business.models';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
    selector: 'app-shipment-tracking',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Suivi des Expéditions</h1>
        <p class="subtitle">Suivez vos colis en temps réel</p>
      </div>

      <!-- Stats Summary -->
      <div class="stats-grid">
        <div class="stat-card stat-planned">
          <div class="stat-icon">📋</div>
          <div class="stat-content">
            <span class="stat-value">{{ plannedCount() }}</span>
            <span class="stat-label">Planifiées</span>
          </div>
        </div>
        <div class="stat-card stat-transit">
          <div class="stat-icon">🚚</div>
          <div class="stat-content">
            <span class="stat-value">{{ inTransitCount() }}</span>
            <span class="stat-label">En transit</span>
          </div>
        </div>
        <div class="stat-card stat-delivered">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <span class="stat-value">{{ deliveredCount() }}</span>
            <span class="stat-label">Livrées</span>
          </div>
        </div>
      </div>

      <!-- Shipments List -->
      <div class="shipments-section">
        <div class="section-header">
          <h2>Mes Expéditions</h2>
          <div class="filter-tabs">
            <button 
              class="tab" 
              [class.active]="activeFilter() === 'ALL'"
              (click)="setFilter('ALL')">
              Toutes
            </button>
            <button 
              class="tab" 
              [class.active]="activeFilter() === 'PLANNED'"
              (click)="setFilter('PLANNED')">
              Planifiées
            </button>
            <button 
              class="tab" 
              [class.active]="activeFilter() === 'IN_TRANSIT'"
              (click)="setFilter('IN_TRANSIT')">
              En transit
            </button>
            <button 
              class="tab" 
              [class.active]="activeFilter() === 'DELIVERED'"
              (click)="setFilter('DELIVERED')">
              Livrées
            </button>
          </div>
        </div>

        <div class="shipments-list" *ngIf="filteredShipments().length > 0; else noShipments">
          <div *ngFor="let shipment of filteredShipments()" class="shipment-card">
            <div class="shipment-header">
              <div class="tracking-info">
                <span class="tracking-label">N° Suivi</span>
                <span class="tracking-number">{{ shipment.trackingNumber || 'En attente' }}</span>
              </div>
              <span class="status-badge" [class]="'status-' + shipment.status.toLowerCase()">
                {{ getStatusLabel(shipment.status) }}
              </span>
            </div>

            <div class="shipment-body">
              <div class="info-row">
                <span class="icon">📦</span>
                <span class="label">Commande:</span>
                <a [routerLink]="['/client/orders', shipment.salesOrderId]" class="link">
                  #{{ shipment.salesOrderId }}
                </a>
              </div>
              <div class="info-row" *ngIf="shipment.carrier">
                <span class="icon">🚛</span>
                <span class="label">Transporteur:</span>
                <span class="value">{{ shipment.carrier }}</span>
              </div>
              <div class="info-row" *ngIf="shipment.plannedDate">
                <span class="icon">📅</span>
                <span class="label">Date prévue:</span>
                <span class="value">{{ shipment.plannedDate | date:'fullDate' }}</span>
              </div>
            </div>

            <!-- Status Timeline -->
            <div class="status-timeline">
              <div class="timeline-step" [class.completed]="isStepCompleted(shipment, 'PLANNED')">
                <div class="step-marker"></div>
                <span class="step-label">Planifiée</span>
              </div>
              <div class="timeline-connector" [class.active]="isStepCompleted(shipment, 'IN_TRANSIT')"></div>
              <div class="timeline-step" [class.completed]="isStepCompleted(shipment, 'IN_TRANSIT')">
                <div class="step-marker"></div>
                <span class="step-label">En transit</span>
              </div>
              <div class="timeline-connector" [class.active]="isStepCompleted(shipment, 'DELIVERED')"></div>
              <div class="timeline-step" [class.completed]="isStepCompleted(shipment, 'DELIVERED')">
                <div class="step-marker"></div>
                <span class="step-label">Livrée</span>
              </div>
            </div>
          </div>
        </div>

        <ng-template #noShipments>
          <div class="empty-state">
            <div class="empty-icon">📭</div>
            <h3>Aucune expédition</h3>
            <p>Vous n'avez pas encore d'expéditions {{ activeFilter() !== 'ALL' ? 'dans cette catégorie' : '' }}</p>
            <a routerLink="/client/orders" class="btn btn-primary">Voir mes commandes</a>
          </div>
        </ng-template>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="totalPages() > 1">
        <button 
          class="btn btn-outline" 
          [disabled]="currentPage() === 0"
          (click)="loadPage(currentPage() - 1)">
          Précédent
        </button>
        <span class="page-info">Page {{ currentPage() + 1 }} sur {{ totalPages() }}</span>
        <button 
          class="btn btn-outline" 
          [disabled]="currentPage() >= totalPages() - 1"
          (click)="loadPage(currentPage() + 1)">
          Suivant
        </button>
      </div>
    </div>
  `,
    styleUrl: './shipment-tracking.component.scss'
})
export class ShipmentTrackingComponent implements OnInit {
    private shipmentService = inject(ShipmentService);
    private toastService = inject(ToastService);

    // Expose enum for template use
    ShipmentStatus = ShipmentStatus;

    shipments = signal<Shipment[]>([]);
    activeFilter = signal<string>('ALL');
    currentPage = signal(0);
    totalPages = signal(0);
    loading = signal(false);

    // Computed signals for stats
    plannedCount = signal(0);
    inTransitCount = signal(0);
    deliveredCount = signal(0);

    ngOnInit() {
        this.loadShipments();
    }

    loadShipments(page: number = 0) {
        this.loading.set(true);
        this.shipmentService.getClientShipments(page, 10).subscribe({
            next: (response) => {
                this.shipments.set(response.content || []);
                this.totalPages.set(response.totalPages || 0);
                this.currentPage.set(page);
                this.updateStats();
                this.loading.set(false);
            },
            error: () => {
                this.toastService.show('Erreur lors du chargement des expéditions', 'error');
                this.loading.set(false);
            }
        });
    }

    updateStats() {
        const all = this.shipments();
        this.plannedCount.set(all.filter(s => s.status === ShipmentStatus.PLANNED).length);
        this.inTransitCount.set(all.filter(s => s.status === ShipmentStatus.IN_TRANSIT).length);
        this.deliveredCount.set(all.filter(s => s.status === ShipmentStatus.DELIVERED).length);
    }

    filteredShipments() {
        if (this.activeFilter() === 'ALL') {
            return this.shipments();
        }
        return this.shipments().filter(s => s.status === this.activeFilter());
    }

    setFilter(filter: string) {
        this.activeFilter.set(filter);
    }

    loadPage(page: number) {
        this.loadShipments(page);
    }

    getStatusLabel(status: ShipmentStatus): string {
        const labels: Record<string, string> = {
            [ShipmentStatus.PLANNED]: 'Planifiée',
            [ShipmentStatus.IN_TRANSIT]: 'En transit',
            [ShipmentStatus.DELIVERED]: 'Livrée'
        };
        return labels[status] || status;
    }

    isStepCompleted(shipment: Shipment, step: string): boolean {
        const order = [ShipmentStatus.PLANNED, ShipmentStatus.IN_TRANSIT, ShipmentStatus.DELIVERED];
        const currentIndex = order.indexOf(shipment.status as ShipmentStatus);
        const stepIndex = order.indexOf(step as ShipmentStatus);
        return stepIndex <= currentIndex;
    }
}
