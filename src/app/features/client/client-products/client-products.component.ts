import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductsApiService } from '../../../api/products-api.service';
import { InventoryApiService } from '../../../api/inventory-api.service';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { SearchFiltersComponent, FilterField } from '../../../shared/components/search-filters/search-filters.component';
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
  `]
})
export class ClientProductsComponent implements OnInit {
  private productsApi = inject(ProductsApiService);
  private inventoryApi = inject(InventoryApiService);

  products = signal<ProductWithStock[]>([]);
  loading = signal(false);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);
  pageSize = signal(12);
  filterValues = signal<Record<string, any>>({});

  filterFields: FilterField[] = [
    { key: 'name', label: 'Rechercher', type: 'text', placeholder: 'Nom du produit...' },
    { key: 'category', label: 'Catégorie', type: 'text', placeholder: 'Catégorie...' }
  ];

  ngOnInit(): void {
    this.loadProducts();
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
