listXYToPolylinePoints = function(listX, listY) {
  let res = "";
  for (let i = 0; i < listX.length; i++) {
    res += listX[i] + ',' + listY[i] + ' ';
  }
  return res;
}

class Boid {
  constructor() {
    this.position = createRandomVector(window.innerWidth, window.innerHeight);
    this.velocity = createRandomVector(0, 0, Math.random() * 2 + 2);
    this.acceleration = new Vector(0, 0);

    this.size = Math.random() * 6 + 3;
    this.influenceRadius = 100;
    this.maxForce = 1;
    this.maxSpeed = 4;

    this.dom = document.createElementNS(SVGNS, 'polygon');
    this.dom.setAttribute('fill', colorGenerator(Math.random() * 255, Math.random() * 255, Math.random() * 255, 0.5));
    this.dom.setAttribute('stroke', colorGenerator(50, 50, 50, 1));
  }

  checkObstacles(obstacles) {
    let obstForce = new Vector();
    for (let obstacle of obstacles) {
      obstForce.add(obstacle.effectOnBoid(this));
    }
    this.acceleration.add(obstForce);
  }


  checkBoids(boids) {
    let othersForce = new Vector();
    for (let other of boids) {
      othersForce.add(other.effectOnBoid(this));
    }
    this.acceleration.add(othersForce);
  }


  effectOnBoid(other) {
    let effectForce = new Vector();
    let align = new Vector();
    let cohesion = new Vector();
    let separation = new Vector();
    let delta_pos = new Vector(other.position.x, other.position.y);
    delta_pos.sub(this.position);
    let dist = delta_pos.norm();
    if (other.velocity.x * delta_pos.x + other.velocity.y * delta_pos.y > 0) {
      if (dist < this.size * 4) {
        delta_pos.mult(1000 / (dist));
        separation.add(delta_pos);
      } else if (dist < this.influenceRadius) {

        align.add(this.velocity);

        cohesion.add(this.position);
        cohesion.sub(other.position);
        cohesion.mult(0.005);

      }
    }
    effectForce.add(align);
    effectForce.add(cohesion);
    effectForce.add(separation);
    // effectForce.mult(this.size / 5);
    return effectForce;

  }


  edges() {
    if (this.position.x < 0) {
      this.position.x = 0;
      this.velocity.x *= -1;
    }

    if (this.position.x > window.innerWidth) {
      this.position.x = window.innerWidth;
      this.velocity.x *= -1;
    }

    if (this.position.y < 0) {
      this.position.y = 0;
      this.velocity.y *= -1;
    }

    if (this.position.y > window.innerHeight) {
      this.position.y = window.innerHeight;
      this.velocity.y *= -1;
    }
  }

  edges_old() {
    while (this.position.x < 0) {
      this.position.x += window.innerWidth;
    }
    while (this.position.x > window.innerWidth) {
      this.position.x -= window.innerWidth;
    }
    while (this.position.y < 0) {
      this.position.y += window.innerHeight;
    }
    while (this.position.y > window.innerHeight) {
      this.position.y -= window.innerHeight;
    }
  }

  update() {
    this.acceleration.limitNorm(this.maxForce);
    this.velocity.add(this.acceleration);
    this.velocity.limitNorm(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);

    this.edges_old();
  }

  show() {
    let listPoints = "";
    let dx = new Vector(this.velocity.x, this.velocity.y);
    dx.normalize();
    let dy = new Vector(-dx.y, dx.x);

    let pointA = new Vector(this.position.x, this.position.y);
    let pointB = new Vector(this.position.x, this.position.y);
    let pointC = new Vector(this.position.x, this.position.y);

    dx.mult(this.size);
    pointA.add(dx);
    pointA.add(dx);

    pointB.sub(dx);
    pointC.sub(dx);

    dy.mult(this.size)
    pointB.add(dy);
    pointC.sub(dy);

    this.dom.setAttribute('points',
      listXYToPolylinePoints(
        [pointA.x, pointB.x, pointC.x, pointA.x],
        [pointA.y, pointB.y, pointC.y, pointA.y]
      )
    );
  }
}