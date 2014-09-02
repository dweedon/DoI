function Healthbar() {

	THREE.Sprite.call(this);

  	this.setHealth = setHealth;

  	this.color = new THREE.Color( "rgb(0,255,0)" );

  	this.map = THREE.ImageUtils.loadTexture( "assets/healthbar.png" );
  	this.material = new THREE.SpriteMaterial({ 
		map: this.map,
		color: this.color
	});

	this.position.z = 2;
	this.position.y = 0;

	this.scale.x = 7.5;
	this.scale.y = 7.5;



  	function setHealth(health) {
  		var h = health * 7.5;
  		this.scale.x = h;
  		this.material = new THREE.SpriteMaterial({ 
			map: this.map,
			color:  this.color.lerp( new THREE.Color( "rgb(255,0,0)" ), 1/h )
		});
  	}


}

Healthbar.prototype = new THREE.Sprite( 
	new THREE.SpriteMaterial({ 
		map: THREE.ImageUtils.loadTexture( "assets/healthbarborder.png" ),
		blending : THREE.AdditiveBlending
	})
);

Healthbar.prototype.constructor = Healthbar;

module.exports = Healthbar;