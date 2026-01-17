import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, Page, PageRequest } from '../shared/models';

@Injectable({
  providedIn: 'root'
})
export class UsersApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  getAll(request?: PageRequest): Observable<Page<User>> {
    let params = new HttpParams();
    if (request?.page !== undefined) params = params.set('page', request.page);
    if (request?.size !== undefined) params = params.set('size', request.size);
    if (request?.sort) params = params.set('sort', request.sort);
    return this.http.get<Page<User>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  getByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/email/${email}`);
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/me`);
  }

  search(filters: {
    name?: string;
    email?: string;
    role?: string;
    enabled?: boolean;
  }, request?: PageRequest): Observable<Page<User>> {
    let params = new HttpParams();
    if (filters.name) params = params.set('name', filters.name);
    if (filters.email) params = params.set('email', filters.email);
    if (filters.role) params = params.set('role', filters.role);
    if (filters.enabled !== undefined) params = params.set('enabled', filters.enabled);
    if (request?.page !== undefined) params = params.set('page', request.page);
    if (request?.size !== undefined) params = params.set('size', request.size);
    if (request?.sort) params = params.set('sort', request.sort);
    return this.http.get<Page<User>>(`${this.baseUrl}/search`, { params });
  }

  create(user: User): Observable<User> {
    return this.http.post<User>(this.baseUrl, user);
  }

  update(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, user);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  enable(id: number): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${id}/enable`, {});
  }

  disable(id: number): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${id}/disable`, {});
  }

  changeRole(id: number, role: string): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${id}/role`, { role });
  }
}
