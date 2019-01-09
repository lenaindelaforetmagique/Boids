listXYToPolylinePoints = function(listX, listY) {
  let res = "";
  for (let i = 0; i < listX.length; i++) {
    res += listX[i] + ',' + listY[i] + ' ';
  }
  return res;
}

class Boid {
  constructor(x_, y_) {
    this.position = new Vector(x_, y_);
    this.velocity = createRandomVector(0, 0, Math.random() * 2 + 2);
    this.acceleration = new Vector(0, 0);

    this.size = Math.random() * 14 + 6;
    this.influenceRadius = 100;
    this.viewRadius = 100;
    this.maxForce = 1;
    this.maxSpeed = 4;
    this.color = colorGenerator(Math.random() * 255, Math.random() * 255, Math.random() * 255, 0.5);
    this.dom = document.createElementNS(SVGNS, 'polygon');
    this.dom.setAttribute('fill', this.color);
    this.dom.setAttribute('stroke', colorGenerator(50, 50, 50, 1));
  }

  separation(objects) {
    let sepForce = new Vector();
    let color = this.color;
    for (let object of objects) {
      let delta_pos = this.position.copy();
      delta_pos.sub(object.position);

      let dist = delta_pos.norm();
      if (dist > 0 && dist < this.viewRadius) {
        let delta_vel = new Vector();
        delta_vel.sub(this.velocity);
        delta_vel.normalize();

        let dt = delta_pos.dotProduct(delta_vel);
        if (dt > 0) {
          // Deviation
          let deviation = new Vector(delta_vel.y, -delta_vel.x)
          let minimalDistance = delta_pos.dotProduct(deviation);
          if (Math.abs(minimalDistance) < this.size / 2 + object.size) {
            color = "orange";
            deviation.mult(0.25 / minimalDistance);
            sepForce.add(deviation);
          }

          // Brake
          if (dist < (this.size + object.size)) {
            color = "red";
            delta_pos.mult(1 / dist);
            sepForce.add(delta_pos);
          }
        }
      }
    }
    // this.dom.setAttribute('fill', color);
    return sepForce;
  }

  cohesion(boids) {
    let cohesionForce = new Vector();
    let cpt = 0;

    for (let boid of boids) {
      let delta_pos = new Vector(boid.position.x, boid.position.y);
      delta_pos.sub(this.position);
      let dist = delta_pos.norm();

      if (dist < this.viewRadius &&
        // this.velocity.dotProduct(delta_pos) > 0 &&
        dist > 2 * (this.size + boid.size)) {
        cpt += 1;
        cohesionForce.add(boid.position);
      }
    }
    if (cpt > 0) {
      cohesionForce.div(cpt)
      cohesionForce.sub(this.position);
    }
    cohesionForce.mult(0.005);
    return cohesionForce;
  }

  alignment(boids) {
    let alignForce = new Vector();
    let cpt = 0;

    for (let boid of boids) {
      let delta_pos = new Vector(boid.position.x, boid.position.y);
      delta_pos.sub(this.position);
      let dist = delta_pos.norm();

      if (dist < this.viewRadius / 2 && this.velocity.dotProduct(delta_pos) > 0) {
        cpt += 1;
        alignForce.add(boid.velocity);
      }
    }
    if (cpt > 0) {
      alignForce.div(cpt)
      // alignForce.sub(this.velocity);
    }
    alignForce.mult(0.25);
    return alignForce;
  }


  checkObstacles(obstacles) {
    this.acceleration.add(this.separation(obstacles));
  }

  checkBoids(boids) {
    this.acceleration.add(this.separation(boids));
    if (this.acceleration.norm() == 0) {
      this.acceleration.add(this.cohesion(boids));
    }
    this.acceleration.add(this.alignment(boids));
  }


  update() {
    this.acceleration.limitNorm(this.maxForce);
    this.velocity.add(this.acceleration);
    this.velocity.mult(1.025);
    this.velocity.limitNorm(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
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

    dx.div(2);

    pointB.sub(dx);
    pointC.sub(dx);

    dy.mult(this.size / 2)
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