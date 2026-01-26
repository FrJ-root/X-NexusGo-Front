import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductsApiService, ProductSearchResult } from '../../../api/products-api.service';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { SearchFiltersComponent, FilterField } from '../../../shared/components/search-filters/search-filters.component';
import { ToastService } from '../../../shared/services/toast.service';
import { Product, Page } from '../../../shared/models';

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
    :host {
      --primary: #0f172a;
      --primary-dark: #020617;
      --primary-light: #1e293b;
      --primary-gradient: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);
      --secondary: #f97316;
      --secondary-light: #fb923c;
      --secondary-dark: #ea580c;
      --accent: #6366f1;
      --accent-light: #818cf8;
      --success: #059669;
      --success-light: #d1fae5;
      --success-dark: #047857;
      --warning: #d97706;
      --warning-light: #fef3c7;
      --danger: #dc2626;
      --danger-light: #fee2e2;
      --info: #0284c7;
      --info-light: #e0f2fe;
      --gray-900: #0f172a;
      --gray-800: #1e293b;
      --gray-700: #334155;
      --gray-600: #475569;
      --gray-500: #64748b;
      --gray-400: #94a3b8;
      --gray-300: #cbd5e1;
      --gray-200: #e2e8f0;
      --gray-100: #f1f5f9;
      --gray-50: #f8fafc;
      --white: #ffffff;
      --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
      --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
      --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
      --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      --radius-xl: 24px;
      --radius-lg: 16px;
      --radius: 12px;
      --radius-sm: 8px;
      display: block;
      background: linear-gradient(180deg, var(--gray-50) 0%, var(--gray-100) 100%);
      min-height: 100%;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeInScale {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    .page { 
      max-width: 1400px; 
      margin: 0 auto;
      padding: 0 1.5rem 2rem;
      animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    }

    /* Page Header - Hero Style */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--primary-gradient);
      border-radius: var(--radius-xl);
      padding: 2rem 2.5rem;
      margin-bottom: 2rem;
      color: var(--white);
      position: relative;
      overflow: hidden;
      box-shadow: var(--shadow-lg), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }

    .page-header::before {
      content: '';
      position: absolute;
      top: -100%;
      right: -20%;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, transparent 70%);
      border-radius: 50%;
      animation: pulse 4s ease-in-out infinite;
    }

    .page-header h1 { 
      margin: 0; 
      font-size: 2rem; 
      font-weight: 800;
      letter-spacing: -0.5px;
      background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.9) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .subtitle { 
      margin: 0.5rem 0 0; 
      opacity: 0.8; 
      font-size: 1rem;
      font-weight: 450;
    }

    .btn { 
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.625rem;
      padding: 0.875rem 1.75rem;
      font-size: 0.9375rem;
      font-weight: 600;
      border-radius: var(--radius);
      text-decoration: none;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      border: none;
      letter-spacing: 0.2px;
      position: relative;
      overflow: hidden;
    }

    .btn::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transform: translateX(-100%);
      transition: transform 0.5s ease;
    }

    .btn:hover::before {
      transform: translateX(100%);
    }

    .btn-primary { 
      background: linear-gradient(135deg, var(--secondary), var(--secondary-light));
      color: var(--white);
      box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);
    }

    .btn-primary:hover { 
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(249, 115, 22, 0.5);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .btn-secondary { 
      background: var(--white);
      color: var(--gray-700);
      border: 1px solid var(--gray-200);
    }

    .btn-secondary:hover {
      background: var(--gray-50);
      border-color: var(--gray-300);
    }

    .btn-secondary:disabled { 
      opacity: 0.5; 
      cursor: not-allowed; 
    }

    /* SKU Search Card - Premium Design */
    .sku-search-card {
      background: linear-gradient(135deg, var(--white), var(--gray-50));
      border-radius: var(--radius-lg);
      padding: 2rem;
      margin-bottom: 2rem;
      border: 1px solid var(--gray-200);
      box-shadow: var(--shadow-sm);
      position: relative;
      overflow: hidden;
      animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
    }

    .sku-search-card::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, rgba(2, 132, 199, 0.08) 0%, transparent 70%);
      border-radius: 50%;
    }

    .sku-search-card h3 { 
      margin: 0 0 0.5rem; 
      font-size: 1.125rem; 
      font-weight: 700;
      color: var(--gray-900);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .search-desc { 
      margin: 0 0 1.25rem; 
      font-size: 0.9375rem; 
      color: var(--gray-500);
      font-weight: 450;
    }

    .sku-search-form { 
      display: flex; 
      gap: 1rem;
      position: relative;
      z-index: 1;
    }

    .sku-input { 
      flex: 1; 
      max-width: 350px; 
      padding: 0.875rem 1.25rem; 
      border: 2px solid var(--gray-200); 
      border-radius: var(--radius); 
      font-size: 1rem; 
      background: var(--white); 
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .sku-input:focus { 
      outline: none; 
      border-color: var(--info);
      box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.1);
    }

    .sku-input::placeholder { 
      color: var(--gray-400);
      font-weight: 400;
    }

    .sku-result { 
      margin-top: 1.5rem; 
      background: var(--white); 
      border-radius: var(--radius); 
      padding: 1.5rem; 
      border: 1px solid var(--gray-200);
      animation: fadeInScale 0.3s ease;
      box-shadow: var(--shadow-sm);
    }

    .sku-result.unavailable { 
      border-color: var(--danger-light); 
      background: linear-gradient(135deg, #fef2f2, var(--white));
    }

    .result-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 1.25rem; 
      padding-bottom: 1rem; 
      border-bottom: 1px solid var(--gray-100);
    }

    .result-sku { 
      font-size: 1.25rem; 
      font-weight: 800; 
      color: var(--gray-900); 
      font-family: 'SF Mono', Monaco, monospace;
      letter-spacing: 0.5px;
    }

    .availability-badge { 
      padding: 0.5rem 1rem; 
      border-radius: 50px; 
      font-size: 0.8125rem; 
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .availability-badge.available { 
      background: linear-gradient(135deg, var(--success-light), rgba(209, 250, 229, 0.5)); 
      color: var(--success-dark);
    }

    .availability-badge.unavailable { 
      background: linear-gradient(135deg, var(--danger-light), rgba(254, 226, 226, 0.5)); 
      color: var(--danger);
    }

    .result-details { 
      display: grid; 
      grid-template-columns: repeat(3, 1fr); 
      gap: 1.5rem;
    }

    .detail-item { 
      display: flex; 
      flex-direction: column;
    }

    .detail-item .label { 
      font-size: 0.75rem; 
      color: var(--gray-500); 
      text-transform: uppercase; 
      margin-bottom: 0.375rem;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .detail-item .value { 
      font-weight: 600; 
      color: var(--gray-900);
      font-size: 0.9375rem;
    }

    .unavailable-notice { 
      display: flex; 
      align-items: center; 
      gap: 0.75rem; 
      margin-top: 1.25rem; 
      padding: 1rem; 
      background: linear-gradient(135deg, var(--warning-light), rgba(254, 243, 199, 0.5)); 
      border-radius: var(--radius-sm); 
      color: var(--warning);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .notice-icon { font-size: 1.25rem; }

    .sku-error { 
      margin-top: 1.5rem; 
      display: flex; 
      align-items: center; 
      gap: 0.75rem; 
      padding: 1rem 1.25rem; 
      background: linear-gradient(135deg, #fef2f2, var(--white)); 
      border: 1px solid var(--danger-light); 
      border-radius: var(--radius); 
      color: var(--danger); 
      font-size: 0.9375rem;
      font-weight: 500;
      animation: fadeInScale 0.3s ease;
    }

    .error-icon { font-size: 1.25rem; }

    .spinner-sm { 
      width: 18px; 
      height: 18px; 
      border: 2px solid rgba(255, 255, 255, 0.3); 
      border-top-color: white; 
      border-radius: 50%; 
      animation: spin 0.6s linear infinite; 
      display: inline-block;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* Products Grid - Modern Cards */
    .products-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
      gap: 1.5rem; 
      margin-top: 2rem;
    }

    .product-card { 
      background: var(--white); 
      border-radius: var(--radius-lg); 
      overflow: hidden; 
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-100);
      transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      animation: fadeInUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    .product-card:nth-child(1) { animation-delay: 0.05s; }
    .product-card:nth-child(2) { animation-delay: 0.1s; }
    .product-card:nth-child(3) { animation-delay: 0.15s; }
    .product-card:nth-child(4) { animation-delay: 0.2s; }
    .product-card:nth-child(5) { animation-delay: 0.25s; }
    .product-card:nth-child(6) { animation-delay: 0.3s; }

    .product-card:hover { 
      transform: translateY(-8px); 
      box-shadow: var(--shadow-lg);
      border-color: transparent;
    }

    .product-image { 
      height: 140px; 
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 50%, var(--secondary) 100%);
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-size: 3.5rem; 
      color: var(--white); 
      font-weight: 800;
      position: relative;
      overflow: hidden;
    }

    .product-image::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 60%);
    }

    .product-content { 
      padding: 1.5rem;
    }

    .product-sku { 
      font-size: 0.75rem; 
      color: var(--gray-400); 
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
      font-family: 'SF Mono', Monaco, monospace;
    }

    .product-name { 
      margin: 0.5rem 0; 
      font-size: 1.0625rem; 
      font-weight: 700; 
      color: var(--gray-900);
      letter-spacing: -0.2px;
    }

    .product-description { 
      font-size: 0.875rem; 
      color: var(--gray-500); 
      margin: 0.5rem 0 1.25rem; 
      line-height: 1.6; 
      display: -webkit-box; 
      -webkit-line-clamp: 2; 
      -webkit-box-orient: vertical; 
      overflow: hidden;
    }

    .product-footer { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      padding-top: 1.25rem; 
      border-top: 1px solid var(--gray-100);
    }

    .product-price { 
      font-size: 1.375rem; 
      font-weight: 800; 
      color: var(--gray-900);
      letter-spacing: -0.5px;
    }
    
    .availability { 
      font-size: 0.75rem; 
      padding: 0.375rem 0.875rem; 
      border-radius: 50px; 
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .availability.in-stock { 
      background: linear-gradient(135deg, var(--success-light), rgba(209, 250, 229, 0.5)); 
      color: var(--success-dark);
    }

    .availability.low-stock { 
      background: linear-gradient(135deg, var(--warning-light), rgba(254, 243, 199, 0.5)); 
      color: var(--warning);
    }

    .availability.out-of-stock { 
      background: linear-gradient(135deg, var(--danger-light), rgba(254, 226, 226, 0.5)); 
      color: var(--danger);
    }

    /* Empty State */
    .empty-state { 
      grid-column: 1 / -1; 
      text-align: center; 
      padding: 4rem 2rem;
      background: var(--white);
      border-radius: var(--radius-lg);
      border: 2px dashed var(--gray-200);
    }

    .empty-state p {
      color: var(--gray-500);
      font-size: 1rem;
      font-weight: 500;
    }

    /* Loading State */
    .loading-state { 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      padding: 4rem; 
      gap: 1.25rem;
    }

    .spinner { 
      width: 48px; 
      height: 48px; 
      border: 4px solid var(--gray-200); 
      border-top-color: var(--secondary); 
      border-radius: 50%; 
      animation: spin 0.8s linear infinite;
    }

    .loading-state p {
      color: var(--gray-500);
      font-weight: 500;
    }

    /* Pagination */
    .pagination { 
      display: flex; 
      justify-content: center; 
      align-items: center; 
      gap: 1.5rem; 
      margin-top: 2.5rem;
      padding: 1.5rem;
      background: var(--white);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }

    .page-info { 
      color: var(--gray-600); 
      font-size: 0.9375rem;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        text-align: center;
        gap: 1.5rem;
      }
      
      .sku-search-form {
        flex-direction: column;
      }
      
      .sku-input {
        max-width: 100%;
      }
      
      .result-details {
        grid-template-columns: 1fr;
      }
      
      .products-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ClientProductsComponent implements OnInit {
  private readonly productsApi = inject(ProductsApiService);
  private readonly toast = inject(ToastService);

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
        // Set products as available by default (active products are available)
        // Note: Clients don't have access to inventory API, so we show all active products as "En stock"
        this.products.set(page.content.map((p: Product) => ({ ...p, totalStock: 100, availability: 'available' })));
        this.totalElements.set(page.totalElements);
        this.totalPages.set(page.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.loading.set(false);
        this.toast.error('Erreur lors du chargement des produits');
      }
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
