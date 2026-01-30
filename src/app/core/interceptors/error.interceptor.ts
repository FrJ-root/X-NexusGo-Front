import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Handled by refresh token interceptor usually, but safe fallback
      } else if (error.status === 403) {
        // Only redirect to unauthorized if this is not an API endpoint error
        // Backend 403 errors should be handled by components themselves
        if (!req.url.includes('/api/')) {
          router.navigate(['/unauthorized']);
        }
      } else if (error.status !== 0) { // Ignore cancelled requests
        toastService.show(error.error?.message || 'Une erreur est survenue', 'error');
      }
      return throwError(() => error);
    })
  );
};
