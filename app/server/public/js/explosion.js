

function Explosion() {

	THREE.Sprite.call(this);

  	this.texture = THREE.ImageUtils.loadTexture( "assets/explosion.png" );
  	this.texture.wrapS = this.texture.wrapT = THREE.RepeatWrapping; 
  	this.texture.repeat.set(1/5, 1/5);

  	this.currentDisplayTime = 0;
  	this.currentTile = 0;

  	this.material = new THREE.SpriteMaterial({ 
		map: this.texture,
		blending: THREE.AdditiveBlending,
		fog: true 
	});

	this.visible = false;

	this.position.z = 2;
	this.scale.x = 12;
	this.scale.y = 12;
	this.scale.z = 12;

	
	this.startSound = new THREE.Sound3D("assets/explosion.wav", 220, 0.5, false);
	this.add(this.startSound);
	

}

Explosion.prototype = new THREE.Sprite(this.material);
Explosion.prototype.constructor = Explosion;

Explosion.prototype.currentDisplayTime = 0;
Explosion.prototype.currentTile = 0;
Explosion.prototype.numberOfTiles = 24;
Explosion.prototype.isOver = false;
Explosion.prototype.tileDisplayDuration = 50;

Explosion.prototype.update = function(delta) {
	
	this.currentDisplayTime += 1000 * delta;
	if (this.currentTile == 5) this.startSound.play();
	while (this.currentDisplayTime > this.tileDisplayDuration)
	{
		if (this.currentTile === this.numberOfTiles) this.isOver = true;
		this.visible = true;
		this.currentDisplayTime -= this.tileDisplayDuration;
		this.currentTile++;
		var currentColumn = this.currentTile % 5;
		this.texture.offset.x = currentColumn / 5;

		var currentRow = Math.floor( this.currentTile / 5 );
		this.texture.offset.y = 1 - (currentRow / 5);
	}
};

module.exports = Explosion;	