import { Component, signal, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  social?: {
    linkedin?: string;
    twitter?: string;
  };
}

interface Milestone {
  year: string;
  title: string;
  description: string;
  icon: string;
}

interface Value {
  icon: string;
  title: string;
  description: string;
  color: string;
}

interface Partner {
  name: string;
  logo: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="about-page">
      <!-- Navigation -->
      <nav class="navbar" [class.scrolled]="isScrolled()">
        <div class="nav-container">
          <a routerLink="/" class="logo">
            <svg class="logo-icon" viewBox="0 0 32 32" width="36" height="36"><rect width="32" height="32" rx="8" fill="url(#logoGrad)"/><path d="M8 22 L16 10 L24 22" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="18" r="3" fill="#fff"/><defs><linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#001f3f"/><stop offset="100%" style="stop-color:#003366"/></linearGradient></defs></svg>
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
            <a routerLink="/register" class="btn btn-primary">
              <span>S'inscrire</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
          </div>

          <button class="mobile-menu-btn" (click)="toggleMobileMenu()">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
          </button>
        </div>

        @if (mobileMenuOpen()) {
          <div class="mobile-menu">
            <a routerLink="/" class="mobile-link" (click)="toggleMobileMenu()">Accueil</a>
            <a routerLink="/features" class="mobile-link" (click)="toggleMobileMenu()">Fonctionnalités</a>
            <a routerLink="/about" class="mobile-link" (click)="toggleMobileMenu()">À propos</a>
            <a routerLink="/contact" class="mobile-link" (click)="toggleMobileMenu()">Contact</a>
            <div class="mobile-actions">
              <a routerLink="/login" class="btn btn-outline btn-block" (click)="toggleMobileMenu()">Connexion</a>
              <a routerLink="/register" class="btn btn-primary btn-block" (click)="toggleMobileMenu()">S'inscrire</a>
            </div>
          </div>
        }
      </nav>

      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-bg">
          <div class="hero-particles">
            @for (i of [1,2,3,4,5,6,7,8,9,10]; track i) {
              <div class="particle" [style.--delay]="i * 0.5 + 's'" [style.--x]="(i * 10) + '%'"></div>
            }
          </div>
          <div class="hero-gradient"></div>
        </div>
        <div class="container">
          <div class="hero-content animate-fade-in-up">
            <span class="section-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
              À propos de nous
            </span>
            <h1 class="hero-title">
              Nous révolutionnons la
              <span class="gradient-text">logistique mondiale</span>
            </h1>
            <p class="hero-description">
              X-NexusGo est né d'une vision simple : rendre la gestion logistique accessible, 
              intelligente et sans frontières. Depuis 2020, nous accompagnons les entreprises 
              dans leur transformation digitale.
            </p>
            <div class="hero-stats">
              <div class="stat-item animate-count">
                <span class="stat-number" data-target="500">500+</span>
                <span class="stat-label">Entreprises partenaires</span>
              </div>
              <div class="stat-item animate-count">
                <span class="stat-number" data-target="45">45+</span>
                <span class="stat-label">Pays desservis</span>
              </div>
              <div class="stat-item animate-count">
                <span class="stat-number" data-target="2">2M+</span>
                <span class="stat-label">Commandes traitées</span>
              </div>
              <div class="stat-item animate-count">
                <span class="stat-number">99.9%</span>
                <span class="stat-label">Disponibilité</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CEO Section -->
      <section class="ceo-section">
        <div class="container">
          <div class="ceo-card animate-on-scroll">
            <div class="ceo-image-wrapper">
              <div class="ceo-image-bg"></div>
              <img src="/images/ceo.png" alt="Abderrahmane Ouabderzaq - CEO de X-NexusGo" class="ceo-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
              <div class="ceo-placeholder" style="display: none;">
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div class="ceo-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Fondateur & CEO
              </div>
            </div>
            <div class="ceo-content">
              <div class="ceo-header">
                <h2 class="ceo-name">FrJ</h2>
                <div class="ceo-title">CEO & Fondateur de X-NexusGo</div>
              </div>
              <blockquote class="ceo-quote">
                <svg class="quote-mark" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M11.192 15.757c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.1-1.956.76-3.022.66-1.065 1.515-1.867 2.558-2.403L9.373 5c-.8.396-1.56.898-2.26 1.505-.71.607-1.34 1.305-1.9 2.094s-.98 1.68-1.25 2.69-.346 2.04-.217 3.1c.168 1.4.62 2.52 1.356 3.35.735.84 1.652 1.26 2.748 1.26.965 0 1.766-.29 2.4-.878.628-.576.94-1.365.94-2.368l.002.003zm9.124 0c0-.88-.23-1.618-.69-2.217-.326-.42-.768-.695-1.327-.825-.55-.13-1.07-.14-1.54-.03-.16-.94.09-1.95.75-3.02.66-1.06 1.514-1.86 2.557-2.4L18.49 5c-.8.396-1.555.898-2.26 1.505-.708.607-1.34 1.305-1.894 2.094-.556.79-.97 1.68-1.24 2.69-.273 1-.345 2.04-.217 3.1.165 1.4.615 2.52 1.35 3.35.732.833 1.646 1.25 2.742 1.25.967 0 1.768-.29 2.402-.876.627-.576.942-1.365.942-2.368v.01z"/></svg>
                <p>
                  "Quand j'ai fondé X-NexusGo, j'avais une conviction profonde : la logistique ne devrait pas 
                  être un obstacle à la croissance des entreprises, mais un véritable levier de performance. 
                  Aujourd'hui, notre plateforme connecte des centaines d'entreprises à travers le monde, 
                  optimisant leurs chaînes d'approvisionnement avec une précision inégalée.
                </p>
                <p>
                  Notre mission va au-delà de la technologie. Nous construisons des ponts entre les marchés, 
                  nous simplifions la complexité et nous permettons à nos clients de se concentrer sur ce 
                  qu'ils font de mieux : développer leur business. Chaque jour, notre équipe travaille 
                  avec passion pour repousser les limites de l'innovation logistique."
                </p>
              </blockquote>
              <div class="ceo-signature">
                <div class="signature-line"></div>
                <span>FrJ, CEO de X-NexusGo</span>
              </div>
              <div class="ceo-social">
                <a href="https://www.linkedin.com/in/abderrahmane-ouabderzaq/" target="_blank" rel="noopener noreferrer" class="social-btn linkedin" title="LinkedIn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
                <a href="https://x.com/FrJ___" target="_blank" rel="noopener noreferrer" class="social-btn twitter" title="X (Twitter)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://ouabderzaq.vercel.app/" target="_blank" rel="noopener noreferrer" class="social-btn portfolio" title="FrJfolio">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Team Section -->
      <section class="team-section">
        <div class="container">
          <div class="section-header animate-on-scroll">
            <span class="section-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Notre équipe
            </span>
            <h2 class="section-title">Des experts passionnés</h2>
            <p class="section-description">
              Une équipe pluridisciplinaire unie par la même passion pour l'innovation logistique.
            </p>
          </div>

