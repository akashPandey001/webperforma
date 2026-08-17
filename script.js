/*
  WebPerforma interactions.
  Mobile menu, dark mode, scroll reveals, hero parallax, process animation,
  optional counters and centralized WhatsApp/contact settings.
*/

(() => {
  'use strict';

  /* =========================================================
     EASY-TO-EDIT CONTACT SETTINGS
     WhatsApp uses international digits only, without "+" or spaces.
     If your number has a different country code, change it here.
  ========================================================== */
  const CONTACT = {
    whatsappDisplay: '87960 50928',
    whatsappNumber: '918796050928',
    instagramUrl: 'https://www.instagram.com/webperforma?utm_source=qr&igsh=YXVwYnR4ODI5dHE4&igsi=YXVwYnR4ODI5dHE4'
  };

  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const themeToggle = document.getElementById('theme-toggle');
  const heroCard = document.getElementById('hero-card');
  const processTrack = document.getElementById('process-track');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* =========================================================
     CONTACT LINKS
  ========================================================== */
const whatsappUrl = `https://wa.me/${CONTACT.whatsappNumber}`;

document.querySelectorAll('.js-whatsapp').forEach((link) => {
  link.href = whatsappUrl;
});

document.querySelectorAll('.js-whatsapp-display').forEach((node) => {
  node.textContent = CONTACT.whatsappDisplay;
});

document.querySelectorAll('.js-instagram').forEach((link) => {
  link.href = CONTACT.instagramUrl;
});

  /* =========================================================
     CURRENT YEAR
  ========================================================== */
  const yearNode = document.getElementById('year');
  if (yearNode) yearNode.textContent = new Date().getFullYear();

  /* =========================================================
     STICKY HEADER
  ========================================================== */
  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 12);
  };

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* =========================================================
     MOBILE NAVIGATION
  ========================================================== */
  const closeMenu = () => {
    if (!menuToggle || !navMenu) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    navMenu.classList.remove('open');
    document.body.classList.remove('menu-open');
  };

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
      navMenu.classList.toggle('open', !isOpen);
      document.body.classList.toggle('menu-open', !isOpen);
    });

    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 920) closeMenu();
    });
  }

  /* =========================================================
     DARK MODE
     - Saves the user's choice in localStorage.
     - Uses system preference if no choice has been saved.
  ========================================================== */
  const getSavedTheme = () => {
    try {
      return localStorage.getItem('webperforma-theme');
    } catch (_) {
      return null;
    }
  };

  const setTheme = (theme, persist = true) => {
    root.dataset.theme = theme;

    if (themeToggle) {
      const dark = theme === 'dark';
      themeToggle.setAttribute('aria-pressed', String(dark));
      themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      themeToggle.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    }

    if (persist) {
      try {
        localStorage.setItem('webperforma-theme', theme);
      } catch (_) {}
    }
  };

  const initialTheme =
    getSavedTheme() ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  setTheme(initialTheme, false);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
    });
  }

  const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
  const handleSystemTheme = (event) => {
    if (!getSavedTheme()) setTheme(event.matches ? 'dark' : 'light', false);
  };

  if (colorScheme.addEventListener) {
    colorScheme.addEventListener('change', handleSystemTheme);
  }

  /* =========================================================
     REUSABLE SCROLL REVEAL SYSTEM
  ========================================================== */
  const revealItems = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .reveal-step, .reveal-sequence, .funnel-panel'
  );

  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    if (processTrack) processTrack.classList.add('is-visible');
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add('is-visible');

          /* A sequence reveals its children in CSS with staggered delays. */
          if (entry.target.classList.contains('reveal-sequence')) {
            entry.target.querySelectorAll('.reveal-step').forEach((child) => {
              child.classList.add('is-visible');
            });
          }

          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.16,
        rootMargin: '0px 0px -6% 0px'
      }
    );

    revealItems.forEach((item) => revealObserver.observe(item));

    if (processTrack) {
      const processObserver = new IntersectionObserver(
        (entries, observer) => {
          if (entries[0].isIntersecting) {
            processTrack.classList.add('is-visible');
            observer.unobserve(processTrack);
          }
        },
        { threshold: 0.25 }
      );

      processObserver.observe(processTrack);
    }
  }

  /* Start the gentle float only after the entrance animation finishes. */
  if (heroCard) {
    heroCard.addEventListener('animationend', (event) => {
      if (event.animationName === 'cardEnter') heroCard.classList.add('hero-entered');
    }, { once: true });
  }

  /* =========================================================
     SUBTLE DESKTOP HERO PARALLAX
     Maximum rotation remains around 2–3 degrees.
  ========================================================== */
  if (heroCard && !reduceMotion.matches && window.matchMedia('(pointer: fine)').matches) {
  const heroVisual = heroCard.closest('.hero-visual-wrap');

  if (heroVisual) {
    let rafId = null;

    const resetCard = () => {
      heroCard.style.transform = '';
    };

    heroVisual.addEventListener('mousemove', (event) => {
      if (window.innerWidth <= 920) return;

      const rect = heroVisual.getBoundingClientRect();

      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      if (rafId) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        const rotateY = x * 5;
        const rotateX = y * -5;

        heroCard.style.transform =
          `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
      });
    });

    heroVisual.addEventListener('mouseleave', resetCard);
  }
}

  /* =========================================================
     OPTIONAL REUSABLE COUNTER
     Example:
     <span class="counter" data-target="42">0</span>
     Do not use this for placeholder/fake metrics.
  ========================================================== */
  const counters = document.querySelectorAll('.counter[data-target]');

  if (counters.length) {
    const animateCounter = (node) => {
      const target = Number(node.dataset.target);
      if (!Number.isFinite(target)) return;

      if (reduceMotion.matches) {
        node.textContent = String(target);
        return;
      }

      const duration = 1100;
      const started = performance.now();

      const frame = (now) => {
        const progress = Math.min((now - started) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        node.textContent = String(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(frame);
      };

      requestAnimationFrame(frame);
    };

    if ('IntersectionObserver' in window && !reduceMotion.matches) {
      const counterObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.6 }
      );

      counters.forEach((counter) => counterObserver.observe(counter));
    } else {
      counters.forEach(animateCounter);
    }
  }
})();
