var lasers = {

	material : new THREE.SpriteMaterial( { 
		map: THREE.ImageUtils.loadTexture( "assets/particle.png" ), 
		transparent: true,
		blending: THREE.AdditiveBlending,
		color: 0xff0000,
		fog: true 
	} ),

	newLaser : function () {
		var sprite = new THREE.Sprite(this.material);
		sprite.velocity = new THREE.Vector3();
		sprite.end = new THREE.Vector3();
		return sprite; 
	}
};


module.exports = lasers;