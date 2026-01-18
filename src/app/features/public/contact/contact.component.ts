import { Component, inject, signal, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface ContactInfo {
  icon: string;
  title: string;
  value: string;
  link?: string;
}

interface FAQ {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="contact-page">
      <!-- Navigation -->
      <nav class="navbar">
        <div class="nav-container">
          <a routerLink="/" class="logo">
            <svg class="logo-icon" viewBox="0 0 32 32" width="32" height="32"><rect width="32" height="32" rx="6" fill="#001f3f"/><path d="M8 22 L16 10 L24 22" stroke="#ff6600" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="18" r="3" fill="#ff6600"/></svg>
            <span class="logo-text">X-NexusGo</span>
          </a>
          
          <div class="nav-links">
            <a routerLink="/" class="nav-link">Accueil</a>
            <a routerLink="/features" class="nav-link">Fonctionnalités</a>
            <a routerLink="/about" class="nav-link">À propos</a>
            <a routerLink="/contact" class="nav-link active">Contact</a>
          </div>

          <div class="nav-actions">
            <a routerLink="/login" class="btn btn-outline">Connexion</a>
            <a routerLink="/register" class="btn btn-primary">S'inscrire</a>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-bg">
          <div class="hero-particles">
            @for (i of [1,2,3,4,5,6,7,8]; track i) {
              <div class="particle" [style.--delay]="(i * 0.8) + 's'" [style.--x]="(i * 12) + '%'"></div>
            }
          </div>
          <div class="hero-shape shape-1"></div>
          <div class="hero-shape shape-2"></div>
        </div>
        <div class="container">
          <div class="hero-content animate-hero">
            <span class="section-badge animate-fade-in">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Contact
            </span>
            <h1 class="hero-title animate-slide-up">
              Parlons de votre
              <span class="gradient-text">projet logistique</span>
            </h1>
            <p class="hero-description animate-slide-up-delay">
              Notre équipe d'experts est disponible pour répondre à toutes vos questions 
              et vous accompagner dans l'optimisation de votre chaîne logistique. 
              Réponse garantie sous 24h.
            </p>
          </div>
        </div>
      </section>

      <!-- Contact Section -->
      <section class="contact-section">
        <div class="container">
          <div class="contact-grid">
            <!-- Contact Form -->
            <div class="contact-form-wrapper animate-on-scroll">
              <h2>Envoyez-nous un message</h2>
              <p>Remplissez le formulaire ci-dessous et nous vous répondrons dans les 24h.</p>

              <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="contact-form">
                <div class="form-row">
                  <div class="form-group">
                    <label for="firstName">Prénom *</label>
                    <input 
                      type="text" 
                      id="firstName" 
                      formControlName="firstName"
                      placeholder="Votre prénom"
                      [class.error]="isFieldInvalid('firstName')"
                    >
                    @if (isFieldInvalid('firstName')) {
                      <span class="error-message">Le prénom est requis</span>
                    }
                  </div>
                  <div class="form-group">
                    <label for="lastName">Nom *</label>
                    <input 
                      type="text" 
                      id="lastName" 
                      formControlName="lastName"
                      placeholder="Votre nom"
                      [class.error]="isFieldInvalid('lastName')"
                    >
                    @if (isFieldInvalid('lastName')) {
                      <span class="error-message">Le nom est requis</span>
                    }
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="email">Email *</label>
                    <input 
                      type="email" 
                      id="email" 
                      formControlName="email"
                      placeholder="votre@email.com"
                      [class.error]="isFieldInvalid('email')"
                    >
                    @if (isFieldInvalid('email')) {
                      <span class="error-message">Email invalide</span>
                    }
                  </div>
                  <div class="form-group">
                    <label for="phone">Téléphone</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      formControlName="phone"
                      placeholder="+33 1 23 45 67 89"
                    >
                  </div>
                </div>

                <div class="form-group">
                  <label for="company">Entreprise</label>
                  <input 
                    type="text" 
                    id="company" 
                    formControlName="company"
                    placeholder="Nom de votre entreprise"
                  >
                </div>

                <div class="form-group">
                  <label for="subject">Sujet *</label>
                  <select id="subject" formControlName="subject" [class.error]="isFieldInvalid('subject')">
                    <option value="">Sélectionnez un sujet</option>
                    <option value="demo">Demande de démonstration</option>
                    <option value="pricing">Questions sur les tarifs</option>
                    <option value="support">Support technique</option>
                    <option value="partnership">Partenariat</option>
                    <option value="other">Autre</option>
                  </select>
                  @if (isFieldInvalid('subject')) {
                    <span class="error-message">Veuillez sélectionner un sujet</span>
                  }
                </div>

                <div class="form-group">
                  <label for="message">Message *</label>
                  <textarea 
                    id="message" 
                    formControlName="message"
                    rows="5"
                    placeholder="Décrivez votre demande..."
                    [class.error]="isFieldInvalid('message')"
                  ></textarea>
                  @if (isFieldInvalid('message')) {
                    <span class="error-message">Le message est requis (min. 20 caractères)</span>
                  }
                </div>

                <div class="form-group checkbox-group">
                  <label class="checkbox-label">
                    <input type="checkbox" formControlName="newsletter">
                    <span class="checkmark"></span>
                    <span>Je souhaite recevoir la newsletter X-NexusGo</span>
                  </label>
                </div>

                <button type="submit" class="btn btn-primary btn-lg btn-block" [disabled]="submitting()">
                  @if (submitting()) {
                    <span class="spinner"></span>
                    <span>Envoi en cours...</span>
                  } @else {
                    <span>Envoyer le message</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                  }
                </button>

                @if (submitSuccess()) {
                  <div class="success-message">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    <span>Votre message a été envoyé avec succès ! Nous vous répondrons rapidement.</span>
                  </div>
                }
              </form>
            </div>

            <!-- Contact Info -->
            <div class="contact-info">
              <div class="info-card animate-on-scroll" style="--delay: 0.1s">
                <h3>Informations de contact</h3>
                <div class="info-list">
                  @for (info of contactInfos; track info.title; let i = $index) {
                    <div class="info-item" [style.--delay]="(i * 0.1) + 's'">
                      <div class="info-icon">{{ info.icon }}</div>
                      <div class="info-content">
                        <span class="info-title">{{ info.title }}</span>
                        @if (info.link) {
                          <a [href]="info.link" class="info-value">{{ info.value }}</a>
                        } @else {
                          <span class="info-value">{{ info.value }}</span>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>

              <div class="hours-card animate-on-scroll" style="--delay: 0.2s">
                <h3>Horaires d'ouverture</h3>
                <div class="hours-list">
                  <div class="hours-item">
                    <span>Lundi - Vendredi</span>
                    <span class="hours-time">9h00 - 18h00</span>
                  </div>
                  <div class="hours-item">
                    <span>Samedi</span>
                    <span class="hours-time">10h00 - 14h00</span>
                  </div>
                  <div class="hours-item">
                    <span>Dimanche</span>
                    <span class="hours-time closed">Fermé</span>
                  </div>
                </div>
                <p class="support-note">
                  💡 Support technique disponible 24/7 pour les clients Premium
                </p>
              </div>

              <div class="social-card animate-on-scroll" style="--delay: 0.3s">
                <h3>Suivez-nous</h3>
                <div class="social-links">
                  <a href="#" class="social-link twitter">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                  </a>
                  <a href="#" class="social-link linkedin">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  </a>
                  <a href="#" class="social-link github">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  </a>
                  <a href="#" class="social-link youtube">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Map Section -->
      <section class="map-section">
        <div class="container">
          <div class="map-wrapper">
            <div class="map-placeholder">
              <div class="map-content">
                <span class="map-icon">📍</span>
                <h3>Nos bureaux</h3>
                <p>123 Avenue de la Logistique<br>75008 Paris, France</p>
                <a href="https://maps.google.com" target="_blank" class="btn btn-outline">
                  Voir sur Google Maps
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ Section -->
      <section class="faq-section">
        <div class="container">
          <div class="section-header">
            <span class="section-badge">FAQ</span>
            <h2 class="section-title">Questions fréquentes</h2>
          </div>

          <div class="faq-grid">
            @for (faq of faqs; track faq.question; let i = $index) {
              <div class="faq-item" [class.open]="openFaq() === i" (click)="toggleFaq(i)">
                <div class="faq-question">
                  <span>{{ faq.question }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" [class.rotated]="openFaq() === i"><path d="m6 9 6 6 6-6"/></svg>
                </div>
                @if (openFaq() === i) {
                  <div class="faq-answer">
                    <p>{{ faq.answer }}</p>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="container">
          <div class="cta-content">
            <h2>Prêt à démarrer ?</h2>
            <p>Créez votre compte gratuit et découvrez toutes nos fonctionnalités.</p>
            <div class="cta-actions">
              <a routerLink="/register" class="btn btn-white btn-lg">
                <span>Créer un compte</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="footer">
        <div class="container">
          <div class="footer-content">
            <a routerLink="/" class="logo">
              <svg class="logo-icon" viewBox="0 0 32 32" width="32" height="32"><rect width="32" height="32" rx="6" fill="#001f3f"/><path d="M8 22 L16 10 L24 22" stroke="#ff6600" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="18" r="3" fill="#ff6600"/></svg>
              <span class="logo-text">X-NexusGo</span>
            </a>
            <p>&copy; {{ currentYear }} X-NexusGo Ltd. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      --primary: #001f3f;
      --primary-dark: #001428;
      --primary-light: #003366;
      --secondary: #ff6600;
      --success: #10b981;
      --danger: #ef4444;
      --gray-900: #0f172a;
      --gray-800: #1e293b;
      --gray-700: #334155;
      --gray-600: #475569;
      --gray-500: #64748b;
      --gray-400: #94a3b8;
      --gray-300: #cbd5e1;
      --gray-200: #e2e8f0;
      --gray-100: #f1f5f9;
      --gray-50: #f8fafc;
      --white: #ffffff;
      --gradient: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
      --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
      --radius: 0.5rem;
      --radius-lg: 1rem;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    .contact-page {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: var(--gray-800);
      line-height: 1.6;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      font-size: 0.95rem;
      font-weight: 600;
      border-radius: var(--radius);
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      border: 2px solid transparent;
    }

    .btn-primary {
      background: var(--gradient);
      color: var(--white);
      border: none;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .btn-outline {
      background: transparent;
      color: var(--primary);
      border-color: var(--primary);
    }

    .btn-outline:hover {
      background: var(--primary);
      color: var(--white);
    }

    .btn-white {
      background: var(--white);
      color: var(--primary);
    }

    .btn-white:hover {
      background: var(--gray-100);
      transform: translateY(-2px);
    }

    .btn-lg {
      padding: 1rem 2rem;
      font-size: 1.05rem;
    }

    .btn-block {
      width: 100%;
    }

    .gradient-text {
      background: var(--gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .section-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, rgba(0, 31, 63, 0.1) 0%, rgba(255, 102, 0, 0.1) 100%);
      color: var(--primary);
      padding: 0.5rem 1rem;
      border-radius: 50px;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 1rem;
      border: 1px solid rgba(0, 31, 63, 0.1);
    }

    /* Animations */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(50px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes particleFloat {
      0%, 100% { transform: translateY(0); opacity: 0.4; }
      50% { transform: translateY(-120px); opacity: 0.8; }
    }

    .animate-hero { animation: fadeIn 0.8s ease-out forwards; }
    .animate-fade-in { animation: fadeIn 0.6s ease-out 0.2s both; }
    .animate-slide-up { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both; }
    .animate-slide-up-delay { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both; }

    .animate-on-scroll {
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      transition-delay: var(--delay, 0s);
    }

    .animate-on-scroll.visible {
      opacity: 1;
      transform: translateY(0);
    }

    /* Navigation */
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
      max-width: 1200px;
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

    .logo-icon { font-size: 1.75rem; }

    .nav-links {
      display: flex;
      gap: 2rem;
    }

    .nav-link {
      text-decoration: none;
      color: var(--gray-600);
      font-weight: 500;
      transition: color 0.2s;
    }

    .nav-link:hover, .nav-link.active {
      color: var(--primary);
    }

    .nav-actions {
      display: flex;
      gap: 1rem;
    }

    @media (max-width: 768px) {
      .nav-links, .nav-actions { display: none; }
    }

    /* Hero */
    .hero {
      position: relative;
      padding: 10rem 1.5rem 6rem;
      text-align: center;
      overflow: hidden;
    }

    .hero-bg {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, var(--gray-50) 0%, var(--white) 50%, rgba(255, 102, 0, 0.03) 100%);
      z-index: -1;
    }

    .hero-particles {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }

    .particle {
      position: absolute;
      width: 8px;
      height: 8px;
      background: var(--secondary);
      border-radius: 50%;
      left: var(--x, 50%);
      bottom: -20px;
      animation: particleFloat 10s ease-in-out infinite;
      animation-delay: var(--delay, 0s);
    }

    .hero-shape {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.3;
    }

    .hero-shape.shape-1 {
      width: 500px;
      height: 500px;
      background: linear-gradient(135deg, rgba(0, 31, 63, 0.2) 0%, rgba(255, 102, 0, 0.1) 100%);
      top: -200px;
      right: -100px;
    }

    .hero-shape.shape-2 {
      width: 400px;
      height: 400px;
      background: rgba(255, 102, 0, 0.15);
      bottom: -150px;
      left: -100px;
    }

    .hero-title {
      font-size: 3rem;
      font-weight: 800;
      line-height: 1.2;
      color: var(--gray-900);
      margin-bottom: 1.5rem;
    }

    .hero-description {
      font-size: 1.25rem;
      color: var(--gray-600);
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.7;
    }

    @media (max-width: 768px) {
      .hero { padding: 7rem 1rem 4rem; }
      .hero-title { font-size: 2rem; }
    }

    /* Contact Section */
    .contact-section {
      padding: 4rem 0 6rem;
    }

    .contact-grid {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 4rem;
    }

    /* Contact Form */
    .contact-form-wrapper {
      background: var(--white);
      padding: 2.5rem;
      border-radius: var(--radius-lg);
      border: 1px solid var(--gray-200);
      box-shadow: var(--shadow-lg);
    }

    .contact-form-wrapper h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: 0.5rem;
    }

    .contact-form-wrapper > p {
      color: var(--gray-600);
      margin-bottom: 2rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--gray-700);
      margin-bottom: 0.5rem;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 0.875rem 1rem;
      font-size: 1rem;
      border: 1px solid var(--gray-300);
      border-radius: var(--radius);
      transition: all 0.2s;
      background: var(--white);
      font-family: inherit;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }

    .form-group input.error,
    .form-group select.error,
    .form-group textarea.error {
      border-color: var(--danger);
    }

    .form-group textarea {
      resize: vertical;
      min-height: 120px;
    }

    .error-message {
      display: block;
      color: var(--danger);
      font-size: 0.8rem;
      margin-top: 0.5rem;
    }

    .checkbox-group {
      margin-bottom: 2rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      font-size: 0.9rem;
      color: var(--gray-600);
    }

    .checkbox-label input[type="checkbox"] {
      width: auto;
      accent-color: var(--primary);
    }

    .success-message {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(16, 185, 129, 0.1);
      color: var(--success);
      padding: 1rem;
      border-radius: var(--radius);
      margin-top: 1rem;
      font-size: 0.9rem;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: var(--white);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 640px) {
      .form-row { grid-template-columns: 1fr; }
    }

    /* Contact Info Cards */
    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .info-card,
    .hours-card,
    .social-card {
      background: var(--gray-50);
      padding: 1.5rem;
      border-radius: var(--radius-lg);
      border: 1px solid var(--gray-200);
    }

    .info-card h3,
    .hours-card h3,
    .social-card h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--gray-900);
      margin-bottom: 1.25rem;
    }

    .info-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .info-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }

    .info-icon {
      font-size: 1.5rem;
    }

    .info-title {
      display: block;
      font-size: 0.8rem;
      color: var(--gray-500);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.25rem;
    }

    .info-value {
      font-weight: 600;
      color: var(--gray-900);
    }

    a.info-value {
      text-decoration: none;
      transition: color 0.2s;
    }

    a.info-value:hover {
      color: var(--primary);
    }

    .hours-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .hours-item {
      display: flex;
      justify-content: space-between;
      color: var(--gray-600);
    }

    .hours-time {
      font-weight: 600;
      color: var(--gray-900);
    }

    .hours-time.closed {
      color: var(--danger);
    }

    .support-note {
      margin-top: 1rem;
      padding: 1rem;
      background: rgba(79, 70, 229, 0.05);
      border-radius: var(--radius);
      font-size: 0.85rem;
      color: var(--gray-600);
    }

    .social-links {
      display: flex;
      gap: 0.75rem;
    }

    .social-link {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--white);
      transition: all 0.2s;
    }

    .social-link.twitter { background: #1da1f2; }
    .social-link.linkedin { background: #0077b5; }
    .social-link.github { background: #333; }
    .social-link.youtube { background: #ff0000; }

    .social-link:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    @media (max-width: 1024px) {
      .contact-grid {
        grid-template-columns: 1fr;
        gap: 3rem;
      }
    }

    /* Map Section */
    .map-section {
      padding: 0 0 6rem;
    }

    .map-wrapper {
      border-radius: var(--radius-lg);
      overflow: hidden;
      border: 1px solid var(--gray-200);
    }

    .map-placeholder {
      background: linear-gradient(135deg, var(--gray-100) 0%, var(--gray-200) 100%);
      height: 350px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .map-content {
      text-align: center;
    }

    .map-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 1rem;
    }

    .map-content h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--gray-900);
      margin-bottom: 0.5rem;
    }

    .map-content p {
      color: var(--gray-600);
      margin-bottom: 1.5rem;
    }

    /* FAQ Section */
    .faq-section {
      padding: 6rem 0;
      background: var(--gray-50);
    }

    .section-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .section-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--gray-900);
    }

    .faq-grid {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .faq-item {
      background: var(--white);
      border-radius: var(--radius-lg);
      border: 1px solid var(--gray-200);
      cursor: pointer;
      transition: all 0.2s;
      overflow: hidden;
    }

    .faq-item:hover {
      border-color: var(--gray-300);
    }

    .faq-item.open {
      border-color: var(--primary-light);
      box-shadow: var(--shadow-lg);
    }

    .faq-question {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      font-weight: 600;
      color: var(--gray-900);
    }

    .faq-question svg {
      transition: transform 0.3s;
      color: var(--gray-400);
    }

    .faq-question svg.rotated {
      transform: rotate(180deg);
    }

    .faq-answer {
      padding: 0 1.5rem 1.25rem;
      border-top: 1px solid var(--gray-100);
      padding-top: 1.25rem;
    }

    .faq-answer p {
      color: var(--gray-600);
      font-size: 0.95rem;
    }

    /* CTA */
    .cta-section {
      background: var(--gradient);
      padding: 6rem 1.5rem;
      text-align: center;
    }

    .cta-content h2 {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--white);
      margin-bottom: 1rem;
    }

    .cta-content p {
      font-size: 1.125rem;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 2rem;
    }

    .cta-actions {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
    }

    /* Footer */
    .footer {
      background: var(--gray-900);
      padding: 2rem 1.5rem;
    }

    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer-content .logo .logo-text {
      color: var(--white);
    }

    .footer-content p {
      color: var(--gray-400);
      font-size: 0.9rem;
    }

    @media (max-width: 640px) {
      .footer-content {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }
    }
  `]
})
export class ContactComponent implements AfterViewInit {
  private fb = inject(FormBuilder);

  currentYear = new Date().getFullYear();
  submitting = signal(false);
  submitSuccess = signal(false);
  openFaq = signal<number | null>(null);

  contactForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    company: [''],
    subject: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(20)]],
    newsletter: [false]
  });

  contactInfos: ContactInfo[] = [
    {
      icon: '📧',
      title: 'Email',
      value: 'contact@x-nexusgo.com',
      link: 'mailto:contact@x-nexusgo.com'
    },
    {
      icon: '📞',
      title: 'Téléphone',
      value: '+33 1 23 45 67 89',
      link: 'tel:+33123456789'
    },
    {
      icon: '📍',
      title: 'Adresse',
      value: '42 Avenue des Champs-Élysées, 75008 Paris, France'
    },
    {
      icon: '🌍',
      title: 'International',
      value: 'London • Berlin • Amsterdam • New York'
    }
  ];

  faqs: FAQ[] = [
    {
      question: 'Comment puis-je démarrer avec X-NexusGo ?',
      answer: 'C\'est très simple ! Créez un compte gratuit, importez vos produits et entrepôts via CSV ou API, et commencez à gérer vos stocks immédiatement. Notre équipe d\'experts est disponible pour une session d\'onboarding personnalisée.'
    },
    {
      question: 'Quels modes de paiement acceptez-vous ?',
      answer: 'Nous acceptons les cartes de crédit (Visa, Mastercard, American Express), les virements SEPA et PayPal. Pour les grandes entreprises, nous proposons également la facturation mensuelle ou trimestrielle avec des conditions personnalisées.'
    },
    {
      question: 'Y a-t-il une période d\'essai gratuite ?',
      answer: 'Oui ! Vous bénéficiez de 30 jours d\'essai gratuit avec accès à toutes les fonctionnalités Premium. Aucune carte de crédit n\'est requise pour démarrer. À la fin de l\'essai, vous pouvez choisir le plan qui correspond à vos besoins.'
    },
    {
      question: 'Puis-je intégrer X-NexusGo avec mes outils existants ?',
      answer: 'Absolument ! X-NexusGo dispose d\'une API REST complète et s\'intègre avec les principaux outils e-commerce (Shopify, WooCommerce, Magento), ERP (SAP, Oracle), comptables et transporteurs (DHL, FedEx, UPS). Consultez notre documentation API pour plus de détails.'
    },
    {
      question: 'Comment fonctionne le support technique ?',
      answer: 'Nous offrons un support par email et chat en français et anglais pendant les heures ouvrées pour tous les clients. Les clients Premium bénéficient d\'un support téléphonique 24/7 et d\'un Customer Success Manager dédié pour garantir votre réussite.'
    }
  ];

  ngAfterViewInit() {
    this.initScrollAnimations();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  toggleFaq(index: number): void {
    this.openFaq.update(current => current === index ? null : index);
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting.set(true);
    this.submitSuccess.set(false);

    // Simulate API call
    setTimeout(() => {
      this.submitting.set(false);
      this.submitSuccess.set(true);
      this.contactForm.reset();
    }, 1500);
  }

  private initScrollAnimations() {
    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      );

      document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
      });
    }
  }
}
