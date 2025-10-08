// Bakeoff 1 — p5.js port with clipped glow & 45° triangle cursor

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

  // trial order 0..15, repeated
  for (let i = 0; i < 16; i++) {
    for (let k = 0; k < numRepeats; k++) trials.push(i);
  }
  shuffle(trials, true);
}

function draw() {
  background(0);

  if (trialNum >= trials.length) {
    const timeTaken = (finishTime - startTime) / 1000;
    const acc = hits + misses > 0 ? (hits * 100.0) / (hits + misses) : 0;
    const penalty = constrain((95.0 - acc) * 0.2, 0, 100);

    fill(255);
    text("Finished!", width / 2, height / 2);
    text(`Hits: ${hits}`, width / 2, height / 2 + 20);
    text(`Misses: ${misses}`, width / 2, height / 2 + 40);
    text(`Accuracy: ${nf(acc, 1, 2)}%`, width / 2, height / 2 + 60);
    text(`Total time taken: ${nf(timeTaken, 1, 3)} sec`, width / 2, height / 2 + 80);
    const avg = (hits + misses) > 0 ? timeTaken / (hits + misses) : 0;
    text(`Average per button: ${nf(avg, 1, 3)} sec`, width / 2, height / 2 + 100);
    text(`Avg + penalty: ${nf(avg + penalty, 1, 3)} sec`, width / 2, height / 2 + 120);

    drawCursorTriangle();
    return;
  }

  fill(255);
  text(`${trialNum + 1} of ${trials.length}`, 40, 20);

  for (let i = 0; i < 16; i++) drawButton(i);

  drawCursorTriangle();
}

function mousePressed() {
  if (trialNum >= trials.length) return;

  if (trialNum === 0) startTime = millis();
  if (trialNum === trials.length - 1) finishTime = millis();

  const target = trials[trialNum];
  const b = getButtonLocation(target);

  if (mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h) {
    hits++;
  } else {
    misses++;
  }

  trialNum++;
}

// ============ helpers ============

function getButtonLocation(i) {
  const x = (i % 4) * (padding + buttonSize) + margin;
  const y = floor(i / 4) * (padding + buttonSize) + margin;
  return { x, y, w: buttonSize, h: buttonSize };
}

// Red/white concentric target + CLIPPED animated glow
function drawButton(i) {
  const b = getButtonLocation(i);

  push();
  noStroke();

  // concentric “stripes”
  const layers = 5; // odd → red center
  for (let k = 0; k < layers; k++) {
    fill(k % 2 === 0 ? color(220, 0, 0) : color(255));
    const inset = k * (buttonSize / (layers * 2.0));
    rect(b.x + inset, b.y + inset, b.w - 2 * inset, b.h - 2 * inset);
  }

  // highlight active target (CLIPPED to square)
  if (trials[trialNum] === i) {
    const t = frameCount * 0.15;

    // gentle pulse values
    const glowAlpha = map(Math.sin(t), -1, 1, 60, 140);
    const blur       = map(Math.sin(t), -1, 1, 2, 8);
    const innerSW    = map(Math.sin(t), -1, 1, 1, 3);

    // clip to button rect, so nothing spills outside
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.rect(b.x, b.y, b.w, b.h);
    drawingContext.clip();

    // soft inner glow (blurred fill), stays inside due to clipping
    drawingContext.shadowColor = `rgba(255,240,0,${glowAlpha/255})`;
    drawingContext.shadowBlur  = blur;
    noStroke();
    fill(255, 240, 0, glowAlpha);
    rect(b.x, b.y, b.w, b.h);

    // inner pulsing border (slightly inset)
    drawingContext.shadowBlur = 0;
    noFill();
    stroke(255, 240, 0, 200);
    strokeWeight(innerSW);
    const inset = 1.5;
    rect(b.x + inset, b.y + inset, b.w - 2 * inset, b.h - 2 * inset);

    // unclip
    drawingContext.restore();
  }

  pop();
}

// 45° triangle cursor, sized to ~60% of a box for balance
function drawCursorTriangle() {
  push();
  translate(mouseX, mouseY);
  rotate(-PI / 4); // 45° pointer
  noStroke();
  fill(255, 0, 0, 220);
  const s = 22; // balanced size vs 40px squares
  triangle(0, 0, -s * 0.35, s, s * 0.35, s); // slightly narrower base for precision
  pop();
}
