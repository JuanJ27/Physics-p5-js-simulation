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
  isOscillating: false,
  elapsedS: 0,
  rightMirrorVelocityPxS: 0,
  gapPx: 320,
  brightness: 0,
  accelerationFactor: 1,
};

const unitScale = {
  metersPerPixel: 2e-9,
};

const scene = {
  leftMirrorX: 210,
  mirrorThickness: 18,
  mirrorHeight: 250,
  centerY: 195,
};

const palette = {
  bgTop: [8, 12, 28],
  bgBottom: [4, 7, 18],
  starA: [180, 205, 255],
  starB: [250, 250, 255],
  cavity: [124, 152, 255],
  photon: [255, 232, 136],
};

function setup() {
  const controlsParent = select("#controls");

  createControlRow(controlsParent, "Oscilación", (row) => {
    startStopButton = createButton("Iniciar oscilación").parent(row);
    startStopButton.mousePressed(toggleOscillation);
  });

  createControlRow(controlsParent, "Modo de movimiento", (row) => {
    acceleratedSelect = createSelect().parent(row);
    acceleratedSelect.option("No acelerado (frecuencia constante)", "no");
    acceleratedSelect.option("Acelerado (la frecuencia aumenta)", "yes");
    acceleratedSelect.changed(() => {
      state.acceleratedMode = acceleratedSelect.value() === "yes";
      state.elapsedS = 0;
    });
  });

  createControlRow(controlsParent, "Multiplicador de rapidez", (row) => {
    speedSlider = createSlider(0.6, 3.0, state.speedMultiplier, 0.1).parent(row);
  });

  metricRefs.state = document.getElementById("m-state");
  metricRefs.mode = document.getElementById("m-mode");
  metricRefs.gap = document.getElementById("m-gap");
  metricRefs.speed = document.getElementById("m-speed");
  metricRefs.freq = document.getElementById("m-freq");
  metricRefs.intensity = document.getElementById("m-intensity");

  const canvas = createCanvas(920, 390);
  canvas.parent("canvas-wrap");
  textFont("Arial");
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
  drawPhotons();
  drawMirrors();
  drawMeasurement();
  updateMetricsPanel();
}

function updateOscillation(dt) {
  if (!state.isOscillating) {
    state.rightMirrorVelocityPxS = 0;
    state.brightness = 0;
    state.gapPx = state.baseSeparationPx;
    return;
  }

  state.elapsedS += dt;

  const accelerationFactor = state.acceleratedMode
    ? 1 + Math.min(state.elapsedS * 0.75, 2.5)
    : 1;
  state.accelerationFactor = accelerationFactor;

  const omega = TWO_PI * state.baseFrequencyHz * state.speedMultiplier * accelerationFactor;
  const phase = state.elapsedS * omega;
  const displacement = sin(phase) * state.oscillationAmplitudePx;

  state.gapPx = constrain(
    state.baseSeparationPx + displacement,
    state.minGapPx,
    state.maxGapPx
  );

  state.rightMirrorVelocityPxS =
    cos(phase) * state.oscillationAmplitudePx * omega;

  const speedRatio = constrain(
    abs(state.rightMirrorVelocityPxS) / 1200,
    0,
    1
  );
  state.brightness = speedRatio;
}

function drawBackground() {
  const grad = drawingContext.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, `rgb(${palette.bgTop[0]}, ${palette.bgTop[1]}, ${palette.bgTop[2]})`);
  grad.addColorStop(1, `rgb(${palette.bgBottom[0]}, ${palette.bgBottom[1]}, ${palette.bgBottom[2]})`);
  drawingContext.fillStyle = grad;
  noStroke();
  rect(0, 0, width, height);

  const voidAlpha = map(state.brightness, 0, 1, 145, 70);
  fill(0, 0, 0, voidAlpha);
  rect(0, 0, width, height);

  for (let i = 0; i < 170; i += 1) {
    const x = (i * 91) % width;
    const y = (i * 61 + 30) % height;
    const twinkle = 12 + ((frameCount + i * 9) % 80) / 4;
    const isA = i % 3 === 0;
    const c = isA ? palette.starA : palette.starB;
    fill(c[0], c[1], c[2], twinkle);
    circle(x, y, isA ? 1.8 : 1.2);
  }

  if (state.isOscillating) {
    const vignetteAlpha = map(state.brightness, 0, 1, 12, 42);
    fill(8, 16, 48, vignetteAlpha);
    rect(0, 0, width, height);
  }
}

