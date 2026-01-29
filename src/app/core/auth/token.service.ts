import { Injectable } from '@angular/core';
import { Role } from '../../shared/models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  getUserRoles(): Role[] {
    const token = this.getAccessToken();
    if (!token) return [];

    // Decode JWT payload (simple version)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Spring Security usually puts roles in 'roles' or 'authorities'
      // Adjust based on your backend JWT structure
      const roles = payload.roles || payload.authorities || [];
      return roles.map((r: string) => r.replace('ROLE_', '') as Role);
    } catch (e) {
      return [];
    }
  }
}
