import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../shared/services/toast.service';
import { CartService } from '../../../shared/services/cart.service';
import { Product } from '../../../shared/models/business.models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  cartService = inject(CartService); // Public so template can access cartCount()
  private toastService = inject(ToastService);

  // State signals
  products = signal<any[]>([]);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);
  pageSize = 12;
  loading = signal(false);

  // Filters
  searchTerm = signal('');
  selectedCategory = signal('');

  // Categories computed from products
  categories = computed(() => {
    const cats = new Set(this.products().map(p => p.category).filter(Boolean));
    return Array.from(cats).sort();
  });

  // Filtered products
  filteredProducts = computed(() => {
    let filtered = this.products();

    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(search) ||
        p.sku?.toLowerCase().includes(search)
      );
    }

    const category = this.selectedCategory();
    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }

    return filtered;
  });

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts(page: number = 0) {
    this.loading.set(true);
    this.currentPage.set(page);

    this.productService.getAll(page, this.pageSize, this.searchTerm()).subscribe({
      next: (response: any) => {
        // Handle both plain array and Page object responses
        if (Array.isArray(response)) {
          // Plain array response
          this.products.set(response);
          this.totalElements.set(response.length);
          this.totalPages.set(1);
        } else {
          // Page object response
          this.products.set(response.content || []);
          this.totalElements.set(response.totalElements || 0);
          this.totalPages.set(response.totalPages || 0);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.toastService.show('Erreur lors du chargement des produits', 'error');
        this.loading.set(false);
      }
    });
  }

  onSearchChange(term: string) {
    this.searchTerm.set(term);
  }

  onCategoryChange(category: string) {
    this.selectedCategory.set(category);
  }

  clearFilters() {
    this.searchTerm.set('');
    this.selectedCategory.set('');
  }

  addToCart(product: any, quantity: number = 1) {
    if (!product.active) {
      this.toastService.show('Ce produit n\'est pas disponible', 'warning');
      return;
    }

    this.cartService.addToCart(product, quantity);
    this.toastService.show(`${product.name} ajouté au panier`, 'success');
  }

  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.loadProducts(this.currentPage() + 1);
    }
  }

  previousPage() {
    if (this.currentPage() > 0) {
      this.loadProducts(this.currentPage() - 1);
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages()) {
      this.loadProducts(page);
    }
  }
}