function drawMirrors() {
  const leftX = scene.leftMirrorX;
  const rightX = leftX + scene.mirrorThickness + state.gapPx;
  const topY = scene.centerY - scene.mirrorHeight / 2;

  drawCavityGlow(leftX + scene.mirrorThickness, rightX, topY);

  fill(146, 172, 238);
  stroke(225, 237, 255, state.isOscillating ? 255 : 210);
  strokeWeight(2);
  rect(leftX, topY, scene.mirrorThickness, scene.mirrorHeight, 3);
  rect(rightX, topY, scene.mirrorThickness, scene.mirrorHeight, 3);

  drawMirrorHighlights(leftX, rightX, topY);

  noStroke();
  fill(238, 243, 255);
  textAlign(CENTER, BOTTOM);
  textSize(12);
  text("Espejo fijo", leftX + scene.mirrorThickness / 2, topY - 8);
  text("Espejo oscilante", rightX + scene.mirrorThickness / 2, topY - 8);
}

function drawCavityGlow(leftInnerX, rightInnerX, topY) {
  const cavityHeight = scene.mirrorHeight;
  const cavityWidth = rightInnerX - leftInnerX;
  const intensity = map(state.brightness, 0, 1, 0.07, 0.42);
  const modeBoost = state.acceleratedMode ? 1.2 : 1.0;

  noStroke();
  fill(palette.cavity[0], palette.cavity[1], palette.cavity[2], 255 * intensity * modeBoost);
  rect(leftInnerX, topY, cavityWidth, cavityHeight, 4);

  fill(184, 210, 255, 28 + intensity * 130);
  rect(leftInnerX, topY + cavityHeight * 0.18, cavityWidth, cavityHeight * 0.64, 4);

  if (state.isOscillating) {
    noFill();
    stroke(123, 176, 255, 45 + state.brightness * 90);
    strokeWeight(1.4);
    for (let i = 0; i < 4; i += 1) {
      const y = topY + cavityHeight * (0.2 + i * 0.2);
      const phase = frameCount * 0.09 + i;
      beginShape();
      for (let x = leftInnerX; x <= rightInnerX; x += 7) {
        const t = map(x, leftInnerX, rightInnerX, 0, TWO_PI * 2);
        vertex(x, y + sin(t + phase) * (3 + state.brightness * 7));
      }
      endShape();
    }
  }
}

function drawMirrorHighlights(leftX, rightX, topY) {
  noStroke();
  fill(255, 255, 255, 55);
  rect(leftX + 2, topY + 4, 3, scene.mirrorHeight - 8, 2);
  rect(rightX + 2, topY + 4, 3, scene.mirrorHeight - 8, 2);

  fill(106, 130, 202, 105);
  rect(leftX + scene.mirrorThickness - 3, topY + 2, 2, scene.mirrorHeight - 4, 2);
  rect(rightX + scene.mirrorThickness - 3, topY + 2, 2, scene.mirrorHeight - 4, 2);
}

