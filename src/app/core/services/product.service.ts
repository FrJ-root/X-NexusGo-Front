import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product } from '../../shared/models/business.models';
import { Page } from '../../shared/models/page.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/products`;

  getAll(page?: number, size?: number, search?: string): Observable<any> {
    if (page !== undefined && size !== undefined) {
      let params = new HttpParams()
        .set('page', page.toString())
        .set('size', size.toString());
      if (search) params = params.set('search', search);
      return this.http.get<any>(`${this.apiUrl}/active`, { params });
    }
    return this.http.get<Product[]>(this.apiUrl);
  }

  getActivePaginated(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/active`, { params });
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  getBySku(sku: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/sku/${sku}`);
  }

  // Admin only
  create(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  update(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  deactivate(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  activate(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/activate`, {});
  }
}
