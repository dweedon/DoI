var ship = require('./ship.js');

function player(id, name) {
	this.id = id;
	this.name = name;
  this.kills = 0;
  this.deaths = 0;
  this.ship = new ship();
  this.inputs = [];
}

player.prototype = {

  ship : new ship(),

  serverUpdate : false,

  target : null,

  setTarget : function(target) {

    // If a target is already selected untarget it
    if (this.target !== null) this.target.ship.toggleTargeted();

    // Set the new target
    this.target = target;
    this.target.ship.toggleTargeted();

  },

  unsetTarget : function() {
    this.target.ship.toggleTargeted();
    this.target = null;
  },

  nextTarget : function() {

    var target;
    
    // If no target is selected, target the next player after this player (the user)
    if ( this.target === null ) {

      target = players.nextPlayer(this);

      // If the next player was also this player, then select no target
      if (target === this) return; 
    }

    // If a target is selected, target the next player after the current target
    else {
      target = players.nextPlayer(this.target); 

      // If the next player was also this player, then select no new target and deselect the current target
      if (target === this) {
        this.unsetTarget();
        return;
      }
    }

    // Set the target if everything above gets through
    this.setTarget(target);

  },

  handleServerUpdate: function() {

    // Accept Server Position Information
    this.ship.position.x = this.serverUpdate.ship.position.x;
    this.ship.position.y = this.serverUpdate.ship.position.y;
    this.ship.rotation.z = this.serverUpdate.ship.rotation;
    this.ship.velocity.x = this.serverUpdate.ship.velocity.x;
    this.ship.velocity.y = this.serverUpdate.ship.velocity.y;
    this.ship.health = this.serverUpdate.ship.health;
    this.ship.energy = this.serverUpdate.ship.energy;

    if ( this.serverUpdate.ship.isExploding ) this.ship.explode();

    if (this.inputs.length > 0) {
    
      var lastSeqIndex = -1;

      // Find and store the input index that the update from the server is associated with
      for(var i = 0, l = this.inputs.length; i < l; ++i) {
        if ( this.inputs[i].seq == this.serverUpdate.seq ) {
          lastSeqIndex = i;
          break;
        }
      }

      // Assuming we found a matching input seq from the server, dump everything before it
      if(lastSeqIndex != -1) {
        var numberToClear = Math.abs(lastSeqIndex + 1);
        this.inputs.splice(0, numberToClear);
      }

      // For each remaining input reprocess positioning except last
      for(i = 0, l = this.inputs.length - 1; i<l; i++) {
        
        var input = this.inputs[i].input;
        var delta = this.inputs[i].delta;
        if (input.up) this.ship.accelerate(delta);
        if (input.left) this.ship.turnLeft(delta);
        if (input.right) this.ship.turnRight(delta);
        this.ship.move(delta);

      }

      this.handleInput(this.inputs[this.inputs.length - 1]);

    }

    // Clear server update
    this.serverUpdate = false;


  },

  handleInput : function(input) {
    if (input.input.up) this.ship.accelerate(input.delta);
    if (input.input.left) this.ship.turnLeft(input.delta);
    if (input.input.right) this.ship.turnRight(input.delta);
    if (!input.input.left && !input.input.right ) this.ship.resetBankAngle(input.delta);
    if (input.input.tab) this.nextTarget();
    if (input.input.space) this.ship.fireLaser(this);
  },

  update: function(delta) {

    // If the player's ship is flagged as dead do nothing
    if (this.ship.isDead) return;

      if (this.ship.health <= 0 &&  !this.ship.isExploding ) {
        this.ship.explode();
      }

      // If the player's ship has a target, and the target's ship is dead, reset this players target to null
      if (this.target && this.target.ship.isDead) this.target = null;

      // Check for an update from the server, and recalculate position based on server position or just do local positioning
      if (this.serverUpdate) this.handleServerUpdate();
      else if (this.inputs.length > 0) this.handleInput(this.inputs[this.inputs.length - 1]);

      // Regen the ship's hp and energy
      this.ship.regen(delta);

      // Move the ship
      this.ship.move(delta);

      // Handle Explosion
      if (this.ship.isExploding) {

        // Progress Explosion Frames
        this.ship.explosion.update(delta);
        
        // Hide this player's ship when the explosion gets to frame 13 (largest part of animation)
        if( this.ship.explosion.currentTile == 13 ) this.ship.shipModel.visible = false;

        // Remove this player's ship when explosion is over and increase this players death count
        if ( this.ship.explosion.isOver ) { 
          players.removeShip(this.ship);
          this.ship.isDead = true;
          this.deaths++;
        }

      }
  }

};

module.exports = player;

