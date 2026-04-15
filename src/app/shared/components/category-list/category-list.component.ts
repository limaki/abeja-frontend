import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css'
})
export class CategoryListComponent {
  @Input() categories: any[] = [];
  @Input() selectedCategory: string = '';

  @Output() categorySelected = new EventEmitter<string>();

  selectCategory(categoryId: string): void {
    this.categorySelected.emit(categoryId);
  }

  selectAll(): void {
    this.categorySelected.emit('');
  }
}