import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
    ReactiveFormsModule,
    RouterLink
  ],
  template: `
    <div class="page">
      <!-- Hero Header -->
      <div class="page-header-hero">
        <a routerLink="/client/orders" class="back-btn">
          ← Retour aux commandes
        </a>
        <div class="header-content">
          <div class="header-icon">✨</div>
          <div class="header-text">
            <h1>Nouvelle Commande</h1>
            <p class="subtitle">Sélectionnez vos produits et passez votre commande</p>
          </div>
        </div>
      </div>

      <!-- Steps Progress -->
      <div class="steps-container">
        <div class="step completed">
          <div class="step-marker">1</div>
          <span class="step-label">Sélection</span>
        </div>
        <div class="step-line" [class.active]="lines.length > 0"></div>
        <div class="step" [class.active]="lines.length > 0">
          <div class="step-marker">2</div>
          <span class="step-label">Panier</span>
        </div>
        <div class="step-line"></div>
        <div class="step">
          <div class="step-marker">3</div>
          <span class="step-label">Confirmation</span>
        </div>
      </div>

      <div class="order-container">
        <!-- Products Section -->
        <div class="products-section">
          <div class="section-header">
            <div class="section-title-row">
              <div class="section-icon">📦</div>
              <div>
                <h2>Catalogue Produits</h2>
                <span class="product-count">{{ filteredProducts().length }} produit(s) disponible(s)</span>
              </div>
            </div>
            <div class="search-box">
              <span class="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Rechercher par nom ou SKU..."
                [(ngModel)]="searchTerm"
                (input)="filterProducts()"
              />
              @if (searchTerm) {
                <button class="clear-search" (click)="searchTerm = ''; filterProducts()">×</button>
              }
            </div>
          </div>

          <div class="products-grid">
            @for (product of filteredProducts(); track product.id) {
              <div class="product-card" (click)="addToCart(product)" [class.in-cart]="isInCart(product.id!)">
                <div class="product-badge" *ngIf="isInCart(product.id!)">
                  <span>{{ getCartQuantity(product.id!) }} dans le panier</span>
                </div>
                <div class="product-icon-container">
                  <div class="product-icon">{{ product.name?.charAt(0)?.toUpperCase() }}</div>
                </div>
                <div class="product-info">
                  <span class="product-name">{{ product.name }}</span>
                  <span class="product-sku">
                    <span class="sku-badge">SKU</span> {{ product.sku }}
                  </span>
                  <span class="product-desc" *ngIf="product.description">{{ product.description | slice:0:60 }}...</span>
                </div>
                <div class="product-footer">
                  <span class="product-price">{{ product.unitPrice | number:'1.2-2' }} €</span>
                  <button class="add-btn" [class.added]="isInCart(product.id!)">
                    {{ isInCart(product.id!) ? '✓ Ajouté' : '+ Ajouter' }}
                  </button>
                </div>
              </div>
            }
            @if (filteredProducts().length === 0) {
              <div class="empty-products">
                <span class="empty-icon">📭</span>
                <p>Aucun produit trouvé</p>
                <small>Essayez avec d'autres mots-clés</small>
              </div>
            }
          </div>
        </div>

        <!-- Cart Section -->
        <div class="cart-section" [class.has-items]="lines.length > 0">
          <div class="cart-header">
            <div class="cart-title">
              <span class="cart-icon">🛒</span>
              <h2>Mon Panier</h2>
            </div>
            <div class="cart-badge" [class.empty]="lines.length === 0">
              {{ lines.length }} article(s)
            </div>
          </div>

          <form [formGroup]="orderForm" (ngSubmit)="onSubmit()">
            <div class="cart-items" formArrayName="lines">
              @for (item of lines.controls; track $index; let i = $index) {
                <div class="cart-item" [formGroupName]="i" @slideIn>
                  <div class="item-icon">{{ getProductName(item.get('productId')?.value)?.charAt(0) }}</div>
                  <div class="item-info">
                    <span class="item-name">{{ getProductName(item.get('productId')?.value) }}</span>
                    <span class="item-sku">{{ getProductSku(item.get('productId')?.value) }}</span>
                    <span class="item-unit-price">{{ getProductPrice(item.get('productId')?.value) | number:'1.2-2' }} € / unité</span>
                  </div>
                  <div class="item-controls">
                    <button type="button" class="qty-btn minus" (click)="decrementQty(i)" [disabled]="item.get('quantity')?.value <= 1">−</button>
                    <input type="number" formControlName="quantity" min="1" class="qty-input" />
                    <button type="button" class="qty-btn plus" (click)="incrementQty(i)">+</button>
                  </div>
                  <div class="item-total-section">
                    <span class="item-total">
                      {{ (item.get('quantity')?.value || 0) * getProductPrice(item.get('productId')?.value) | number:'1.2-2' }} €
                    </span>
                  </div>
                  <button type="button" class="remove-btn" (click)="removeFromCart(i)" title="Supprimer">
                    <span>🗑️</span>
                  </button>
                </div>
              }
              @if (lines.length === 0) {
                <div class="empty-cart">
                  <div class="empty-cart-animation">
                    <span class="cart-icon-large">🛒</span>
                  </div>
                  <h3>Votre panier est vide</h3>
                  <p>Parcourez notre catalogue et ajoutez des produits</p>
                </div>
              }
            </div>

            @if (lines.length > 0) {
              <div class="cart-summary">
                <div class="summary-row">
                  <span>Sous-total ({{ totalItems() }} articles)</span>
                  <span>{{ calculateSubtotal() | number:'1.2-2' }} €</span>
                </div>
                <div class="summary-row shipping">
                  <span>Frais de livraison</span>
                  <span class="free-shipping">Gratuit</span>
                </div>
                <div class="divider"></div>
                <div class="summary-row total">
                  <span>Total TTC</span>
                  <span class="total-amount">{{ calculateSubtotal() | number:'1.2-2' }} €</span>
                </div>
              </div>

              <div class="cart-actions">
                <button type="button" class="btn btn-outline" (click)="clearCart()">
                  <span>🗑️</span> Vider le panier
                </button>
                <button type="submit" class="btn btn-primary btn-submit" [disabled]="orderForm.invalid || submitting()">
                  @if (submitting()) { 
                    <span class="spinner-sm"></span> Traitement...
                  } @else {
                    <span>✓</span> Confirmer la commande
                  }
                </button>
              </div>

              <div class="secure-badge">
                <span>🔒</span> Paiement sécurisé • Livraison gratuite
              </div>
            }
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 1500px; padding: 2rem; }

    /* Hero Header */
    .page-header-hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 24px;
      padding: 2rem 2.5rem;
      margin-bottom: 2rem;
      color: white;
      box-shadow: 0 15px 50px rgba(102, 126, 234, 0.35);
      position: relative;
      overflow: hidden;
    }
    .page-header-hero::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 60%;
      height: 200%;
      background: radial-gradient(ellipse, rgba(255,255,255,0.1) 0%, transparent 70%);
    }
    .back-btn {
      color: rgba(255,255,255,0.8);
      text-decoration: none;
      font-size: 0.875rem;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      margin-bottom: 1rem;
      transition: color 0.2s;
    }
    .back-btn:hover { color: white; }
    .header-content { display: flex; align-items: center; gap: 1.25rem; position: relative; }
    .header-icon { font-size: 3.5rem; }
    .header-text h1 { margin: 0; font-size: 2.25rem; font-weight: 700; }
    .header-text .subtitle { margin: 0.5rem 0 0; opacity: 0.9; font-size: 1rem; }

    /* Steps Progress */
    .steps-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      margin-bottom: 2.5rem;
      padding: 1.5rem;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      opacity: 0.4;
      transition: opacity 0.3s;
    }
    .step.completed, .step.active { opacity: 1; }
    .step-marker {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1rem;
      color: #6b7280;
      transition: all 0.3s;
    }
    .step.completed .step-marker { background: linear-gradient(135deg, #667eea, #764ba2); color: white; }
    .step.active .step-marker { background: #f59e0b; color: white; }
    .step-label { font-size: 0.8rem; font-weight: 500; color: #6b7280; }
    .step-line { width: 80px; height: 3px; background: #e5e7eb; margin: 0 0.5rem; margin-bottom: 1.5rem; transition: background 0.3s; }
    .step-line.active { background: linear-gradient(90deg, #667eea, #764ba2); }

    /* Main Container */
    .order-container { display: grid; grid-template-columns: 1fr 450px; gap: 2rem; align-items: start; }
    @media (max-width: 1100px) { .order-container { grid-template-columns: 1fr; } }

    /* Products Section */
    .products-section {
      background: white;
      border-radius: 20px;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #f3f4f6;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .section-title-row { display: flex; align-items: center; gap: 1rem; }
    .section-icon { font-size: 2rem; }
    .section-header h2 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #111827; }
    .product-count { font-size: 0.8rem; color: #6b7280; }

    .search-box {
      position: relative;
      flex: 1;
      max-width: 350px;
    }
    .search-box input {
      width: 100%;
      padding: 0.875rem 1rem 0.875rem 2.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .search-box input:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1); }
    .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); font-size: 1rem; }
    .clear-search {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      background: #e5e7eb;
      border: none;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1rem;
      line-height: 1;
      color: #6b7280;
    }
    .clear-search:hover { background: #d1d5db; }

    /* Products Grid */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
      max-height: 600px;
      overflow-y: auto;
      padding-right: 0.5rem;
    }
    .products-grid::-webkit-scrollbar { width: 6px; }
    .products-grid::-webkit-scrollbar-track { background: #f3f4f6; border-radius: 3px; }
    .products-grid::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }

    .product-card {
      background: #f9fafb;
      border-radius: 16px;
      padding: 1.25rem;
      cursor: pointer;
      transition: all 0.3s;
      border: 2px solid transparent;
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .product-card:hover { 
      transform: translateY(-4px); 
      box-shadow: 0 12px 30px rgba(0,0,0,0.1); 
      border-color: #667eea;
    }
    .product-card.in-cart {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border-color: #3b82f6;
    }
    .product-badge {
      position: absolute;
      top: -8px;
      right: 12px;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white;
      font-size: 0.7rem;
      font-weight: 600;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }
    .product-icon-container { display: flex; justify-content: center; }
    .product-icon {
      width: 60px;
      height: 60px;
      border-radius: 16px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.5rem;
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }
    .product-info { display: flex; flex-direction: column; gap: 0.25rem; text-align: center; flex: 1; }
    .product-name { font-weight: 600; color: #111827; font-size: 1rem; }
    .product-sku { font-size: 0.8rem; color: #6b7280; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
    .sku-badge { background: #e5e7eb; padding: 0.125rem 0.375rem; border-radius: 4px; font-size: 0.65rem; font-weight: 600; color: #6b7280; }
    .product-desc { font-size: 0.8rem; color: #9ca3af; line-height: 1.4; }
    .product-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 0.75rem; border-top: 1px solid #e5e7eb; }
    .product-price { font-weight: 700; color: #111827; font-size: 1.125rem; }
    .add-btn {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      border-radius: 10px;
      padding: 0.5rem 1rem;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 600;
      transition: all 0.2s;
    }
    .add-btn:hover { transform: scale(1.05); box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
    .add-btn.added { background: linear-gradient(135deg, #10b981, #059669); }

    .empty-products { grid-column: 1/-1; text-align: center; padding: 3rem; color: #9ca3af; }
    .empty-products .empty-icon { font-size: 4rem; display: block; margin-bottom: 1rem; }
    .empty-products p { margin: 0; font-weight: 600; font-size: 1.1rem; color: #6b7280; }
    .empty-products small { display: block; margin-top: 0.5rem; }
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.5rem; color: #111827; }
    .subtitle { margin: 0.25rem 0 0; color: #6b7280; font-size: 0.875rem; }

    /* Cart Section */
    .cart-section {
      background: white;
      border-radius: 20px;
      padding: 0;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      position: sticky;
      top: 2rem;
      overflow: hidden;
      transition: all 0.3s;
    }
    .cart-section.has-items {
      box-shadow: 0 8px 40px rgba(102, 126, 234, 0.15);
    }
    .cart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 1.75rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .cart-title { display: flex; align-items: center; gap: 0.75rem; }
    .cart-icon { font-size: 1.5rem; }
    .cart-header h2 { margin: 0; font-size: 1.25rem; font-weight: 600; }
    .cart-badge {
      background: rgba(255,255,255,0.25);
      padding: 0.375rem 1rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .cart-badge.empty { opacity: 0.7; }

    .cart-items {
      padding: 1rem 1.5rem;
      min-height: 200px;
      max-height: 350px;
      overflow-y: auto;
    }
    .cart-items::-webkit-scrollbar { width: 4px; }
    .cart-items::-webkit-scrollbar-track { background: transparent; }
    .cart-items::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }

    .cart-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: 14px;
      background: #f9fafb;
      margin-bottom: 0.75rem;
      border: 1px solid #f3f4f6;
      transition: all 0.2s;
    }
    .cart-item:hover { background: #f3f4f6; }
    .item-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.1rem;
      flex-shrink: 0;
    }
    .item-info { flex: 1; display: flex; flex-direction: column; gap: 0.125rem; min-width: 0; }
    .item-name { font-weight: 600; color: #111827; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .item-sku { font-size: 0.7rem; color: #9ca3af; font-family: monospace; }
    .item-unit-price { font-size: 0.75rem; color: #6b7280; }
    .item-controls { display: flex; align-items: center; gap: 0.25rem; }
    .qty-btn {
      width: 30px;
      height: 30px;
      border: none;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #374151;
      transition: all 0.2s;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .qty-btn:hover:not(:disabled) { background: #667eea; color: white; }
    .qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .qty-btn.minus:hover:not(:disabled) { background: #ef4444; }
    .qty-btn.plus:hover:not(:disabled) { background: #10b981; }
    .qty-input {
      width: 48px;
      height: 30px;
      text-align: center;
      border: none;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .qty-input:focus { outline: none; box-shadow: 0 0 0 2px #667eea; }
    .item-total-section { text-align: right; min-width: 70px; }
    .item-total { font-weight: 700; color: #111827; font-size: 0.95rem; }
    .remove-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      padding: 0.375rem;
      border-radius: 8px;
      transition: all 0.2s;
      opacity: 0.6;
    }
    .remove-btn:hover { background: #fee2e2; opacity: 1; }

    .empty-cart {
      text-align: center;
      padding: 3rem 1.5rem;
      color: #9ca3af;
    }
    .cart-icon-large { font-size: 4rem; display: block; margin-bottom: 0.5rem; opacity: 0.5; }
    .empty-cart h3 { margin: 1rem 0 0.5rem; font-size: 1.1rem; color: #6b7280; }
    .empty-cart p { margin: 0; font-size: 0.9rem; }

    .cart-summary {
      padding: 1.25rem 1.75rem;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      font-size: 0.9rem;
      color: #6b7280;
    }
    .summary-row.shipping .free-shipping { color: #10b981; font-weight: 600; }
    .divider { height: 1px; background: #e5e7eb; margin: 0.5rem 0; }
    .summary-row.total {
      font-size: 1.25rem;
      font-weight: 700;
      color: #111827;
      padding-top: 0.75rem;
    }
    .total-amount { color: #667eea; }

    .cart-actions {
      display: flex;
      gap: 0.75rem;
      padding: 0 1.75rem 1.5rem;
    }
    .btn {
      flex: 1;
      padding: 0.875rem 1.25rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    .btn-outline {
      background: white;
      border: 2px solid #e5e7eb;
      color: #6b7280;
    }
    .btn-outline:hover { background: #f9fafb; border-color: #d1d5db; }
    .btn-primary {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    .btn-primary:hover:not(:disabled) { 
      transform: translateY(-2px); 
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
    }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .btn-submit { flex: 2; }

    .secure-badge {
      text-align: center;
      padding: 1rem 1.75rem;
      font-size: 0.8rem;
      color: #6b7280;
      background: #f3f4f6;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .empty-text { text-align: center; color: #9ca3af; padding: 2rem; }

    .spinner-sm {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
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

  // Computed for total items count
  totalItems = computed(() => {
    return this.lines.controls.reduce((sum, c) => sum + (c.get('quantity')?.value || 0), 0);
  });

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

  isInCart(productId: number): boolean {
    return this.lines.controls.some(c => c.get('productId')?.value === productId);
  }

  getCartQuantity(productId: number): number {
    const control = this.lines.controls.find(c => c.get('productId')?.value === productId);
    return control?.get('quantity')?.value || 0;
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
        productSku: [product.sku],
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

  getProductSku(productId: number): string {
    return this.products().find(p => p.id === productId)?.sku || '';
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
      productSku: c.get('productSku')?.value,
      quantity: c.get('quantity')?.value
    }));

    const request: CreateSalesOrderRequest = { lines };
    
    console.log('Creating order with request:', JSON.stringify(request));

    this.ordersApi.create(request).subscribe({
      next: (order: SalesOrder) => {
        this.toast.success(`Commande #${order.id} créée avec succès`);
        this.router.navigate(['/client/orders'], { queryParams: { orderId: order.id } });
        this.submitting.set(false);
      },
      error: (err) => {
        console.error('Order creation error:', err);
        // Error toast is already shown by error interceptor
        this.submitting.set(false);
      }
    });
  }
}
