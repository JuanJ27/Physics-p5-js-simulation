let startStopButton;
let acceleratedSelect;
let speedSlider;
const metricRefs = {};

const state = {
  baseSeparationPx: 320,
  minGapPx: 170,
  maxGapPx: 430,
  oscillationAmplitudePx: 85,
  baseFrequencyHz: 0.75,
  speedMultiplier: 1.0,
  acceleratedMode: false,
  isOscillating: true,
  elapsedS: 0,
  rightMirrorVelocityPxS: 0,
  gapPx: 320,
  brightness: 0,
  accelerationFactor: 1,
  emissionRate: 0,
};

const unitScale = {
  metersPerPixel: 2e-9,
};

const scene = {
  mirrorWidth: 24,
  mirrorHeight: 290,
  leftMirrorX: 210,
  centerY: 270,
  cavityHeight: 200,
};

const photonTrail = [];
const MAX_PHOTONS = 190;

function setup() {
  const controlsParent = select("#controls");

  createControlRow(controlsParent, "Oscilación", (row) => {
    startStopButton = createButton("Iniciar oscilación").parent(row);
    startStopButton.mousePressed(toggleOscillation);
  });

  createControlRow(controlsParent, "Modo", (row) => {
    acceleratedSelect = createSelect().parent(row);
    acceleratedSelect.option("No acelerado", "no");
    acceleratedSelect.option("Acelerado", "yes");
    acceleratedSelect.changed(() => {
      state.acceleratedMode = acceleratedSelect.value() === "yes";
      state.elapsedS = 0;
    });
  });

  createControlRow(controlsParent, "Rapidez", (row) => {
    speedSlider = createSlider(0.6, 3.0, state.speedMultiplier, 0.1).parent(row);
  });

  metricRefs.mode = document.getElementById("m-mode");
  metricRefs.gap = document.getElementById("m-gap");
  metricRefs.freq = document.getElementById("m-freq");
  metricRefs.intensity = document.getElementById("m-intensity");

  const canvas = createCanvas(920, 540);
  canvas.parent("canvas-wrap");

  textFont("Arial");
  startStopButton.html("Detener oscilación");
}

function createControlRow(parent, labelText, contentBuilder) {
  const row = createDiv("").parent(parent).class("control-row");
  createElement("label", labelText).parent(row);
  contentBuilder(row);
}

function draw() {
  const dt = deltaTime / 1000;
  state.speedMultiplier = speedSlider.value();

  updateOscillation(dt);
  drawBackground();
  drawCavityAndMirrors();
  drawVacuumWaves();
  updatePhotons(dt);
  drawPhotons();
  drawFocusLabels();
  updateMetricsPanel();
}

function updateOscillation(dt) {
  if (!state.isOscillating) {
    state.accelerationFactor = 1;
    state.rightMirrorVelocityPxS = 0;
    state.brightness = 0;
    state.emissionRate = 0;
    state.gapPx = state.baseSeparationPx;
    return;
  }

  state.elapsedS += dt;
  state.accelerationFactor = state.acceleratedMode
    ? 1 + Math.min(state.elapsedS * 0.75, 2.5)
    : 1;

  const omega = TWO_PI * state.baseFrequencyHz * state.speedMultiplier * state.accelerationFactor;
  const phase = state.elapsedS * omega;
  const displacement = sin(phase) * state.oscillationAmplitudePx;

  state.gapPx = constrain(
    state.baseSeparationPx + displacement,
    state.minGapPx,
    state.maxGapPx
  );

  state.rightMirrorVelocityPxS = cos(phase) * state.oscillationAmplitudePx * omega;
  const speedRatio = constrain(abs(state.rightMirrorVelocityPxS) / 1200, 0, 1);
  state.brightness = speedRatio;
  state.emissionRate = speedRatio * (state.acceleratedMode ? 1.35 : 1.0);
}

function getMirrorPositions() {
  const leftOuterX = scene.leftMirrorX;
  const leftInnerX = leftOuterX + scene.mirrorWidth;
  const rightInnerX = leftInnerX + state.gapPx;
  const rightOuterX = rightInnerX + scene.mirrorWidth;

  return {
    leftOuterX,
    leftInnerX,
    rightInnerX,
    rightOuterX,
    topY: scene.centerY - scene.mirrorHeight / 2,
    cavityTop: scene.centerY - scene.cavityHeight / 2,
    cavityBottom: scene.centerY + scene.cavityHeight / 2,
  };
}

function drawBackground() {
  const grad = drawingContext.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, "#121a3d");
  grad.addColorStop(1, "#0a1027");
  drawingContext.fillStyle = grad;
  drawingContext.fillRect(0, 0, width, height);

  const scanAlpha = map(state.brightness, 0, 1, 0.06, 0.14);
  noStroke();
  fill(120, 170, 255, 255 * scanAlpha);
  rect(0, scene.centerY - 130, width, 260);
}

