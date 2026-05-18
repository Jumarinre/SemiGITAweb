/**
 * nav.js — Navegación sticky, hamburger y scroll spy
 */

function initNav() {
  const nav     = document.querySelector('.nav');
  const toggle  = document.querySelector('.nav-toggle');
  const menu    = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  const sections = document.querySelectorAll('section[id]');
  const progressBar = document.querySelector('.scroll-progress');

  if (!nav) return;

  // ── Glassmorphism al hacer scroll ─────────────────────────
  const scrollObserver = () => {
    const scrolled = window.scrollY > 60;
    nav.classList.toggle('scrolled', scrolled);
  };

  window.addEventListener('scroll', scrollObserver, { passive: true });
  scrollObserver();

  // ── Barra de progreso de scroll (fallback JS) ─────────────
  if (progressBar && !CSS.supports('animation-timeline', 'scroll()')) {
    window.addEventListener('scroll', () => {
      const total = document.body.scrollHeight - window.innerHeight;
      const progress = window.scrollY / total;
      progressBar.style.transform = `scaleX(${progress})`;
    }, { passive: true });
  }

  // ── Hamburger / menú móvil ─────────────────────────────────
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      menu.setAttribute('data-open', String(!isOpen));
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    // Cerrar al hacer clic en un link
    menu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        menu.setAttribute('data-open', 'false');
        document.body.style.overflow = '';
      });
    });

    // Cerrar con Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menu.getAttribute('data-open') === 'true') {
        toggle.setAttribute('aria-expanded', 'false');
        menu.setAttribute('data-open', 'false');
        document.body.style.overflow = '';
        toggle.focus();
      }
    });
  }

  // ── Scroll spy: activa nav link de la sección visible ─────
  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    const navOffset = Math.ceil(nav.offsetHeight || 72);
    const spyObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach(link => {
            const active = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('active', active);
          });
        });
      },
      {
        rootMargin: `-${navOffset}px 0px -55% 0px`,
        threshold: 0,
      }
    );

    sections.forEach(s => spyObserver.observe(s));
  }

  // ── Smooth scroll con offset para la nav fija ─────────────
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      const navH = nav.offsetHeight;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}
