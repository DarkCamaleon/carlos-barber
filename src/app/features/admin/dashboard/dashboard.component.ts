import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { AppointmentsService, Appointment } from '../../../core/appointments.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  template: `
    <div class="min-h-screen bg-slate-900 pb-20">
      <!-- Navbar Admin -->
      <nav class="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div class="flex items-center space-x-4">
          <h1 class="text-xl font-bold text-white tracking-wider">ADMIN<span class="text-amber-500">PANEL</span></h1>
          <div class="h-6 w-px bg-slate-600 mx-2"></div>
          <a routerLink="/admin/dashboard" routerLinkActive="text-amber-500" class="text-slate-400 hover:text-white transition-colors">Citas</a>
          <a routerLink="/admin/schedule" routerLinkActive="text-amber-500" class="text-slate-400 hover:text-white transition-colors">Mi Agenda</a>
          <a routerLink="/admin/earnings" routerLinkActive="text-amber-500" class="text-slate-400 hover:text-white transition-colors">Ganancias</a>
          <a routerLink="/admin/services" routerLinkActive="text-amber-500" class="text-slate-400 hover:text-white transition-colors">Servicios</a>
        </div>
        <button (click)="logout()" class="text-slate-400 hover:text-red-400 text-sm font-medium">Cerrar Sesión</button>
      </nav>

      <!-- Content Area -->
      <div class="p-6 max-w-7xl mx-auto space-y-8">

        <!-- PENDING REQUESTS -->
        <section>
          <h2 class="text-2xl font-bold text-white mb-4 flex items-center">
            <span class="w-2 h-8 bg-yellow-500 rounded mr-2"></span>
            Solicitudes Pendientes
          </h2>

          <ng-container *ngIf="pendingAppointments$ | async as pending; else loading">
            <div *ngIf="pending.length === 0" class="bg-slate-800/50 p-8 rounded-xl text-center border border-dashed border-slate-700">
              <p class="text-slate-500">No hay solicitudes pendientes.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div *ngFor="let appt of pending" class="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg relative overflow-hidden">
                <div class="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>

                <div class="flex justify-between mb-4">
                  <div>
                    <p class="text-slate-400 text-sm uppercase tracking-wider">{{ appt.startAt | date:'EEEE d MMMM' }}</p>
                    <p class="text-2xl font-bold text-white">{{ appt.startAt | date:'HH:mm' }}</p>
                  </div>
                  <div class="text-right">
                     <p class="font-bold text-white">{{ appt.clientName }}</p>
                     <p class="text-xs text-slate-500">{{ appt.services.length }} servicios</p>
                  </div>
                </div>

                <div class="mb-6 space-y-1">
                  <p *ngFor="let s of appt.services" class="text-sm text-slate-300">• {{ s.name }}</p>
                </div>

                <div class="flex space-x-3">
                  <button (click)="updateStatus(appt, 'CONFIRMED')" class="flex-1 py-2 bg-green-500 hover:bg-green-600 text-slate-900 font-bold rounded-lg transition-colors">
                    Aceptar
                  </button>
                  <button (click)="updateStatus(appt, 'REJECTED')" class="flex-1 py-2 bg-slate-700 hover:bg-red-500/20 hover:text-red-400 text-slate-300 font-bold rounded-lg transition-colors border border-slate-600">
                    Rechazar
                  </button>
                </div>
              </div>
            </div>
          </ng-container>
        </section>

        <!-- TODAY'S APPOINTMENTS -->
         <section>
          <h2 class="text-2xl font-bold text-white mb-4 flex items-center">
            <span class="w-2 h-8 bg-blue-500 rounded mr-2"></span>
            Resumen Hoy ({{ today | date:'fullDate' }})
          </h2>

          <div *ngIf="loadingToday" class="text-center py-6">
             <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>

          <div *ngIf="!loadingToday && todayAppointments.length === 0" class="bg-slate-800/30 p-8 rounded-xl text-center border border-dashed border-slate-700">
            <p class="text-slate-500">No tienes citas programadas para hoy.</p>
          </div>

          <div *ngIf="!loadingToday && todayAppointments.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <div *ngFor="let appt of todayAppointments" class="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg relative overflow-hidden group">
                <!-- Status Bar Indicator -->
                <div class="absolute top-0 left-0 w-1 h-full"
                  [ngClass]="{
                    'bg-green-500': appt.status === 'CONFIRMED',
                    'bg-blue-500': appt.status === 'COMPLETED',
                    'bg-red-500': appt.status === 'REJECTED' || appt.status === 'CANCELLED',
                    'bg-yellow-500': appt.status === 'PENDING'
                  }">
                </div>

                <div class="flex flex-col h-full justify-between">
                  <div>
                    <div class="flex justify-between items-start mb-4">
                      <div>
                        <p class="text-3xl font-bold text-white tracking-tight">{{ appt.startAt | date:'HH:mm' }}</p>
                        <span class="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                          [ngClass]="{
                            'bg-green-500/20 text-green-400': appt.status === 'CONFIRMED',
                            'bg-blue-500/20 text-blue-400': appt.status === 'COMPLETED',
                            'bg-red-500/20 text-red-400': appt.status === 'REJECTED' || appt.status === 'CANCELLED',
                            'bg-yellow-500/20 text-yellow-400': appt.status === 'PENDING'
                          }">
                          {{ appt.status }}
                        </span>
                      </div>
                      <div class="text-right">
                         <p class="font-bold text-white text-lg truncate max-w-[120px]" title="{{ appt.clientName }}">{{ appt.clientName }}</p>
                         <p class="text-xs text-slate-500">{{ appt.clientPhone }}</p>
                      </div>
                    </div>

                    <div class="mb-4 space-y-2 bg-slate-900/50 p-3 rounded-lg">
                      <p *ngFor="let s of appt.services" class="text-sm text-slate-300 flex justify-between">
                        <span>{{ s.name }}</span>
                        <!-- <span class="text-slate-500">\${{ s.price }}</span> -->
                      </p>
                    </div>
                  </div>

                  <div class="pt-4 border-t border-slate-700 flex justify-between items-center">
                    <p class="text-slate-400 text-sm italic">{{ appt.totalDurationMinutes }} min</p>
                    <p class="text-lg font-bold text-amber-500">\${{ appt.totalPrice }}</p>
                  </div>
                </div>
            </div>
          </div>
        </section>

      </div>
    </div>
    <ng-template #loading>
       <div class="text-center py-10">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
      </div>
    </ng-template>
  `
})
export class DashboardComponent implements OnInit {
  pendingAppointments$!: Observable<Appointment[]>;
  todayAppointments: Appointment[] = [];
  loadingToday = true;
  today = new Date();

  private authService = inject(AuthService);
  private appointmentsService = inject(AppointmentsService);

  ngOnInit() {
    this.refreshData();
  }

  async refreshData() {
    this.pendingAppointments$ = this.appointmentsService.getPendingAppointments();

    // Load Today's Appointments
    this.loadingToday = true;
    try {
      this.todayAppointments = await this.appointmentsService.getAppointmentsByDate(new Date());
    } catch (error) {
      console.error('Error fetching today appointments:', error);
    } finally {
      this.loadingToday = false;
    }
  }

  async updateStatus(appt: Appointment, status: Appointment['status']) {
    if (!appt.id) return;
    try {
      await this.appointmentsService.updateStatus(appt.id, status);
      this.refreshData();
    } catch (e) {
      console.error(e);
      alert('Error al actualizar');
    }
  }

  logout() {
    this.authService.logout();
  }
}
