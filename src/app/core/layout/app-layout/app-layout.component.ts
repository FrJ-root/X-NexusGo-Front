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
  badge?: string;
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
          <a routerLink="/" class="logo">
            <div class="logo-icon-wrapper">
              <svg class="logo-icon" viewBox="0 0 32 32" width="36" height="36"><rect width="32" height="32" rx="8" fill="url(#logoGrad)"/><path d="M8 22 L16 10 L24 22" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="18" r="3" fill="#fff"/><defs><linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#ff6600"/><stop offset="100%" style="stop-color:#ff8533"/></linearGradient></defs></svg>
              <div class="logo-glow"></div>
            </div>
            @if (!sidebarCollapsed()) {
              <div class="logo-text-wrapper">
                <span class="logo-text">X-NexusGo</span>
                <span class="logo-tagline">Logistics Platform</span>
              </div>
            }
          </a>
          <button class="toggle-btn" (click)="toggleSidebar()" [attr.title]="sidebarCollapsed() ? 'Expand sidebar' : 'Collapse sidebar'">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              @if (sidebarCollapsed()) {
                <path d="m9 18 6-6-6-6"/>
              } @else {
                <path d="m15 18-6-6 6-6"/>
              }
            </svg>
          </button>
        </div>

        <div class="sidebar-divider"></div>

        <nav class="sidebar-nav">
          <div class="nav-section">
            @if (!sidebarCollapsed()) {
              <span class="nav-section-title">Menu Principal</span>
            }
            @for (item of menuItems(); track item.route; let i = $index) {
              <a 
                class="nav-item" 
                [routerLink]="item.route"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{exact: item.route.endsWith('/admin') || item.route.endsWith('/warehouse') || item.route.endsWith('/client')}"
                [attr.title]="sidebarCollapsed() ? item.label : null"
                [style.animation-delay]="(i * 0.05) + 's'"
              >
                <div class="nav-icon-wrapper">
                  <span class="nav-icon" [innerHTML]="item.icon"></span>
                  <span class="nav-icon-bg"></span>
                </div>
                @if (!sidebarCollapsed()) {
                  <span class="nav-label">{{ item.label }}</span>
                  @if (item.badge) {
                    <span class="nav-badge">{{ item.badge }}</span>
                  }
                }
                <span class="nav-indicator"></span>
              </a>
            }
          </div>
        </nav>

        <div class="sidebar-footer">
          <div class="user-card">
            <div class="user-avatar-wrapper">
              <div class="user-avatar">{{ userName().charAt(0).toUpperCase() }}</div>
              <span class="user-status"></span>
            </div>
            @if (!sidebarCollapsed()) {
              <div class="user-details">
                <span class="user-name">{{ userName() }}</span>
                <span class="user-role-badge">
                  <span class="role-dot"></span>
                  {{ userRole() }}
                </span>
              </div>
            }
          </div>
          <button class="logout-btn" (click)="logout()" [attr.title]="sidebarCollapsed() ? 'Déconnexion' : null">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
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
            <button class="mobile-menu-btn" (click)="toggleSidebar()">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
            </button>
            <div class="breadcrumb">
              <span class="breadcrumb-home">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
              </span>
              <span class="breadcrumb-separator">/</span>
              <h1 class="page-title">{{ pageTitle() }}</h1>
            </div>
          </div>
          <div class="header-right">
            <div class="header-badge" title="Notifications">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              <span class="notification-dot"></span>
            </div>
            <div class="header-divider"></div>
            <div class="user-info">
              <div class="user-info-text">
                <span class="user-name-header">{{ userName() }}</span>
                <span class="user-role">{{ userRole() }}</span>
              </div>
              <div class="user-avatar-header">{{ userName().charAt(0).toUpperCase() }}</div>
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
    :host {
      --primary: #001f3f;
      --primary-dark: #001428;
      --primary-light: #003366;
      --secondary: #ff6600;
      --secondary-light: #ff8533;
      --secondary-dark: #cc5200;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --gray-50: #f8fafc;
      --gray-100: #f1f5f9;
      --gray-200: #e2e8f0;
      --gray-300: #cbd5e1;
      --gray-400: #94a3b8;
      --gray-500: #64748b;
      --gray-600: #475569;
      --gray-700: #334155;
      --gray-800: #1e293b;
      --gray-900: #0f172a;
      --white: #ffffff;
    }

    @keyframes fadeInLeft {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes pulseGlow {
      0%, 100% { box-shadow: 0 0 20px rgba(255, 102, 0, 0.3); }
      50% { box-shadow: 0 0 30px rgba(255, 102, 0, 0.5); }
    }

    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }

    .app-layout {
      display: flex;
      min-height: 100vh;
      background: linear-gradient(135deg, var(--gray-50) 0%, var(--gray-100) 100%);
    }

    /* Sidebar */
    .sidebar {
      width: 280px;
      background: linear-gradient(180deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: white;
      display: flex;
      flex-direction: column;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      z-index: 100;
      box-shadow: 4px 0 30px rgba(0, 31, 63, 0.25);
      overflow: hidden;
    }

    .sidebar::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(ellipse at top left, rgba(255, 102, 0, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at bottom right, rgba(255, 102, 0, 0.05) 0%, transparent 50%);
      pointer-events: none;
    }

    .sidebar-collapsed .sidebar {
      width: 84px;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1rem;
      position: relative;
      z-index: 1;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      text-decoration: none;
      color: white;
    }

    .logo-icon-wrapper {
      position: relative;
      flex-shrink: 0;
    }

    .logo-icon {
      filter: drop-shadow(0 4px 8px rgba(255, 102, 0, 0.3));
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .logo-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100%;
      height: 100%;
      transform: translate(-50%, -50%);
      background: radial-gradient(circle, rgba(255, 102, 0, 0.4) 0%, transparent 70%);
      border-radius: 50%;
      animation: pulseGlow 3s ease-in-out infinite;
      opacity: 0;
      transition: opacity 0.3s;
    }

    .logo:hover .logo-glow {
      opacity: 1;
    }

    .logo:hover .logo-icon {
      transform: scale(1.1) rotate(-5deg);
    }

    .logo-text-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .logo-text {
      font-size: 1.35rem;
      font-weight: 800;
      background: linear-gradient(135deg, #fff 0%, #ff6600 50%, #fff 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 3s ease-in-out infinite;
      letter-spacing: -0.02em;
    }

    .logo-tagline {
      font-size: 0.65rem;
      color: rgba(255, 255, 255, 0.5);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .toggle-btn {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.7);
      width: 36px;
      height: 36px;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(4px);
    }

    .toggle-btn:hover {
      background: var(--secondary);
      border-color: var(--secondary);
      color: white;
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(255, 102, 0, 0.4);
    }

    .sidebar-divider {
      height: 1px;
      margin: 0 1rem;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0.75rem;
      overflow-y: auto;
      position: relative;
      z-index: 1;
    }

    .sidebar-nav::-webkit-scrollbar {
      width: 4px;
    }

    .sidebar-nav::-webkit-scrollbar-track {
      background: transparent;
    }

    .sidebar-nav::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }

    .nav-section {
      margin-bottom: 1rem;
    }

    .nav-section-title {
      display: block;
      padding: 0.5rem 1rem 0.75rem;
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(255, 255, 255, 0.35);
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 0.8rem 1rem;
      color: rgba(255, 255, 255, 0.65);
      text-decoration: none;
      border-radius: 12px;
      margin-bottom: 0.25rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      animation: fadeInLeft 0.4s ease-out forwards;
      opacity: 0;
    }

    .nav-icon-wrapper {
      position: relative;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .nav-icon-bg {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      transition: all 0.3s;
    }

    .nav-icon {
      position: relative;
      z-index: 1;
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
    }

    .nav-icon svg {
      width: 20px;
      height: 20px;
    }

    .nav-label {
      font-size: 0.875rem;
      font-weight: 500;
      white-space: nowrap;
      transition: all 0.3s;
    }

    .nav-badge {
      margin-left: auto;
      padding: 0.125rem 0.5rem;
      background: var(--secondary);
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      border-radius: 10px;
      min-width: 20px;
      text-align: center;
    }

    .nav-indicator {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 0;
      background: linear-gradient(180deg, var(--secondary-light), var(--secondary));
      border-radius: 0 4px 4px 0;
      transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.08);
      color: white;
      transform: translateX(4px);
    }

    .nav-item:hover .nav-icon-bg {
      background: rgba(255, 102, 0, 0.15);
    }

    .nav-item:hover .nav-indicator {
      height: 50%;
    }

    .nav-item:hover .nav-icon {
      color: var(--secondary);
      animation: float 2s ease-in-out infinite;
    }

    .nav-item.active {
      background: linear-gradient(135deg, rgba(255, 102, 0, 0.2) 0%, rgba(255, 102, 0, 0.1) 100%);
      color: white;
      border: 1px solid rgba(255, 102, 0, 0.3);
    }

    .nav-item.active .nav-icon-bg {
      background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-dark) 100%);
      box-shadow: 0 4px 12px rgba(255, 102, 0, 0.4);
    }

    .nav-item.active .nav-icon {
      color: white;
    }

    .nav-item.active .nav-indicator {
      height: 60%;
      box-shadow: 0 0 8px var(--secondary);
    }

    .nav-item.active .nav-label {
      font-weight: 600;
    }

    .sidebar-footer {
      padding: 1rem 0.75rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      position: relative;
      z-index: 1;
      background: rgba(0, 0, 0, 0.1);
    }

    .user-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      margin-bottom: 0.75rem;
      transition: all 0.3s;
    }

    .user-card:hover {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.05) 100%);
      border-color: rgba(255, 102, 0, 0.2);
    }

    .user-avatar-wrapper {
      position: relative;
      flex-shrink: 0;
    }

    .user-avatar {
      width: 42px;
      height: 42px;
      background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-dark) 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.1rem;
      box-shadow: 0 4px 12px rgba(255, 102, 0, 0.3);
      transition: all 0.3s;
    }

    .user-card:hover .user-avatar {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(255, 102, 0, 0.4);
    }

    .user-status {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 12px;
      height: 12px;
      background: var(--success);
      border: 2px solid var(--primary-dark);
      border-radius: 50%;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      gap: 0.25rem;
    }

    .user-name {
      font-size: 0.9rem;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role-badge {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.7rem;
      color: var(--secondary-light);
      font-weight: 500;
    }

    .role-dot {
      width: 6px;
      height: 6px;
      background: var(--secondary);
      border-radius: 50%;
      animation: pulseGlow 2s ease-in-out infinite;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.875rem 1rem;
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%);
      color: #fca5a5;
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 12px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .logout-btn:hover {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(239, 68, 68, 0.15) 100%);
      border-color: rgba(239, 68, 68, 0.4);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
      color: #fecaca;
    }

    .logout-btn svg {
      transition: transform 0.3s;
    }

    .logout-btn:hover svg {
      transform: translateX(3px);
    }

    /* Main wrapper */
    .main-wrapper {
      flex: 1;
      margin-left: 280px;
      display: flex;
      flex-direction: column;
      transition: margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .sidebar-collapsed .main-wrapper {
      margin-left: 84px;
    }

    /* Header */
    .header {
      background: var(--white);
      padding: 0.875rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 12px rgba(0, 31, 63, 0.06);
      position: sticky;
      top: 0;
      z-index: 50;
      border-bottom: 1px solid var(--gray-200);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .mobile-menu-btn {
      display: none;
      background: none;
      border: none;
      color: var(--gray-600);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .mobile-menu-btn:hover {
      background: var(--gray-100);
      color: var(--primary);
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .breadcrumb-home {
      color: var(--gray-400);
      display: flex;
      align-items: center;
    }

    .breadcrumb-separator {
      color: var(--gray-300);
      font-size: 0.875rem;
    }

    .page-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--primary);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .header-badge {
      position: relative;
      width: 42px;
      height: 42px;
      background: var(--gray-100);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--gray-600);
      cursor: pointer;
      transition: all 0.3s;
    }

    .header-badge:hover {
      background: var(--primary);
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 31, 63, 0.15);
    }

    .notification-dot {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 8px;
      height: 8px;
      background: var(--danger);
      border-radius: 50%;
      border: 2px solid white;
    }

    .header-divider {
      width: 1px;
      height: 28px;
      background: var(--gray-200);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-info-text {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.125rem;
    }

    .user-role {
      font-size: 0.7rem;
      color: var(--gray-500);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .user-name-header {
      color: var(--gray-800);
      font-weight: 600;
      font-size: 0.875rem;
    }

    .user-avatar-header {
      width: 42px;
      height: 42px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
      color: white;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1rem;
      transition: all 0.3s;
      cursor: pointer;
    }

    .user-avatar-header:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0, 31, 63, 0.2);
    }

    /* Main content */
    .main-content {
      flex: 1;
      padding: 2rem;
    }

    /* Collapsed sidebar adjustments */
    .sidebar-collapsed .nav-item {
      justify-content: center;
      padding: 0.8rem;
    }

    .sidebar-collapsed .nav-icon-wrapper {
      width: 40px;
      height: 40px;
    }

    .sidebar-collapsed .user-card {
      justify-content: center;
      padding: 0.75rem;
    }

    .sidebar-collapsed .logout-btn {
      padding: 0.75rem;
    }

    @media (max-width: 1024px) {
      .sidebar {
        transform: translateX(-100%);
      }

      .sidebar-collapsed .sidebar {
        transform: translateX(0);
        width: 280px;
      }

      .main-wrapper {
        margin-left: 0;
      }

      .sidebar-collapsed .main-wrapper {
        margin-left: 0;
      }

      .mobile-menu-btn {
        display: flex;
      }
    }

    @media (max-width: 640px) {
      .header {
        padding: 1rem;
      }

      .main-content {
        padding: 1rem;
      }

      .user-role {
        display: none;
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
    { label: 'Dashboard', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>', route: '/admin', roles: [Role.ADMIN] },
    { label: 'Utilisateurs', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>', route: '/admin/users', roles: [Role.ADMIN], badge: 'New' },
    { label: 'Produits', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>', route: '/admin/products', roles: [Role.ADMIN] },
    { label: 'Entrepôts', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><rect width="4" height="7" x="7" y="10" rx="1"/><rect width="4" height="12" x="15" y="5" rx="1"/></svg>', route: '/admin/warehouses', roles: [Role.ADMIN] },
    { label: 'Fournisseurs', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>', route: '/admin/suppliers', roles: [Role.ADMIN] },
    { label: 'Achats', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>', route: '/admin/purchase-orders', roles: [Role.ADMIN] },
    { label: 'Commandes', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>', route: '/admin/orders', roles: [Role.ADMIN] },
    { label: 'Reporting', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>', route: '/admin/reporting', roles: [Role.ADMIN] },
    
    // Warehouse Manager menu items
    { label: 'Dashboard', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>', route: '/warehouse', roles: [Role.WAREHOUSE_MANAGER] },
    { label: 'Inventaire', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>', route: '/warehouse/inventory', roles: [Role.WAREHOUSE_MANAGER] },
    { label: 'Mouvements', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/></svg>', route: '/warehouse/movements', roles: [Role.WAREHOUSE_MANAGER] },
    { label: 'Commandes', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>', route: '/warehouse/orders', roles: [Role.WAREHOUSE_MANAGER] },
    { label: 'Expéditions', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>', route: '/warehouse/shipments', roles: [Role.WAREHOUSE_MANAGER] },

    // Client menu items
    { label: 'Accueil', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>', route: '/client', roles: [Role.CLIENT] },
    { label: 'Produits', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>', route: '/client/products', roles: [Role.CLIENT] },
    { label: 'Mes Commandes', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>', route: '/client/orders', roles: [Role.CLIENT] },
    { label: 'Suivi Livraisons', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>', route: '/client/shipments', roles: [Role.CLIENT] },
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
