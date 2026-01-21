import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BarberServicesService, BarberService } from '../../../core/barber-services.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-services-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-900">
      <!-- Navbar -->
      <nav class="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div class="flex items-center space-x-4">
          <h1 class="text-xl font-bold text-white tracking-wider">ADMIN<span class="text-amber-500">PANEL</span></h1>
          <div class="h-6 w-px bg-slate-600 mx-2"></div>
          <a routerLink="/admin/dashboard" routerLinkActive="text-amber-500" class="text-slate-400 hover:text-white transition-colors">Citas</a>
          <a routerLink="/admin/schedule" routerLinkActive="text-amber-500" class="text-slate-400 hover:text-white transition-colors">Mi Agenda</a>
          <a routerLink="/admin/earnings" routerLinkActive="text-amber-500" class="text-slate-400 hover:text-white transition-colors">Ganancias</a>
          <a routerLink="/admin/services" routerLinkActive="text-amber-500" class="text-slate-400 hover:text-white transition-colors">Servicios</a>
        </div>
      </nav>

      <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-white">Gestión de Servicios</h2>
        <button (click)="openModal()" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg transition-all">
          + Nuevo Servicio
        </button>
      </div>

      <!-- Loading / Error -->
      <!-- (Simplificado, idealmente usar async pipe y loading state) -->

      <!-- Services List -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let service of services$ | async" class="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg relative group">
          <div class="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button (click)="editService(service)" class="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white">
              ✎
            </button>
            <button (click)="deleteService(service)" class="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600 hover:text-white">
              🗑
            </button>
          </div>

          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-xl font-bold text-white mb-2">{{ service.name }}</h3>
              <span [class]="service.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'" class="px-2 py-1 rounded text-xs font-medium">
                {{ service.isActive ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
            <div class="text-right">
              <p class="text-amber-500 font-bold text-lg">\${{ service.price }}</p>
              <p class="text-slate-400 text-sm">{{ service.durationMinutes }} min</p>
            </div>
          </div>
          <p class="mt-4 text-slate-400 text-sm">{{ service.description }}</p>
        </div>
      </div>

      <!-- Modal (Simple Overlay) -->
      <div *ngIf="isModalOpen" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700">
          <div class="p-6 border-b border-slate-700 flex justify-between items-center">
            <h3 class="text-xl font-bold text-white">{{ isEditing ? 'Editar Servicio' : 'Nuevo Servicio' }}</h3>
            <button (click)="closeModal()" class="text-slate-400 hover:text-white">✕</button>
          </div>

          <form (ngSubmit)="saveService()" class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">Nombre</label>
              <input [(ngModel)]="currentService.name" name="name" required class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-amber-500 outline-none">
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">Descripción</label>
              <textarea [(ngModel)]="currentService.description" name="description" rows="3" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-amber-500 outline-none"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1">Precio ($)</label>
                <input type="number" [(ngModel)]="currentService.price" name="price" required class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-amber-500 outline-none">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1">Duración (min)</label>
                <input type="number" [(ngModel)]="currentService.durationMinutes" name="duration" required class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-amber-500 outline-none">
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <input type="checkbox" [(ngModel)]="currentService.isActive" name="isActive" id="isActive" class="w-5 h-5 rounded text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-600">
              <label for="isActive" class="text-white">Servicio Activo</label>
            </div>

            <div class="pt-4 flex justify-end space-x-3">
              <button type="button" (click)="closeModal()" class="px-4 py-2 text-slate-300 hover:text-white">Cancelar</button>
              <button type="submit" class="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg shadow-lg">Guardar</button>
            </div>
          </form>
        </div>
        </div>
      </div>
    </div>
  `
})
export class ServicesManagerComponent implements OnInit {
  services$!: Observable<BarberService[]>;
  isModalOpen = false;
  isEditing = false;

  // Model
  currentService: BarberService = this.getEmptyService();

  private servicesService = inject(BarberServicesService);

  ngOnInit() {
    this.services$ = this.servicesService.getServices();
  }

  getEmptyService(): BarberService {
    return { name: '', description: '', price: 0, durationMinutes: 30, isActive: true };
  }

  openModal() {
    this.currentService = this.getEmptyService();
    this.isEditing = false;
    this.isModalOpen = true;
  }

  editService(service: BarberService) {
    this.currentService = { ...service }; // Clone
    this.isEditing = true;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  async saveService() {
    try {
      if (this.isEditing && this.currentService.id) {
        await this.servicesService.updateService(this.currentService.id, this.currentService);
      } else {
        await this.servicesService.addService(this.currentService);
      }
      this.closeModal();
      // Refresh list is automatic via Firestore observable
    } catch (e) {
      console.error(e);
      alert('Error al guardar');
    }
  }

  async deleteService(service: BarberService) {
    if (!confirm(`¿Eliminar ${service.name}?`)) return;
    if (service.id) {
      await this.servicesService.deleteService(service.id);
    }
  }
}
