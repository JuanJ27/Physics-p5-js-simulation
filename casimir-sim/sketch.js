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

function setup() {
  const controlsParent = select("#controls");

  createControlRow(controlsParent, "Oscillation", (row) => {
    startStopButton = createButton("Start oscillation").parent(row);
    startStopButton.mousePressed(toggleOscillation);
  });

  createControlRow(controlsParent, "Motion mode", (row) => {
    acceleratedSelect = createSelect().parent(row);
    acceleratedSelect.option("Non-accelerated (constant frequency)", "no");
    acceleratedSelect.option("Accelerated (frequency increases)", "yes");
    acceleratedSelect.changed(() => {
      state.acceleratedMode = acceleratedSelect.value() === "yes";
      state.elapsedS = 0;
    });
  });

  createControlRow(controlsParent, "Speed multiplier", (row) => {
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
  background(11, 14, 28);

  noStroke();
  for (let i = 0; i < 150; i += 1) {
    fill(255, 255, 255, 16);
    circle((i * 91) % width, (i * 61) % height, 1.5);
  }
}

function drawMirrors() {
  const leftX = scene.leftMirrorX;
  const rightX = leftX + scene.mirrorThickness + state.gapPx;
  const topY = scene.centerY - scene.mirrorHeight / 2;

  fill(172, 196, 242);
  stroke(220, 235, 255);
  strokeWeight(2);
  rect(leftX, topY, scene.mirrorThickness, scene.mirrorHeight, 3);
  rect(rightX, topY, scene.mirrorThickness, scene.mirrorHeight, 3);

  noStroke();
  fill(235);
  textAlign(CENTER, BOTTOM);
  textSize(12);
  text("Fixed mirror", leftX + scene.mirrorThickness / 2, topY - 8);
  text("Oscillating mirror", rightX + scene.mirrorThickness / 2, topY - 8);
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

  for (let i = 0; i < photonCount; i += 1) {
    const waveOffset = i * 0.4 + frameCount * 0.08;
    const yCenter = scene.centerY - 95 + (i % 11) * 18;

    stroke(255, 240, 120, baseAlpha);
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
  fill(255, 244, 170, 210);
  textAlign(CENTER, TOP);
  textSize(12);
  text("Dynamic Casimir light inside the cavity", (leftInnerX + rightInnerX) / 2, scene.centerY + 103);
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
  text(`Cavity gap ≈ ${state.gapPx.toFixed(0)} px`, (leftInnerX + rightInnerX) / 2, y - 10);
}

function drawLegend() {
  const speedAbs = abs(state.rightMirrorVelocityPxS);

  noStroke();
  fill(255);
  textAlign(LEFT, TOP);
  textSize(15);
  text("Dynamic model quantities (qualitative):", 24, 286);
  textSize(13);
  text(`Oscillating: ${state.isOscillating ? "Yes" : "No"}`, 24, 311);
  text(`Mode: ${state.acceleratedMode ? "Accelerated" : "Non-accelerated"}`, 24, 330);
  text(`Mirror speed (|v|): ${speedAbs.toFixed(1)} px/s`, 24, 349);
  text(`Light intensity (normalized): ${state.brightness.toFixed(3)}`, 24, 368);
}

function toggleOscillation() {
  state.isOscillating = !state.isOscillating;
  state.elapsedS = 0;
  startStopButton.html(state.isOscillating ? "Stop oscillation" : "Start oscillation");
}
