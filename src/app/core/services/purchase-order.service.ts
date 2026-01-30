import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PurchaseOrder, PurchaseOrderStatus } from '../../shared/models/business.models';

@Injectable({
    providedIn: 'root'
})
export class PurchaseOrderService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/purchase-orders`;

    getAll(page: number = 0, size: number = 10): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        return this.http.get<any>(this.apiUrl, { params });
    }

    getById(id: number): Observable<PurchaseOrder> {
        return this.http.get<PurchaseOrder>(`${this.apiUrl}/${id}`);
    }

    create(order: Partial<PurchaseOrder>): Observable<PurchaseOrder> {
        return this.http.post<PurchaseOrder>(this.apiUrl, order);
    }

    approve(id: number): Observable<PurchaseOrder> {
        return this.http.put<PurchaseOrder>(`${this.apiUrl}/${id}/approve`, {});
    }

    receive(receptionBatch: any): Observable<PurchaseOrder> {
        return this.http.post<PurchaseOrder>(`${this.apiUrl}/receive`, receptionBatch);
    }
}
