var Laser = require('./Laser.js');

function lasers () {
  	THREE.Object3D.call(this);
}

lasers.prototype = new THREE.Object3D();
lasers.prototype.constructor = lasers;

lasers.prototype.new = [];

lasers.prototype.update = function(delta, players) {
	var i = this.children.length;
	while(i > 0) {
		i--;
		var laser = this.children[i];
		if ( laser.timeTraveled < laser.stats.range ) { // if laser has not hit max range
			if (!laser.isDead) { // If laser is not dead (scheduled for removal)
				laser.move(delta); // Move the laser
				if (laser.testCollision(players)) {
					this.remove(laser);
				}
			}
		} else {
			this.remove(laser);
		}
	}
};

lasers.prototype.newLaser = function (position, rotation, velocity, owner, timeTraveled) {
	var laser = new Laser(position, rotation, velocity, owner, timeTraveled);
	this.add(laser);
	this.new.push(this.children[this.children.length - 1]);
};

lasers.prototype.getPacket = function() {
	var packet = [];
	while(this.new.length) {
		var laser = this.new.pop();
		packet.push({
			position: { x : laser.position.x, y:laser.position.y },
			velocity: { x : laser.velocity.x, y:laser.velocity.y },
			owner : laser.owner.id,
			timeTraveled : laser.timeTraveled,
			roation : laser.rotation.z
		});
	}
	return packet;
}

module.exports = lasers;