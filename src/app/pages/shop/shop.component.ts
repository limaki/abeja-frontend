import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { CartService } from '../../core/services/cart.service';

import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';

import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SearchBarComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css'
})
export class ShopComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private cartService = inject(CartService);

  @ViewChild('productsSection') productsSection!: ElementRef<HTMLElement>;

  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];

  loading = false;
  loadingCategories = false;

  successMessage = '';
  errorMessage = '';

  searchTerm = '';
  selectedCategory = '';
  sortBy = 'recent';

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  get hasActiveFilters(): boolean {
    return !!this.searchTerm.trim() || !!this.selectedCategory || this.sortBy !== 'recent';
  }

  loadProducts(): void {
    this.loading = true;
    this.errorMessage = '';

    this.productService.getProducts().subscribe({
      next: (res: any) => {
        this.products = res.products || [];
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('[SHOP] Error cargando productos:', err);
        this.products = [];
        this.filteredProducts = [];
        this.errorMessage = err?.error?.message || 'No se pudieron cargar los productos';
        this.loading = false;
      }
    });
  }

  loadCategories(): void {
    this.loadingCategories = true;

    this.categoryService.getCategories(true).subscribe({
      next: (res: any) => {
        this.categories = res.categories || [];
        this.loadingCategories = false;
      },
      error: (err) => {
        console.error('[SHOP] Error cargando categorías:', err);
        this.categories = [];
        this.loadingCategories = false;
      }
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  onSearch(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
    this.scrollToProducts();
  }

  onSortChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.sortBy = select.value;
    this.applyFilters();
    this.scrollToProducts();
  }

  onCategorySelected(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.applyFilters();

    setTimeout(() => {
      this.scrollToProducts();
    }, 80);
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();

    let result = [...this.products];

    if (this.selectedCategory) {
      result = result.filter((product) => {
        const category = product.category as any;

        if (!category) {
          return false;
        }

        if (typeof category === 'string') {
          return category === this.selectedCategory;
        }

        return category._id === this.selectedCategory;
      });
    }

    if (term) {
      result = result.filter((product) => {
        const name = product.name?.toLowerCase() || '';
        const description = product.description?.toLowerCase() || '';
        const categoryName = this.getCategoryName(product).toLowerCase();

        return (
          name.includes(term) ||
          description.includes(term) ||
          categoryName.includes(term)
        );
      });
    }

    result = this.sortProducts(result);

    this.filteredProducts = result;
  }

  sortProducts(products: Product[]): Product[] {
    const sorted = [...products];

    switch (this.sortBy) {
      case 'priceAsc':
        return sorted.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));

      case 'priceDesc':
        return sorted.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));

      case 'nameAsc':
        return sorted.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));

      case 'recent':
      default:
        return sorted;
    }
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.sortBy = 'recent';
    this.applyFilters();

    setTimeout(() => {
      this.scrollToProducts();
    }, 80);
  }

  scrollToProducts(): void {
    if (!this.productsSection?.nativeElement) {
      return;
    }

    this.productsSection.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  addToCart(product: Product): void {
    if (!product || product.stock <= 0) {
      return;
    }

    try {
      const service: any = this.cartService;

      if (typeof service.addToCart === 'function') {
        service.addToCart(product, 1);
      } else if (typeof service.addItem === 'function') {
        service.addItem(product, 1);
      } else if (typeof service.add === 'function') {
        service.add(product, 1);
      }

      this.successMessage = 'Producto agregado al carrito';
      this.errorMessage = '';

      setTimeout(() => {
        this.successMessage = '';
      }, 2200);
    } catch (error) {
      console.error('[SHOP] Error agregando al carrito:', error);
      this.errorMessage = 'No se pudo agregar el producto al carrito';
    }
  }

  isProductInCart(productId: string): boolean {
    const quantity = this.getProductQuantity(productId);
    return quantity > 0;
  }

  getProductQuantity(productId: string): number {
    try {
      const service: any = this.cartService;

      if (typeof service.getProductQuantity === 'function') {
        return Number(service.getProductQuantity(productId) || 0);
      }

      if (typeof service.getQuantity === 'function') {
        return Number(service.getQuantity(productId) || 0);
      }

      if (typeof service.getItems === 'function') {
        const items = service.getItems() || [];
        const item = items.find((i: any) => {
          const product = i.product || i;
          return product?._id === productId || i.productId === productId;
        });

        return Number(item?.quantity || item?.qty || 0);
      }

      if (Array.isArray(service.items)) {
        const item = service.items.find((i: any) => {
          const product = i.product || i;
          return product?._id === productId || i.productId === productId;
        });

        return Number(item?.quantity || item?.qty || 0);
      }

      return 0;
    } catch {
      return 0;
    }
  }

  getCategoryName(product: Product): string {
    const category = product.category as any;

    if (!category) {
      return 'Sin categoría';
    }

    if (typeof category === 'string') {
      const found = this.categories.find((c) => c._id === category);
      return found?.name || 'Categoría';
    }

    return category.name || 'Categoría';
  }

  getImageUrl(image?: string): string {
    if (!image) {
      return 'assets/images/product-placeholder.jpg';
    }

    return image;
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(Number(value || 0));
  }

  trackByProduct(index: number, product: Product): string {
    return product._id;
  }

  trackByCategory(index: number, category: Category): string {
    return category._id;
  }
}