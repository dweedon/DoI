var ship = require('./ship.js');

function player(id, name) {
	this.id = id;
	this.name = name;
  this.kills = 0;
  this.deaths = 0;
  this.ship = new ship();
}

player.prototype = {

  ship : new ship(),

  packet : {},

  input : {},

  seq : 0,

  update: function(update) {

    // Save sequence number
    this.seq = update.seq;

    // If the player's ship is flagged as dead do nothing
    if (this.ship.isDead) return;

    if (!this.ship.isExploding) {

      // Handle the player's input
      if (update.input.up) this.ship.accelerate(update.delta);
      if (update.input.left) this.ship.turnLeft(update.delta);
      if (update.input.right) this.ship.turnRight(update.delta);
      if (update.input.space) this.ship.fireLaser(this);

      // Regen the ship's hp and energy
      this.ship.regen(update.delta);

    }

    // Update the ship's position
    this.ship.move(update.delta);


  }

};

module.exports = player;