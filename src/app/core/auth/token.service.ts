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
    if (!token) {
      console.log('TokenService: No token found');
      return [];
    }

    try {
      const payload = this.decodeToken(token);
      if (!payload) return [];

      console.log('TokenService: Decoded Payload:', payload);

      // Check multiple common claim names for roles/authorities
      let rawRoles = payload.role || payload.roles || payload.authorities || payload.auth || payload.scope || [];
      console.log('TokenService: Raw roles found in payload:', rawRoles);

      // Ensure rawRoles is an array
      if (!Array.isArray(rawRoles)) {
        rawRoles = [rawRoles];
      }

      const extractedRoles = rawRoles
        .map((r: any) => {
          // Handle both string arrays and object arrays (Spring Security authorities usually have 'authority' key)
          const roleStr = typeof r === 'string' ? r : (r.authority || r.role || r.name || '');
          if (!roleStr) return null;

          // Strip ROLE_ prefix if present and convert to uppercase to match frontend enum
          return roleStr.replace(/^ROLE_/, '').trim().toUpperCase() as Role;
        })
        .filter((r: Role | null): r is Role => !!r && Object.values(Role).includes(r));

      console.log('TokenService: Extracted and validated roles:', extractedRoles);
      return extractedRoles;
    } catch (e) {
      console.error('TokenService: Critical error during role extraction:', e);
      return [];
    }
  }

  /**
   * Robustly decodes a JWT payload handling Base64Url encoding and missing padding.
   */
  private decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('TokenService: Invalid JWT structure (expected 3 parts)');
        return null;
      }

      // Base64Url to Base64
      let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');

      // Add padding if missing
      while (base64.length % 4 !== 0) {
        base64 += '=';
      }

      // Use UTF-8 safe decoding
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('TokenService: Error decoding JWT payload:', e);
      return null;
    }
  }
}
