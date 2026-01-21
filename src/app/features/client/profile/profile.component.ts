import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-900 p-6 flex flex-col items-center justify-center">
      <h1 class="text-2xl text-white font-bold mb-4">Mi Perfil</h1>
      <p class="text-slate-400 mb-8">Gestión de perfil en construcción.</p>
      <a routerLink="/client/dashboard" class="text-amber-500 hover:text-white">Volver al inicio</a>
    </div>
  `
})
export class ProfileComponent { }
