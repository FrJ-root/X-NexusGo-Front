import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductsApiService, ProductSearchResult } from '../../../api/products-api.service';
import { InventoryApiService } from '../../../api/inventory-api.service';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { SearchFiltersComponent, FilterField } from '../../../shared/components/search-filters/search-filters.component';
import { ToastService } from '../../../shared/services/toast.service';
import { Product, Inventory, Page } from '../../../shared/models';

interface ProductWithStock extends Product {
  totalStock?: number;
  availability?: string;
}

@Component({
  selector: 'app-client-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DataTableComponent,
    SearchFiltersComponent
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Catalogue produits</h1>
          <p class="subtitle">Découvrez notre gamme de produits</p>
        </div>
        <a routerLink="/client/orders/create" class="btn btn-primary">
          🛒 Passer commande
        </a>
      </div>

      <!-- SKU Search Box -->
      <div class="sku-search-card">
        <h3>🔍 Recherche rapide par SKU</h3>
        <p class="search-desc">Entrez le code SKU pour vérifier la disponibilité d'un produit</p>
        <div class="sku-search-form">
          <input 
            type="text" 
            [(ngModel)]="skuSearchTerm"
            placeholder="Entrez le SKU (ex: PROD-001)"
            class="sku-input"
            (keyup.enter)="searchBySku()"
          />
          <button class="btn btn-primary" (click)="searchBySku()" [disabled]="!skuSearchTerm || skuSearching()">
            @if (skuSearching()) {
              <span class="spinner-sm"></span>
            } @else {
              Rechercher
            }
          </button>
        </div>
        
        @if (skuSearchResult()) {
          <div class="sku-result" [class.unavailable]="!skuSearchResult()!.active">
            <div class="result-header">
              <span class="result-sku">{{ skuSearchResult()!.sku }}</span>
              <span class="availability-badge" [class]="skuSearchResult()!.active ? 'available' : 'unavailable'">
                {{ skuSearchResult()!.availability }}
              </span>
            </div>
            <div class="result-details">
              <div class="detail-item">
                <span class="label">Nom</span>
                <span class="value">{{ skuSearchResult()!.name }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Catégorie</span>
                <span class="value">{{ skuSearchResult()!.category }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Statut</span>
                <span class="value">{{ skuSearchResult()!.active ? 'Actif' : 'Inactif' }}</span>
              </div>
            </div>
            @if (!skuSearchResult()!.active) {
              <div class="unavailable-notice">
                <span class="notice-icon">⚠️</span>
                <span>Ce produit est actuellement indisponible à la vente</span>
              </div>
            }
          </div>
        }
        
        @if (skuSearchError()) {
          <div class="sku-error">
            <span class="error-icon">❌</span>
            <span>{{ skuSearchError() }}</span>
          </div>
        }
      </div>

      <app-search-filters
        [fields]="filterFields"
        [values]="filterValues()"
        (valuesChange)="filterValues.set($event)"
        (search)="onSearch($event)"
        (reset)="onReset()"
      />

      <div class="products-grid">
        @for (product of products(); track product.id) {
          <div class="product-card">
            <div class="product-image">
              {{ product.name?.charAt(0) || 'P' }}
            </div>
            <div class="product-content">
              <span class="product-sku">{{ product.sku }}</span>
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-description">{{ product.description || 'Aucune description' }}</p>
              <div class="product-footer">
                <span class="product-price">{{ product.unitPrice | number:'1.2-2' }} €</span>
                <span class="availability" [class]="getAvailabilityClass(product)">
                  {{ getAvailabilityLabel(product) }}
                </span>
              </div>
            </div>
          </div>
        }
        @if (products().length === 0 && !loading()) {
          <div class="empty-state">
            <p>Aucun produit trouvé</p>
          </div>
        }
      </div>

      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Chargement...</p>
        </div>
      }

      @if (totalPages() > 1) {
        <div class="pagination">
          <button 
            class="btn btn-secondary" 
            [disabled]="currentPage() === 0"
            (click)="onPageChange(currentPage() - 1)"
          >
            ← Précédent
          </button>
          <span class="page-info">
            Page {{ currentPage() + 1 }} sur {{ totalPages() }}
          </span>
          <button 
            class="btn btn-secondary" 
            [disabled]="currentPage() >= totalPages() - 1"
            (click)="onPageChange(currentPage() + 1)"
          >
            Suivant →
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1200px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.5rem; color: #111827; }
    .subtitle { margin: 0.25rem 0 0; color: #6b7280; font-size: 0.875rem; }

    .btn { padding: 0.625rem 1.25rem; border-radius: 8px; font-weight: 500; font-size: 0.875rem; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none; }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-primary:hover { background: #2563eb; }
    .btn-secondary { background: #f3f4f6; color: #374151; }
    .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; margin-top: 1.5rem; }

    .product-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: all 0.2s; }
    .product-card:hover { transform: translateY(-4px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }

    .product-image { height: 120px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); display: flex; align-items: center; justify-content: center; font-size: 3rem; color: white; font-weight: 700; }

    .product-content { padding: 1.25rem; }
    .product-sku { font-size: 0.75rem; color: #9ca3af; text-transform: uppercase; }
    .product-name { margin: 0.5rem 0; font-size: 1rem; font-weight: 600; color: #111827; }
    .product-description { font-size: 0.875rem; color: #6b7280; margin: 0.5rem 0 1rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

    .product-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid #f3f4f6; }
    .product-price { font-size: 1.25rem; font-weight: 700; color: #111827; }
    
    .availability { font-size: 0.75rem; padding: 0.25rem 0.75rem; border-radius: 9999px; font-weight: 500; }
    .availability.in-stock { background: #d1fae5; color: #047857; }
    .availability.low-stock { background: #fef3c7; color: #b45309; }
    .availability.out-of-stock { background: #fee2e2; color: #b91c1c; }

    .empty-state { grid-column: 1 / -1; text-align: center; padding: 3rem; color: #6b7280; }

    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 3rem; gap: 1rem; }
    .spinner { width: 40px; height: 40px; border: 3px solid #e5e7eb; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 2rem; }
    .page-info { color: #6b7280; font-size: 0.875rem; }

    /* SKU Search Card */
    .sku-search-card { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; border: 1px solid #bae6fd; }
    .sku-search-card h3 { margin: 0 0 0.5rem; font-size: 1rem; color: #0369a1; }
    .search-desc { margin: 0 0 1rem; font-size: 0.875rem; color: #0284c7; }
    .sku-search-form { display: flex; gap: 0.75rem; }
    .sku-input { flex: 1; max-width: 300px; padding: 0.75rem 1rem; border: 2px solid #7dd3fc; border-radius: 8px; font-size: 1rem; background: white; transition: border-color 0.2s; }
    .sku-input:focus { outline: none; border-color: #0284c7; }
    .sku-input::placeholder { color: #94a3b8; }

    .sku-result { margin-top: 1rem; background: white; border-radius: 8px; padding: 1rem; border: 1px solid #e2e8f0; }
    .sku-result.unavailable { border-color: #fecaca; background: #fef2f2; }
    .result-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid #f1f5f9; }
    .result-sku { font-size: 1.125rem; font-weight: 700; color: #1e293b; font-family: monospace; }
    .availability-badge { padding: 0.375rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
    .availability-badge.available { background: #d1fae5; color: #047857; }
    .availability-badge.unavailable { background: #fee2e2; color: #b91c1c; }
    .result-details { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .detail-item { display: flex; flex-direction: column; }
    .detail-item .label { font-size: 0.75rem; color: #6b7280; text-transform: uppercase; margin-bottom: 0.25rem; }
    .detail-item .value { font-weight: 500; color: #1e293b; }
    .unavailable-notice { display: flex; align-items: center; gap: 0.5rem; margin-top: 1rem; padding: 0.75rem; background: #fef3c7; border-radius: 6px; color: #b45309; font-size: 0.875rem; }
    .notice-icon { font-size: 1rem; }

    .sku-error { margin-top: 1rem; display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #b91c1c; font-size: 0.875rem; }
    .error-icon { font-size: 1rem; }

    .spinner-sm { width: 16px; height: 16px; border: 2px solid rgba(255, 255, 255, 0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; }
  `]
})
export class ClientProductsComponent implements OnInit {
  private productsApi = inject(ProductsApiService);
  private inventoryApi = inject(InventoryApiService);
  private toast = inject(ToastService);

  products = signal<ProductWithStock[]>([]);
  loading = signal(false);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);
  pageSize = signal(12);
  filterValues = signal<Record<string, any>>({});

  // SKU Search
  skuSearchTerm = '';
  skuSearching = signal(false);
  skuSearchResult = signal<ProductSearchResult | null>(null);
  skuSearchError = signal<string | null>(null);

  filterFields: FilterField[] = [
    { key: 'name', label: 'Rechercher', type: 'text', placeholder: 'Nom du produit...' },
    { key: 'category', label: 'Catégorie', type: 'text', placeholder: 'Catégorie...' }
  ];

  ngOnInit(): void {
    this.loadProducts();
  }

  searchBySku(): void {
    if (!this.skuSearchTerm.trim()) return;
    
    this.skuSearching.set(true);
    this.skuSearchResult.set(null);
    this.skuSearchError.set(null);

    this.productsApi.getBySku(this.skuSearchTerm.trim()).subscribe({
      next: (result) => {
        this.skuSearchResult.set(result);
        this.skuSearching.set(false);
        if (!result.active) {
          this.toast.warning('Ce produit est indisponible à la vente');
        } else {
          this.toast.success('Produit trouvé et disponible');
        }
      },
      error: (err) => {
        this.skuSearching.set(false);
        if (err.status === 404) {
          this.skuSearchError.set('Produit non trouvé avec ce SKU');
        } else {
          this.skuSearchError.set('Erreur lors de la recherche');
        }
        this.toast.error('Produit non trouvé');
      }
    });
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productsApi.getActiveProducts({ page: this.currentPage(), size: this.pageSize(), ...this.filterValues() }).subscribe({
      next: (page: Page<Product>) => {
        this.products.set(page.content.map((p: Product) => ({ ...p, totalStock: 0, availability: 'checking' })));
        this.totalElements.set(page.totalElements);
        this.totalPages.set(page.totalPages);
        this.loadStockInfo(page.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadStockInfo(products: Product[]): void {
    products.forEach(product => {
      this.inventoryApi.getByProduct(product.id!).subscribe({
        next: (inventories: Inventory[]) => {
          const totalStock = inventories.reduce((sum: number, inv: Inventory) => sum + (inv.available || 0), 0);
          const updated = this.products().map((p: ProductWithStock) => 
            p.id === product.id ? { ...p, totalStock } : p
          );
          this.products.set(updated);
        }
      });
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

  getAvailabilityClass(product: ProductWithStock): string {
    const stock = product.totalStock || 0;
    if (stock === 0) return 'out-of-stock';
    if (stock <= 10) return 'low-stock';
    return 'in-stock';
  }

  getAvailabilityLabel(product: ProductWithStock): string {
    const stock = product.totalStock || 0;
    if (stock === 0) return 'Rupture';
    if (stock <= 10) return 'Stock limité';
    return 'En stock';
  }
}
