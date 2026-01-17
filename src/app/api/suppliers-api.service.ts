import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Supplier, Page, PageRequest, PurchaseOrder } from '../shared/models';

@Injectable({
  providedIn: 'root'
})
export class SuppliersApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/suppliers`;

  getAll(request?: PageRequest): Observable<Page<Supplier>> {
    let params = new HttpParams();
    if (request?.page !== undefined) params = params.set('page', request.page);
    if (request?.size !== undefined) params = params.set('size', request.size);
    if (request?.sort) params = params.set('sort', request.sort);
    return this.http.get<Page<Supplier>>(this.baseUrl, { params });
  }

  getAllActive(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.baseUrl}/active`);
  }

  getById(id: number): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.baseUrl}/${id}`);
  }

  search(filters: {
    name?: string;
    email?: string;
    active?: boolean;
  }, request?: PageRequest): Observable<Page<Supplier>> {
    let params = new HttpParams();
    if (filters.name) params = params.set('name', filters.name);
    if (filters.email) params = params.set('email', filters.email);
    if (filters.active !== undefined) params = params.set('active', filters.active);
    if (request?.page !== undefined) params = params.set('page', request.page);
    if (request?.size !== undefined) params = params.set('size', request.size);
    if (request?.sort) params = params.set('sort', request.sort);
    return this.http.get<Page<Supplier>>(`${this.baseUrl}/search`, { params });
  }

  create(supplier: Supplier): Observable<Supplier> {
    return this.http.post<Supplier>(this.baseUrl, supplier);
  }

  update(id: number, supplier: Supplier): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.baseUrl}/${id}`, supplier);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  activate(id: number): Observable<Supplier> {
    return this.http.patch<Supplier>(`${this.baseUrl}/${id}/activate`, {});
  }

  deactivate(id: number): Observable<Supplier> {
    return this.http.patch<Supplier>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  getPurchaseOrders(supplierId: number): Observable<PurchaseOrder[]> {
    return this.http.get<PurchaseOrder[]>(`${this.baseUrl}/${supplierId}/purchase-orders`);
  }
}
