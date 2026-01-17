import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Feature {
  icon: string;
  title: string;
  description: string;
  details: string[];
}

interface Integration {
  name: string;
  icon: string;
  category: string;
}

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="features-page">
      <!-- Navigation -->
      <nav class="navbar">
        <div class="nav-container">
          <a routerLink="/" class="logo">
            <svg class="logo-icon" viewBox="0 0 32 32" width="32" height="32"><rect width="32" height="32" rx="6" fill="#001f3f"/><path d="M8 22 L16 10 L24 22" stroke="#ff6600" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="18" r="3" fill="#ff6600"/></svg>
            <span class="logo-text">X-NexusGo</span>
          </a>
          
          <div class="nav-links">
            <a routerLink="/" class="nav-link">Accueil</a>
            <a routerLink="/features" class="nav-link active">Fonctionnalités</a>
            <a routerLink="/about" class="nav-link">À propos</a>
            <a routerLink="/contact" class="nav-link">Contact</a>
          </div>

          <div class="nav-actions">
            <a routerLink="/login" class="btn btn-outline">Connexion</a>
            <a routerLink="/register" class="btn btn-primary">S'inscrire</a>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-bg"></div>
        <div class="container">
          <div class="hero-content">
            <span class="section-badge">Fonctionnalités</span>
            <h1 class="hero-title">
              Des outils puissants pour une
              <span class="gradient-text">logistique optimisée</span>
            </h1>
            <p class="hero-description">
              Découvrez toutes les fonctionnalités qui font de X-NexusGo la solution 
              de référence pour la gestion logistique mondiale.
            </p>
          </div>
        </div>
      </section>

      <!-- Main Features Grid -->
      <section class="features-section">
        <div class="container">
          <div class="features-grid">
            @for (feature of mainFeatures; track feature.title; let i = $index) {
              <div class="feature-card" [class.expanded]="expandedFeature() === i" (click)="toggleFeature(i)">
                <div class="feature-header">
                  <div class="feature-icon">{{ feature.icon }}</div>
                  <div class="feature-info">
                    <h3 class="feature-title">{{ feature.title }}</h3>
                    <p class="feature-description">{{ feature.description }}</p>
                  </div>
                  <div class="feature-toggle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" [class.rotated]="expandedFeature() === i"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
                @if (expandedFeature() === i) {
                  <div class="feature-details">
                    <ul>
                      @for (detail of feature.details; track detail) {
                        <li>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                          {{ detail }}
                        </li>
                      }
                    </ul>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Detailed Features -->
      <section class="detailed-features">
        <div class="container">
          <!-- Stock Management -->
          <div class="detailed-feature">
            <div class="detailed-content">
              <span class="feature-badge">Gestion des stocks</span>
              <h2>Contrôle total de votre inventaire</h2>
              <p>
                Notre système de gestion des stocks vous offre une visibilité complète sur vos 
                inventaires en temps réel. Suivez chaque produit, chaque mouvement, dans chaque entrepôt.
              </p>
              <ul class="check-list">
                <li>
                  <span class="check-icon">✓</span>
                  <span>Suivi en temps réel des quantités disponibles</span>
                </li>
                <li>
                  <span class="check-icon">✓</span>
                  <span>Alertes automatiques de rupture de stock</span>
                </li>
                <li>
                  <span class="check-icon">✓</span>
                  <span>Historique complet des mouvements</span>
                </li>
                <li>
                  <span class="check-icon">✓</span>
                  <span>Gestion des réservations et disponibilités</span>
                </li>
              </ul>
              <a routerLink="/register" class="btn btn-primary">
                Commencer maintenant
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
            </div>
            <div class="detailed-visual">
              <div class="visual-card">
                <div class="visual-header">
                  <span class="visual-title">📊 Tableau de stock</span>
                </div>
                <div class="visual-content">
                  <div class="stock-item">
                    <div class="stock-product">
                      <span class="product-icon">📱</span>
                      <div>
                        <span class="product-name">Smartphone X12</span>
                        <span class="product-sku">SKU-001</span>
                      </div>
                    </div>
                    <div class="stock-qty good">245</div>
                  </div>
                  <div class="stock-item">
                    <div class="stock-product">
                      <span class="product-icon">💻</span>
                      <div>
                        <span class="product-name">Laptop Pro</span>
                        <span class="product-sku">SKU-002</span>
                      </div>
                    </div>
                    <div class="stock-qty medium">52</div>
                  </div>
                  <div class="stock-item alert">
                    <div class="stock-product">
                      <span class="product-icon">🎧</span>
                      <div>
                        <span class="product-name">Casque Audio</span>
                        <span class="product-sku">SKU-003</span>
                      </div>
                    </div>
                    <div class="stock-qty low">8</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Orders Management -->
          <div class="detailed-feature reverse">
            <div class="detailed-content">
              <span class="feature-badge">Commandes</span>
              <h2>Workflow de commande optimisé</h2>
              <p>
                Gérez le cycle de vie complet de vos commandes, de la création à la livraison. 
                Automatisez les réservations et suivez chaque étape en temps réel.
              </p>
              <ul class="check-list">
                <li>
                  <span class="check-icon">✓</span>
                  <span>Création de commandes multi-lignes</span>
                </li>
                <li>
                  <span class="check-icon">✓</span>
                  <span>Réservation automatique du stock</span>
                </li>
                <li>
                  <span class="check-icon">✓</span>
                  <span>Gestion des backorders</span>
                </li>
                <li>
                  <span class="check-icon">✓</span>
                  <span>Suivi des statuts en temps réel</span>
                </li>
              </ul>
              <a routerLink="/register" class="btn btn-primary">
                Découvrir
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
            </div>
            <div class="detailed-visual">
              <div class="visual-card">
                <div class="visual-header">
                  <span class="visual-title">📋 Cycle de commande</span>
                </div>
                <div class="visual-content">
                  <div class="order-timeline">
                    <div class="timeline-step completed">
                      <div class="step-dot"></div>
                      <div class="step-content">
                        <span class="step-label">Créée</span>
                        <span class="step-time">10:30</span>
                      </div>
                    </div>
                    <div class="timeline-step completed">
                      <div class="step-dot"></div>
                      <div class="step-content">
                        <span class="step-label">Réservée</span>
                        <span class="step-time">10:32</span>
                      </div>
                    </div>
                    <div class="timeline-step active">
                      <div class="step-dot"></div>
                      <div class="step-content">
                        <span class="step-label">Expédiée</span>
                        <span class="step-time">14:00</span>
                      </div>
                    </div>
                    <div class="timeline-step">
                      <div class="step-dot"></div>
                      <div class="step-content">
                        <span class="step-label">Livrée</span>
                        <span class="step-time">-</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Shipping -->
          <div class="detailed-feature">
            <div class="detailed-content">
              <span class="feature-badge">Expéditions</span>
              <h2>Tracking et livraison simplifiés</h2>
              <p>
                Gérez vos expéditions avec précision. Attribuez des transporteurs, 
                générez des numéros de suivi et informez vos clients en temps réel.
              </p>
              <ul class="check-list">
                <li>
                  <span class="check-icon">✓</span>
                  <span>Attribution automatique des transporteurs</span>
                </li>
                <li>
                  <span class="check-icon">✓</span>
                  <span>Génération de numéros de suivi</span>
                </li>
                <li>
                  <span class="check-icon">✓</span>
                  <span>Respect du cut-off logistique</span>
                </li>
                <li>
                  <span class="check-icon">✓</span>
                  <span>Notifications automatiques</span>
                </li>
              </ul>
              <a routerLink="/register" class="btn btn-primary">
                En savoir plus
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
            </div>
            <div class="detailed-visual">
              <div class="visual-card shipment-card">
                <div class="shipment-header">
                  <span class="shipment-icon">🚚</span>
                  <div class="shipment-info">
                    <span class="shipment-id">#SHP-2024-001</span>
                    <span class="shipment-carrier">Express Delivery</span>
                  </div>
                  <span class="shipment-status in-transit">En transit</span>
                </div>
                <div class="shipment-tracking">
                  <div class="tracking-bar">
                    <div class="tracking-progress" style="width: 65%"></div>
                  </div>
                  <div class="tracking-labels">
                    <span>Expédié</span>
                    <span>En route</span>
                    <span>Livré</span>
                  </div>
                </div>
                <div class="shipment-eta">
                  <span class="eta-label">Livraison estimée</span>
                  <span class="eta-date">Demain, 14h - 18h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Integrations -->
      <section class="integrations-section">
        <div class="container">
          <div class="section-header">
            <span class="section-badge">Intégrations</span>
            <h2 class="section-title">Connectez vos outils favoris</h2>
            <p class="section-description">
              X-NexusGo s'intègre avec les principaux outils de votre écosystème
            </p>
          </div>

          <div class="integrations-grid">
            @for (integration of integrations; track integration.name) {
              <div class="integration-card">
                <span class="integration-icon">{{ integration.icon }}</span>
                <span class="integration-name">{{ integration.name }}</span>
                <span class="integration-category">{{ integration.category }}</span>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Comparison Table -->
      <section class="comparison-section">
        <div class="container">
          <div class="section-header">
            <span class="section-badge">Comparatif</span>
            <h2 class="section-title">Pourquoi choisir X-NexusGo ?</h2>
          </div>

          <div class="comparison-table-wrapper">
            <table class="comparison-table">
              <thead>
                <tr>
                  <th>Fonctionnalité</th>
                  <th>X-NexusGo</th>
                  <th>Autres solutions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Gestion multi-entrepôts</td>
                  <td><span class="check">✓</span> Illimitée</td>
                  <td><span class="limited">○</span> Limitée</td>
                </tr>
                <tr>
                  <td>Tracking temps réel</td>
                  <td><span class="check">✓</span> Inclus</td>
                  <td><span class="limited">○</span> En supplément</td>
                </tr>
                <tr>
                  <td>API REST complète</td>
                  <td><span class="check">✓</span> Documentée</td>
                  <td><span class="cross">✗</span> Partielle</td>
                </tr>
                <tr>
                  <td>Réservation automatique</td>
                  <td><span class="check">✓</span> Intelligente</td>
                  <td><span class="limited">○</span> Manuelle</td>
                </tr>
                <tr>
                  <td>Gestion des backorders</td>
                  <td><span class="check">✓</span> Automatisée</td>
                  <td><span class="cross">✗</span> Non</td>
                </tr>
                <tr>
                  <td>Support</td>
                  <td><span class="check">✓</span> 24/7</td>
                  <td><span class="limited">○</span> Heures ouvrées</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="container">
          <div class="cta-content">
            <h2>Prêt à optimiser votre logistique ?</h2>
            <p>Créez votre compte gratuitement et découvrez toutes les fonctionnalités.</p>
            <div class="cta-actions">
              <a routerLink="/register" class="btn btn-white btn-lg">
                <span>Commencer gratuitement</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
              <a routerLink="/contact" class="btn btn-ghost-white btn-lg">Nous contacter</a>
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
      --warning: #f59e0b;
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
      --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
      --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
      --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
      --radius: 0.5rem;
      --radius-lg: 1rem;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    .features-page {
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

    .btn-white {
      background: var(--white);
      color: var(--primary);
    }

    .btn-white:hover {
      background: var(--gray-100);
      transform: translateY(-2px);
    }

    .btn-ghost-white {
      background: transparent;
      color: var(--white);
      border-color: rgba(255, 255, 255, 0.3);
    }

    .btn-ghost-white:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .btn-lg {
      padding: 1rem 2rem;
      font-size: 1.05rem;
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
    }

    .hero-bg {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, var(--gray-50) 0%, var(--white) 50%, rgba(79, 70, 229, 0.05) 100%);
      z-index: -1;
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

    @media (max-width: 768px) {
      .hero { padding: 7rem 1rem 4rem; }
      .hero-title { font-size: 2rem; }
    }

    /* Features Grid Section */
    .features-section {
      padding: 4rem 0;
      background: var(--white);
    }

    .features-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .feature-card {
      background: var(--gray-50);
      border-radius: var(--radius-lg);
      border: 1px solid var(--gray-200);
      cursor: pointer;
      transition: all 0.3s ease;
      overflow: hidden;
    }

    .feature-card:hover {
      border-color: var(--primary-light);
    }

    .feature-card.expanded {
      background: var(--white);
      box-shadow: var(--shadow-lg);
    }

    .feature-header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1.5rem;
    }

    .feature-icon {
      font-size: 2.5rem;
      flex-shrink: 0;
    }

    .feature-info {
      flex: 1;
    }

    .feature-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--gray-900);
      margin-bottom: 0.25rem;
    }

    .feature-description {
      color: var(--gray-600);
      font-size: 0.95rem;
    }

    .feature-toggle {
      color: var(--gray-400);
      transition: transform 0.3s;
    }

    .feature-toggle svg.rotated {
      transform: rotate(180deg);
    }

    .feature-details {
      padding: 0 1.5rem 1.5rem;
      border-top: 1px solid var(--gray-200);
      margin-top: 0;
      padding-top: 1.5rem;
    }

    .feature-details ul {
      list-style: none;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .feature-details li {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--gray-700);
    }

    .feature-details li svg {
      color: var(--success);
      flex-shrink: 0;
    }

    @media (max-width: 768px) {
      .feature-details ul {
        grid-template-columns: 1fr;
      }
    }

    /* Detailed Features */
    .detailed-features {
      padding: 6rem 0;
      background: var(--gray-50);
    }

    .detailed-feature {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
      margin-bottom: 6rem;
    }

    .detailed-feature:last-child {
      margin-bottom: 0;
    }

    .detailed-feature.reverse {
      direction: rtl;
    }

    .detailed-feature.reverse > * {
      direction: ltr;
    }

    .feature-badge {
      display: inline-block;
      background: var(--gradient);
      color: var(--white);
      padding: 0.375rem 0.875rem;
      border-radius: 50px;
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .detailed-content h2 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: 1rem;
    }

    .detailed-content > p {
      font-size: 1.1rem;
      color: var(--gray-600);
      margin-bottom: 1.5rem;
    }

    .check-list {
      list-style: none;
      margin-bottom: 2rem;
    }

    .check-list li {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.5rem 0;
      color: var(--gray-700);
    }

    .check-icon {
      color: var(--success);
      font-weight: 700;
    }

    /* Visual Cards */
    .visual-card {
      background: var(--white);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      overflow: hidden;
      border: 1px solid var(--gray-200);
    }

    .visual-header {
      padding: 1rem 1.5rem;
      background: var(--gray-50);
      border-bottom: 1px solid var(--gray-200);
    }

    .visual-title {
      font-weight: 600;
      color: var(--gray-700);
    }

    .visual-content {
      padding: 1.5rem;
    }

    /* Stock Items */
    .stock-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-radius: var(--radius);
      margin-bottom: 0.75rem;
      background: var(--gray-50);
      transition: all 0.2s;
    }

    .stock-item.alert {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .stock-product {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .product-icon {
      font-size: 1.5rem;
    }

    .product-name {
      display: block;
      font-weight: 600;
      color: var(--gray-900);
    }

    .product-sku {
      font-size: 0.8rem;
      color: var(--gray-500);
    }

    .stock-qty {
      font-size: 1.25rem;
      font-weight: 700;
    }

    .stock-qty.good { color: var(--success); }
    .stock-qty.medium { color: var(--warning); }
    .stock-qty.low { color: var(--danger); }

    /* Order Timeline */
    .order-timeline {
      position: relative;
      padding-left: 1.5rem;
    }

    .order-timeline::before {
      content: '';
      position: absolute;
      left: 7px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--gray-200);
    }

    .timeline-step {
      position: relative;
      padding: 1rem 0;
    }

    .step-dot {
      position: absolute;
      left: -1.5rem;
      top: 1.25rem;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--gray-300);
      border: 3px solid var(--white);
      box-shadow: var(--shadow-sm);
    }

    .timeline-step.completed .step-dot {
      background: var(--success);
    }

    .timeline-step.active .step-dot {
      background: var(--primary);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4); }
      50% { box-shadow: 0 0 0 8px rgba(79, 70, 229, 0); }
    }

    .step-label {
      font-weight: 600;
      color: var(--gray-900);
    }

    .step-time {
      font-size: 0.85rem;
      color: var(--gray-500);
    }

    /* Shipment Card */
    .shipment-card {
      padding: 1.5rem;
    }

    .shipment-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .shipment-icon {
      font-size: 2rem;
    }

    .shipment-info {
      flex: 1;
    }

    .shipment-id {
      display: block;
      font-weight: 600;
      color: var(--gray-900);
    }

    .shipment-carrier {
      font-size: 0.85rem;
      color: var(--gray-500);
    }

    .shipment-status {
      padding: 0.375rem 0.875rem;
      border-radius: 50px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .shipment-status.in-transit {
      background: rgba(79, 70, 229, 0.1);
      color: var(--primary);
    }

    .shipment-tracking {
      margin-bottom: 1.5rem;
    }

    .tracking-bar {
      height: 8px;
      background: var(--gray-200);
      border-radius: 4px;
      overflow: hidden;
    }

    .tracking-progress {
      height: 100%;
      background: var(--gradient);
      border-radius: 4px;
      transition: width 0.5s ease;
    }

    .tracking-labels {
      display: flex;
      justify-content: space-between;
      margin-top: 0.5rem;
      font-size: 0.8rem;
      color: var(--gray-500);
    }

    .shipment-eta {
      background: var(--gray-50);
      padding: 1rem;
      border-radius: var(--radius);
      text-align: center;
    }

    .eta-label {
      display: block;
      font-size: 0.85rem;
      color: var(--gray-500);
      margin-bottom: 0.25rem;
    }

    .eta-date {
      font-weight: 600;
      color: var(--gray-900);
    }

    @media (max-width: 1024px) {
      .detailed-feature {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .detailed-feature.reverse {
        direction: ltr;
      }

      .detailed-visual {
        order: -1;
      }
    }

    /* Integrations */
    .integrations-section {
      padding: 6rem 0;
      background: var(--white);
    }

    .section-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .section-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: 0.5rem;
    }

    .section-description {
      color: var(--gray-600);
    }

    .integrations-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 1.5rem;
    }

    .integration-card {
      background: var(--gray-50);
      padding: 1.5rem;
      border-radius: var(--radius-lg);
      text-align: center;
      border: 1px solid var(--gray-200);
      transition: all 0.2s;
    }

    .integration-card:hover {
      border-color: var(--primary-light);
      transform: translateY(-2px);
    }

    .integration-icon {
      font-size: 2.5rem;
      display: block;
      margin-bottom: 0.5rem;
    }

    .integration-name {
      display: block;
      font-weight: 600;
      color: var(--gray-900);
      margin-bottom: 0.25rem;
    }

    .integration-category {
      font-size: 0.75rem;
      color: var(--gray-500);
    }

    @media (max-width: 1024px) {
      .integrations-grid { grid-template-columns: repeat(3, 1fr); }
    }

    @media (max-width: 640px) {
      .integrations-grid { grid-template-columns: repeat(2, 1fr); }
    }

    /* Comparison Table */
    .comparison-section {
      padding: 6rem 0;
      background: var(--gray-50);
    }

    .comparison-table-wrapper {
      overflow-x: auto;
    }

    .comparison-table {
      width: 100%;
      border-collapse: collapse;
      background: var(--white);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-lg);
    }

    .comparison-table th,
    .comparison-table td {
      padding: 1.25rem 1.5rem;
      text-align: left;
      border-bottom: 1px solid var(--gray-200);
    }

    .comparison-table th {
      background: var(--gray-900);
      color: var(--white);
      font-weight: 600;
    }

    .comparison-table th:first-child {
      width: 40%;
    }

    .comparison-table tr:last-child td {
      border-bottom: none;
    }

    .comparison-table tr:hover td {
      background: var(--gray-50);
    }

    .check { color: var(--success); font-weight: 700; }
    .limited { color: var(--warning); }
    .cross { color: var(--danger); }

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
      gap: 1rem;
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
export class FeaturesComponent {
  expandedFeature = signal<number | null>(null);
  currentYear = new Date().getFullYear();

