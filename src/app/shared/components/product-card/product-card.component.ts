import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  private cartService = inject(CartService);

  private readonly apiBaseUrl = environment.apiUrl.replace('/api', '');

  @Input() product: any;

  addToCart(): void {
    if (!this.product || this.product.stock <= 0) return;
    this.cartService.addToCart(this.product, 1);
  }



getImageUrl(image: string | undefined | null): string {
  if (!image) return 'https://placehold.co/500x600?text=Producto';
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  return `${this.apiBaseUrl}${image}`;
}

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(price || 0);
  }

  getCategoryName(): string {
    if (!this.product?.category) return 'Colección';
    return typeof this.product.category === 'string'
      ? 'Colección'
      : this.product.category.name;
  }
}