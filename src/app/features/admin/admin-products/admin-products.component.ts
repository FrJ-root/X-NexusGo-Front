import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProductsApiService } from '../../../api/products-api.service';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { SearchFiltersComponent, FilterField } from '../../../shared/components/search-filters/search-filters.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../shared/services/toast.service';
import { Product } from '../../../shared/models';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DataTableComponent,
    SearchFiltersComponent,
    ConfirmDialogComponent
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Gestion des produits</h1>
          <p class="subtitle">Gérez le catalogue de produits</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">
          ➕ Nouveau produit
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
        [data]="products()"
        [actions]="actions"
        [loading]="loading()"
        [totalElements]="totalElements()"
        [totalPages]="totalPages()"
        [currentPage]="currentPage()"
        [pageSize]="pageSize()"
        (pageChange)="onPageChange($event)"
        (pageSizeChange)="onPageSizeChange($event)"
        (actionClick)="onAction($event)"
      />

      <!-- Create/Edit Modal -->
      @if (showModal()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ editingProduct() ? 'Modifier' : 'Créer' }} un produit</h2>
              <button class="close-btn" (click)="closeModal()">×</button>
            </div>
            <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
              <div class="modal-body">
                <div class="form-group">
                  <label for="sku">SKU *</label>
                  <input type="text" id="sku" formControlName="sku" />
                  @if (productForm.get('sku')?.errors?.['required'] && productForm.get('sku')?.touched) {
                    <span class="error">Le SKU est requis</span>
                  }
                </div>

                <div class="form-group">
                  <label for="name">Nom *</label>
                  <input type="text" id="name" formControlName="name" />
                  @if (productForm.get('name')?.errors?.['required'] && productForm.get('name')?.touched) {
                    <span class="error">Le nom est requis</span>
                  }
                </div>

                <div class="form-group">
                  <label for="description">Description</label>
                  <textarea id="description" formControlName="description" rows="3"></textarea>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="category">Catégorie</label>
                    <input type="text" id="category" formControlName="category" />
                  </div>

                  <div class="form-group">
                    <label for="unitPrice">Prix unitaire</label>
                    <input type="number" id="unitPrice" formControlName="unitPrice" step="0.01" min="0" />
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeModal()">
                  Annuler
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="productForm.invalid || saving()">
                  @if (saving()) {
                    <span class="spinner-sm"></span>
                  }
                  {{ editingProduct() ? 'Modifier' : 'Créer' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <app-confirm-dialog
        [isOpen]="showDeleteDialog()"
        title="Supprimer le produit"
        [message]="deleteMessage()"
        confirmText="Supprimer"
        variant="danger"
        [loading]="deleting()"
        (confirm)="confirmDelete()"
        (cancel)="showDeleteDialog.set(false)"
      />

      <app-confirm-dialog
        [isOpen]="showToggleDialog()"
        [title]="productToToggle()?.active ? 'Désactiver le produit' : 'Activer le produit'"
        [message]="'Êtes-vous sûr de vouloir ' + (productToToggle()?.active ? 'désactiver' : 'activer') + ' ce produit ?'"
        [confirmText]="productToToggle()?.active ? 'Désactiver' : 'Activer'"
        [variant]="productToToggle()?.active ? 'warning' : 'primary'"
        [loading]="toggling()"
        (confirm)="confirmToggle()"
        (cancel)="showToggleDialog.set(false)"
      />
    </div>
  `,
  styles: [`
    .page { max-width: 1400px; }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }
    .page-header h1 { margin: 0; font-size: 1.5rem; color: #111827; }
    .subtitle { margin: 0.25rem 0 0; color: #6b7280; font-size: 0.875rem; }
    
    .btn {
      padding: 0.625rem 1.25rem;
      border-radius: 8px;
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-primary:hover:not(:disabled) { background: #2563eb; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { background: #f3f4f6; color: #374151; }
    .btn-secondary:hover { background: #e5e7eb; }

    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal {
      background: white;
      border-radius: 12px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .modal-header h2 { margin: 0; font-size: 1.125rem; }
    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #6b7280;
      cursor: pointer;
    }
    .modal-body { padding: 1.5rem; }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .form-group { margin-bottom: 1rem; }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }
    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 0.625rem 0.875rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.875rem;
    }
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .error { display: block; margin-top: 0.25rem; font-size: 0.75rem; color: #ef4444; }
    .spinner-sm {
      width: 16px; height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AdminProductsComponent implements OnInit {
  private productsApi = inject(ProductsApiService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  products = signal<Product[]>([]);
  loading = signal(false);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);
  filterValues = signal<Record<string, any>>({});

  showModal = signal(false);
  editingProduct = signal<Product | null>(null);
  saving = signal(false);

  showDeleteDialog = signal(false);
  productToDelete = signal<Product | null>(null);
  deleting = signal(false);
  deleteMessage = signal('');

  showToggleDialog = signal(false);
  productToToggle = signal<Product | null>(null);
  toggling = signal(false);

  productForm = this.fb.group({
    sku: ['', Validators.required],
    name: ['', Validators.required],
    description: [''],
    category: [''],
    unitPrice: [0]
  });

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'sku', label: 'SKU', sortable: true },
    { key: 'name', label: 'Nom', sortable: true },
    { key: 'category', label: 'Catégorie', sortable: true },
    { key: 'unitPrice', label: 'Prix', template: 'currency', align: 'right' },
    { key: 'active', label: 'Actif', template: 'boolean' }
  ];

  actions: TableAction[] = [
    { icon: '✎', label: 'Modifier', action: 'edit', variant: 'primary' },
    { icon: '↻', label: 'Activer/Désactiver', action: 'toggle', variant: 'warning' },
    { icon: '✕', label: 'Supprimer', action: 'delete', variant: 'danger' }
  ];

  filterFields: FilterField[] = [
    { key: 'sku', label: 'SKU', type: 'text', placeholder: 'SKU...' },
    { key: 'name', label: 'Nom', type: 'text', placeholder: 'Nom...' },
    { key: 'category', label: 'Catégorie', type: 'text', placeholder: 'Catégorie...' },
    { key: 'active', label: 'Actif', type: 'boolean' }
  ];

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productsApi.search(this.filterValues(), {
      page: this.currentPage(),
      size: this.pageSize()
    }).subscribe({
      next: (page) => {
        this.products.set(page.content);
        this.totalElements.set(page.totalElements);
        this.totalPages.set(page.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSearch(filters: Record<string, any>): void {
    this.filterValues.set(filters);
    this.currentPage.set(0);
    this.loadProducts();
  }

  onReset(): void {
    this.filterValues.set({});
    this.currentPage.set(0);
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadProducts();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.loadProducts();
  }

  onAction(event: { action: string; row: Product }): void {
    switch (event.action) {
      case 'edit':
        this.openEditModal(event.row);
        break;
      case 'delete':
        this.productToDelete.set(event.row);
        this.deleteMessage.set(`Êtes-vous sûr de vouloir supprimer le produit "${event.row.name}" (${event.row.sku}) ?`);
        this.showDeleteDialog.set(true);
        break;
      case 'toggle':
        this.productToToggle.set(event.row);
        this.showToggleDialog.set(true);
        break;
    }
  }

  openCreateModal(): void {
    this.editingProduct.set(null);
    this.productForm.reset({ unitPrice: 0 });
    this.showModal.set(true);
  }

  openEditModal(product: Product): void {
    this.editingProduct.set(product);
    this.productForm.patchValue({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      category: product.category || '',
      unitPrice: product.unitPrice || 0
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingProduct.set(null);
  }

  onSubmit(): void {
    if (this.productForm.invalid) return;

    this.saving.set(true);
    const formValue = this.productForm.value;
    const product: Product = {
      sku: formValue.sku!,
      name: formValue.name!,
      description: formValue.description || undefined,
      category: formValue.category || undefined,
      unitPrice: formValue.unitPrice || undefined
    };

    const request = this.editingProduct()
      ? this.productsApi.update(this.editingProduct()!.id!, product)
      : this.productsApi.create(product);

    request.subscribe({
      next: () => {
        this.toast.success(this.editingProduct() ? 'Produit modifié' : 'Produit créé');
        this.closeModal();
        this.loadProducts();
        this.saving.set(false);
      },
      error: () => this.saving.set(false)
    });
  }

  confirmDelete(): void {
    const product = this.productToDelete();
    if (!product?.id) return;

    this.deleting.set(true);
    this.productsApi.delete(product.id).subscribe({
      next: () => {
        this.toast.success('Produit supprimé');
        this.showDeleteDialog.set(false);
        this.deleting.set(false);
        this.loadProducts();
      },
      error: () => this.deleting.set(false)
    });
  }

  confirmToggle(): void {
    const product = this.productToToggle();
    if (!product?.id) return;

    this.toggling.set(true);
    const request = product.active
      ? this.productsApi.deactivate(product.id)
      : this.productsApi.activate(product.id);

    request.subscribe({
      next: () => {
        this.toast.success(product.active ? 'Produit désactivé' : 'Produit activé');
        this.showToggleDialog.set(false);
        this.toggling.set(false);
        this.loadProducts();
      },
      error: () => this.toggling.set(false)
    });
  }
}
