import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product, Page, PageRequest } from '../shared/models';

export interface ProductSearchResult {
  sku: string;
  name: string;
  category: string;
  active: boolean;
  availability: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/products`;

  getAll(request?: PageRequest): Observable<Page<Product>> {
    let params = new HttpParams();
    if (request?.page !== undefined) params = params.set('page', request.page);
    if (request?.size !== undefined) params = params.set('size', request.size);
    if (request?.sort) params = params.set('sort', request.sort);
    return this.http.get<Page<Product>>(this.baseUrl, { params });
  }

  getProducts(request?: { page?: number; size?: number; sort?: string; active?: boolean }): Observable<Page<Product>> {
    let params = new HttpParams();
    if (request?.page !== undefined) params = params.set('page', request.page);
    if (request?.size !== undefined) params = params.set('size', request.size);
    if (request?.sort) params = params.set('sort', request.sort);
    if (request?.active !== undefined) params = params.set('active', request.active);
    return this.http.get<Page<Product>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  getBySku(sku: string): Observable<ProductSearchResult> {
    return this.http.get<ProductSearchResult>(`${this.baseUrl}/sku/${sku}`);
  }

  search(filters: {
    sku?: string;
    name?: string;
    category?: string;
    active?: boolean;
  }, request?: PageRequest): Observable<Page<Product>> {
    let params = new HttpParams();
    if (filters.sku) params = params.set('sku', filters.sku);
    if (filters.name) params = params.set('name', filters.name);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.active !== undefined) params = params.set('active', filters.active);
    if (request?.page !== undefined) params = params.set('page', request.page);
    if (request?.size !== undefined) params = params.set('size', request.size);
    if (request?.sort) params = params.set('sort', request.sort);
    return this.http.get<Page<Product>>(`${this.baseUrl}/search`, { params });
  }

  getActiveProducts(request?: PageRequest): Observable<Page<Product>> {
    let params = new HttpParams();
    if (request?.page !== undefined) params = params.set('page', request.page);
    if (request?.size !== undefined) params = params.set('size', request.size);
    if (request?.sort) params = params.set('sort', request.sort);
    return this.http.get<Page<Product>>(`${this.baseUrl}/active`, { params });
  }

  create(product: Product): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, product);
  }

  update(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${id}`, product);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  activate(id: number): Observable<Product> {
    return this.http.patch<Product>(`${this.baseUrl}/${id}/activate`, {});
  }

  deactivate(id: number): Observable<Product> {
    return this.http.patch<Product>(`${this.baseUrl}/${id}/deactivate`, {});
  }
}
