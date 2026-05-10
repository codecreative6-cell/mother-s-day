/* ═══════════════════════════════════════════════════════════
   COLOUR PALETTES
═══════════════════════════════════════════════════════════ */
const PINK_PALETTE = {
  back:  ['#fff0f8','#f0a0c0','#c03268'],
  front: ['#fce4ec','#e87aaa','#b02860'],
  ctr:   ['#fff4f8','#e060a0','#b83070'],
  halo:  'rgba(248,140,200,0.18)',
  name:  'linear-gradient(135deg,#fff0f8 0%,#f8b0c8 35%,#e06090 65%,#fff0f8 100%)',
  label: 'Pink Tulip',
  sky:   ['#0d0620','#1e0a40','#3a1055','#7a2060','#c04070','#e87050','#ffc090'],
  dotActive: 'pink',
};
const WHITE_PALETTE = {
  back:  ['#ffffff','#f0e8f8','#c8b8e0'],
  front: ['#fff8fc','#ede0f4','#b8a0d0'],
  ctr:   ['#ffffff','#e8e0f4','#c0b0d8'],
  halo:  'rgba(220,200,255,0.15)',
  name:  'linear-gradient(135deg,#ffffff 0%,#ede0f8 40%,#c8b0e8 70%,#ffffff 100%)',
  label: 'White Tulip',
  sky:   ['#0a0820','#180a3a','#2c0e58','#5a2060','#9a4888','#d07080','#ffd0b0'],
  dotActive: 'white',
};

/* Gradient stop element IDs */
const GRAD_IDS = {
  back:  ['opb0','opb1','opb2'],
  front: ['opf0','opf1','opf2'],
  ctr:   ['opc0','opc1','opc2'],
};

let currentPalette  = PINK_PALETTE;
let isAnimating     = false;
let autoInterval    = null;
let opPetalInterval = null;
let gardenVisible   = false;
let trailCounter    = 0;

/* ── Apply palette (FIX: use setAttribute only — no CSS transition on SVG stops) ── */
function applyPalette(pal) {
  /* SVG gradient stops — setAttribute, no CSS transition */
  Object.keys(GRAD_IDS).forEach(function(key) {
    var colors = pal[key];
    GRAD_IDS[key].forEach(function(id, i) {
      var el = document.getElementById(id);
      if (el) el.setAttribute('stop-color', colors[i]);
    });
  });

  /* Halo fill */
  var halo = document.getElementById('op-halo');
  if (halo) halo.setAttribute('fill', pal.halo);

  /* Name gradient */
  var nameEl = document.getElementById('op-name');
  if (nameEl) {
    nameEl.style.background = pal.name;
    nameEl.style.backgroundSize = '200% 200%';
    nameEl.style.webkitBackgroundClip = 'text';
    nameEl.style.backgroundClip = 'text';
    nameEl.style.webkitTextFillColor = 'transparent';
  }

  /* Mode label */
  var lbl = document.getElementById('op-mode-label');
  if (lbl) {
    lbl.style.opacity = '0';
    setTimeout(function() {
      lbl.textContent = pal.label;
      lbl.style.opacity = '1';
    }, 300);
  }

  /* Active dot */
  document.querySelectorAll('.color-dot').forEach(function(d) {
    d.classList.remove('active');
  });
  var activeDot = document.querySelector('.color-dot.' + pal.dotActive);
  if (activeDot) activeDot.classList.add('active');

  /* Opening sky */
  var opSky = document.getElementById('op-sky');
  if (opSky) {
    var s = pal.sky;
    opSky.style.background =
      'linear-gradient(160deg,' + s[0] + ' 0%,' + s[1] + ' 18%,' + s[2] + ' 35%,' +
      s[3] + ' 55%,' + s[4] + ' 72%,' + s[5] + ' 88%,' + s[6] + ' 100%)';
  }
}

