import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Shipment, ShipmentStatus, Page, PageRequest, Carrier } from '../shared/models';

export interface CreateShipmentRequest {
  salesOrderId: number;
  carrierId: number;
  plannedDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShipmentsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/shipments`;
  private readonly carrierUrl = `${environment.apiUrl}/carriers`;

  getAll(request?: PageRequest): Observable<Page<Shipment>> {
    let params = new HttpParams();
    if (request?.page !== undefined) params = params.set('page', request.page);
    if (request?.size !== undefined) params = params.set('size', request.size);
    if (request?.sort) params = params.set('sort', request.sort);
    return this.http.get<Page<Shipment>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Shipment> {
    return this.http.get<Shipment>(`${this.baseUrl}/${id}`);
  }

  search(filters: {
    salesOrderId?: number;
    carrierId?: number;
    status?: ShipmentStatus;
    startDate?: string;
    endDate?: string;
    trackingNumber?: string;
  }, request?: PageRequest): Observable<Page<Shipment>> {
    let params = new HttpParams();
    if (filters.salesOrderId) params = params.set('salesOrderId', filters.salesOrderId);
    if (filters.carrierId) params = params.set('carrierId', filters.carrierId);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);
    if (filters.trackingNumber) params = params.set('trackingNumber', filters.trackingNumber);
    if (request?.page !== undefined) params = params.set('page', request.page);
    if (request?.size !== undefined) params = params.set('size', request.size);
    if (request?.sort) params = params.set('sort', request.sort);
    return this.http.get<Page<Shipment>>(`${this.baseUrl}/search`, { params });
  }

  getByStatus(status: ShipmentStatus, request?: PageRequest): Observable<Page<Shipment>> {
    let params = new HttpParams();
    if (request?.page !== undefined) params = params.set('page', request.page);
    if (request?.size !== undefined) params = params.set('size', request.size);
    if (request?.sort) params = params.set('sort', request.sort);
    return this.http.get<Page<Shipment>>(`${this.baseUrl}/status/${status}`, { params });
  }

  getBySalesOrder(salesOrderId: number): Observable<Shipment[]> {
    return this.http.get<Shipment[]>(`${this.baseUrl}/order/${salesOrderId}`);
  }

  getMyShipments(request?: PageRequest): Observable<Page<Shipment>> {
    let params = new HttpParams();
    if (request?.page !== undefined) params = params.set('page', request.page);
    if (request?.size !== undefined) params = params.set('size', request.size);
    if (request?.sort) params = params.set('sort', request.sort);
    return this.http.get<Page<Shipment>>(`${this.baseUrl}/my-shipments`, { params });
  }

  getPlannedToday(): Observable<Shipment[]> {
    return this.http.get<Shipment[]>(`${this.baseUrl}/planned/today`);
  }

  getPlannedTomorrow(): Observable<Shipment[]> {
    return this.http.get<Shipment[]>(`${this.baseUrl}/planned/tomorrow`);
  }

  create(shipment: CreateShipmentRequest): Observable<Shipment> {
    return this.http.post<Shipment>(this.baseUrl, shipment);
  }

  updateStatus(id: number, status: ShipmentStatus): Observable<Shipment> {
    return this.http.patch<Shipment>(`${this.baseUrl}/${id}/status`, { status });
  }

  markInTransit(id: number): Observable<Shipment> {
    return this.http.post<Shipment>(`${this.baseUrl}/${id}/ship`, {});
  }

  markDelivered(id: number): Observable<Shipment> {
    return this.http.post<Shipment>(`${this.baseUrl}/${id}/deliver`, {});
  }

  getByTracking(trackingNumber: string): Observable<Shipment> {
    return this.http.get<Shipment>(`${this.baseUrl}/tracking/${trackingNumber}`);
  }

  // Carrier endpoints
  getAllCarriers(): Observable<Carrier[]> {
    return this.http.get<Carrier[]>(this.carrierUrl);
  }

  getActiveCarriers(): Observable<Carrier[]> {
    return this.http.get<Carrier[]>(`${this.carrierUrl}/active`);
  }

  // Slot capacity
  getSlotCapacity(date: string): Observable<{ capacity: number; used: number; available: number }> {
    return this.http.get<{ capacity: number; used: number; available: number }>(`${this.baseUrl}/slots/${date}`);
  }
}
