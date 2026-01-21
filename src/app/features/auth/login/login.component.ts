import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div class="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-white mb-2">Bienvenido</h2>
          <p class="text-slate-400">Inicia sesión para gestionar tus citas</p>
        </div>

        <div class="space-y-4">
          <button
            (click)="onGoogleLogin()"
            type="button"
            class="w-full py-3 px-4 bg-white text-slate-900 font-bold rounded-lg shadow-lg hover:bg-gray-100 transition-all flex items-center justify-center space-x-2 border border-slate-300 transform active:scale-95"
          >
           <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Continuar con Google</span>
          </button>

          <div class="relative py-2">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-slate-600"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-slate-800 text-slate-400">O ingresa con email</span>
            </div>
          </div>
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="email"
              required
              email
              class="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              placeholder="tu@email.com"
            >
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-slate-300 mb-2">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="password"
              required
              class="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            >
          </div>

          <div *ngIf="errorMsg" class="p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
            {{ errorMsg }}
          </div>

          <button
            type="submit"
            [disabled]="loading"
            class="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg shadow-lg hover:shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
          >
            <span *ngIf="!loading">Ingresar</span>
            <span *ngIf="loading">Cargando...</span>
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-slate-400">
          ¿No tienes cuenta?
          <a routerLink="/register" class="text-amber-500 hover:text-amber-400 font-medium">Regístrate aquí</a>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMsg = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  async onSubmit() {
    if (!this.email || !this.password) return;

    this.loading = true;
    this.errorMsg = '';

    try {
      await this.authService.login(this.email, this.password);

      const profile = this.authService.currentUserSig();

      if (profile?.role === 'admin') {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate(['/client/dashboard']);
      }
    } catch (error: any) {
      console.error(error);
      this.errorMsg = 'Error al iniciar sesión. Verifica tus credenciales.';
      this.loading = false;
    }
  }

  async onGoogleLogin() {
    this.loading = true;
    this.errorMsg = '';
    try {
      await this.authService.loginWithGoogle();

      const profile = this.authService.currentUserSig();

      // Navigate based on role
      if (profile?.role === 'admin') {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate(['/client/dashboard']);
      }
    } catch (error: any) {
      console.error(error);
      this.errorMsg = 'Error al iniciar sesión con Google.';
      this.loading = false;
    }
  }
}
