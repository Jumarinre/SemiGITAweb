/**
 * animations.js — Intersection Observer para scroll-reveal
 *
 * Uso en HTML:
 *   <div data-reveal>...</div>
 *   <div data-reveal="left">...</div>
 *   <div data-reveal="scale" data-reveal-delay="200">...</div>
 */

function initAnimations() {
  // Respeta prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const elements = document.querySelectorAll('[data-reveal]');
  if (!elements.length) return;

  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const delay = el.dataset.revealDelay || '0';

        el.style.transitionDelay = `${delay}ms`;
        el.classList.add('is-visible');

        // Dispara solo una vez
        observer.unobserve(el);
      });
    },
    {
      // rootMargin positivo: los elementos se activan 200px ANTES de entrar
      // en pantalla → cuando el usuario los ve, ya están visibles
      rootMargin: '0px 0px 200px 0px',
      threshold: 0,
    }
  );

  elements.forEach(el => observer.observe(el));
}

/**
 * showToast — Muestra una notificación temporal
 */
function showToast(message, duration = 2500) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => toast.classList.remove('show'), duration);
}
