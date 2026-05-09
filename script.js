/* ═══════════════════════════════════════════════
   MOTHER'S DAY TRIBUTE — script.js
═══════════════════════════════════════════════ */

/* ─── Unlock & scroll to section ─── */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;

  // Unlock scroll on body
  document.body.classList.remove('locked');

  // Unlock this section and all sections after hero
  const allLocked = document.querySelectorAll('.section--locked');
  allLocked.forEach((section) => {
    section.classList.remove('section--locked');
    section.classList.add('section--unlocked');

    // Re-trigger scroll reveal for newly visible elements
    const animEls = section.querySelectorAll('[data-animate]');
    animEls.forEach((animEl) => {
      animEl.classList.remove('is-visible');
    });
    setTimeout(() => {
      observeElements(animEls);
    }, 100);
  });

  // Smooth scroll to target
  setTimeout(() => {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 80);
}

/* ─── Scroll-triggered reveal animations ─── */
function observeElements(elements) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.dataset.delay || '0', 10);
          setTimeout(() => {
            el.classList.add('is-visible');
          }, delay);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  elements.forEach((el) => observer.observe(el));
}

(function initReveal() {
  // Only observe hero elements on load; rest are locked
  const heroElements = document.querySelectorAll('.hero [data-animate]');
  observeElements(heroElements);
})();

/* ─── Floating Hearts Canvas ─── */
(function initHearts() {
  const canvas = document.getElementById('heartsCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W = window.innerWidth;
  let H = window.innerHeight;
  let hearts = [];
  let animId;

  // Resize
  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Heart shape path
  function drawHeart(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.3);
    ctx.bezierCurveTo(
      size * 0.5, -size,
      size * 1.1, -size * 0.1,
      0, size * 0.8
    );
    ctx.bezierCurveTo(
      -size * 1.1, -size * 0.1,
      -size * 0.5, -size,
      0, -size * 0.3
    );
    ctx.closePath();
    ctx.restore();
  }

  // Heart class
  class Heart {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * W;
      this.y = initial ? Math.random() * H : H + 30;
      this.size = 4 + Math.random() * 10;
      this.speedY = 0.3 + Math.random() * 0.7;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.opacity = 0.08 + Math.random() * 0.18;
      this.rotation = (Math.random() - 0.5) * 0.4;
      this.rotSpeed = (Math.random() - 0.5) * 0.008;
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = 0.01 + Math.random() * 0.02;
      // Soft pink / rose palette
      const hue = 330 + Math.random() * 30;
      const sat = 60 + Math.random() * 30;
      const lit = 65 + Math.random() * 20;
      this.color = `hsla(${hue}, ${sat}%, ${lit}%, ${this.opacity})`;
    }

    update() {
      this.y -= this.speedY;
      this.wobble += this.wobbleSpeed;
      this.x += Math.sin(this.wobble) * 0.5 + this.speedX;
      this.rotation += this.rotSpeed;
      if (this.y < -30) this.reset();
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      drawHeart(ctx, 0, 0, this.size);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    }
  }

  // Spawn hearts — fewer on mobile for performance
  const count = W < 480 ? 18 : W < 768 ? 26 : 36;
  for (let i = 0; i < count; i++) {
    hearts.push(new Heart());
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    hearts.forEach((h) => {
      h.update();
      h.draw(ctx);
    });
    animId = requestAnimationFrame(animate);
  }

  animate();

  // Pause when tab hidden (battery saving)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      animate();
    }
  });
})();

/* ─── Parallax-lite: subtle photo scale on scroll ─── */
(function initParallax() {
  const photo = document.querySelector('.hero__photo-img-wrap');
  if (!photo) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const scale = 1 + scrollY * 0.00015;
        photo.style.transform = `scale(${Math.min(scale, 1.08)})`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ─── Smooth entrance for hero on load ─── */
(function heroEntrance() {
  window.addEventListener('load', () => {
    const heroAnimated = document.querySelectorAll('.hero [data-animate]');
    heroAnimated.forEach((el, i) => {
      const delay = parseInt(el.dataset.delay || '0', 10) + i * 80;
      setTimeout(() => {
        el.classList.add('is-visible');
      }, 200 + delay);
    });
  });
})();

/* ─── Button ripple effect ─── */
(function initRipple() {
  const btn = document.querySelector('.btn-glow');
  if (!btn) return;

  btn.addEventListener('pointerdown', (e) => {
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height) * 1.5;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      border-radius: 50%;
      background: rgba(255,255,255,0.3);
      transform: scale(0);
      animation: rippleAnim 0.6s ease-out forwards;
      pointer-events: none;
    `;

    // Inject keyframes once
    if (!document.getElementById('ripple-style')) {
      const style = document.createElement('style');
      style.id = 'ripple-style';
      style.textContent = `
        @keyframes rippleAnim {
          to { transform: scale(1); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
})();
