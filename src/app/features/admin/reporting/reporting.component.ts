import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportingService } from '../../../core/services/reporting.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
    selector: 'app-reporting',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="reporting-container">
      <div class="header">
        <h1>Analytiques & Reporting</h1>
        <button class="btn-refresh" (click)="loadData()">Actualiser</button>
      </div>

      <div class="stats-grid">
        <div class="card stat-card">
          <h3>Ratio de Livraison</h3>
          <div class="stats-value">{{ deliveryPerformance()?.onTimeRate }}%</div>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="deliveryPerformance()?.onTimeRate"></div>
          </div>
          <p>Taux de livraison à temps</p>
        </div>

        <div class="card stat-card">
          <h3>Lead Time Moyen</h3>
          <div class="stats-value">{{ deliveryPerformance()?.averageLeadTime }} j</div>
          <p>Temps moyen entre commande et livraison</p>
        </div>

        <div class="card stat-card">
          <h3>Stock Critique</h3>
          <div class="stats-value">{{ inventoryStatus()?.lowStockItems }}</div>
          <p>Produits sous le seuil d'alerte</p>
        </div>
      </div>

      <div class="charts-section">
        <div class="card chart-card">
          <h3>Statut de l'Inventaire</h3>
          <div class="inventory-bars">
            <div class="bar-group">
              <label>Total Items</label>
              <div class="bar-container">
                <div class="bar blue" [style.width.%]="100"></div>
                <span>{{ inventoryStatus()?.totalItems }}</span>
              </div>
            </div>
            <div class="bar-group">
              <label>Stock Faible</label>
              <div class="bar-container">
                <div class="bar orange" [style.width.%]="calculatePercent(inventoryStatus()?.lowStockItems, inventoryStatus()?.totalItems)"></div>
                <span>{{ inventoryStatus()?.lowStockItems }}</span>
              </div>
            </div>
            <div class="bar-group">
              <label>Rupture</label>
              <div class="bar-container">
                <div class="bar red" [style.width.%]="calculatePercent(inventoryStatus()?.outOfStockItems, inventoryStatus()?.totalItems)"></div>
                <span>{{ inventoryStatus()?.outOfStockItems }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card chart-card">
          <h3>Performance Globale</h3>
          <table class="report-table">
            <thead>
              <tr>
                <th>Métrique</th>
                <th>Valeur</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Chiffre d'affaires total</td>
                <td>{{ globalStats()?.totalRevenue | currency:'EUR' }}</td>
              </tr>
              <tr>
                <td>Nombre de commandes</td>
                <td>{{ globalStats()?.orderCount }}</td>
              </tr>
              <tr>
                <td>Utilisateurs enregistrés</td>
                <td>{{ globalStats()?.userCount }}</td>
              </tr>
              <tr>
                <td>Expéditions réalisées</td>
                <td>{{ deliveryPerformance()?.totalShipments }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .reporting-container { padding: 2rem; background: #f9fafb; min-height: 100vh; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .btn-refresh { padding: 0.5rem 1rem; border-radius: 6px; border: 1px solid #d1d5db; background: white; cursor: pointer; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .stat-card h3 { color: #6b7280; font-size: 0.875rem; margin-top: 0; }
    .stats-value { font-size: 2rem; font-weight: 700; color: #111827; margin: 0.5rem 0; }
    
    .progress-bar { height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; margin: 0.5rem 0; }
    .progress-fill { height: 100%; background: #10b981; border-radius: 4px; }
    
    .charts-section { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .chart-card h3 { margin-top: 0; margin-bottom: 1.5rem; }
    
    .inventory-bars { display: flex; flex-direction: column; gap: 1rem; }
    .bar-group label { display: block; font-size: 0.875rem; color: #4b5563; margin-bottom: 0.25rem; }
    .bar-container { display: flex; align-items: center; gap: 1rem; }
    .bar { height: 24px; border-radius: 4px; }
    .bar.blue { background: #3b82f6; }
    .bar.orange { background: #f59e0b; }
    .bar.red { background: #ef4444; }
    
    .report-table { width: 100%; border-collapse: collapse; }
    .report-table th, .report-table td { text-align: left; padding: 0.75rem; border-bottom: 1px solid #f3f4f6; }
    .report-table th { color: #6b7280; font-weight: 500; font-size: 0.875rem; }
  `]
})
export class ReportingComponent implements OnInit {
    private reportingService = inject(ReportingService);
    private toastService = inject(ToastService);

    globalStats = signal<any>(null);
    inventoryStatus = signal<any>(null);
    deliveryPerformance = signal<any>(null);

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.reportingService.getGlobalStats().subscribe(data => this.globalStats.set(data));
        this.reportingService.getInventoryStatus().subscribe(data => this.inventoryStatus.set(data));
        this.reportingService.getDeliveryPerformance().subscribe(data => this.deliveryPerformance.set(data));
    }

    calculatePercent(value: number, total: number): number {
        if (!total || !value) return 0;
        return (value / total) * 100;
    }
}
