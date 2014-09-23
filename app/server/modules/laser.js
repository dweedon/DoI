function Laser(position, rotation, velocity, owner, timeTraveled) {

	THREE.Object3D.call(this);

  	this.owner = owner;

  	this.timeTraveled = timeTraveled || 0;

  	// Copy ship rotation and then randomize slightly based on set accuracy
  	this.rotation.z = rotation;
	this.rotateOnAxis( new THREE.Vector3(0,0,1), Math.PI/180 * ( Math.random() * this.stats.accuracy ));  	

	// Copy ship velocity then add new velocity based on rotation and set speed
	this.velocity = new THREE.Vector3();
	this.velocity.x = velocity.x - (this.stats.speed * Math.sin(this.rotation.z));
	this.velocity.y = velocity.y + (this.stats.speed * Math.cos(this.rotation.z));

	// Position a little above game plane and directly in front of ship
	this.position.x = position.x - ( 3 * Math.sin(this.rotation.z));
	this.position.y = position.y + ( 3 * Math.cos(this.rotation.z));
	this.position.z = 0.2;

}

Laser.prototype = new THREE.Object3D();
Laser.prototype.constructor = Laser;

Laser.prototype.stats = {
	speed : 40,
	range : 1,
	accuracy : 5,
	dmg : 10
};

Laser.prototype.move = function(delta) {
	this.position.x += delta * this.velocity.x;
	this.position.y += delta * this.velocity.y;
	this.timeTraveled += delta * 1;
};

Laser.prototype.testCollision = function(players) {
	for ( var i = 0, l = players.ships.children.length; i < l; i++ ) {
		var ship = players.ships.children[i];
		var d = this.position.distanceTo(ship.position);
		if ( d < ship.stats.hitBoxRadius ) {
			ship.takeDmg(this.stats.dmg, this.owner);
			return true;
		}
	}
};

module.exports = Laser;
