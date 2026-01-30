import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../shared/models/business.models';
import { Page } from '../../shared/models/page.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/users`;

    getAll(page: number = 0, size: number = 10): Observable<Page<User>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        return this.http.get<Page<User>>(this.apiUrl, { params });
    }

    getById(id: number): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/${id}`);
    }

    updateUser(id: number, user: Partial<User>): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/${id}`, user);
    }

    toggleActive(id: number): Observable<User> {
        return this.http.patch<User>(`${this.apiUrl}/${id}/toggle-active`, {});
    }
}
