import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category } from '../models/category.model';

interface CategoriesResponse {
  ok: boolean;
  categories: Category[];
}

interface CategoryResponse {
  ok: boolean;
  message?: string;
  category: Category;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/categories`;

  getCategories(active?: boolean): Observable<CategoriesResponse> {
    let url = this.apiUrl;

    if (active !== undefined) {
      url += `?active=${active}`;
    }

    return this.http.get<CategoriesResponse>(url);
  }

  getCategoryById(id: string): Observable<CategoryResponse> {
    return this.http.get<CategoryResponse>(`${this.apiUrl}/${id}`);
  }

  createCategory(data: { name: string; description: string }): Observable<CategoryResponse> {
    return this.http.post<CategoryResponse>(this.apiUrl, data);
  }

  updateCategory(id: string, data: { name?: string; description?: string; active?: boolean }): Observable<CategoryResponse> {
    return this.http.put<CategoryResponse>(`${this.apiUrl}/${id}`, data);
  }

  deactivateCategory(id: string): Observable<CategoryResponse> {
    return this.http.patch<CategoryResponse>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  deleteCategory(id: string): Observable<{ ok: boolean; message: string }> {
    return this.http.delete<{ ok: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}