// Bakeoff 1 — p5.js (v4.1 safe) : inner glow (no bleed), guards, visible version tag

let margin = 200;
const padding = 50;
const buttonSize = 40;

let trials = [];
let trialNum = 0;
let startTime = 0;
let finishTime = 0;
let hits = 0;
let misses = 0;

const numRepeats = 1;

function setup() {
  const canvas = createCanvas(700, 700);
  canvas.parent("sketch-holder");
  frameRate(120);
  noCursor();
  noStroke();
  textFont("Arial");
  textSize(16);
  textAlign(CENTER, BASELINE);

  // Build trials and shuffle
  for (let i = 0; i < 16; i++) for (let k = 0; k < numRepeats; k++) trials.push(i);
  shuffle(trials, true);

  console.log("p5 loaded: v4.1 safe");
}

function draw() {
  background(0);

  // version tag so you can verify it actually loaded
  push();
  fill(180);
  textAlign(RIGHT, TOP);
  text("v4.1 safe", width - 12, 10);
  pop();

  // If finished, show summary (use toFixed instead of nf)
  if (trialNum >= trials.length) {
    const timeTaken = (finishTime - startTime) / 1000;
    const acc = (hits + misses) > 0 ? (hits * 100.0) / (hits + misses) : 0;
    const penalty = constrain((95.0 - acc) * 0.2, 0, 100);
    const avg = (hits + misses) > 0 ? timeTaken / (hits + misses) : 0;

    fill(255);
    text("Finished!", width / 2, height / 2);
    text(`Hits: ${hits}`, width / 2, height / 2 + 20);
    text(`Misses: ${misses}`, width / 2, height / 2 + 40);
    text(`Accuracy: ${acc.toFixed(2)}%`, width / 2, height / 2 + 60);
    text(`Total time taken: ${timeTaken.toFixed(3)} sec`, width / 2, height / 2 + 80);
    text(`Average per button: ${avg.toFixed(3)} sec`, width / 2, height / 2 + 100);
    text(`Avg + penalty: ${(avg + penalty).toFixed(3)} sec`, width / 2, height / 2 + 120);

    drawCursorTriangle();
    return;
  }

  // Trial counter
  fill(255);
  text(`${trialNum + 1} of ${trials.length}`, 40, 20);

  // Draw grid
  for (let i = 0; i < 16; i++) drawButton(i);

  drawCursorTriangle();
}

function mousePressed() {
  if (trialNum >= trials.length) return;

  if (trialNum === 0) startTime = millis();
  if (trialNum === trials.length - 1) finishTime = millis();

  const target = trials[trialNum];
  const b = getButtonLocation(target);

  if (mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h) hits++;
  else misses++;

  trialNum++;
}

// ---- helpers ----
function getButtonLocation(i) {
  const x = (i % 4) * (padding + buttonSize) + margin;
  const y = Math.floor(i / 4) * (padding + buttonSize) + margin;
  return { x, y, w: buttonSize, h: buttonSize };
}

// Red/white concentric target + INNER glow (stacked insets, guaranteed inside)
function drawButton(i) {
  const b = getButtonLocation(i);
  push();
  noStroke();

  // stripes
  const layers = 5;
  for (let k = 0; k < layers; k++) {
    fill(k % 2 === 0 ? color(220, 0, 0) : color(255));
    const inset = k * (buttonSize / (layers * 2.0));
    rect(b.x + inset, b.y + inset, b.w - 2 * inset, b.h - 2 * inset);
  }

  // guard: only access trials[trialNum] if we still have trials left
  if (trialNum < trials.length && trials[trialNum] === i) {
    const t = frameCount * 0.15;

    // thinner, clean inner glow: gradient inward, no shadow/blur used
    const baseAlpha = map(Math.sin(t), -1, 1, 90, 150); // brightness pulse
    const steps = 8;           // number of inner layers
    const stepPx = 1.2;        // how fast we move inward each step

    for (let s = 0; s < steps; s++) {
      const a = baseAlpha * (1 - s / steps);    // fade toward center
      const inset = 0.75 + s * stepPx;          // always inside the edges
      noStroke();
      fill(255, 240, 0, a);
      rect(b.x + inset, b.y + inset, b.w - 2 * inset, b.h - 2 * inset);
    }

    // subtle inner border for crispness
    const sw = map(Math.sin(t), -1, 1, 1.5, 2.5);
    const borderInset = 2;
    noFill();
    stroke(255, 240, 0, 210);
    strokeWeight(sw);
    rect(b.x + borderInset, b.y + borderInset, b.w - 2 * borderInset, b.h - 2 * borderInset);
  }

  pop();
}

// 45° triangle cursor, balanced for 40px targets
function drawCursorTriangle() {
  push();
  translate(mouseX, mouseY);
  rotate(-Math.PI / 4);
  noStroke();
  fill(255, 0, 0, 220);
  const s = 22; // ~60% of button height
  triangle(0, 0, -s * 0.35, s, s * 0.35, s);
  pop();
}
