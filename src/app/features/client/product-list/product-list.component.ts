import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { SearchFiltersComponent, FilterField } from '../../../shared/components/search-filters/search-filters.component';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, DataTableComponent, SearchFiltersComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Catalogue Produits</h1>
      </div>

      <app-search-filters
        [fields]="filterFields"
        (filter)="onFilter($event)">
      </app-search-filters>

      <app-data-table
        [columns]="columns"
        [data]="products()"
        [totalElements]="totalElements()"
        [pageSize]="pageSize"
        (pageChange)="onPageChange($event)"
        (actionClick)="onAddToCart($event)">
      </app-data-table>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; }
    .page-header { margin-bottom: 2rem; }
  `]
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private toastService = inject(ToastService);

  // State
  products = signal<any[]>([]);
  totalElements = signal(0);
  pageSize = 10;
  currentPage = 0;
  currentSearch = '';

  // Configuration for your Data Table
  columns: TableColumn[] = [
    { key: 'sku', label: 'SKU', sortable: true },
    { key: 'name', label: 'Nom Produit', sortable: true },
    { key: 'category', label: 'Catégorie' },
    { key: 'finalPrice', label: 'Prix', format: (v) => `${v} €` },
    { key: 'active', label: 'Statut', template: 'badge' } // Assuming your table supports templates or simple rendering
  ];

  // Configuration for your Search Filters
  filterFields: FilterField[] = [
    { key: 'search', label: 'Rechercher', type: 'text', placeholder: 'Nom ou SKU...' }
  ];

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getAll(this.currentPage, this.pageSize, this.currentSearch)
      .subscribe({
        next: (response) => {
          this.products.set(response.content);
          this.totalElements.set(response.totalElements);
        },
        error: () => this.toastService.show('Erreur chargement produits', 'error') // Fix: Call show directly if public, or use a method wrapper
      });
  }

  onFilter(filters: any) {
    this.currentSearch = filters.search;
    this.currentPage = 0;
    this.loadProducts();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadProducts();
  }

  onAddToCart(product: any) {
    // Logic for Cart comes next
    console.log('Adding to cart:', product);
    // this.toastService.show('Produit ajouté au panier', 'success');
  }
}