function drawCavityAndMirrors() {
  const m = getMirrorPositions();
  const glowAlpha = map(state.brightness, 0, 1, 35, 170);

  noStroke();
  fill(118, 182, 255, glowAlpha);
  rect(m.leftInnerX, m.cavityTop, state.gapPx, scene.cavityHeight, 9);

  noFill();
  stroke(152, 206, 255, 190);
  strokeWeight(2);
  rect(m.leftInnerX, m.cavityTop, state.gapPx, scene.cavityHeight, 9);

  fill(128, 158, 250);
  stroke(208, 228, 255, 220);
  strokeWeight(1.2);
  rect(m.leftOuterX, m.topY, scene.mirrorWidth, scene.mirrorHeight, 5);
  rect(m.rightInnerX, m.topY, scene.mirrorWidth, scene.mirrorHeight, 5);

  noStroke();
  fill(220, 238, 255, 200);
  textAlign(CENTER, BOTTOM);
  textSize(13);
  text("Espejo fijo", m.leftOuterX + scene.mirrorWidth / 2, m.topY - 8);
  text("Espejo oscilante", m.rightInnerX + scene.mirrorWidth / 2, m.topY - 8);
}

function drawVacuumWaves() {
  if (!state.isOscillating) return;

  const m = getMirrorPositions();
  const layers = 5;

  for (let i = 0; i < layers; i += 1) {
    const yBase = map(i, 0, layers - 1, m.cavityTop + 22, m.cavityBottom - 22);
    const amp = 5 + state.brightness * 15 + i * 1.4;

    noFill();
    stroke(146, 206, 255, 95 + state.brightness * 120 - i * 10);
    strokeWeight(1.6);
    beginShape();
    for (let x = m.leftInnerX; x <= m.rightInnerX; x += 7) {
      const t = map(x, m.leftInnerX, m.rightInnerX, 0, TWO_PI * 2.2);
      const phase = frameCount * 0.075 + i * 0.7;
      vertex(x, yBase + sin(t + phase) * amp);
    }
    endShape();
  }
}

function updatePhotons(dt) {
  const m = getMirrorPositions();
  const spawnRate = map(state.emissionRate, 0, 1.35, 8, 95);
  const toSpawn = state.isOscillating ? floor(spawnRate * dt * 10) : 0;

  for (let i = 0; i < toSpawn; i += 1) {
    if (photonTrail.length >= MAX_PHOTONS) photonTrail.shift();
    photonTrail.push({
      x: random(m.leftInnerX + 8, m.rightInnerX - 8),
      y: random(m.cavityTop + 10, m.cavityBottom - 10),
      vx: random(-22, 22),
      vy: random(-18, 18),
      life: random(0.5, 1.2),
      ttl: random(0.5, 1.2),
      r: random(1.7, 3.8),
    });
  }

  for (let i = photonTrail.length - 1; i >= 0; i -= 1) {
    const p = photonTrail[i];
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    const insideX = p.x > m.leftInnerX + 2 && p.x < m.rightInnerX - 2;
    const insideY = p.y > m.cavityTop + 2 && p.y < m.cavityBottom - 2;
    if (!insideX || !insideY || p.life <= 0) {
      photonTrail.splice(i, 1);
    }
  }
}

function drawPhotons() {
  const m = getMirrorPositions();

  const coreAlpha = map(state.emissionRate, 0, 1.35, 40, 220);
  noStroke();
  fill(255, 226, 132, coreAlpha);
  ellipse((m.leftInnerX + m.rightInnerX) / 2, scene.centerY, 58 + state.brightness * 66);

  for (let i = 0; i < photonTrail.length; i += 1) {
    const p = photonTrail[i];
    const alpha = map(p.life / p.ttl, 0, 1, 0, 220);
    fill(255, 245, 190, alpha);
    ellipse(p.x, p.y, p.r * 2);
  }
}

function drawFocusLabels() {
  const m = getMirrorPositions();
  const gapMicrometers = pixelsToMeters(state.gapPx) * 1e6;
  const modeText = state.acceleratedMode ? "Modo acelerado" : "Modo no acelerado";
  const modeColor = state.acceleratedMode ? [255, 226, 146] : [178, 211, 255];

  stroke(235, 242, 255, 210);
  strokeWeight(1.3);
  const lineY = m.cavityBottom + 28;
  line(m.leftInnerX, lineY, m.rightInnerX, lineY);
  line(m.leftInnerX, lineY - 7, m.leftInnerX, lineY + 7);
  line(m.rightInnerX, lineY - 7, m.rightInnerX, lineY + 7);

  noStroke();
  fill(240, 247, 255, 230);
  textAlign(CENTER, BOTTOM);
  textSize(12);
  text(`Separación de cavidad ≈ ${gapMicrometers.toFixed(3)} µm`, (m.leftInnerX + m.rightInnerX) / 2, lineY - 10);

  fill(modeColor[0], modeColor[1], modeColor[2], 230);
  textSize(14);
  text("Vacío dinámico → luz emergente", width / 2, height - 18);
  textSize(12);
  text(modeText, width / 2, height - 2);
}

function updateMetricsPanel() {
  const gapNm = pixelsToMeters(state.gapPx) * 1e9;
  const effectiveFrequency = state.baseFrequencyHz * state.speedMultiplier * state.accelerationFactor;

  metricRefs.mode.textContent = state.acceleratedMode ? "Acelerado" : "No acelerado";
  metricRefs.gap.textContent = `${gapNm.toFixed(1)} nm`;
  metricRefs.freq.textContent = `${effectiveFrequency.toFixed(2)} Hz`;
  metricRefs.intensity.textContent = `${state.brightness.toFixed(3)}`;
}

function pixelsToMeters(px) {
  return px * unitScale.metersPerPixel;
}

function toggleOscillation() {
  state.isOscillating = !state.isOscillating;
  state.elapsedS = 0;
  if (!state.isOscillating) {
    photonTrail.length = 0;
  }
  startStopButton.html(state.isOscillating ? "Detener oscilación" : "Iniciar oscilación");
}
