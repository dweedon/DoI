var Laser = require('./Laser.js');
function lasers (scene) {

	this.scene = scene;

	this.lasers = [];

	this.update = update;

	this.newLaser = newLaser;

	function update(delta) {

		var self = this;
		var i = this.lasers.length;
		while(i > 0) {
			i--;
			var laser = this.lasers[i];

			if ( laser.timeTraveled < laser.stats.range ) {

				if (!laser.isDead) {

					laser.position.x += delta * laser.velocity.x;
					laser.position.y += delta * laser.velocity.y;
					laser.timeTraveled += delta * 1;
					
					// Test for Collision with players
					for ( var id in players.players ) {
						var ship = players.players[id].ship;
						var d = laser.position.distanceTo(ship.position);
					    if ( d < ship.stats.hitBoxRadius ) 
					    {
					    	ship.takeDmg(laser.stats.dmg);
					    	laser.visible = false;
					    	laser.isDead = true;
					    }
					}
				}
			}
			else {
				scene.remove(laser);
				this.lasers.splice(i,1);
				// TODO: Not garunteed to remove the right element as we add more sounds
				$( "audio" ).first().remove();
			}
		}
	}

	function newLaser (position, rotation, velocity) {
		
		this.lasers.push(new Laser(position, rotation, velocity));
		scene.add(this.lasers[this.lasers.length - 1]);

	}
}
module.exports = lasers;