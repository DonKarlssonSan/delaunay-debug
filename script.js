import bowyerWatson from "./bowyer-watson.js";
import Triangle from "./triangle.js";
import Vector from "vectory-lib";

let canvas;
let ctx;
let w, h;
let generator = null;
let currentState = null;


function getPoints() {
  // let pointList = [
  //   new Vector(w*0.2, h*0.15),
  //   new Vector(w*0.15, h*0.52),
  //   new Vector(w*0.5, h*0.4),
  //   new Vector(w*0.7, h*0.7),
  //   new Vector(w*0.25, h*0.3),
  //   new Vector(w*0.64, h*0.21),
  //   new Vector(w*0.35, h*0.75)
  // ];
  let pointList = [
    new Vector(w*0.3, h*0.25),
    new Vector(w*0.25, h*0.5),
    new Vector(w*0.4, h*0.65),
    new Vector(w*0.5, h*0.45),
    new Vector(w*0.65, h*0.6),
    new Vector(w*0.35, h*0.35),
    new Vector(w*0.6, h*0.3),
  ];


  return pointList;
}

function setup() {
  canvas = document.querySelector("#canvas");
  ctx = canvas.getContext("2d");
  window.addEventListener("resize", reset);
  canvas.addEventListener("click", advance);
  reset();
}

function reset() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
  startVisualization();
}

function startVisualization() {
  let margin = 50;
  let superTriangle = new Triangle(
    new Vector(-margin * 4, h - margin),
    new Vector(w + margin * 4, h - margin),
    new Vector(w / 2, -margin*12)
  );

  let pointList = getPoints();
  generator = bowyerWatson(superTriangle, pointList);

  // show the initial state
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
    // ctx.setLineDash([]);

    // draw circumcircle
    let cc = t.circumcenter;
    let r = Math.sqrt(t.circumradiusSq);
    ctx.beginPath();
    ctx.arc(cc.x, cc.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = isBad ? "rgba(255, 0, 0, 0.8)" : "rgba(100, 100, 255, 0.8)";
    ctx.stroke();

    // draw triangle
    ctx.beginPath();
    ctx.moveTo(t.a.x, t.a.y);
    ctx.lineTo(t.b.x, t.b.y);
    ctx.lineTo(t.c.x, t.c.y);
    ctx.closePath();

    ctx.lineWidth = 1;
    if (isBad) {
      // ctx.setLineDash([10, 10]);
      ctx.fillStyle = "rgba(255, 0, 0, 0.15)";
      ctx.fill();
      ctx.strokeStyle = "red";
    } else {
      // ctx.setLineDash([]);
      ctx.strokeStyle = "black";
    }
    ctx.stroke();
  });

  // ctx.setLineDash([]);
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

  // draw step info
  ctx.fillStyle = "#333";
  ctx.font = "14px monospace";
  let label = step === 'init' ? "Initial state — click to advance"
    : step === 'badTriangles' ? "Bad triangles (red) & polygon boundary (green) — click to advance"
    : step === 'retriangulated' ? "Re-triangulated — click to advance"
    : "Done! Click to restart";
  ctx.fillText(label, 10, 20);

  if (step === 'done') {
    generator = null;
    canvas.removeEventListener("click", advance);
    canvas.addEventListener("click", restartOnClick);
  }
}

function restartOnClick() {
  canvas.removeEventListener("click", restartOnClick);
  canvas.addEventListener("click", advance);
  reset();
}

setup();
