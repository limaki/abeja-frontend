import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  errorName?: string;
  detail?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/categories`;

  getCategories(active?: boolean): Observable<CategoriesResponse> {
    console.log('[CATEGORY SERVICE] getCategories active:', active);
    console.log('[CATEGORY SERVICE] URL:', this.apiUrl);

    let params = new HttpParams();

    if (active !== undefined) {
      params = params.set('active', String(active));
    }

    return this.http.get<CategoriesResponse>(this.apiUrl, { params });
  }

  getCategoryById(id: string): Observable<CategoryResponse> {
    console.log('[CATEGORY SERVICE] getCategoryById id:', id);
    console.log('[CATEGORY SERVICE] URL:', `${this.apiUrl}/${id}`);

    return this.http.get<CategoryResponse>(`${this.apiUrl}/${id}`);
  }

  createCategory(data: FormData): Observable<CategoryResponse> {
    console.log('[CATEGORY SERVICE] createCategory');
    console.log('[CATEGORY SERVICE] URL:', this.apiUrl);

    return this.http.post<CategoryResponse>(this.apiUrl, data);
  }

  updateCategory(id: string, data: FormData): Observable<CategoryResponse> {
    console.log('[CATEGORY SERVICE] updateCategory id:', id);
    console.log('[CATEGORY SERVICE] URL:', `${this.apiUrl}/${id}`);

    return this.http.put<CategoryResponse>(`${this.apiUrl}/${id}`, data);
  }

  deactivateCategory(id: string): Observable<CategoryResponse> {
    console.log('[CATEGORY SERVICE] deactivateCategory id:', id);
    console.log('[CATEGORY SERVICE] URL:', `${this.apiUrl}/${id}/deactivate`);

    return this.http.patch<CategoryResponse>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  deleteCategory(id: string): Observable<{ ok: boolean; message: string }> {
    console.log('[CATEGORY SERVICE] deleteCategory id:', id);
    console.log('[CATEGORY SERVICE] URL:', `${this.apiUrl}/${id}`);

    return this.http.delete<{ ok: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}