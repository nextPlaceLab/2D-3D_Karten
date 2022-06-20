#!/usr/bin/env node

import caporal from 'caporal'
import Converter from './src/Converter.mjs'
//import Converter from './src_tiled_c3dt/Converter.mjs'
//import Converter from './src_original_Source/Converter.mjs'
import fs from 'fs'

caporal
  .argument('<input-citygml>', 'Input path of CityGML XML file, or folder with multiple files', (path) => {
    if (!fs.existsSync(path)) {
      throw new Error('File does not exist: ' + path)
    }
    return path
  })
  .argument('<output-3dtiles>', 'Output folder where to create 3D-Tiles')
  .action(async function (args, options, logger) {
    //let converter = new Converter()
	let converter = new Converter({
					srsProjections: {
						'urn:adv:crs:ETRS89_UTM32*DE_DHHN2016_NH*GCG2016': '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
						'urn:ogc:def:crs:EPSG::25832': '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
					}
				});
    logger.info('Converting...')
    await converter.convertFiles(args['inputCitygml'], args['output3Dtiles'])
    logger.info('Done.')
  })

caporal.parse(process.argv)
