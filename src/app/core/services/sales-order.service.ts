import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SalesOrder, OrderStatus } from '../../shared/models/business.models';

@Injectable({
  providedIn: 'root'
})
export class SalesOrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/sales-orders`;

  // Get own orders (Client)
  getMyOrders(page: number = 0, size: number = 10, status?: OrderStatus): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) params = params.set('status', status);

    return this.http.get<any>(this.apiUrl, { params });
  }

  // Create a new order
  createOrder(order: Partial<SalesOrder>): Observable<SalesOrder> {
    return this.http.post<SalesOrder>(this.apiUrl, order);
  }

  // Get Order Details
  getOrderById(id: number): Observable<SalesOrder> {
    return this.http.get<SalesOrder>(`${this.apiUrl}/${id}`);
  }
}
