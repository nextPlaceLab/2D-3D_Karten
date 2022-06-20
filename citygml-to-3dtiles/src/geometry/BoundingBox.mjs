import Cesium from 'cesium'

class BoundingBox {
  /**
   * @param {Cesium.Cartesian3} min
   * @param {Cesium.Cartesian3} max
   */
  constructor (min, max) {
    this.min = min
    this.max = max
  }

  /**
   * @returns {Cesium.Cartesian3[]}
   */
  getPoints () {
    return [this.min, this.max]
  }

  /**
   * @returns {Cesium.Cartesian3}
   */
  getMin () {
    return this.min
  }

  /**
   * @returns {Cesium.Cartesian3}
   */
  getMax () {
    return this.max
  }
  
  getCenter() {
	return Cesium.Cartesian3.divideByScalar(Cesium.Cartesian3.add(this.min,this.max,new Cesium.Cartesian3()),2,new Cesium.Cartesian3())
  }
  
  gettiledBb() {
	let tilesBb = []
	let center = Cesium.Cartographic.fromCartesian(this.getCenter())

	let min = Cesium.Cartographic.fromCartesian(this.min)
	let max = Cesium.Cartographic.fromCartesian(this.max)

	tilesBb.push(new BoundingBox(Cesium.Cartesian3.fromRadians(min.longitude,center.latitude,0), Cesium.Cartesian3.fromRadians(center.longitude,max.latitude,0)))
	tilesBb.push(new BoundingBox(Cesium.Cartesian3.fromRadians(center.longitude,center.latitude,0), Cesium.Cartesian3.fromRadians(max.longitude,max.latitude,0)))
	tilesBb.push(new BoundingBox(Cesium.Cartesian3.fromRadians(min.longitude,min.latitude,0), Cesium.Cartesian3.fromRadians(center.longitude,center.latitude,0)))
	tilesBb.push(new BoundingBox(Cesium.Cartesian3.fromRadians(center.longitude,min.latitude,0), Cesium.Cartesian3.fromRadians(max.longitude,center.latitude,0)))
	
	return tilesBb
  }

  /**
   * @param {Cesium.Cartesian3[]} points
   * @returns {BoundingBox}
   */
  static fromPoints (points) {
    if (points.length < 1) {
      throw new Error('Invalid number of points: ' + points.length)
    }
    let min = Cesium.Cartesian3.clone(points[0])
    let max = Cesium.Cartesian3.clone(min)
    points.forEach(point => {
      min.x = Math.min(min.x, point.x)
      min.y = Math.min(min.y, point.y)
      min.z = Math.min(min.z, point.z)

      max.x = Math.max(max.x, point.x)
      max.y = Math.max(max.y, point.y)
      max.z = Math.max(max.z, point.z)
    })
    return new BoundingBox(min, max)
  }

  /**
   * @param {BoundingBox[]} boxes
   * @returns {BoundingBox}
   */
  static fromBoundingBoxes (boxes) {
    if (boxes.length < 1) {
      throw new Error('Invalid number of bounding-boxes: ' + boxes.length)
    }
    let points = []
    boxes.forEach(box => {
      points = points.concat(box.getPoints())
    })
    return this.fromPoints(points)
  }
  
  static whichBoundingBox (point_cart, boxes_cart) {
	  let boxes = []
	  let point = Cesium.Cartographic.fromCartesian(point_cart)
	  
	  boxes_cart.forEach((box_cart, i) => {
		  boxes.push(new BoundingBox(Cesium.Cartographic.fromCartesian(box_cart.getMin()),Cesium.Cartographic.fromCartesian(box_cart.getMax())))
	  })
	  
    if (point.latitude >= boxes[0].getMin().latitude ) {
      if (point.longitude <= boxes[0].getMax().longitude ) {
		return 0
	  }
	  else {
		return 1  
	  }
    } else {
      if (point.longitude <= boxes[2].getMax().longitude ) {
		return 2
	  }
	  else {
		return 3  
	  }		
	}
	throw new Error('Point is outside Boundingbox')
  }

}

export default BoundingBox
