let startStopButton;
let acceleratedSelect;
let speedSlider;

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
  drawLegend();
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

  const pulse = map(sin(frameCount * 0.01), -1, 1, 0.35, 1.0);
  const glowStrength = map(state.brightness, 0, 1, 18, 74) * pulse;
  fill(85, 116, 236, 30 + glowStrength * 0.2);
  circle(width * 0.68, height * 0.15, 320);

  for (let i = 0; i < 170; i += 1) {
    const x = (i * 91) % width;
    const y = (i * 61 + 30) % height;
    const twinkle = 12 + ((frameCount + i * 9) % 80) / 4;
    const isA = i % 3 === 0;
    const c = isA ? palette.starA : palette.starB;
    fill(c[0], c[1], c[2], twinkle);
    circle(x, y, isA ? 1.8 : 1.2);
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
  const photonCount = floor(map(state.brightness, 0, 1, 5, 40));
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

  noStroke();
  fill(255, 245, 186, 220);
  textAlign(CENTER, TOP);
  textSize(12);
  text("Luz Casimir dinámica dentro de la cavidad", (leftInnerX + rightInnerX) / 2, scene.centerY + 103);
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
  text(`Separación de cavidad ≈ ${state.gapPx.toFixed(0)} px`, (leftInnerX + rightInnerX) / 2, y - 10);
}

function drawLegend() {
  const speedAbs = abs(state.rightMirrorVelocityPxS);

  noStroke();
  fill(240, 246, 255);
  textAlign(LEFT, TOP);
  textSize(15);
  text("Magnitudes del modelo dinámico (cualitativas):", 24, 286);
  textSize(13);
  text(`Oscilando: ${state.isOscillating ? "Sí" : "No"}`, 24, 311);
  text(`Modo: ${state.acceleratedMode ? "Acelerado" : "No acelerado"}`, 24, 330);
  text(`Rapidez del espejo (|v|): ${speedAbs.toFixed(1)} px/s`, 24, 349);
  text(`Intensidad de luz (normalizada): ${state.brightness.toFixed(3)}`, 24, 368);
}

function toggleOscillation() {
  state.isOscillating = !state.isOscillating;
  state.elapsedS = 0;
  startStopButton.html(state.isOscillating ? "Detener oscilación" : "Iniciar oscilación");
}
