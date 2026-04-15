import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink // 🔥 ESTO FALTABA
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  private orderService = inject(OrderService);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  totalOrders = 0;
  totalProducts = 0;
  totalCategories = 0;
  totalRevenue = 0;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {

    this.orderService.getMyOrders().subscribe({
      next: (res: any) => {
        const orders = res.orders || [];
        this.totalOrders = orders.length;
        this.totalRevenue = orders.reduce((acc: number, o: any) => acc + (o.total || 0), 0);
      }
    });

    this.productService.getProducts({}).subscribe({
      next: (res: any) => {
        this.totalProducts = res.products?.length || 0;
      }
    });

    this.categoryService.getCategories().subscribe({
      next: (res: any) => {
        this.totalCategories = res.categories?.length || 0;
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(price);
  }
}