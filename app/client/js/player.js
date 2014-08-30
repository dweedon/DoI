var ship = require('./ship.js');

function player(id, name) {
  	this.id = id;
  	this.name = name;
  	this.ship = new ship();
}

player.prototype = {

  ship : new ship(),

  input : {
    up    : false,
    down  : false,
    left  : false,
    right : false,
    space : false,
    reset : function () {
      this.up = false;
      this.down = false;
      this.left = false;
      this.right = false;
      this.space = false;
    }
  },

  accelerate : function (delta) {
    this.ship.velocity.x -= delta * this.ship.stats.accelRate *  Math.sin(this.ship.rotation.z); // Adjust X Velocity
    this.ship.velocity.y += delta * this.ship.stats.accelRate *  Math.cos(this.ship.rotation.z); // Adjust Y Velocity
    if ( this.ship.velocity.lengthSq() > Math.pow(this.ship.stats.maxSpeed, 2) ) // If the new velocity is too fast
      this.ship.velocity.setLength(this.ship.stats.maxSpeed); // Bring it back to max speed
  },

  turnLeft : function (delta) {
    this.ship.rotateOnAxis( new THREE.Vector3(0,0,1), delta * Math.PI/180 * this.ship.stats.turnRate); // Rotate Left
    if(this.ship.shipModel.rotation.z < this.ship.stats.maxBankAngle) { // If below max bank angle
      this.ship.shipModel.rotation.z += this.ship.stats.maxBankAngle * 0.05; // Bank the ship a little
      //this.ship.thrust.container.rotation.y -= this.ship.stats.maxBankAngle * 0.05; // Bank the thrust too
    }
  },

  turnRight: function (delta) {
    this.ship.rotateOnAxis( new THREE.Vector3(0,0,-1), delta * Math.PI/180 * this.ship.stats.turnRate); // Rotate Right
    if(this.ship.shipModel.rotation.z > -this.ship.stats.maxBankAngle) { // If below max bank angle
      this.ship.shipModel.rotation.z -= this.ship.stats.maxBankAngle * 0.05; // Bank the ship a little
      //this.ship.thrust.container.rotation.y += this.ship.stats.maxBankAngle * 0.05; // Bank the thrust too
    }
  },

  canFire : true,

  fireLaser : function (delta) {
    var self = this;
    if ( self.canFire ) {
      lasers.newLaser(this.ship.position, this.ship.rotation.z, this.ship.velocity);
      this.canFire = false;
      setTimeout(function() {
        self.canFire = true;
      }, 100);
    }
  },

  updateInput : function() {

  },

  update: function(update) {

      if (update.input.up) {
        this.accelerate(update.delta);
        //this.ship.thrust.on();
      } else {
        //this.ship.thrust.off();
      }
      if (update.input.left) {
        this.turnLeft(update.delta);
      }
      if (update.input.right) {
        this.turnRight(update.delta);
      }
      if (!update.input.left && !update.input.right ) {
        if (this.ship.shipModel.rotation.z > 0) {
          this.ship.shipModel.rotation.z -= this.ship.stats.maxBankAngle * 0.05;
          //this.ship.thrust.container.rotation.y += this.ship.stats.maxBankAngle * 0.05;
        }
        if (this.ship.shipModel.rotation.z < 0) {
          this.ship.shipModel.rotation.z += this.ship.stats.maxBankAngle * 0.05;
          //this.ship.thrust.container.rotation.y -= this.ship.stats.maxBankAngle * 0.05;
        }
      } 
      if (update.input.space) {
        this.fireLaser();
      }

    this.ship.position.x += update.delta * this.ship.velocity.x;
    this.ship.position.y += update.delta * this.ship.velocity.y;

  }

};

module.exports = player;

