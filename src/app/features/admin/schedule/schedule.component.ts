import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { AppointmentsService, Appointment } from '../../../core/appointments.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-schedule',
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

        <!-- CONFIRMED & COMPLETED APPOINTMENTS - MI AGENDA -->
        <section>
          <h2 class="text-2xl font-bold text-white mb-4 flex items-center">
            <span class="w-2 h-8 bg-green-500 rounded mr-2"></span>
            Mi Agenda - Citas Confirmadas y Completadas
          </h2>

          <ng-container *ngIf="confirmedAppointments$ | async as confirmed; else loading">
            <div *ngIf="confirmed.length === 0" class="bg-slate-800/50 p-8 rounded-xl text-center border border-dashed border-slate-700">
              <p class="text-slate-500">No hay citas confirmadas.</p>
            </div>

            <div class="space-y-4">
              <div *ngFor="let appt of confirmed" class="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg relative overflow-hidden transition-colors"
                   [class.hover:border-green-500/30]="appt.status === 'CONFIRMED'"
                   [class.hover:border-blue-500/30]="appt.status === 'COMPLETED'">
                <div class="absolute top-0 left-0 w-1 h-full"
                     [class.bg-green-500]="appt.status === 'CONFIRMED'"
                     [class.bg-blue-500]="appt.status === 'COMPLETED'"></div>

                <div class="grid md:grid-cols-3 gap-6">
                  <!-- Fecha y Hora -->
                  <div class="md:col-span-1">
                    <p class="text-slate-400 text-xs uppercase tracking-wider mb-1">Fecha y Hora</p>
                    <p class="text-lg font-bold text-white">{{ appt.startAt | date:'EEEE d MMMM' }}</p>
                    <p class="text-2xl font-bold text-amber-500">{{ appt.startAt | date:'HH:mm' }}</p>
                    <p class="text-sm text-slate-500 mt-1">Duración: {{ appt.totalDurationMinutes }} min</p>
                  </div>

                  <!-- Cliente -->
                  <div class="md:col-span-1">
                    <p class="text-slate-400 text-xs uppercase tracking-wider mb-1">Cliente</p>
                    <p class="text-lg font-bold text-white">{{ appt.clientName }}</p>
                    <p class="text-sm text-slate-400" *ngIf="appt.clientPhone">📞 {{ appt.clientPhone }}</p>
                    <span *ngIf="appt.status === 'CONFIRMED'" class="inline-block px-2 py-1 mt-2 bg-green-500/10 text-green-400 rounded text-xs font-medium">
                      CONFIRMADA
                    </span>
                    <span *ngIf="appt.status === 'COMPLETED'" class="inline-block px-2 py-1 mt-2 bg-blue-500/10 text-blue-400 rounded text-xs font-medium">
                      ✓ COMPLETADA
                    </span>
                  </div>

                  <!-- Servicios y Precio -->
                  <div class="md:col-span-1">
                    <p class="text-slate-400 text-xs uppercase tracking-wider mb-1">Servicios</p>
                    <div class="space-y-1 mb-3">
                      <p *ngFor="let s of appt.services" class="text-sm text-slate-300">
                        • {{ s.name }} <span class="text-amber-500 font-medium">\${{ s.price }}</span>
                      </p>
                    </div>
                    <div class="pt-3 border-t border-slate-700">
                      <p class="text-xs text-slate-400">Total</p>
                      <p class="text-2xl font-bold text-amber-500">\${{ appt.totalPrice }}</p>
                    </div>
                  </div>
                </div>

                <!-- Actions - Only show for CONFIRMED appointments -->
                <div *ngIf="appt.status === 'CONFIRMED'" class="mt-6 pt-4 border-t border-slate-700 flex space-x-3">
                  <button (click)="markAsCompleted(appt)" class="flex-1 py-2 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white font-bold rounded-lg transition-colors border border-blue-500/30">
                    ✓ Marcar como Completada
                  </button>
                  <button (click)="cancelAppointment(appt)" class="px-6 py-2 bg-slate-700 hover:bg-red-500/20 hover:text-red-400 text-slate-300 font-bold rounded-lg transition-colors border border-slate-600">
                    Cancelar Cita
                  </button>
                </div>
              </div>
            </div>
          </ng-container>
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
export class ScheduleComponent implements OnInit {
  confirmedAppointments$!: Observable<Appointment[]>;

  private authService = inject(AuthService);
  private appointmentsService = inject(AppointmentsService);

  ngOnInit() {
    this.refreshData();
  }

  refreshData() {
    this.confirmedAppointments$ = this.appointmentsService.getConfirmedAppointments();
  }

  async markAsCompleted(appt: Appointment) {
    if (!appt.id) return;
    if (!confirm(`¿Marcar la cita de ${appt.clientName} como completada?`)) return;
    try {
      await this.appointmentsService.updateStatus(appt.id, 'COMPLETED');
      this.refreshData();
    } catch (e) {
      console.error(e);
      alert('Error al actualizar');
    }
  }

  async cancelAppointment(appt: Appointment) {
    if (!appt.id) return;
    if (!confirm(`¿Cancelar la cita de ${appt.clientName}?`)) return;
    try {
      await this.appointmentsService.updateStatus(appt.id, 'CANCELLED');
      this.refreshData();
    } catch (e) {
      console.error(e);
      alert('Error al cancelar');
    }
  }

  logout() {
    this.authService.logout();
  }
}
