import BatchTable from './3dtiles/BatchTable.mjs'
import CityDocument from './citygml/Document.mjs'
import BoundingBox from './geometry/BoundingBox.mjs'
import Mesh from './3dtiles/Mesh.mjs'
import createGltf from './3dtiles/createGltf.mjs'
import Batched3DModel from './3dtiles/Batched3DModel.mjs'
import Tileset from './3dtiles/Tileset.mjs'
import SRSTranslator from './citygml/SRSTranslator.mjs'
import fs from 'fs'
import Path from 'path'

import Cesium from 'cesium'


class Converter {

  /**
   * @param {Object} [options]
   */
  constructor (options) {
    this.options = Object.assign({
      propertiesGetter: null,
      objectFilter: null,
      srsProjections: {}
    }, options)
  }

  /**
   * @param {String} inputPath Path to CityGML XML file, or folder with multiple files
   * @param {String} outputFolder Path to folder to write 3D-Tiles files to
   */
  async convertFiles (inputPath, outputFolder) {
    let inputPaths = this._findInputFiles(inputPath)
    let srsTranslator = new SRSTranslator(this.options.srsProjections)

	for (let i=0; i<inputPaths.length; i++) {
		let cityObjects = []
		let boundingBox

      console.debug(`Reading CityGML file ${i + 1}/${inputPaths.length}...`)
      let cityDocument = CityDocument.fromFile(inputPaths[i], srsTranslator)
      let cityModel = cityDocument.getCityModel()
      let objs = cityModel.getCityObjects()
      console.debug(` Found ${objs.length} city objects.`)
      if (this.options.objectFilter) {
        objs = objs.filter(this.options.objectFilter)
        console.debug(` After filtering ${objs.length} city objects remain.`)
      }
      if (objs.length > 0) {
        cityObjects.push(...objs)
        boundingBox = cityModel.getBoundingBox()
      }

		console.debug(`Converting to 3D Tiles...`)
		let tilesets = await this.convertCityObjects(cityObjects, boundingBox)

		console.debug(`Writing 3D Tiles...`)
		for (let t=0; t<tilesets.length; t++) {
			if (tilesets[t]) {
				await tilesets[t].writeToFolder(outputFolder+'/'+String(t))
			}
		}
	  
    }
    
    console.debug('Done.')
  }

  /**
   * @param {Document} cityDocument
   * @returns {Tileset}
   */
  async convertCityDocument (cityDocument) {
    let cityModel = cityDocument.getCityModel()
    return await this.convertCityObjects(cityModel.getCityObjects(), cityModel.getBoundingBox())
  }

  /**
   * @param  {CityObject[]} cityObjects
   * @param  {BoundingBox} boundingBox
   * @returns {Tileset}
   */
  async convertCityObjects (cityObjects, boundingBox) {
	let tiledCityObjects = [[],[],[],[]]
	let tiledBoundingBoxes = [[],[],[],[]]
	let tiledMeshes = [[],[],[],[]]
	let tilesets = []
	
	let boundingBoxesTiles = boundingBox.gettiledBb()
	  
	  
    let meshes = cityObjects.map((cityObject) => {
      return Mesh.fromTriangleMesh(cityObject.getTriangleMesh())
    })
	
	let points = []
	meshes.forEach((mesh, i) => {
		let center = mesh.getCenter()
		let index = BoundingBox.whichBoundingBox(center, boundingBoxesTiles)
		tiledCityObjects[index].push(cityObjects[i])
		tiledBoundingBoxes[index].push(mesh.getBoundingBox())
		tiledMeshes[index].push(mesh)
		
//		points.push(Cesium.Cartographic.fromCartesian(center))
	})
	
	for (let i=0; i<tiledCityObjects.length; i++) {
		if (tiledCityObjects[i].length > 0) {
			let tileBoundingBox = BoundingBox.fromBoundingBoxes(tiledBoundingBoxes[i])
			let mesh = Mesh.batch(tiledMeshes[i])

			let batchTable = new BatchTable()
			tiledCityObjects[i].forEach((cityObject, c) => {
				batchTable.addFeature(c, this._getProperties(cityObject))
			})

			let gltf = await createGltf({
				mesh: mesh,
				useBatchIds: true,
				optimizeForCesium: true,
				relativeToCenter: true
			})
			let b3dm = new Batched3DModel(gltf, batchTable, boundingBox)

			tilesets.push(new Tileset(b3dm))
		} else {
			tilesets.push(undefined)
		}
	}
	return tilesets
  }

  /**
   * @param {CityObject} cityObject
   * @returns {Object}
   * @private
   */
  _getProperties (cityObject) {
    let properties = Object.assign(
      cityObject.getExternalReferences(),
      cityObject.getAttributes(),
    )
    if (this.options.propertiesGetter) {
      properties = Object.assign(properties,
        this.options.propertiesGetter(cityObject, properties)
      )
    }
    return properties
  }

  /**
   * @param {String} path
   * @returns {String[]}
   * @private
   */
  _findInputFiles (path) {
    if (!fs.existsSync(path)) {
      throw new Error(`Input path does not exist: ${path}`)
    }

    let paths
    if (fs.statSync(path).isDirectory()) {
      paths = fs.readdirSync(path)
        .map((filename) => Path.join(path, filename))
        .filter((path) => fs.statSync(path).isFile())
    } else {
      paths = [path]
    }
    paths = paths.filter((path) => ['.xml', '.gml'].includes(Path.extname(path)))

    if (paths.length < 1) {
      throw new Error(`Could not find any .xml/.gml files in path: ${path}`)
    }

    return paths
  }
}

export default Converter