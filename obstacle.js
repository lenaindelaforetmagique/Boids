class Obstacle {
  constructor(x_, y_) {
    this.position = new Vector(x_, y_);
    this.coefficient = 10;
    this.size = 20;

    this.dom = document.createElementNS(SVGNS, 'ellipse');
    this.dom.setAttribute('cx', this.position.x);
    this.dom.setAttribute('cy', this.position.y);

    this.dom.setAttribute('rx', this.size / 4);
    this.dom.setAttribute('ry', this.size / 4);

    this.dom.setAttribute('fill', colorGenerator(0, 0, 0, 0.5));
    this.dom.setAttribute('stroke', colorGenerator(50, 50, 50, 1));
  }

}