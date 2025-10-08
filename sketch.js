// Bakeoff 1 — p5.js version with INNER glow (no clip/blur) & balanced triangle cursor (v4)

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

  for (let i = 0; i < 16; i++) for (let k = 0; k < numRepeats; k++) trials.push(i);
  shuffle(trials, true);
}

function draw() {
  background(0);

  // version tag (to verify cache)
  push();
  fill(180);
  textAlign(RIGHT, TOP);
  text("v4 inner", width - 12, 10);
  pop();

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

  if (mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h) hits++;
  else misses++;

  trialNum++;
}

// ---- helpers ----

function getButtonLocation(i) {
  const x = (i % 4) * (padding + buttonSize) + margin;
  const y = floor(i / 4) * (padding + buttonSize) + margin;
  return { x, y, w: buttonSize, h: buttonSize };
}

// Red/white concentric target + INNER glow (stacked insets, guaranteed inside)
function drawButton(i) {
  const
