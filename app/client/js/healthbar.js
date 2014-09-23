function Healthbar() {

	THREE.Sprite.call(this);

  	this.map = THREE.ImageUtils.loadTexture( "assets/healthbar.png" );
  	this.material = new THREE.SpriteMaterial({ 
		map: this.map,
		color:  new THREE.Color( "rgb(0,255,0)" )
	});

	this.visible = false;
	this.scale.x = 7.5;
	this.scale.y = 7.5;

}

Healthbar.prototype = new THREE.Sprite();

Healthbar.prototype.constructor = Healthbar;

Healthbar.prototype.position.z = 2;

Healthbar.prototype.setHealth = function(h) {
	this.scale.x = h * 7.5;
	if ( h > 0.7 ) {
		this.material.color.g = 1;
		this.material.color.r = (1 - h) * (1/0.3);
	} else {
		this.material.color.g = h * (1/0.7);
		this.material.color.r = 1;
	} 
};

module.exports = Healthbar;