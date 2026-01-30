import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ReportingService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/reporting`;

    getGlobalStats(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/stats`);
    }

    getInventoryStatus(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/inventory-status`);
    }

    getDeliveryPerformance(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/delivery-performance`);
    }
}
