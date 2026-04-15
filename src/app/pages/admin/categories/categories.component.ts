import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit {
  private categoryService = inject(CategoryService);

  categories: any[] = [];
  editingId: string | null = null;

  successMessage = '';
  errorMessage = '';

  form = {
    name: '',
    description: '',
    active: true
  };

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        this.categories = res.categories || [];
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar las categorías';
      }
    });
  }

  submit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.form.name.trim()) {
      this.errorMessage = 'El nombre de la categoría es obligatorio';
      return;
    }

    const payload = {
      name: this.form.name.trim(),
      description: this.form.description.trim(),
      active: this.form.active
    };

    if (this.editingId) {
      this.categoryService.updateCategory(this.editingId, payload).subscribe({
        next: () => {
          this.successMessage = 'Categoría actualizada correctamente';
          this.resetForm();
          this.loadCategories();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'No se pudo actualizar la categoría';
        }
      });
    } else {
      this.categoryService.createCategory(payload).subscribe({
        next: () => {
          this.successMessage = 'Categoría creada correctamente';
          this.resetForm();
          this.loadCategories();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'No se pudo crear la categoría';
        }
      });
    }
  }

  edit(category: any): void {
    this.editingId = category._id;
    this.form = {
      name: category.name || '',
      description: category.description || '',
      active: !!category.active
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleActive(category: any): void {
    this.successMessage = '';
    this.errorMessage = '';

    const payload = {
      name: category.name,
      description: category.description || '',
      active: !category.active
    };

    this.categoryService.updateCategory(category._id, payload).subscribe({
      next: () => {
        this.successMessage = `Categoría ${!category.active ? 'activada' : 'desactivada'} correctamente`;
        this.loadCategories();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'No se pudo cambiar el estado';
      }
    });
  }

  delete(id: string): void {
    this.successMessage = '';
    this.errorMessage = '';

    const ok = confirm('¿Seguro que querés eliminar esta categoría?');
    if (!ok) return;

    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.successMessage = 'Categoría eliminada correctamente';
        if (this.editingId === id) {
          this.resetForm();
        }
        this.loadCategories();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'No se pudo eliminar la categoría';
      }
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.form = {
      name: '',
      description: '',
      active: true
    };
  }
}