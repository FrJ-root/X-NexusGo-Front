import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { CommonModule } from '@angular/common';
import { Role } from '../../../shared/models/auth.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="auth-page">
      <!-- Left Side - Promo -->
      <div class="auth-left">
        <div class="promo-overlay"></div>

        <!-- Animated particles -->
        <div class="particles">
          @for (i of [1,2,3,4,5,6,7,8,9,10,11,12]; track i) {
            <div class="particle" [style.--delay]="i * 0.5 + 's'" [style.--duration]="(8 + i) + 's'"></div>
          }
        </div>

        <!-- Floating shapes -->
        <div class="floating-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>

        <!-- Animated truck -->
        <div class="truck-animation">
          <svg class="truck" viewBox="0 0 100 40" width="120" height="48">
            <rect x="5" y="15" width="45" height="20" rx="2" fill="#ff6600"/>
            <rect x="50" y="5" width="40" height="30" rx="3" fill="#001f3f"/>
            <circle cx="20" cy="37" r="6" fill="#333"/>
            <circle cx="20" cy="37" r="3" fill="#666"/>
            <circle cx="75" cy="37" r="6" fill="#333"/>
            <circle cx="75" cy="37" r="3" fill="#666"/>
            <rect x="55" y="10" width="15" height="12" rx="1" fill="rgba(255,255,255,0.3)"/>
            <rect x="72" y="10" width="15" height="12" rx="1" fill="rgba(255,255,255,0.3)"/>
          </svg>
          <div class="road"></div>
        </div>

        <div class="promo-content">
          <div class="promo-badge animate-fade-in">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            100% Sécurisé & Gratuit
          </div>

          <h2 class="promo-title animate-slide-up">
            Rejoignez la révolution<br>
            <span class="highlight">logistique</span>
          </h2>

          <p class="promo-description animate-slide-up delay-1">
            Créez votre compte en quelques secondes et commencez à optimiser vos opérations dès aujourd'hui.
          </p>

          <!-- Benefits -->
          <div class="benefits animate-slide-up delay-2">
            <div class="benefit">
              <div class="benefit-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <div class="benefit-content">
                <h4>Configuration rapide</h4>
                <p>Compte opérationnel en moins de 2 minutes</p>
              </div>
            </div>
            <div class="benefit">
              <div class="benefit-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <div class="benefit-content">
                <h4>Essai gratuit</h4>
                <p>30 jours d'essai sans engagement</p>
              </div>
            </div>
            <div class="benefit">
              <div class="benefit-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <div class="benefit-content">
                <h4>Support dédié</h4>
                <p>Équipe disponible 24/7 pour vous aider</p>
              </div>
            </div>
          </div>

          <!-- Trust badges -->
          <div class="trust-section animate-slide-up delay-3">
            <p class="trust-label">Ils nous font confiance</p>
            <div class="trust-logos">
              <span class="trust-logo">DHL</span>
              <span class="trust-logo">FedEx</span>
              <span class="trust-logo">Amazon</span>
              <span class="trust-logo">Shopify</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side - Form -->
      <div class="auth-right">
        <!-- Navbar -->
        <nav class="navbar">
          <a routerLink="/" class="logo">
            <svg class="logo-icon" viewBox="0 0 32 32" width="32" height="32"><rect width="32" height="32" rx="6" fill="#001f3f"/><path d="M8 22 L16 10 L24 22" stroke="#ff6600" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="18" r="3" fill="#ff6600"/></svg>
            <span class="logo-text">X-NexusGo</span>
          </a>
          <a routerLink="/" class="back-link">← Retour</a>
        </nav>

        <div class="form-container">
          <div class="form-wrapper">
            <div class="card-header">
              <div class="header-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
              </div>
              <h1>Créer un compte 🚀</h1>
              <p>Rejoignez notre réseau mondial de logistique</p>
            </div>

            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
              <div class="form-group">
                <label for="name">Nom complet</label>
                <div class="input-wrapper">
                  <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input
                    id="name"
                    type="text"
                    formControlName="name"
                    placeholder="Jean Dupont"
                    [class.invalid]="registerForm.get('name')?.invalid && registerForm.get('name')?.touched"
                  >
                </div>
                @if (registerForm.get('name')?.invalid && registerForm.get('name')?.touched) {
                  <span class="field-error">Nom requis</span>
                }
              </div>

              <div class="form-group">
                <label for="email">Adresse email</label>
                <div class="input-wrapper">
                  <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <input
                    id="email"
                    type="email"
                    formControlName="email"
                    placeholder="vous@exemple.com"
                    [class.invalid]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
                  >
                </div>
                @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
                  <span class="field-error">Email invalide</span>
                }
              </div>

              <div class="form-group">
                <label for="password">Mot de passe</label>
                <div class="input-wrapper">
                  <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input
                    id="password"
                    type="password"
                    formControlName="password"
                    placeholder="Min. 6 caractères"
                    [class.invalid]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                  >
                </div>
                @if (registerForm.get('password')?.value) {
                  <div class="password-strength">
                    <div class="strength-bar">
                      <div class="strength-fill" [class]="getStrengthClass()" [style.width.%]="getPasswordStrength() * 25"></div>
                    </div>
                    <span class="strength-text" [class]="getStrengthClass()">{{ getStrengthText() }}</span>
                  </div>
                }
              </div>

              <div class="form-group">
                <label for="contactInfo">Téléphone (optionnel)</label>
                <div class="input-wrapper">
                  <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <input
                    id="contactInfo"
                    type="tel"
                    formControlName="contactInfo"
                    placeholder="+33 6 12 34 56 78"
                  >
                </div>
              </div>

              @if (errorMessage) {
                <div class="error-msg">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {{ errorMessage }}
                </div>
              }

              @if (successMessage) {
                <div class="success-msg">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  {{ successMessage }}
                </div>
              }

              <button type="submit" class="btn btn-primary btn-block" [disabled]="registerForm.invalid || isLoading">
                @if (isLoading) {
                  <span class="spinner"></span>
                  Création en cours...
                } @else {
                  Créer mon compte
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                }
              </button>

              <p class="terms">
                En créant un compte, vous acceptez nos
                <a href="#">Conditions d'utilisation</a> et notre
                <a href="#">Politique de confidentialité</a>
              </p>
            </form>

            <div class="divider">
              <span>ou continuer avec</span>
            </div>

            <div class="social-login">
              <button type="button" class="social-btn">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button type="button" class="social-btn">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#F25022" d="M1 1h10v10H1z"/>
                  <path fill="#00A4EF" d="M1 13h10v10H1z"/>
                  <path fill="#7FBA00" d="M13 1h10v10H13z"/>
                  <path fill="#FFB900" d="M13 13h10v10H13z"/>
                </svg>
                Microsoft
              </button>
            </div>

            <p class="switch-auth">
              Déjà un compte ?
              <a routerLink="/login">Se connecter</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #001f3f;
      --primary-dark: #001428;
      --primary-light: #003366;
      --secondary: #ff6600;
      --accent: #ff8533;
      --success: #10b981;
      --danger: #ef4444;
      --warning: #f59e0b;
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
      --gradient: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      --radius: 0.5rem;
      --radius-lg: 1rem;
      --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
      --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
      --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .auth-page {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 1fr 1fr;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* Left Side - Promo */
    .auth-left {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 50%, #000d1a 100%);
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem;
    }

    .promo-overlay {
      position: absolute;
      inset: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }

    /* Particles */
    .particles {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .particle {
      position: absolute;
      width: 6px;
      height: 6px;
      background: var(--secondary);
      border-radius: 50%;
      opacity: 0.6;
      animation: particleFloat var(--duration) ease-in-out infinite;
      animation-delay: var(--delay);
    }

    .particle:nth-child(1) { top: 10%; left: 10%; }
    .particle:nth-child(2) { top: 20%; left: 80%; }
    .particle:nth-child(3) { top: 30%; left: 25%; }
    .particle:nth-child(4) { top: 40%; left: 70%; }
    .particle:nth-child(5) { top: 50%; left: 15%; }
    .particle:nth-child(6) { top: 60%; left: 85%; }
    .particle:nth-child(7) { top: 70%; left: 35%; }
    .particle:nth-child(8) { top: 80%; left: 65%; }
    .particle:nth-child(9) { top: 15%; left: 50%; }
    .particle:nth-child(10) { top: 85%; left: 20%; }
    .particle:nth-child(11) { top: 45%; left: 90%; }
    .particle:nth-child(12) { top: 75%; left: 45%; }

    @keyframes particleFloat {
      0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
      50% { transform: translateY(-30px) scale(1.5); opacity: 1; }
    }

    /* Floating shapes */
    .floating-shapes {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .shape {
      position: absolute;
      border-radius: 50%;
      opacity: 0.1;
    }

    .shape-1 {
      width: 400px;
      height: 400px;
      background: var(--secondary);
      top: -100px;
      left: -100px;
      animation: float 20s ease-in-out infinite;
    }

    .shape-2 {
      width: 300px;
      height: 300px;
      background: var(--white);
      bottom: -50px;
      right: -50px;
      animation: float 15s ease-in-out infinite reverse;
    }

    .shape-3 {
      width: 200px;
      height: 200px;
      background: var(--secondary);
      top: 50%;
      right: 20%;
      animation: float 18s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-30px) rotate(10deg); }
    }

    /* Truck Animation */
    .truck-animation {
      position: absolute;
      bottom: 80px;
      left: 0;
      right: 0;
      height: 60px;
    }

    .truck {
      position: absolute;
      animation: drive 8s linear infinite;
    }

    .road {
      position: absolute;
      bottom: 5px;
      left: 0;
      right: 0;
      height: 3px;
      background: repeating-linear-gradient(90deg, rgba(255,255,255,0.3) 0px, rgba(255,255,255,0.3) 20px, transparent 20px, transparent 40px);
    }

    @keyframes drive {
      0% { left: -150px; }
      100% { left: calc(100% + 50px); }
    }

    /* Promo Content */
    .promo-content {
      position: relative;
      z-index: 1;
      color: var(--white);
      max-width: 500px;
    }

    .promo-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(16, 185, 129, 0.2);
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 0.5rem 1rem;
      border-radius: 50px;
      font-size: 0.85rem;
      font-weight: 500;
      margin-bottom: 1.5rem;
      color: #10b981;
    }

    .promo-title {
      font-size: 2.5rem;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 1rem;
    }

    .highlight {
      background: linear-gradient(135deg, var(--secondary), var(--accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .promo-description {
      font-size: 1.1rem;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    /* Benefits */
    .benefits {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin-bottom: 2.5rem;
    }

    .benefit {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }

    .benefit-icon {
      width: 40px;
      height: 40px;
      background: rgba(16, 185, 129, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #10b981;
      flex-shrink: 0;
    }

    .benefit-content h4 {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .benefit-content p {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.7);
    }

    /* Trust Section */
    .trust-section {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 1.5rem;
    }

    .trust-label {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 1rem;
    }

    .trust-logos {
      display: flex;
      gap: 1.5rem;
    }

    .trust-logo {
      font-size: 0.9rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.4);
      transition: color 0.3s;
    }

    .trust-logo:hover {
      color: rgba(255, 255, 255, 0.8);
    }

    /* Animations */
    .animate-fade-in {
      animation: fadeIn 0.6s ease-out forwards;
    }

    .animate-slide-up {
      animation: slideUp 0.6s ease-out forwards;
      opacity: 0;
    }

    .delay-1 { animation-delay: 0.1s; }
    .delay-2 { animation-delay: 0.2s; }
    .delay-3 { animation-delay: 0.3s; }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Right Side - Form */
    .auth-right {
      display: flex;
      flex-direction: column;
      background: var(--white);
      position: relative;
    }

    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem 2rem;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--gray-900);
    }

    .back-link {
      color: var(--gray-500);
      text-decoration: none;
      font-weight: 500;
      font-size: 0.9rem;
      transition: color 0.2s;
    }

    .back-link:hover {
      color: var(--primary);
    }

    .form-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem 2rem 2rem;
      overflow-y: auto;
    }

    .form-wrapper {
      width: 100%;
      max-width: 400px;
    }

    .card-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .header-icon {
      width: 64px;
      height: 64px;
      background: var(--gradient);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      color: var(--white);
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 102, 0, 0.4); }
      50% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(255, 102, 0, 0); }
    }

    .card-header h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: 0.5rem;
    }

    .card-header p {
      color: var(--gray-500);
      font-size: 0.9rem;
    }

    /* Form */
    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      font-weight: 500;
      color: var(--gray-700);
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .input-wrapper {
      position: relative;
    }

    .input-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--gray-400);
      transition: color 0.2s;
    }

    .input-wrapper:focus-within .input-icon {
      color: var(--primary);
    }

    .input-wrapper input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 3rem;
      border: 2px solid var(--gray-200);
      border-radius: var(--radius);
      font-size: 1rem;
      transition: all 0.2s;
      background: var(--white);
    }

    .input-wrapper input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(0, 31, 63, 0.1);
    }

    .input-wrapper input.invalid {
      border-color: var(--danger);
    }

    .input-wrapper input::placeholder {
      color: var(--gray-400);
    }

    .field-error {
      display: block;
      color: var(--danger);
      font-size: 0.8rem;
      margin-top: 0.25rem;
    }

    /* Password Strength */
    .password-strength {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }

    .strength-bar {
      flex: 1;
      height: 4px;
      background: var(--gray-200);
      border-radius: 2px;
      overflow: hidden;
    }

    .strength-fill {
      height: 100%;
      border-radius: 2px;
      transition: width 0.3s, background 0.3s;
    }

    .strength-fill.weak { background: var(--danger); }
    .strength-fill.fair { background: var(--warning); }
    .strength-fill.good { background: var(--secondary); }
    .strength-fill.strong { background: var(--success); }

    .strength-text {
      font-size: 0.75rem;
      font-weight: 500;
    }

    .strength-text.weak { color: var(--danger); }
    .strength-text.fair { color: var(--warning); }
    .strength-text.good { color: var(--secondary); }
    .strength-text.strong { color: var(--success); }

    .error-msg {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: var(--danger);
      padding: 0.75rem 1rem;
      border-radius: var(--radius);
      margin-bottom: 1rem;
      font-size: 0.9rem;
      animation: shake 0.5s ease-in-out;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }

    .success-msg {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: var(--success);
      padding: 0.75rem 1rem;
      border-radius: var(--radius);
      margin-bottom: 1rem;
      font-size: 0.9rem;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: var(--radius);
      cursor: pointer;
      transition: all 0.3s;
      border: none;
    }

    .btn-primary {
      background: var(--gradient);
      color: var(--white);
      position: relative;
      overflow: hidden;
    }

    .btn-primary::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }

    .btn-primary:hover::before {
      left: 100%;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(0, 31, 63, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-block {
      width: 100%;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .terms {
      text-align: center;
      margin-top: 1rem;
      font-size: 0.8rem;
      color: var(--gray-500);
    }

    .terms a {
      color: var(--secondary);
      text-decoration: none;
    }

    .terms a:hover {
      text-decoration: underline;
    }

    /* Divider */
    .divider {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 1.25rem 0;
      color: var(--gray-400);
      font-size: 0.85rem;
    }

    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--gray-200);
    }

    /* Social Login */
    .social-login {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .social-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.65rem;
      border: 2px solid var(--gray-200);
      border-radius: var(--radius);
      background: var(--white);
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--gray-700);
      cursor: pointer;
      transition: all 0.2s;
    }

    .social-btn:hover {
      border-color: var(--gray-300);
      background: var(--gray-50);
      transform: translateY(-2px);
    }

    /* Switch Auth */
    .switch-auth {
      text-align: center;
      margin-top: 1.25rem;
      color: var(--gray-500);
      font-size: 0.9rem;
    }

    .switch-auth a {
      color: var(--secondary);
      font-weight: 600;
      text-decoration: none;
    }

    .switch-auth a:hover {
      text-decoration: underline;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .auth-page {
        grid-template-columns: 1fr;
      }

      .auth-left {
        display: none;
      }

      .form-container {
        padding: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      .navbar {
        padding: 1rem;
      }

      .form-wrapper {
        padding: 0;
      }

      .social-login {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RegisterComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  registerForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    contactInfo: ['']
  });

  onSubmit() {
    if (this.registerForm.valid) {
      const registerData = this.registerForm.value as RegisterRequest; // <--- Add "as RegisterRequest"

      this.authService.register(registerData).subscribe({
        next: () => {
        this.isLoading = false;
        this.successMessage = 'Compte créé avec succès ! Redirection...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err: any) => {
        this.isLoading = false;
        if (err.status === 409) {
          this.errorMessage = 'Cet email est déjà utilisé.';
        } else {
          this.errorMessage = 'Erreur lors de l\'inscription. Veuillez réessayer.';
        }
      }
    });
  }

  getPasswordStrength(): number {
    const password = this.registerForm.get('password')?.value || '';
    let strength = 0;

    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength++;

    return strength;
  }

  getStrengthClass(): string {
    const strength = this.getPasswordStrength();
    if (strength <= 1) return 'weak';
    if (strength === 2) return 'fair';
    if (strength === 3) return 'good';
    return 'strong';
  }

  getStrengthText(): string {
    const strength = this.getPasswordStrength();
    if (strength <= 1) return 'Faible';
    if (strength === 2) return 'Moyen';
    if (strength === 3) return 'Bon';
    return 'Excellent';
  }
}
