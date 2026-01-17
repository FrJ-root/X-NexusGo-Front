import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SalesOrdersApiService, CreateSalesOrderRequest, CreateSalesOrderLineRequest } from '../../../api/sales-orders-api.service';
import { ProductsApiService } from '../../../api/products-api.service';
import { ToastService } from '../../../shared/services/toast.service';
import { Product, SalesOrder } from '../../../shared/models';

@Component({
  selector: 'app-order-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Nouvelle commande</h1>
          <p class="subtitle">Créez votre commande en sélectionnant les produits</p>
        </div>
      </div>

      <div class="order-container">
        <div class="products-section">
          <div class="section-header">
            <h2>Catalogue</h2>
            <div class="search-box">
              <input 
                type="text" 
                placeholder="🔍 Rechercher un produit..."
                [(ngModel)]="searchTerm"
                (input)="filterProducts()"
              />
            </div>
          </div>
          <div class="products-grid">
            @for (product of filteredProducts(); track product.id) {
              <div class="product-card" (click)="addToCart(product)">
                <div class="product-icon">{{ product.name?.charAt(0) }}</div>
                <div class="product-info">
                  <span class="product-name">{{ product.name }}</span>
                  <span class="product-sku">{{ product.sku }}</span>
                </div>
                <span class="product-price">{{ product.unitPrice | number:'1.2-2' }} €</span>
                <button class="add-btn">➕</button>
              </div>
            }
            @if (filteredProducts().length === 0) {
              <p class="empty-text">Aucun produit trouvé</p>
            }
          </div>
        </div>

        <div class="cart-section">
          <div class="section-header">
            <h2>🛒 Panier</h2>
            <span class="item-count">{{ cartItems().length }} article(s)</span>
          </div>

          <form [formGroup]="orderForm" (ngSubmit)="onSubmit()">
            <div class="cart-items" formArrayName="lines">
              @for (item of lines.controls; track $index; let i = $index) {
                <div class="cart-item" [formGroupName]="i">
                  <div class="item-info">
                    <span class="item-name">{{ getProductName(item.get('productId')?.value) }}</span>
                    <span class="item-price">{{ getProductPrice(item.get('productId')?.value) | number:'1.2-2' }} € / unité</span>
                  </div>
                  <div class="item-controls">
                    <button type="button" class="qty-btn" (click)="decrementQty(i)">−</button>
                    <input type="number" formControlName="quantity" min="1" class="qty-input" />
                    <button type="button" class="qty-btn" (click)="incrementQty(i)">+</button>
                  </div>
                  <span class="item-total">
                    {{ (item.get('quantity')?.value || 0) * getProductPrice(item.get('productId')?.value) | number:'1.2-2' }} €
                  </span>
                  <button type="button" class="remove-btn" (click)="removeFromCart(i)">🗑️</button>
                </div>
              }
              @if (lines.length === 0) {
                <div class="empty-cart">
                  <span class="empty-icon">🛒</span>
                  <p>Votre panier est vide</p>
                  <small>Cliquez sur un produit pour l'ajouter</small>
                </div>
              }
            </div>

            @if (lines.length > 0) {
              <div class="cart-summary">
                <div class="summary-row">
                  <span>Sous-total</span>
                  <span>{{ calculateSubtotal() | number:'1.2-2' }} €</span>
                </div>
                <div class="summary-row total">
                  <span>Total</span>
                  <span>{{ calculateSubtotal() | number:'1.2-2' }} €</span>
                </div>
              </div>

              <div class="cart-actions">
                <button type="button" class="btn btn-secondary" (click)="clearCart()">
                  Vider le panier
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="orderForm.invalid || submitting()">
                  @if (submitting()) { <span class="spinner-sm"></span> }
                  Commander
                </button>
              </div>
            }
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 1400px; }
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.5rem; color: #111827; }
    .subtitle { margin: 0.25rem 0 0; color: #6b7280; font-size: 0.875rem; }

    .order-container { display: grid; grid-template-columns: 1fr 400px; gap: 1.5rem; }
    @media (max-width: 1024px) { .order-container { grid-template-columns: 1fr; } }

    .products-section, .cart-section { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #f3f4f6; }
    .section-header h2 { margin: 0; font-size: 1.125rem; color: #111827; }
    .item-count { font-size: 0.875rem; color: #6b7280; }

    .search-box input { padding: 0.5rem 1rem; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.875rem; width: 250px; }
    .search-box input:focus { outline: none; border-color: #3b82f6; }

    .products-grid { display: flex; flex-direction: column; gap: 0.5rem; max-height: 500px; overflow-y: auto; }
    .product-card { display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; border-radius: 8px; cursor: pointer; transition: background 0.2s; background: #f9fafb; }
    .product-card:hover { background: #f3f4f6; }
    .product-icon { width: 40px; height: 40px; border-radius: 8px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.125rem; }
    .product-info { flex: 1; display: flex; flex-direction: column; }
    .product-name { font-weight: 500; color: #111827; font-size: 0.875rem; }
    .product-sku { font-size: 0.75rem; color: #9ca3af; }
    .product-price { font-weight: 600; color: #111827; font-size: 0.875rem; }
    .add-btn { background: #3b82f6; color: white; border: none; border-radius: 6px; padding: 0.375rem 0.625rem; cursor: pointer; font-size: 0.875rem; }
    .add-btn:hover { background: #2563eb; }

    .cart-items { min-height: 200px; }
    .cart-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border-radius: 8px; background: #f9fafb; margin-bottom: 0.5rem; }
    .item-info { flex: 1; display: flex; flex-direction: column; }
    .item-name { font-weight: 500; color: #111827; font-size: 0.875rem; }
    .item-price { font-size: 0.75rem; color: #6b7280; }
    .item-controls { display: flex; align-items: center; gap: 0.25rem; }
    .qty-btn { width: 28px; height: 28px; border: 1px solid #e5e7eb; background: white; border-radius: 6px; cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center; }
    .qty-btn:hover { background: #f3f4f6; }
    .qty-input { width: 50px; height: 28px; text-align: center; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 0.875rem; }
    .item-total { font-weight: 600; color: #111827; min-width: 80px; text-align: right; }
    .remove-btn { background: none; border: none; cursor: pointer; font-size: 1rem; padding: 0.25rem; }
    .remove-btn:hover { opacity: 0.7; }

    .empty-cart { text-align: center; padding: 3rem 1rem; color: #9ca3af; }
    .empty-icon { font-size: 3rem; display: block; margin-bottom: 0.5rem; }
    .empty-cart p { margin: 0; font-weight: 500; }
    .empty-cart small { display: block; margin-top: 0.25rem; }

    .cart-summary { padding: 1rem 0; border-top: 1px solid #f3f4f6; margin-top: 1rem; }
    .summary-row { display: flex; justify-content: space-between; padding: 0.375rem 0; font-size: 0.875rem; color: #6b7280; }
    .summary-row.total { font-size: 1.125rem; font-weight: 700; color: #111827; padding-top: 0.75rem; border-top: 1px solid #e5e7eb; margin-top: 0.5rem; }

    .cart-actions { display: flex; gap: 0.75rem; margin-top: 1rem; }
    .btn { flex: 1; padding: 0.75rem 1rem; border-radius: 8px; font-weight: 500; font-size: 0.875rem; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-primary:hover:not(:disabled) { background: #2563eb; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { background: #f3f4f6; color: #374151; }

    .empty-text { text-align: center; color: #9ca3af; padding: 2rem; }

    .spinner-sm { width: 16px; height: 16px; border: 2px solid rgba(255, 255, 255, 0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class OrderCreateComponent implements OnInit {
  private productsApi = inject(ProductsApiService);
  private ordersApi = inject(SalesOrdersApiService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  products = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);
  searchTerm = '';
  submitting = signal(false);

  orderForm = this.fb.group({
    lines: this.fb.array([])
  });

  get lines(): FormArray {
    return this.orderForm.get('lines') as FormArray;
  }

  cartItems = signal<{ productId: number; quantity: number }[]>([]);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productsApi.getActiveProducts({ size: 100 }).subscribe(page => {
      this.products.set(page.content);
      this.filteredProducts.set(page.content);
    });
  }

  filterProducts(): void {
    const term = this.searchTerm.toLowerCase();
    if (!term) {
      this.filteredProducts.set(this.products());
    } else {
      this.filteredProducts.set(
        this.products().filter(p => 
          p.name?.toLowerCase().includes(term) || 
          p.sku?.toLowerCase().includes(term)
        )
      );
    }
  }

  addToCart(product: Product): void {
    const existingIndex = this.lines.controls.findIndex(
      c => c.get('productId')?.value === product.id
    );

    if (existingIndex >= 0) {
      const control = this.lines.at(existingIndex);
      const currentQty = control.get('quantity')?.value || 0;
      control.patchValue({ quantity: currentQty + 1 });
    } else {
      this.lines.push(this.fb.group({
        productId: [product.id, Validators.required],
        quantity: [1, [Validators.required, Validators.min(1)]]
      }));
    }
    this.updateCartItems();
  }

  removeFromCart(index: number): void {
    this.lines.removeAt(index);
    this.updateCartItems();
  }

  incrementQty(index: number): void {
    const control = this.lines.at(index);
    const currentQty = control.get('quantity')?.value || 0;
    control.patchValue({ quantity: currentQty + 1 });
  }

  decrementQty(index: number): void {
    const control = this.lines.at(index);
    const currentQty = control.get('quantity')?.value || 0;
    if (currentQty > 1) {
      control.patchValue({ quantity: currentQty - 1 });
    }
  }

  clearCart(): void {
    this.lines.clear();
    this.updateCartItems();
  }

  private updateCartItems(): void {
    this.cartItems.set(
      this.lines.controls.map(c => ({
        productId: c.get('productId')?.value,
        quantity: c.get('quantity')?.value
      }))
    );
  }

  getProductName(productId: number): string {
    return this.products().find(p => p.id === productId)?.name || '';
  }

  getProductPrice(productId: number): number {
    return this.products().find(p => p.id === productId)?.unitPrice || 0;
  }

  calculateSubtotal(): number {
    return this.lines.controls.reduce((sum, c) => {
      const qty = c.get('quantity')?.value || 0;
      const price = this.getProductPrice(c.get('productId')?.value);
      return sum + (qty * price);
    }, 0);
  }

  onSubmit(): void {
    if (this.orderForm.invalid || this.lines.length === 0) return;
    this.submitting.set(true);

    const lines: CreateSalesOrderLineRequest[] = this.lines.controls.map(c => ({
      productId: c.get('productId')?.value,
      quantity: c.get('quantity')?.value
    }));

    const request: CreateSalesOrderRequest = { lines };

    this.ordersApi.create(request).subscribe({
      next: (order: SalesOrder) => {
        this.toast.success(`Commande #${order.id} créée avec succès`);
        this.router.navigate(['/client/orders'], { queryParams: { orderId: order.id } });
        this.submitting.set(false);
      },
      error: () => this.submitting.set(false)
    });
  }
}
