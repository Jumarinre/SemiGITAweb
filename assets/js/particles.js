/**
 * particles.js — Canvas particle network para el hero
 * Dibuja nodos conectados por líneas cuando están cerca.
 * Corre a ~30fps para ahorrar batería.
 */

export function initParticles(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Respeta prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none';
    return;
  }

  const PARTICLE_COUNT = 55;
  const MAX_DIST = 130;
  const SPEED = 0.35;
  const CYAN = '#22d3ee';

  let particles = [];
  let animFrame;
  let lastTime = 0;
  const FPS_INTERVAL = 1000 / 30;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        r:  Math.random() * 1.5 + 1,
      });
    }
  }

  function draw(timestamp) {
    animFrame = requestAnimationFrame(draw);

    const elapsed = timestamp - lastTime;
    if (elapsed < FPS_INTERVAL) return;
    lastTime = timestamp - (elapsed % FPS_INTERVAL);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Mover partículas
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    }

    // Dibujar conexiones
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.35;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // Dibujar nodos
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = CYAN;
      ctx.globalAlpha = 0.55;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  const ro = new ResizeObserver(() => {
    resize();
    createParticles();
  });
  ro.observe(canvas.parentElement);

  resize();
  createParticles();
  animFrame = requestAnimationFrame(draw);

  // Limpiar si el elemento sale del DOM
  return () => {
    cancelAnimationFrame(animFrame);
    ro.disconnect();
  };
}
