import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryApiService } from '../../../api/inventory-api.service';
import { WarehousesApiService } from '../../../api/warehouses-api.service';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { SearchFiltersComponent, FilterField } from '../../../shared/components/search-filters/search-filters.component';
import { Inventory, Warehouse, Page } from '../../../shared/models';

@Component({
  selector: 'app-warehouse-inventory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataTableComponent,
    SearchFiltersComponent
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Gestion des stocks</h1>
          <p class="subtitle">Vue multi-entrepôts de l'inventaire</p>
        </div>
        <div class="warehouse-selector">
          <select [(ngModel)]="selectedWarehouse" (change)="onWarehouseChange()">
            <option value="">Tous les entrepôts</option>
            @for (w of warehouses(); track w.id) {
              <option [value]="w.id">{{ w.name }}</option>
            }
          </select>
        </div>
      </div>

      <app-search-filters
        [fields]="filterFields"
        [values]="filterValues()"
        (valuesChange)="filterValues.set($event)"
        (search)="onSearch($event)"
        (reset)="onReset()"
      />

      <div class="inventory-summary">
        <div class="summary-item">
          <span class="summary-value">{{ totalItems() }}</span>
          <span class="summary-label">Articles différents</span>
        </div>
        <div class="summary-item">
          <span class="summary-value">{{ totalQuantity() }}</span>
          <span class="summary-label">Unités totales</span>
        </div>
        <div class="summary-item warning">
          <span class="summary-value">{{ lowStockCount() }}</span>
          <span class="summary-label">Sous seuil minimum</span>
        </div>
        <div class="summary-item danger">
          <span class="summary-value">{{ outOfStockCount() }}</span>
          <span class="summary-label">En rupture</span>
        </div>
      </div>

      <app-data-table
        [columns]="columns"
        [data]="inventory()"
        [loading]="loading()"
        [totalElements]="totalElements()"
        [totalPages]="totalPages()"
        [currentPage]="currentPage()"
        [pageSize]="pageSize()"
        (pageChange)="onPageChange($event)"
        (pageSizeChange)="onPageSizeChange($event)"
      />
    </div>
  `,
  styles: [`
    .page { max-width: 1400px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.5rem; color: #111827; }
    .subtitle { margin: 0.25rem 0 0; color: #6b7280; font-size: 0.875rem; }

    .warehouse-selector select { padding: 0.625rem 1rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; min-width: 200px; }

    .inventory-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    @media (max-width: 900px) { .inventory-summary { grid-template-columns: repeat(2, 1fr); } }

    .summary-item { background: white; border-radius: 12px; padding: 1.25rem; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .summary-item.warning { border-left: 4px solid #f59e0b; }
    .summary-item.danger { border-left: 4px solid #ef4444; }
    .summary-value { display: block; font-size: 1.75rem; font-weight: 700; color: #111827; }
    .summary-label { font-size: 0.75rem; color: #6b7280; text-transform: uppercase; }
  `]
})
export class WarehouseInventoryComponent implements OnInit {
  private inventoryApi = inject(InventoryApiService);
  private warehousesApi = inject(WarehousesApiService);

  inventory = signal<Inventory[]>([]);
  warehouses = signal<Warehouse[]>([]);
  loading = signal(false);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);
  pageSize = signal(20);
  filterValues = signal<Record<string, any>>({});
  selectedWarehouse = '';

  totalItems = signal(0);
  totalQuantity = signal(0);
  lowStockCount = signal(0);
  outOfStockCount = signal(0);

  columns: TableColumn[] = [
    { key: 'productSku', label: 'SKU', width: '120px' },
    { key: 'productName', label: 'Produit', sortable: true },
    { key: 'warehouseName', label: 'Entrepôt' },
    { key: 'quantityAvailable', label: 'Disponible', align: 'right' },
    { key: 'quantityReserved', label: 'Réservé', align: 'right' },
    { key: 'quantityTotal', label: 'Total', align: 'right' },
    { key: 'minQuantity', label: 'Seuil min.', align: 'right' },
    { key: 'stockStatus', label: 'Statut', template: 'status' }
  ];

  filterFields: FilterField[] = [
    { key: 'productName', label: 'Produit', type: 'text', placeholder: 'Nom du produit...' },
    { key: 'sku', label: 'SKU', type: 'text', placeholder: 'SKU...' },
    { key: 'lowStock', label: 'Stock bas uniquement', type: 'boolean' }
  ];

  ngOnInit(): void {
    this.loadWarehouses();
    this.loadInventory();
  }

  loadWarehouses(): void {
    this.warehousesApi.getAllActive().subscribe((data: Warehouse[]) => this.warehouses.set(data));
  }

  loadInventory(): void {
    this.loading.set(true);
    const filters = { ...this.filterValues() };
    if (this.selectedWarehouse) {
      filters['warehouseId'] = Number(this.selectedWarehouse);
    }

    this.inventoryApi.search(filters, { page: this.currentPage(), size: this.pageSize() }).subscribe({
      next: (page: Page<Inventory>) => {
        const enrichedData = page.content.map((inv: Inventory) => ({
          ...inv,
          quantityTotal: inv.qtyOnHand,
          stockStatus: this.getStockStatus(inv)
        }));
        this.inventory.set(enrichedData);
        this.totalElements.set(page.totalElements);
        this.totalPages.set(page.totalPages);
        this.calculateSummary(enrichedData);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  calculateSummary(data: Inventory[]): void {
    this.totalItems.set(data.length);
    this.totalQuantity.set(data.reduce((sum, inv) => sum + inv.qtyOnHand, 0));
    this.lowStockCount.set(data.filter(inv => (inv.available || 0) <= 10 && (inv.available || 0) > 0).length);
    this.outOfStockCount.set(data.filter(inv => (inv.available || 0) === 0).length);
  }

  getStockStatus(inv: Inventory): string {
    const available = inv.available || 0;
    if (available === 0) return 'OUT_OF_STOCK';
    if (available <= 10) return 'LOW_STOCK';
    return 'IN_STOCK';
  }

  onWarehouseChange(): void {
    this.currentPage.set(0);
    this.loadInventory();
  }

  onSearch(filters: Record<string, any>): void {
    this.filterValues.set(filters);
    this.currentPage.set(0);
    this.loadInventory();
  }

  onReset(): void {
    this.filterValues.set({});
    this.selectedWarehouse = '';
    this.currentPage.set(0);
    this.loadInventory();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadInventory();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.loadInventory();
  }
}
