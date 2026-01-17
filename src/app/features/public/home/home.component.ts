import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { Role } from '../../../shared/models/auth.models';

interface Feature {
  icon: string;
  title: string;
  description: string;
  color: string;
}

interface Testimonial {
  name: string;
  role: string;
  company: string;
  text: string;
  avatar: string;
}

interface Stat {
  value: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-page">
      <!-- Navigation -->
      <nav class="navbar">
        <div class="nav-container">
          <a routerLink="/" class="logo">
            <svg class="logo-icon" viewBox="0 0 32 32" width="32" height="32"><rect width="32" height="32" rx="6" fill="#001f3f"/><path d="M8 22 L16 10 L24 22" stroke="#ff6600" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="18" r="3" fill="#ff6600"/></svg>
            <span class="logo-text">X-NexusGo</span>
          </a>
          
          <div class="nav-links">
            <a routerLink="/" class="nav-link active">Accueil</a>
            <a routerLink="/features" class="nav-link">Fonctionnalités</a>
            <a routerLink="/about" class="nav-link">À propos</a>
            <a routerLink="/contact" class="nav-link">Contact</a>
          </div>

          <div class="nav-actions">
            @if (isLoggedIn()) {
              <button class="btn btn-primary" (click)="goToDashboard()">
                <span>Mon tableau de bord</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            } @else {
              <a routerLink="/login" class="btn btn-outline">Connexion</a>
              <a routerLink="/register" class="btn btn-primary">
                <span>S'inscrire</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
            }
          </div>

          <button class="mobile-menu-btn" (click)="toggleMobileMenu()">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Mobile Menu -->
        @if (mobileMenuOpen()) {
          <div class="mobile-menu">
            <a routerLink="/" class="mobile-link" (click)="toggleMobileMenu()">Accueil</a>
            <a routerLink="/features" class="mobile-link" (click)="toggleMobileMenu()">Fonctionnalités</a>
            <a routerLink="/about" class="mobile-link" (click)="toggleMobileMenu()">À propos</a>
            <a routerLink="/contact" class="mobile-link" (click)="toggleMobileMenu()">Contact</a>
            <div class="mobile-actions">
              @if (isLoggedIn()) {
                <button class="btn btn-primary btn-block" (click)="goToDashboard()">Mon tableau de bord</button>
              } @else {
                <a routerLink="/login" class="btn btn-outline btn-block" (click)="toggleMobileMenu()">Connexion</a>
                <a routerLink="/register" class="btn btn-primary btn-block" (click)="toggleMobileMenu()">S'inscrire</a>
              }
            </div>
          </div>
        }
      </nav>

      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-bg">
          <div class="hero-shape shape-1"></div>
          <div class="hero-shape shape-2"></div>
          <div class="hero-shape shape-3"></div>
        </div>
        
        <div class="hero-content">
          <div class="hero-badge">
            <span class="badge-icon">🚀</span>
            <span>Solution logistique nouvelle génération</span>
          </div>
          
          <h1 class="hero-title">
            Gérez votre chaîne logistique avec
            <span class="gradient-text">précision et efficacité</span>
          </h1>
          
          <p class="hero-description">
            X-NexusGo connecte votre supply chain mondiale avec précision et performance. 
            Solutions de bout en bout pour une logistique sans frontières.
          </p>
          
          <div class="hero-actions">
            <a routerLink="/register" class="btn btn-primary btn-lg">
              <span>Commencer gratuitement</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
            <a routerLink="/features" class="btn btn-ghost btn-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>
              <span>Voir la démo</span>
            </a>
          </div>

          <div class="hero-stats">
            @for (stat of heroStats; track stat.label) {
              <div class="hero-stat">
                <span class="stat-icon">{{ stat.icon }}</span>
                <span class="stat-value">{{ stat.value }}</span>
                <span class="stat-label">{{ stat.label }}</span>
              </div>
            }
          </div>
        </div>

