function initSunTarget () {
	var targetObject = new THREE.Object3D();
	targetObject.position.copy(posObs.as(view.referenceCrs));
	view.tileLayer.object3d.add( targetObject );
	sun.target = targetObject;
}

function rotateZ (dx, dy, dz, alpha) {
	let alpha_rad = alpha / 180 * Math.PI;
	
	return {dx: dx * Math.cos(alpha_rad) + dy * Math.sin(alpha_rad),
		dy: dx * - Math.sin(alpha_rad) + dy * Math.cos(alpha_rad),
		dz: dz
	}
}

function rotateY (dx, dy, dz, alpha) {
	let alpha_rad = alpha / 180 * Math.PI;
	
	return {dx: dx * Math.cos(alpha_rad) + dz * Math.sin(alpha_rad),
		dy: dy,
		dz: dx * - Math.sin(alpha_rad) + dz * Math.cos(alpha_rad)
	}
}

function setSunPosition (e) {
	let minutes = 0;
	if ( (e.target.value % 1).toFixed(1) != 0 ) { minutes = 30 };
	
	let time = new Date(now.getFullYear(), now.getMonth(), now.getDate(), e.target.value, minutes);
	now = time;
	let astroTime = new Astronomy.MakeTime(time);
	
	let pos = new Astronomy.MakeObserver( positionOnGlobe.latitude, positionOnGlobe.longitude, 0);
	
	let eq = Astronomy.Equator("Sun", astroTime, pos, true);
	let sunPosition = Astronomy.Horizon(astroTime, pos, eq.ra, eq.dec, true)
	
	//console.log(time);
	//console.log(geoVector);
	//console.log(rotMat);
	//console.log(sunPosition);
	
	let dz = sunAlt * Math.sin(sunPosition.altitude / 180 * Math.PI);
	let b = sunAlt * Math.sin((90 - sunPosition.altitude) / 180 * Math.PI);
	let dx = b * Math.sin((90 - (180 - sunPosition.azimuth)) / 180 * Math.PI);
	let dy = b * Math.sin((180 - sunPosition.azimuth) / 180 * Math.PI);
	
	let sunPosRotZ = rotateZ (dx, dy, dz, - positionOnGlobe.longitude);
	let sunPosRotY = rotateY (sunPosRotZ.dx, sunPosRotZ.dy, sunPosRotZ.dz, 90 - positionOnGlobe.latitude);
	
	let sunPos = new itowns.Coordinates('EPSG:4978', sunPosRotY.dx + posObs.x, sunPosRotY.dy + posObs.y, sunPosRotY.dz + posObs.z);
	
	<!-- console.log(dx, dy, dz); -->
	<!-- console.log(sunPosRotZ); -->
	//console.log(sunPosRotY);
	//console.log(posObs);

	//console.log(sunPos);

	sun.position.copy(sunPos);
	
	let datefield = document.getElementById('datefield');
	datefield.value = time.toLocaleString();

	view.notifyChange();
}

function setSunPositionDate (time) {
	//let time = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0);
	let astroTime = new Astronomy.MakeTime(time);
	
	let pos = new Astronomy.MakeObserver( positionOnGlobe.latitude, positionOnGlobe.longitude, 0);
	
	let eq = Astronomy.Equator("Sun", astroTime, pos, true);
	
	let sunPosition = Astronomy.Horizon(astroTime, pos, eq.ra, eq.dec, true)
	
	let dz = sunAlt * Math.sin(sunPosition.altitude / 180 * Math.PI);
	let b = sunAlt * Math.sin((90 - sunPosition.altitude) / 180 * Math.PI);
	let dx = b * Math.sin((90 - (180 - sunPosition.azimuth)) / 180 * Math.PI);
	let dy = b * Math.sin((180 - sunPosition.azimuth) / 180 * Math.PI);
	
	let sunPosRotZ = rotateZ (dx, dy, dz, - positionOnGlobe.longitude);
	let sunPosRotY = rotateY (sunPosRotZ.dx, sunPosRotZ.dy, sunPosRotZ.dz, 90 - positionOnGlobe.latitude);
	
	let sunPos = new itowns.Coordinates('EPSG:4978', sunPosRotY.dx + posObs.x, sunPosRotY.dy + posObs.y, sunPosRotY.dz + posObs.z);
	
	//console.log(sunPosRotY);
	//console.log(posObs);
	//console.log(coord.as(view.referenceCrs));
	//console.log(sunPos);

	sun.position.copy(sunPos);

	view.notifyChange();
}