function toggleColor() {
  if (isAnimating) return;
  isAnimating = true;
  currentPalette = (currentPalette === PINK_PALETTE) ? WHITE_PALETTE : PINK_PALETTE;
  applyPalette(currentPalette);

  /* Bloom scale pulse */
  var bloom = document.getElementById('op-bloom');
  if (bloom) {
    bloom.style.transition = 'transform .3s cubic-bezier(.34,1.56,.64,1)';
    bloom.style.transform = 'scale(1.08)';
    setTimeout(function() { bloom.style.transform = 'scale(1)'; }, 300);
  }
  setTimeout(function() { isAnimating = false; }, 800);
}

/* Auto-toggle every 2.8 s */
autoInterval = setInterval(toggleColor, 2800);

/* Dot click handlers */
document.querySelectorAll('.color-dot').forEach(function(dot) {
  dot.addEventListener('click', function(e) {
    e.stopPropagation();
    var targetPal = dot.classList.contains('pink') ? PINK_PALETTE : WHITE_PALETTE;
    if (currentPalette !== targetPal) {
      clearInterval(autoInterval);
      currentPalette = targetPal;
      applyPalette(currentPalette);
      autoInterval = setInterval(toggleColor, 2800);
    }
  });
});

/* ═══════════════════════════════════════════════════════════
   OPENING CANVAS PARTICLES
═══════════════════════════════════════════════════════════ */
var opCanvas = document.getElementById('op-particles');
var opCtx    = opCanvas.getContext('2d');
var opW = 0, opH = 0;
var opParticles = [];
var opRafId = null;

function resizeOpCanvas() {
  opW = opCanvas.width  = window.innerWidth;
  opH = opCanvas.height = window.innerHeight;
}
resizeOpCanvas();
window.addEventListener('resize', resizeOpCanvas);

/* Spawn 80 particles using opW/opH */
for (var _i = 0; _i < 80; _i++) {
  opParticles.push({
    x:     Math.random() * opW,
    y:     Math.random() * opH,
    r:     0.5 + Math.random() * 2.5,
    vy:    -0.1 - Math.random() * 0.4,
    vx:    (Math.random() - 0.5) * 0.25,
    alpha: 0.1 + Math.random() * 0.5,
    phase: Math.random() * Math.PI * 2,
    speed: 0.005 + Math.random() * 0.015,
    hue:   Math.random() > 0.5 ? 340 : 280,
  });
}

function drawOpParticles() {
  opCtx.clearRect(0, 0, opW, opH);
  var now = Date.now();
  opParticles.forEach(function(p) {
    p.y += p.vy;
    p.x += p.vx + Math.sin(now * p.speed + p.phase) * 0.3;
    if (p.y < -10) { p.y = opH + 10; p.x = Math.random() * opW; }
    if (p.x < 0)  p.x = opW;
    if (p.x > opW) p.x = 0;
    var pulse = Math.abs(Math.sin(now * p.speed * 2 + p.phase));
    var a = p.alpha * (0.4 + 0.6 * pulse);
    opCtx.beginPath();
    opCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    opCtx.fillStyle   = 'hsla(' + p.hue + ',80%,80%,' + a + ')';
    opCtx.shadowBlur  = 8;
    opCtx.shadowColor = 'hsla(' + p.hue + ',100%,75%,' + (a * 0.5) + ')';
    opCtx.fill();
  });
  if (!gardenVisible) opRafId = requestAnimationFrame(drawOpParticles);
}
opRafId = requestAnimationFrame(drawOpParticles);

/* Opening emoji petals */
function spawnOpPetal() {
  var pet = document.createElement('div');
  var dur = 7 + Math.random() * 8;
  var rot = (Math.random() > 0.5 ? 1 : -1) * (300 + Math.random() * 360);
  var drift = (Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 50);
  pet.style.cssText =
    'position:fixed;z-index:4999;pointer-events:none;' +
    'left:' + (Math.random() * 100) + '%;top:-30px;' +
    'font-size:' + (14 + Math.random() * 16) + 'px;' +
    'opacity:0;' +
    '--dur:' + dur + 's;--del:0s;' +
    '--rot:' + rot + 'deg;--drift:' + drift + 'px;' +
    'animation:petalFall ' + dur + 's ease-in ' + (Math.random() * 2) + 's 1 forwards;';
  pet.textContent = Math.random() > 0.5 ? '🌷' : '🌸';
  document.body.appendChild(pet);
  setTimeout(function() { if (pet.parentNode) pet.parentNode.removeChild(pet); }, 17000);
}
opPetalInterval = setInterval(spawnOpPetal, 600);

