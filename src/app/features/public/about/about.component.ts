import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  bio: string;
}

interface Value {
  icon: string;
  title: string;
  description: string;
}

interface Milestone {
  year: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="about-page">
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
            <a routerLink="/about" class="nav-link active">À propos</a>
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
        <div class="hero-bg">
          <div class="hero-shape shape-1"></div>
          <div class="hero-shape shape-2"></div>
        </div>
        <div class="container">
          <div class="hero-content">
            <span class="section-badge">À propos</span>
            <h1 class="hero-title">
              Nous révolutionnons la
              <span class="gradient-text">logistique moderne</span>
            </h1>
            <p class="hero-description">
              Leader mondial des solutions supply chain, X-NexusGo connecte les entreprises 
              à travers un réseau logistique intégré de bout en bout.
            </p>
          </div>
        </div>
      </section>

      <!-- Mission Section -->
      <section class="mission-section">
        <div class="container">
          <div class="mission-grid">
            <div class="mission-content">
              <span class="section-badge">Notre mission</span>
              <h2>Rendre la logistique accessible et efficace</h2>
              <p>
                Nous croyons que chaque entreprise, quelle que soit sa taille, mérite 
                des outils logistiques de qualité professionnelle. Notre plateforme 
                démocratise l'accès aux meilleures pratiques de gestion de la supply chain.
              </p>
              <p>
                Notre vision est de devenir le partenaire technologique de référence pour 
                toutes les entreprises souhaitant optimiser leur chaîne logistique, en 
                combinant simplicité d'utilisation et puissance fonctionnelle.
              </p>
            </div>
            <div class="mission-stats">
              <div class="stat-card">
                <span class="stat-value">10K+</span>
                <span class="stat-label">Entreprises actives</span>
              </div>
              <div class="stat-card">
                <span class="stat-value">50M+</span>
                <span class="stat-label">Commandes traitées</span>
              </div>
              <div class="stat-card">
                <span class="stat-value">99.9%</span>
                <span class="stat-label">Disponibilité</span>
              </div>
              <div class="stat-card">
                <span class="stat-value">30+</span>
                <span class="stat-label">Pays couverts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Values Section -->
      <section class="values-section">
        <div class="container">
          <div class="section-header">
            <span class="section-badge">Nos valeurs</span>
            <h2 class="section-title">Ce qui nous guide</h2>
          </div>

