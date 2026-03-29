import bowyerWatson from "./bowyer-watson.js";
import Triangle from "./triangle.js";
import Vector from "vectory-lib";

let canvas;
let ctx;
let w, h;


function getRandomPoints() {
  let pointList = [];

  let nrOfPoints = 10;
  for(let i = 0; i < nrOfPoints; i++) {
    pointList.push(new Vector(
      Math.random() * w,
      Math.random() * h
    ));
  }
  return pointList;
}

function setup() {
  canvas = document.querySelector("#canvas");
  ctx = canvas.getContext("2d");
  reset();
  window.addEventListener("resize", reset);
  canvas.addEventListener("click", draw);
}

function reset() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
  draw();
}

function draw() {
  ctx.clearRect(0, 0, w, h);

  let superTriangle = new Triangle(
    new Vector(-w * 10, h * 10),
    new Vector(w * 10, h * 10),
    new Vector(w / 2, -h * 10)
  );

  let pointList = getRandomPoints();
  let triangles = bowyerWatson(superTriangle, pointList);

  ctx.strokeStyle = "black";

  triangles.forEach(t => {
    ctx.beginPath();
    ctx.lineTo(t.a.x, t.a.y);
    ctx.lineTo(t.b.x, t.b.y);
    ctx.lineTo(t.c.x, t.c.y);
    ctx.closePath();
    ctx.stroke();
  });
}

setup();
