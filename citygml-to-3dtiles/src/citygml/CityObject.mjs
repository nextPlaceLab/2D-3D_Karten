import Envelope from './Envelope.mjs'

class CityObject {

  /**
   * @param {CityNode} cityNode
   */
  constructor (cityNode) {
    this.cityNode = cityNode
  }

  /**
   * @returns {Envelope|Null}
   */
  getEnvelope () {
    let envelopeNode = this.cityNode.findCityNode('./gml:boundedBy/gml:Envelope')
    if (!envelopeNode) {
      return null
    }
    return new Envelope(envelopeNode)
  }

  /**
   * @returns {TriangleMesh}
   */
  getTriangleMesh () {
    throw new Error('Not implemented')
  }

  /**
   * @returns {Object}
   */
  getAttributes () {
    const tagNames = [
      'gen1:stringAttribute',
      'gen1:intAttribute',
      'gen1:doubleAttribute',
      'gen1:dateAttribute',
      'gen1:uriAttribute',
      'gen1:measureAttribute',
      'gen2:stringAttribute',
      'gen2:intAttribute',
      'gen2:doubleAttribute',
      'gen2:dateAttribute',
      'gen2:uriAttribute',
      'gen2:measureAttribute',
    ]
    const query = './/(' + tagNames.join('|') + ')'
    const attrs = {}
    this.cityNode.selectCityNodes(query).forEach(node => {
      const name = node.getAttribute('name')
      let value = node.selectNode('./(gen1:value|gen2:value)').textContent
      let tagName = node.getLocalName()
      if (tagName === 'intAttribute') {
        value = parseInt(value)
      }
      if (tagName === 'doubleAttribute' || tagName === 'measureAttribute') {
        value = parseFloat(value)
      }
      attrs[name] = value
    })
	
	// additional CityGML attributes
	const opttagNames = [
		'bldg1:function',
		'bldg1:roofType',
		'bldg1:measuredHeight',
		'bldg1:storeysAboveGround',
		'bldg2:function',
		'bldg2:roofType',
		'bldg2:measuredHeight',
		'bldg2:storeysAboveGround',
		'xal:CountryName',
		'xal:LocalityName',
		'xal:ThoroughfareNumber',
		'xal:ThoroughfareName',
		'xal:PostalCodeNumber',
	]
	
    const optquery = './/(' + opttagNames.join('|') + ')'
    this.cityNode.selectNodes(optquery).forEach(node => {
      const tagName = node.localName
      let value = node.textContent
      if (tagName === 'roofType' || tagName === 'storeysAboveGround' || tagName === 'PostalCodeNumber') {
        value = parseInt(value)
      }
      if (tagName === 'measuredHeight') {
        value = parseFloat(value)
      }
	  if (tagName === 'LocalityName' || tagName === 'ThoroughfareName') {
		value = replaceUmlauts(value)
	  }
      attrs[tagName] = value
    })

    return attrs
  }

  /**
   * @returns {Object}
   */
  getExternalReferences () {
    const refs = {}
    this.cityNode.selectCityNodes('./citygml1:externalReference').forEach(node => {
//      const name = node.selectNode('./citygml1:informationSystem').textContent
	  const name = 'gmlid'
      refs[name] = node.selectNode('./citygml1:externalObject/citygml1:name').textContent
    })
    return refs
  }

  /**
   * @returns {Cesium.Cartesian3|Null}
   */
  getAnyPoint () {
    let posLists = this.cityNode.selectCityNodes('.//gml:posList')
    if (posLists.length === 0) {
      return null
    }
    let coordinates = posLists[0].getTextAsCoordinates()
    if (coordinates.length === 0) {
      return null
    }
    return coordinates[0]
  }
}

function replaceUmlauts(string) {
	string = string.replace(/Ã„/g, "Ä");
	string = string.replace(/Ã¤/g, "ä");
	string = string.replace(/Ã–/g, "Ö");
	string = string.replace(/Ã¶/g, "ö");
	string = string.replace(/Ãœ/g, "Ü");
	string = string.replace(/Ã¼/g, "ü");
	string = string.replace(/ÃŸ/g, "ß");
	return string
}

// function replaceUmlauts(string) {
	// string = string.replace(/Ã„/g, "Ae");
	// string = string.replace(/Ã¤/g, "ae");
	// string = string.replace(/Ã–/g, "Oe");
	// string = string.replace(/Ã¶/g, "oe");
	// string = string.replace(/Ãœ/g, "Ue");
	// string = string.replace(/Ã¼/g, "ue");
	// string = string.replace(/ÃŸ/g, "ss");
	// return string
// }

// function replaceUmlauts(string) {
	// string = string.replace(/\u00c4/g, "Ae");
	// string = string.replace(/\u00e4/g, "ae");
	// string = string.replace(/\u00d6/g, "Oe");
	// string = string.replace(/\u00f6/g, "oe");
	// string = string.replace(/\u00dc/g, "Ue");
	// string = string.replace(/\u00fc/g, "ue");
	// string = string.replace(/\u00df/g, "ss");
	// return string
// }

export default CityObject
