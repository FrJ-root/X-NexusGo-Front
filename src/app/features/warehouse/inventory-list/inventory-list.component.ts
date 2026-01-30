import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../../core/services/inventory.service';
import { WarehouseService } from '../../../core/services/warehouse.service';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { SearchFiltersComponent, FilterField } from '../../../shared/components/search-filters/search-filters.component';
import { ToastService } from '../../../shared/services/toast.service';
import { Warehouse } from '../../../shared/models/business.models';

@Component({
    selector: 'app-inventory-list',
    standalone: true,
    imports: [CommonModule, DataTableComponent, SearchFiltersComponent],
    template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Gestion de l'Inventaire</h1>
      </div>

      <app-search-filters
        [fields]="filterFields"
        (filter)="onFilter($event)">
      </app-search-filters>

      <app-data-table
        [columns]="columns"
        [data]="inventory()"
        [totalElements]="inventory().length"
        (actionClick)="onAdjustStock($event)">
      </app-data-table>
    </div>
  `,
    styles: [`
    .page-container { padding: 2rem; }
  `]
})
export class InventoryListComponent implements OnInit {
    private inventoryService = inject(InventoryService);
    private warehouseService = inject(WarehouseService);
    private toastService = inject(ToastService);

    inventory = signal<any[]>([]);
    warehouses = signal<Warehouse[]>([]);
    selectedWarehouseId?: number;

    columns: TableColumn[] = [
        { key: 'productId', label: 'Produit ID' },
        { key: 'qtyOnHand', label: 'En Stock' },
        { key: 'qtyReserved', label: 'Réservé' },
        { key: 'available', label: 'Disponible' },
        { key: 'actions', label: 'Actions', template: 'actions' }
    ];

    filterFields: FilterField[] = [];

    ngOnInit() {
        this.loadWarehouses();
    }

    loadWarehouses() {
        this.warehouseService.getAll().subscribe(data => {
            this.warehouses.set(data);
            this.filterFields = [
                {
                    key: 'warehouseId',
                    label: 'Entrepôt',
                    type: 'select',
                    options: data.map(w => ({ label: w.name, value: w.id }))
                }
            ];
            if (data.length > 0) {
                this.selectedWarehouseId = data[0].id;
                this.loadInventory();
            }
        });
    }

    loadInventory() {
        if (!this.selectedWarehouseId) return;
        this.inventoryService.getInventoryByWarehouse(this.selectedWarehouseId).subscribe({
            next: (data) => this.inventory.set(data),
            error: () => this.toastService.show('Erreur chargement inventaire', 'error')
        });
    }

    onFilter(filters: any) {
        this.selectedWarehouseId = filters.warehouseId;
        this.loadInventory();
    }

    onAdjustStock(item: any) {
        // Open movement form or navigation
    }
}
