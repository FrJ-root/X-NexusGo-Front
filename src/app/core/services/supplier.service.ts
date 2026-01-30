import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Supplier } from '../../shared/models/business.models';

@Injectable({
    providedIn: 'root'
})
export class SupplierService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/suppliers`;

    getAll(): Observable<Supplier[]> {
        return this.http.get<Supplier[]>(this.apiUrl);
    }

    getById(id: number): Observable<Supplier> {
        return this.http.get<Supplier>(`${this.apiUrl}/${id}`);
    }

    create(supplier: Partial<Supplier>): Observable<Supplier> {
        return this.http.post<Supplier>(this.apiUrl, supplier);
    }

    update(id: number, supplier: Partial<Supplier>): Observable<Supplier> {
        return this.http.put<Supplier>(`${this.apiUrl}/${id}`, supplier);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    toggleActive(id: number): Observable<Supplier> {
        return this.http.patch<Supplier>(`${this.apiUrl}/${id}/toggle-active`, {});
    }
}
