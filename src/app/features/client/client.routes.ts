import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BookingWizardComponent } from './booking-wizard/booking-wizard.component';
import { ProfileComponent } from './profile/profile.component';

export const CLIENT_ROUTES: Routes = [
  { path: '', component: DashboardComponent }, // /client
  { path: 'dashboard', component: DashboardComponent },
  { path: 'book', component: BookingWizardComponent },
  { path: 'profile', component: ProfileComponent }
];
