import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth.service';
import { AppointmentsService, Appointment } from '../../../core/appointments.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-earnings',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, FormsModule],
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

        <!-- Header & Month Selector -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 class="text-2xl font-bold text-white flex items-center">
            <span class="w-2 h-8 bg-amber-500 rounded mr-2"></span>
            Ganancias Mensuales
          </h2>

          <div class="flex items-center gap-3">
            <label class="text-slate-400 text-sm">Mes:</label>
            <select [(ngModel)]="selectedMonth" (change)="loadData()" class="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-amber-500 outline-none">
              <option *ngFor="let month of months; let i = index" [value]="i">{{ month }}</option>
            </select>
            <select [(ngModel)]="selectedYear" (change)="loadData()" class="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-amber-500 outline-none">
              <option *ngFor="let year of availableYears" [value]="year">{{ year }}</option>
            </select>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Total Earnings -->
          <div class="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6">
            <p class="text-green-400 text-sm uppercase tracking-wider mb-2">Total Ganado</p>
            <p class="text-4xl font-bold text-white">\${{ totalEarnings.toLocaleString('es') }}</p>
          </div>

          <!-- Appointments Count -->
          <div class="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6">
            <p class="text-blue-400 text-sm uppercase tracking-wider mb-2">Citas Completadas</p>
            <p class="text-4xl font-bold text-white">{{ appointmentCount }}</p>
          </div>

          <!-- Average per Appointment -->
          <div class="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-6">
            <p class="text-amber-400 text-sm uppercase tracking-wider mb-2">Promedio por Cita</p>
            <p class="text-4xl font-bold text-white">\${{ averageEarning.toLocaleString('es') }}</p>
          </div>
        </div>

        <!-- Appointments List -->
        <section>
          <h3 class="text-xl font-bold text-white mb-4">Detalle de Citas</h3>

          <ng-container *ngIf="completedAppointments$ | async as appointments; else loading">
            <div *ngIf="appointments.length === 0" class="bg-slate-800/50 p-8 rounded-xl text-center border border-dashed border-slate-700">
              <p class="text-slate-500">No hay citas completadas en este mes.</p>
            </div>

            <div class="space-y-3">
              <div *ngFor="let appt of appointments" class="bg-slate-800 rounded-lg p-5 border border-slate-700 hover:border-green-500/30 transition-colors">
                <div class="flex flex-col md:flex-row justify-between gap-4">
                  <!-- Date & Client -->
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <span class="text-amber-500 font-bold text-lg">{{ appt.startAt | date:'d MMM' }}</span>
                      <span class="text-slate-500">•</span>
                      <span class="text-white font-medium">{{ appt.clientName }}</span>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <span *ngFor="let s of appt.services" class="text-xs px-2 py-1 bg-slate-700 rounded text-slate-300">
                        {{ s.name }} (\${{ s.price }})
                      </span>
                    </div>
                  </div>

                  <!-- Total -->
                  <div class="flex items-center">
                    <div class="text-right">
                      <p class="text-xs text-slate-400">Total</p>
                      <p class="text-2xl font-bold text-green-400">\${{ appt.totalPrice }}</p>
                    </div>
                  </div>
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
export class EarningsComponent implements OnInit {
  completedAppointments$!: Observable<Appointment[]>;

  selectedMonth: number = new Date().getMonth();
  selectedYear: number = new Date().getFullYear();

  months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  availableYears: number[] = [];

  totalEarnings = 0;
  appointmentCount = 0;
  averageEarning = 0;

  private authService = inject(AuthService);
  private appointmentsService = inject(AppointmentsService);

  ngOnInit() {
    // Generate years (current year and 2 years back)
    const currentYear = new Date().getFullYear();
    this.availableYears = [currentYear, currentYear - 1, currentYear - 2];

    this.loadData();
  }

  async loadData() {
    try {
      const appointments = await this.appointmentsService.getCompletedAppointmentsByMonth(
        this.selectedMonth,
        this.selectedYear
      );

      this.appointmentCount = appointments.length;
      this.totalEarnings = appointments.reduce((sum, appt) => sum + appt.totalPrice, 0);
      this.averageEarning = this.appointmentCount > 0 ? Math.round(this.totalEarnings / this.appointmentCount) : 0;

      // Update observable for template
      this.completedAppointments$ = new Observable(subscriber => {
        subscriber.next(appointments);
        subscriber.complete();
      });
    } catch (error) {
      console.error('Error loading earnings:', error);
    }
  }

  logout() {
    this.authService.logout();
  }
}
