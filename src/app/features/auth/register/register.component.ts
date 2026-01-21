import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div class="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-white mb-2">Crear Cuenta</h2>
          <p class="text-slate-400">Únete para una experiencia premium</p>
        </div>

        <form (ngSubmit)="onSubmit()" #registerForm="ngForm" class="space-y-6">
          <div>
            <label for="name" class="block text-sm font-medium text-slate-300 mb-2">Nombre Completo</label>
            <input
              type="text"
              id="name"
              name="name"
              [(ngModel)]="name"
              required
              class="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              placeholder="Juan Pérez"
            >
          </div>

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
              minlength="6"
              class="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              placeholder="Mínimo 6 caracteres"
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
            <span *ngIf="!loading">Registrarse</span>
            <span *ngIf="loading">Creando cuenta...</span>
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-slate-400">
          ¿Ya tienes cuenta?
          <a routerLink="/login" class="text-amber-500 hover:text-amber-400 font-medium">Inicia sesión</a>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  loading = false;
  errorMsg = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  async onSubmit() {
    if (!this.email || !this.password || !this.name) return;

    this.loading = true;
    this.errorMsg = '';

    try {
      await this.authService.register(this.email, this.password, this.name);
      this.router.navigate(['/client/dashboard']);
    } catch (error: any) {
      console.error(error);
      this.errorMsg = 'Error al registrarse. intenta nuevamente.';
      if (error.code === 'auth/email-already-in-use') {
        this.errorMsg = 'El email ya está registrado.';
      }
    } finally {
      this.loading = false;
    }
  }
}
