import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Inventory, InventoryMovement, MovementType } from '../../shared/models/business.models';

@Injectable({
    providedIn: 'root'
})
export class InventoryService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/inventory`;

    getInventoryByWarehouse(warehouseId: number): Observable<Inventory[]> {
        return this.http.get<Inventory[]>(`${this.apiUrl}/warehouse/${warehouseId}`);
    }

    getInventoryByProduct(productId: number): Observable<Inventory[]> {
        return this.http.get<Inventory[]>(`${this.apiUrl}/product/${productId}`);
    }

    getInventory(warehouseId: number, productId: number): Observable<Inventory> {
        return this.http.get<Inventory>(`${this.apiUrl}/warehouse/${warehouseId}/product/${productId}`);
    }

    registerInbound(movement: Partial<InventoryMovement>): Observable<InventoryMovement> {
        return this.http.post<InventoryMovement>(`${this.apiUrl}/inbound`, movement);
    }

    registerOutbound(movement: Partial<InventoryMovement>): Observable<InventoryMovement> {
        return this.http.post<InventoryMovement>(`${this.apiUrl}/outbound`, movement);
    }

    adjustStock(movement: Partial<InventoryMovement>): Observable<InventoryMovement> {
        return this.http.post<InventoryMovement>(`${this.apiUrl}/adjustment`, movement);
    }

    getMovements(warehouseId?: number, productId?: number): Observable<InventoryMovement[]> {
        let params = new HttpParams();
        if (warehouseId) params = params.set('warehouseId', warehouseId.toString());
        if (productId) params = params.set('productId', productId.toString());

        return this.http.get<InventoryMovement[]>(`${this.apiUrl}/movements`, { params });
    }
}