        <div class="hero-visual">
          <div class="dashboard-preview">
            <div class="preview-header">
              <div class="preview-dots">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <span class="preview-title">Tableau de bord X-NexusGo</span>
            </div>
            <div class="preview-content">
              <div class="preview-sidebar">
                <div class="sidebar-item active"></div>
                <div class="sidebar-item"></div>
                <div class="sidebar-item"></div>
                <div class="sidebar-item"></div>
              </div>
              <div class="preview-main">
                <div class="preview-cards">
                  <div class="preview-card card-blue"></div>
                  <div class="preview-card card-green"></div>
                  <div class="preview-card card-orange"></div>
                  <div class="preview-card card-purple"></div>
                </div>
                <div class="preview-chart"></div>
                <div class="preview-table">
                  <div class="table-row"></div>
                  <div class="table-row"></div>
                  <div class="table-row"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section" id="features">
        <div class="container">
          <div class="section-header">
            <span class="section-badge">Fonctionnalités</span>
            <h2 class="section-title">
              Tout ce dont vous avez besoin pour
              <span class="gradient-text">optimiser votre logistique</span>
            </h2>
            <p class="section-description">
              Une suite complète d'outils pour gérer efficacement vos opérations de bout en bout
            </p>
          </div>

          <div class="features-grid">
            @for (feature of features; track feature.title) {
              <div class="feature-card" [style.--accent-color]="feature.color">
                <div class="feature-icon">{{ feature.icon }}</div>
                <h3 class="feature-title">{{ feature.title }}</h3>
                <p class="feature-description">{{ feature.description }}</p>
                <a class="feature-link">
                  En savoir plus
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </a>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- How It Works Section -->
      <section class="how-it-works">
        <div class="container">
          <div class="section-header">
            <span class="section-badge">Comment ça marche</span>
            <h2 class="section-title">Démarrez en 3 étapes simples</h2>
          </div>

          <div class="steps-container">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h3>Créez votre compte</h3>
                <p>Inscrivez-vous en quelques clics et configurez votre espace de travail selon vos besoins.</p>
              </div>
              <div class="step-icon">👤</div>
            </div>
            
            <div class="step-connector"></div>
            
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h3>Importez vos données</h3>
                <p>Ajoutez vos produits, entrepôts et fournisseurs pour commencer à gérer votre inventaire.</p>
              </div>
              <div class="step-icon">📊</div>
            </div>
            
            <div class="step-connector"></div>
            
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h3>Optimisez vos opérations</h3>
                <p>Suivez vos commandes, gérez vos expéditions et prenez des décisions éclairées.</p>
              </div>
              <div class="step-icon">🚀</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Roles Section -->
      <section class="roles-section">
        <div class="container">
          <div class="section-header">
            <span class="section-badge">Pour chaque rôle</span>
            <h2 class="section-title">
              Une interface adaptée à
              <span class="gradient-text">vos responsabilités</span>
            </h2>
          </div>

          <div class="roles-grid">
            <div class="role-card role-admin">
              <div class="role-badge">Administrateur</div>
              <div class="role-icon">👔</div>
              <h3 class="role-title">Gouvernance totale</h3>
              <ul class="role-features">
                <li>Gestion des utilisateurs et des droits</li>
                <li>Configuration des produits et entrepôts</li>
                <li>Supervision des achats fournisseurs</li>
                <li>Tableaux de bord et rapports avancés</li>
              </ul>
              <a routerLink="/register" class="btn btn-outline">Découvrir →</a>
            </div>

            <div class="role-card role-warehouse featured">
              <div class="role-badge">Gestionnaire</div>
              <div class="role-icon">🏭</div>
              <h3 class="role-title">Contrôle des stocks</h3>
              <ul class="role-features">
                <li>Gestion de l'inventaire multi-entrepôts</li>
                <li>Mouvements de stock en temps réel</li>
                <li>Préparation et réservation des commandes</li>
                <li>Gestion des expéditions et du picking</li>
              </ul>
              <a routerLink="/register" class="btn btn-primary">Découvrir →</a>
            </div>

            <div class="role-card role-client">
              <div class="role-badge">Client</div>
              <div class="role-icon">🛒</div>
              <h3 class="role-title">Expérience fluide</h3>
              <ul class="role-features">
                <li>Consultation du catalogue produits</li>
                <li>Création de commandes simplifiée</li>
                <li>Suivi des expéditions en temps réel</li>
                <li>Historique et statut des commandes</li>
              </ul>
              <a routerLink="/register" class="btn btn-outline">Découvrir →</a>
            </div>
          </div>
        </div>
      </section>

      <!-- Testimonials Section -->
      <section class="testimonials-section">
        <div class="container">
          <div class="section-header">
            <span class="section-badge">Témoignages</span>
            <h2 class="section-title">Ce que disent nos clients</h2>
          </div>

          <div class="testimonials-grid">
            @for (testimonial of testimonials; track testimonial.name) {
              <div class="testimonial-card">
                <div class="testimonial-content">
                  <div class="quote-icon">"</div>
                  <p class="testimonial-text">{{ testimonial.text }}</p>
                </div>
                <div class="testimonial-author">
                  <div class="author-avatar">{{ testimonial.avatar }}</div>
                  <div class="author-info">
                    <span class="author-name">{{ testimonial.name }}</span>
                    <span class="author-role">{{ testimonial.role }}, {{ testimonial.company }}</span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="cta-bg">
          <div class="cta-shape shape-1"></div>
          <div class="cta-shape shape-2"></div>
        </div>
        <div class="container">
          <div class="cta-content">
            <h2 class="cta-title">
              Prêt à transformer votre logistique ?
            </h2>
            <p class="cta-description">
              Rejoignez les leaders de l'industrie qui font confiance à X-NexusGo.
              Commencez votre transformation digitale dès aujourd'hui.
            </p>
            <div class="cta-actions">
              <a routerLink="/register" class="btn btn-white btn-lg">
                <span>Créer un compte gratuit</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
              <a routerLink="/contact" class="btn btn-ghost-white btn-lg">
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <a routerLink="/" class="logo">
                <svg class="logo-icon" viewBox="0 0 32 32" width="32" height="32"><rect width="32" height="32" rx="6" fill="#001f3f"/><path d="M8 22 L16 10 L24 22" stroke="#ff6600" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="18" r="3" fill="#ff6600"/></svg>
                <span class="logo-text">X-NexusGo</span>
              </a>
              <p class="footer-description">
                Solutions logistiques globales de bout en bout. 
                Delivering results for industry leaders.
              </p>
              <div class="social-links">
                <a href="#" class="social-link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" class="social-link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
                <a href="#" class="social-link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
              </div>
            </div>

            <div class="footer-links">
              <h4>Produit</h4>
              <ul>
                <li><a routerLink="/features">Fonctionnalités</a></li>
                <li><a href="#">Tarification</a></li>
                <li><a href="#">Intégrations</a></li>
                <li><a href="#">Mises à jour</a></li>
              </ul>
            </div>

            <div class="footer-links">
              <h4>Entreprise</h4>
              <ul>
                <li><a routerLink="/about">À propos</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Carrières</a></li>
                <li><a routerLink="/contact">Contact</a></li>
              </ul>
            </div>

            <div class="footer-links">
              <h4>Support</h4>
              <ul>
                <li><a href="#">Documentation</a></li>
                <li><a href="#">API Reference</a></li>
                <li><a href="#">FAQ</a></li>
                <li><a href="#">Statut système</a></li>
              </ul>
            </div>

            <div class="footer-links">
              <h4>Légal</h4>
              <ul>
                <li><a href="#">Conditions d'utilisation</a></li>
                <li><a href="#">Politique de confidentialité</a></li>
                <li><a href="#">Cookies</a></li>
                <li><a href="#">RGPD</a></li>
              </ul>
            </div>
          </div>

          <div class="footer-bottom">
            <p>&copy; {{ currentYear }} X-NexusGo Ltd. Tous droits réservés.</p>
            <p>Making the impossible, possible.</p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    /* Variables */
    :host {
      --primary: #001f3f;
      --primary-dark: #001428;
      --primary-light: #003366;
      --secondary: #ff6600;
      --accent: #ff8533;
      --success: #10b981;
      --danger: #ef4444;
      --warning: #f59e0b;
      --dark: #001f3f;
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
      --gradient-orange: linear-gradient(135deg, #ff6600 0%, #cc5200 100%);
      --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
      --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
      --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
      --radius: 0.5rem;
      --radius-lg: 1rem;
      --radius-xl: 1.5rem;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .home-page {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: var(--gray-800);
      line-height: 1.6;
      overflow-x: hidden;
    }

    .container {
      max-width: 1280px;
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
      border-color: transparent;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
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

    .btn-ghost {
      background: transparent;
      color: var(--gray-700);
      border-color: transparent;
    }

    .btn-ghost:hover {
      background: var(--gray-100);
      color: var(--gray-900);
    }

    .btn-white {
      background: var(--white);
      color: var(--primary);
      border-color: var(--white);
    }

    .btn-white:hover {
      background: var(--gray-100);
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .btn-ghost-white {
      background: transparent;
      color: var(--white);
      border-color: rgba(255, 255, 255, 0.3);
    }

    .btn-ghost-white:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.5);
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

    .logo-icon {
      font-size: 1.75rem;
    }

    .nav-links {
      display: flex;
      gap: 2rem;
    }

    .nav-link {
      text-decoration: none;
      color: var(--gray-600);
      font-weight: 500;
      transition: color 0.2s;
      position: relative;
    }

    .nav-link::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 0;
      height: 2px;
      background: var(--gradient);
      transition: width 0.3s;
    }

    .nav-link:hover,
    .nav-link.active {
      color: var(--primary);
    }

    .nav-link:hover::after,
    .nav-link.active::after {
      width: 100%;
    }

    .nav-actions {
      display: flex;
      gap: 1rem;
    }

    .mobile-menu-btn {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      color: var(--gray-700);
    }

    .mobile-menu {
      display: none;
      padding: 1rem 1.5rem 1.5rem;
      border-top: 1px solid var(--gray-200);
    }

    .mobile-link {
      display: block;
      padding: 0.75rem 0;
      text-decoration: none;
      color: var(--gray-700);
      font-weight: 500;
      border-bottom: 1px solid var(--gray-100);
    }

    .mobile-actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 1rem;
    }

    @media (max-width: 768px) {
      .nav-links,
      .nav-actions {
        display: none;
      }

      .mobile-menu-btn {
        display: block;
      }

      .mobile-menu {
        display: block;
      }
    }

    /* Hero Section */
    .hero {
      position: relative;
      min-height: 100vh;
      display: flex;
      align-items: center;
      padding: 8rem 1.5rem 4rem;
      overflow: hidden;
    }

    .hero-bg {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, var(--gray-50) 0%, var(--white) 50%, rgba(79, 70, 229, 0.05) 100%);
      z-index: -1;
    }

    .hero-shape {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      opacity: 0.5;
    }

    .shape-1 {
      width: 600px;
      height: 600px;
      background: rgba(79, 70, 229, 0.15);
      top: -200px;
      right: -100px;
      animation: float 20s ease-in-out infinite;
    }

    .shape-2 {
      width: 400px;
      height: 400px;
      background: rgba(6, 182, 212, 0.15);
      bottom: 0;
      left: -100px;
      animation: float 15s ease-in-out infinite reverse;
    }

    .shape-3 {
      width: 300px;
      height: 300px;
      background: rgba(245, 158, 11, 0.1);
      top: 50%;
      left: 50%;
      animation: float 18s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0) rotate(0deg);
      }
      50% {
        transform: translateY(-30px) rotate(5deg);
      }
    }

