import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { InventoryMovementsApiService, CreateMovementRequest } from '../../../api/inventory-movements-api.service';
import { WarehousesApiService } from '../../../api/warehouses-api.service';
import { ProductsApiService } from '../../../api/products-api.service';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { SearchFiltersComponent, FilterField } from '../../../shared/components/search-filters/search-filters.component';
import { ToastService } from '../../../shared/services/toast.service';
import { InventoryMovement, MovementType, Warehouse, Product, Page } from '../../../shared/models';

@Component({
  selector: 'app-warehouse-movements',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DataTableComponent,
    SearchFiltersComponent
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Mouvements de stock</h1>
          <p class="subtitle">Entrées, sorties et ajustements</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">
          ➕ Nouveau mouvement
        </button>
      </div>

      <app-search-filters
        [fields]="filterFields"
        [values]="filterValues()"
        (valuesChange)="filterValues.set($event)"
        (search)="onSearch($event)"
        (reset)="onReset()"
      />

      <app-data-table
        [columns]="columns"
        [data]="movements()"
        [loading]="loading()"
        [totalElements]="totalElements()"
        [totalPages]="totalPages()"
        [currentPage]="currentPage()"
        [pageSize]="pageSize()"
        (pageChange)="onPageChange($event)"
        (pageSizeChange)="onPageSizeChange($event)"
      />

      <!-- Create Modal -->
      @if (showCreateModal()) {
        <div class="modal-overlay" (click)="closeCreateModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Nouveau mouvement</h2>
              <button class="close-btn" (click)="closeCreateModal()">×</button>
            </div>
            <form [formGroup]="movementForm" (ngSubmit)="onSubmit()">
              <div class="modal-body">
                <div class="form-group">
                  <label for="type">Type de mouvement *</label>
                  <select id="type" formControlName="type">
                    <option value="">Sélectionner...</option>
                    <option value="INBOUND">Entrée (INBOUND)</option>
                    <option value="OUTBOUND">Sortie (OUTBOUND)</option>
                    <option value="ADJUSTMENT">Ajustement (ADJUSTMENT)</option>
                  </select>
                  @if (movementForm.get('type')?.value) {
                    <small class="hint">
                      @switch (movementForm.get('type')?.value) {
                        @case ('INBOUND') { 📥 Ajout de stock (réception, retour, etc.) }
                        @case ('OUTBOUND') { 📤 Retrait de stock (prélèvement, perte, etc.) }
                        @case ('ADJUSTMENT') { 🔄 Correction (inventaire, erreur, etc.) }
                      }
                    </small>
                  }
                </div>

                <div class="form-group">
                  <label for="warehouseId">Entrepôt *</label>
                  <select id="warehouseId" formControlName="warehouseId">
                    <option value="">Sélectionner...</option>
                    @for (w of warehouses(); track w.id) {
                      <option [value]="w.id">{{ w.name }}</option>
                    }
                  </select>
                </div>

                <div class="form-group">
                  <label for="productId">Produit *</label>
                  <select id="productId" formControlName="productId">
                    <option value="">Sélectionner...</option>
                    @for (p of products(); track p.id) {
                      <option [value]="p.id">{{ p.name }} ({{ p.sku }})</option>
                    }
                  </select>
                </div>

                <div class="form-group">
                  <label for="quantity">Quantité *</label>
                  <input 
                    type="number" 
                    id="quantity" 
                    formControlName="quantity" 
                    [min]="movementForm.get('type')?.value === 'ADJUSTMENT' ? null : 1"
                  />
                  @if (movementForm.get('type')?.value === 'ADJUSTMENT') {
                    <small class="hint">💡 Valeur négative pour diminuer, positive pour augmenter</small>
                  }
                </div>

                <div class="form-group">
                  <label for="reason">Motif / Commentaire</label>
                  <textarea id="reason" formControlName="reason" rows="3"></textarea>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeCreateModal()">Annuler</button>
                <button type="submit" class="btn btn-primary" [disabled]="movementForm.invalid || saving()">
                  @if (saving()) { <span class="spinner-sm"></span> }
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1400px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.5rem; color: #111827; }
    .subtitle { margin: 0.25rem 0 0; color: #6b7280; font-size: 0.875rem; }

    .btn { padding: 0.625rem 1.25rem; border-radius: 8px; font-weight: 500; font-size: 0.875rem; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.5rem; }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-primary:hover:not(:disabled) { background: #2563eb; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { background: #f3f4f6; color: #374151; }

    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 12px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e5e7eb; }
    .modal-header h2 { margin: 0; font-size: 1.125rem; }
    .close-btn { background: none; border: none; font-size: 1.5rem; color: #6b7280; cursor: pointer; }
    .modal-body { padding: 1.5rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb; }

    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #374151; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.625rem 0.875rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
    .hint { display: block; margin-top: 0.375rem; font-size: 0.75rem; color: #6b7280; }

    .spinner-sm { width: 16px; height: 16px; border: 2px solid rgba(255, 255, 255, 0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class WarehouseMovementsComponent implements OnInit {
  private movementsApi = inject(InventoryMovementsApiService);
  private warehousesApi = inject(WarehousesApiService);
  private productsApi = inject(ProductsApiService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  movements = signal<InventoryMovement[]>([]);
  warehouses = signal<Warehouse[]>([]);
  products = signal<Product[]>([]);
  loading = signal(false);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);
  pageSize = signal(20);
  filterValues = signal<Record<string, any>>({});

  showCreateModal = signal(false);
  saving = signal(false);

  movementForm = this.fb.group({
    type: ['', Validators.required],
    warehouseId: ['', Validators.required],
    productId: ['', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    reason: ['']
  });

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'type', label: 'Type', template: 'status' },
    { key: 'productName', label: 'Produit', sortable: true },
    { key: 'productSku', label: 'SKU', width: '120px' },
    { key: 'warehouseName', label: 'Entrepôt' },
    { key: 'quantity', label: 'Quantité', align: 'right' },
    { key: 'reason', label: 'Motif' },
    { key: 'createdAt', label: 'Date', template: 'date', sortable: true },
    { key: 'createdBy', label: 'Par' }
  ];

  filterFields: FilterField[] = [
    { key: 'type', label: 'Type', type: 'select', options: [
      { value: 'INBOUND', label: 'Entrée' },
      { value: 'OUTBOUND', label: 'Sortie' },
      { value: 'ADJUSTMENT', label: 'Ajustement' }
    ]},
    { key: 'productName', label: 'Produit', type: 'text', placeholder: 'Nom du produit...' }
  ];

  ngOnInit(): void {
    this.loadMovements();
    this.loadReferenceData();
  }

  loadMovements(): void {
    this.loading.set(true);
    this.movementsApi.search(this.filterValues(), { page: this.currentPage(), size: this.pageSize() }).subscribe({
      next: (page) => {
        this.movements.set(page.content);
        this.totalElements.set(page.totalElements);
        this.totalPages.set(page.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadReferenceData(): void {
    this.warehousesApi.getAllActive().subscribe((data: Warehouse[]) => this.warehouses.set(data));
    this.productsApi.getActiveProducts({ size: 100 }).subscribe((page: Page<Product>) => this.products.set(page.content));
  }

  onSearch(filters: Record<string, any>): void {
    this.filterValues.set(filters);
    this.currentPage.set(0);
    this.loadMovements();
  }

  onReset(): void {
    this.filterValues.set({});
    this.currentPage.set(0);
    this.loadMovements();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadMovements();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.loadMovements();
  }

  openCreateModal(): void {
    this.movementForm.reset({ quantity: 1 });
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  onSubmit(): void {
    if (this.movementForm.invalid) return;
    this.saving.set(true);

    const formValue = this.movementForm.value;
    const request: CreateMovementRequest = {
      movementType: formValue.type as MovementType,
      warehouseId: Number(formValue.warehouseId),
      productId: Number(formValue.productId),
      quantity: formValue.quantity!,
      reason: formValue.reason || undefined
    };

    this.movementsApi.create(request).subscribe({
      next: () => {
        this.toast.success('Mouvement enregistré');
        this.closeCreateModal();
        this.loadMovements();
        this.saving.set(false);
      },
      error: () => this.saving.set(false)
    });
  }
}