          <div class="team-grid team-grid-2">
            @for (member of teamMembers; track member.name; let i = $index) {
              <div class="team-card animate-on-scroll" [style.--delay]="(i * 0.1) + 's'">
                <div class="member-avatar">
                  <img [src]="member.image" [alt]="member.name" class="member-photo">
                </div>
                <h4 class="member-name">{{ member.name }}</h4>
                <span class="member-role">{{ member.role }}</span>
                <p class="member-bio">{{ member.bio }}</p>
                <div class="member-social">
                  @if (member.social?.linkedin) {
                    <a [href]="member.social!.linkedin" target="_blank" rel="noopener noreferrer" class="social-link" title="LinkedIn">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </a>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Mission & Vision -->
      <section class="mission-section">
        <div class="container">
          <div class="mission-grid">
            <div class="mission-card animate-on-scroll" style="--delay: 0s">
              <div class="mission-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4"/><path d="M12 16V8"/></svg>
              </div>
              <h3>Notre Mission</h3>
              <p>
                Démocratiser l'accès aux solutions logistiques de pointe et permettre à chaque 
                entreprise, quelle que soit sa taille, de rivaliser avec les géants de l'industrie.
              </p>
            </div>
            <div class="mission-card animate-on-scroll" style="--delay: 0.1s">
              <div class="mission-icon vision">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
              <h3>Notre Vision</h3>
              <p>
                Devenir la référence mondiale de la gestion logistique intelligente, en créant 
                un écosystème connecté où chaque maillon de la supply chain communique en temps réel.
              </p>
            </div>
            <div class="mission-card animate-on-scroll" style="--delay: 0.2s">
              <div class="mission-icon values">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              </div>
              <h3>Nos Valeurs</h3>
              <p>
                Innovation continue, excellence opérationnelle, intégrité absolue et engagement 
                envers la réussite de nos clients guident chacune de nos décisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Values Section -->
      <section class="values-section">
        <div class="container">
          <div class="section-header animate-on-scroll">
            <span class="section-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Ce qui nous définit
            </span>
            <h2 class="section-title">Nos valeurs fondamentales</h2>
            <p class="section-description">
              Ces principes guident chaque décision que nous prenons et chaque produit que nous créons.
            </p>
          </div>

          <div class="values-grid">
            @for (value of values; track value.title; let i = $index) {
              <div class="value-card animate-on-scroll" [style.--delay]="(i * 0.1) + 's'" [style.--accent]="value.color">
                <div class="value-icon">{{ value.icon }}</div>
                <h3 class="value-title">{{ value.title }}</h3>
                <p class="value-description">{{ value.description }}</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Timeline Section -->
      <section class="timeline-section">
        <div class="container">
          <div class="section-header animate-on-scroll">
            <span class="section-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Notre parcours
            </span>
            <h2 class="section-title">Les étapes clés de notre histoire</h2>
          </div>

          <div class="timeline">
            @for (milestone of milestones; track milestone.year; let i = $index) {
              <div class="timeline-item animate-on-scroll" [class.right]="i % 2 !== 0" [style.--delay]="(i * 0.15) + 's'">
                <div class="timeline-content">
                  <div class="timeline-icon">{{ milestone.icon }}</div>
                  <div class="timeline-year">{{ milestone.year }}</div>
                  <h3 class="timeline-title">{{ milestone.title }}</h3>
                  <p class="timeline-description">{{ milestone.description }}</p>
                </div>
                <div class="timeline-dot"></div>
              </div>
            }
            <div class="timeline-line"></div>
          </div>
        </div>
      </section>

      <!-- Partners Section -->
      <section class="partners-section">
        <div class="container">
          <div class="section-header animate-on-scroll">
            <span class="section-badge">Nos partenaires</span>
            <h2 class="section-title">Ils nous font confiance</h2>
          </div>

          <div class="partners-marquee">
            <div class="partners-track">
              @for (partner of partners; track partner.name) {
                <div class="partner-logo">{{ partner.logo }}</div>
              }
              @for (partner of partners; track partner.name + '2') {
                <div class="partner-logo">{{ partner.logo }}</div>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="cta-bg">
          <div class="cta-shape shape-1"></div>
          <div class="cta-shape shape-2"></div>
          <div class="cta-shape shape-3"></div>
        </div>
        <div class="container">
          <div class="cta-content animate-on-scroll">
            <h2 class="cta-title">Prêt à rejoindre l'aventure ?</h2>
            <p class="cta-description">
              Découvrez comment X-NexusGo peut transformer votre logistique et propulser votre croissance.
            </p>
            <div class="cta-actions">
              <a routerLink="/register" class="btn btn-white btn-lg">
                <span>Créer un compte gratuit</span>
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
          <div class="footer-grid">
            <div class="footer-brand">
              <a routerLink="/" class="logo">
                <svg class="logo-icon" viewBox="0 0 32 32" width="32" height="32"><rect width="32" height="32" rx="6" fill="#001f3f"/><path d="M8 22 L16 10 L24 22" stroke="#ff6600" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="18" r="3" fill="#ff6600"/></svg>
                <span class="logo-text">X-NexusGo</span>
              </a>
              <p class="footer-description">
                La plateforme logistique de nouvelle génération qui connecte 
                votre supply chain mondiale avec précision et performance.
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
                <li><a href="#">API</a></li>
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
                <li><a href="#">Guides</a></li>
                <li><a href="#">FAQ</a></li>
                <li><a href="#">Statut</a></li>
              </ul>
            </div>
          </div>

          <div class="footer-bottom">
            <p>&copy; {{ currentYear }} X-NexusGo Ltd. Tous droits réservés.</p>
            <div class="footer-legal">
              <a href="#">Confidentialité</a>
              <a href="#">Conditions</a>
              <a href="#">Cookies</a>
            </div>
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
      --secondary-light: #ff8533;
      --secondary-dark: #cc5200;
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
      --gradient-orange: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-dark) 100%);
      --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
      --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
      --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
      --radius: 0.5rem;
      --radius-lg: 1rem;
      --radius-xl: 1.5rem;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    .about-page {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: var(--gray-800);
      line-height: 1.6;
      overflow-x: hidden;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    /* Animations */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeInLeft {
      from { opacity: 0; transform: translateX(-30px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes fadeInRight {
      from { opacity: 0; transform: translateX(30px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    @keyframes particleFloat {
      0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.5; }
      50% { transform: translateY(-100px) rotate(180deg); opacity: 1; }
    }

    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }

    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    .animate-fade-in-up {
      animation: fadeInUp 0.8s ease-out forwards;
    }

    .animate-on-scroll {
      opacity: 0;
      transform: translateY(30px);
      animation: fadeInUp 0.6s ease-out forwards;
      animation-delay: var(--delay, 0s);
      animation-play-state: paused;
    }

    .animate-on-scroll.visible {
      animation-play-state: running;
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
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      text-decoration: none;
      border: 2px solid transparent;
    }

    .btn-primary {
      background: var(--gradient);
      color: var(--white);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(0, 31, 63, 0.3);
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

    .btn-block { width: 100%; }

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
      backdrop-filter: blur(20px);
      border-bottom: 1px solid transparent;
      transition: all 0.3s;
    }

    .navbar.scrolled {
      border-bottom-color: var(--gray-200);
      box-shadow: var(--shadow-md);
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
      gap: 0.75rem;
      text-decoration: none;
    }

    .logo-icon {
      transition: transform 0.3s;
    }

    .logo:hover .logo-icon {
      transform: rotate(-5deg) scale(1.05);
    }

    .logo-text {
      font-size: 1.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .nav-links {
      display: flex;
      gap: 2.5rem;
    }

    .nav-link {
      text-decoration: none;
      color: var(--gray-600);
      font-weight: 500;
      transition: all 0.3s;
      position: relative;
      padding: 0.5rem 0;
    }

    .nav-link::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background: var(--gradient);
      transition: width 0.3s;
    }

    .nav-link:hover, .nav-link.active {
      color: var(--primary);
    }

    .nav-link:hover::after, .nav-link.active::after {
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
      background: var(--white);
    }

    .mobile-link {
      display: block;
      padding: 0.875rem 0;
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
      .nav-links, .nav-actions { display: none; }
      .mobile-menu-btn { display: block; }
      .mobile-menu { display: block; }
    }

    /* Hero Section */
    .hero {
      position: relative;
      padding: 10rem 1.5rem 6rem;
      min-height: 90vh;
      display: flex;
      align-items: center;
      overflow: hidden;
    }

    .hero-bg {
      position: absolute;
      inset: 0;
      z-index: -1;
    }

    .hero-gradient {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, var(--gray-50) 0%, var(--white) 50%, rgba(255, 102, 0, 0.05) 100%);
    }

    .hero-particles {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }

    .particle {
      position: absolute;
      width: 10px;
      height: 10px;
      background: var(--secondary);
      border-radius: 50%;
      opacity: 0.3;
      left: var(--x);
      bottom: -20px;
      animation: particleFloat 15s ease-in-out infinite;
      animation-delay: var(--delay);
    }

    .hero-content {
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
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
      margin-bottom: 1.5rem;
      border: 1px solid rgba(0, 31, 63, 0.1);
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
      margin-bottom: 3rem;
      max-width: 650px;
      margin-left: auto;
      margin-right: auto;
    }

    .hero-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2rem;
      padding: 2.5rem;
      background: var(--white);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
      border: 1px solid var(--gray-100);
    }

    .stat-item {
      text-align: center;
    }

    .stat-number {
      display: block;
      font-size: 2.5rem;
      font-weight: 800;
      background: var(--gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--gray-500);
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .hero { padding: 7rem 1rem 4rem; min-height: auto; }
      .hero-title { font-size: 2.25rem; }
      .hero-stats { grid-template-columns: repeat(2, 1fr); gap: 1.5rem; padding: 1.5rem; }
      .stat-number { font-size: 1.75rem; }
    }

    /* CEO Section */
    .ceo-section {
      padding: 6rem 0;
      background: linear-gradient(180deg, var(--white) 0%, var(--gray-50) 100%);
    }

    .ceo-card {
      display: grid;
      grid-template-columns: 400px 1fr;
      gap: 4rem;
      background: var(--white);
      border-radius: var(--radius-xl);
      padding: 3rem;
      box-shadow: var(--shadow-2xl);
      border: 1px solid var(--gray-100);
      position: relative;
      overflow: hidden;
    }

    .ceo-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--gradient);
    }

    .ceo-image-wrapper {
      position: relative;
    }

    .ceo-image-bg {
      position: absolute;
      top: 20px;
      left: 20px;
      right: -20px;
      bottom: -20px;
      background: var(--gradient);
      border-radius: var(--radius-xl);
      opacity: 0.1;
    }

    .ceo-image {
      width: 100%;
      height: 450px;
      object-fit: cover;
      border-radius: var(--radius-xl);
      position: relative;
      z-index: 1;
      box-shadow: var(--shadow-xl);
    }

    .ceo-placeholder {
      width: 100%;
      height: 450px;
      background: linear-gradient(135deg, var(--gray-100) 0%, var(--gray-200) 100%);
      border-radius: var(--radius-xl);
      display: none;
      align-items: center;
      justify-content: center;
      color: var(--gray-400);
      position: relative;
      z-index: 1;
    }

    .ceo-badge {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--gradient);
      color: var(--white);
      padding: 0.75rem 1.5rem;
      border-radius: 50px;
      font-weight: 600;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      z-index: 2;
      box-shadow: var(--shadow-lg);
    }

    .ceo-content {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .ceo-header {
      margin-bottom: 2rem;
    }

    .ceo-name {
      font-size: 2rem;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: 0.5rem;
    }

    .ceo-title {
      color: var(--secondary);
      font-weight: 600;
    }

    .ceo-quote {
      position: relative;
      margin-bottom: 2rem;
    }

    .quote-mark {
      position: absolute;
      top: -20px;
      left: -10px;
      color: var(--secondary);
      opacity: 0.2;
    }

    .ceo-quote p {
      font-size: 1.1rem;
      line-height: 1.8;
      color: var(--gray-700);
      margin-bottom: 1rem;
      position: relative;
      z-index: 1;
    }

    .ceo-signature {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .signature-line {
      width: 60px;
      height: 2px;
      background: var(--gradient);
    }

    .ceo-signature span {
      font-weight: 600;
      color: var(--gray-600);
    }

    .ceo-social {
      display: flex;
      gap: 0.75rem;
    }

    .social-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--white);
      transition: all 0.3s;
    }

    .social-btn.linkedin { background: #0077b5; }
    .social-btn.twitter { background: #000000; }
    .social-btn.portfolio { background: linear-gradient(135deg, var(--primary), var(--secondary)); }

    .social-btn:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-lg);
    }

    @media (max-width: 1024px) {
      .ceo-card {
        grid-template-columns: 1fr;
        gap: 2rem;
        padding: 2rem;
      }
      .ceo-image, .ceo-placeholder { height: 350px; }
    }

    /* Mission Section */
    .mission-section {
      padding: 6rem 0;
      background: var(--gray-50);
    }

    .mission-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
    }

    .mission-card {
      background: var(--white);
      padding: 2.5rem;
      border-radius: var(--radius-xl);
      text-align: center;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--gray-100);
      transition: all 0.3s;
    }

