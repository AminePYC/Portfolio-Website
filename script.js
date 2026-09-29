(function () {
  const wrap   = document.querySelector('.hero-right');
  const canvas = document.getElementById('heroCanvas');
  const ctx    = canvas.getContext('2d');
  const svgEl  = document.getElementById('heroCageSvg');
  const svgNS  = 'http://www.w3.org/2000/svg';
  const RED    = '#e30749';

  /* sharp on high-DPI screens: canvas backing store is scaled by devicePixelRatio,
     all drawing code keeps working in CSS pixels */
  function resize () {
    const size = wrap.offsetWidth;
    const dpr  = window.devicePixelRatio || 1;
    canvas.width  = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    svgEl.setAttribute('viewBox', `0 0 ${size} ${size}`);
    buildCage();
  }


  let PARTS = [];
  function initParticles () {
    const size = wrap.offsetWidth || 520;
    PARTS = Array.from({ length: 60 }, () => ({
      x:  Math.random() * size,
      y:  Math.random() * size,
      r:  Math.random() * 1.6 + 0.3,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      a:  Math.random() * 0.55 + 0.08,
    }));
  }

  let TRIS = [];
  function initTris () {
    const size = wrap.offsetWidth || 520;
    TRIS = Array.from({ length: 22 }, () => ({
      cx:    size / 2 + (Math.random() - 0.5) * size * 0.85,
      cy:    size / 2 + (Math.random() - 0.5) * size * 0.85,
      size:  Math.random() * 38 + 10,
      rot:   Math.random() * Math.PI * 2,
      rotV:  (Math.random() - 0.5) * 0.013,
      vx:    (Math.random() - 0.5) * 0.32,
      vy:    (Math.random() - 0.5) * 0.32,
      alpha: Math.random() * 0.24 + 0.04,
      fill:  Math.random() > 0.58,
      phase: Math.random() * Math.PI * 2,
    }));
  }


  function makePoly (n, rx, ry, cx, cy, alpha, sw, dash) {
    const pts = Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry].join(',');
    }).join(' ');
    const el = document.createElementNS(svgNS, 'polygon');
    el.setAttribute('points', pts);
    el.setAttribute('fill', 'none');
    el.setAttribute('stroke', RED);
    el.setAttribute('stroke-width', sw || '0.7');
    el.setAttribute('stroke-opacity', alpha || 0.18);
    if (dash) el.setAttribute('stroke-dasharray', dash);
    return el;
  }

  let spinGroup = null;

  function buildCage () {
    svgEl.innerHTML = '';
    const sz = wrap.offsetWidth;
    const cx = sz / 2, cy = sz / 2;
    const r  = sz * 0.42;

    svgEl.appendChild(makePoly(6, r * 0.82, r * 0.82, cx, cy, .11, '.8', '6 8'));
    svgEl.appendChild(makePoly(8, r * 1.0,  r * 1.0,  cx, cy, .06, '.5', '4 12'));
    svgEl.appendChild(makePoly(4, r * 0.58, r * 0.58, cx, cy, .09, '1'));
    svgEl.appendChild(makePoly(3, r * 0.43, r * 0.43, cx, cy, .13, '.6', '2 6'));

    spinGroup = document.createElementNS(svgNS, 'g');
    spinGroup.appendChild(makePoly(6, r * 0.68, r * 0.68, cx, cy, .10, '1', '10 5'));
    svgEl.appendChild(spinGroup);

    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', cx); line.setAttribute('y1', cy);
      line.setAttribute('x2', cx + Math.cos(a) * r);
      line.setAttribute('y2', cy + Math.sin(a) * r);
      line.setAttribute('stroke', RED);
      line.setAttribute('stroke-width', '0.4');
      line.setAttribute('stroke-opacity', '.05');
      svgEl.appendChild(line);
    }
  }

  function drawTri (t, ts) {
    const s  = t.size * (1 + 0.06 * Math.sin(ts * 0.0008 + t.phase));
    const ax = t.cx + Math.cos(t.rot) * s,         ay = t.cy + Math.sin(t.rot) * s;
    const bx = t.cx + Math.cos(t.rot + 2.094) * s, by = t.cy + Math.sin(t.rot + 2.094) * s;
    const cx2= t.cx + Math.cos(t.rot + 4.189) * s, cy2= t.cy + Math.sin(t.rot + 4.189) * s;
    const a  = t.alpha * (0.7 + 0.3 * Math.sin(ts * 0.0006 + t.phase));
    ctx.beginPath();
    ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx2, cy2);
    ctx.closePath();
    if (t.fill) { ctx.fillStyle = `rgba(227,7,73,${a * 0.3})`; ctx.fill(); }
    ctx.strokeStyle = `rgba(227,7,73,${a})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  function drawParticles () {
    const W = wrap.offsetWidth, H = W;
    for (const p of PARTS) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(227,7,73,${p.a})`; ctx.fill();
    }
    for (let i = 0; i < PARTS.length; i++) {
      for (let j = i + 1; j < PARTS.length; j++) {
        const dx = PARTS[i].x - PARTS[j].x, dy = PARTS[i].y - PARTS[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 75) {
          ctx.beginPath(); ctx.moveTo(PARTS[i].x, PARTS[i].y); ctx.lineTo(PARTS[j].x, PARTS[j].y);
          ctx.strokeStyle = `rgba(227,7,73,${0.06 * (1 - d / 75)})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
    }
  }

  let ts = 0, spinAngle = 0;
  let running = true, looping = false;   // pause the animation when the hero is off-screen

  function loop () {
    ts++;
    const W = wrap.offsetWidth, H = W, cx = W / 2, cy = H / 2;
    ctx.clearRect(0, 0, W, H);


    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.38);
    glow.addColorStop(0, `rgba(227,7,73,${0.06 + 0.02 * Math.sin(ts * 0.012)})`);
    glow.addColorStop(1, 'rgba(227,7,73,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

    for (const t of TRIS) {
      t.rot += t.rotV; t.cx += t.vx; t.cy += t.vy;
      if (t.cx < -60) t.cx = W + 60; if (t.cx > W + 60) t.cx = -60;
      if (t.cy < -60) t.cy = H + 60; if (t.cy > H + 60) t.cy = -60;
      drawTri(t, ts);
    }

    drawParticles();

    spinAngle += 0.0028;
    if (spinGroup) spinGroup.setAttribute('transform',
      `rotate(${(spinAngle * 180 / Math.PI).toFixed(2)} ${cx} ${cy})`);

    if (running) requestAnimationFrame(loop);
    else looping = false;
  }

  function startLoop () {
    if (looping) return;
    looping = true;
    loop();
  }

  function init () {
    resize();
    initParticles();
    initTris();
    startLoop();
    new IntersectionObserver(([e]) => {
      running = e.isIntersecting;
      if (running) startLoop();
    }).observe(wrap);
  }

  init();
  window.addEventListener('resize', () => { resize(); initParticles(); initTris(); });
})();

/* ── Flame cursor ───────────────────────────────────── */
const flameCursor = document.getElementById('flameCursor');
const emberLayer   = document.getElementById('flameEmbers');
const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;
let fmx = window.innerWidth / 2, fmy = window.innerHeight / 2;
let fx = fmx, fy = fmy;
let lastEmberX = fx, lastEmberY = fy;
let cursorSeen = false;

/* hidden until the first real mouse move, so it never sits frozen mid-screen */
flameCursor.style.opacity = '0';

document.addEventListener('mousemove', e => {
  fmx = e.clientX; fmy = e.clientY;
  if (!cursorSeen) {                      // snap to the pointer on first move (no slide-in from centre)
    cursorSeen = true;
    fx = fmx; fy = fmy;
    lastEmberX = fx; lastEmberY = fy;
  }
  flameCursor.style.opacity = '1';
});

function spawnEmber(x, y) {
  const ember = document.createElement('span');
  ember.className = 'ember';
  const size = Math.random() * 5 + 3;
  ember.style.width  = size + 'px';
  ember.style.height = size + 'px';
  ember.style.left = (x + (Math.random() * 14 - 7)) + 'px';
  ember.style.top  = (y + (Math.random() * 14 - 7)) + 'px';
  ember.style.setProperty('--dx', (Math.random() * 30 - 15) + 'px');
  ember.style.setProperty('--dy', (-Math.random() * 40 - 10) + 'px');
  emberLayer.appendChild(ember);
  ember.addEventListener('animationend', () => ember.remove());
}

function flameTick () {
  fx += (fmx - fx) * 0.45;
  fy += (fmy - fy) * 0.45;
  flameCursor.style.left = fx + 'px';
  flameCursor.style.top  = fy + 'px';

  if (Math.hypot(fx - lastEmberX, fy - lastEmberY) > 8) {
    spawnEmber(fx, fy);
    lastEmberX = fx; lastEmberY = fy;
  }
  requestAnimationFrame(flameTick);
}
if (!isTouchDevice) flameTick();

document.addEventListener('mouseleave', () => { flameCursor.style.opacity = '0'; });
document.addEventListener('mouseenter', () => { if (cursorSeen) flameCursor.style.opacity = '1'; });

/* ── Scroll reveal ─────────────────────────────────── */
const revEls = document.querySelectorAll('.reveal');
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      // after the entrance finishes, switch cards back to snappy hover transitions
      setTimeout(() => e.target.classList.add('settled'), 1200);
      obs.unobserve(e.target);
    }
  });
}, { threshold: .06 });
revEls.forEach(el => obs.observe(el));

/* ── Cursor-following glow on cards ────────────────── */
document.querySelectorAll('.proj-card, .cert-card').forEach(card => {
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top)  + 'px');
  });
});

/* ── Active nav ────────────────────────────────────── */
const navItems = document.querySelectorAll('.nav-item[data-section]');
const secs     = document.querySelectorAll('section[id], footer[id]');
window.addEventListener('scroll', () => {
  let cur = '';
  secs.forEach(s => { if (window.scrollY >= s.offsetTop - 140) cur = s.id; });
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
    cur = 'contact';
  }
  navItems.forEach(a => a.classList.toggle('active', a.dataset.section === cur));
}, { passive: true });

/* ── Skills HUD carousel (coverflow) ─────────────── */
(function () {
  const svgNS = 'http://www.w3.org/2000/svg';
  const RED = '#e30749';
  const hud     = document.getElementById('skillsHud');
  if (!hud) return;
  const track   = document.getElementById('hudTrack');
  const chipsEl = document.getElementById('hudChips');
  const dotsEl  = document.getElementById('hudDots');
  const prevBtn = document.getElementById('hudPrev');
  const nextBtn = document.getElementById('hudNext');

  const CATEGORIES = [
    { name:'Malware Analysis', icon:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>',
      chips:['Static Analysis','Dynamic Analysis','REMnux','FlareVM','PE analysis','strings / FLOSS','Any.run','MalwareBazaar','YARA rules','Wireshark','Procmon','Ghidra (learning)'] },
    { name:'Blue Team & DFIR', icon:'<path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z"/>',
      chips:['Log analysis','Windows Event Logs','MITRE ATT&CK','Splunk','Volatility','Autopsy','Network forensics','IOC extraction','Incident triage','SIEM basics'] },
    { name:'OSINT & Threat Intel', icon:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
      chips:['IOC pivoting','Infrastructure mapping','VirusTotal','Shodan','Maltego','Passive DNS','theHarvester','Recon-ng','abuse.ch feeds','Threat actor profiling'] },
    { name:'Programming & Tooling', icon:'<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
      chips:['Python','C++','Java','JavaScript','Linux CLI','Git / GitHub','Kali Linux','Nmap','Metasploit (lab)'] }
  ];

  let idx = 0, timer = null;
  const items = [];

  function makeCircle(r, opts) {
    const c = document.createElementNS(svgNS, 'circle');
    c.setAttribute('cx', 200); c.setAttribute('cy', 200); c.setAttribute('r', r);
    c.setAttribute('fill', 'none');
    c.setAttribute('stroke', RED);
    c.setAttribute('stroke-width', opts.w || 1);
    c.setAttribute('stroke-opacity', opts.a || .2);
    if (opts.dash) c.setAttribute('stroke-dasharray', opts.dash);
    if (opts.cls) c.setAttribute('class', opts.cls);
    return c;
  }

  function buildRings(svg) {
    svg.appendChild(makeCircle(188, { w:1,  a:.18, dash:'2 6',         cls:'hud-ring-spin-cw'  }));
    svg.appendChild(makeCircle(158, { w:5,  a:.55, dash:'55 20 30 25', cls:'hud-ring-spin-ccw' }));
    svg.appendChild(makeCircle(128, { w:1,  a:.28, dash:'5 10',        cls:'hud-ring-spin-fast'}));
    svg.appendChild(makeCircle(96,  { w:.8, a:.16 }));
  }

  function buildItems() {
    track.innerHTML = '';
    CATEGORIES.forEach((cat) => {
      const item = document.createElement('div');
      item.className = 'hud-item';
      item.innerHTML =
        '<div class="hud-ring-wrap">' +
          '<span class="hud-tick tick-n"></span><span class="hud-tick tick-s"></span>' +
          '<svg class="hud-rings" viewBox="0 0 400 400"></svg>' +
          '<div class="hud-core"><div class="hud-core-inner">' +
            '<div class="hud-cat-icon"><svg viewBox="0 0 24 24">' + cat.icon + '</svg></div>' +
          '</div></div>' +
        '</div>';
      track.appendChild(item);
      items.push(item);
      buildRings(item.querySelector('.hud-rings'));
    });
  }

  function relOffset(i) {
    const n = CATEGORIES.length;
    let d = i - idx;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  }

  function styleForOffset(off) {
    const abs = Math.abs(off), dir = Math.sign(off);
    if (abs === 0) return { x: 0,         scale: 1,   opacity: 1,   z: 5, rot: 0 };
    if (abs === 1) return { x: dir*210,   scale: .78, opacity: .5,  z: 3, rot: -dir*15 };
    return               { x: dir*370,   scale: .58, opacity: .12, z: 1, rot: -dir*20 };
  }

  function layout() {
    items.forEach((item, i) => {
      const off = relOffset(i);
      const s = styleForOffset(off);
      item.style.transform = `translate(-50%,-50%) translateX(${s.x}px) scale(${s.scale}) rotateY(${s.rot}deg)`;
      item.style.opacity = s.opacity;
      item.style.zIndex = s.z;
      item.classList.toggle('is-active', off === 0);
    });
  }

  function renderDots() {
    dotsEl.innerHTML = '';
    CATEGORIES.forEach((c, i) => {
      const b = document.createElement('button');
      b.className = 'hud-dot' + (i === idx ? ' active' : '');
      b.setAttribute('aria-label', 'Show ' + c.name);
      b.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(b);
    });
  }

  const captionEl    = document.getElementById('hudCaption');
  const captionTitle = document.getElementById('hudCaptionTitle');
  const captionSub   = document.getElementById('hudCaptionSub');

  function renderCaption() {
    captionEl.classList.add('switching');
    setTimeout(() => {
      captionTitle.textContent = CATEGORIES[idx].name;
      captionSub.textContent = CATEGORIES[idx].chips.length + ' tools & techniques';
      captionEl.classList.remove('switching');
    }, 180);
  }

  function renderChips() {
    chipsEl.classList.add('switching');
    setTimeout(() => {
      chipsEl.innerHTML = CATEGORIES[idx].chips.map(c => '<span class="chip hot">' + c + '</span>').join('');
      chipsEl.classList.remove('switching');
    }, 180);
  }

  function goTo(next) {
    idx = ((next % CATEGORIES.length) + CATEGORIES.length) % CATEGORIES.length;
    layout(); renderCaption(); renderChips(); renderDots();
  }

  function startAuto() { clearInterval(timer); timer = setInterval(() => goTo(idx + 1), 2200); }
  function stopAuto()  { clearInterval(timer); }

  prevBtn.addEventListener('click', () => goTo(idx - 1));
  nextBtn.addEventListener('click', () => goTo(idx + 1));
  hud.addEventListener('mouseenter', startAuto);
  hud.addEventListener('mouseleave', stopAuto);

  buildItems();
  layout();
  renderCaption();
  renderChips();
  renderDots();
})();