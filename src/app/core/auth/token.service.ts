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
    return localStorage.getItem(this.ACCESS_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
  }

  getUserRoles(): string[] {
      const token = this.getAccessToken();
      if (!token) return [];

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));

        if (payload.realm_access && payload.realm_access.roles) {
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
