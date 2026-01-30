import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';
import { LoginRequest, RegisterRequest, AuthResponse, Role } from '../../shared/models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;

  // Signals for reactive UI updates
  currentUserRole = signal<Role[]>(this.tokenService.getUserRoles());

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/authenticate`, credentials).pipe(
      tap(response => {
        console.log('AuthService: Login response:', response);
        this.tokenService.setTokens(response.accessToken, response.refreshToken);
        const roles = this.tokenService.getUserRoles();
        this.currentUserRole.set(roles);
        console.log('AuthService: User roles after login:', roles);
      })
    );
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  logout(): void {
    this.tokenService.clearTokens();
    this.currentUserRole.set([]);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.tokenService.getAccessToken();
  }

  getUserRole(): Role[] {
    return this.currentUserRole();
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.tokenService.getRefreshToken();
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token`, { refreshToken }).pipe(
      tap(response => this.tokenService.setTokens(response.accessToken, response.refreshToken))
    );
  }
}
