var SVGNS = "http://www.w3.org/2000/svg";
colorGenerator = function(r = 0, g = 0, b = 0, alpha = 1) {
  return `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${alpha})`;
}

class Universe {
  constructor(w, h) {
    this.width = w;
    this.height = h;
    this.boids = [];
    this.obstacles = [];

    this.dom = document.createElementNS(SVGNS, "svg");
    document.body.appendChild(this.dom);
    this.addEvents();

    this.lastUpdate = Date.now();
  }

  createBoid(x_ = 0, y_ = 0) {
    let boid = new Boid(x_, y_)
    this.dom.appendChild(boid.dom);
    this.boids.push(boid);
  }

  createObstacle(x_ = 0, y_ = 0) {
    let newObstacle = new Obstacle(x_, y_);
    this.dom.appendChild(newObstacle.dom);
    this.obstacles.push(newObstacle);
  }

  addEvents() {
    let thiz = this;

    this.mouseDown = false;

    this.mouseClick = function(e) {
      if (e.ctrlKey) {
        thiz.createObstacle(e.clientX, e.clientY);
      } else {
        thiz.createBoid(e.clientX, e.clientY);
      }
    }

    this.dom.addEventListener("mousedown", function(e) {
      e.preventDefault();
      thiz.mouseDown = true;
      thiz.mouseClick(e);
    });

    this.dom.addEventListener("mousemove", function(e) {
      e.preventDefault();
      if (thiz.mouseDown) {
        thiz.mouseClick(e);
      }
    });

    this.dom.addEventListener("mouseup", function(e) {
      e.preventDefault();
      thiz.mouseDown = false;
    });
  }

  refresh() {
    let now = Date.now();
    if (now - this.lastUpdate > 20) {
      this.lastUpdate = now;
      for (let boid of this.boids) {
        boid.checkObstacles(this.obstacles);
        boid.checkBoids(this.boids);
      }

      for (let boid of this.boids) {
        boid.update();
        boid.show();
      }
    }
  }

}