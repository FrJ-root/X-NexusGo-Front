import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Inventory, Page, PageRequest } from '../shared/models';

@Injectable({
  providedIn: 'root'
})
export class InventoryApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/inventory`;

  getAll(request?: PageRequest): Observable<Page<Inventory>> {
    let params = new HttpParams();
    if (request?.page !== undefined) params = params.set('page', request.page);
    if (request?.size !== undefined) params = params.set('size', request.size);
    if (request?.sort) params = params.set('sort', request.sort);
    return this.http.get<Page<Inventory>>(this.baseUrl, { params });
  }

  getByWarehouse(warehouseId: number, request?: PageRequest): Observable<Page<Inventory>> {
    let params = new HttpParams();
    if (request?.page !== undefined) params = params.set('page', request.page);
    if (request?.size !== undefined) params = params.set('size', request.size);
    if (request?.sort) params = params.set('sort', request.sort);
    return this.http.get<Page<Inventory>>(`${this.baseUrl}/warehouse/${warehouseId}`, { params });
  }

  getByProduct(productId: number): Observable<Inventory[]> {
    return this.http.get<Inventory[]>(`${this.baseUrl}/product/${productId}`);
  }

  getByWarehouseAndProduct(warehouseId: number, productId: number): Observable<Inventory> {
    return this.http.get<Inventory>(`${this.baseUrl}/warehouse/${warehouseId}/product/${productId}`);
  }

  search(filters: {
    warehouseId?: number;
    productId?: number;
    sku?: string;
    category?: string;
    lowStock?: boolean;
  }, request?: PageRequest): Observable<Page<Inventory>> {
    let params = new HttpParams();
    if (filters.warehouseId) params = params.set('warehouseId', filters.warehouseId);
    if (filters.productId) params = params.set('productId', filters.productId);
    if (filters.sku) params = params.set('sku', filters.sku);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.lowStock !== undefined) params = params.set('lowStock', filters.lowStock);
    if (request?.page !== undefined) params = params.set('page', request.page);
    if (request?.size !== undefined) params = params.set('size', request.size);
    if (request?.sort) params = params.set('sort', request.sort);
    return this.http.get<Page<Inventory>>(`${this.baseUrl}/search`, { params });
  }

  getStockOutages(): Observable<Inventory[]> {
    return this.http.get<Inventory[]>(`${this.baseUrl}/outages`);
  }

  getAvailability(productId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/availability/${productId}`);
  }

  getAvailabilityByWarehouse(warehouseId: number, productId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/availability/warehouse/${warehouseId}/product/${productId}`);
  }
}
