import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HomeCarouselComponent } from '../../shared/components/home-carousel/home-carousel.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, HomeCarouselComponent, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);

  featuredProducts: Product[] = [];

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
    this.loadFeaturedProducts();
  }

  loadFeaturedProducts(): void {
    this.productService.getFeaturedProducts().subscribe({
      next: (res) => {
        this.featuredProducts = res.products || [];
      },
      error: () => {
        this.featuredProducts = [];
      }
    });
  }

  trackByProduct(index: number, product: Product): string {
    return product._id;
  }
}