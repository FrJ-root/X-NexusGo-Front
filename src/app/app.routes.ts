import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { Role } from './shared/models/auth.models';

export const routes: Routes = [
  // Public routes (Landing pages)
  {
    path: '',
    loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'features',
    loadComponent: () => import('./features/public/features/features.component').then(m => m.FeaturesComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./features/public/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/public/contact/contact.component').then(m => m.ContactComponent)
  },

  // Auth routes (public)
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'register', 
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) 
  },

  // Admin routes
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.ADMIN] },
    loadComponent: () => import('./core/layout/app-layout/app-layout.component').then(m => m.AppLayoutComponent),
    children: [
      { 
        path: '', 
        loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) 
      },
      { 
        path: 'users', 
        loadComponent: () => import('./features/admin/admin-users/admin-users.component').then(m => m.AdminUsersComponent) 
      },
      { 
        path: 'products', 
        loadComponent: () => import('./features/admin/admin-products/admin-products.component').then(m => m.AdminProductsComponent) 
      },
      { 
        path: 'warehouses', 
        loadComponent: () => import('./features/admin/admin-warehouses/admin-warehouses.component').then(m => m.AdminWarehousesComponent) 
      },
      { 
        path: 'suppliers', 
        loadComponent: () => import('./features/admin/admin-suppliers/admin-suppliers.component').then(m => m.AdminSuppliersComponent) 
      },
      { 
        path: 'purchase-orders', 
        loadComponent: () => import('./features/admin/admin-purchase-orders/admin-purchase-orders.component').then(m => m.AdminPurchaseOrdersComponent) 
      },
      { 
        path: 'orders', 
        loadComponent: () => import('./features/admin/admin-orders/admin-orders.component').then(m => m.AdminOrdersComponent) 
      },
      { 
        path: 'reporting', 
        loadComponent: () => import('./features/admin/admin-reporting/admin-reporting.component').then(m => m.AdminReportingComponent) 
      }
    ]
  },

  // Warehouse Manager routes
  {
    path: 'warehouse',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.WAREHOUSE_MANAGER] },
    loadComponent: () => import('./core/layout/app-layout/app-layout.component').then(m => m.AppLayoutComponent),
    children: [
      { 
        path: '', 
        loadComponent: () => import('./features/warehouse/warehouse-dashboard/warehouse-dashboard.component').then(m => m.WarehouseDashboardComponent) 
      },
      { 
        path: 'inventory', 
        loadComponent: () => import('./features/warehouse/warehouse-inventory/warehouse-inventory.component').then(m => m.WarehouseInventoryComponent) 
      },
      { 
        path: 'movements', 
        loadComponent: () => import('./features/warehouse/warehouse-movements/warehouse-movements.component').then(m => m.WarehouseMovementsComponent) 
      },
      { 
        path: 'orders', 
        loadComponent: () => import('./features/warehouse/warehouse-orders/warehouse-orders.component').then(m => m.WarehouseOrdersComponent) 
      },
      { 
        path: 'shipments', 
        loadComponent: () => import('./features/warehouse/warehouse-shipments/warehouse-shipments.component').then(m => m.WarehouseShipmentsComponent) 
      }
    ]
  },

  // Client routes
  {
    path: 'client',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.CLIENT] },
    loadComponent: () => import('./core/layout/app-layout/app-layout.component').then(m => m.AppLayoutComponent),
    children: [
      { 
        path: '', 
        loadComponent: () => import('./features/client/client-dashboard/client-dashboard.component').then(m => m.ClientDashboardComponent) 
      },
      { 
        path: 'products', 
        loadComponent: () => import('./features/client/client-products/client-products.component').then(m => m.ClientProductsComponent) 
      },
      { 
        path: 'orders', 
        loadComponent: () => import('./features/client/client-orders/client-orders.component').then(m => m.ClientOrdersComponent) 
      },
      { 
        path: 'orders/create', 
        loadComponent: () => import('./features/client/order-create/order-create.component').then(m => m.OrderCreateComponent) 
      },
      { 
        path: 'shipments', 
        loadComponent: () => import('./features/client/client-shipments/client-shipments.component').then(m => m.ClientShipmentsComponent) 
      }
    ]
  },

  // Utility routes
  { 
    path: 'unauthorized', 
    loadComponent: () => import('./core/layout/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent) 
  },

  // Wildcard route (must be last)
  { 
    path: '**', 
    loadComponent: () => import('./core/layout/not-found/not-found.component').then(m => m.NotFoundComponent) 
  }
];