    .hero-content {
      max-width: 700px;
      z-index: 1;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--white);
      border: 1px solid var(--gray-200);
      padding: 0.5rem 1rem;
      border-radius: 50px;
      font-size: 0.875rem;
      color: var(--gray-600);
      margin-bottom: 1.5rem;
      box-shadow: var(--shadow-sm);
    }

    .badge-icon {
      font-size: 1rem;
    }

    .hero-title {
      font-size: 3.5rem;
      font-weight: 800;
      line-height: 1.1;
      color: var(--gray-900);
      margin-bottom: 1.5rem;
    }

    .hero-description {
      font-size: 1.25rem;
      color: var(--gray-600);
      margin-bottom: 2rem;
      max-width: 560px;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      margin-bottom: 3rem;
      flex-wrap: wrap;
    }

    .hero-stats {
      display: flex;
      gap: 3rem;
    }

    .hero-stat {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .stat-icon {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--gray-900);
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--gray-500);
    }

    .hero-visual {
      position: absolute;
      right: -100px;
      top: 50%;
      transform: translateY(-50%);
      width: 55%;
      max-width: 700px;
      z-index: 0;
    }

    .dashboard-preview {
      background: var(--white);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
      overflow: hidden;
      border: 1px solid var(--gray-200);
      transform: perspective(1000px) rotateY(-10deg) rotateX(5deg);
      transition: transform 0.3s ease;
    }

    .dashboard-preview:hover {
      transform: perspective(1000px) rotateY(-5deg) rotateX(2deg);
    }

    .preview-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      background: var(--gray-100);
      border-bottom: 1px solid var(--gray-200);
    }

    .preview-dots {
      display: flex;
      gap: 0.5rem;
    }

    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .dot.red { background: #ef4444; }
    .dot.yellow { background: #f59e0b; }
    .dot.green { background: #10b981; }

    .preview-title {
      font-size: 0.75rem;
      color: var(--gray-500);
    }

    .preview-content {
      display: flex;
      min-height: 300px;
    }

    .preview-sidebar {
      width: 60px;
      background: var(--gray-50);
      border-right: 1px solid var(--gray-200);
      padding: 1rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .sidebar-item {
      width: 100%;
      height: 36px;
      background: var(--gray-200);
      border-radius: var(--radius);
      transition: background 0.2s;
    }

    .sidebar-item.active {
      background: var(--gradient);
    }

    .preview-main {
      flex: 1;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .preview-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
    }

    .preview-card {
      height: 60px;
      border-radius: var(--radius);
      animation: pulse 2s ease-in-out infinite;
    }

    .card-blue { background: linear-gradient(135deg, #818cf8, #4f46e5); }
    .card-green { background: linear-gradient(135deg, #34d399, #10b981); animation-delay: 0.5s; }
    .card-orange { background: linear-gradient(135deg, #fbbf24, #f59e0b); animation-delay: 1s; }
    .card-purple { background: linear-gradient(135deg, #a78bfa, #8b5cf6); animation-delay: 1.5s; }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    .preview-chart {
      height: 100px;
      background: linear-gradient(180deg, rgba(79, 70, 229, 0.1) 0%, transparent 100%);
      border-radius: var(--radius);
      border: 1px solid var(--gray-200);
    }

    .preview-table {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .table-row {
      height: 20px;
      background: var(--gray-100);
      border-radius: var(--radius);
    }

    @media (max-width: 1200px) {
      .hero-visual {
        display: none;
      }

      .hero-content {
        max-width: 100%;
        text-align: center;
      }

      .hero-description {
        max-width: 100%;
        margin-left: auto;
        margin-right: auto;
      }

      .hero-actions {
        justify-content: center;
      }

      .hero-stats {
        justify-content: center;
      }
    }

    @media (max-width: 768px) {
      .hero {
        padding: 7rem 1rem 3rem;
      }

      .hero-title {
        font-size: 2.25rem;
      }

      .hero-description {
        font-size: 1.1rem;
      }

      .hero-stats {
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
      }

      .hero-stat {
        align-items: center;
        text-align: center;
      }
    }

    /* Section Styles */
    section {
      padding: 6rem 0;
    }

    .section-header {
      text-align: center;
      max-width: 700px;
      margin: 0 auto 4rem;
    }

    .section-badge {
      display: inline-block;
      background: rgba(79, 70, 229, 0.1);
      color: var(--primary);
      padding: 0.5rem 1rem;
      border-radius: 50px;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .section-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: 1rem;
    }

    .section-description {
      font-size: 1.125rem;
      color: var(--gray-600);
    }

    @media (max-width: 768px) {
      section {
        padding: 4rem 0;
      }

      .section-title {
        font-size: 1.75rem;
      }
    }

    /* Features Section */
    .features-section {
      background: var(--gray-50);
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
    }

    .feature-card {
      background: var(--white);
      padding: 2rem;
      border-radius: var(--radius-lg);
      border: 1px solid var(--gray-200);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .feature-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--accent-color, var(--primary));
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .feature-card:hover::before {
      transform: scaleX(1);
    }

    .feature-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .feature-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--gray-900);
      margin-bottom: 0.75rem;
    }

    .feature-description {
      font-size: 0.95rem;
      color: var(--gray-600);
      margin-bottom: 1rem;
    }

    .feature-link {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      color: var(--primary);
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: gap 0.2s ease;
    }

    .feature-link:hover {
      gap: 0.5rem;
    }

    @media (max-width: 1024px) {
      .features-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .features-grid {
        grid-template-columns: 1fr;
      }
    }

    /* How It Works */
    .how-it-works {
      background: var(--white);
    }

    .steps-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .step {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      background: var(--gray-50);
      padding: 2rem;
      border-radius: var(--radius-lg);
      max-width: 350px;
      flex: 1;
      min-width: 280px;
      position: relative;
    }

    .step-number {
      position: absolute;
      top: -15px;
      left: -15px;
      width: 40px;
      height: 40px;
      background: var(--gradient);
      color: var(--white);
      font-weight: 700;
      font-size: 1.25rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-md);
    }

    .step-content h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--gray-900);
      margin-bottom: 0.5rem;
    }

    .step-content p {
      font-size: 0.9rem;
      color: var(--gray-600);
    }

    .step-icon {
      font-size: 2.5rem;
    }

    .step-connector {
      width: 60px;
      height: 2px;
      background: var(--gray-300);
      position: relative;
    }

    .step-connector::after {
      content: '';
      position: absolute;
      right: -6px;
      top: 50%;
      transform: translateY(-50%);
      border: 6px solid transparent;
      border-left-color: var(--gray-300);
    }

    @media (max-width: 1024px) {
      .step-connector {
        display: none;
      }
    }

    /* Roles Section */
    .roles-section {
      background: var(--gray-50);
    }

    .roles-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
      align-items: stretch;
    }

    .role-card {
      background: var(--white);
      padding: 2rem;
      border-radius: var(--radius-lg);
      border: 1px solid var(--gray-200);
      text-align: center;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
    }

    .role-card.featured {
      background: var(--gradient);
      border: none;
      transform: scale(1.05);
      box-shadow: var(--shadow-xl);
    }

    .role-card.featured .role-badge,
    .role-card.featured .role-title,
    .role-card.featured .role-features li {
      color: var(--white);
    }

    .role-card.featured .role-badge {
      background: rgba(255, 255, 255, 0.2);
    }

    .role-card:not(.featured):hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .role-badge {
      display: inline-block;
      background: var(--gray-100);
      color: var(--gray-600);
      padding: 0.25rem 0.75rem;
      border-radius: 50px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .role-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .role-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: 1rem;
    }

    .role-features {
      list-style: none;
      text-align: left;
      margin-bottom: 1.5rem;
      flex: 1;
    }

    .role-features li {
      padding: 0.5rem 0;
      color: var(--gray-600);
      font-size: 0.9rem;
      position: relative;
      padding-left: 1.5rem;
    }

    .role-features li::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: var(--success);
    }

    .role-card.featured .role-features li::before {
      color: rgba(255, 255, 255, 0.9);
    }

    @media (max-width: 1024px) {
      .roles-grid {
        grid-template-columns: 1fr;
        max-width: 400px;
        margin: 0 auto;
      }

      .role-card.featured {
        transform: none;
        order: -1;
      }
    }

    /* Testimonials Section */
    .testimonials-section {
      background: var(--white);
    }

    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
    }

    .testimonial-card {
      background: var(--gray-50);
      padding: 2rem;
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .testimonial-content {
      position: relative;
    }

    .quote-icon {
      position: absolute;
      top: -10px;
      left: 0;
      font-size: 4rem;
      color: var(--primary);
      opacity: 0.2;
      font-family: Georgia, serif;
      line-height: 1;
    }

    .testimonial-text {
      color: var(--gray-700);
      font-size: 0.95rem;
      line-height: 1.7;
      position: relative;
      z-index: 1;
    }

    .testimonial-author {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-top: auto;
    }

    .author-avatar {
      width: 50px;
      height: 50px;
      background: var(--gradient);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .author-info {
      display: flex;
      flex-direction: column;
    }

    .author-name {
      font-weight: 600;
      color: var(--gray-900);
    }

    .author-role {
      font-size: 0.85rem;
      color: var(--gray-500);
    }

    @media (max-width: 1024px) {
      .testimonials-grid {
        grid-template-columns: 1fr;
        max-width: 500px;
        margin: 0 auto;
      }
    }

    /* CTA Section */
    .cta-section {
      position: relative;
      background: var(--gradient);
      padding: 6rem 1.5rem;
      overflow: hidden;
    }

    .cta-bg {
      position: absolute;
      inset: 0;
    }

    .cta-shape {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
    }

    .cta-shape.shape-1 {
      width: 400px;
      height: 400px;
      top: -200px;
      right: -100px;
    }

    .cta-shape.shape-2 {
      width: 300px;
      height: 300px;
      bottom: -150px;
      left: -50px;
    }

    .cta-content {
      position: relative;
      text-align: center;
      max-width: 700px;
      margin: 0 auto;
    }

    .cta-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--white);
      margin-bottom: 1rem;
    }

    .cta-description {
      font-size: 1.125rem;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 2rem;
    }

    .cta-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    @media (max-width: 768px) {
      .cta-title {
        font-size: 1.75rem;
      }
    }

    /* Footer */
    .footer {
      background: var(--gray-900);
      padding: 4rem 1.5rem 2rem;
      color: var(--gray-400);
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 2fr repeat(4, 1fr);
      gap: 3rem;
      margin-bottom: 3rem;
    }

    .footer-brand .logo {
      margin-bottom: 1rem;
    }

    .footer-brand .logo .logo-text {
      color: var(--white);
    }

    .footer-description {
      font-size: 0.9rem;
      line-height: 1.7;
      margin-bottom: 1.5rem;
    }

    .social-links {
      display: flex;
      gap: 1rem;
    }

    .social-link {
      width: 40px;
      height: 40px;
      background: var(--gray-800);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--gray-400);
      transition: all 0.2s ease;
    }

    .social-link:hover {
      background: var(--primary);
      color: var(--white);
    }

    .footer-links h4 {
      color: var(--white);
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 1.25rem;
    }

    .footer-links ul {
      list-style: none;
    }

    .footer-links li {
      margin-bottom: 0.75rem;
    }

    .footer-links a {
      color: var(--gray-400);
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.2s;
    }

    .footer-links a:hover {
      color: var(--white);
    }

    .footer-bottom {
      border-top: 1px solid var(--gray-800);
      padding-top: 2rem;
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
    }

    @media (max-width: 1024px) {
      .footer-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .footer-brand {
        grid-column: span 2;
      }
    }

    @media (max-width: 640px) {
      .footer-grid {
        grid-template-columns: 1fr;
      }

      .footer-brand {
        grid-column: span 1;
      }

      .footer-bottom {
        flex-direction: column;
        gap: 0.5rem;
        text-align: center;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  mobileMenuOpen = signal(false);
  isLoggedIn = signal(false);
  currentYear = new Date().getFullYear();

  heroStats: Stat[] = [
    { value: '10K+', label: 'Entreprises', icon: '🏢' },
    { value: '99.9%', label: 'Disponibilité', icon: '⚡' },
    { value: '24/7', label: 'Support', icon: '🛟' }
  ];

  features: Feature[] = [
    {
      icon: '📦',
      title: 'Gestion des stocks',
      description: 'Suivez vos inventaires en temps réel avec une précision absolue. Multi-entrepôts, alertes de rupture et traçabilité complète.',
      color: '#001f3f'
    },
    {
      icon: '🚚',
      title: 'Expéditions & Tracking',
      description: 'Gérez vos expéditions du picking à la livraison. Intégration transporteurs et suivi en temps réel.',
      color: '#ff6600'
    },
    {
      icon: '📋',
      title: 'Commandes clients',
      description: 'Centralisez toutes vos commandes. Réservation automatique, gestion des backorders et workflow optimisé.',
      color: '#10b981'
    },
    {
      icon: '🏭',
      title: 'Multi-entrepôts',
      description: 'Gérez plusieurs sites de stockage avec allocation intelligente et transferts inter-entrepôts.',
      color: '#003366'
    },
    {
      icon: '📊',
      title: 'Reporting avancé',
      description: 'Tableaux de bord personnalisables, KPIs en temps réel et rapports automatisés.',
      color: '#ff8533'
    },
    {
      icon: '🔗',
      title: 'Approvisionnements',
      description: 'Gérez vos fournisseurs et bons de commande. Réception partielle et traçabilité complète.',
      color: '#001f3f'
    }
  ];

  testimonials: Testimonial[] = [
    {
      name: 'Marie Dupont',
      role: 'Directrice Supply Chain',
      company: 'GlobalTech Industries',
      text: 'X-NexusGo a transformé notre chaîne logistique. Nous avons réduit nos coûts de 35% et amélioré notre réactivité globale.',
      avatar: '👩‍💼'
    },
    {
      name: 'Pierre Martin',
      role: 'Directeur Opérations',
      company: 'FastShip International',
      text: 'La visibilité mondiale sur nos opérations nous permet de prendre des décisions stratégiques en temps réel.',
      avatar: '👨‍💼'
    },
    {
      name: 'Sophie Bernard',
      role: 'CEO',
      company: 'EcoRetail Europe',
      text: 'X-NexusGo est devenu indispensable. Solutions scalables, support réactif et résultats mesurables.',
      avatar: '👩‍💻'
    }
  ];

  ngOnInit() {
    this.isLoggedIn.set(this.authService.isAuthenticated());
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  goToDashboard() {
    const role = this.authService.getUserRole();
    switch (role) {
      case Role.ADMIN:
        this.router.navigate(['/admin']);
        break;
      case Role.WAREHOUSE_MANAGER:
        this.router.navigate(['/warehouse']);
        break;
      case Role.CLIENT:
        this.router.navigate(['/client']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }
}
