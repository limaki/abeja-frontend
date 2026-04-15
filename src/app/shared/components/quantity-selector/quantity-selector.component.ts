import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quantity-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quantity-selector.component.html',
  styleUrl: './quantity-selector.component.css'
})
export class QuantitySelectorComponent {
  @Input() quantity: number = 1;
  @Input() min: number = 1;
  @Input() max: number = 99;

  @Output() quantityChange = new EventEmitter<number>();

  decrease(): void {
    if (this.quantity > this.min) {
      this.quantity--;
      this.quantityChange.emit(this.quantity);
    }
  }

  increase(): void {
    if (this.quantity < this.max) {
      this.quantity++;
      this.quantityChange.emit(this.quantity);
    }
  }
}