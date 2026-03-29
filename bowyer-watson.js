import Triangle from './triangle.js';

export default function bowyerWatson (superTriangle, pointList) {
  // pointList is a set of coordinates defining the
  // points to be triangulated
  let triangulation = [];

  // add super-triangle to triangulation
  // must be large enough to completely contain all
  // the points in pointList
  triangulation.push(superTriangle);

  // add all the points one at a time to the triangulation
  pointList.forEach(point => {
    let badTriangles = [];

    // first find all the triangles that are no
    // longer valid due to the insertion
    triangulation.forEach(triangle => {
      if(triangle.pointIsInsideCircumcircle(point)) {
        badTriangles.push(triangle);
      }
    });
    let polygon = [];

    // find the boundary of the polygonal hole
    badTriangles.forEach(triangle => {
      triangle.edges().forEach(edge => {
        let edgeIsShared = badTriangles.some(otherTriangle => {
          return triangle !== otherTriangle && otherTriangle.hasEdge(edge);
        });
        if(!edgeIsShared) {
          // edge is not shared by any other
          // triangles in badTriangles
          polygon.push(edge);
        }
      });
    });

    // remove them from the data structure
    badTriangles.forEach(triangle => {
      let index = triangulation.indexOf(triangle);
      if (index > -1) {
        triangulation.splice(index, 1);
      }
    });

    // re-triangulate the polygonal hole
    polygon.forEach(edge => {
      // form a triangle from edge to point
      let newTri = new Triangle(edge[0], edge[1], point);
      triangulation.push(newTri);
    });
  });

  // done inserting points, now clean up
  let i = triangulation.length;
  while(i--) {
    let triangle = triangulation[i];
    if(triangle.sharesAVertexWith(superTriangle)) {
      // remove triangle from triangulation
      let index = triangulation.indexOf(triangle);
      if (index > -1) {
        triangulation.splice(index, 1);
      }
    }
  }

  return triangulation;
}
