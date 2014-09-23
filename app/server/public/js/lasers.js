var Laser = require('./Laser.js');

function lasers () {
  	THREE.Object3D.call(this);
}

lasers.prototype = new THREE.Object3D();
lasers.prototype.constructor = lasers;

lasers.prototype.update = function(delta) {
	var i = this.children.length;
	while(i > 0) {
		i--;
		var laser = this.children[i];
		if ( laser.timeTraveled < laser.stats.range ) { // if laser has not hit max range
			if (!laser.isDead) { // If laser is not dead (scheduled for removal)
				laser.move(delta); // Move the laser
				if (laser.testCollision()) {
					this.remove(laser);
					// TODO: Not garunteed to remove the right element as we add more sounds
					$( "audio" ).first().remove();
				}
			}
		} else {
			this.remove(laser);
			// TODO: Not garunteed to remove the right element as we add more sounds
			$( "audio" ).first().remove();
		}
	}
};

lasers.prototype.newLaser = function (position, rotation, velocity, owner, timeTraveled) {
	var laser = new Laser(position, rotation, velocity, owner, timeTraveled);
	this.add(laser);
};

lasers.prototype.newLaserFromServer = function(data) {
	console.log('laser added');
	var laser = new Laser(data.owner.ship.position, data.owner.ship.rotation.z, data.owner.ship.velocity, data.owner);
	this.add(laser);
};



module.exports = lasers;