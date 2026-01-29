import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Role } from '../../shared/models/auth.models';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const userRoles = authService.getUserRole();

  const requiredRoles = route.data['roles'] as Role[];

  if (requiredRoles && requiredRoles.some(role => userRoles.includes(role))) {
    return true;
  }

  router.navigate(['/unauthorized']);
  return false;
};