function drawPhotons() {
  if (!state.isOscillating) {
    return;
  }

  const leftInnerX = scene.leftMirrorX + scene.mirrorThickness;
  const rightInnerX = leftInnerX + state.gapPx;
  const photonCount = floor(map(state.brightness, 0, 1, 8, 52));
  const baseAlpha = map(state.brightness, 0, 1, 30, 220);
  const waveAmplitude = map(state.brightness, 0, 1, 4, 18);
  const glowAlpha = map(state.brightness, 0, 1, 10, 120);

  noStroke();
  fill(255, 218, 124, glowAlpha);
  ellipse((leftInnerX + rightInnerX) / 2, scene.centerY, state.gapPx * 0.9, scene.mirrorHeight * 0.72);

  for (let i = 0; i < photonCount; i += 1) {
    const waveOffset = i * 0.4 + frameCount * 0.08;
    const yCenter = scene.centerY - 95 + (i % 11) * 18;

    const hueBoost = state.acceleratedMode ? 15 : 0;
    stroke(palette.photon[0], palette.photon[1] + hueBoost, palette.photon[2], baseAlpha);
    strokeWeight(1.4);
    noFill();
    beginShape();
    for (let x = leftInnerX; x <= rightInnerX; x += 6) {
      const t = map(x, leftInnerX, rightInnerX, 0, TWO_PI * 2.2);
      const y = yCenter + sin(t + waveOffset) * waveAmplitude;
      vertex(x, y);
    }
    endShape();
  }

  const sparkCount = floor(map(state.brightness, 0, 1, 12, 95));
  noStroke();
  for (let i = 0; i < sparkCount; i += 1) {
    const x = random(leftInnerX + 4, rightInnerX - 4);
    const y = random(scene.centerY - 95, scene.centerY + 95);
    const r = random(0.9, 2.9);
    fill(255, 246, 186, random(70, 210));
    circle(x, y, r);
  }

  noFill();
  const cx = (leftInnerX + rightInnerX) / 2;
  const wavePulse = frameCount * 0.12;
  for (let i = 0; i < 3; i += 1) {
    const ringSize = state.gapPx * (0.44 + i * 0.27) + sin(wavePulse + i) * 10;
    stroke(142, 196, 255, 42 + state.brightness * 88 - i * 12);
    strokeWeight(1.2);
    ellipse(cx, scene.centerY, ringSize, ringSize * 0.45);
  }

  noStroke();
  fill(255, 245, 186, 220);
  textAlign(CENTER, TOP);
  textSize(12);
  text("Fluctuaciones del vacío → fotones efectivos", (leftInnerX + rightInnerX) / 2, scene.centerY + 103);
}

function drawMeasurement() {
  const leftInnerX = scene.leftMirrorX + scene.mirrorThickness;
  const rightInnerX = leftInnerX + state.gapPx;
  const y = scene.centerY + 130;

  stroke(245);
  strokeWeight(1.3);
  line(leftInnerX, y, rightInnerX, y);
  line(leftInnerX, y - 7, leftInnerX, y + 7);
  line(rightInnerX, y - 7, rightInnerX, y + 7);

  noStroke();
  fill(255);
  textAlign(CENTER, BOTTOM);
  textSize(13);
  const gapMicrometers = pixelsToMeters(state.gapPx) * 1e6;
  text(`Separación de cavidad ≈ ${gapMicrometers.toFixed(3)} µm`, (leftInnerX + rightInnerX) / 2, y - 10);
}

function updateMetricsPanel() {
  const speedMS = abs(pixelsToMeters(state.rightMirrorVelocityPxS));
  const speedMMs = speedMS * 1e3;
  const gapNm = pixelsToMeters(state.gapPx) * 1e9;
  const effectiveFrequency = state.baseFrequencyHz * state.speedMultiplier * state.accelerationFactor;

  metricRefs.state.textContent = state.isOscillating ? "Oscilando" : "Reposo";
  metricRefs.mode.textContent = state.acceleratedMode ? "Acelerado" : "No acelerado";
  metricRefs.gap.textContent = `${gapNm.toFixed(1)} nm`;
  metricRefs.speed.textContent = `${speedMMs.toFixed(4)} mm/s`;
  metricRefs.freq.textContent = `${effectiveFrequency.toFixed(2)} Hz`;
  metricRefs.intensity.textContent = `${state.brightness.toFixed(3)} (adimensional)`;
}

function pixelsToMeters(px) {
  return px * unitScale.metersPerPixel;
}

function toggleOscillation() {
  state.isOscillating = !state.isOscillating;
  state.elapsedS = 0;
  startStopButton.html(state.isOscillating ? "Detener oscilación" : "Iniciar oscilación");
}
