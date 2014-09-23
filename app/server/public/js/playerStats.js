module.exports = function() {

	var hp = document.getElementById('playerHP');
	var energy = document.getElementById('playerEnergy');
	hp.width = energy.width = 199;
	hp.height = energy.height = 12;

	var energyContext = energy.getContext('2d');
	var hpContext = hp.getContext('2d');

	this.bar = {
	    x: 1,
	    y: 1,
	    width: 200,
	    height: 10
	};

	this.update = update;


	function update(player) {
		// Clear the canvas
		hp.width = hp.width;
		energy.width = energy.width;

		var health = player.ship.health / player.ship.stats.maxHealth;
		var e = player.ship.energy / player.ship.stats.maxEnergy;
		if ( e > 0 ) {

			var g = Math.floor(255 * e);
			var gs = g.toString();

			energyContext.fillStyle = 'rgb(0,' + gs + ',255)';
			energyContext.fillRect(this.bar.x, this.bar.y, this.bar.width * e, this.bar.height);			
		}
		if ( health > 0 ) {
			hpContext.fillStyle = "#" + player.ship.healthbar.material.color.getHexString();
			hpContext.fillRect(this.bar.x, this.bar.y, this.bar.width * health, this.bar.height);
		}
	}

};