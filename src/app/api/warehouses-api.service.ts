import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Warehouse, Page, PageRequest } from '../shared/models';

@Injectable({
  providedIn: 'root'
})
export class WarehousesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/warehouses`;

  getAll(request?: PageRequest): Observable<Page<Warehouse>> {
    let params = new HttpParams();
    if (request?.page !== undefined) params = params.set('page', request.page);
    if (request?.size !== undefined) params = params.set('size', request.size);
    if (request?.sort) params = params.set('sort', request.sort);
    return this.http.get<Page<Warehouse>>(this.baseUrl, { params });
  }

  getAllActive(): Observable<Warehouse[]> {
    return this.http.get<Warehouse[]>(`${this.baseUrl}/active`);
  }

  getById(id: number): Observable<Warehouse> {
    return this.http.get<Warehouse>(`${this.baseUrl}/${id}`);
  }

  create(warehouse: Warehouse): Observable<Warehouse> {
    return this.http.post<Warehouse>(this.baseUrl, warehouse);
  }

  update(id: number, warehouse: Warehouse): Observable<Warehouse> {
    return this.http.put<Warehouse>(`${this.baseUrl}/${id}`, warehouse);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  activate(id: number): Observable<Warehouse> {
    return this.http.patch<Warehouse>(`${this.baseUrl}/${id}/activate`, {});
  }

  deactivate(id: number): Observable<Warehouse> {
    return this.http.patch<Warehouse>(`${this.baseUrl}/${id}/deactivate`, {});
  }
}
