import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { CommonModule } from '@angular/common';
import { TokenService } from '../../../core/auth/token.service';
import { Role, LoginRequest } from '../../../shared/models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="auth-page">
      <!-- Left Side - Form -->
      <div class="auth-left">
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
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <h1>Accédez à votre espace</h1>
              <p>Connectez-vous pour piloter vos opérations logistiques</p>
            </div>

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
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
                    [class.invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                  >
                </div>
                @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
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
                    placeholder="••••••••"
                    [class.invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                  >
                </div>
              </div>

              <div class="form-options">
                <label class="remember-me">
                  <input type="checkbox">
                  <span>Se souvenir de moi</span>
                </label>
                <a href="#" class="forgot-link">Mot de passe oublié ?</a>
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

              <button type="submit" class="btn btn-primary btn-block" [disabled]="loginForm.invalid || isLoading">
                @if (isLoading) {
                  <span class="spinner"></span>
                  Connexion en cours...
                } @else {
                  Se connecter
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                }
              </button>
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
              Pas encore de compte ?
              <a routerLink="/register">Créer un compte gratuitement</a>
            </p>
          </div>
        </div>
      </div>

      <!-- Right Side - Promo -->
      <div class="auth-right">
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

        <div class="promo-content">
          <div class="promo-badge animate-fade-in">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Plateforme #1 de logistique
          </div>

          <h2 class="promo-title animate-slide-up">
            Gérez votre chaîne logistique<br>
            <span class="highlight">avec intelligence</span>
          </h2>

          <p class="promo-description animate-slide-up delay-1">
            Rejoignez plus de 500 entreprises qui optimisent leurs opérations logistiques avec X-NexusGo.
          </p>

          <!-- Stats -->
          <div class="promo-stats animate-slide-up delay-2">
            <div class="stat">
              <div class="stat-value">
                <span class="counter">500</span>+
              </div>
              <div class="stat-label">Entreprises</div>
            </div>
            <div class="stat">
              <div class="stat-value">
                <span class="counter">2M</span>+
              </div>
              <div class="stat-label">Livraisons</div>
            </div>
            <div class="stat">
              <div class="stat-value">
                <span class="counter">99.9</span>%
              </div>
              <div class="stat-label">Disponibilité</div>
            </div>
          </div>

          <!-- Features -->
          <div class="promo-features animate-slide-up delay-3">
            <div class="feature">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <span>Suivi en temps réel</span>
            </div>
            <div class="feature">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <span>Analytics avancés</span>
            </div>
            <div class="feature">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <span>Support 24/7</span>
            </div>
          </div>

          <!-- Testimonial -->
          <div class="testimonial animate-slide-up delay-4">
            <div class="testimonial-content">
              <svg class="quote-icon" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M11.192 15.757c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.1-1.956.76-3.022.66-1.065 1.515-1.867 2.558-2.403L9.373 5c-.8.396-1.56.898-2.26 1.505-.71.607-1.34 1.305-1.9 2.094s-.98 1.68-1.25 2.69-.346 2.04-.217 3.1c.168 1.4.62 2.52 1.356 3.35.735.84 1.652 1.26 2.748 1.26.965 0 1.766-.29 2.4-.878.628-.576.94-1.365.94-2.368l.002.003zm9.124 0c0-.88-.23-1.618-.69-2.217-.326-.42-.768-.695-1.327-.825-.55-.13-1.07-.14-1.54-.03-.16-.94.09-1.95.75-3.02.66-1.06 1.514-1.86 2.557-2.4L18.49 5c-.8.396-1.555.898-2.26 1.505-.708.607-1.34 1.305-1.894 2.094-.556.79-.97 1.68-1.24 2.69-.273 1-.345 2.04-.217 3.1.165 1.4.615 2.52 1.35 3.35.732.833 1.646 1.25 2.742 1.25.967 0 1.768-.29 2.402-.876.627-.576.942-1.365.942-2.368v.01z"/>
              </svg>
              <p>"Notre vision était de révolutionner la logistique. X-NexusGo concrétise cette ambition en rendant l'excellence accessible à tous."</p>
            </div>
            <div class="testimonial-author">
              <img src="images/ceo.png" alt="FrJ - CEO" class="author-avatar-img">
              <div class="author-info">
                <span class="author-name">FrJ</span>
                <span class="author-role">CEO & Fondateur, X-NexusGo</span>
              </div>
            </div>
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

    /* Left Side - Form */
    .auth-left {
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
      padding: 2rem;
    }

    .form-wrapper {
      width: 100%;
      max-width: 400px;
    }

    .card-header {
      text-align: center;
      margin-bottom: 2rem;
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
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: 0.5rem;
    }

    .card-header p {
      color: var(--gray-500);
      font-size: 0.95rem;
    }

    /* Form */
    .form-group {
      margin-bottom: 1.25rem;
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
      padding: 0.875rem 1rem 0.875rem 3rem;
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

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
    }

    .remember-me {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--gray-600);
      cursor: pointer;
    }

    .remember-me input {
      accent-color: var(--primary);
    }

    .forgot-link {
      color: var(--secondary);
      text-decoration: none;
      font-weight: 500;
    }

    .forgot-link:hover {
      text-decoration: underline;
    }

    .error-msg {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: var(--danger);
      padding: 0.875rem 1rem;
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

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.875rem 1.5rem;
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

    /* Divider */
    .divider {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 1.5rem 0;
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
      padding: 0.75rem;
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
      margin-top: 1.5rem;
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

    /* Right Side - Promo */
    .auth-right {
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
      right: -100px;
      animation: float 20s ease-in-out infinite;
    }

    .shape-2 {
      width: 300px;
      height: 300px;
      background: var(--white);
      bottom: -50px;
      left: -50px;
      animation: float 15s ease-in-out infinite reverse;
    }

    .shape-3 {
      width: 200px;
      height: 200px;
      background: var(--secondary);
      top: 50%;
      left: 50%;
      animation: float 18s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-30px) rotate(10deg); }
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
      background: rgba(255, 102, 0, 0.2);
      border: 1px solid rgba(255, 102, 0, 0.3);
      padding: 0.5rem 1rem;
      border-radius: 50px;
      font-size: 0.85rem;
      font-weight: 500;
      margin-bottom: 1.5rem;
      color: var(--secondary);
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

    /* Stats */
    .promo-stats {
      display: flex;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .stat {
      text-align: center;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 800;
      color: var(--secondary);
    }

    .stat-label {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.7);
      margin-top: 0.25rem;
    }

    /* Features */
    .promo-features {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 2rem;
    }

    .feature {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.95rem;
    }

    .feature-icon {
      width: 32px;
      height: 32px;
      background: rgba(255, 102, 0, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--secondary);
    }

    /* Testimonial */
    .testimonial {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .testimonial-content {
      position: relative;
      margin-bottom: 1rem;
    }

    .quote-icon {
      position: absolute;
      top: -10px;
      left: -5px;
      color: var(--secondary);
      opacity: 0.5;
    }

    .testimonial-content p {
      font-size: 0.95rem;
      line-height: 1.6;
      padding-left: 1.5rem;
      font-style: italic;
    }

    .testimonial-author {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .author-avatar {
      width: 40px;
      height: 40px;
      background: var(--gradient);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.85rem;
    }

    .author-avatar-img {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--secondary);
      box-shadow: 0 4px 12px rgba(255, 102, 0, 0.3);
    }

    .author-info {
      display: flex;
      flex-direction: column;
    }

    .author-name {
      font-weight: 600;
      font-size: 0.9rem;
    }

    .author-role {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.7);
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
    .delay-4 { animation-delay: 0.4s; }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .auth-page {
        grid-template-columns: 1fr;
      }

      .auth-right {
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

      .form-options {
        flex-direction: column;
        gap: 0.75rem;
        align-items: flex-start;
      }
    }
  `]
})
export class LoginComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private tokenService = inject(TokenService);

  errorMessage: string = '';
  isLoading: boolean = false;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value as LoginRequest; // <--- Add "as LoginRequest"

      this.authService.login(loginData).subscribe({
        next: () => {
          const roles = this.tokenService.getUserRoles();

          console.log('Rôles détectés :', roles);

          if (roles.includes(Role.ADMIN)) {
            this.router.navigate(['/admin']);
          } else if (roles.includes(Role.WAREHOUSE_MANAGER)) {
            this.router.navigate(['/warehouse']);
          } else if (roles.includes(Role.CLIENT)) {
            this.router.navigate(['/client']);
          } else {
            this.router.navigate(['/login']);
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          if (err.status === 403 || err.status === 401) {
            this.errorMessage = 'Identifiants incorrects.';
          } else {
            this.errorMessage = 'Erreur serveur. Réessayez plus tard.';
          }
        }
      });
    }
  }
}
