import { Injectable, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { collection, getDocs, addDoc, updateDoc, doc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { from, Observable, map } from 'rxjs';

export interface Appointment {
  id?: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  startAt: Date;
  endAt: Date;
  totalDurationMinutes: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  services: {
    serviceId: string;
    name: string;
    price: number;
  }[];
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {
  private firestore = inject(Firestore);
  private collectionName = 'appointments';

  // Helper to convert Firestore data to typed Appointment
  private convertToAppointment(doc: any): Appointment {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      startAt: data.startAt instanceof Timestamp ? data.startAt.toDate() : data.startAt,
      endAt: data.endAt instanceof Timestamp ? data.endAt.toDate() : data.endAt,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt
    } as Appointment;
  }

  // Obtener citas de un cliente específico
  getClientAppointments(clientId: string): Observable<Appointment[]> {
    const colRef = collection(this.firestore, this.collectionName);
    const q = query(
      colRef,
      where('clientId', '==', clientId),
      orderBy('startAt', 'desc')
    );
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => this.convertToAppointment(doc)))
    );
  }

  // Obtener citas pendientes (Admin)
  getPendingAppointments(): Observable<Appointment[]> {
    const colRef = collection(this.firestore, this.collectionName);
    const q = query(
      colRef,
      where('status', '==', 'PENDING'),
      orderBy('startAt', 'asc')
    );
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => this.convertToAppointment(doc)))
    );
  }

  // Obtener citas confirmadas y completadas (Admin - Agenda)
  getConfirmedAppointments(): Observable<Appointment[]> {
    const colRef = collection(this.firestore, this.collectionName);
    const q = query(
      colRef,
      where('status', 'in', ['CONFIRMED', 'COMPLETED']),
      orderBy('startAt', 'asc')
    );
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => this.convertToAppointment(doc)))
    );
  }

  // Obtener citas completadas por mes (Admin - Ganancias)
  async getCompletedAppointmentsByMonth(month: number, year: number): Promise<Appointment[]> {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const colRef = collection(this.firestore, this.collectionName);
    // QUERY SIMPLE: Solo por status.
    // Filtramos las fechas en memoria para no requerir indices compuestos.
    const q = query(
      colRef,
      where('status', '==', 'COMPLETED')
    );

    const snapshot = await getDocs(q);
    const appointments = snapshot.docs.map(doc => this.convertToAppointment(doc));

    // Filtrar y ordenar en memoria
    return appointments
      .filter(appt => appt.startAt >= startOfMonth && appt.startAt <= endOfMonth)
      .sort((a, b) => b.startAt.getTime() - a.startAt.getTime());
  }

  // Obtener citas de una fecha para verificar disponibilidad (Admin también lo usa)
  async getAppointmentsByDate(date: Date): Promise<Appointment[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const colRef = collection(this.firestore, this.collectionName);
    const q = query(
      colRef,
      where('startAt', '>=', Timestamp.fromDate(startOfDay)),
      where('startAt', '<=', Timestamp.fromDate(endOfDay)),
      orderBy('startAt', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => this.convertToAppointment(doc));
  }

  // Crear nueva cita
  createAppointment(appointment: Appointment) {
    const colRef = collection(this.firestore, this.collectionName);
    return from(addDoc(colRef, appointment));
  }

  // Actualizar estado (para cancelar o confirmar)
  updateStatus(id: string, status: Appointment['status']) {
    const docRef = doc(this.firestore, this.collectionName, id);
    return from(updateDoc(docRef, { status }));
  }
}
