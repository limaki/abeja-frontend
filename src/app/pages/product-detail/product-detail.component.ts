import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LoadingSpinnerComponent
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  product: Product | null = null;

  loading = true;
  errorMessage = '';
  successMessage = '';

  quantity = 1;

  private readonly apiBaseUrl = environment.apiUrl.replace('/api', '');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.loadProduct(id);
    } else {
      this.loading = false;
      this.errorMessage = 'Producto inválido.';
    }
  }

  loadProduct(id: string): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.productService.getProductById(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => {
          this.product = response.product;
          this.quantity = 1;
        },
        error: () => {
          this.errorMessage = 'No se pudo cargar el producto.';
        }
      });
  }

  increaseQty(): void {
    if (!this.product) return;

    if (this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decreaseQty(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (!this.product) return;

    if (this.product.stock <= 0) {
      this.errorMessage = 'Sin stock disponible.';
      this.successMessage = '';
      return;
    }

    this.cartService.addToCart(this.product, this.quantity);

    this.successMessage = `"${this.product.name}" fue agregado al carrito (${this.quantity}).`;
    this.errorMessage = '';

    setTimeout(() => {
      this.successMessage = '';
    }, 2500);
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

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(price || 0);
  }

  getCategoryName(): string {
    if (!this.product || !this.product.category) {
      return 'Colección';
    }

    if (typeof this.product.category === 'string') {
      return 'Colección';
    }

    return this.product.category.name;
  }

  hasStock(): boolean {
    return !!this.product && this.product.stock > 0;
  }

  getStockLabel(): string {
    if (!this.product) return '';

    if (this.product.stock <= 0) {
      return 'Sin stock';
    }

    if (this.product.stock <= 5) {
      return `Últimas ${this.product.stock} unidades`;
    }

    return `Stock disponible: ${this.product.stock}`;
  }

  getShortDescription(): string {
    if (!this.product?.description) {
      return 'Descubrí una pieza seleccionada de nuestra tienda, pensada para destacar con estilo, presencia y personalidad.';
    }

    return this.product.description;
  }
}