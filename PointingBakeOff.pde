import java.awt.AWTException;
import java.awt.Rectangle;
import java.awt.Robot;
import java.util.ArrayList;
import java.util.Collections;
import processing.core.PApplet;

//when in doubt, consult the Processing reference: https://processing.org/reference/

int margin = 200; 
final int padding = 50; 
final int buttonSize = 40; 
ArrayList<Integer> trials = new ArrayList<Integer>(); 
int trialNum = 0; 
int startTime = 0; 
int finishTime = 0; 
int hits = 0; 
int misses = 0; 
Robot robot; 

int numRepeats = 1; 

void setup()
{
  size(700, 700); 
  noCursor();                   // hide default OS cursor
  noStroke(); 
  textFont(createFont("Arial", 16));
  textAlign(CENTER);
  frameRate(120);               // smoother + less cursor lag
  ellipseMode(CENTER);

  try {
    robot = new Robot(); 
  } 
  catch (AWTException e) {
    e.printStackTrace();
  }

  for (int i = 0; i < 16; i++) 
    for (int k = 0; k < numRepeats; k++)
      trials.add(i);

  Collections.shuffle(trials);
  surface.setLocation(0,0);
}


void draw()
{
  background(0); 

  if (trialNum >= trials.size()) 
  {
    float timeTaken = (finishTime-startTime) / 1000f;
    float penalty = constrain(((95f-((float)hits*100f/(float)(hits+misses)))*.2f),0,100);
    fill(255); 
    text("Finished!", width / 2, height / 2); 
    text("Hits: " + hits, width / 2, height / 2 + 20);
    text("Misses: " + misses, width / 2, height / 2 + 40);
    text("Accuracy: " + (float)hits*100f/(float)(hits+misses) +"%", width / 2, height / 2 + 60);
    text("Total time taken: " + timeTaken + " sec", width / 2, height / 2 + 80);
    text("Average time for each button: " + nf((timeTaken)/(float)(hits+misses),0,3) + " sec", width / 2, height / 2 + 100);
    text("Average time for each button + penalty: " + nf(((timeTaken)/(float)(hits+misses) + penalty),0,3) + " sec", width / 2, height / 2 + 140);
    return;
  }

  fill(255);
  text((trialNum + 1) + " of " + trials.size(), 40, 20);

  for (int i = 0; i < 16; i++)
    drawButton(i);

  // Draw angled red triangle cursor (like pointer at 45°)
  pushMatrix();
  translate(mouseX, mouseY);
  rotate(radians(-45));      // tilt 45° like real pointer
  noStroke();
  fill(255, 0, 0, 220);
  float s = 18;              // size of the triangle
  triangle(0, 0, -s/2, s, s/2, s);
  popMatrix();
}


void mousePressed() 
{
  if (trialNum >= trials.size()) 
    return;

  if (trialNum == 0)
    startTime = millis();

  if (trialNum == trials.size() - 1)
  {
    finishTime = millis();
    println("we're done!");
  }

  Rectangle bounds = getButtonLocation(trials.get(trialNum));

  if ((mouseX > bounds.x && mouseX < bounds.x + bounds.width) && 
      (mouseY > bounds.y && mouseY < bounds.y + bounds.height)) 
  {
    println("HIT! " + trialNum + " " + (millis() - startTime)); 
    hits++; 
  } 
  else
  {
    println("MISSED! " + trialNum + " " + (millis() - startTime)); 
    misses++;
  }

  trialNum++; 
}  

Rectangle getButtonLocation(int i) 
{
   int x = (i % 4) * (padding + buttonSize) + margin;
   int y = (i / 4) * (padding + buttonSize) + margin;
   return new Rectangle(x, y, buttonSize, buttonSize);
}

//==============================================
// BUTTON DESIGN: red/white target + animated glow
//==============================================
void drawButton(int i)
{
  Rectangle bounds = getButtonLocation(i);
  pushStyle();

  // Red/white concentric square target
  rectMode(CORNER);
  noStroke();
  int layers = 5;
  for (int k = 0; k < layers; k++) {
    if (k % 2 == 0) fill(220, 0, 0); else fill(255);
    float inset = k * (buttonSize / float(layers * 2));
    rect(bounds.x + inset, bounds.y + inset, bounds.width - 2*inset, bounds.height - 2*inset);
  }

  // Animated highlight for the ACTIVE target
  if (trials.get(trialNum) == i) {
    float t = frameCount * 0.15;
    float glowAlpha = map(sin(t), -1, 1, 50, 150);
    float expand = map(sin(t), -1, 1, 0, 3);
    float sw = map(sin(t), -1, 1, 1, 3);

    fill(255, 240, 0, glowAlpha);
    rect(bounds.x, bounds.y, bounds.width, bounds.height);

    noFill();
    stroke(255, 240, 0);
    strokeWeight(sw);
    rect(bounds.x - expand, bounds.y - expand, bounds.width + 2*expand, bounds.height + 2*expand);
  }

  popStyle();
}

void mouseMoved() { }
void mouseDragged() { }
void keyPressed() { }