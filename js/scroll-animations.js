/* CA-TECH — scroll-animations.js — Apple / Stripe / Framer style
 * Enrichit les animations sur les 3 pages principales.
 * S'ajoute aux systèmes existants sans les remplacer.
 */
(function () {
  'use strict';

  /* ── 1. CSS — Easing premium + réduction du déplacement ───── */
  var css = document.createElement('style');
  css.id = 'sa-css';
  css.textContent =
    /* Homepage .reveal */
    '.reveal,.reveal-l,.reveal-r{transition:opacity .65s cubic-bezier(.16,1,.3,1),transform .65s cubic-bezier(.16,1,.3,1)!important}'
    + '.reveal{transform:translateY(18px)!important}'
    + '.reveal.vis{transform:translateY(0)!important}'
    + '.reveal-l{transform:translateX(-18px)!important}'
    + '.reveal-l.vis{transform:translateX(0)!important}'
    + '.reveal-r{transform:translateX(18px)!important}'
    + '.reveal-r.vis{transform:translateX(0)!important}'
    /* Collab-IA .cai-reveal */
    + '.cai-reveal{transition:opacity .65s cubic-bezier(.16,1,.3,1),transform .65s cubic-bezier(.16,1,.3,1)!important;transform:translateY(16px)!important}'
    + '.cai-reveal.visible{transform:translateY(0)!important}'
    /* Automatisations .at-reveal */
    + '.at-reveal{transition:opacity .65s cubic-bezier(.16,1,.3,1),transform .65s cubic-bezier(.16,1,.3,1)!important;transform:translateY(16px)!important}'
    + '.at-reveal.visible{transform:translateY(0)!important}'
    /* alib-cards (cartes dynamiques automatisations) */
    + '.alib-card.alib-reveal{transition:opacity .55s cubic-bezier(.16,1,.3,1),transform .55s cubic-bezier(.16,1,.3,1)!important;transform:translateY(14px)!important}'
    + '.alib-card.alib-reveal.alib-visible{transform:translateY(0)!important}'
    /* Reduced motion */
    + '@media(prefers-reduced-motion:reduce){.reveal,.reveal-l,.reveal-r,.cai-reveal,.at-reveal,.alib-card.alib-reveal{transition:none!important;opacity:1!important;transform:none!important}}'
  ;
  document.head.appendChild(css);

  /* ── 2. Stagger — transition-delay sur les groupes de cartes ─ */
  function stagger(selector, stepMs) {
    document.querySelectorAll(selector).forEach(function (el, i) {
      el.style.transitionDelay = (i * stepMs) + 'ms';
    });
  }

  /* ── 3. Parallax léger ────────────────────────────────────── */
  var parallaxItems = [];
  var pRaf = false;

  function onParallaxScroll() {
    if (pRaf) return;
    pRaf = true;
    requestAnimationFrame(function () {
      parallaxItems.forEach(function (item) {
        var rect = item.el.getBoundingClientRect();
        var offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * item.speed;
        /* .sec-bg conserve son scale(1.12) */
        var t = item.isSecBg
          ? 'scale(1.12) translateY(' + offset.toFixed(2) + 'px)'
          : 'translateY(' + offset.toFixed(2) + 'px)';
        item.el.style.transform = t;
      });
      pRaf = false;
    });
  }

  /* ── 4. Count-up ─────────────────────────────────────────── */
  function countUp(el, target, emText) {
    var dur = 1300;
    var t0 = performance.now();
    function tick(now) {
      var p = Math.min((now - t0) / dur, 1);
      var ease = 1 - Math.pow(1 - p, 3); /* ease-out cubic */
      var val = Math.round(ease * target);
      el.innerHTML = val + (emText ? '<em>' + emText + '</em>' : '');
      if (p < 1) requestAnimationFrame(tick);
      else el.innerHTML = target + (emText ? '<em>' + emText + '</em>' : '');
    }
    requestAnimationFrame(tick);
  }

  /* ── 5. Init ─────────────────────────────────────────────── */
  function init() {

    /* Stagger bento cards */
    stagger('.cai-bento .cai-card', 80);

    /* Stagger why cards + cat cards + faq items (automatisations) */
    stagger('.at-why-card',  70);
    stagger('.at-cat-card',  55);
    stagger('.at-faq-item',  40);

    /* Stagger zone cards (homepage) */
    stagger('.zone-card',    60);

    /* Parallax — hero photo collaborateurs-ia */
    var heroPhoto = document.querySelector('.cai-hero-photo-wrap img');
    if (heroPhoto) {
      heroPhoto.style.transition = 'transform 0.08s linear';
      parallaxItems.push({ el: heroPhoto, speed: 0.055 });
    }

    /* Parallax — sec-bg (background sections) — très subtil */
    document.querySelectorAll('.sec-bg').forEach(function (el) {
      /* On conserve scale(1.12) + on ajoute un translateY léger */
      el.style.transition = 'transform 0.08s linear';
      parallaxItems.push({ el: el, speed: 0.04, isSecBg: true });
    });

    if (parallaxItems.length) {
      window.addEventListener('scroll', onParallaxScroll, { passive: true });
      onParallaxScroll(); /* position initiale */
    }

    /* Count-up — stats automatisations hero (au-dessus du pli) */
    var atStats = document.querySelectorAll('.at-stat-val');
    if (atStats.length) {
      setTimeout(function () {
        atStats.forEach(function (el, i) {
          var em = el.querySelector('em');
          var emText = em ? em.textContent : '';
          var num = parseInt(el.textContent.replace(/\D/g, ''), 10) || 0;
          if (!num) return;
          setTimeout(function () { countUp(el, num, emText); }, i * 100);
        });
      }, 650);
    }

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
