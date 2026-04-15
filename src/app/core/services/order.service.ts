import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order } from '../models/order.model';
import { CartItem } from '../models/cart-item.model';

interface OrderResponse {
  ok: boolean;
  message?: string;
  order: Order;
  whatsappLink?: string;
}

interface OrdersResponse {
  ok: boolean;
  orders: Order[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/orders`;

  createOrder(data: {
    customerName: string;
    customerPhone: string;
    address: string;
    notes: string;
    items: {
      productId: string;
      quantity: number;
    }[];
  }): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.apiUrl, data);
  }

  getMyOrders(): Observable<OrdersResponse> {
    return this.http.get<OrdersResponse>(`${this.apiUrl}/my-orders`);
  }

  getOrders(): Observable<OrdersResponse> {
    return this.http.get<OrdersResponse>(this.apiUrl);
  }

  getOrderById(id: string): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.apiUrl}/${id}`);
  }

  deleteOrder(id: string): Observable<{ ok: boolean; message: string }> {
    return this.http.delete<{ ok: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  mapCartItemsToOrderItems(cartItems: CartItem[]): { productId: string; quantity: number }[] {
    return cartItems.map(item => ({
      productId: item.product._id,
      quantity: item.quantity
    }));
  }

  updateOrderStatus(id: string, data: { status: string }) {
    return this.http.patch(`${this.apiUrl}/${id}/status`, data);
  }
}