          <div class="values-grid">
            @for (value of values; track value.title) {
              <div class="value-card">
                <div class="value-icon">{{ value.icon }}</div>
                <h3>{{ value.title }}</h3>
                <p>{{ value.description }}</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Timeline Section -->
      <section class="timeline-section">
        <div class="container">
          <div class="section-header">
            <span class="section-badge">Notre histoire</span>
            <h2 class="section-title">Le parcours X-NexusGo</h2>
          </div>

          <div class="timeline">
            @for (milestone of milestones; track milestone.year; let i = $index; let last = $last) {
              <div class="timeline-item" [class.left]="i % 2 === 0" [class.right]="i % 2 !== 0">
                <div class="timeline-content">
                  <span class="timeline-year">{{ milestone.year }}</span>
                  <h3>{{ milestone.title }}</h3>
                  <p>{{ milestone.description }}</p>
                </div>
                <div class="timeline-dot"></div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Team Section -->
      <section class="team-section">
        <div class="container">
          <div class="section-header">
            <span class="section-badge">Notre équipe</span>
            <h2 class="section-title">Les visages derrière X-NexusGo</h2>
            <p class="section-description">
              Une équipe passionnée et expérimentée au service de votre logistique
            </p>
          </div>

          <div class="team-grid">
            @for (member of team; track member.name) {
              <div class="team-card">
                <div class="member-avatar">{{ member.avatar }}</div>
                <h3 class="member-name">{{ member.name }}</h3>
                <span class="member-role">{{ member.role }}</span>
                <p class="member-bio">{{ member.bio }}</p>
                <div class="member-social">
                  <a href="#" class="social-link">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  </a>
                  <a href="#" class="social-link">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                  </a>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Technology Section -->
      <section class="tech-section">
        <div class="container">
          <div class="tech-content">
            <div class="tech-info">
              <span class="section-badge">Technologie</span>
              <h2>Construit avec les meilleures technologies</h2>
              <p>
                X-NexusGo repose sur une architecture moderne et robuste, garantissant 
                performance, sécurité et évolutivité. Notre stack technologique a été 
                choisi pour offrir la meilleure expérience utilisateur possible.
              </p>
              <ul class="tech-list">
                <li>
                  <span class="tech-icon">⚡</span>
                  <div>
                    <strong>Angular</strong>
                    <span>Frontend moderne et réactif</span>
                  </div>
                </li>
                <li>
                  <span class="tech-icon">🍃</span>
                  <div>
                    <strong>Spring Boot</strong>
                    <span>API REST robuste et sécurisée</span>
                  </div>
                </li>
                <li>
                  <span class="tech-icon">🐘</span>
                  <div>
                    <strong>PostgreSQL</strong>
                    <span>Base de données fiable</span>
                  </div>
                </li>
                <li>
                  <span class="tech-icon">🐳</span>
                  <div>
                    <strong>Docker</strong>
                    <span>Déploiement containerisé</span>
                  </div>
                </li>
              </ul>
            </div>
            <div class="tech-visual">
              <div class="architecture-diagram">
                <div class="arch-layer frontend">
                  <span class="layer-icon">🌐</span>
                  <span class="layer-name">Frontend Angular</span>
                </div>
                <div class="arch-arrow">↓</div>
                <div class="arch-layer api">
                  <span class="layer-icon">🔌</span>
                  <span class="layer-name">API REST</span>
                </div>
                <div class="arch-arrow">↓</div>
                <div class="arch-layer services">
                  <span class="layer-icon">⚙️</span>
                  <span class="layer-name">Business Logic</span>
                </div>
                <div class="arch-arrow">↓</div>
                <div class="arch-layer database">
                  <span class="layer-icon">💾</span>
                  <span class="layer-name">Database</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="container">
          <div class="cta-content">
            <h2>Rejoignez l'aventure X-NexusGo</h2>
            <p>
              Découvrez comment nous pouvons transformer votre logistique. 
              Commencez gratuitement dès aujourd'hui.
            </p>
            <div class="cta-actions">
              <a routerLink="/register" class="btn btn-white btn-lg">
                <span>Créer un compte</span>
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

    .about-page {
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
      background: linear-gradient(135deg, var(--gray-50) 0%, var(--white) 100%);
      z-index: -1;
    }

    .hero-shape {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      opacity: 0.5;
    }

    .shape-1 {
      width: 500px;
      height: 500px;
      background: rgba(79, 70, 229, 0.15);
      top: -200px;
      right: -100px;
    }

    .shape-2 {
      width: 400px;
      height: 400px;
      background: rgba(6, 182, 212, 0.15);
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
    }

    @media (max-width: 768px) {
      .hero { padding: 7rem 1rem 4rem; }
      .hero-title { font-size: 2rem; }
    }

    /* Mission Section */
    .mission-section {
      padding: 6rem 0;
      background: var(--white);
    }

    .mission-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
    }

    .mission-content h2 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: 1.5rem;
    }

    .mission-content p {
      color: var(--gray-600);
      font-size: 1.1rem;
      margin-bottom: 1rem;
    }

    .mission-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    .stat-card {
      background: var(--gray-50);
      padding: 2rem;
      border-radius: var(--radius-lg);
      text-align: center;
      border: 1px solid var(--gray-200);
    }

    .stat-value {
      display: block;
      font-size: 2.5rem;
      font-weight: 800;
      background: var(--gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .stat-label {
      color: var(--gray-600);
      font-size: 0.9rem;
    }

    @media (max-width: 1024px) {
      .mission-grid {
        grid-template-columns: 1fr;
        gap: 3rem;
      }
    }

    /* Values Section */
    .values-section {
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

    .section-description {
      color: var(--gray-600);
      margin-top: 0.5rem;
    }

    .values-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2rem;
    }

    .value-card {
      background: var(--white);
      padding: 2rem;
      border-radius: var(--radius-lg);
      text-align: center;
      border: 1px solid var(--gray-200);
      transition: all 0.3s ease;
    }

    .value-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .value-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .value-card h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--gray-900);
      margin-bottom: 0.5rem;
    }

    .value-card p {
      font-size: 0.9rem;
      color: var(--gray-600);
    }

    @media (max-width: 1024px) {
      .values-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 640px) {
      .values-grid { grid-template-columns: 1fr; }
    }

    /* Timeline Section */
    .timeline-section {
      padding: 6rem 0;
      background: var(--white);
    }

    .timeline {
      position: relative;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 0;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 50%;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--gray-200);
      transform: translateX(-50%);
    }

