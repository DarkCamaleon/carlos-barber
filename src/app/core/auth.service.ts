import { Injectable, inject, signal } from '@angular/core';
import { Auth, user, User } from '@angular/fire/auth';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { Firestore } from '@angular/fire/firestore';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { Router } from '@angular/router';
import { Observable, of, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role: 'admin' | 'client';
  createdAt?: Date;
  lastLoginAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  // Observable base del usuario de Auth
  user$: Observable<User | null> = user(this.auth);

  // Signal para acceder al perfil actual síncronamente en la UI
  currentUserSig = signal<UserProfile | null>(null);

  constructor() {
    // Suscribirse al perfil y actualizar el signal
    this.getUserProfile().subscribe(profile => {
      this.currentUserSig.set(profile);
    });
  }

  // Obtiene el perfil de Firestore en tiempo real asociado al usuario actual
  getUserProfile(): Observable<UserProfile | null> {
    return this.user$.pipe(
      switchMap(user => {
        if (!user) {
          return of(null);
        }
        const userRef = doc(this.firestore, 'users', user.uid);
        return new Observable<UserProfile | null>(observer => {
          const unsubscribe = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
              observer.next(snapshot.data() as UserProfile);
            } else {
              observer.next(null);
            }
          }, (error) => {
            observer.error(error);
          });
          return () => unsubscribe();
        });
      })
    );
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      await this.syncUserProfile(result.user);
    } catch (error) {
      console.error('Error logging in with Google', error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      await this.syncUserProfile(result.user);
      return result.user;
    } catch (error) {
      console.error('Error logging in', error);
      throw error;
    }
  }

  async register(email: string, pass: string, name: string) {
    try {
      const result = await createUserWithEmailAndPassword(this.auth, email, pass);
      await updateProfile(result.user, { displayName: name });

      // Crear perfil manualmente
      const newUserProfile: UserProfile = {
        uid: result.user.uid,
        email: email,
        displayName: name,
        photoURL: null,
        role: 'client',
        createdAt: new Date(),
        lastLoginAt: new Date()
      };

      await setDoc(doc(this.firestore, 'users', result.user.uid), newUserProfile);
      return newUserProfile;
    } catch (error) {
      console.error('Error registering', error);
      throw error;
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
      this.currentUserSig.set(null);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error logging out', error);
      throw error;
    }
  }

  private async syncUserProfile(user: User) {
    const userRef = doc(this.firestore, 'users', user.uid);

    try {
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        const newUserProfile: UserProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          // Cambiado a 'client' para mantener consistencia con esta app
          role: 'client',
          createdAt: new Date(),
          lastLoginAt: new Date()
        };
        await setDoc(userRef, newUserProfile);
        console.log('User profile created in Firestore for:', user.email);
      } else {
        await setDoc(userRef, { lastLoginAt: new Date() }, { merge: true });
        console.log('User profile updated in Firestore for:', user.email);
      }
    } catch (error) {
      console.error('Error syncing user profile:', error);
    }
  }
}

