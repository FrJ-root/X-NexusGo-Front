import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TokenService } from '../auth/token.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const expectedRoles: string[] = route.data['roles'] || [];

  const userRoles = tokenService.getUserRoles();

  const hasRole = userRoles.some(role => expectedRoles.includes(role));

  if (hasRole) {
    return true;
  }

  alert('Accès interdit : Rôle insuffisant');
  router.navigate(['/login']);
  return false;
};
