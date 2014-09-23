var THREE = require('three'),
    sys         = require('sys');

function ship() {

	THREE.Object3D.call(this);

  // Create a unique velocity vector for movement calculation
  this.velocity = new THREE.Vector3();

  // Create unique health and energy properties
  this.health = this.stats.maxHealth;
  this.energy = this.stats.maxEnergy;

}

ship.prototype = new THREE.Object3D();
ship.prototype.constructor = ship;

// Shared stats
ship.prototype.stats = {
  maxEnergy    : 72,   // Max Energy
  maxHealth    : 300,  // Max HP
  regen        : 10,   // Regen per second
  hitBoxRadius : 2.75, // Unit size of hit box radius
  turnRate     : 220,  // Degrees per second
  accelRate    : 35,   // Units per second per second
  maxSpeed     : 40,   // Units per second
};

// Flags
ship.prototype.isExploding = false;
ship.prototype.canFire = true;
ship.prototype.isDead = false;

// Methods
ship.prototype.takeDmg = function(dmg, player) {
  this.health -= dmg;
  if (this.health <= 0 && !this.isExploding) {
    this.explode();
    player.kills++;
  }
};

ship.prototype.explode = function() {
  this.isExploding = true;
  var self = this;
  setTimeout(function() {
    self.isDead = true;
  }, 500);
}

ship.prototype.regen = function(delta) {
  if ( this.energy < this.stats.maxEnergy ) {
    this.energy += this.stats.regen * delta;
    if ( this.energy > this.stats.maxEnergy ) this.energy = this.stats.maxEnergy;
  }
  if ( this.health < this.stats.maxHealth ) {
    this.health += this.stats.regen * delta;
    if ( this.health > this.stats.maxHealth ) this.health = this.stats.maxHealth;
  }
};

ship.prototype.reset = function() {
  this.canFire = true;
  this.isDead = false;
  this.health = this.stats.maxHealth;
  this.energy = this.stats.maxEnergy;
  this.velocity.x = 0;
  this.velocity.y = 0;
  this.rotation.z = 0;
};


ship.prototype.fireLaser = function(player) {
  var self = this;
  if ( this.energy >= 3 && this.canFire ) {
    lasers.newLaser(this.position, this.rotation.z, this.velocity, player);
    this.canFire = false;
    this.energy -= 3;
    setTimeout(function() {
        self.canFire = true;
    }, 100);
  }
};

ship.prototype.accelerate = function (delta) {
  this.velocity.x -= delta * this.stats.accelRate *  Math.sin(this.rotation.z); // Adjust X Velocity
  this.velocity.y += delta * this.stats.accelRate *  Math.cos(this.rotation.z); // Adjust Y Velocity
  if ( this.velocity.lengthSq() > Math.pow(this.stats.maxSpeed, 2) ) // If the new velocity is too fast
    this.velocity.setLength(this.stats.maxSpeed); // Bring it back to max speed
};

ship.prototype.turnLeft = function (delta) {
  this.rotateOnAxis( new THREE.Vector3(0,0,1), delta * Math.PI/180 * this.stats.turnRate); // Rotate Left
};

ship.prototype.turnRight = function (delta) {
  this.rotateOnAxis( new THREE.Vector3(0,0,-1), delta * Math.PI/180 * this.stats.turnRate); // Rotate Right
};

ship.prototype.move = function(delta) {
    this.position.x += delta * this.velocity.x;
    this.position.y += delta * this.velocity.y;
};

ship.prototype.getPacket = function() {
  var self = this;

  var packet = {
    position : { x : self.position.x, y: self.position.y },
    rotation : self.rotation.z,
    velocity : { x : self.velocity.x, y: self.velocity.y },
    health   : self.health,
    energy   : self.energy,
    isExploding   : self.isExploding,
    isDead  : self.isDead
  }

  sys.log(packet.position.x);

  return packet;

}

module.exports = ship;