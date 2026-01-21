import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';
import { loginRedirectGuard } from './core/auth/login-redirect.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [loginRedirectGuard] },
  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  // Placeholder routes until components are created
  {
    path: 'client',
    loadChildren: () => import('./features/client/client.routes').then(m => m.CLIENT_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [authGuard, adminGuard]
  }
];
