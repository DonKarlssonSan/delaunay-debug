import Vector from 'vectory-lib';

export default class Triangle {
  constructor(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
  }

  vertexes() {
    return [this.a, this.b, this.c];
  }

  vertexesAsString() {
    return this.vertexes().map(vertex => `${vertex.x}, ${vertex.y}`).join(", ");
  }

  edges() {
    return [
      [this.a, this.b],
      [this.b, this.c],
      [this.c, this.a]
    ];
  }

  sharesAVertexWith(triangle) {
    // TODO: optimize me please!
    for(let i = 0; i < 3; i++) {
      for(let j = 0; j < 3; j++) {
        let v = this.vertexes()[i];
        let vv = triangle.vertexes()[j];
        if(v.equals(vv)) {
          return true;
        }
      }
    }
    return false;
  }

  hasEdge(edge) {
    for(let i = 0; i < 3; i++) {
      let e = this.edges()[i];
      if(e[0].equals(edge[0]) && e[1].equals(edge[1]) ||
         e[1].equals(edge[0]) && e[0].equals(edge[1])) {
        return true;
      }
    }
    return false;
  }

  get circumcenter() {
    if(!this._circumcenter) {
      let d = 2 * (this.a.x * (this.b.y - this.c.y) +
                   this.b.x * (this.c.y - this.a.y) +
                   this.c.x * (this.a.y - this.b.y));

      let x = 1 / d * ((this.a.x * this.a.x + this.a.y * this.a.y) * (this.b.y - this.c.y) +
                       (this.b.x * this.b.x + this.b.y * this.b.y) * (this.c.y - this.a.y) +
                       (this.c.x * this.c.x + this.c.y * this.c.y) * (this.a.y - this.b.y));

      let y = 1 / d * ((this.a.x * this.a.x + this.a.y * this.a.y) * (this.c.x - this.b.x) +
                       (this.b.x * this.b.x + this.b.y * this.b.y) * (this.a.x - this.c.x) +
                       (this.c.x * this.c.x + this.c.y * this.c.y) * (this.b.x - this.a.x));
      this._circumcenter = new Vector(x, y);
    }

    return this._circumcenter;

  }

  get centroid() {
    if(!this._centroid) {
      this._centroid = this.a.add(this.b).add(this.c).div(3);
    }
    return this._centroid;
  }

  get circumradiusSq() {
    if(!this._circumradiusSq) {
      this._circumradiusSq = this.circumcenter.sub(this.a).getLengthSq();
    }
    return this._circumradiusSq;
  }

  pointIsInsideCircumcircle(point) {
    let dist = point.sub(this.circumcenter).getLengthSq();

    return dist < this.circumradiusSq;
  }
}
