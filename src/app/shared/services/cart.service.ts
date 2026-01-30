import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/business.models';

// Cart item interface with full product data
export interface CartItem {
    product: Product;
    quantity: number;
}

@Injectable({
    providedIn: 'root'
})
export class CartService {
    // Public signal for cart items so templates can access it
    cartItems = signal<CartItem[]>([]);

    // Computed properties
    cartCount = computed(() => this.cartItems().reduce((acc, item) => acc + item.quantity, 0));
    totalAmount = computed(() => this.cartItems().reduce((acc, item) =>
        acc + (item.quantity * (item.product.finalPrice || 0)), 0
    ));

    addToCart(product: Product, quantity: number = 1) {
        this.cartItems.update(items => {
            const existing = items.find(i => i.product.id === product.id);
            if (existing) {
                return items.map(i => i.product.id === product.id
                    ? { ...i, quantity: i.quantity + quantity }
                    : i
                );
            }
            return [...items, { product, quantity }];
        });
    }

    removeFromCart(productId: number) {
        this.cartItems.update(items => items.filter(i => i.product.id !== productId));
    }

    updateQuantity(productId: number, quantity: number) {
        if (quantity <= 0) {
            this.removeFromCart(productId);
            return;
        }
        this.cartItems.update(items => items.map(i =>
            i.product.id === productId ? { ...i, quantity } : i
        ));
    }

    clearCart() {
        this.cartItems.set([]);
    }
}
