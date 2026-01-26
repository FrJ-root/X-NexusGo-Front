import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private readonly ACCESS_KEY = 'access_token';
  private readonly REFRESH_KEY = 'refresh_token';

  constructor() { }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_KEY, accessToken);
    localStorage.setItem(this.REFRESH_KEY, refreshToken);
  }

  getAccessToken(): string | null {
    const token = localStorage.getItem(this.ACCESS_KEY);
    // Check if token is expired
    if (token && this.isTokenExpired(token)) {
      return null; // Return null if expired, will trigger re-auth
    }
    return token;
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return false;
      // Check if token expires in less than 30 seconds
      const expiresAt = payload.exp * 1000;
      return Date.now() >= expiresAt - 30000;
    } catch {
      return true; // If we can't decode, consider it expired
    }
  }

  getUserRoles(): string[] {
      const token = localStorage.getItem(this.ACCESS_KEY);
      if (!token) return [];

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));

        if (payload.realm_access?.roles) {
          return payload.realm_access.roles;
        }

        if (payload.role) return [payload.role];
        if (payload.roles) return payload.roles;

        return [];
      } catch (e) {
        console.error('Erreur décodage token', e);
        return [];
      }
    }

}
