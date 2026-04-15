import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);

  loading = false;
  successMessage = '';
  errorMessage = '';

  orders = signal<any[]>([]);
  searchTerm = signal('');
  selectedStatus = signal<string>('all');
  updatingOrderId = signal<string | null>(null);

  filteredOrders = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.selectedStatus();
    const data = this.orders();

    return data.filter((order) => {
      const matchesStatus = status === 'all' ? true : order.status === status;

      if (!matchesStatus) return false;
      if (!term) return true;

      const orderId = String(order._id || '').toLowerCase();
      const customerName = String(order.customerName || '').toLowerCase();
      const customerPhone = String(order.customerPhone || '').toLowerCase();
      const address = String(order.address || '').toLowerCase();

      return (
        orderId.includes(term) ||
        customerName.includes(term) ||
        customerPhone.includes(term) ||
        address.includes(term)
      );
    });
  });

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.orderService.getOrders().subscribe({
      next: (res) => {
        const orders = (res.orders || []).map((order: any) => ({
          ...order,
          items: order.items || []
        }));

        this.orders.set(orders);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'No se pudieron cargar los pedidos';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  onStatusFilterChange(value: string): void {
    this.selectedStatus.set(value);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set('all');
  }

  changeStatus(order: any, newStatus: string): void {
    if (!order?._id || order.status === newStatus) return;

    this.updatingOrderId.set(order._id);
    this.errorMessage = '';
    this.successMessage = '';

    this.orderService.updateOrderStatus(order._id, { status: newStatus }).subscribe({
      next: () => {
        this.successMessage = 'Estado del pedido actualizado correctamente';

        const updated = this.orders().map((o) =>
          o._id === order._id ? { ...o, status: newStatus } : o
        );

        this.orders.set(updated);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'No se pudo actualizar el estado';
      },
      complete: () => {
        this.updatingOrderId.set(null);
      }
    });
  }

  getItemCount(order: any): number {
    return (order.items || []).reduce((acc: number, item: any) => acc + (item.quantity || 0), 0);
  }

  getOrderTotal(order: any): number {
    return (order.items || []).reduce((acc: number, item: any) => {
      const price = item?.product?.price ?? item?.price ?? 0;
      const qty = item?.quantity ?? 0;
      return acc + (price * qty);
    }, 0);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'confirmed':
        return 'Confirmado';
      case 'shipped':
        return 'Enviado';
      case 'delivered':
        return 'Entregado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status || 'Sin estado';
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(price || 0);
  }

  formatDate(date: string): string {
    if (!date) return '-';

    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(date));
  }

  trackByOrder(index: number, order: any): string {
    return order._id;
  }
}