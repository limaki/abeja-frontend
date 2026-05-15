import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { HomeCarouselComponent } from '../../shared/components/home-carousel/home-carousel.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';

import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HomeCarouselComponent,
    ProductCardComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  featuredProducts: Product[] = [];
  featuredCategories: Category[] = [];

  loadingFeaturedProducts = false;
  loadingCategories = false;

  benefits = [
    {
      title: 'Compra simple',
      text: 'Elegí tus productos y terminá tu pedido en pocos pasos.'
    },
    {
      title: 'Atención rápida',
      text: 'Confirmá tu compra fácilmente y seguí el proceso con claridad.'
    },
    {
      title: 'Estilo actual',
      text: 'Una tienda pensada para mostrar productos con una identidad visual moderna.'
    }
  ];

  ngOnInit(): void {
    this.loadCategories();
    this.loadFeaturedProducts();
  }

  loadCategories(): void {
    this.loadingCategories = true;

    this.categoryService.getCategories().subscribe({
      next: (res: any) => {
        this.featuredCategories = Array.isArray(res)
          ? res
          : res.categories || [];
      },
      error: (error) => {
        console.error('Error cargando categorías:', error);
        this.featuredCategories = [];
      },
      complete: () => {
        this.loadingCategories = false;
      }
    });
  }

  loadFeaturedProducts(): void {
    this.loadingFeaturedProducts = true;

    this.productService.getFeaturedProducts().subscribe({
      next: (res) => {
        this.featuredProducts = res.products || [];
      },
      error: (error) => {
        console.error('Error cargando productos destacados:', error);
        this.featuredProducts = [];
      },
      complete: () => {
        this.loadingFeaturedProducts = false;
      }
    });
  }

  trackByProduct(index: number, product: Product): string {
    return product._id;
  }

  trackByCategory(index: number, category: Category): string {
    return category._id;
  }
}