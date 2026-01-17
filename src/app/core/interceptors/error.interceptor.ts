import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/services/toast.service';
import { ApiError } from '../../shared/models';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Une erreur inattendue s\'est produite';
      let apiError: ApiError | null = null;

      if (error.error) {
        // Try to parse as API error
        apiError = error.error as ApiError;
        if (apiError?.message) {
          errorMessage = apiError.message;
        } else if (typeof error.error === 'string') {
          errorMessage = error.error;
        }
      }

      switch (error.status) {
        case 400:
          errorMessage = apiError?.message || 'Requête invalide';
          toastService.error(errorMessage);
          break;
        case 401:
          // Handled by refresh interceptor
          break;
        case 403:
          toastService.error('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
          break;
        case 404:
          toastService.error('Ressource non trouvée');
          break;
        case 409:
          // Conflict - business rule violation
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
          if (error.status !== 401) {
            toastService.error(errorMessage);
          }
      }

      return throwError(() => error);
    })
  );
};

function apiError(error: HttpErrorResponse): ApiError | null {
  if (error.error && typeof error.error === 'object' && 'message' in error.error) {
    return error.error as ApiError;
  }
  return null;
}
