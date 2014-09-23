// background stars setup


var starCount = 250;

var geometry = new THREE.Geometry();

for ( i = 0; i < starCount; i ++ ) {

	var vertex = new THREE.Vector3();
	vertex.x = Math.random() * 300 - 150;
	vertex.y = Math.random() * 300 - 150;
	vertex.z = Math.random() * 100 - 100;
	geometry.vertices.push( vertex );

	color = new THREE.Color( 0xffffff );
	color.setHSL( Math.random(), Math.random() - 0.2, Math.random() + 0.2 );
	geometry.colors.push( color );

}

var material = new THREE.PointCloudMaterial({ 
	map: THREE.ImageUtils.loadTexture( "../assets/star.png" ),
	blending: THREE.AdditiveBlending,
	transparent: true,
	size: 2.5, 
	vertexColors: THREE.VertexColors
});

stars = new THREE.PointCloud( geometry, material );



stars.update = function (target) {

	// TODO: This is dumb but needed to fix a bug, bounding box does not seem to update, should be a cleaner way to fix...
	if (stars.geometry.boundingSphere !== null && stars.geometry.boundingSphere.radius !== 100000)  {
		stars.geometry.boundingSphere.radius = 100000;
	}

	for (var i = 0, l = stars.geometry.vertices.length; i < l; i++) {

		var star = stars.geometry.vertices[i];
		
		star.y = 
			target.y - star.y >  150 ? target.y + 150:
			target.y - star.y < -150 ? target.y - 150:
			star.y;

		star.x = 
			target.x - star.x >  150 ? target.x + 150:
			target.x - star.x < -150 ? target.x - 150:
			star.x;
		
	}
	stars.geometry.verticesNeedUpdate = true;

};

module.exports = stars;




