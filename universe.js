var SVGNS = "http://www.w3.org/2000/svg";
colorGenerator = function(r = 0, g = 0, b = 0, alpha = 1) {
  return `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${alpha})`;
}

class Universe {
  constructor() {
    this.boids = [];
    this.obstacles = [];
    this.container = document.getElementById("container");
    this.dom = document.createElementNS(SVGNS, "svg");
    this.container.appendChild(this.dom);

    this.viewBox = new ViewBox(this.dom);

    this.textBlock = new TextBlock();

    this.addEvents();
    this.lastUpdate = Date.now();
  }

  createBoid(x_ = 0, y_ = 0) {
    let boid = new Boid(x_, y_);

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
    this.boid_obstacle_selector = true;
    this.touchEvent = new TouchEvent();
    this.mouseDown = false;

    this.clickFired = null;

    this.mouseClick = function(x_, y_) {
      let realX = thiz.viewBox.realX(x_);
      let realY = thiz.viewBox.realY(y_);
      if (thiz.boid_obstacle_selector) {
        thiz.createBoid(realX, realY);
      } else {
        thiz.createObstacle(realX, realY);
      }
    }

    this.console = function(chaine) {
      thiz.textBlock.log.textContent = chaine;
    }


    // KEYBOARD Events
    document.onkeydown = function(e) {
      switch (e.key) {
        case "Control":
          thiz.boid_obstacle_selector = false;
          thiz.textBlock.btn1_toggle(thiz.boid_obstacle_selector);
          break;
        default:
          break;
      }
    }
    document.onkeyup = function(e) {
      switch (e.key) {
        case "Control":
          thiz.boid_obstacle_selector = true;
          thiz.textBlock.btn1_toggle(thiz.boid_obstacle_selector);
          break;
        default:
          break;
      }
    }

    // TEXTblock events
    this.textBlock.btn1.addEventListener("mousedown", function(e) {
      thiz.clickFired = true;

      thiz.boid_obstacle_selector = !thiz.boid_obstacle_selector;
      thiz.textBlock.btn1_toggle(thiz.boid_obstacle_selector);
      e.preventDefault();
    }, false);

    this.textBlock.btn1.addEventListener("touchstart", function(e) {
      thiz.clickFired = true;

      thiz.boid_obstacle_selector = !thiz.boid_obstacle_selector;
      thiz.textBlock.btn1_toggle(thiz.boid_obstacle_selector);
      e.preventDefault();
    }, false);



    // MOUSE events
    this.container.addEventListener("mousedown", function(e) {
      e.preventDefault();
      if (!thiz.clickFired) {
        thiz.mouseDown = true;
        thiz.mouseClick(e.clientX, e.clientY);
      }
    }, false);

    this.container.addEventListener("mousemove", function(e) {
      e.preventDefault();
      if (thiz.mouseDown) {
        thiz.mouseClick(e.clientX, e.clientY);
      }
    }, false);

    this.container.addEventListener("mouseup", function(e) {
      e.preventDefault();
      thiz.mouseDown = false;
      thiz.clickFired = false;
    }, false);

    this.container.addEventListener("wheel", function(e) {
      e.preventDefault();
      let k = 1.1;
      if (e.deltaY > 0) {
        k = 1 / k;
      }
      thiz.viewBox.scale(e.clientX, e.clientY, k);
    }, false);


    // TOUCH events
    this.container.addEventListener("touchstart", function(e) {
      thiz.console(e.type + " " + e.touches.length);
      e.preventDefault();
      if (!thiz.clickFired) {
        thiz.mouseDown = true;
        thiz.touchEvent.saveEvent(e);
        if (thiz.touchEvent.size == 0) {
          thiz.mouseClick(thiz.touchEvent.x, thiz.touchEvent.y);
        }
      }
    }, false);

    this.container.addEventListener("touchmove", function(e) {

      e.preventDefault();
      let newTouch = new TouchEvent();
      newTouch.saveEvent(e);
      thiz.console(e.type + " " + e.touches.length + " " + newTouch.size);
      if (newTouch.size == 0) {
        thiz.mouseClick(newTouch.x, newTouch.y);
      } else {
        let dx = newTouch.x - this.touchEvent.x;
        let dy = newTouch.y - this.touchEvent.y;
        thiz.console(e.type + " " + e.touches.length + " " + newTouch.size + "*1");
        thiz.viewBox.translate(-dx, -dy);
        thiz.console(e.type + " " + e.touches.length + " " + newTouch.size + "*2");
        thiz.viewBox.scale(newTouch.x, newTouch.y, newTouch.size / thiz.touchEvent.size);
        thiz.console(e.type + " " + e.touches.length + " " + newTouch.size + "*3");
      }
      thiz.touchEvent = newTouch;
    }, false);

    this.container.addEventListener("touchend", function(e) {
      thiz.console(e.type + " " + e.touches.length);
      e.preventDefault();
      thiz.mouseDown = false;
      thiz.clickFired = false;
      thiz.touchEvent.reset();
    }, false);

    this.container.addEventListener("touchcancel", function(e) {
      thiz.console(e.type + " " + e.touches.length);
      e.preventDefault();
      thiz.mouseDown = false;
      thiz.clickFired = false;
      thiz.touchEvent.reset();
    }, false);

    this.container.addEventListener("touchleave", function(e) {
      thiz.console(e.type + " " + e.touches.length);
      e.preventDefault();
      thiz.mouseDown = false;
      thiz.clickFired = false;
      thiz.touchEvent.reset();
    }, false);


    // OTHER events
    window.onresize = function(e) {
      thiz.viewBox.resize();
    }
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
        this.controlEdges(boid);
        boid.show();
      }
    }
  }

  controlEdges(boid) {
    while (boid.position.x < this.viewBox.xMin) {
      boid.position.x += this.viewBox.width;
    }
    while (boid.position.x > this.viewBox.xMin + this.viewBox.width) {
      boid.position.x -= this.viewBox.width;
    }

    while (boid.position.y < this.viewBox.yMin) {
      boid.position.y += this.viewBox.height;
    }
    while (boid.position.y > this.viewBox.yMin + this.viewBox.height) {
      boid.position.y -= this.viewBox.height;
    }
  }
}

