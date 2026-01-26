import { HttpInterceptorFn, HttpErrorResponse, HttpResponse, HttpEvent } from '@angular/common/http';
import { catchError, throwError, map } from 'rxjs';

/**
 * Interceptor that handles JSON parse errors from the backend.
 * This catches SyntaxError when the server returns empty bodies or invalid JSON.
 */
export const responseInterceptor: HttpInterceptorFn = (req, next) => {
  // Clone request to observe response as text first, then parse manually
  // This prevents Angular from throwing SyntaxError on empty/invalid JSON
  const textReq = req.clone({
    responseType: 'text'
  });

  return next(textReq).pipe(
    map((event: HttpEvent<unknown>) => {
      if (event instanceof HttpResponse) {
        const textBody = event.body as string;
        
        // Try to parse as JSON
        let parsedBody: unknown = null;
        if (textBody?.trim()) {
          try {
            parsedBody = JSON.parse(textBody);
          } catch {
            // If parsing fails, keep as text
            parsedBody = textBody;
          }
        }
        
        return event.clone({ body: parsedBody });
      }
      return event;
    }),
    catchError((error: HttpErrorResponse) => {
      // For error responses, try to parse the error body as JSON
      if (error.error && typeof error.error === 'string') {
        try {
          const parsedError = JSON.parse(error.error);
          return throwError(() => new HttpErrorResponse({
            error: parsedError,
            headers: error.headers,
            status: error.status,
            statusText: error.statusText,
            url: error.url || undefined
          }));
        } catch {
          // Error body is not JSON, keep as-is or create a proper error object
          if (!error.error.trim()) {
            // Empty error body - create meaningful error
            return throwError(() => new HttpErrorResponse({
              error: { message: getErrorMessageForStatus(error.status) },
              headers: error.headers,
              status: error.status,
              statusText: error.statusText,
              url: error.url || undefined
            }));
          }
        }
      }
      
      return throwError(() => error);
    })
  );
};

function getErrorMessageForStatus(status: number): string {
  switch (status) {
    case 400: return 'Requête invalide';
    case 401: return 'Non authentifié';
    case 403: return 'Accès refusé';
    case 404: return 'Ressource non trouvée';
    case 500: return 'Erreur serveur';
    default: return 'Erreur inattendue';
  }
}
