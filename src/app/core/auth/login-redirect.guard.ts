import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { map, take } from 'rxjs/operators';

export const loginRedirectGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    take(1),
    map(user => {
      if (user) {
        // User is authenticated, check their role and redirect
        const profile = authService.currentUserSig();
        if (profile) {
          if (profile.role === 'admin') {
            router.navigate(['/admin/dashboard']);
          } else {
            router.navigate(['/client/dashboard']);
          }
          return false; // Prevent access to login page
        }
      }
      return true; // Allow access to login page
    })
  );
};
