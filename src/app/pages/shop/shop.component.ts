import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { CartService } from '../../core/services/cart.service';

import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';

import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { CategoryListComponent } from '../../shared/components/category-list/category-list.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SearchBarComponent,
    CategoryListComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css'
})
export class ShopComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private cartService = inject(CartService);

  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];

  loading = true;
  loadingCategories = true;
  errorMessage = '';
  successMessage = '';
  
private readonly apiBaseUrl = environment.apiUrl.replace('/api', '');

  searchTerm = '';
  selectedCategory = '';
  sortBy: 'recent' | 'priceAsc' | 'priceDesc' | 'nameAsc' = 'recent';

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.errorMessage = '';

    this.productService
      .getProducts({
        active: true,
        category: this.selectedCategory || undefined
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => {
          this.products = response.products || [];
          this.applyFilters();
        },
        error: () => {
          this.products = [];
          this.filteredProducts = [];
          this.errorMessage = 'No se pudieron cargar los productos.';
        }
      });
  }

  loadCategories(): void {
    this.loadingCategories = true;

    this.categoryService
      .getCategories(true)
      .pipe(finalize(() => (this.loadingCategories = false)))
      .subscribe({
        next: (response) => {
          this.categories = response.categories || [];
        },
        error: () => {
          this.categories = [];
        }
      });
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.applyFilters();
  }

  onSearch(value: string): void {
    this.searchTerm = value;
    this.applyFilters();
  }

  onCategorySelected(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.loadProducts();
  }

  onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.sortBy = target.value as 'recent' | 'priceAsc' | 'priceDesc' | 'nameAsc';
    this.applyFilters();
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();

    let result = [...this.products];

    if (term) {
      result = result.filter(product => {
        const categoryName = this.getCategoryName(product).toLowerCase();

        return (
          product.name.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term) ||
          categoryName.includes(term)
        );
      });
    }

    switch (this.sortBy) {
      case 'priceAsc':
        result.sort((a, b) => a.price - b.price);
        break;

      case 'priceDesc':
        result.sort((a, b) => b.price - a.price);
        break;

      case 'nameAsc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;

      case 'recent':
      default:
        result.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
    }

    this.filteredProducts = result;
  }

  addToCart(product: Product): void {
    if (product.stock <= 0) {
      this.successMessage = '';
      this.errorMessage = 'Este producto no tiene stock disponible.';
      return;
    }

    this.cartService.addToCart(product, 1);
    this.errorMessage = '';
    this.successMessage = `"${product.name}" se agregó al carrito.`;

    setTimeout(() => {
      this.successMessage = '';
    }, 2200);
  }

  getCategoryName(product: Product): string {
    if (!product.category) {
      return 'Sin categoría';
    }

    if (typeof product.category === 'string') {
      const found = this.categories.find(category => category._id === product.category);
      return found?.name || 'Categoría';
    }

    return product.category.name || 'Categoría';
  }


getImageUrl(image: string | undefined | null): string {
  if (!image) return 'https://placehold.co/500x600?text=Producto';
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  return `${this.apiBaseUrl}${image}`;
}

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.sortBy = 'recent';
    this.loadProducts();
  }

  get hasActiveFilters(): boolean {
    return !!this.searchTerm || !!this.selectedCategory || this.sortBy !== 'recent';
  }

  trackByProduct(index: number, product: Product): string {
    return product._id;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(price);
  }

  isProductInCart(productId: string): boolean {
  return this.cartService.isInCart(productId);
}

getProductQuantity(productId: string): number {
  return this.cartService.getQuantityInCart(productId);
}
}