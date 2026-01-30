import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { ToastService } from '../../../shared/services/toast.service';
import { Product } from '../../../shared/models/business.models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-crud',
  standalone: true,
  imports: [CommonModule, DataTableComponent, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1>Gestion des Produits</h1>
          <p class="subtitle">Gérez votre catalogue, les prix et les stocks</p>
        </div>
        <div class="header-actions">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Rechercher un produit..." 
              [ngModel]="searchTerm()"
              (ngModelChange)="onSearch($event)">
          </div>
          <button class="btn btn-primary" (click)="openCreateModal()">
            <span class="btn-icon">+</span> Nouveau Produit
          </button>
        </div>
      </div>

      <app-data-table
        [columns]="columns"
        [data]="filteredProducts()"
        [loading]="loading()"
        (actionClick)="onAction($event)">
      </app-data-table>

      <!-- Create/Edit Modal -->
      <div class="modal-overlay" *ngIf="showModal()" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ isEditing() ? 'Modifier le Produit' : 'Nouveau Produit' }}</h2>
            <button class="btn-close" (click)="closeModal()" title="Fermer">×</button>
          </div>
          
          <div class="modal-body">
            <form #productForm="ngForm">
              <div class="form-grid">
                <!-- SKU -->
                <div class="form-group">
                  <label for="sku">SKU <span class="required">*</span></label>
                  <input 
                    type="text" 
                    id="sku"
                    name="sku"
                    [(ngModel)]="formData.sku" 
                    class="form-control" 
                    required
                    #sku="ngModel"
                    [class.invalid]="sku.invalid && (sku.dirty || sku.touched)">
                  <div class="error-msg" *ngIf="sku.invalid && (sku.dirty || sku.touched)">
                    Le SKU est requis
                  </div>
                </div>

                <!-- Name -->
                <div class="form-group">
                  <label for="name">Nom du produit <span class="required">*</span></label>
                  <input 
                    type="text" 
                    id="name"
                    name="name"
                    [(ngModel)]="formData.name" 
                    class="form-control" 
                    required
                    #name="ngModel"
                    [class.invalid]="name.invalid && (name.dirty || name.touched)">
                  <div class="error-msg" *ngIf="name.invalid && (name.dirty || name.touched)">
                    Le nom est requis
                  </div>
                </div>

                <!-- Category -->
                <div class="form-group">
                  <label for="category">Catégorie</label>
                  <div class="category-input-wrapper">
                    <input 
                      type="text" 
                      id="category"
                      name="category"
                      [(ngModel)]="formData.category" 
                      class="form-control" 
                      list="categoriesList"
                      placeholder="Sélectionner ou taper...">
                    <datalist id="categoriesList">
                      <option *ngFor="let cat of availableCategories()" [value]="cat"></option>
                    </datalist>
                  </div>
                </div>

                <!-- Price -->
                <div class="form-group">
                  <label for="originalPrice">Prix (€) <span class="required">*</span></label>
                  <input 
                    type="number" 
                    id="originalPrice"
                    name="originalPrice"
                    [(ngModel)]="formData.originalPrice" 
                    class="form-control" 
                    required
                    min="0"
                    #price="ngModel"
                    [class.invalid]="price.invalid && (price.dirty || price.touched)">
                  <div class="error-msg" *ngIf="price.invalid && (price.dirty || price.touched)">
                    Prix valide requis (> 0)
                  </div>
                </div>

                <!-- Status -->
                <div class="form-group full-width">
                  <label class="checkbox-label">
                    <input type="checkbox" name="active" [(ngModel)]="formData.active">
                    <span class="checkbox-custom"></span>
                    <span class="label-text">Produit actif et visible sur le catalogue</span>
                  </label>
                </div>
              </div>
            </form>
          </div>

          <div class="modal-footer">
            <button class="btn btn-outline" (click)="closeModal()">Annuler</button>
            <button 
              class="btn btn-primary" 
              (click)="save()"
              [disabled]="productForm.invalid || saving()">
              <span *ngIf="saving()" class="spinner-small"></span>
              {{ isEditing() ? 'Enregistrer les modifications' : 'Créer le produit' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; background-color: #f9fafb; min-height: 100vh; }
    
    .page-container { 
      max-width: 1200px; 
      margin: 0 auto; 
      padding: 2rem; 
    }

    /* Header Styling */
    .page-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-end; 
      margin-bottom: 2.5rem;
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .header-content h1 { 
      margin: 0; 
      font-size: 1.5rem; 
      font-weight: 700; 
      color: #111827; 
    }
    .subtitle { 
      margin: 0.5rem 0 0; 
      color: #6b7280; 
      font-size: 0.875rem; 
    }

    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    /* Search Box */
    .search-box {
      position: relative;
      width: 250px;
    }
    .search-icon {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: #9ca3af;
      font-size: 0.875rem;
    }
    .search-box input {
      width: 100%;
      padding: 0.6rem 1rem 0.6rem 2.2rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.875rem;
      transition: all 0.2s;
    }
    .search-box input:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    /* Buttons */
    .btn { 
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.2rem; 
      border-radius: 8px; 
      font-weight: 500; 
      cursor: pointer; 
      border: 1px solid transparent; 
      font-size: 0.875rem;
      transition: all 0.2s;
    }
    .btn-icon { font-size: 1.1em; line-height: 1; }
    .btn-primary { 
      background: #4f46e5; 
      color: white; 
      box-shadow: 0 1px 2px rgba(79, 70, 229, 0.2); 
    }
    .btn-primary:hover:not(:disabled) { 
      background: #4338ca; 
      transform: translateY(-1px);
    }
    .btn-primary:disabled {
      background: #a5b4fc;
      cursor: not-allowed;
    }
    .btn-outline { 
      background: white; 
      border-color: #d1d5db; 
      color: #374151; 
    }
    .btn-outline:hover { 
      background: #f9fafb; 
      border-color: #9ca3af; 
    }

    /* Modal Styling */
    .modal-overlay {
      position: fixed; 
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(17, 24, 39, 0.6); 
      backdrop-filter: blur(4px);
      display: flex; 
      align-items: center; 
      justify-content: center; 
      z-index: 1000;
      animation: fadeIn 0.2s ease-out;
    }
    .modal-content {
      background: white; 
      border-radius: 16px; 
      width: 100%; 
      max-width: 600px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      animation: slideUp 0.3s ease-out;
      overflow: hidden;
    }
    .modal-header {
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #f3f4f6;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f9fafb;
    }
    .modal-header h2 { margin: 0; font-size: 1.125rem; font-weight: 600; color: #111827; }
    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #6b7280;
      cursor: pointer;
      padding: 0.2rem;
      line-height: 1;
      border-radius: 4px;
    }
    .btn-close:hover { background: #e5e7eb; color: #111827; }

    .modal-body { padding: 2rem; }
    
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    
    .form-group { margin-bottom: 0; }
    .form-group.full-width { grid-column: span 2; }
    
    .form-group label { 
      display: block; 
      margin-bottom: 0.5rem; 
      font-weight: 500; 
      color: #374151; 
      font-size: 0.875rem;
    }
    .required { color: #ef4444; }
    
    .form-control { 
      width: 100%; 
      padding: 0.625rem 0.875rem; 
      border: 1px solid #d1d5db; 
      border-radius: 8px; 
      font-size: 0.875rem;
      color: #111827;
      transition: all 0.2s;
    }
    .form-control:focus { 
      outline: none; 
      border-color: #6366f1; 
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); 
    }
    .form-control.invalid { border-color: #ef4444; }
    .form-control.invalid:focus { box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1); }
    
    .error-msg {
      color: #ef4444;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }

    /* Checkbox Styling */
    .checkbox-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      user-select: none;
    }
    .checkbox-label input { display: none; }
    .checkbox-custom {
      width: 20px;
      height: 20px;
      border: 2px solid #d1d5db;
      border-radius: 6px;
      margin-right: 0.75rem;
      position: relative;
      transition: all 0.2s;
    }
    .checkbox-label input:checked + .checkbox-custom {
      background: #4f46e5;
      border-color: #4f46e5;
    }
    .checkbox-label input:checked + .checkbox-custom::after {
      content: '';
      position: absolute;
      left: 6px;
      top: 2px;
      width: 5px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
    .label-text { color: #374151; font-size: 0.875rem; }

    .modal-footer {
      padding: 1.5rem 2rem;
      border-top: 1px solid #f3f4f6;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      background: #f9fafb;
    }

    .spinner-small {
      display: inline-block;
      width: 12px;
      height: 12px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `]
})
export class ProductCrudComponent implements OnInit {
  private productService = inject(ProductService);
  private toastService = inject(ToastService);

  products = signal<Product[]>([]);
  loading = signal(false);
  saving = signal(false);
  showModal = signal(false);
  isEditing = signal(false);
  editingId: number | null = null;
  searchTerm = signal('');

  // Default initial categories, will be augmented by existing product categories
  availableCategories = signal<string[]>(['Électronique', 'Vêtements', 'Maison', 'Accessoires', 'Bureautique']);

  formData: any = { sku: '', name: '', category: '', originalPrice: 0, active: true };

  columns: TableColumn[] = [
    { key: 'sku', label: 'SKU' },
    { key: 'name', label: 'Nom' },
    { key: 'category', label: 'Catégorie' },
    { key: 'originalPrice', label: 'Prix', template: 'currency' },
    { key: 'active', label: 'Statut', template: 'boolean' },
    { key: 'actions', label: 'Actions', template: 'actions' }
  ];

  filteredProducts = signal<Product[]>([]);

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    this.productService.getAll().subscribe({
      next: (data: Product[]) => {
        this.products.set(data);
        this.updateFilteredProducts();
        this.updateAvailableCategories(data);
        this.loading.set(false);
      },
      error: () => {
        this.toastService.show('Erreur chargement produits', 'error');
        this.loading.set(false);
      }
    });
  }

  updateFilteredProducts() {
    const term = this.searchTerm().toLowerCase();
    const all = this.products();
    if (!term) {
      this.filteredProducts.set(all);
      return;
    }
    this.filteredProducts.set(all.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term)
    ));
  }

  updateAvailableCategories(products: Product[]) {
    const categories = new Set(this.availableCategories());
    products.forEach(p => {
      if (p.category) categories.add(p.category);
    });
    this.availableCategories.set(Array.from(categories).sort());
  }

  onSearch(term: string) {
    this.searchTerm.set(term);
    this.updateFilteredProducts();
  }

  openCreateModal() {
    this.formData = { sku: '', name: '', category: '', originalPrice: null, active: true };
    this.isEditing.set(false);
    this.showModal.set(true);
  }

  onAction(event: any) {
    if (event.action === 'edit') {
      this.isEditing.set(true);
      this.editingId = event.row.id;
      this.formData = { ...event.row };
      this.showModal.set(true);
    } else if (event.action === 'toggle') {
      this.toggleStatus(event.row);
    }
  }

  toggleStatus(product: any) {
    const obs = product.active
      ? this.productService.deactivate(product.id)
      : this.productService.activate(product.id);

    obs.subscribe({
      next: () => {
        this.toastService.show(`Produit ${product.active ? 'désactivé' : 'activé'}`, 'success');
        this.loadProducts();
      },
      error: () => this.toastService.show('Erreur lors du changement de statut', 'error')
    });
  }

  save() {
    this.saving.set(true);
    const obs = this.isEditing()
      ? this.productService.update(this.editingId!, this.formData)
      : this.productService.create(this.formData);

    obs.subscribe({
      next: () => {
        this.toastService.show(
          this.isEditing() ? 'Produit mis à jour' : 'Produit créé',
          'success'
        );
        this.closeModal();
        this.loadProducts();
        this.saving.set(false);
      },
      error: () => {
        this.toastService.show('Erreur lors de la sauvegarde', 'error');
        this.saving.set(false);
      }
    });
  }

  closeModal() {
    this.showModal.set(false);
  }
}
