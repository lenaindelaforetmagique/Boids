var SVGNS = "http://www.w3.org/2000/svg";

colorGenerator = function(r = 0, g = 0, b = 0, alpha = 1) {
  return `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${alpha})`;
}

var svgPicture = document.createElementNS(SVGNS, "svg");
document.body.appendChild(svgPicture);


// BOIDS GENERATION
let FACT = window.innerWidth * window.innerHeight / 1000000;
let nb_boids = Math.max(Math.min(100, FACT * 100), 50);
// nb_boids = 30;
console.log(nb_boids);
var boids = [];
for (let i = 0; i < nb_boids; i++) {
  let boid = new Boid();
  svgPicture.appendChild(boid.dom);
  boids.push(boid);
}

var obstacles = [];
// obstacles = laby1();
// obstacles = spiral();
// obstacles = circles();


// INPUT MOUSE
var mouseDown = false;

createObstacle = function(e) {
  if (mouseDown) {
    let newObstacle = new Obstacle(e.clientX, e.clientY);
    svgPicture.appendChild(newObstacle.dom);
    obstacles.push(newObstacle);
  }
};

svgPicture.addEventListener("mousedown", function(e) {
  e.preventDefault();
  mouseDown = true;
  createObstacle(e);
});

svgPicture.addEventListener("mousemove", function(e) {
  e.preventDefault();
  createObstacle(e);
});

svgPicture.addEventListener("mouseup", function(e) {
  e.preventDefault();
  mouseDown = false;
});

svgPicture.addEventListener("mouseout", function(e) {
  e.preventDefault();
  ctrlMouseDown = false;
  // ctrlMouseDown = false;
});


// ANIMATION
var LASTUPDATE = Date.now();

var refresh = function(ts) {
  let now = Date.now();
  if (now - LASTUPDATE > 20) {
    LASTUPDATE = now;

    for (let i = 0; i < boids.length; i++) {
      boids[i].checkObstacles(obstacles);
      boids[i].checkBoids(boids);
    }

    for (let i = 0; i < boids.length; i++) {
      boids[i].update();
      boids[i].show();
    }
  }
};

var updateCB = function(timestamp) {
  refresh(timestamp);
  window.requestAnimationFrame(updateCB);
};
updateCB(0);