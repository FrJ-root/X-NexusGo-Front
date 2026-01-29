import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { Role } from './shared/models/auth.models'; // or business.models if you merged them
import { AppLayoutComponent } from './core/layout/app-layout/app-layout.component';

export const routes: Routes = [
  // === PUBLIC ROUTES ===
  {
    path: '',
    loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },

  // === PROTECTED ROUTES (Inside App Layout) ===
  {
    path: '',
    component: AppLayoutComponent, // Wraps content with Sidebar/Header
    canActivate: [authGuard],      // Must be logged in
    children: [
      // CLIENT DASHBOARD
            {
              path: 'client',
              canActivate: [roleGuard],
              data: { roles: [Role.CLIENT] },
              children: [ // Use children for sub-pages
                  { path: '', loadComponent: () => import('./features/client/client-dashboard/client-dashboard').then(m => m.ClientDashboard) },
                  { path: 'products', loadComponent: () => import('./features/client/product-list/product-list.component').then(m => m.ProductListComponent) }
              ]
            },
      // WAREHOUSE DASHBOARD
      {
        path: 'warehouse',
        canActivate: [roleGuard],
        data: { roles: [Role.WAREHOUSE_MANAGER] },
        loadComponent: () => import('./features/warehouse/warehouse-dashboard/warehouse-dashboard').then(m => m.WarehouseDashboard)
      },
      // ADMIN DASHBOARD
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN] },
        loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard)
      }
    ]
  },

  // === ERRORS ===
  {
    path: 'unauthorized',
    loadComponent: () => import('./core/layout/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./core/layout/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
