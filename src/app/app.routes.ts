import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ClientDashboardComponent } from './features/client/client-dashboard/client-dashboard.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { WarehouseDashboardComponent } from './features/warehouse/warehouse-dashboard/warehouse-dashboard.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { Role } from './shared/models/auth.models';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: 'client',
    component: ClientDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.CLIENT] }
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.ADMIN] }
  },
  {
    path: 'warehouse',
    component: WarehouseDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.WAREHOUSE_MANAGER] }
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
