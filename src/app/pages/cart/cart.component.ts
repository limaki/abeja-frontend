import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

import { CartService } from '../../core/services/cart.service';
import { QuantitySelectorComponent } from '../../shared/components/quantity-selector/quantity-selector.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, QuantitySelectorComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  private cartService = inject(CartService);
  private router = inject(Router);
  private readonly apiBaseUrl = environment.apiUrl.replace('/api', '');


  cartItems: any[] = [];
  subtotal = 0;
  shipping = 0;
  total = 0;
  totalItems = 0;

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.cartItems = this.cartService.getItems();
    this.subtotal = this.cartService.getSubtotal();
    this.shipping = this.cartService.getShipping();
    this.total = this.cartService.getFinalTotal();
    this.totalItems = this.cartService.getTotalItems();
  }

  onQuantityChange(item: any, quantity: number): void {
    this.cartService.updateQuantity(item._id, quantity);
    this.loadCart();
  }

  removeItem(id: string): void {
    this.cartService.removeItem(id);
    this.loadCart();
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.loadCart();
  }

  goToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(price);
  }

getImageUrl(image: string | undefined | null): string {
  if (!image) return 'https://placehold.co/500x600?text=Producto';
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  return `${this.apiBaseUrl}${image}`;
}

  getLineTotal(item: any): number {
    return item.price * item.quantity;
  }
}