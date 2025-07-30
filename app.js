// Optimized for 60fps performance with requestAnimationFrame

(() => {
  'use strict';

  /*********************
   * Utility Functions *
   *********************/
  
  // Throttle function for performance optimization
  const throttle = (fn, wait = 100) => {
    let inThrottle, lastFn, lastTime;
    return function () {
      const context = this, args = arguments;
      if (!inThrottle) {
        fn.apply(context, args);
        lastTime = Date.now();
        inThrottle = true;
      } else {
        clearTimeout(lastFn);
        lastFn = setTimeout(function () {
          if (Date.now() - lastTime >= wait) {
            fn.apply(context, args);
            lastTime = Date.now();
          }
        }, Math.max(wait - (Date.now() - lastTime), 0));
      }
    };
  };

  // Clamp utility
  const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

  // Smooth scroll to element
  function smoothScrollTo(element) {
    const targetPosition = element.offsetTop - 80;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 1000;
    let start = null;

    function animation(currentTime) {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const run = ease(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function ease(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t + b;
      t--;
      return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
  }

  /*********************
   * Background Particle System *
   *********************/
  
  class ParticleSystem {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.particles = [];
      this.particleCount = 50;
      this.mouse = { x: 0, y: 0 };
      this.animationId = null;
      
      this.init();
      this.setupEventListeners();
      this.animate();
    }

    init() {
      this.resize();
      this.createParticles();
    }

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    createParticles() {
      this.particles = [];
      for (let i = 0; i < this.particleCount; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          size: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.5 + 0.2,
          color: this.getRandomColor()
        });
      }
    }

    getRandomColor() {
      const colors = [
        'rgba(79, 140, 255, 0.4)',   // Primary blue
        'rgba(112, 193, 179, 0.4)',  // Secondary mint
        'rgba(255, 169, 135, 0.4)',  // Accent peach
        'rgba(79, 140, 255, 0.2)',   // Light blue
        'rgba(112, 193, 179, 0.2)'   // Light mint
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    setupEventListeners() {
      window.addEventListener('resize', () => this.resize());
      
      window.addEventListener('mousemove', (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
      });
    }

    updateParticles() {
      this.particles.forEach(particle => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Mouse interaction - gentle attraction
        const dx = this.mouse.x - particle.x;
        const dy = this.mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          const force = (100 - distance) / 10000;
          particle.x += dx * force;
          particle.y += dy * force;
        }

        // Boundary check with smooth wrapping
        if (particle.x < 0) particle.x = this.canvas.width;
        if (particle.x > this.canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = this.canvas.height;
        if (particle.y > this.canvas.height) particle.y = 0;

        // Gentle opacity oscillation
        particle.opacity += (Math.random() - 0.5) * 0.02;
        particle.opacity = clamp(particle.opacity, 0.1, 0.6);
      });
    }

    drawParticles() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.particles.forEach(particle => {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fillStyle = particle.color.replace(/[\d\.]+\)$/g, `${particle.opacity})`);
        this.ctx.fill();
        
        // Add subtle glow effect
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = particle.color;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      });

      // Draw connecting lines between nearby particles
      this.drawConnections();
    }

    drawConnections() {
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const dx = this.particles[i].x - this.particles[j].x;
          const dy = this.particles[i].y - this.particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
            this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
            this.ctx.strokeStyle = `rgba(79, 140, 255, ${0.1 * (1 - distance / 120)})`;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
          }
        }
      }
    }

    animate() {
      this.updateParticles();
      this.drawParticles();
      this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
    }
  }

  /*********************
   * Typing Animation  *
   *********************/
  
  class TypingAnimation {
    constructor(element, phrases) {
      this.element = element;
      this.phrases = phrases;
      this.phraseIndex = 0;
      this.charIndex = 0;
      this.isDeleting = false;
      this.isActive = true;
      
      this.start();
    }

    start() {
      setTimeout(() => this.typeLoop(), 1200);
    }

    typeLoop() {
      if (!this.isActive) return;
      
      const currentPhrase = this.phrases[this.phraseIndex];

      if (!this.isDeleting) {
        // Typing forward
        this.element.textContent = currentPhrase.substring(0, this.charIndex + 1);
        this.charIndex++;

        if (this.charIndex === currentPhrase.length) {
          this.isDeleting = true;
          setTimeout(() => this.typeLoop(), 2000); // Pause at full phrase
          return;
        }
      } else {
        // Deleting
        this.element.textContent = currentPhrase.substring(0, this.charIndex - 1);
        this.charIndex--;

        if (this.charIndex === 0) {
          this.isDeleting = false;
          this.phraseIndex = (this.phraseIndex + 1) % this.phrases.length;
        }
      }

      const typingSpeed = this.isDeleting ? 50 : 100;
      setTimeout(() => this.typeLoop(), typingSpeed);
    }

    destroy() {
      this.isActive = false;
    }
  }

  /*********************
   * Navigation System *
   *********************/
  
  class Navigation {
    constructor() {
      this.nav = document.querySelector('.nav');
      this.navToggle = document.querySelector('.nav__toggle');
      this.navLinks = document.querySelector('.nav__links');
      this.sections = document.querySelectorAll('section');
      this.navLinkEls = document.querySelectorAll('.nav__link');
      
      this.init();
    }

    init() {
      this.setupToggle();
      this.setupSmoothScroll();
      this.setupScrollSpy();
      this.setupScrollEffects();
      this.fixExternalLinks();
    }

    setupToggle() {
      if (this.navToggle) {
        this.navToggle.addEventListener('click', () => {
          this.nav.classList.toggle('nav--open');
          this.navToggle.classList.toggle('nav__toggle--active');
        });
      }

      // Close mobile menu when a link is clicked
      if (this.navLinks) {
        this.navLinks.addEventListener('click', (e) => {
          if (e.target.matches('.nav__link')) {
            this.nav.classList.remove('nav--open');
            if (this.navToggle) {
              this.navToggle.classList.remove('nav__toggle--active');
            }
          }
        });
      }
    }

    setupSmoothScroll() {
      // Handle all internal anchor links
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (link) {
          e.preventDefault();
          const targetId = link.getAttribute('href').substring(1);
          const targetElement = document.getElementById(targetId);
          
          if (targetElement) {
            smoothScrollTo(targetElement);
            
            // Close mobile menu if open
            this.nav.classList.remove('nav--open');
            if (this.navToggle) {
              this.navToggle.classList.remove('nav__toggle--active');
            }
          }
        }
      });

      // Specific handling for scroll indicator
      const scrollIndicator = document.querySelector('.scroll-indicator');
      if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
          const aboutSection = document.getElementById('about');
          if (aboutSection) {
            smoothScrollTo(aboutSection);
          }
        });
      }
    }

    setupScrollSpy() {
      const sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.navLinkEls.forEach((link) => link.classList.remove('active'));
              const id = entry.target.getAttribute('id');
              const activeLink = document.querySelector(`.nav__link[href="#${id}"]`);
              if (activeLink) activeLink.classList.add('active');
            }
          });
        },
        { 
          threshold: 0.3,
          rootMargin: '-80px 0px -80px 0px'
        }
      );

      this.sections.forEach((sec) => sectionObserver.observe(sec));
    }

    setupScrollEffects() {
      // Navigation background opacity based on scroll
      const handleNavScroll = throttle(() => {
        const scrollY = window.scrollY;
        const opacity = Math.min(scrollY / 100, 1);
      }, 16);

      window.addEventListener('scroll', handleNavScroll);
    }

    fixExternalLinks() {
      // Ensure all external links work properly
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && !link.getAttribute('href').startsWith('#')) {
          // For external links, ensure they open in new tab
          if (!link.hasAttribute('target')) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
          }
        }
      });

      // Fix specific external links that might not be working
      const externalLinks = document.querySelectorAll('a[href^="http"], a[href^="mailto:"]');
      externalLinks.forEach(link => {
        if (!link.hasAttribute('target') && !link.getAttribute('href').startsWith('mailto:')) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
      });
    }
  }

  /*********************
   * Scroll Reveal System *
   *********************/
  
  class ScrollReveal {
    constructor() {
      this.elements = document.querySelectorAll([
        '.section-header',
        '.about__text',
        '.stat-card',
        '.certification-card',
        '.timeline-item',
        '.skill-category',
        '.specialty-card',
        '.project-card',
        '.achievement-category',
        '.contact-card',
        '.social-section',
        '.contact__actions'
      ].join(', '));

      this.init();
    }

    init() {
      const observerOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            
            // Special handling for counter animations
            if (entry.target.classList.contains('stat-card')) {
              const numberEl = entry.target.querySelector('.stat-number');
              if (numberEl && !numberEl.dataset.counted) {
                numberEl.dataset.counted = 'true';
                this.startCounter(numberEl);
              }
            }
            
            revealObserver.unobserve(entry.target);
          }
        });
      }, observerOptions);

      this.elements.forEach((el) => revealObserver.observe(el));
    }

    startCounter(numberEl) {
      const target = parseInt(numberEl.dataset.target, 10);
      let current = 0;
      const duration = 2000;
      const stepTime = Math.abs(Math.floor(duration / target));
      
      const updateCounter = () => {
        current += 1;
        numberEl.textContent = `${current}+`;
        if (current < target) {
          setTimeout(updateCounter, stepTime);
        }
      };

      setTimeout(updateCounter, 100);
    }
  }

  /*********************
   * Copy to Clipboard *
   *********************/
  
  class ClipboardManager {
    constructor() {
      this.copyButtons = document.querySelectorAll('.copy-btn');
      this.init();
    }

    init() {
      this.copyButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const value = btn.dataset.copy || btn.previousElementSibling?.dataset?.copy || 
                       btn.closest('.contact-card')?.querySelector('.contact-value')?.dataset?.copy;
          
          if (value) {
            this.copyToClipboard(value, btn);
          }
        });
      });
    }

    async copyToClipboard(text, button) {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          this.fallbackCopy(text);
        }
        
        this.showSuccess(button);
      } catch (err) {
        console.error('Failed to copy text: ', err);
        this.fallbackCopy(text);
        this.showSuccess(button);
      }
    }

    fallbackCopy(text) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    showSuccess(button) {
      const originalText = button.querySelector('span')?.textContent || button.textContent;
      const span = button.querySelector('span');
      
      if (span) {
        span.textContent = 'Copied!';
      } else {
        button.textContent = 'Copied!';
      }
      
      button.style.background = 'var(--secondary-mint)';
      button.style.transform = 'translateY(-2px)';
      
      setTimeout(() => {
        if (span) {
          span.textContent = originalText;
        } else {
          button.textContent = originalText;
        }
        button.style.background = '';
        button.style.transform = '';
      }, 2000);
    }
  }

  /*********************
   * Enhanced Interactions *
   *********************/
  
  class InteractionEnhancer {
    constructor() {
      this.init();
    }

    init() {
      this.setupButtonEffects();
      this.setupCardEffects();
      this.setupSkillTagEffects();
      this.setupSocialLinkEffects();
    }

    setupButtonEffects() {
      const buttons = document.querySelectorAll('.btn, .action-btn');
      
      buttons.forEach(btn => {
        // Ripple effect on click
        btn.addEventListener('click', (e) => {
          const ripple = document.createElement('span');
          const rect = btn.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          const x = e.clientX - rect.left - size / 2;
          const y = e.clientY - rect.top - size / 2;
          
          ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.4);
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
          `;
          
          btn.style.position = 'relative';
          btn.style.overflow = 'hidden';
          btn.appendChild(ripple);
          
          setTimeout(() => ripple.remove(), 600);
        });
      });
    }

    setupCardEffects() {
      const cards = document.querySelectorAll('.project-card, .achievement-card, .contact-card');
      
      cards.forEach(card => {
        card.addEventListener('mouseenter', (e) => {
          if (window.innerWidth > 768) { // Only on desktop
            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            
            const rotateX = (mouseY - centerY) / 20;
            const rotateY = (centerX - mouseX) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
          }
        });
        
        card.addEventListener('mouseleave', () => {
          card.style.transform = '';
        });

        card.addEventListener('mousemove', (e) => {
          if (window.innerWidth > 768) {
            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            
            const rotateX = (mouseY - centerY) / 30;
            const rotateY = (centerX - mouseX) / 30;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
          }
        });
      });
    }

    setupSkillTagEffects() {
      const skillTags = document.querySelectorAll('.skill-tag');
      
      skillTags.forEach(tag => {
        tag.addEventListener('mouseenter', () => {
          // Add subtle color animation
          tag.style.background = 'linear-gradient(135deg, var(--primary-blue), var(--secondary-mint))';
          tag.style.color = 'white';
          tag.style.transform = 'translateY(-4px) scale(1.05)';
        });
        
        tag.addEventListener('mouseleave', () => {
          tag.style.background = '';
          tag.style.color = '';
          tag.style.transform = '';
        });
      });
    }

    setupSocialLinkEffects() {
      const socialLinks = document.querySelectorAll('.social-link');
      
      socialLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
          // Platform-specific hover colors are handled in CSS
          link.style.transform = 'translateY(-6px) scale(1.02)';
        });
        
        link.addEventListener('mouseleave', () => {
          link.style.transform = '';
        });
      });
    }
  }

  /*********************
   * Performance Monitor *
   *********************/
  
  class PerformanceMonitor {
    constructor() {
      this.frameCount = 0;
      this.lastTime = performance.now();
      this.fps = 60;
      
      this.init();
    }

    init() {
      this.startFPSMonitor();
      this.optimizeForDevice();
      // this.handleVisibilityChange(); // Pause and resume animation
    }

    startFPSMonitor() {
      const measureFPS = (currentTime) => {
        this.frameCount++;
        
        if (currentTime - this.lastTime >= 1000) {
          this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
          this.frameCount = 0;
          this.lastTime = currentTime;
          
          // Reduce animation quality if FPS drops below 30
          // if (this.fps < 30) {
          //   this.reduceAnimations();
          // }
        }
        
        requestAnimationFrame(measureFPS);
      };
      
      requestAnimationFrame(measureFPS);
    }

    optimizeForDevice() {
      // Reduce animations on low-end devices
      if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        document.documentElement.style.setProperty('--transition-normal', '150ms');
        document.documentElement.style.setProperty('--transition-fast', '100ms');
      }

      // Reduce animations on mobile devices
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        document.documentElement.style.setProperty('--transition-normal', '200ms');
      }
    }

    // reduceAnimations() {
    //   // Disable some animations if performance is poor
    //   const complexAnimations = document.querySelectorAll('.floating-shapes, .bg-animation');
    //   complexAnimations.forEach(el => {
    //     el.style.display = 'none';
    //   });
    // }

    // handleVisibilityChange() {
    //   // Pause animations when tab is not visible and resume animations when tab becomes visible
    //   document.addEventListener('visibilitychange', () => {
    //     if (document.hidden) {
    //       // Pause animations when tab is not visible
    //       const particleSystem = window.particleSystem;
    //       if (particleSystem) {
    //         particleSystem.destroy();
    //       }
    //     } else {
    //       // Resume animations when tab becomes visible
    //       this.initializeAnimations();
    //     }
    //   });
    // }

    initializeAnimations() {
      const canvas = document.getElementById('particles-canvas');
      if (canvas) {
        window.particleSystem = new ParticleSystem(canvas);
      }
    }
  }

  /*********************
   * Main Application *
   *********************/
  
  class PortfolioApp {
    constructor() {
      this.components = {};
      this.init();
    }

    init() {
      // Wait for DOM to be fully loaded
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.start());
      } else {
        this.start();
      }
    }

    start() {
      // Initialize all components
      this.components.performanceMonitor = new PerformanceMonitor();
      this.components.navigation = new Navigation();
      this.components.scrollReveal = new ScrollReveal();
      this.components.clipboardManager = new ClipboardManager();
      this.components.interactionEnhancer = new InteractionEnhancer();
      
      // Initialize typing animation
      const typingElement = document.querySelector('.typing-text');
      if (typingElement) {
        const phrases = [
          'Building the Future',
          'Crafting Code',
          'Creating Solutions',
          'Problem Solver',
          'Full-Stack Enthusiast',
          'Creative Developer',
        ];
        this.components.typingAnimation = new TypingAnimation(typingElement, phrases);
      }

      // Initialize particle system
      const canvas = document.getElementById('particles-canvas');
      if (canvas) {
        this.components.particleSystem = new ParticleSystem(canvas);
        window.particleSystem = this.components.particleSystem; // For visibility change handling
      }

      // Log performance metrics
      this.logPerformanceMetrics();
    }

    logPerformanceMetrics() {
      window.addEventListener('load', () => {
        if ('performance' in window) {
          const perfData = performance.getEntriesByType('navigation')[0];
          if (perfData) {
            console.log(`🚀 Page load time: ${Math.round(perfData.loadEventEnd - perfData.loadEventStart)}ms`);
            console.log(`⚡ DOM content loaded: ${Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart)}ms`);
          }
        }
      });
    }

    destroy() {
      // Clean up all components
      Object.values(this.components).forEach(component => {
        if (component && typeof component.destroy === 'function') {
          component.destroy();
        }
      });
    }
  }

  // Add required CSS for ripple animation
  const rippleStyles = document.createElement('style');
  rippleStyles.textContent = `
    @keyframes ripple {
      0% {
        transform: scale(0);
        opacity: 1;
      }
      100% {
        transform: scale(1);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(rippleStyles);

  // Initialize the application
  const app = new PortfolioApp();

  // Make app globally accessible for debugging
  window.portfolioApp = app;

  // Handle page unload
  window.addEventListener('beforeunload', () => {
    app.destroy();
  });

})();