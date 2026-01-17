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
      <!-- Background shapes -->
      <div class="bg-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>

      <!-- Navbar -->
      <nav class="navbar">
        <div class="nav-container">
          <a routerLink="/" class="logo">
            <svg class="logo-icon" viewBox="0 0 32 32" width="32" height="32"><rect width="32" height="32" rx="6" fill="#001f3f"/><path d="M8 22 L16 10 L24 22" stroke="#ff6600" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="18" r="3" fill="#ff6600"/></svg>
            <span class="logo-text">X-NexusGo</span>
          </a>
          <a routerLink="/" class="back-link">← Retour à l'accueil</a>
        </div>
      </nav>

      <!-- Main Content -->
      <div class="auth-container">
        <div class="auth-card">
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
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, var(--gray-50) 0%, var(--white) 50%, rgba(0, 31, 63, 0.05) 100%);
      position: relative;
      overflow: hidden;
    }

    /* Background shapes */
    .bg-shapes {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 0;
    }

    .shape {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      opacity: 0.5;
    }

    .shape-1 {
      width: 600px;
      height: 600px;
      background: rgba(0, 31, 63, 0.15);
      top: -200px;
      right: -100px;
      animation: float 20s ease-in-out infinite;
    }

    .shape-2 {
      width: 400px;
      height: 400px;
      background: rgba(255, 102, 0, 0.15);
      bottom: -100px;
      left: -100px;
      animation: float 15s ease-in-out infinite reverse;
    }

    .shape-3 {
      width: 300px;
      height: 300px;
      background: rgba(0, 51, 102, 0.1);
      top: 50%;
      left: 30%;
      animation: float 18s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-30px) rotate(5deg); }
    }

    /* Navbar */
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--gray-200);
    }

    .nav-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--gray-900);
    }

    .back-link {
      color: var(--gray-600);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }

    .back-link:hover {
      color: var(--primary);
    }

    /* Auth Container */
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6rem 1.5rem 2rem;
      position: relative;
      z-index: 1;
    }

    .auth-card {
      background: var(--white);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      padding: 2.5rem;
      width: 100%;
      max-width: 440px;
      border: 1px solid var(--gray-200);
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
    }

    .card-header h1 {
      font-size: 1.5rem;
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
      padding: 0.875rem 1rem;
      border-radius: var(--radius);
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }

    .success-msg {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: var(--success);
      padding: 0.875rem 1rem;
      border-radius: var(--radius);
      margin-bottom: 1rem;
      font-size: 0.9rem;
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
      transition: all 0.2s;
      border: none;
    }

    .btn-primary {
      background: var(--gradient);
      color: var(--white);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
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

    @media (max-width: 480px) {
      .auth-card {
        padding: 1.5rem;
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
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const registerData = { ...this.registerForm.value, role: Role.CLIENT };
    this.authService.register(registerData).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Compte créé avec succès ! Redirection...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
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