class ViewBox {
  constructor(parent_) {
    this.parent = parent_;
    this.xMin = 0;
    this.yMin = 0;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.set();
  }

  repr() {
    return this.xMin + " " + this.yMin + " " + this.width + " " + this.height;
  }

  set() {
    this.parent.setAttributeNS(null, 'viewBox', this.repr());
  }

  realX(x) {
    // Returns the "real" X in the viewBox from a click on the parent Dom...
    let domRect = this.parent.getBoundingClientRect();
    return (x - domRect.left) / domRect.width * this.width + this.xMin;
  }

  realY(y) {
    // Returns the "real" Y in the viewBox from a click on the parent Dom...
    let domRect = this.parent.getBoundingClientRect();
    return (y - domRect.top) / domRect.height * this.height + this.yMin;
  }

  // Events
  resize() {
    this.height = this.width * window.innerHeight / window.innerWidth;
    this.set();
  }

  scale(x, y, fact = 1) {
    let coorX = this.realX(x);
    let coorY = this.realY(y);

    this.xMin = coorX - (coorX - this.xMin) / fact;
    this.yMin = coorY - (coorY - this.yMin) / fact;
    this.width /= fact;
    this.height /= fact;
    this.set();
  }

  translate(dx, dy) {
    let domRect = thiz.parentSvg.getBoundingClientRect();
    this.box[0] += dx / domRect.width * this.width;
    this.box[1] += dy / domRect.height * this.height;
    this.set();
  }




}

class TouchEvent {
  constructor() {
    this.init();
  }

  init() {
    this.x = null;
    this.y = null;
    this.size = null;
  }

  saveEvent(e) {
    // position
    let x = 0;
    let y = 0;
    let n = e.touches.length;
    for (let i = 0; i < n; i++) {
      x += e.touches[i].clientX / n;
      y += e.touches[i].clientY / n;
    }
    this.x = x;
    this.y = y;

    // size
    let lMax = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let l = Math.pow(e.touches[i].clientX - e.touches[j].clientX, 2);
        l += Math.pow(e.touches[i].clientY - e.touches[j].clientY, 2);
        lMax = Math.max(lMax, l);
      }
    }
    this.size = Math.pow(lMax, 0.5);
  }

  reset() {
    // this.init();
  }



}

class TextBlock {
  constructor() {
    this.container = document.getElementById("container");
    this.dom = this.dom = document.createElementNS(SVGNS, "svg");
    this.dom.setAttributeNS(null, "class", "legend");
    this.container.appendChild(this.dom);

    this.text = document.createElementNS(SVGNS, "text");
    this.dom.appendChild(this.text);
    this.text.setAttributeNS(null, "x", 0);
    this.text.setAttributeNS(null, "y", 30);
    this.text.setAttributeNS(null, "fill", "rgba(0,0,0,0.7)");

    this.title = document.createElementNS(SVGNS, "tspan");
    this.text.appendChild(this.title);
    this.title.setAttributeNS(null, "font-size", "30px");

    // this.description = document.createElementNS(SVGNS, "tspan");
    // this.text.appendChild(this.description);
    // this.description.setAttributeNS(null, "font-size", "12px");
    // this.description.setAttributeNS(null, "x", 0);
    // this.description.setAttributeNS(null, "dy", 20);

    this.btn1 = document.createElementNS(SVGNS, "text");
    this.btn1.setAttributeNS(null, "fill", "rgba(0,0,0,0.7)");
    this.dom.appendChild(this.btn1);
    this.btn1.setAttributeNS(null, "class", "button");
    this.btn1.setAttributeNS(null, "font-size", "12px");
    this.btn1.setAttributeNS(null, "x", 0);
    this.btn1.setAttributeNS(null, "y", 60);

    this.title.textContent = "Boids";
    this.btn1_status = true;
    this.btn1_set();

    this.log = document.createElementNS(SVGNS, "text");
    this.log.setAttributeNS(null, "fill", "rgba(0,0,0,0.7)");
    this.dom.appendChild(this.log);
    this.log.setAttributeNS(null, "class", "button");
    this.log.setAttributeNS(null, "font-size", "12px");
    this.log.setAttributeNS(null, "x", 0);
    this.log.setAttributeNS(null, "y", 80);


  }

  btn1_toggle(newvalue) {
    this.btn1_status = newvalue;
    this.btn1_set();
  }

  btn1_set() {
    this.btn1.textContent = this.btn1_status ? "Create Boids or Obstacles: BOIDS" : "Create Boids or Obstacles: OBSTACLES";
  }

}