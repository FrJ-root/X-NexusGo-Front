import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/services';
import { ApiError } from '../../shared/models';
import { TokenService } from '../auth/token.service';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const tokenService = inject(TokenService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse | Error) => {
      if (error instanceof SyntaxError || (error.name === 'SyntaxError')) {
        console.error('JSON Parse Error - Server returned non-JSON response:', error);
        toastService.error('Erreur de communication avec le serveur');
        return throwError(() => new HttpErrorResponse({
          error: 'Invalid server response',
          status: 0,
          statusText: 'Parse Error',
          url: req.url
        }));
      }

      const httpError = error as HttpErrorResponse;
      console.error('HTTP Error:', httpError.status, httpError.url, httpError);
      
      let errorMessage = 'Une erreur inattendue s\'est produite';
      let apiError: ApiError | null = null;

      if (httpError.error) {
        if (typeof httpError.error === 'string' && httpError.error.startsWith('<!')) {
          console.error('Server returned HTML instead of JSON');
          errorMessage = 'Erreur de communication avec le serveur';
        } else if (typeof httpError.error === 'object') {
          apiError = httpError.error as ApiError;
          if (apiError?.message) {
            errorMessage = apiError.message;
          } else if (apiError?.error) {
            errorMessage = apiError.error;
          }
        } else if (typeof httpError.error === 'string') {
          errorMessage = httpError.error;
        }
      }

      switch (httpError.status) {
        case 400:
          // Log full error for debugging
          console.error('400 Bad Request - Full error:', httpError.error);
          // Extract validation errors if present
          if (apiError?.errors && Array.isArray(apiError.errors)) {
            errorMessage = apiError.errors.join(', ');
          } else if (apiError?.message) {
            errorMessage = apiError.message;
          } else {
            errorMessage = 'Requête invalide';
          }
          toastService.error(errorMessage);
          break;
        case 401:
          // Handled by refresh token interceptor
          break;
        case 403:
          // Check if user has a token - if not, this is an auth issue, not permissions
          const token = tokenService.getAccessToken();
          if (!token) {
            // No token - redirect to login
            toastService.error('Session expirée. Veuillez vous reconnecter.');
            tokenService.clearTokens();
            router.navigate(['/login']);
          } else {
            // Has token but lacks permissions
            toastService.error('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
          }
          break;
        case 404:
          toastService.error('Ressource non trouvée');
          break;
        case 409:
          toastService.error(errorMessage || 'Conflit détecté. L\'opération ne peut pas être effectuée.');
          break;
        case 422:
          toastService.error(errorMessage || 'Données invalides');
          break;
        case 500:
          toastService.error('Erreur serveur. Veuillez réessayer plus tard.');
          break;
        case 0:
          toastService.error('Impossible de contacter le serveur. Vérifiez votre connexion.');
          break;
        default:
          if (httpError.status !== 401) {
            toastService.error(errorMessage);
          }
      }

      return throwError(() => httpError);
    })
  );
};

function apiError(error: HttpErrorResponse): ApiError | null {
  if (error.error && typeof error.error === 'object' && 'message' in error.error) {
    return error.error as ApiError;
  }
  return null;
}