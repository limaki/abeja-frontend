import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product } from '../models/product.model';

interface ProductsResponse {
  ok: boolean;
  products: Product[];
}

interface ProductResponse {
  ok: boolean;
  message?: string;
  product: Product;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/products`;

  getProducts(filters?: {
    active?: boolean;
    category?: string;
    featured?: boolean;
  }): Observable<ProductsResponse> {
    let params = new HttpParams();

    if (filters?.active !== undefined) {
      params = params.set('active', filters.active);
    }

    if (filters?.category) {
      params = params.set('category', filters.category);
    }

    if (filters?.featured !== undefined) {
      params = params.set('featured', filters.featured);
    }

    return this.http.get<ProductsResponse>(this.apiUrl, { params });
  }

  getFeaturedProducts(): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(`${this.apiUrl}/featured`);
  }

  getProductById(id: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.apiUrl}/${id}`);
  }

  createProduct(formData: FormData): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(this.apiUrl, formData);
  }

  updateProduct(id: string, formData: FormData): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${this.apiUrl}/${id}`, formData);
  }

  deactivateProduct(id: string): Observable<ProductResponse> {
    return this.http.patch<ProductResponse>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  deleteProduct(id: string): Observable<{ ok: boolean; message: string }> {
    return this.http.delete<{ ok: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}