import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/order.model';

import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './my-orders.component.html',
  styleUrl: './my-orders.component.css'
})
export class MyOrdersComponent implements OnInit {

  private orderService = inject(OrderService);

  orders: Order[] = [];

  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;

    this.orderService.getMyOrders()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          this.orders = response.orders || [];
        },
        error: () => {
          this.errorMessage = 'No se pudieron cargar tus pedidos.';
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

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-AR');
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'status pending';
      case 'paid': return 'status paid';
      case 'shipped': return 'status shipped';
      case 'cancelled': return 'status cancelled';
      default: return 'status';
    }
  }
}