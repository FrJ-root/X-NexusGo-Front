import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportingApiService, InventoryAlert, TopProduct, MovementReport } from '../../../api/reporting-api.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { DashboardStats } from '../../../shared/models';

interface StatusCount {
  status: string;
  count: number;
}

@Component({
  selector: 'app-admin-reporting',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatCardComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Reporting & Statistiques</h1>
          <p class="subtitle">Vue d'ensemble des performances</p>
        </div>
        <div class="date-range">
          <input type="date" [(ngModel)]="startDate" (change)="loadReports()" />
          <span>à</span>
          <input type="date" [(ngModel)]="endDate" (change)="loadReports()" />
        </div>
      </div>

      @if (loading()) {
        <app-loading-spinner [overlay]="true" message="Chargement des rapports..." />
      }

      <!-- KPI Cards -->
      <div class="stats-grid">
        <app-stat-card
          title="Commandes"
          [value]="stats()?.totalOrders || 0"
          icon="📦"
          variant="primary"
        />
        <app-stat-card
          title="Produits actifs"
          [value]="stats()?.activeProducts || 0"
          icon="🏷️"
          variant="success"
        />
        <app-stat-card
          title="Ruptures"
          [value]="stats()?.stockOutages || 0"
          icon="⚠️"
          variant="danger"
        />
        <app-stat-card
          title="Taux livraison"
          [value]="(stats()?.deliveryRate || 0) + '%'"
          icon="🚚"
          variant="info"
        />
      </div>

      <!-- Charts Section -->
      <div class="charts-grid">
        <!-- Orders by Status -->
        <div class="chart-card">
          <h3>Commandes par statut</h3>
          <div class="chart-content">
            @for (item of ordersByStatus(); track item.status) {
              <div class="bar-item">
                <div class="bar-label">{{ item.status }}</div>
                <div class="bar-container">
                  <div class="bar" [style.width.%]="getPercentage(item.count, getTotalOrders())">
                    <span class="bar-value">{{ item.count }}</span>
                  </div>
                </div>
              </div>
            }
            @if (ordersByStatus().length === 0) {
              <p class="empty-text">Aucune donnée</p>
            }
          </div>
        </div>

        <!-- Inventory Alerts -->
        <div class="chart-card">
          <h3>🚨 Alertes de stock</h3>
          <div class="alerts-list">
            @for (alert of inventoryAlerts(); track alert.productId + '-' + alert.warehouseName) {
              <div class="alert-item">
                <div class="alert-product">
                  <strong>{{ alert.productName }}</strong>
                  <span class="sku">{{ alert.productSku }}</span>
                </div>
                <div class="alert-details">
                  <span class="warehouse">{{ alert.warehouseName }}</span>
                  <span class="qty deficit">
                    {{ alert.currentQty }} / {{ alert.minQty }}
                    <small>(manque {{ alert.deficit }})</small>
                  </span>
                </div>
              </div>
            }
            @if (inventoryAlerts().length === 0) {
              <p class="empty-text success">✓ Aucune alerte de stock</p>
            }
          </div>
        </div>
      </div>

      <div class="charts-grid">
        <!-- Top Products -->
        <div class="chart-card">
          <h3>🏆 Top 10 Produits vendus</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th class="text-right">Qté</th>
                <th class="text-right">CA</th>
              </tr>
            </thead>
            <tbody>
              @for (product of topProducts(); track product.productId) {
                <tr>
                  <td>
                    <div class="product-cell">
                      <span class="name">{{ product.productName }}</span>
                      <span class="sku">{{ product.productSku }}</span>
                    </div>
                  </td>
                  <td class="text-right">{{ product.totalQuantity }}</td>
                  <td class="text-right">{{ product.totalRevenue | number:'1.2-2' }} €</td>
                </tr>
              }
              @if (topProducts().length === 0) {
                <tr><td colspan="3" class="empty-text">Aucune donnée</td></tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Movement Report -->
        <div class="chart-card">
          <h3>📊 Mouvements par entrepôt</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>Entrepôt</th>
                <th class="text-right">Entrées</th>
                <th class="text-right">Sorties</th>
                <th class="text-right">Net</th>
              </tr>
            </thead>
            <tbody>
              @for (report of movementReports(); track report.warehouseId) {
                <tr>
                  <td>{{ report.warehouseName }}</td>
                  <td class="text-right positive">+{{ report.totalInbound }}</td>
                  <td class="text-right negative">-{{ report.totalOutbound }}</td>
                  <td class="text-right" [class.positive]="report.netChange > 0" [class.negative]="report.netChange < 0">
                    {{ report.netChange > 0 ? '+' : '' }}{{ report.netChange }}
                  </td>
                </tr>
              }
              @if (movementReports().length === 0) {
                <tr><td colspan="4" class="empty-text">Aucune donnée</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="summary-section">
        <h2>Résumé de la période</h2>
        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-icon">💰</div>
            <div class="summary-content">
              <span class="summary-value">{{ totalRevenue() | number:'1.2-2' }} €</span>
              <span class="summary-label">Chiffre d'affaires</span>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon">📦</div>
            <div class="summary-content">
              <span class="summary-value">{{ totalShipments() }}</span>
              <span class="summary-label">Expéditions</span>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon">🏭</div>
            <div class="summary-content">
              <span class="summary-value">{{ totalPurchaseOrders() }}</span>
              <span class="summary-label">Commandes fournisseurs</span>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon">📈</div>
            <div class="summary-content">
              <span class="summary-value">{{ avgOrderValue() | number:'1.2-2' }} €</span>
              <span class="summary-label">Panier moyen</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 1400px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.5rem; color: #111827; }
    .subtitle { margin: 0.25rem 0 0; color: #6b7280; font-size: 0.875rem; }

    .date-range { display: flex; align-items: center; gap: 0.75rem; }
    .date-range input { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; }
    .date-range span { color: #6b7280; }

    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    @media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }

    .charts-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 1.5rem; }
    @media (max-width: 900px) { .charts-grid { grid-template-columns: 1fr; } }

    .chart-card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .chart-card h3 { margin: 0 0 1rem; font-size: 1rem; color: #374151; }

    .bar-item { margin-bottom: 0.75rem; }
    .bar-label { font-size: 0.75rem; color: #6b7280; margin-bottom: 0.25rem; text-transform: uppercase; }
    .bar-container { background: #f3f4f6; border-radius: 4px; height: 28px; overflow: hidden; }
    .bar { background: linear-gradient(90deg, #3b82f6, #60a5fa); height: 100%; display: flex; align-items: center; justify-content: flex-end; padding: 0 0.5rem; min-width: 30px; transition: width 0.3s ease; }
    .bar-value { color: white; font-size: 0.75rem; font-weight: 600; }

    .alerts-list { max-height: 300px; overflow-y: auto; }
    .alert-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border-bottom: 1px solid #f3f4f6; }
    .alert-item:last-child { border-bottom: none; }
    .alert-product { display: flex; flex-direction: column; }
    .alert-product strong { font-size: 0.875rem; color: #111827; }
    .alert-details { display: flex; flex-direction: column; text-align: right; }
    .warehouse { font-size: 0.75rem; color: #6b7280; }
    .qty { font-size: 0.875rem; }
    .qty.deficit { color: #dc2626; }
    .qty small { display: block; font-size: 0.7rem; }
    .sku { font-size: 0.75rem; color: #9ca3af; }

    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #f3f4f6; }
    .data-table th { font-size: 0.75rem; font-weight: 600; color: #6b7280; text-transform: uppercase; background: #f9fafb; }
    .text-right { text-align: right !important; }
    .positive { color: #059669; }
    .negative { color: #dc2626; }
    .product-cell { display: flex; flex-direction: column; }
    .product-cell .name { font-size: 0.875rem; color: #111827; }

    .empty-text { text-align: center; color: #9ca3af; padding: 2rem 0; font-size: 0.875rem; }
    .empty-text.success { color: #059669; background: #d1fae5; border-radius: 8px; margin: 0.5rem 0; }

    .summary-section { margin-top: 2rem; }
    .summary-section h2 { font-size: 1.125rem; color: #374151; margin-bottom: 1rem; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
    @media (max-width: 900px) { .summary-grid { grid-template-columns: repeat(2, 1fr); } }

    .summary-card { background: white; border-radius: 12px; padding: 1.5rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .summary-icon { font-size: 2rem; }
    .summary-content { display: flex; flex-direction: column; }
    .summary-value { font-size: 1.5rem; font-weight: 700; color: #111827; }
    .summary-label { font-size: 0.75rem; color: #6b7280; text-transform: uppercase; }
  `]
})
export class AdminReportingComponent implements OnInit {
  private reportingApi = inject(ReportingApiService);

  loading = signal(false);
  stats = signal<DashboardStats | null>(null);
  ordersByStatus = signal<StatusCount[]>([]);
  inventoryAlerts = signal<InventoryAlert[]>([]);
  topProducts = signal<TopProduct[]>([]);
  movementReports = signal<MovementReport[]>([]);
  
  totalRevenue = signal(0);
  totalShipments = signal(0);
  totalPurchaseOrders = signal(0);
  avgOrderValue = signal(0);

  startDate = '';
  endDate = '';

  ngOnInit(): void {
    this.initDates();
    this.loadReports();
  }

  initDates(): void {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    this.startDate = firstDay.toISOString().split('T')[0];
    this.endDate = now.toISOString().split('T')[0];
  }

  loadReports(): void {
    this.loading.set(true);

    this.reportingApi.getDashboardStats().subscribe({
      next: (data: DashboardStats) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    this.reportingApi.getOrdersByStatus().subscribe((data: StatusCount[]) => this.ordersByStatus.set(data));
    this.reportingApi.getInventoryAlerts().subscribe((data: InventoryAlert[]) => this.inventoryAlerts.set(data));
    this.reportingApi.getTopProducts(10, this.startDate, this.endDate).subscribe((data: TopProduct[]) => this.topProducts.set(data));
    this.reportingApi.getMovementsByWarehouse(this.startDate, this.endDate).subscribe((data: MovementReport[]) => this.movementReports.set(data));
    this.reportingApi.getTotalRevenue(this.startDate, this.endDate).subscribe((v: number) => this.totalRevenue.set(v));
    this.reportingApi.getShipmentCount(this.startDate, this.endDate).subscribe((v: number) => this.totalShipments.set(v));
    this.reportingApi.getPurchaseOrderCount(this.startDate, this.endDate).subscribe((v: number) => this.totalPurchaseOrders.set(v));
    this.reportingApi.getAverageOrderValue(this.startDate, this.endDate).subscribe((v: number) => this.avgOrderValue.set(v));
  }

  getTotalOrders(): number {
    return this.ordersByStatus().reduce((sum, item) => sum + item.count, 0);
  }

  getPercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.max(5, (value / total) * 100);
  }
}
