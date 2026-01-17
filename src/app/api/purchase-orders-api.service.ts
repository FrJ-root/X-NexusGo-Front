import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  PurchaseOrder, 
  PurchaseOrderLine, 
  PurchaseOrderStatus, 
  PurchaseReceptionBatch,
  Page, 
  PageRequest 
} from '../shared/models';

export interface CreatePurchaseOrderRequest {
  supplierId: number;
  warehouseId: number;
  expectedDeliveryDate?: string;
  lines: CreatePurchaseOrderLineRequest[];
}

export interface CreatePurchaseOrderLineRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
}

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrdersApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/purchase-orders`;

  getAll(request?: PageRequest): Observable<Page<PurchaseOrder>> {
    let params = new HttpParams();
    if (request?.page !== undefined) params = params.set('page', request.page);
    if (request?.size !== undefined) params = params.set('size', request.size);
    if (request?.sort) params = params.set('sort', request.sort);
    return this.http.get<Page<PurchaseOrder>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<PurchaseOrder> {
    return this.http.get<PurchaseOrder>(`${this.baseUrl}/${id}`);
  }

  search(filters: {
    supplierId?: number;
    warehouseId?: number;
    status?: PurchaseOrderStatus;
    startDate?: string;
    endDate?: string;
  }, request?: PageRequest): Observable<Page<PurchaseOrder>> {
    let params = new HttpParams();
    if (filters.supplierId) params = params.set('supplierId', filters.supplierId);
    if (filters.warehouseId) params = params.set('warehouseId', filters.warehouseId);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);
    if (request?.page !== undefined) params = params.set('page', request.page);
    if (request?.size !== undefined) params = params.set('size', request.size);
    if (request?.sort) params = params.set('sort', request.sort);
    return this.http.get<Page<PurchaseOrder>>(`${this.baseUrl}/search`, { params });
  }

  getByStatus(status: PurchaseOrderStatus, request?: PageRequest): Observable<Page<PurchaseOrder>> {
    let params = new HttpParams();
    if (request?.page !== undefined) params = params.set('page', request.page);
    if (request?.size !== undefined) params = params.set('size', request.size);
    if (request?.sort) params = params.set('sort', request.sort);
    return this.http.get<Page<PurchaseOrder>>(`${this.baseUrl}/status/${status}`, { params });
  }

  getBySupplier(supplierId: number, request?: PageRequest): Observable<Page<PurchaseOrder>> {
    let params = new HttpParams();
    if (request?.page !== undefined) params = params.set('page', request.page);
    if (request?.size !== undefined) params = params.set('size', request.size);
    if (request?.sort) params = params.set('sort', request.sort);
    return this.http.get<Page<PurchaseOrder>>(`${this.baseUrl}/supplier/${supplierId}`, { params });
  }

  create(order: CreatePurchaseOrderRequest): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(this.baseUrl, order);
  }

  update(id: number, order: CreatePurchaseOrderRequest): Observable<PurchaseOrder> {
    return this.http.put<PurchaseOrder>(`${this.baseUrl}/${id}`, order);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  approve(id: number): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(`${this.baseUrl}/${id}/approve`, {});
  }

  cancel(id: number): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(`${this.baseUrl}/${id}/cancel`, {});
  }

  receive(id: number, reception: PurchaseReceptionBatch): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(`${this.baseUrl}/${id}/receive`, reception);
  }

  receiveAll(id: number): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(`${this.baseUrl}/${id}/receive-all`, {});
  }

  getLines(orderId: number): Observable<PurchaseOrderLine[]> {
    return this.http.get<PurchaseOrderLine[]>(`${this.baseUrl}/${orderId}/lines`);
  }
}
