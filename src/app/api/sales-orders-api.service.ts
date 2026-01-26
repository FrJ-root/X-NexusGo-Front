import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SalesOrder, SalesOrderLine, OrderStatus, Page, PageRequest, ReservationResult } from '../shared/models';

export interface CreateSalesOrderRequest {
  clientId?: number;
  lines: CreateSalesOrderLineRequest[];
}

export interface CreateSalesOrderLineRequest {
  productId?: number;
  productSku?: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class SalesOrdersApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/sales-orders`;

  getAll(request?: PageRequest): Observable<Page<SalesOrder>> {
    let params = new HttpParams();
    if (request?.page !== undefined) params = params.set('page', request.page);
    if (request?.size !== undefined) params = params.set('size', request.size);
    if (request?.sort) params = params.set('sort', request.sort);
    return this.http.get<Page<SalesOrder>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<SalesOrder> {
    return this.http.get<SalesOrder>(`${this.baseUrl}/${id}`);
  }

  search(filters: {
    clientId?: number;
    status?: OrderStatus;
    startDate?: string;
    endDate?: string;
  }, request?: PageRequest): Observable<Page<SalesOrder>> {
    let params = new HttpParams();
    if (filters.clientId) params = params.set('clientId', filters.clientId);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);
    if (request?.page !== undefined) params = params.set('page', request.page);
    if (request?.size !== undefined) params = params.set('size', request.size);
    if (request?.sort) params = params.set('sort', request.sort);
    return this.http.get<Page<SalesOrder>>(`${this.baseUrl}/search`, { params });
  }

  getByStatus(status: OrderStatus, request?: PageRequest): Observable<Page<SalesOrder>> {
    let params = new HttpParams();
    if (request?.page !== undefined) params = params.set('page', request.page);
    if (request?.size !== undefined) params = params.set('size', request.size);
    if (request?.sort) params = params.set('sort', request.sort);
    return this.http.get<Page<SalesOrder>>(`${this.baseUrl}/status/${status}`, { params });
  }

  getMyOrders(request?: PageRequest & { status?: OrderStatus }): Observable<Page<SalesOrder>> {
    let params = new HttpParams();
    if (request?.page !== undefined) params = params.set('page', request.page);
    if (request?.size !== undefined) params = params.set('size', request.size);
    if (request?.sort) params = params.set('sort', request.sort);
    if (request?.status) params = params.set('status', request.status);
    return this.http.get<Page<SalesOrder>>(`${this.baseUrl}/my-orders`, { params });
  }

  create(order: CreateSalesOrderRequest): Observable<SalesOrder> {
    return this.http.post<SalesOrder>(this.baseUrl, order);
  }

  confirm(id: number): Observable<SalesOrder> {
    return this.http.post<SalesOrder>(`${this.baseUrl}/${id}/confirm`, {});
  }

  reserve(id: number, allowPartial: boolean = false): Observable<SalesOrder> {
    let params = new HttpParams();
    params = params.set('allowPartial', allowPartial);
    return this.http.post<SalesOrder>(`${this.baseUrl}/${id}/reserve`, {}, { params });
  }

  reserveStock(id: number, allowPartial: boolean = false): Observable<SalesOrder> {
    let params = new HttpParams();
    params = params.set('allowPartial', allowPartial);
    return this.http.post<SalesOrder>(`${this.baseUrl}/${id}/reserve-stock`, {}, { params });
  }

  cancel(id: number): Observable<SalesOrder> {
    return this.http.post<SalesOrder>(`${this.baseUrl}/${id}/cancel`, {});
  }

  getOrderLines(orderId: number): Observable<SalesOrderLine[]> {
    return this.http.get<SalesOrderLine[]>(`${this.baseUrl}/${orderId}/lines`);
  }

  countByStatus(status: OrderStatus): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count/status/${status}`);
  }

  getOrdersToReserve(): Observable<SalesOrder[]> {
    return this.http.get<SalesOrder[]>(`${this.baseUrl}/to-reserve`);
  }
}
