import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private router = inject(Router);

  cartItems: any[] = [];
  subtotal = 0;
  shipping = 0;
  total = 0;
  totalItems = 0;

  loading = false;
  successMessage = '';
  errorMessage = '';

  customer = {
    name: '',
    phone: '',
    address: '',
    notes: ''
  };

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], {
        queryParams: { redirectTo: '/checkout' }
      });
      return;
    }

    const user = this.authService.getUser();

    this.cartItems = this.cartService.getItems();
    this.subtotal = this.cartService.getSubtotal();
    this.shipping = this.cartService.getShipping();
    this.total = this.cartService.getFinalTotal();
    this.totalItems = this.cartService.getTotalItems();

    if (user?.name) {
      this.customer.name = user.name;
    }

    if (this.cartItems.length === 0) {
      this.errorMessage = 'Tu carrito está vacío. Agregá productos antes de continuar.';
    }
  }

  confirmOrder(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], {
        queryParams: { redirectTo: '/checkout' }
      });
      return;
    }

    if (!this.customer.name.trim() || !this.customer.phone.trim()) {
      this.errorMessage = 'Nombre y teléfono son obligatorios.';
      return;
    }

    if (this.cartItems.length === 0) {
      this.errorMessage = 'El carrito está vacío.';
      return;
    }

    this.loading = true;

    const payload = {
      customerName: this.customer.name.trim(),
      customerPhone: this.customer.phone.trim(),
      address: this.customer.address.trim(),
      notes: this.customer.notes.trim(),
      items: this.cartItems.map(item => ({
        productId: item._id,
        quantity: item.quantity
      }))
    };

    this.orderService.createOrder(payload).subscribe({
      next: (response: any) => {
        this.successMessage = 'Pedido creado correctamente. Te estamos redirigiendo...';

        const whatsappLink = response?.whatsappLink;

        this.cartService.clearCart();

        setTimeout(() => {
          if (whatsappLink) {
            window.open(whatsappLink, '_blank');
          }

          this.router.navigate(['/my-orders']);
        }, 900);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error?.error?.message || 'No se pudo crear el pedido. Intentá nuevamente.';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  getImageUrl(image: string): string {
    if (!image) {
      return 'https://placehold.co/300x360?text=Producto';
    }

    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }

    return `http://localhost:3000${image}`;
  }

  getLineTotal(item: any): number {
    return item.price * item.quantity;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(price);
  }
}