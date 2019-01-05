class Obstacle {
  constructor(x_, y_) {
    this.position = new Vector(x_, y_);
    this.coefficient = 0.5 * 1000;
    this.size = 10;
    this.influenceRadius = 30;

    this.dom = document.createElementNS(SVGNS, 'ellipse');
    this.dom.setAttribute('cx', this.position.x);
    this.dom.setAttribute('cy', this.position.y);

    this.dom.setAttribute('rx', this.size / 2);
    this.dom.setAttribute('ry', this.size / 2);

    this.dom.setAttribute('fill', colorGenerator(0, 0, 0, 0.5));
    this.dom.setAttribute('stroke', colorGenerator(50, 50, 50, 1));
  }

  effectOnBoid(boid) {
    let dpos = new Vector(this.position.x, this.position.y);
    dpos.sub(boid.position);
    let dist = dpos.norm(); // distance(boids[i].position, this.position);

    // separation
    if (dist > 0 && dist < this.influenceRadius) {
      dpos.mult(-this.coefficient * (1 / dist - 1 / this.influenceRadius));
    } else {
      dpos.mult(0);
    }
    return dpos;
  }
}


laby1 = function() {
  let obstacles = [];
  let c = 60;
  let dl = c * 2 / 60;
  let k = 1;
  let pt1 = new Vector(window.innerWidth / 2 - c, window.innerHeight / 2 - c);
  let pt2 = new Vector(window.innerWidth / 2 + c, window.innerHeight / 2 - c);
  let pt3 = new Vector(window.innerWidth / 2 + c, window.innerHeight / 2 + c);
  let pt4 = new Vector(window.innerWidth / 2 - c, window.innerHeight / 2 + c);
  let d1 = new Vector(dl, -k * dl);
  let d2 = new Vector(k * dl, dl);
  let d3 = new Vector(-dl, k * dl);
  let d4 = new Vector(-k * dl, -dl);

  for (let i = 0; i < 60; i++) {
    pt1.add(d1);
    let newObstacle = new Obstacle(pt1.x, pt1.y);
    svgPicture.appendChild(newObstacle.dom);
    obstacles.push(newObstacle);

    pt2.add(d2);
    newObstacle = new Obstacle(pt2.x, pt2.y);
    svgPicture.appendChild(newObstacle.dom);
    obstacles.push(newObstacle);

    pt3.add(d3);
    newObstacle = new Obstacle(pt3.x, pt3.y);
    svgPicture.appendChild(newObstacle.dom);
    obstacles.push(newObstacle);

    pt4.add(d4);
    newObstacle = new Obstacle(pt4.x, pt4.y);
    svgPicture.appendChild(newObstacle.dom);
    obstacles.push(newObstacle);
  }
  return obstacles;
}

spiral = function() {
  let obstacles = [];

  let dr = 2;
  let dtheta = Math.PI / 30;


  let radius = 50;
  let theta = 10;
  let xc = window.innerWidth / 2;
  let yc = window.innerHeight / 2;

  for (let i = 0; i < 100; i++) {
    radius += dr;
    theta += dtheta;
    let newObstacle = new Obstacle(xc + radius * Math.cos(theta), yc + radius * Math.sin(theta));
    svgPicture.appendChild(newObstacle.dom);
    obstacles.push(newObstacle);
  }
  return obstacles;
}

circles = function() {
  let obstacles = [];

  let width = window.innerWidth;
  let height = window.innerHeight;

  for (let i = 0; i < Math.random() * 6 * FACT; i++) {
    let xc = Math.random() * width;
    let yc = Math.random() * height;
    let radius = Math.random() * 100 + 40;
    // radius += dr;
    for (let theta = 0; theta < Math.PI * 2; theta += Math.PI * 2 / 16) {
      // theta += dtheta;
      let newObstacle = new Obstacle(xc + radius * Math.cos(theta), yc + radius * Math.sin(theta));
      svgPicture.appendChild(newObstacle.dom);
      obstacles.push(newObstacle);
    }
  }
  return obstacles;
}