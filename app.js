// app.js - Interaction & Animations powered by anime.js

document.addEventListener('DOMContentLoaded', () => {
  /*------------------------------
   * 1. NAVBAR & HAMBURGER MENU
   *-----------------------------*/
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = navMenu.querySelectorAll('.nav-link');

  // Toggle mobile menu
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Close mobile menu when a link is clicked
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  /*------------------------------
   * 2. SMOOTH SCROLLING NAVIGATION
   *-----------------------------*/
  function smoothScrollToSection(targetId) {
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      const navbarHeight = 70; // Height of fixed navbar
      const targetPosition = targetSection.offsetTop - navbarHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }

  // Handle navbar link clicks
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1); // Remove the '#'
      smoothScrollToSection(targetId);
    });
  });

  // Handle hero CTA buttons
  const ctaButtons = document.querySelectorAll('.hero-cta a');
  ctaButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = button.getAttribute('href').substring(1);
      smoothScrollToSection(targetId);
    });
  });

  /*------------------------------
   * 3. HERO INTRO ANIMATION
   *-----------------------------*/
  anime
    .timeline({ easing: 'easeOutExpo' })
    .add({
      targets: '.hero-title',
      opacity: [0, 1],
      translateY: [50, 0],
      duration: 1200,
    })
    .add(
      {
        targets: '.hero-tagline',
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 1000,
      },
      '-=700'
    )
    .add(
      {
        targets: '.hero-location',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
      },
      '-=600'
    )
    .add(
      {
        targets: '.hero-cta',
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 800,
      },
      '-=600'
    );

  // Floating geometric shapes
  document.querySelectorAll('.floating-shape').forEach((shape) => {
    anime({
      targets: shape,
      translateX: () => anime.random(-60, 60),
      translateY: () => anime.random(-60, 60),
      rotate: () => anime.random(0, 360),
      duration: () => anime.random(8000, 12000),
      easing: 'easeInOutSine',
      direction: 'alternate',
      loop: true,
    });
  });

  // Scroll indicator bounce
  anime({
    targets: '.scroll-arrow',
    translateY: [0, 10],
    easing: 'easeInOutSine',
    duration: 1000,
    direction: 'alternate',
    loop: true,
  });

  /*------------------------------
   * 4. HERO SUBTITLE TYPING EFFECT
   *-----------------------------*/
  const phrases = [
    'Building the Future',
    'Crafting Code',
    'Creating Solutions',
    'Problem Solver',
    'Full-Stack Enthusiast',
  ];
  const subtitleEl = document.getElementById('animated-text');
  let phraseIndex = 0;

  function showNextPhrase() {
    const phrase = phrases[phraseIndex % phrases.length];
    subtitleEl.textContent = phrase;

    // Fade animation for each phrase
    anime({
      targets: subtitleEl,
      opacity: [0, 1],
      duration: 600,
      easing: 'easeOutQuad',
      complete: () => {
        setTimeout(() => {
          anime({
            targets: subtitleEl,
            opacity: [1, 0],
            duration: 600,
            easing: 'easeInQuad',
            complete: () => {
              phraseIndex += 1;
              showNextPhrase();
            },
          });
        }, 2000);
      },
    });
  }
  showNextPhrase();

  /*------------------------------
   * 5. INTERSECTION REVEAL ANIMATIONS
   *-----------------------------*/
  const revealTargets = document.querySelectorAll(
    '.timeline-item, .skill-category, .project-card, .achievement-category, .contact-item'
  );

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          anime({
            targets: entry.target,
            opacity: [0, 1],
            translateY: [50, 0],
            duration: 800,
            easing: 'easeOutExpo',
          });
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  revealTargets.forEach((el) => {
    el.style.opacity = 0;
    observer.observe(el);
  });

  /*------------------------------
   * 6. ACTIVE NAV LINK ON SCROLL
   *-----------------------------*/
  const sections = document.querySelectorAll('section');

  function setActiveNav() {
    let currentId = '';
    const scrollPos = window.scrollY + 120; // offset for fixed navbar

    sections.forEach((section) => {
      if (scrollPos >= section.offsetTop) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle('active', link.dataset.section === currentId);
    });
  }
  setActiveNav();
  window.addEventListener('scroll', setActiveNav);

  /*------------------------------
   * 7. COPY-TO-CLIPBOARD CONTACT INFO
   *-----------------------------*/
  const contactItems = document.querySelectorAll('.contact-item');
  contactItems.forEach((item) => {
    item.addEventListener('click', async () => {
      const text = item.dataset.copy;
      const tooltip = item.querySelector('.copy-tooltip');
      try {
        await navigator.clipboard.writeText(text);
        tooltip.textContent = 'Copied!';
        setTimeout(() => {
          tooltip.textContent = 'Click to copy';
        }, 2000);
      } catch {
        tooltip.textContent = 'Failed :(';
        setTimeout(() => {
          tooltip.textContent = 'Click to copy';
        }, 2000);
      }
    });
  });

  /*------------------------------
   * 8. PROJECT LINK INTERACTIONS
   *-----------------------------*/
  const projectLinks = document.querySelectorAll('.project-link');
  projectLinks.forEach((link) => {
    // Handle placeholder links
    if (link.classList.contains('placeholder-link')) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        // Create a temporary tooltip for placeholder feedback
        const tooltip = document.createElement('div');
        tooltip.textContent = 'Add your GitHub repository link!';
        tooltip.style.cssText = `
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: var(--color-charcoal-800);
          color: var(--color-cream-100);
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          white-space: nowrap;
          z-index: 10;
          pointer-events: none;
        `;
        link.style.position = 'relative';
        link.appendChild(tooltip);
        
        setTimeout(() => {
          if (tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip);
          }
        }, 2000);
      });
    }
  });

  /*------------------------------
   * 9. SCROLL INDICATOR CLICK
   *-----------------------------*/
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      smoothScrollToSection('about');
    });
    scrollIndicator.style.cursor = 'pointer';
  }
});