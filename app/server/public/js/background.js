// background stars setup


var starCount = 1000;

var geometry = new THREE.Geometry();

for ( i = 0; i < starCount; i ++ ) {

	var vertex = new THREE.Vector3();
	vertex.x = Math.random() * 600 - 300;
	vertex.y = Math.random() * 600 - 300;
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
stars.sortParticles = true;

stars.update = function (target) {

	for (var i = 0, l = stars.geometry.vertices.length; i < l; i++) {

		var star = stars.geometry.vertices[i];
		
		star.y = 
			target.y - star.y >  300 ? target.y + 300:
			target.y - star.y < -300 ? target.y - 300:
			star.y;
		star.x = 
			target.x - star.x >  300 ? target.x + 300:
			target.x - star.x < -300 ? target.x - 300:
			star.x;
		
	}

	stars.geometry.verticesNeedUpdate = true;

};

module.exports = stars;




