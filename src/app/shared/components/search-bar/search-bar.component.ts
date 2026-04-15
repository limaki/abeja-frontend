import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent {
  @Input() placeholder: string = 'Buscar productos...';
  @Input() value: string = '';

  @Output() valueChange = new EventEmitter<string>();
  @Output() search = new EventEmitter<string>();

  onInputChange(): void {
    this.valueChange.emit(this.value);
  }

  onSubmit(): void {
    this.search.emit(this.value.trim());
  }

  clearSearch(): void {
    this.value = '';
    this.valueChange.emit(this.value);
    this.search.emit(this.value);
  }
}