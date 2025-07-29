// app.js - Interactive and animated portfolio for Gyana Priyadarshi

(() => {
  'use strict';

  /*********************
   * Helper Functions  *
   *********************/
  // Throttle function for performance in scroll events
  const throttle = (fn, wait = 100) => {
    let inThrottle, lastFn, lastTime;
    return function () {
      const context = this,
        args = arguments;
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
    const targetPosition = element.offsetTop - 80; // Account for nav height
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

    // Easing function
    function ease(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t + b;
      t--;
      return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
  }

  /*********************
   * Typing Effect     *
   *********************/
  const phrases = [
    'Building the Future',
    'Crafting Code',
    'Creating Solutions',
    'Problem Solver',
    'Full-Stack Enthusiast',
  ];

  const typingSpan = document.querySelector('.typing-text');
  const cursorSpan = document.querySelector('.cursor');

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeLoop() {
    const currentPhrase = phrases[phraseIndex];

    if (!isDeleting) {
      // Typing forward
      typingSpan.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;

      if (charIndex === currentPhrase.length) {
        isDeleting = true;
        // Pause at full phrase
        setTimeout(typeLoop, 1500);
        return;
      }
    } else {
      // Deleting
      typingSpan.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }

    const typingSpeed = isDeleting ? 60 : 100;
    setTimeout(typeLoop, typingSpeed);
  }

  // Start typing effect after DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(typeLoop, 1200); // Delay to sync with hero intro animations
  });

  /*************************
   * Navigation Toggle      *
   *************************/
  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav__toggle');
  const navLinks = document.querySelector('.nav__links');

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('nav--open');
      navToggle.classList.toggle('nav__toggle--active');
    });
  }

  // Close mobile menu when a link is clicked
  if (navLinks) {
    navLinks.addEventListener('click', (e) => {
      if (e.target.matches('.nav__link')) {
        nav.classList.remove('nav--open');
        navToggle.classList.remove('nav__toggle--active');
      }
    });
  }

  /*************************
   * Smooth Scroll Navigation *
   *************************/
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (link) {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        smoothScrollTo(targetElement);
        
        // Close mobile menu if open
        nav.classList.remove('nav--open');
        if (navToggle) {
          navToggle.classList.remove('nav__toggle--active');
        }
      }
    }
  });

  // Scroll indicator click
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      const aboutSection = document.getElementById('about');
      if (aboutSection) {
        smoothScrollTo(aboutSection);
      }
    });
  }

  /*************************
   * Parallax Hero Effect  *
   *************************/
  const heroBg = document.querySelector('.hero__background');
  const gradientOrbs = document.querySelectorAll('.gradient-orb');

  function handleParallax() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    
    // Only apply parallax when hero is visible
    if (scrollY < windowHeight && heroBg) {
      // Translate background vertically slower than scroll speed
      heroBg.style.transform = `translateY(${scrollY * 0.3}px)`;
      
      // Orbs slight parallax and rotation
      gradientOrbs.forEach((orb, idx) => {
        const speed = (idx + 1) * 0.15 + 0.1; // different speeds
        orb.style.transform = `translateY(${scrollY * speed}px) rotate(${scrollY * 0.02}deg)`;
      });
    }
  }

  window.addEventListener('scroll', throttle(() => {
    requestAnimationFrame(handleParallax);
  }, 10));

  /*************************
   * Scroll Reveal Animations
   *************************/
  const revealElementsSelector = [
    '.section-header',
    '.about__text',
    '.stat-card',
    '.certification-card',
    '.timeline-item',
    '.skill-category',
    '.specialty-card',
    '.project-card',
    '.achievement-category',
    '.contact-item',
    '.social-links',
  ].join(', ');

  const revealElements = document.querySelectorAll(revealElementsSelector);
  const observerOptions = {
    root: null,
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        // Counter animation for stats
        if (entry.target.classList.contains('stat-card')) {
          const numberEl = entry.target.querySelector('.stat-number');
          if (numberEl && !numberEl.dataset.counted) {
            numberEl.dataset.counted = 'true';
            startCounter(numberEl);
          }
        }
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach((el) => revealOnScroll.observe(el));

  /*************************
   * Counter Up Animation  *
   *************************/
  function startCounter(numberEl) {
    const target = parseInt(numberEl.dataset.target, 10);
    let current = 0;
    const duration = 2000; // 2 seconds
    const stepTime = Math.abs(Math.floor(duration / target));
    
    function updateCounter() {
      current += 1;
      numberEl.textContent = `${current}+`;
      if (current < target) {
        setTimeout(updateCounter, stepTime);
      }
    }

    setTimeout(updateCounter, 100);
  }

  /*************************
   * Copy to Clipboard     *
   *************************/
  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const value = btn.previousElementSibling.dataset.copy;
      copyTextToClipboard(value);
      btn.textContent = 'Copied!';
      btn.style.background = 'var(--color-success)';
      setTimeout(() => {
        btn.textContent = 'Copy';
        btn.style.background = 'var(--color-primary)';
      }, 2000);
    });
  });

  function copyTextToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
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

  /*********************************
   * Highlight Active Nav Link     *
   *********************************/
  const sections = document.querySelectorAll('section');
  const navLinkEls = document.querySelectorAll('.nav__link');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinkEls.forEach((link) => link.classList.remove('active'));
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

  sections.forEach((sec) => sectionObserver.observe(sec));

  /*************************
   * Enhanced Interactions *
   *************************/
  
  // Add pulse effect to CTA buttons
  const ctaButtons = document.querySelectorAll('.hero__btn');
  ctaButtons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.animation = 'pulse 0.6s ease-in-out';
    });
    
    btn.addEventListener('animationend', () => {
      btn.style.animation = '';
    });
  });

  // Add tilt effect to project cards
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach(card => {
    card.addEventListener('mouseenter', (e) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      
      const rotateX = (mouseY - centerY) / 10;
      const rotateY = (centerX - mouseX) / 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // Add dynamic background to skills
  const skillTags = document.querySelectorAll('.skill-tag');
  skillTags.forEach(tag => {
    tag.addEventListener('mouseenter', () => {
      tag.style.background = `linear-gradient(135deg, rgba(var(--color-teal-500-rgb), 0.3), rgba(var(--color-teal-300-rgb), 0.2))`;
      tag.style.borderColor = 'var(--color-teal-300)';
    });
    
    tag.addEventListener('mouseleave', () => {
      tag.style.background = 'rgba(var(--color-teal-500-rgb), 0.1)';
      tag.style.borderColor = 'rgba(var(--color-teal-500-rgb), 0.2)';
    });
  });

  /*************************
   * Performance Monitoring *
   *************************/
  
  // Log performance metrics
  window.addEventListener('load', () => {
    if ('performance' in window) {
      const perfData = performance.getEntriesByType('navigation')[0];
      console.log(`Page load time: ${perfData.loadEventEnd - perfData.loadEventStart}ms`);
    }
  });

  // Reduce animations on low-end devices
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
    document.documentElement.style.setProperty('--duration-normal', '150ms');
    document.documentElement.style.setProperty('--duration-fast', '100ms');
  }

})();

// Add CSS keyframes for pulse animation
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(style);