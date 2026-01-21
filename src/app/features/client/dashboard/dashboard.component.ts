import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppointmentsService, Appointment } from '../../../core/appointments.service';
import { AuthService } from '../../../core/auth.service';
import { Observable, map, of, catchError, switchMap } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, CurrencyPipe],
  template: `
    <div class="min-h-screen bg-slate-900 pb-20">
      <!-- Header -->
      <header class="bg-slate-800 border-b border-slate-700 px-6 py-6 pb-12 relative overflow-hidden">
        <div class="relative z-10">
          <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-bold text-white">Hola, <span class="text-amber-500">{{ (auth.currentUserSig()?.displayName) || 'Cliente' }}</span></h1>
            <button (click)="logout()" class="text-slate-400 hover:text-white text-sm">Salir</button>
          </div>
          <p class="text-slate-400">Gestiona tus citas y luce siempre bien.</p>
        </div>
        <!-- Decorative Circle -->
        <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl"></div>
      </header>

      <!-- FAB (Floating Action Button) for Mobile/Desktop -->
      <a routerLink="/client/book" class="fixed bottom-6 right-6 z-50 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-full p-4 shadow-lg shadow-amber-500/20 hover:scale-105 transition-all text-center flex items-center gap-2 px-6">
        <span class="text-xl">+</span> Nueva Cita
      </a>

      <!-- Content -->
      <div class="px-4 -mt-6 relative z-10 space-y-8">

        <!-- Próximas Citas -->
        <section>
          <h3 class="text-lg font-bold text-white mb-4 flex items-center">
            <span class="w-1 h-6 bg-amber-500 rounded-full mr-2"></span>
            Próximas Citas
          </h3>

          <ng-container *ngIf="upcomingAppointments$ | async as appointments; else loading">
            <div *ngIf="appointments.length === 0" class="bg-slate-800 rounded-xl p-6 text-center border border-slate-700 border-dashed">
              <p class="text-slate-500 mb-4">No tienes citas programadas.</p>
              <a routerLink="/client/book" class="text-amber-500 font-medium hover:underline">¡Reserva ahora!</a>
            </div>

            <div class="space-y-4">
              <div *ngFor="let appt of appointments" class="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-md relative overflow-hidden group">
                <div class="absolute top-0 left-0 w-1 h-full"
                  [ngClass]="{
                    'bg-yellow-500': appt.status === 'PENDING',
                    'bg-green-500': appt.status === 'CONFIRMED'
                  }"></div>

                <div class="flex justify-between items-start mb-3">
                  <div>
                    <p class="text-slate-400 text-sm font-medium uppercase tracking-wider">{{ appt.startAt | date:'EEEE d MMMM' }}</p>
                    <p class="text-2xl font-bold text-white">{{ appt.startAt | date:'HH:mm' }}</p>
                  </div>
                  <span class="px-2 py-1 rounded text-xs font-bold uppercase tracking-wider"
                    [ngClass]="{
                      'bg-yellow-500/20 text-yellow-500': appt.status === 'PENDING',
                      'bg-green-500/20 text-green-500': appt.status === 'CONFIRMED'
                    }">
                    {{ appt.status === 'PENDING' ? 'Confirmación Pendiente' : 'Confirmada' }}
                  </span>
                </div>

                <div class="border-t border-slate-700 pt-3 flex justify-between items-end">
                  <div>
                    <ul class="text-slate-300 text-sm space-y-1">
                      <li *ngFor="let s of appt.services">• {{ s.name }}</li>
                    </ul>
                  </div>
                  <div class="text-right">
                    <p class="text-amber-500 font-bold mb-1">{{ appt.totalPrice | currency }}</p>
                    <button *ngIf="appt.status !== 'CANCELLED'" (click)="cancelAppointment(appt)" class="text-xs text-red-400 hover:text-red-300">
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </ng-container>
        </section>

        <!-- Historial Reciente -->
        <section>
          <h3 class="text-lg font-bold text-slate-400 mb-4">Historial Reciente</h3>

          <ng-container *ngIf="recentHistory$ | async as history; else loading">
            <div *ngIf="history.length === 0" class="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700 border-dashed">
              <p class="text-slate-500">No hay historial de citas.</p>
            </div>

            <div class="space-y-3">
              <div *ngFor="let appt of history" class="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <p class="text-slate-400 text-xs font-medium uppercase tracking-wider">{{ appt.startAt | date:'d MMM yyyy' }}</p>
                    <p class="text-white font-semibold text-lg">{{ appt.startAt | date:'HH:mm' }}</p>
                  </div>
                  <span class="px-2.5 py-1 text-xs font-medium rounded-full"
                    [ngClass]="{
                      'bg-green-500/20 text-green-400': appt.status === 'COMPLETED',
                      'bg-red-500/20 text-red-400': appt.status === 'REJECTED',
                      'bg-gray-500/20 text-gray-400': appt.status === 'CANCELLED'
                    }">
                    {{ appt.status === 'COMPLETED' ? 'Completada' : appt.status === 'REJECTED' ? 'Rechazada' : 'Cancelada' }}
                  </span>
                </div>
                <div class="space-y-1">
                  <p class="text-slate-300 text-sm">
                    {{ getServiceNames(appt) }}
                  </p>
                  <p class="text-amber-500 font-bold">{{ appt.totalPrice | currency }}</p>
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
export class DashboardComponent {
  upcomingAppointments$!: Observable<Appointment[]>;
  recentHistory$!: Observable<Appointment[]>;

  auth = inject(AuthService);
  private appointmentsService = inject(AppointmentsService);

  constructor() {
    // Create observables that reactively respond to user signal changes
    const user$ = toObservable(this.auth.currentUserSig);

    this.upcomingAppointments$ = user$.pipe(
      switchMap(user => {
        if (!user) return of([]);
        return this.appointmentsService.getClientAppointments(user.uid).pipe(
          map(appts => appts.filter(a => ['PENDING', 'CONFIRMED'].includes(a.status))),
          catchError(err => {
            console.error('Error fetching appointments', err);
            return of([]);
          })
        );
      })
    );

    this.recentHistory$ = user$.pipe(
      switchMap(user => {
        if (!user) return of([]);
        return this.appointmentsService.getClientAppointments(user.uid).pipe(
          map(appts => appts
            .filter(a => ['COMPLETED', 'REJECTED', 'CANCELLED'].includes(a.status))
            .slice(0, 5)
          ),
          catchError(err => {
            console.error('Error fetching history', err);
            return of([]);
          })
        );
      })
    );
  }

  async logout() {
    await this.auth.logout();
  }

  async cancelAppointment(appt: Appointment) {
    if (confirm('¿Seguro quieres cancelar esta cita?')) {
      await this.appointmentsService.updateStatus(appt.id!, 'CANCELLED');
      // Refresh handled by observable
    }
  }

  getServiceNames(appt: Appointment): string {
    return appt.services && appt.services.length > 0
      ? appt.services.map(s => s.name).join(', ')
      : 'Sin servicios';
  }
}