  mainFeatures: Feature[] = [
    {
      icon: '📦',
      title: 'Gestion des produits',
      description: 'Créez et gérez votre catalogue produits avec SKU, catégories et statuts.',
      details: [
        'Création et édition de produits',
        'Gestion des SKU uniques',
        'Catégorisation flexible',
        'Activation/désactivation des produits',
        'Import/export en masse',
        'Historique des modifications'
      ]
    },
    {
      icon: '🏭',
      title: 'Multi-entrepôts',
      description: 'Gérez plusieurs sites de stockage avec allocation intelligente.',
      details: [
        'Nombre d\'entrepôts illimité',
        'Transferts inter-entrepôts',
        'Allocation par priorité',
        'Vue consolidée des stocks',
        'Codes entrepôts uniques',
        'Configuration des capacités'
      ]
    },
    {
      icon: '📊',
      title: 'Mouvements de stock',
      description: 'Tracez chaque entrée, sortie et ajustement avec précision.',
      details: [
        'Entrées (INBOUND) avec références',
        'Sorties (OUTBOUND) automatiques',
        'Ajustements manuels (ADJUSTMENT)',
        'Historique complet traçable',
        'Validation des quantités',
        'Zéro stock négatif garanti'
      ]
    },
    {
      icon: '🛒',
      title: 'Commandes clients',
      description: 'Workflow complet de la création à la livraison.',
      details: [
        'Commandes multi-lignes',
        'Cycle CREATED → DELIVERED',
        'Réservation automatique',
        'Gestion des annulations',
        'Backorders automatiques',
        'Cut-off logistique (15h)'
      ]
    },
    {
      icon: '🚚',
      title: 'Expéditions',
      description: 'Planifiez et suivez vos livraisons en temps réel.',
      details: [
        'Création de shipments',
        'Attribution des transporteurs',
        'Numéros de suivi',
        'Statuts PLANNED → DELIVERED',
        'Respect des capacités créneau',
        'Notifications automatiques'
      ]
    },
    {
      icon: '📋',
      title: 'Approvisionnements',
      description: 'Gérez vos achats fournisseurs et réceptions.',
      details: [
        'Bons de commande (PO)',
        'Gestion des fournisseurs',
        'Réception partielle',
        'Cycle APPROVED → RECEIVED',
        'Mise à jour stock automatique',
        'Traçabilité complète'
      ]
    }
  ];

  integrations: Integration[] = [
    { name: 'Stripe', icon: '💳', category: 'Paiement' },
    { name: 'Shopify', icon: '🛍️', category: 'E-commerce' },
    { name: 'DHL', icon: '📦', category: 'Transport' },
    { name: 'Slack', icon: '💬', category: 'Communication' },
    { name: 'QuickBooks', icon: '📒', category: 'Comptabilité' },
    { name: 'Zapier', icon: '⚡', category: 'Automation' }
  ];

  toggleFeature(index: number) {
    this.expandedFeature.update(current => current === index ? null : index);
  }
}
