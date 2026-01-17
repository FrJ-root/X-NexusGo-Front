import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TokenService } from '../../auth/token.service';
import { AuthService } from '../../auth/auth.service';
import { Role } from '../../../shared/models/auth.models';
import { ToastComponent } from '../../../shared/components/toast/toast.component';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: Role[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  template: `
    <div class="app-layout" [class.sidebar-collapsed]="sidebarCollapsed()">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <span class="logo-icon">📦</span>
            @if (!sidebarCollapsed()) {
              <span class="logo-text">Logistics</span>
            }
          </div>
          <button class="toggle-btn" (click)="toggleSidebar()">
            {{ sidebarCollapsed() ? '→' : '←' }}
          </button>
        </div>

        <nav class="sidebar-nav">
          @for (item of menuItems(); track item.route) {
            <a 
              class="nav-item" 
              [routerLink]="item.route"
              routerLinkActive="active"
            >
              <span class="nav-icon">{{ item.icon }}</span>
              @if (!sidebarCollapsed()) {
                <span class="nav-label">{{ item.label }}</span>
              }
            </a>
          }
        </nav>

        <div class="sidebar-footer">
          <button class="logout-btn" (click)="logout()">
            <span class="nav-icon">🚪</span>
            @if (!sidebarCollapsed()) {
              <span class="nav-label">Déconnexion</span>
            }
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="main-wrapper">
        <!-- Header -->
        <header class="header">
          <div class="header-left">
            <h1 class="page-title">{{ pageTitle() }}</h1>
          </div>
          <div class="header-right">
            <div class="user-info">
              <span class="user-role">{{ userRole() }}</span>
              <span class="user-name">{{ userName() }}</span>
            </div>
          </div>
        </header>

        <!-- Content -->
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>

    <app-toast />
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      background: #f3f4f6;
    }

    .sidebar {
      width: 260px;
      background: #1e293b;
      color: white;
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      z-index: 100;
    }

    .sidebar-collapsed .sidebar {
      width: 72px;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-icon {
      font-size: 1.5rem;
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 700;
    }

    .toggle-btn {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .toggle-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0.75rem;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      border-radius: 8px;
      margin-bottom: 0.25rem;
      transition: all 0.2s;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .nav-item.active {
      background: #3b82f6;
      color: white;
    }

    .nav-icon {
      font-size: 1.25rem;
      width: 24px;
      text-align: center;
    }

    .nav-label {
      font-size: 0.875rem;
      font-weight: 500;
      white-space: nowrap;
    }

    .sidebar-footer {
      padding: 1rem 0.75rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.75rem 1rem;
      background: rgba(239, 68, 68, 0.2);
      color: #fca5a5;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .logout-btn:hover {
      background: rgba(239, 68, 68, 0.3);
    }

    .main-wrapper {
      flex: 1;
      margin-left: 260px;
      display: flex;
      flex-direction: column;
      transition: margin-left 0.3s ease;
    }

    .sidebar-collapsed .main-wrapper {
      margin-left: 72px;
    }

    .header {
      background: white;
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .page-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-role {
      padding: 0.25rem 0.75rem;
      background: #e0e7ff;
      color: #4338ca;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .user-name {
      color: #374151;
      font-weight: 500;
    }

    .main-content {
      flex: 1;
      padding: 2rem;
    }

    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
      }

      .sidebar-collapsed .sidebar {
        transform: translateX(-100%);
      }

      .main-wrapper {
        margin-left: 0;
      }

      .sidebar-collapsed .main-wrapper {
        margin-left: 0;
      }
    }
  `]
})
export class AppLayoutComponent implements OnInit {
  private router = inject(Router);
  private tokenService = inject(TokenService);
  private authService = inject(AuthService);

  sidebarCollapsed = signal(false);
  pageTitle = signal('Dashboard');
  userName = signal('');
  userRole = signal('');
  menuItems = signal<MenuItem[]>([]);

  private readonly allMenuItems: MenuItem[] = [
    // Admin menu items
    { label: 'Dashboard', icon: '📊', route: '/admin/dashboard', roles: [Role.ADMIN] },
    { label: 'Utilisateurs', icon: '👥', route: '/admin/users', roles: [Role.ADMIN] },
    { label: 'Produits', icon: '📦', route: '/admin/products', roles: [Role.ADMIN] },
    { label: 'Entrepôts', icon: '🏭', route: '/admin/warehouses', roles: [Role.ADMIN] },
    { label: 'Fournisseurs', icon: '🤝', route: '/admin/suppliers', roles: [Role.ADMIN] },
    { label: 'Achats', icon: '🛒', route: '/admin/purchase-orders', roles: [Role.ADMIN] },
    { label: 'Commandes', icon: '📋', route: '/admin/orders', roles: [Role.ADMIN] },
    { label: 'Reporting', icon: '📈', route: '/admin/reporting', roles: [Role.ADMIN] },
    
    // Warehouse Manager menu items
    { label: 'Dashboard', icon: '📊', route: '/warehouse/dashboard', roles: [Role.WAREHOUSE_MANAGER] },
    { label: 'Inventaire', icon: '📦', route: '/warehouse/inventory', roles: [Role.WAREHOUSE_MANAGER] },
    { label: 'Mouvements', icon: '↔️', route: '/warehouse/movements', roles: [Role.WAREHOUSE_MANAGER] },
    { label: 'Commandes', icon: '📋', route: '/warehouse/orders', roles: [Role.WAREHOUSE_MANAGER] },
    { label: 'Expéditions', icon: '🚚', route: '/warehouse/shipments', roles: [Role.WAREHOUSE_MANAGER] },

    // Client menu items
    { label: 'Accueil', icon: '🏠', route: '/client/dashboard', roles: [Role.CLIENT] },
    { label: 'Produits', icon: '📦', route: '/client/products', roles: [Role.CLIENT] },
    { label: 'Mes Commandes', icon: '📋', route: '/client/orders', roles: [Role.CLIENT] },
    { label: 'Suivi Livraisons', icon: '🚚', route: '/client/shipments', roles: [Role.CLIENT] },
  ];

  ngOnInit(): void {
    this.loadUserInfo();
    this.filterMenuItems();
  }

  private loadUserInfo(): void {
    const roles = this.tokenService.getUserRoles();
    const token = this.tokenService.getAccessToken();
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userName.set(payload.sub || payload.email || 'Utilisateur');
      } catch {
        this.userName.set('Utilisateur');
      }
    }

    if (roles.includes(Role.ADMIN)) {
      this.userRole.set('Administrateur');
    } else if (roles.includes(Role.WAREHOUSE_MANAGER)) {
      this.userRole.set('Gestionnaire');
    } else if (roles.includes(Role.CLIENT)) {
      this.userRole.set('Client');
    }
  }

  private filterMenuItems(): void {
    const roles = this.tokenService.getUserRoles();
    const filtered = this.allMenuItems.filter(item => 
      item.roles.some(r => roles.includes(r))
    );
    this.menuItems.set(filtered);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  logout(): void {
    this.authService.logout();
  }
}
