import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: any[] = [];

  getItems(): any[] {
    return this.items;
  }

  addToCart(product: Product, quantity: number = 1): void {
    const existing = this.items.find(i => i._id === product._id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({
        ...product,
        quantity
      });
    }
  }

  updateQuantity(productId: string, quantity: number): void {
    const item = this.items.find(i => i._id === productId);
    if (!item) return;

    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    item.quantity = quantity;
  }

  isInCart(productId: string): boolean {
    return this.items.some(i => i._id === productId);
  }

  getQuantityInCart(productId: string): number {
    const item = this.items.find(i => i._id === productId);
    return item ? item.quantity : 0;
  }

  removeItem(productId: string): void {
    this.items = this.items.filter(i => i._id !== productId);
  }

  clearCart(): void {
    this.items = [];
  }

  getTotal(): number {
    return this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  getSubtotal(): number {
    return this.getTotal();
  }

  getShipping(): number {
    return this.items.length > 0 ? 0 : 0;
  }

  getFinalTotal(): number {
    return this.getSubtotal() + this.getShipping();
  }

  getTotalItems(): number {
    return this.items.reduce((acc, item) => acc + item.quantity, 0);
  }

hasItems(): boolean {
  return this.getTotalItems() > 0;
}
}