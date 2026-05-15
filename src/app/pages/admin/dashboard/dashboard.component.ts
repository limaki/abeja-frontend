import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private orderService = inject(OrderService);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  loading = true;

  totalOrders = 0;
  totalProducts = 0;
  totalCategories = 0;
  totalRevenue = 0;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    forkJoin({
      ordersRes: this.orderService.getOrders(),
      productsRes: this.productService.getProducts(),
      categoriesRes: this.categoryService.getCategories()
    }).subscribe({
      next: ({ ordersRes, productsRes, categoriesRes }) => {
        const orders = ordersRes.orders || [];
        const products = productsRes.products || [];
        const categories = categoriesRes.categories || [];

        this.totalOrders = orders.length;
        this.totalProducts = products.length;
        this.totalCategories = categories.length;
        this.totalRevenue = orders.reduce((acc: number, order: any) => acc + (order.total || 0), 0);
      },
      error: () => {
        this.totalOrders = 0;
        this.totalProducts = 0;
        this.totalCategories = 0;
        this.totalRevenue = 0;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(price || 0);
  }
}