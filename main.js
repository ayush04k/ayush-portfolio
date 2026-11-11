/* Ayush Kumar — Portfolio interactions. Vanilla JS, no dependencies. */
(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Load-in ---------- */
  document.body.classList.add('ready');
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Theme ---------- */
  const toggle = document.getElementById('themeToggle');
  const meta = document.querySelector('meta[name="theme-color"]');
  const syncMeta = () => meta && meta.setAttribute('content', root.dataset.theme === 'light' ? '#F3F7FB' : '#07101B');
  syncMeta();
  toggle.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    const apply = () => { root.dataset.theme = next; syncMeta(); };
    if (document.startViewTransition && !reduce) document.startViewTransition(apply); else apply();
    try { localStorage.setItem('ak-theme', next); } catch (e) {}
  });

  /* ---------- Mobile menu ---------- */
  const menuBtn = document.getElementById('menuBtn');
  const menu = document.getElementById('mobileMenu');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  menuBtn.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  /* ---------- Scroll: nav state, progress bar, timeline fill ---------- */
  const nav = document.getElementById('nav');
  const bar = document.querySelector('.progress span');
  const timeline = document.getElementById('timeline');
  const tlFill = document.getElementById('tlFill');
  let lastY = window.scrollY, ticking = false;

  const onScroll = () => {
    const sy = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? sy / max : 0})`;
    nav.classList.toggle('scrolled', sy > 20);
    nav.classList.toggle('hidden', sy > lastY && sy > 500 && !document.body.classList.contains('menu-open'));
    lastY = sy;

    if (timeline) {
      const r = timeline.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
      tlFill.style.transform = `scaleY(${p})`;
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- Active nav link ---------- */
  const links = [...document.querySelectorAll('.nav-links a')];
  const secObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach((s) => secObs.observe(s));

  /* ---------- Reveal on scroll + counters ---------- */
  const fmt = (n) => n.toLocaleString('en-US');
  const countUp = (el) => {
    const target = +el.dataset.count, suffix = el.dataset.suffix || '';
    if (reduce) { el.textContent = fmt(target) + suffix; return; }
    const dur = 1600, t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 4);
      el.textContent = fmt(Math.round(target * e)) + suffix;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const revObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll('[data-count]').forEach(countUp);
      revObs.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach((el) => revObs.observe(el));

  /* ---------- Role text scramble ---------- */
  const roles = ['Forward Deployed Engineer', 'AI Solutions Engineer', 'Customer Success AI Engineer', 'AI Product Manager'];
  const roleEl = document.getElementById('roleText');
  const glyphs = '!<>-_\\/[]{}=+*^?#01';
  let ri = 0;
  const scramble = (to) => new Promise((resolve) => {
    const from = roleEl.textContent, len = Math.max(from.length, to.length), q = [];
    for (let i = 0; i < len; i++) {
      const s = Math.floor(Math.random() * 18), e = s + Math.floor(Math.random() * 18) + 6;
      q.push({ from: from[i] || '', to: to[i] || '', s, e, ch: '' });
    }
    let f = 0;
    const tick = () => {
      let out = '', done = 0;
      for (const c of q) {
        if (f >= c.e) { done++; out += c.to; }
        else if (f >= c.s) {
          if (!c.ch || Math.random() < 0.3) c.ch = glyphs[Math.floor(Math.random() * glyphs.length)];
          out += `<span class="scr">${c.ch}</span>`;
        } else out += c.from;
      }
      roleEl.innerHTML = out;
      if (done === q.length) resolve(); else { f++; requestAnimationFrame(tick); }
    };
    tick();
  });
  if (!reduce) {
    const loop = async () => {
      await new Promise((r) => setTimeout(r, 2600));
      ri = (ri + 1) % roles.length;
      await scramble(roles[ri]);
      loop();
    };
    setTimeout(loop, 600);
  }

  /* ---------- Card spotlight (cursor-follow glow) ---------- */
  if (finePointer) {
    document.querySelectorAll('.spot').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduce) {
    document.querySelectorAll('.magnetic').forEach((el) => {
      el.style.transition += ', transform .5s cubic-bezier(.22,1,.36,1)';
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.25;
        const yy = (e.clientY - r.top - r.height / 2) * 0.35;
        el.style.transform = `translate(${x}px, ${yy}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Portrait 3D tilt ---------- */
  const portrait = document.getElementById('portrait');
  if (portrait && finePointer && !reduce) {
    const hero = document.getElementById('hero');
    hero.addEventListener('pointermove', (e) => {
      const r = portrait.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth;
      const dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
      portrait.style.transform = `rotateY(${dx * 14}deg) rotateX(${-dy * 14}deg)`;
    });
    hero.addEventListener('pointerleave', () => { portrait.style.transform = ''; });
  }

  /* ---------- Copy email ---------- */
  const copyBtn = document.getElementById('copyEmail');
  const hint = document.getElementById('copyHint');
  copyBtn.addEventListener('click', async () => {
    const email = copyBtn.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      copyBtn.classList.add('copied'); hint.textContent = 'copied ✓';
    } catch (e) {
      location.href = 'mailto:' + email; return;
    }
    setTimeout(() => { copyBtn.classList.remove('copied'); hint.textContent = 'click to copy'; }, 2000);
  });

  /* ---------- Toolkit tabs ---------- */
  const stack = document.getElementById('stack');
  if (stack) {
    const tabs = [...stack.querySelectorAll('.stack-tab')];
    const ind = stack.querySelector('.stack-ind');
    const panelsWrap = stack.querySelector('.stack-panels');
    const moveInd = (tab) => {
      ind.style.height = tab.offsetHeight + 'px';
      ind.style.transform = `translateY(${tab.offsetTop}px)`;
    };
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).classList.toggle('active', on);
      });
      panelsWrap.dataset.mark = tab.dataset.mark;
      moveInd(tab);
      if (focus) tab.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      if (finePointer) t.addEventListener('pointerenter', () => select(t));
      t.addEventListener('keydown', (e) => {
        const d = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
        if (d) { e.preventDefault(); select(tabs[(i + d + tabs.length) % tabs.length], true); }
      });
    });
    select(tabs[0]);
    window.addEventListener('resize', () => moveInd(tabs.find((t) => t.getAttribute('aria-selected') === 'true')));
  }
})();
