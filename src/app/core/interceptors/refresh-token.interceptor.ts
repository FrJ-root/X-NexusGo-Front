import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { TokenService } from '../auth/token.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { AuthResponse } from '../../shared/models/auth.models';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const http = inject(HttpClient);
  const router = inject(Router);

  // Skip auth endpoints
  if (req.url.includes('/auth/')) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          const refreshToken = tokenService.getRefreshToken();
          
          if (refreshToken) {
            return http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, { 
              refreshToken 
            }).pipe(
              switchMap((response: AuthResponse) => {
                isRefreshing = false;
                tokenService.setTokens(response.accessToken, response.refreshToken);
                refreshTokenSubject.next(response.accessToken);

                // Retry the failed request with new token
                const clonedReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${response.accessToken}`
                  }
                });
                return next(clonedReq);
              }),
              catchError((refreshError) => {
                isRefreshing = false;
                tokenService.clearTokens();
                router.navigate(['/login']);
                return throwError(() => refreshError);
              })
            );
          } else {
            isRefreshing = false;
            tokenService.clearTokens();
            router.navigate(['/login']);
          }
        } else {
          // Wait for refresh to complete
          return refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap(token => {
              const clonedReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${token}`
                }
              });
              return next(clonedReq);
            })
          );
        }
      }

      return throwError(() => error);
    })
  );
};
