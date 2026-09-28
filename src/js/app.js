/**
 * Stomata Hour — teaching simulator of stomatal aperture.
 *
 * Guard cells open and close the pore in response to light, CO₂, and drought
 * (ABA). This is a didactic weighted-cue model, not a research-grade biophysics
 * engine: it illustrates directional physiology for learners.
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Constants & helpers
  // ---------------------------------------------------------------------------

  /** Ambient / pre-industrial-ish floor for the CO₂ slider (ppm). */
  var CO2_MIN = 280;
  /** Elevated greenhouse-ish ceiling for the CO₂ slider (ppm). */
  var CO2_MAX = 800;

  /** How quickly displayed aperture chases the model target (0–1 per frame). */
  var LERP_RATE = 0.08;

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function $(id) {
    return document.getElementById(id);
  }

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  var state = {
    /** Photosynthetic / blue-light drive, 0 (dark) → 1 (bright). */
    light: 0.65,
    /** Atmospheric CO₂ in ppm. */
    co2: 420,
    /** Drought / ABA cue, 0 (well watered) → 1 (severe drought). */
    drought: 0.15,
    /** UI mode: 'simple' | 'advanced'. */
    mode: 'simple',
    /** Smoothed aperture shown on canvas, 0 (shut) → 1 (wide open). */
    aperture: 0.5,
    /** Instantaneous model target before smoothing. */
    targetAperture: 0.5,
  };

  // ---------------------------------------------------------------------------
  // Teaching model
  // ---------------------------------------------------------------------------

  /**
   * Derive a 0–1 aperture target from the three main cues.
   *
   * Higher light opens (especially via a blue-light phototropin proxy).
   * Higher CO₂ closes. Higher drought/ABA closes. Weights are pedagogical.
   */
  function computeTarget() {
    var light = state.light;
    // Emphasize blue-light phototropin cue in the mid-to-high light band.
    var phototropin = clamp(light * light * 0.55 + light * 0.45, 0, 1);

    // Map CO₂ so ambient ~420 ppm is neutral-ish; high CO₂ suppresses opening.
    var co2Norm = (state.co2 - CO2_MIN) / (CO2_MAX - CO2_MIN);
    var co2Close = clamp(co2Norm, 0, 1);

    var aba = clamp(state.drought, 0, 1);

    // Weighted teaching blend: light opens; CO₂ and ABA close.
    // Baseline ~0.35 so a dim, ambient, watered leaf is partly open.
    var raw =
      0.35 +
      0.55 * phototropin -
      0.28 * co2Close -
      0.42 * aba;

    return clamp(raw, 0.02, 0.98);
  }

  /**
   * Advanced readouts derived from the same cues (proxies, not lab sensors).
   */
  function advancedMetrics(target) {
    var light = state.light;
    var phototropin = clamp(light * light * 0.55 + light * 0.45, 0, 1);
    var aba = clamp(state.drought, 0, 1);
    // Guard-cell turgor proxy tracks aperture with a soft lag feel.
    var turgor = clamp(0.15 + target * 0.8 - aba * 0.1, 0, 1);
    // Soil-moisture proxy is inverse of drought; VPD rises as drought rises.
    var soilMoisture = clamp(1 - aba, 0, 1);
    var vpdProxy = clamp(0.2 + aba * 0.75 + (1 - light) * 0.05, 0, 1);

    return {
      apertureIndex: target,
      turgor: turgor,
      phototropin: phototropin,
      aba: aba,
      co2: state.co2,
      soilMoisture: soilMoisture,
      vpd: vpdProxy,
    };
  }

  // ---------------------------------------------------------------------------
  // Live copy — full sentences only
  // ---------------------------------------------------------------------------

  function describeLight(light) {
    if (light < 0.2) {
      return 'Light is near darkness, so the blue-light phototropin cue is weak and opening drive is minimal.';
    }
    if (light < 0.45) {
      return 'Light is dim; phototropins provide a modest opening cue that only partly offsets closing signals.';
    }
    if (light < 0.75) {
      return 'Light is moderate to bright, and phototropin signaling encourages the pore to widen for photosynthesis.';
    }
    return 'Light is intense; a strong blue-light phototropin cue pushes hard toward an open aperture.';
  }

  function describeCo2(ppm) {
    if (ppm < 350) {
      return 'Carbon dioxide is low, near pre-industrial levels, which tends to favor a wider pore so the leaf can capture scarce CO₂.';
    }
    if (ppm < 480) {
      return 'Carbon dioxide sits near today’s ambient air; the CO₂-sensing pathway applies a mild closing bias.';
    }
    if (ppm < 650) {
      return 'Elevated carbon dioxide strengthens the closing cue, so the leaf needs less opening to meet photosynthetic demand.';
    }
    return 'Carbon dioxide is high; guard cells interpret that surplus as a reason to narrow the pore and conserve water.';
  }

  function describeDrought(d) {
    if (d < 0.2) {
      return 'Soil moisture is ample and ABA is low, so drought signaling is not forcing closure.';
    }
    if (d < 0.5) {
      return 'Mild drought is raising ABA; the hormone begins to pull the aperture shut to limit transpiration.';
    }
    if (d < 0.75) {
      return 'Drought stress is substantial; ABA signaling strongly promotes stomatal closure.';
    }
    return 'Severe drought keeps ABA high, and the pore stays tightly restricted to protect the plant’s water budget.';
  }

  function describeAperture(a) {
    if (a < 0.2) {
      return 'The stomatal pore is nearly closed: gas exchange and water loss are both tightly limited.';
    }
    if (a < 0.45) {
      return 'The pore is partly open, balancing a bit of CO₂ uptake against moderate water loss.';
    }
    if (a < 0.7) {
      return 'The aperture is moderately open, favoring photosynthesis while still metering transpiration.';
    }
    return 'The pore is wide open, maximizing CO₂ intake at the cost of higher evaporative demand.';
  }

  function updateCopy() {
    var el = $('live-copy');
    if (!el) return;
    var a = state.aperture;
    var sentences = [
      describeAperture(a),
      describeLight(state.light),
      describeCo2(state.co2),
      describeDrought(state.drought),
    ];
    if (state.mode === 'advanced') {
      var m = advancedMetrics(state.targetAperture);
      sentences.push(
        'In the advanced view, the aperture index is ' +
          m.apertureIndex.toFixed(2) +
          ', guard-cell turgor proxy reads ' +
          m.turgor.toFixed(2) +
          ', and the phototropin cue sits at ' +
          m.phototropin.toFixed(2) +
          ' while ABA is ' +
          m.aba.toFixed(2) +
          '.'
      );
    }
    el.textContent = sentences.join(' ');
  }

  // ---------------------------------------------------------------------------
  // Advanced panel readouts
  // ---------------------------------------------------------------------------

  function setMeter(id, value01) {
    var fill = $(id);
    if (fill) fill.style.width = clamp(value01, 0, 1) * 100 + '%';
  }

  function setText(id, text) {
    var el = $(id);
    if (el) el.textContent = text;
  }

  function updateAdvancedUI() {
    var panel = $('advanced-panel');
    if (!panel) return;
    var show = state.mode === 'advanced';
    panel.classList.toggle('hidden', !show);
    panel.setAttribute('aria-hidden', show ? 'false' : 'true');

    if (!show) return;

    var m = advancedMetrics(state.targetAperture);
    setMeter('meter-aperture', m.apertureIndex);
    setMeter('meter-turgor', m.turgor);
    setMeter('meter-photo', m.phototropin);
    setMeter('meter-aba', m.aba);
    setMeter('meter-soil', m.soilMoisture);
    setMeter('meter-vpd', m.vpd);

    setText('val-aperture', m.apertureIndex.toFixed(2));
    setText('val-turgor', m.turgor.toFixed(2));
    setText('val-photo', m.phototropin.toFixed(2));
    setText('val-aba', m.aba.toFixed(2));
    setText('val-co2', Math.round(m.co2) + ' ppm');
    setText('val-soil', (m.soilMoisture * 100).toFixed(0) + '%');
    setText('val-vpd', m.vpd.toFixed(2));
  }

  // ---------------------------------------------------------------------------
  // Canvas — epidermal pore with twin kidney-shaped guard cells
  // ---------------------------------------------------------------------------

  var canvas = null;
  var ctx = null;
  var dpr = 1;

  function sizeCanvas() {
    if (!canvas) return;
    var rect = canvas.getBoundingClientRect();
    var w = Math.max(1, Math.floor(rect.width));
    var h = Math.max(1, Math.floor(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /**
   * Draw a kidney / sausage guard cell as a thick curved stroke between arcs.
   */
  function drawGuardCell(cx, cy, rx, ry, side, aperture) {
    // side: -1 left, +1 right. Wider aperture pushes cells farther apart.
    var gap = 6 + aperture * Math.min(rx, 48);
    var ox = side * gap;
    ctx.save();
    ctx.translate(cx + ox, cy);

    // Outer lobe
    ctx.beginPath();
    ctx.ellipse(side * rx * 0.15, 0, rx, ry, 0, 0, Math.PI * 2);
    var grad = ctx.createRadialGradient(
      side * rx * 0.1,
      -ry * 0.2,
      ry * 0.1,
      0,
      0,
      rx
    );
    grad.addColorStop(0, '#4bb87a');
    grad.addColorStop(0.45, '#2a5c40');
    grad.addColorStop(1, '#134830');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(61, 122, 86, 0.85)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Inner wall facing the pore (slightly darker lip)
    ctx.beginPath();
    ctx.ellipse(side * rx * -0.05, 0, rx * 0.55, ry * 0.78, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(12, 26, 20, 0.35)';
    ctx.fill();

    // Chloroplast dots
    ctx.fillStyle = 'rgba(47, 154, 98, 0.55)';
    for (var i = 0; i < 5; i++) {
      var a = (i / 5) * Math.PI * 2 + side * 0.4;
      var px = Math.cos(a) * rx * 0.45 + side * rx * 0.1;
      var py = Math.sin(a) * ry * 0.5;
      ctx.beginPath();
      ctx.arc(px, py, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawScene() {
    if (!ctx || !canvas) return;
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    if (w < 2 || h < 2) return;

    var a = state.aperture;
    var cx = w * 0.5;
    var cy = h * 0.52;

    // Background — epidermal tissue
    var bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#0c1a14');
    bg.addColorStop(0.5, '#102018');
    bg.addColorStop(1, '#0a1410');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Soft epidermal cell outlines (decorative)
    ctx.strokeStyle = 'rgba(154, 181, 168, 0.08)';
    ctx.lineWidth = 1;
    var cellR = Math.min(w, h) * 0.14;
    for (var row = -1; row <= 2; row++) {
      for (var col = -2; col <= 2; col++) {
        if (row === 0 && Math.abs(col) <= 1) continue;
        var ex = cx + col * cellR * 1.7 + (row % 2) * cellR * 0.85;
        var ey = cy + row * cellR * 1.35 - h * 0.05;
        ctx.beginPath();
        ctx.ellipse(ex, ey, cellR * 0.95, cellR * 0.7, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Substomatal cavity / leaf interior hint beneath the pore
    var cavityH = 18 + a * 36;
    var cavityW = 14 + a * 52;
    var cavityGrad = ctx.createRadialGradient(cx, cy + 8, 2, cx, cy + 10, cavityW);
    cavityGrad.addColorStop(0, 'rgba(6, 16, 12, 0.95)');
    cavityGrad.addColorStop(0.7, 'rgba(19, 72, 48, 0.35)');
    cavityGrad.addColorStop(1, 'rgba(16, 32, 24, 0)');
    ctx.fillStyle = cavityGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy + cavityH * 0.15, cavityW, cavityH, 0, 0, Math.PI * 2);
    ctx.fill();

    // Guard cells — size scales with canvas
    var rx = Math.min(w, h) * 0.16;
    var ry = Math.min(w, h) * 0.28;
    drawGuardCell(cx, cy, rx, ry, -1, a);
    drawGuardCell(cx, cy, rx, ry, 1, a);

    // Pore slit (dark opening between guards)
    var poreW = 3 + a * Math.min(w * 0.12, 56);
    var poreH = ry * (0.55 + a * 0.25);
    ctx.beginPath();
    ctx.ellipse(cx, cy, poreW, poreH, 0, 0, Math.PI * 2);
    var poreGrad = ctx.createLinearGradient(cx, cy - poreH, cx, cy + poreH);
    poreGrad.addColorStop(0, '#06100c');
    poreGrad.addColorStop(0.5, '#020806');
    poreGrad.addColorStop(1, '#0a1812');
    ctx.fillStyle = poreGrad;
    ctx.fill();

    // Soft light rays through open pore
    if (a > 0.15) {
      var glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, poreW * 3);
      glow.addColorStop(0, 'rgba(232, 200, 74, ' + (0.08 + a * 0.12) + ')');
      glow.addColorStop(0.5, 'rgba(107, 159, 215, ' + (0.04 + a * 0.06) + ')');
      glow.addColorStop(1, 'rgba(232, 200, 74, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, poreW * 3.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Caption strip
    ctx.fillStyle = 'rgba(230, 240, 234, 0.55)';
    ctx.font = '500 11px "IBM Plex Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      'Epidermal pore · aperture ' + (a * 100).toFixed(0) + '%',
      cx,
      h - 16
    );
  }

  // ---------------------------------------------------------------------------
  // Controls
  // ---------------------------------------------------------------------------

  function syncSlidersFromState() {
    var lightEl = $('ctrl-light');
    var co2El = $('ctrl-co2');
    var droughtEl = $('ctrl-drought');
    if (lightEl) lightEl.value = String(Math.round(state.light * 100));
    if (co2El) co2El.value = String(Math.round(state.co2));
    if (droughtEl) droughtEl.value = String(Math.round(state.drought * 100));
    setText('label-light', Math.round(state.light * 100) + '%');
    setText('label-co2', Math.round(state.co2) + ' ppm');
    setText('label-drought', Math.round(state.drought * 100) + '%');
  }

  function setMode(mode) {
    state.mode = mode === 'advanced' ? 'advanced' : 'simple';
    var simpleBtn = $('mode-simple');
    var advBtn = $('mode-advanced');
    if (simpleBtn) {
      simpleBtn.classList.toggle('on', state.mode === 'simple');
      simpleBtn.setAttribute('aria-pressed', state.mode === 'simple' ? 'true' : 'false');
    }
    if (advBtn) {
      advBtn.classList.toggle('on', state.mode === 'advanced');
      advBtn.setAttribute('aria-pressed', state.mode === 'advanced' ? 'true' : 'false');
    }
    updateAdvancedUI();
    updateCopy();
  }

  function bindControls() {
    var lightEl = $('ctrl-light');
    var co2El = $('ctrl-co2');
    var droughtEl = $('ctrl-drought');

    if (lightEl) {
      lightEl.addEventListener('input', function () {
        state.light = clamp(Number(lightEl.value) / 100, 0, 1);
        setText('label-light', Math.round(state.light * 100) + '%');
        state.targetAperture = computeTarget();
        updateCopy();
        updateAdvancedUI();
      });
    }
    if (co2El) {
      co2El.addEventListener('input', function () {
        state.co2 = clamp(Number(co2El.value), CO2_MIN, CO2_MAX);
        setText('label-co2', Math.round(state.co2) + ' ppm');
        state.targetAperture = computeTarget();
        updateCopy();
        updateAdvancedUI();
      });
    }
    if (droughtEl) {
      droughtEl.addEventListener('input', function () {
        state.drought = clamp(Number(droughtEl.value) / 100, 0, 1);
        setText('label-drought', Math.round(state.drought * 100) + '%');
        state.targetAperture = computeTarget();
        updateCopy();
        updateAdvancedUI();
      });
    }

    var simpleBtn = $('mode-simple');
    var advBtn = $('mode-advanced');
    if (simpleBtn) {
      simpleBtn.addEventListener('click', function () {
        setMode('simple');
      });
    }
    if (advBtn) {
      advBtn.addEventListener('click', function () {
        setMode('advanced');
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Animation loop
  // ---------------------------------------------------------------------------

  function frame() {
    state.targetAperture = computeTarget();
    state.aperture = lerp(state.aperture, state.targetAperture, LERP_RATE);
    // Snap when very close to avoid endless sub-pixel chatter
    if (Math.abs(state.aperture - state.targetAperture) < 0.001) {
      state.aperture = state.targetAperture;
    }
    drawScene();
    // Refresh advanced meters / copy at a lower visual cadence via lerp motion
    if (state.mode === 'advanced') updateAdvancedUI();
    requestAnimationFrame(frame);
  }

  // ---------------------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------------------

  function init() {
    canvas = $('stomata-canvas');
    if (canvas) {
      ctx = canvas.getContext('2d');
      sizeCanvas();
      window.addEventListener('resize', function () {
        sizeCanvas();
        drawScene();
      });
    }

    state.targetAperture = computeTarget();
    state.aperture = state.targetAperture;
    syncSlidersFromState();
    bindControls();
    setMode(state.mode);
    updateCopy();
    updateAdvancedUI();
    requestAnimationFrame(frame);

    // Progressive Web App: register service worker when supported.
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('./sw.js').catch(function () {
          /* offline shell is optional; ignore registration failures */
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
