import { Injectable, inject, NgZone } from '@angular/core';
import { getFirestore, Firestore, collection, addDoc, updateDoc, doc, deleteDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Observable } from 'rxjs';

export interface BarberService {
  id?: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BarberServicesService {
  private firestore: Firestore = getFirestore();
  private collectionName = 'services';
  private ngZone = inject(NgZone);

  getServices(): Observable<BarberService[]> {
    return new Observable<BarberService[]>(subscriber => {
      const colRef = collection(this.firestore, this.collectionName);
      const q = query(colRef, orderBy('name'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        this.ngZone.run(() => {
          const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BarberService));
          subscriber.next(services);
        });
      }, (error) => {
        subscriber.error(error);
      });

      return unsubscribe;
    });
  }

  getActiveServices(): Observable<BarberService[]> {
    return new Observable<BarberService[]>(subscriber => {
      const colRef = collection(this.firestore, this.collectionName);
      const q = query(colRef, where('isActive', '==', true), orderBy('name'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        this.ngZone.run(() => {
          const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BarberService));
          subscriber.next(services);
        });
      }, (error) => {
        subscriber.error(error);
      });

      return unsubscribe;
    });
  }

  addService(service: BarberService) {
    const colRef = collection(this.firestore, this.collectionName);
    return addDoc(colRef, service);
  }

  updateService(id: string, service: Partial<BarberService>) {
    const docRef = doc(this.firestore, this.collectionName, id);
    return updateDoc(docRef, service);
  }

  deleteService(id: string) {
    const docRef = doc(this.firestore, this.collectionName, id);
    return deleteDoc(docRef);
  }
}
