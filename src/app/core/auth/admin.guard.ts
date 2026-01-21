import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { map, take, tap, switchMap } from 'rxjs/operators';
import { doc, getDoc } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
import { of } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const firestore = inject(Firestore);
  const router = inject(Router);

  return authService.user$.pipe(
    take(1),
    switchMap(user => {
      if (!user) return of(false);
      return of(true).pipe( // Optimistic check, usually you'd check role in token or DB
        // For security, verifying against Firestore
        switchMap(() => getDoc(doc(firestore, 'users', user.uid))),
        map(snapshot => {
          const data = snapshot.data();
          return data?.['role'] === 'admin';
        })
      );
    }),
    tap(isAdmin => {
      if (!isAdmin) {
        router.navigate(['/']); // Redirect to home/dashboard if not admin
      }
    })
  );
};
