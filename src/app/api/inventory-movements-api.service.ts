import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { InventoryMovement, MovementType, Page, PageRequest } from '../shared/models';

export interface CreateMovementRequest {
  productId: number;
  warehouseId: number;
  movementType: MovementType;
  quantity: number;
  reason?: string;
  referenceId?: number;
  referenceType?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryMovementsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/inventory/movements`;

  getAll(request?: PageRequest): Observable<Page<InventoryMovement>> {
    let params = new HttpParams();
    if (request?.page !== undefined) params = params.set('page', request.page);
    if (request?.size !== undefined) params = params.set('size', request.size);
    if (request?.sort) params = params.set('sort', request.sort);
    return this.http.get<Page<InventoryMovement>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<InventoryMovement> {
    return this.http.get<InventoryMovement>(`${this.baseUrl}/${id}`);
  }

  search(filters: {
    warehouseId?: number;
    productId?: number;
    sku?: string;
    movementType?: MovementType;
    startDate?: string;
    endDate?: string;
  }, request?: PageRequest): Observable<Page<InventoryMovement>> {
    let params = new HttpParams();
    if (filters.warehouseId) params = params.set('warehouseId', filters.warehouseId);
    if (filters.productId) params = params.set('productId', filters.productId);
    if (filters.sku) params = params.set('sku', filters.sku);
    if (filters.movementType) params = params.set('movementType', filters.movementType);
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);
    if (request?.page !== undefined) params = params.set('page', request.page);
    if (request?.size !== undefined) params = params.set('size', request.size);
    if (request?.sort) params = params.set('sort', request.sort);
    return this.http.get<Page<InventoryMovement>>(`${this.baseUrl}/search`, { params });
  }

  getByWarehouse(warehouseId: number, request?: PageRequest): Observable<Page<InventoryMovement>> {
    let params = new HttpParams();
    if (request?.page !== undefined) params = params.set('page', request.page);
    if (request?.size !== undefined) params = params.set('size', request.size);
    if (request?.sort) params = params.set('sort', request.sort);
    return this.http.get<Page<InventoryMovement>>(`${this.baseUrl}/warehouse/${warehouseId}`, { params });
  }

  getByProduct(productId: number, request?: PageRequest): Observable<Page<InventoryMovement>> {
    let params = new HttpParams();
    if (request?.page !== undefined) params = params.set('page', request.page);
    if (request?.size !== undefined) params = params.set('size', request.size);
    if (request?.sort) params = params.set('sort', request.sort);
    return this.http.get<Page<InventoryMovement>>(`${this.baseUrl}/product/${productId}`, { params });
  }

  create(movement: CreateMovementRequest): Observable<InventoryMovement> {
    return this.http.post<InventoryMovement>(this.baseUrl, movement);
  }
}