/* ═══════════════════════════════════════════════════════════
   UNIFIED CURSOR + SPARKLE TRAIL
   (single mousemove listener handles both pages)
═══════════════════════════════════════════════════════════ */
var cursor = document.getElementById('cursor');

document.addEventListener('mousemove', function(e) {
  /* Always track cursor position */
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';

  /* Sparkle trail */
  trailCounter++;
  var threshold = gardenVisible ? 4 : 3;
  if (trailCounter % threshold !== 0) return;

  var sp   = document.createElement('div');
  var size = (gardenVisible ? 3 : 2) + Math.random() * (gardenVisible ? 5 : 4);
  var col  = 'rgba(248,176,200,' + (0.4 + Math.random() * 0.4) + ')';
  sp.style.cssText =
    'position:fixed;left:' + e.clientX + 'px;top:' + e.clientY + 'px;' +
    'width:' + size + 'px;height:' + size + 'px;border-radius:50%;' +
    'background:' + col + ';' +
    'box-shadow:0 0 ' + (size * 2) + 'px ' + col + ';' +
    'transform:translate(-50%,-50%);pointer-events:none;z-index:99998;' +
    'transition:opacity .7s,transform .7s;';
  document.body.appendChild(sp);
  requestAnimationFrame(function() {
    sp.style.opacity   = '0';
    sp.style.transform =
      'translate(' + (-50 + (Math.random() - 0.5) * 30) + '%,' +
      (-50 - 28) + '%)';
  });
  setTimeout(function() { if (sp.parentNode) sp.parentNode.removeChild(sp); }, 800);
});

/* ═══════════════════════════════════════════════════════════
   TRANSITION: OPENING → GARDEN
═══════════════════════════════════════════════════════════ */
function enterGarden() {
  if (gardenVisible) return;
  gardenVisible = true;

  clearInterval(autoInterval);
  clearInterval(opPetalInterval);
  autoInterval    = null;
  opPetalInterval = null;

  /* Stop particle loop */
  if (opRafId) { cancelAnimationFrame(opRafId); opRafId = null; }

  /* Fade out opening page */
  var opening = document.getElementById('opening');
  opening.classList.add('exit');
  setTimeout(function() { opening.classList.add('gone'); }, 1500);

  /* Fade in garden */
  var garden = document.getElementById('garden-page');
  garden.style.display = 'block';
  setTimeout(function() {
    garden.classList.add('visible');
    var hint = document.getElementById('hint');
    if (hint) hint.style.display = 'block';
    bootGarden();
  }, 400);
}

