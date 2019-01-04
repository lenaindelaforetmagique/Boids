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

    this.maxForce = 1;
    this.maxSpeed = 4;

    this.alignMax = this.maxForce; //1000;
    this.cohesionMax = this.maxForce; //1000;
    this.separationMax = this.maxForce; //    10;

    this.dom = document.createElementNS(SVGNS, 'polygon');
    this.dom.setAttribute('fill', colorGenerator(Math.random() * 255, Math.random() * 255, Math.random() * 255, 0.5));
    this.dom.setAttribute('stroke', colorGenerator(50, 50, 50, 1));
  }

  checkObstacles(obstacles) {
    let cpt = 0;
    let separation = new Vector();

    for (let i = 0; i < obstacles.length; i++) {
      let dpos = new Vector(obstacles[i].position.x, obstacles[i].position.y);
      dpos.sub(this.position);
      let dist = dpos.norm(); // distance(boids[i].position, this.position);

      // separation
      if (dist > 0 && dist < obstacles[i].size) {
        cpt += 1;
        dpos.mult(-obstacles[i].coefficient / (dist));
        separation.add(dpos);
      }
    }

    if (cpt > 0) {
      separation.div(cpt);
      // separation.normalize();
      // separation.mult(this.maxSpeed);
      separation.sub(this.velocity);
      separation.limitNorm(this.separationMax);
    }
    this.acceleration.add(separation);
  }

  interact(boids) {
    let cpt = 0;
    let cpt2 = 0;
    let align = new Vector();
    let cohesion = new Vector();
    let separation = new Vector();

    for (let i = 0; i < boids.length; i++) {
      let dpos = new Vector(boids[i].position.x, boids[i].position.y);
      dpos.sub(this.position);
      let dist = dpos.norm(); // distance(boids[i].position, this.position);

      if (dist > 0 && dist < PERCEPTION) {
        cpt += 1;

        align.add(boids[i].velocity);

        cohesion.add(boids[i].position);

        // separation
        if (dist < PERCEPTION * PROTECTION) {
          cpt2 += 1;
          dpos.mult(-1 / (dist));
          separation.add(dpos);
        }
      }
    }

    if (cpt > 0) {
      align.div(cpt);
      align.normalize();
      align.mult(this.maxSpeed);
      align.sub(this.velocity);
      align.limitNorm(this.alignMax);

      cohesion.div(cpt);
      cohesion.sub(this.position);
      cohesion.limitNorm(this.cohesionMax);
    }

    if (cpt2 > 0) {
      separation.div(cpt2);
      // separation.normalize();
      // separation.mult(this.maxSpeed);
      separation.sub(this.velocity);
      separation.limitNorm(this.separationMax);
    }
    align.mult(ALIGN);
    cohesion.mult(COHESION);
    separation.mult(SEPARATION);

    this.acceleration.add(align);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
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
    this.velocity.add(this.acceleration);
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

    dx.mult(5);
    pointA.add(dx);
    pointA.add(dx);

    pointB.sub(dx);
    pointC.sub(dx);

    dy.mult(5)
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