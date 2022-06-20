function testSunShadow() {
	// position of the mesh
	var cameraTargetPosition = view.controls.getLookAtCoordinate();
	var meshCoord = cameraTargetPosition;
	meshCoord.altitude += 30;

	//Create a sphere that cast shadows (but does not receive them)
	var sphereGeometry = new THREE.SphereBufferGeometry( 5, 32, 32 );
	var sphereMaterial = new THREE.MeshStandardMaterial( { color: 0xff0000 } );
	var sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
	sphere.castShadow = true; //default is false
	sphere.receiveShadow = true; //default
	sphere.position.copy(meshCoord.as(view.referenceCrs));
	sphere.updateMatrixWorld(true);
	view.tileLayer.object3d.add( sphere );

	//sun.target = sphere;
	
	var sphere2 = new THREE.Mesh( sphereGeometry, sphereMaterial );
	sphere2.castShadow = true; //default is false
	sphere2.receiveShadow = true; //default
	var sphere2coord = meshCoord.clone();
	sphere2coord.x += 0.03; // 0.001;
	sphere2.position.copy(sphere2coord.as(view.referenceCrs));
	sphere2.updateMatrixWorld(true);
	view.tileLayer.object3d.add( sphere2 );
	
	
	

	var meshCoord2 = cameraTargetPosition;
	meshCoord2.altitude -= 10;

	meshCoord2.latitude += 0.01;

	//Create a plane that receives shadows (but does not cast them)
	var planeGeometry = new THREE.PlaneBufferGeometry( 5000, 40, 32, 32 );
	var planeMaterial = new THREE.MeshStandardMaterial( { color: 0x00ff00 } )
	var plane = new THREE.Mesh( planeGeometry, planeMaterial );
	plane.castShadow = true; //default is false
	plane.receiveShadow = true;
	plane.position.copy(meshCoord2.as(view.referenceCrs));
	plane.setRotationFromQuaternion( itowns.OrientationUtils.quaternionFromEnuToCRS ( 'EPSG:4978', meshCoord2 ) );
	view.tileLayer.object3d.add( plane );
}