/* ═══════════════════════════════════════════════════════════
   GARDEN BOOT
═══════════════════════════════════════════════════════════ */
function bootGarden() {
  /* Stars */
  var starsEl = document.getElementById('stars');
  if (starsEl) {
    for (var i = 0; i < 200; i++) {
      var s  = document.createElement('div');
      s.className = 'star';
      var sz = 0.5 + Math.random() * 2.5;
      s.style.cssText =
        'left:' + (Math.random() * 100) + '%;' +
        'top:' + (Math.random() * 65) + '%;' +
        'width:' + sz + 'px;height:' + sz + 'px;' +
        '--d:' + (2 + Math.random() * 5) + 's;' +
        '--del:' + (Math.random() * 6) + 's;' +
        '--lo:' + (0.05 + Math.random() * 0.25) + ';' +
        '--hi:' + (0.4 + Math.random() * 0.6) + ';';
      starsEl.appendChild(s);
    }
  }

  /* Falling SVG petals */
  var petalsWrap  = document.getElementById('petals-wrap');
  var petalShapes = [
    '<svg width="24" height="32" viewBox="0 0 24 32"><ellipse cx="12" cy="16" rx="10" ry="14" fill="rgba(248,176,200,0.75)" transform="rotate(15,12,16)"/></svg>',
    '<svg width="20" height="28" viewBox="0 0 20 28"><ellipse cx="10" cy="14" rx="8" ry="12" fill="rgba(255,240,248,0.8)" transform="rotate(-10,10,14)"/></svg>',
    '<svg width="22" height="30" viewBox="0 0 22 30"><ellipse cx="11" cy="15" rx="9" ry="13" fill="rgba(240,180,210,0.7)" transform="rotate(25,11,15)"/></svg>',
    '<svg width="18" height="26" viewBox="0 0 18 26"><ellipse cx="9" cy="13" rx="7" ry="11" fill="rgba(255,255,255,0.65)" transform="rotate(-20,9,13)"/></svg>',
  ];
  if (petalsWrap) {
    for (var j = 0; j < 28; j++) {
      var p   = document.createElement('div');
      p.className = 'petal-fall';
      p.innerHTML = petalShapes[Math.floor(Math.random() * petalShapes.length)];
      var rot   = (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 360);
      var drift = (Math.random() > 0.5 ? 1 : -1) * (30 + Math.random() * 60);
      p.style.cssText =
        'left:' + (Math.random() * 100) + '%;top:0;' +
        '--dur:' + (7 + Math.random() * 10) + 's;' +
        '--del:' + (Math.random() * 12) + 's;' +
        '--rot:' + rot + 'deg;--drift:' + drift + 'px;';
      petalsWrap.appendChild(p);
    }
  }

  /* Fireflies */
  var ffWrap = document.getElementById('fireflies-wrap');
  if (ffWrap) {
    for (var k = 0; k < 18; k++) {
      var ff = document.createElement('div');
      ff.className = 'firefly';
      var fsz = 3 + Math.random() * 4;
      var fgw = 8 + Math.random() * 14;
      ff.style.cssText =
        'left:' + (5 + Math.random() * 90) + '%;' +
        'top:' + (20 + Math.random() * 60) + '%;' +
        '--sz:' + fsz + 'px;--gw:' + fgw + 'px;' +
        '--fdur:' + (5 + Math.random() * 8) + 's;' +
        '--fdel:' + (Math.random() * 8) + 's;' +
        '--mx:' + ((Math.random() - 0.5) * 80) + 'px;' +
        '--my:' + ((Math.random() - 0.5) * 80) + 'px;' +
        '--mx2:' + ((Math.random() - 0.5) * 60) + 'px;' +
        '--my2:' + ((Math.random() - 0.5) * 60) + 'px;' +
        '--mx3:' + ((Math.random() - 0.5) * 40) + 'px;' +
        '--my3:' + ((Math.random() - 0.5) * 40) + 'px;';
      ffWrap.appendChild(ff);
    }
  }

  /* Click burst on garden page */
  var burstEmojis = ['🌷','🌸','✨','💖','🌷','🌼','💝','🌷'];
  var gardenPage  = document.getElementById('garden-page');
  if (gardenPage) {
    gardenPage.addEventListener('click', function(e) {
      for (var b = 0; b < 8; b++) {
        (function(idx) {
          var bEl    = document.createElement('div');
          bEl.className = 'burst-petal';
          var angle  = (idx / 8) * Math.PI * 2;
          var dist   = 50 + Math.random() * 60;
          bEl.textContent = burstEmojis[idx];
          bEl.style.cssText =
            'left:' + e.clientX + 'px;top:' + e.clientY + 'px;' +
            '--bx:' + (Math.cos(angle) * dist) + 'px;' +
            '--by:' + (Math.sin(angle) * dist - 40) + 'px;' +
            '--br:' + ((Math.random() - 0.5) * 720) + 'deg;' +
            'animation-delay:' + (idx * 0.04) + 's;';
          document.body.appendChild(bEl);
          setTimeout(function() { if (bEl.parentNode) bEl.parentNode.removeChild(bEl); }, 1200);
        })(b);
      }
    });
  }

  /* Hide hint on first click */
  var hint = document.getElementById('hint');
  if (hint && gardenPage) {
    gardenPage.addEventListener('click', function() {
      hint.style.opacity    = '0';
      hint.style.transition = 'opacity 1s';
      setTimeout(function() { hint.style.display = 'none'; }, 1000);
    }, { once: true });
  }
}