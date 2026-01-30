import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../shared/services/cart.service';
import { SalesOrderService } from '../../../core/services/sales-order.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
    selector: 'app-cart-summary',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './cart-summary.component.html',
    styleUrl: './cart-summary.component.scss'
})
export class CartSummaryComponent {
    cartService = inject(CartService);
    private orderService = inject(SalesOrderService);
    private toastService = inject(ToastService);
    private router = inject(Router);

    loading = signal(false);

    // Computed totals
    subtotal = computed(() => {
        return this.cartService.cartItems().reduce((sum, item) =>
            sum + (item.quantity * (item.product.finalPrice || 0)), 0
        );
    });

    // For simplicity, no tax or shipping for now
    total = computed(() => this.subtotal());

    updateQuantity(item: any, newQuantity: number) {
        if (newQuantity <= 0) {
            this.removeItem(item);
            return;
        }
        this.cartService.updateQuantity(item.product.id, newQuantity);
    }

    removeItem(item: any) {
        this.cartService.removeFromCart(item.product.id);
        this.toastService.show(`${item.product.name} retiré du panier`, 'info');
    }

    clearCart() {
        if (confirm('Êtes-vous sûr de vouloir vider le panier ?')) {
            this.cartService.clearCart();
            this.toastService.show('Panier vidé', 'info');
        }
    }

    createOrder() {
        if (this.cartService.cartItems().length === 0) {
            this.toastService.show('Votre panier est vide', 'warning');
            return;
        }

        this.loading.set(true);

        const orderLines = this.cartService.cartItems().map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.product.finalPrice || 0
        }));

        const order = {
            lines: orderLines
        };

        this.orderService.createOrder(order).subscribe({
            next: (createdOrder) => {
                this.toastService.show('Commande créée avec succès !', 'success');
                this.cartService.clearCart();
                this.loading.set(false);
                // Navigate to orders page to see the new order
                this.router.navigate(['/client/orders']);
            },
            error: (err) => {
                this.toastService.show('Erreur lors de la création de la commande', 'error');
                this.loading.set(false);
            }
        });
    }
}
