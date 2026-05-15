import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { environment } from '../../../environments/environment';

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
  private router = inject(Router);

  cartItems: any[] = [];
  subtotal = 0;
  shipping = 0;
  total = 0;
  totalItems = 0;

  private readonly apiBaseUrl = environment.apiUrl.replace('/api', '');

  loading = false;
  successMessage = '';
  errorMessage = '';

customer = {
  name: '',
  phone: '',
  address: '',
  notes: '',
  shippingMethod: 'Retiro en el local'
};
shippingOptions = [
  'Retiro en el local',
  'Envío a domicilio',
  'Correo Argentino',
  'Andreani',
  'A coordinar'
];

  ngOnInit(): void {
    this.cartItems = this.cartService.getItems();
    this.subtotal = this.cartService.getSubtotal();
    this.shipping = this.cartService.getShipping();
    this.total = this.cartService.getFinalTotal();
    this.totalItems = this.cartService.getTotalItems();

    if (this.cartItems.length === 0) {
      this.errorMessage = 'Tu carrito está vacío. Agregá productos antes de continuar.';
    }
  }

  confirmOrder(): void {
    this.errorMessage = '';
    this.successMessage = '';

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
  shippingMethod: this.customer.shippingMethod, // 👈 NUEVO
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

          this.router.navigate(['/']);
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

  getImageUrl(imagePath: string | undefined | null): string {
    if (!imagePath) {
      return 'https://placehold.co/900x1100?text=Sin+imagen';
    }

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    return `${this.apiBaseUrl}${imagePath}`;
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