    .timeline-item {
      position: relative;
      width: 50%;
      padding: 0 2.5rem 3rem;
    }

    .timeline-item.left {
      left: 0;
      text-align: right;
    }

    .timeline-item.right {
      left: 50%;
    }

    .timeline-dot {
      position: absolute;
      top: 0;
      width: 16px;
      height: 16px;
      background: var(--gradient);
      border-radius: 50%;
      border: 3px solid var(--white);
      box-shadow: var(--shadow-lg);
    }

    .timeline-item.left .timeline-dot {
      right: -8px;
    }

    .timeline-item.right .timeline-dot {
      left: -8px;
    }

    .timeline-content {
      background: var(--gray-50);
      padding: 1.5rem;
      border-radius: var(--radius-lg);
      border: 1px solid var(--gray-200);
    }

    .timeline-year {
      display: inline-block;
      background: var(--gradient);
      color: var(--white);
      padding: 0.25rem 0.75rem;
      border-radius: 50px;
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
    }

    .timeline-content h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--gray-900);
      margin-bottom: 0.5rem;
    }

    .timeline-content p {
      font-size: 0.9rem;
      color: var(--gray-600);
    }

    @media (max-width: 768px) {
      .timeline::before {
        left: 20px;
      }

      .timeline-item {
        width: 100%;
        left: 0 !important;
        text-align: left !important;
        padding-left: 50px;
        padding-right: 0;
      }

      .timeline-dot {
        left: 12px !important;
        right: auto !important;
      }
    }

    /* Team Section */
    .team-section {
      padding: 6rem 0;
      background: var(--gray-50);
    }

    .team-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2rem;
    }

    .team-card {
      background: var(--white);
      padding: 2rem;
      border-radius: var(--radius-lg);
      text-align: center;
      border: 1px solid var(--gray-200);
      transition: all 0.3s ease;
    }

    .team-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .member-avatar {
      width: 80px;
      height: 80px;
      background: var(--gradient);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      margin: 0 auto 1rem;
    }

    .member-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--gray-900);
    }

    .member-role {
      display: block;
      color: var(--primary);
      font-size: 0.85rem;
      font-weight: 500;
      margin-bottom: 0.75rem;
    }

    .member-bio {
      font-size: 0.9rem;
      color: var(--gray-600);
      margin-bottom: 1rem;
    }

    .member-social {
      display: flex;
      justify-content: center;
      gap: 0.75rem;
    }

    .social-link {
      width: 36px;
      height: 36px;
      background: var(--gray-100);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--gray-500);
      transition: all 0.2s;
    }

    .social-link:hover {
      background: var(--primary);
      color: var(--white);
    }

    @media (max-width: 1024px) {
      .team-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 640px) {
      .team-grid { grid-template-columns: 1fr; }
    }

    /* Tech Section */
    .tech-section {
      padding: 6rem 0;
      background: var(--white);
    }

    .tech-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
    }

    .tech-info h2 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: 1rem;
    }

    .tech-info > p {
      color: var(--gray-600);
      font-size: 1.05rem;
      margin-bottom: 2rem;
    }

    .tech-list {
      list-style: none;
    }

    .tech-list li {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid var(--gray-100);
    }

    .tech-icon {
      font-size: 1.5rem;
    }

    .tech-list strong {
      display: block;
      color: var(--gray-900);
    }

    .tech-list span {
      font-size: 0.9rem;
      color: var(--gray-500);
    }

    .architecture-diagram {
      background: var(--gray-50);
      padding: 2rem;
      border-radius: var(--radius-lg);
      border: 1px solid var(--gray-200);
    }

    .arch-layer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 1.5rem;
      border-radius: var(--radius);
      text-align: center;
      font-weight: 600;
    }

    .layer-icon {
      font-size: 1.5rem;
    }

    .layer-name {
      color: var(--white);
    }

    .arch-layer.frontend {
      background: linear-gradient(135deg, #ef4444, #f97316);
    }

    .arch-layer.api {
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
    }

    .arch-layer.services {
      background: linear-gradient(135deg, #10b981, #06b6d4);
    }

    .arch-layer.database {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    }

    .arch-arrow {
      text-align: center;
      font-size: 1.5rem;
      color: var(--gray-400);
      padding: 0.5rem 0;
    }

    @media (max-width: 1024px) {
      .tech-content {
        grid-template-columns: 1fr;
        gap: 3rem;
      }
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
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
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
export class AboutComponent {
  currentYear = new Date().getFullYear();

  values: Value[] = [
    {
      icon: '🎯',
      title: 'Excellence',
      description: 'Nous visons l\'excellence dans tout ce que nous faisons.'
    },
    {
      icon: '🤝',
      title: 'Collaboration',
      description: 'Le succès se construit ensemble, avec nos clients et partenaires.'
    },
    {
      icon: '💡',
      title: 'Innovation',
      description: 'Nous repoussons les limites pour créer des solutions avant-gardistes.'
    },
    {
      icon: '🛡️',
      title: 'Fiabilité',
      description: 'Nos clients peuvent compter sur nous, 24h/24, 7j/7.'
    }
  ];

  milestones: Milestone[] = [
    {
      year: '2020',
      title: 'Fondation',
      description: 'X-NexusGo est créée par des experts de la supply chain internationale.'
    },
    {
      year: '2021',
      title: 'Expansion mondiale',
      description: 'Déploiement dans 15 pays avec support multi-langues.'
    },
    {
      year: '2022',
      title: '5000 clients',
      description: 'Cap des 5000 entreprises utilisatrices franchi.'
    },
    {
      year: '2023',
      title: 'Global Network',
      description: 'Présence dans 60+ pays avec partenaires locaux.'
    },
    {
      year: '2024',
      title: 'IA & Automation',
      description: 'Intégration de fonctionnalités d\'IA pour la prédiction des stocks.'
    }
  ];

  team: TeamMember[] = [
    {
      name: 'Alexandre Martin',
      role: 'CEO & Fondateur',
      avatar: '👨‍💼',
      bio: '15 ans d\'expérience en supply chain management.'
    },
    {
      name: 'Sophie Laurent',
      role: 'CTO',
      avatar: '👩‍💻',
      bio: 'Experte en architecture cloud et systèmes distribués.'
    },
    {
      name: 'Thomas Dubois',
      role: 'Head of Product',
      avatar: '👨‍🎨',
      bio: 'Passionné par l\'UX et la simplicité d\'utilisation.'
    },
    {
      name: 'Marie Chen',
      role: 'Head of Sales',
      avatar: '👩‍💼',
      bio: 'Spécialiste de la relation client B2B.'
    }
  ];
}
