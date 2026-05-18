/**
 * animations.js — Intersection Observer para scroll-reveal
 *
 * Uso en HTML:
 *   <div data-reveal>...</div>
 *   <div data-reveal="left">...</div>
 *   <div data-reveal="scale" data-reveal-delay="200">...</div>
 */

export function initAnimations() {
  // Respeta prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const elements = document.querySelectorAll('[data-reveal]');
  if (!elements.length) return;

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
      rootMargin: '0px 0px -80px 0px',
      threshold: 0.08,
    }
  );

  elements.forEach(el => observer.observe(el));
}

/**
 * showToast — Muestra una notificación temporal
 */
export function showToast(message, duration = 2500) {
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
