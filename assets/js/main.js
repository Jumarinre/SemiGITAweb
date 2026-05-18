/**
 * main.js — Punto de entrada principal.
 * Inicializa todos los módulos en orden.
 */

import { initNav }        from './nav.js';
import { initAnimations } from './animations.js';
import { loadAllData }    from './data.js';
import { initParticles }  from './particles.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Nav primero — necesita el DOM listo
  initNav();

  // 2. Animaciones — observa elementos data-reveal
  initAnimations();

  // 3. Cargar y renderizar todo el contenido dinámico
  await loadAllData();

  // 4. Re-inicializar animaciones para los nuevos elementos renderizados
  initAnimations();

  // 5. Partículas en el hero (última — más pesado visualmente)
  initParticles('hero-canvas');
});
