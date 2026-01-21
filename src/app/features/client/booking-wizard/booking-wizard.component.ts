import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BarberServicesService, BarberService } from '../../../core/barber-services.service';
import { AppointmentsService, Appointment } from '../../../core/appointments.service';
import { AuthService } from '../../../core/auth.service';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-booking-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="min-h-screen bg-slate-900 text-white pb-20">
      <!-- Steps Header -->
      <div class="bg-slate-800 p-4 border-b border-slate-700">
        <div class="flex items-center justify-between max-w-lg mx-auto">
          <div class="flex flex-col items-center">
            <div [class]="step >= 1 ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-400'" class="w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 transition-colors">1</div>
            <span class="text-xs text-slate-400">Servicios</span>
          </div>
          <div class="h-0.5 w-12 bg-slate-700"></div>
          <div class="flex flex-col items-center">
            <div [class]="step >= 2 ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-400'" class="w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 transition-colors">2</div>
            <span class="text-xs text-slate-400">Fecha</span>
          </div>
          <div class="h-0.5 w-12 bg-slate-700"></div>
          <div class="flex flex-col items-center">
            <div [class]="step >= 3 ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-400'" class="w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 transition-colors">3</div>
            <span class="text-xs text-slate-400">Confirmar</span>
          </div>
        </div>
      </div>

      <div class="p-6 max-w-lg mx-auto">

        <!-- STEP 1: Select Services -->
        <div *ngIf="step === 1" class="space-y-6">
          <h2 class="text-2xl font-bold">Elige tus servicios</h2>
          <div class="space-y-4">
            <div *ngFor="let service of services"
              (click)="toggleService(service)"
              [class.border-amber-500]="isSelected(service)"
              class="bg-slate-800 p-4 rounded-xl border border-slate-700 cursor-pointer hover:bg-slate-800/80 transition-all shadow-md flex justify-between items-center group">
              <div class="flex items-center space-x-4">
                <div [class.bg-amber-500]="isSelected(service)" class="w-6 h-6 rounded-full border-2 border-slate-500 flex items-center justify-center transition-colors">
                   <span *ngIf="isSelected(service)" class="text-slate-900 text-sm font-bold">✓</span>
                </div>
                <div>
                  <h3 class="font-bold text-lg">{{ service.name }}</h3>
                  <p class="text-slate-400 text-sm">{{ service.durationMinutes }} min</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-amber-500 font-bold">\${{ service.price }}</p>
              </div>
            </div>
          </div>

          <div class="fixed bottom-0 left-0 w-full p-4 bg-slate-800 border-t border-slate-700 backdrop-blur-md bg-opacity-90">
            <div class="max-w-lg mx-auto flex justify-between items-center">
              <div>
                <p class="text-slate-400 text-sm">Total: {{ totalDuration }} min</p>
                <p class="text-amber-500 font-bold text-xl">\${{ totalPrice }}</p>
              </div>
              <button (click)="goToStep(2)" [disabled]="selectedServices.length === 0"
                class="px-8 py-3 bg-amber-500 text-slate-900 font-bold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                Siguiente
              </button>
            </div>
          </div>
        </div>

        <!-- STEP 2: Date & Time -->
        <div *ngIf="step === 2" class="space-y-6">
           <h2 class="text-2xl font-bold">Elige fecha y hora</h2>

           <!-- Date Picker -->
           <div>
             <label class="block text-slate-400 mb-2">Fecha</label>
             <input type="date" [(ngModel)]="selectedDate" (change)="onDateChange()" [min]="minDate"
               class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-amber-500 outline-none">
           </div>

           <!-- Slots -->
           <div *ngIf="loadingSlots" class="text-center py-8">
             <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
             <p class="mt-2 text-slate-400">Buscando horarios...</p>
           </div>

           <div *ngIf="!loadingSlots && availableSlots.length > 0" class="grid grid-cols-3 gap-3">
             <button *ngFor="let slot of availableSlots"
               (click)="selectSlot(slot)"
               [class.bg-amber-500]="selectedSlot === slot"
               [class.text-slate-900]="selectedSlot === slot"
               [class.bg-slate-800]="selectedSlot !== slot"
               class="py-3 px-2 rounded-lg border border-slate-700 font-medium hover:border-amber-500 transition-all text-center">
               {{ slot | date:'HH:mm' }}
             </button>
           </div>

           <div *ngIf="!loadingSlots && availableSlots.length === 0 && selectedDate" class="text-center py-8 bg-slate-800 rounded-xl border border-dashed border-slate-700">
             <p class="text-slate-400">No hay horarios disponibles para esta fecha.</p>
           </div>

           <div class="fixed bottom-0 left-0 w-full p-4 bg-slate-800 border-t border-slate-700 backdrop-blur-md bg-opacity-90">
            <div class="max-w-lg mx-auto flex justify-between items-center">
              <button (click)="goToStep(1)" class="text-slate-400 hover:text-white">Atrás</button>
              <button (click)="goToStep(3)" [disabled]="!selectedSlot"
                class="px-8 py-3 bg-amber-500 text-slate-900 font-bold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                Siguiente
              </button>
            </div>
          </div>
        </div>

        <!-- STEP 3: Confirm -->
        <div *ngIf="step === 3" class="space-y-6">
           <h2 class="text-2xl font-bold">Confirma tu reserva</h2>

           <div class="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
             <div class="mb-6 pb-6 border-b border-slate-700">
                <p class="text-slate-400 text-sm uppercase tracking-wider mb-1">Fecha y Hora</p>
                <div class="flex items-center space-x-2">
                  <span class="text-2xl font-bold text-white">{{ selectedSlot | date:'EEEE d MMMM' }}</span>
                </div>
                <span class="text-4xl font-bold text-amber-500">{{ selectedSlot | date:'HH:mm' }}</span>
             </div>

             <div class="mb-4">
               <p class="text-slate-400 text-sm uppercase tracking-wider mb-2">Servicios</p>
               <ul class="space-y-2">
                 <li *ngFor="let s of selectedServices" class="flex justify-between text-white">
                   <span>{{ s.name }}</span>
                   <span class="text-slate-400">\${{ s.price }}</span>
                 </li>
               </ul>
             </div>

             <div class="pt-4 border-t border-slate-700 flex justify-between items-end">
               <div>
                 <p class="text-slate-400 text-sm">Duración Total</p>
                 <p class="text-white font-bold">{{ totalDuration }} min</p>
               </div>
               <div class="text-right">
                 <p class="text-slate-400 text-sm">Total a Pagar</p>
                 <p class="text-3xl font-bold text-amber-500">\${{ totalPrice }}</p>
               </div>
             </div>
           </div>

           <div class="fixed bottom-0 left-0 w-full p-4 bg-slate-800 border-t border-slate-700 backdrop-blur-md bg-opacity-90">
            <div class="max-w-lg mx-auto flex justify-between items-center">
              <button (click)="goToStep(2)" class="text-slate-400 hover:text-white">Atrás</button>
              <button (click)="confirmBooking()" [disabled]="isSubmitting"
                class="px-8 py-3 bg-amber-500 text-amber-900 font-bold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
                <span *ngIf="isSubmitting" class="animate-spin h-4 w-4 border-b-2 border-slate-900 rounded-full"></span>
                <span>{{ isSubmitting ? 'Confirmando...' : 'Confirmar Reserva' }}</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class BookingWizardComponent implements OnInit {
  step = 1;

  // Data
  services: BarberService[] = [];
  selectedServices: BarberService[] = [];

  selectedDate: string = ''; // YYYY-MM-DD
  minDate: string = new Date().toISOString().split('T')[0];
  selectedSlot: Date | null = null;

  availableSlots: Date[] = [];
  loadingSlots = false;
  isSubmitting = false;

  private servicesService = inject(BarberServicesService);
  private appointmentsService = inject(AppointmentsService);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    this.servicesService.getActiveServices().subscribe(s => this.services = s);
  }

  // Getters
  get totalDuration() {
    return this.selectedServices.reduce((acc, s) => acc + s.durationMinutes, 0);
  }

  get totalPrice() {
    return this.selectedServices.reduce((acc, s) => acc + s.price, 0);
  }

  // Logic
  toggleService(service: BarberService) {
    const index = this.selectedServices.findIndex(s => s.id === service.id);
    if (index >= 0) {
      this.selectedServices.splice(index, 1);
    } else {
      this.selectedServices.push(service);
    }
    // Si cambian los servicios, resetear slot
    this.selectedSlot = null;
    if (this.step === 2) this.onDateChange();
  }

  isSelected(service: BarberService) {
    return this.selectedServices.some(s => s.id === service.id);
  }

  goToStep(step: number) {
    if (step === 2 && !this.selectedDate) {
      this.selectedDate = this.minDate;
      this.onDateChange();
    }
    this.step = step;
  }

  async onDateChange() {
    if (!this.selectedDate) return;
    this.loadingSlots = true;
    this.selectedSlot = null;

    try {
      const dateObj = new Date(this.selectedDate + 'T00:00:00'); // Local time rough fix
      const existingAppts = await this.appointmentsService.getAppointmentsByDate(dateObj);
      this.generateSlots(dateObj, existingAppts);
    } catch (e) {
      console.error(e);
    } finally {
      this.loadingSlots = false;
    }
  }

  generateSlots(date: Date, appointments: Appointment[]) {
    // Config: 10:00 to 19:00
    const startHour = 10;
    const endHour = 19;
    const interval = 30; // min

    const slots: Date[] = [];
    const now = new Date(); // To avoid past slots today

    let current = new Date(date);
    current.setHours(startHour, 0, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(endHour, 0, 0, 0);

    const neededDuration = this.totalDuration;

    while (current < endTime) {
      // Check if slot is in the past
      if (current < now) {
        current = new Date(current.getTime() + interval * 60000);
        continue;
      }

      // Calculate potential end of this service
      const slotEnd = new Date(current.getTime() + neededDuration * 60000);

      if (slotEnd > endTime) break; // Exceeds business hours

      // Check overlapping
      const isOverlapping = appointments.some(appt => {
        const apptStart = appt.startAt;
        const apptEnd = appt.endAt;

        // Overlap logic: (StartA < EndB) && (EndA > StartB)
        return (current < apptEnd) && (slotEnd > apptStart) && ['PENDING', 'CONFIRMED'].includes(appt.status);
      });

      if (!isOverlapping) {
        slots.push(new Date(current));
      }

      current = new Date(current.getTime() + interval * 60000);
    }

    this.availableSlots = slots;
  }

  selectSlot(slot: Date) {
    this.selectedSlot = slot;
  }

  async confirmBooking() {
    if (!this.selectedSlot || !this.authService.currentUserSig()) return;

    this.isSubmitting = true;
    const user = this.authService.currentUserSig()!;

    const newAppt: Appointment = {
      clientId: user.uid,
      clientName: user.displayName || 'Cliente',
      startAt: this.selectedSlot,
      endAt: new Date(this.selectedSlot.getTime() + this.totalDuration * 60000),
      totalDurationMinutes: this.totalDuration,
      totalPrice: this.totalPrice,
      status: 'PENDING',
      services: this.selectedServices.map(s => ({ serviceId: s.id!, name: s.name, price: s.price })),
      createdAt: new Date()
    };

    try {
      await this.appointmentsService.createAppointment(newAppt);
      this.router.navigate(['/client/dashboard']);
    } catch (e) {
      console.error(e);
      alert('Error al reservar. Intenta nuevamente.');
    } finally {
      this.isSubmitting = false;
    }
  }
}
