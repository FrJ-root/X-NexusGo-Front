import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Shipment, ShipmentStatus } from '../../shared/models/business.models';
import { Page } from '../../shared/models/page.model';

@Injectable({
    providedIn: 'root'
})
export class ShipmentService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/shipments`;

    getAll(page: number = 0, size: number = 10): Observable<Page<Shipment>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        return this.http.get<Page<Shipment>>(this.apiUrl, { params });
    }

    getById(id: number): Observable<Shipment> {
        return this.http.get<Shipment>(`${this.apiUrl}/${id}`);
    }

    getBySalesOrder(orderId: number): Observable<Shipment> {
        return this.http.get<Shipment>(`${this.apiUrl}/order/${orderId}`);
    }

    create(shipment: Partial<Shipment>): Observable<Shipment> {
        return this.http.post<Shipment>(this.apiUrl, shipment);
    }

    updateStatus(id: number, status: ShipmentStatus): Observable<Shipment> {
        return this.http.patch<Shipment>(`${this.apiUrl}/${id}/status`, { status });
    }

    getClientShipments(page: number = 0, size: number = 10): Observable<Page<Shipment>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        return this.http.get<Page<Shipment>>(`${this.apiUrl}/client`, { params });
    }
}