    .mission-card:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-xl);
    }

    .mission-icon {
      width: 70px;
      height: 70px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      color: var(--white);
    }

    .mission-icon.vision {
      background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-dark) 100%);
    }

    .mission-icon.values {
      background: linear-gradient(135deg, var(--success) 0%, #059669 100%);
    }

    .mission-card h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: 1rem;
    }

    .mission-card p {
      color: var(--gray-600);
      line-height: 1.7;
    }

    @media (max-width: 768px) {
      .mission-grid { grid-template-columns: 1fr; }
    }

    /* Values Section */
    .values-section {
      padding: 6rem 0;
      background: var(--white);
    }

    .section-header {
      text-align: center;
      max-width: 600px;
      margin: 0 auto 4rem;
    }

    .section-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: 1rem;
    }

    .section-description {
      font-size: 1.1rem;
      color: var(--gray-600);
    }

    .values-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }

    .value-card {
      background: var(--gray-50);
      padding: 2rem;
      border-radius: var(--radius-lg);
      text-align: center;
      border: 2px solid transparent;
      transition: all 0.3s;
      position: relative;
      overflow: hidden;
    }

    .value-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--accent, var(--secondary));
      transform: scaleX(0);
      transition: transform 0.3s;
    }

    .value-card:hover {
      background: var(--white);
      border-color: var(--gray-200);
      transform: translateY(-5px);
      box-shadow: var(--shadow-lg);
    }

    .value-card:hover::before {
      transform: scaleX(1);
    }

    .value-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .value-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: 0.75rem;
    }

    .value-description {
      font-size: 0.9rem;
      color: var(--gray-600);
      line-height: 1.6;
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
      background: var(--gray-50);
    }

    .timeline {
      position: relative;
      max-width: 1000px;
      margin: 0 auto;
    }

    .timeline-line {
      position: absolute;
      left: 50%;
      top: 0;
      bottom: 0;
      width: 4px;
      background: linear-gradient(180deg, var(--primary) 0%, var(--secondary) 100%);
      transform: translateX(-50%);
      border-radius: 2px;
    }

    .timeline-item {
      display: flex;
      justify-content: flex-end;
      padding-right: calc(50% + 40px);
      margin-bottom: 3rem;
      position: relative;
    }

    .timeline-item.right {
      justify-content: flex-start;
      padding-right: 0;
      padding-left: calc(50% + 40px);
    }

    .timeline-content {
      background: var(--white);
      padding: 2rem;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      max-width: 400px;
      position: relative;
      border: 1px solid var(--gray-100);
      transition: all 0.3s;
    }

    .timeline-content:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-xl);
    }

    .timeline-dot {
      position: absolute;
      left: 50%;
      top: 2rem;
      width: 20px;
      height: 20px;
      background: var(--secondary);
      border: 4px solid var(--white);
      border-radius: 50%;
      transform: translateX(-50%);
      box-shadow: var(--shadow-md);
      z-index: 1;
    }

    .timeline-icon {
      font-size: 2rem;
      margin-bottom: 0.75rem;
    }

    .timeline-year {
      display: inline-block;
      background: var(--gradient);
      color: var(--white);
      padding: 0.25rem 0.75rem;
      border-radius: 50px;
      font-size: 0.8rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
    }

    .timeline-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: 0.5rem;
    }

    .timeline-description {
      color: var(--gray-600);
      font-size: 0.95rem;
    }

    @media (max-width: 768px) {
      .timeline-line { left: 20px; }
      .timeline-item,
      .timeline-item.right {
        padding-left: 60px;
        padding-right: 0;
        justify-content: flex-start;
      }
      .timeline-dot {
        left: 20px;
      }
    }

    /* Team Section */
    .team-section {
      padding: 6rem 0;
      background: var(--white);
    }

    .team-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2rem;
    }

    .team-card {
      background: var(--gray-50);
      padding: 2rem;
      border-radius: var(--radius-lg);
      text-align: center;
      transition: all 0.3s;
      border: 1px solid transparent;
    }

    .team-card:hover {
      background: var(--white);
      border-color: var(--gray-200);
      transform: translateY(-5px);
      box-shadow: var(--shadow-lg);
    }

    .team-grid-2 {
      grid-template-columns: repeat(2, 1fr);
      max-width: 800px;
      margin: 0 auto;
    }

    .member-avatar {
      width: 120px;
      height: 120px;
      background: var(--gradient);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      font-size: 2.5rem;
      box-shadow: var(--shadow-lg);
      overflow: hidden;
    }

    .member-photo {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .member-name {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: 0.25rem;
    }

    .member-role {
      display: block;
      color: var(--secondary);
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .member-bio {
      font-size: 0.9rem;
      color: var(--gray-600);
      margin-bottom: 1rem;
      line-height: 1.6;
    }

    .member-social {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
    }

    .social-link {
      width: 36px;
      height: 36px;
      background: var(--gray-200);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--gray-600);
      transition: all 0.3s;
    }

    .social-link:hover {
      background: var(--primary);
      color: var(--white);
    }

    @media (max-width: 1024px) {
      .team-grid { grid-template-columns: repeat(2, 1fr); }
      .team-grid-2 { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 640px) {
      .team-grid { grid-template-columns: 1fr; }
      .team-grid-2 { grid-template-columns: 1fr; max-width: 400px; }
    }

    /* Partners Section */
    .partners-section {
      padding: 4rem 0;
      background: var(--gray-50);
      overflow: hidden;
    }

    .partners-marquee {
      overflow: hidden;
      margin-top: 2rem;
    }

    .partners-track {
      display: flex;
      gap: 3rem;
      animation: marquee 30s linear infinite;
    }

    .partner-logo {
      font-size: 3rem;
      opacity: 0.7;
      transition: all 0.3s;
      flex-shrink: 0;
    }

    .partner-logo:hover {
      opacity: 1;
      transform: scale(1.1);
    }

    /* CTA Section */
    .cta-section {
      position: relative;
      padding: 6rem 1.5rem;
      background: var(--gradient);
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

    .cta-shape.shape-1 { width: 400px; height: 400px; top: -200px; right: -100px; }
    .cta-shape.shape-2 { width: 300px; height: 300px; bottom: -150px; left: -50px; }
    .cta-shape.shape-3 { width: 200px; height: 200px; top: 50%; left: 50%; }

    .cta-content {
      position: relative;
      text-align: center;
      max-width: 600px;
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

    /* Footer */
    .footer {
      background: var(--gray-900);
      padding: 4rem 1.5rem 2rem;
      color: var(--gray-400);
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 2fr repeat(3, 1fr);
      gap: 3rem;
      margin-bottom: 3rem;
    }

    .footer-brand .logo { margin-bottom: 1rem; }
    .footer-brand .logo .logo-text { color: var(--white); }

    .footer-description {
      font-size: 0.9rem;
      line-height: 1.7;
      margin-bottom: 1.5rem;
    }

    .social-links {
      display: flex;
      gap: 0.75rem;
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
      transition: all 0.3s;
    }

    .social-link:hover {
      background: var(--secondary);
      color: var(--white);
      transform: translateY(-3px);
    }

    .footer-links h4 {
      color: var(--white);
      font-size: 0.95rem;
      font-weight: 600;
      margin-bottom: 1.25rem;
    }

    .footer-links ul { list-style: none; }
    .footer-links li { margin-bottom: 0.75rem; }

    .footer-links a {
      color: var(--gray-400);
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.2s;
    }

    .footer-links a:hover { color: var(--white); }

    .footer-bottom {
      border-top: 1px solid var(--gray-800);
      padding-top: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.875rem;
    }

    .footer-legal {
      display: flex;
      gap: 2rem;
    }

    .footer-legal a {
      color: var(--gray-400);
      text-decoration: none;
      transition: color 0.2s;
    }

    .footer-legal a:hover { color: var(--white); }

    @media (max-width: 1024px) {
      .footer-grid { grid-template-columns: repeat(2, 1fr); }
      .footer-brand { grid-column: span 2; }
    }

    @media (max-width: 640px) {
      .footer-grid { grid-template-columns: 1fr; }
      .footer-brand { grid-column: span 1; }
      .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
      .footer-legal { flex-wrap: wrap; justify-content: center; gap: 1rem; }
    }
  `]
})
export class AboutComponent implements OnInit, AfterViewInit {
  mobileMenuOpen = signal(false);
  isScrolled = signal(false);
  currentYear = new Date().getFullYear();

  values: Value[] = [
    { icon: '🚀', title: 'Innovation', description: 'Nous repoussons constamment les limites de la technologie logistique.', color: '#ff6600' },
    { icon: '🎯', title: 'Excellence', description: 'La qualité et la précision sont au cœur de tout ce que nous faisons.', color: '#001f3f' },
    { icon: '🤝', title: 'Partenariat', description: 'Nous grandissons avec nos clients, leur succès est notre succès.', color: '#10b981' },
    { icon: '🌍', title: 'Impact', description: 'Nous construisons des solutions durables pour un avenir meilleur.', color: '#8b5cf6' }
  ];

  milestones: Milestone[] = [
    { year: '2020', title: 'Création de X-NexusGo', description: 'Lancement de la plateforme avec une vision claire : révolutionner la logistique.', icon: '🎉' },
    { year: '2021', title: 'Première levée de fonds', description: 'Série A de 5M€ pour accélérer le développement produit.', icon: '💰' },
    { year: '2022', title: 'Expansion européenne', description: 'Ouverture de bureaux à Londres, Berlin et Amsterdam.', icon: '🌍' },
    { year: '2023', title: '500 entreprises clientes', description: 'Franchissement du cap symbolique des 500 clients actifs.', icon: '📈' },
    { year: '2024', title: 'Lancement API v3', description: 'Nouvelle génération d\'API avec intégrations avancées.', icon: '⚡' },
    { year: '2026', title: 'Intelligence artificielle', description: 'Intégration de l\'IA pour des prédictions de stock optimisées.', icon: '🤖' }
  ];

  teamMembers: TeamMember[] = [
    { name: 'Yahya Afadisse', role: 'CTO', bio: 'Expert en architecture logicielle et technologies cloud. Passionné par l\'innovation et les systèmes distribués.', image: '/images/cto.jpeg', social: { linkedin: 'https://www.linkedin.com/in/yahya-afadisse-236b022a9/' } },
    { name: 'Zakariae Elmoufid', role: 'COO', bio: 'Spécialiste en opérations et optimisation de la supply chain. Expert en stratégie et croissance.', image: '/images/coo.png', social: { linkedin: 'https://www.linkedin.com/in/zakariae-elmoufid-1b22a8330/' } }
  ];

  partners: Partner[] = [
    { name: 'DHL', logo: '📦' },
    { name: 'FedEx', logo: '🚚' },
    { name: 'Amazon', logo: '🛒' },
    { name: 'Shopify', logo: '🛍️' },
    { name: 'SAP', logo: '💼' },
    { name: 'Oracle', logo: '☁️' },
    { name: 'Salesforce', logo: '💻' },
    { name: 'Microsoft', logo: '🪟' }
  ];

  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.isScrolled.set(window.scrollY > 50);
      });
    }
  }

  ngAfterViewInit() {
    this.initScrollAnimations();
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
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
