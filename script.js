import * as dat from 'dat.gui';

// Local copies of the two Delaunay library files so we can hack them
import bowyerWatson from "./bowyer-watson.js";
import Triangle from "./triangle.js";

import Vector from "vectory-lib";

class Settings {
  constructor(nrOfPoints, showCircles = true) {
    this.nrOfPoints = nrOfPoints;
    this.showCircles = showCircles;
  }
}


let canvas;
let ctx;
let w, h;
const gui = new dat.GUI({ width: 300 });
let settings = new Settings(7);
let generator = null;
let currentState = null;
let placedPoints = [];
let placingMode = false;


function placePoints() {
  placedPoints = [];
  placingMode = true;
  generator = null;
  currentState = null;

  canvas.removeEventListener("click", advance);
  canvas.removeEventListener("click", restartOnClick);
  canvas.addEventListener("click", placePoint);

  renderPlacingUI();
}

function placePoint(e) {
  let rect = canvas.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;
  placedPoints.push(new Vector(x, y));

  if (placedPoints.length >= settings.nrOfPoints) {
    placingMode = false;
    canvas.removeEventListener("click", placePoint);
    canvas.addEventListener("click", advance);
    startVisualizationWithPoints(placedPoints);
  } else {
    renderPlacingUI();
  }
}

function renderPlacingUI() {
  ctx.clearRect(0, 0, w, h);

  // draw the super triangle outline
  let margin = 30;
  ctx.beginPath();
  ctx.moveTo(margin, h - margin);
  ctx.lineTo(w - margin, h - margin);
  ctx.lineTo(w / 2, margin);
  ctx.closePath();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  ctx.stroke();

  // draw already placed points
  placedPoints.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#333";
    ctx.fill();
  });

  drawStep('placePoints');
}

function getPoints() {
  let pointList = [
    new Vector(w*0.53, h*0.26),
    new Vector(w*0.3, h*0.77),
    new Vector(w*0.4, h*0.85),
    new Vector(w*0.4, h*0.45),
    new Vector(w*0.65, h*0.6),
    new Vector(w*0.75, h*0.75),
    new Vector(w*0.6, h*0.3),
  ];

  return pointList;
}

function setup() {
  canvas = document.querySelector("#canvas");
  ctx = canvas.getContext("2d");
  window.addEventListener("resize", reset);
  canvas.addEventListener("click", advance);

  gui
    .add(settings, 'showCircles')
    .name("Show Circumcircles");
  gui
    .add(settings, 'nrOfPoints', 1, 40)
    .name("Number of Points")
    .step(1);
  gui
    .add({ placePoints: placePoints }, 'placePoints')
    .name("Place Points Your Self");
  gui
    .add({ reset: startVisualization }, 'reset')
    .name("Reset Visualization (7 hard coded points)");

  reset();
}

function reset() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
  startVisualization();
}

function startVisualization() {
  let points = getPoints();

  start(points);
}

function startVisualizationWithPoints(points) {
  start(points);
}

function start(points) {
  let margin = 30;
  let superTriangle = new Triangle(
    new Vector(margin, h - margin),
    new Vector(w - margin, h - margin),
    new Vector(w / 2, margin)
  );

  generator = bowyerWatson(superTriangle, points);

  let result = generator.next();
  currentState = result.value;
  render();
}

function advance() {
  if (!generator) return;

  let result = generator.next();
  if (result.done) {
    generator = null;
    return;
  }

  currentState = result.value;
  render();
}

function render() {
  if (!currentState) return;

  ctx.clearRect(0, 0, w, h);

  let { triangulation, point, badTriangles, polygon, processedPoints, pointList, step } = currentState;

  // draw triangles
  triangulation.forEach(t => {
    let isBad = badTriangles.includes(t);

    if(settings.showCircles) {
      // draw circumcircle
      let cc = t.circumcenter;
      let r = Math.sqrt(t.circumradiusSq);
      ctx.beginPath();
      ctx.arc(cc.x, cc.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = isBad ? "rgba(255, 0, 0, 0.8)" : "rgba(100, 100, 255, 0.8)";
      ctx.stroke();
    }

    // draw triangle
    ctx.beginPath();
    ctx.moveTo(t.a.x, t.a.y);
    ctx.lineTo(t.b.x, t.b.y);
    ctx.lineTo(t.c.x, t.c.y);
    ctx.closePath();

    ctx.lineWidth = 1;
    if (isBad) {
      ctx.fillStyle = "rgba(255, 0, 0, 0.15)";
      ctx.fill();
      ctx.strokeStyle = "red";
    } else {
      ctx.strokeStyle = "black";
    }
    ctx.stroke();
  });

  // draw polygon boundary edges
  if (polygon.length > 0) {
    ctx.strokeStyle = "lime";
    ctx.lineWidth = 2;
    polygon.forEach(edge => {
      ctx.beginPath();
      ctx.moveTo(edge[0].x, edge[0].y);
      ctx.lineTo(edge[1].x, edge[1].y);
      ctx.stroke();
    });
    ctx.lineWidth = 1;
  }

  // draw processed points
  processedPoints.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#333";
    ctx.fill();
  });

  // draw remaining (unprocessed) points
  pointList.forEach(p => {
    if (!processedPoints.includes(p)) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      ctx.fill();
    }
  });

  // draw the current point being inserted
  if (point) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
  }

  drawStep(step);

  if (step === 'done') {
    generator = null;
    canvas.removeEventListener("click", advance);
    canvas.addEventListener("click", restartOnClick);
  }
}

function drawStep(step) {
  // draw step info
  ctx.fillStyle = "#333";
  ctx.font = "14px monospace";
  let label = step === 'placePoints' ? `Place the points by clicking inside the triangle. (${placedPoints.length}/${settings.nrOfPoints})`
    : step === 'init' ? "Initial state — click to advance"
    : step === 'badTriangles' ? "Bad triangles (red) & polygon boundary (green) — click to advance"
    : step === 'retriangulated' ? "Re-triangulated — click to advance"
    : "Done! Click to restart";
  ctx.fillText(label, 10, 20);
}

function restartOnClick() {
  canvas.removeEventListener("click", restartOnClick);
  canvas.addEventListener("click", advance);
  reset();
}

setup();
