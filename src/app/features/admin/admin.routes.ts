import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ServicesManagerComponent } from './services-manager/services-manager.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { EarningsComponent } from './earnings/earnings.component';

export const ADMIN_ROUTES: Routes = [
  { path: '', component: DashboardComponent }, // /admin
  { path: 'dashboard', component: DashboardComponent },
  { path: 'schedule', component: ScheduleComponent },
  { path: 'earnings', component: EarningsComponent },
  { path: 'services', component: ServicesManagerComponent }
];
