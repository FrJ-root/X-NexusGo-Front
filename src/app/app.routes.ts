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
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
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
          { path: 'products', loadComponent: () => import('./features/client/product-list/product-list.component').then(m => m.ProductListComponent) },
          { path: 'orders', loadComponent: () => import('./features/client/order-list/order-list.component').then(m => m.OrderListComponent) },
          { path: 'orders/:id', loadComponent: () => import('./features/client/order-detail/order-detail.component').then(m => m.OrderDetailComponent) },
          { path: 'cart', loadComponent: () => import('./features/client/cart-summary/cart-summary.component').then(m => m.CartSummaryComponent) },
          { path: 'shipments', loadComponent: () => import('./features/client/shipment-tracking/shipment-tracking.component').then(m => m.ShipmentTrackingComponent) }
        ]
      },
      // WAREHOUSE DASHBOARD
      {
        path: 'warehouse',
        canActivate: [roleGuard],
        data: { roles: [Role.WAREHOUSE_MANAGER] },
        children: [
          { path: '', loadComponent: () => import('./features/warehouse/warehouse-dashboard/warehouse-dashboard').then(m => m.WarehouseDashboard) },
          { path: 'inventory', loadComponent: () => import('./features/warehouse/inventory-list/inventory-list.component').then(m => m.InventoryListComponent) },
          { path: 'movements/new', loadComponent: () => import('./features/warehouse/movement-form/movement-form.component').then(m => m.MovementFormComponent) },
          { path: 'orders', loadComponent: () => import('./features/warehouse/order-fulfillment/order-fulfillment.component').then(m => m.OrderFulfillmentListComponent) },
          { path: 'shipments/new', loadComponent: () => import('./features/warehouse/shipment-form/shipment-form.component').then(m => m.ShipmentFormComponent) }
        ]
      },
      // ADMIN DASHBOARD
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN] },
        children: [
          { path: '', loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard) },
          { path: 'users', loadComponent: () => import('./features/admin/user-list/user-list.component').then(m => m.UserListComponent) },
          { path: 'products', loadComponent: () => import('./features/admin/product-crud/product-crud.component').then(m => m.ProductCrudComponent) },
          { path: 'warehouses', loadComponent: () => import('./features/admin/warehouse-crud/warehouse-crud.component').then(m => m.WarehouseCrudComponent) },
          { path: 'suppliers', loadComponent: () => import('./features/admin/supplier-crud/supplier-crud.component').then(m => m.SupplierCrudComponent) },
          { path: 'purchase-orders', loadComponent: () => import('./features/admin/purchase-order-crud/purchase-order-crud.component').then(m => m.PurchaseOrderCrudComponent) },
          { path: 'orders', loadComponent: () => import('./features/admin/admin-orders/admin-orders.component').then(m => m.AdminOrdersComponent) },
          { path: 'reporting', loadComponent: () => import('./features/admin/reporting/reporting.component').then(m => m.ReportingComponent) }
        ]
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
