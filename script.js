var SVGNS = "http://www.w3.org/2000/svg";
var PERCEPTION = 100;
var PROTECTION = 0.25;
var ALIGN = 0.5;
var SEPARATION = 0.7;
var COHESION = 0.025;

colorGenerator = function(r = 0, g = 0, b = 0, alpha = 1) {
  return `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${alpha})`;
}

var svgPicture = document.createElementNS(SVGNS, "svg");
document.body.appendChild(svgPicture);


// BOIDS GENERATION
var boids = [];
for (let i = 0; i < 200; i++) {
  let boid = new Boid();
  svgPicture.appendChild(boid.dom);
  boids.push(boid);
}


// INPUT MOUSE
var mouseDown = false;
var buttonON = 0;

mouseEffect = function(e) {
  if (mouseDown) {
    switch (buttonON) {
      case 1:
        ALIGN = e.clientY / window.innerHeight * 2;
        break;
      case 2:
        PERCEPTION = e.clientY;
        break;
      case 3:
        PROTECTION = e.clientY / window.innerHeight;
        break;
      default:
    }
    console.log(ALIGN, PERCEPTION, PROTECTION, COHESION, SEPARATION);
  }
}

svgPicture.addEventListener("mousedown", function(e) {
  e.preventDefault();
  mouseDown = true;
  if (e.clientX < window.innerWidth / 3) {
    buttonON = 1;
  } else if (e.clientX < window.innerWidth * 2 / 3) {
    buttonON = 2;
  } else {
    buttonON = 3;
  }
  mouseEffect(e);
});

svgPicture.addEventListener("mousemove", function(e) {
  e.preventDefault();
  mouseEffect(e);
});

svgPicture.addEventListener("mouseup", function(e) {
  e.preventDefault();
  mouseDown = false;
});


// ANIMATION
var LASTUPDATE = Date.now();

var refresh = function(ts) {
  let now = Date.now();
  if (now - LASTUPDATE > 20) {
    LASTUPDATE = now;

    for (let i = 0; i < boids.length; i++) {
      boids[i].interact(boids);
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