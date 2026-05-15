import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit {
  private categoryService = inject(CategoryService);

  categories: Category[] = [];
  editingId: string | null = null;

  successMessage = '';
  errorMessage = '';

  loading = false;
  saving = false;

  selectedImageFile: File | null = null;
  imagePreview: string | null = null;

  form = {
    name: '',
    description: '',
    active: true
  };

  ngOnInit(): void {
    console.log('[FRONT CATEGORY] ngOnInit');
    this.loadCategories();
  }

  loadCategories(): void {
    console.log('[FRONT CATEGORY] loadCategories INICIO');

    this.loading = true;
    this.errorMessage = '';

    this.categoryService.getCategories().subscribe({
      next: (res) => {
        console.log('[FRONT CATEGORY] loadCategories respuesta:', res);

        this.categories = res.categories || [];

        console.log('[FRONT CATEGORY] categorías cargadas:', this.categories.length);

        this.loading = false;
      },
      error: (err) => {
        console.error('[FRONT CATEGORY] Error cargando categorías:', err);
        console.error('[FRONT CATEGORY] Respuesta backend:', err?.error);

        this.errorMessage = err?.error?.message || 'No se pudieron cargar las categorías';
        this.loading = false;
      }
    });
  }

  onImageSelected(event: Event): void {
    console.log('[FRONT CATEGORY] onImageSelected');

    this.errorMessage = '';

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    console.log('[FRONT CATEGORY] archivo seleccionado:', file);

    if (!file) {
      this.selectedImageFile = null;
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'El archivo seleccionado debe ser una imagen';
      this.selectedImageFile = null;
      this.imagePreview = null;
      input.value = '';
      return;
    }

    const maxSizeMb = 5;
    const maxSizeBytes = maxSizeMb * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      this.errorMessage = `La imagen no puede pesar más de ${maxSizeMb}MB`;
      this.selectedImageFile = null;
      this.imagePreview = null;
      input.value = '';
      return;
    }

    this.selectedImageFile = file;

    console.log('[FRONT CATEGORY] selectedImageFile seteado:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    const reader = new FileReader();

    reader.onload = () => {
      this.imagePreview = reader.result as string;
      console.log('[FRONT CATEGORY] imagePreview generado');
    };

    reader.readAsDataURL(file);
  }

  submit(): void {
    console.log('==============================');
    console.log('[FRONT CATEGORY] SUBMIT INICIO');
    console.log('[FRONT CATEGORY] editingId:', this.editingId);
    console.log('[FRONT CATEGORY] form:', this.form);
    console.log('[FRONT CATEGORY] selectedImageFile:', this.selectedImageFile);

    this.successMessage = '';
    this.errorMessage = '';

    if (!this.form.name.trim()) {
      this.errorMessage = 'El nombre de la categoría es obligatorio';
      console.log('[FRONT CATEGORY] ERROR: nombre vacío');
      console.log('==============================');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.form.name.trim());
    formData.append('description', this.form.description.trim());
    formData.append('active', String(this.form.active));

    if (this.selectedImageFile) {
      formData.append('image', this.selectedImageFile);
    }

    console.log('[FRONT CATEGORY] FormData enviado:');

    formData.forEach((value, key) => {
      console.log('[FRONT CATEGORY] FormData item:', key, value);
    });

    this.saving = true;

    if (this.editingId) {
      console.log('[FRONT CATEGORY] MODO UPDATE');
      console.log('[FRONT CATEGORY] Enviando PUT id:', this.editingId);

      this.categoryService.updateCategory(this.editingId, formData).subscribe({
        next: (res) => {
          console.log('[FRONT CATEGORY] UPDATE OK:', res);
          console.log('==============================');

          this.successMessage = 'Categoría actualizada correctamente';
          this.saving = false;
          this.resetForm();
          this.loadCategories();
        },
        error: (err) => {
          console.error('[FRONT CATEGORY] Error al actualizar categoría:', err);
          console.error('[FRONT CATEGORY] STATUS:', err?.status);
          console.error('[FRONT CATEGORY] URL:', err?.url);
          console.error('[FRONT CATEGORY] Respuesta backend:', err?.error);
          console.error('==============================');

          this.errorMessage =
            err?.error?.message ||
            err?.error?.detail ||
            'No se pudo actualizar la categoría';

          this.saving = false;
        }
      });

      return;
    }

    console.log('[FRONT CATEGORY] MODO CREATE');

    this.categoryService.createCategory(formData).subscribe({
      next: (res) => {
        console.log('[FRONT CATEGORY] CREATE OK:', res);
        console.log('==============================');

        this.successMessage = 'Categoría creada correctamente';
        this.saving = false;
        this.resetForm();
        this.loadCategories();
      },
      error: (err) => {
        console.error('[FRONT CATEGORY] Error al crear categoría:', err);
        console.error('[FRONT CATEGORY] STATUS:', err?.status);
        console.error('[FRONT CATEGORY] URL:', err?.url);
        console.error('[FRONT CATEGORY] Respuesta backend:', err?.error);
        console.error('==============================');

        this.errorMessage =
          err?.error?.message ||
          err?.error?.detail ||
          'No se pudo crear la categoría';

        this.saving = false;
      }
    });
  }

  edit(category: Category): void {
    console.log('[FRONT CATEGORY] edit:', category);

    this.successMessage = '';
    this.errorMessage = '';

    this.editingId = category._id;

    this.form = {
      name: category.name || '',
      description: category.description || '',
      active: !!category.active
    };

    this.selectedImageFile = null;
    this.imagePreview = category.image || null;

    this.clearImageInput();

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  toggleActive(category: Category): void {
    console.log('[FRONT CATEGORY] toggleActive:', category);

    this.successMessage = '';
    this.errorMessage = '';

    const formData = new FormData();
    formData.append('name', category.name);
    formData.append('description', category.description || '');
    formData.append('active', String(!category.active));

    console.log('[FRONT CATEGORY] toggleActive FormData:');

    formData.forEach((value, key) => {
      console.log('[FRONT CATEGORY] FormData item:', key, value);
    });

    this.categoryService.updateCategory(category._id, formData).subscribe({
      next: (res) => {
        console.log('[FRONT CATEGORY] toggleActive OK:', res);

        this.successMessage = `Categoría ${!category.active ? 'activada' : 'desactivada'} correctamente`;
        this.loadCategories();
      },
      error: (err) => {
        console.error('[FRONT CATEGORY] Error al cambiar estado:', err);
        console.error('[FRONT CATEGORY] Respuesta backend:', err?.error);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.detail ||
          'No se pudo cambiar el estado';
      }
    });
  }

  delete(id: string): void {
    console.log('[FRONT CATEGORY] delete id:', id);

    this.successMessage = '';
    this.errorMessage = '';

    const ok = confirm('¿Seguro que querés eliminar esta categoría?');

    if (!ok) {
      console.log('[FRONT CATEGORY] delete cancelado');
      return;
    }

    this.categoryService.deleteCategory(id).subscribe({
      next: (res) => {
        console.log('[FRONT CATEGORY] DELETE OK:', res);

        this.successMessage = 'Categoría eliminada correctamente';

        if (this.editingId === id) {
          this.resetForm();
        }

        this.loadCategories();
      },
      error: (err) => {
        console.error('[FRONT CATEGORY] Error al eliminar categoría:', err);
        console.error('[FRONT CATEGORY] Respuesta backend:', err?.error);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.detail ||
          'No se pudo eliminar la categoría';
      }
    });
  }

  resetForm(): void {
    console.log('[FRONT CATEGORY] resetForm');

    this.editingId = null;

    this.form = {
      name: '',
      description: '',
      active: true
    };

    this.selectedImageFile = null;
    this.imagePreview = null;

    this.clearImageInput();
  }

  clearImageInput(): void {
    const input = document.getElementById('image') as HTMLInputElement | null;

    if (input) {
      input.value = '';
    }
  }

  trackByCategory(index: number, category: Category): string {
    return category._id;
  }
}