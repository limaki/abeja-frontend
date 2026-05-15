import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  private readonly apiBaseUrl = environment.apiUrl.replace('/api', '');

  products: any[] = [];
  categories: any[] = [];

  loading = false;
  errorMessage = '';
  successMessage = '';

  editingId: string | null = null;

  searchTerm = '';
  selectedCategoryFilter = '';
  selectedFeaturedFilter = 'all';
  selectedStockFilter = 'all';
  sortBy = 'recent';

  form = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    featured: false
  };

  selectedFile: File | null = null;
  imagePreview: string | null = null;

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.categoryService.getCategories().subscribe({
      next: (res) => {
        this.categories = res.categories || [];
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar las categorías';
      }
    });

    this.productService.getProducts().subscribe({
      next: (res) => {
        this.products = res.products || [];
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'No se pudieron cargar los productos';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  get filteredProducts(): any[] {
    let result = [...this.products];

    const term = this.searchTerm.trim().toLowerCase();

    if (term) {
      result = result.filter((p) => {
        const name = String(p.name || '').toLowerCase();
        const description = String(p.description || '').toLowerCase();
        const categoryName = String(p.category?.name || '').toLowerCase();

        return (
          name.includes(term) ||
          description.includes(term) ||
          categoryName.includes(term)
        );
      });
    }

    if (this.selectedCategoryFilter) {
      result = result.filter((p) => {
        const categoryId =
          typeof p.category === 'string'
            ? p.category
            : p.category?._id || '';

        return categoryId === this.selectedCategoryFilter;
      });
    }

    if (this.selectedFeaturedFilter === 'featured') {
      result = result.filter((p) => !!p.featured);
    }

    if (this.selectedFeaturedFilter === 'notFeatured') {
      result = result.filter((p) => !p.featured);
    }

    if (this.selectedStockFilter === 'inStock') {
      result = result.filter((p) => Number(p.stock) > 0);
    }

    if (this.selectedStockFilter === 'outOfStock') {
      result = result.filter((p) => Number(p.stock) <= 0);
    }

    switch (this.sortBy) {
      case 'nameAsc':
        result.sort((a, b) => String(a.name).localeCompare(String(b.name)));
        break;

      case 'priceAsc':
        result.sort((a, b) => Number(a.price) - Number(b.price));
        break;

      case 'priceDesc':
        result.sort((a, b) => Number(b.price) - Number(a.price));
        break;

      case 'stockAsc':
        result.sort((a, b) => Number(a.stock) - Number(b.stock));
        break;

      case 'stockDesc':
        result.sort((a, b) => Number(b.stock) - Number(a.stock));
        break;

      case 'recent':
      default:
        result.sort((a, b) => {
          const da = new Date(a.createdAt || 0).getTime();
          const db = new Date(b.createdAt || 0).getTime();
          return db - da;
        });
        break;
    }

    return result;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategoryFilter = '';
    this.selectedFeaturedFilter = 'all';
    this.selectedStockFilter = 'all';
    this.sortBy = 'recent';
  }

onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  this.selectedFile = file;

  const reader = new FileReader();
  reader.onload = () => {
    this.imagePreview = reader.result as string;
  };
  reader.readAsDataURL(file);
}

 submit(): void {
  this.errorMessage = '';
  this.successMessage = '';

  if (!this.form.name.trim()) {
    this.errorMessage = 'El nombre del producto es obligatorio';
    return;
  }

  if (!this.form.category) {
    this.errorMessage = 'Seleccioná una categoría';
    return;
  }

  const formData = new FormData();
  formData.append('name', this.form.name.trim());
  formData.append('description', this.form.description.trim());
  formData.append('price', String(this.form.price));
  formData.append('stock', String(this.form.stock));
  formData.append('category', this.form.category);
  formData.append('featured', String(this.form.featured));

  if (this.selectedFile) {
    formData.append('image', this.selectedFile);
  }

  if (this.editingId) {
    this.productService.updateProduct(this.editingId, formData).subscribe({
      next: () => {
        this.successMessage = 'Producto actualizado correctamente';
        this.resetForm();
        this.loadAll();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'No se pudo actualizar el producto';
      }
    });
  } else {
    this.productService.createProduct(formData).subscribe({
      next: () => {
        this.successMessage = 'Producto creado correctamente';
        this.resetForm();
        this.loadAll();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'No se pudo crear el producto';
      }
    });
  }
}

  edit(product: any): void {
    this.editingId = product._id;

    this.form = {
      name: product.name || '',
      description: product.description || '',
      price: Number(product.price) || 0,
      stock: Number(product.stock) || 0,
      category:
        typeof product.category === 'string'
          ? product.category
          : product.category?._id || '',
      featured: !!product.featured
    };

    this.selectedFile = null;
    this.imagePreview = product.image ? this.getImageUrl(product.image) : null;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  delete(id: string): void {
    this.errorMessage = '';
    this.successMessage = '';

    const ok = confirm('¿Seguro que querés eliminar este producto?');
    if (!ok) return;

    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.successMessage = 'Producto eliminado correctamente';

        if (this.editingId === id) {
          this.resetForm();
        }

        this.loadAll();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'No se pudo eliminar el producto';
      }
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.form = {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      featured: false
    };
    this.selectedFile = null;
    this.imagePreview = null;
  }

getImageUrl(image: string | undefined | null): string {
  if (!image) return 'https://placehold.co/500x600?text=Producto';
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  return `${this.apiBaseUrl}${image}`;
}

  getCategoryName(product: any): string {
    if (!product?.category) return 'Sin categoría';
    return typeof product.category === 'string'
      ? 'Categoría'
      : product.category.name;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(price || 0);
  }

  getTotalProducts(): number {
    return this.products.length;
  }

  getFeaturedCount(): number {
    return this.products.filter((p) => !!p.featured).length;
  }

  getOutOfStockCount(): number {
    return this.products.filter((p) => Number(p.stock) <= 0).length;
  }

  trackByProduct(index: number, product: any): string {
    return product._id;
  }
}