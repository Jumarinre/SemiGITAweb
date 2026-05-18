/**
 * main.js — Punto de entrada principal.
 * Inicializa todo en orden. Scripts clásicos (sin módulos ES) para
 * máxima compatibilidad: funciona en file:// en Firefox, Chrome y
 * cualquier navegador, y también en GitHub Pages.
 *
 * Las funciones initNav, initAnimations, loadAllData e initParticles
 * son globales — definidas por los scripts cargados antes que este.
 */

// Señal para el timeout-fallback en index.html — scripts cargaron OK
window.__jsReady = true;

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Nav primero — necesita el DOM listo
  try {
    initNav();
  } catch (err) {
    console.warn('[SemiGITA] No se pudo inicializar la navegación.', err);
  }

  // 2. Animaciones — observa elementos data-reveal
  try {
    initAnimations();
  } catch (err) {
    console.warn('[SemiGITA] No se pudieron inicializar las animaciones.', err);
  }

  // 3. Cargar y renderizar todo el contenido dinámico
  try {
    await loadAllData();
  } catch (err) {
    console.error('[SemiGITA] No se pudo cargar el contenido dinámico.', err);
  }

  // 4. Re-inicializar animaciones para los nuevos elementos renderizados
  try {
    initAnimations();
  } catch (err) {
    console.warn('[SemiGITA] No se pudieron inicializar las animaciones dinámicas.', err);
  }

  // 5. Partículas en el hero (última — más pesado visualmente)
  try {
    initParticles('hero-canvas');
  } catch (err) {
    console.warn('[SemiGITA] No se pudieron inicializar las partículas.', err);
  }
});
