import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, Role } from '../../shared/models/auth.models';
import { TokenService } from './token.service';
import { Router } from '@angular/router';

export interface User {
  username: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private router = inject(Router);

  private readonly API_URL = `${environment.apiUrl}/auth`;
  
  currentUser = signal<User | null>(null);

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/authenticate`, credentials)
      .pipe(
        tap(response => {
          this.tokenService.setTokens(response.accessToken, response.refreshToken);
          this.loadCurrentUser();
        })
      );
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, data);
  }

  logout(): void {
    this.tokenService.clearTokens();
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.tokenService.getAccessToken();
  }
  
  getUserRole(): Role | null {
    const roles = this.tokenService.getUserRoles();
    if (roles.includes('ADMIN')) return Role.ADMIN;
    if (roles.includes('WAREHOUSE_MANAGER')) return Role.WAREHOUSE_MANAGER;
    if (roles.includes('CLIENT')) return Role.CLIENT;
    return null;
  }
  
  getUser(): User | null {
    return this.currentUser();
  }
  
  private loadCurrentUser(): void {
    const token = this.tokenService.getAccessToken();
    if (!token) {
      this.currentUser.set(null);
      return;
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = this.getUserRole();
      if (role) {
        this.currentUser.set({
          username: payload.sub || payload.preferred_username || 'User',
          role,
          firstName: payload.given_name || payload.firstName || payload.sub || 'User',
          lastName: payload.family_name || payload.lastName,
          email: payload.email
        });
      }
    } catch {
      this.currentUser.set(null);
    }
  }
}
