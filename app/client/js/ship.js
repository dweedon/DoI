var Explosion = require('./explosion.js');
var Healthbar = require('./healthbar.js');
var mm    = require('./mm.js');

function ship() {

	THREE.Object3D.call(this);
  var self = this;

  // Load ship model
  this.loader.load( "assets/ship.js", function(geometry, materials) {
		var material = new THREE.MeshFaceMaterial( materials );
		self.shipModel = new THREE.Mesh( geometry, material );
		self.shipModel.rotateOnAxis( new THREE.Vector3(1,0,0), Math.PI / 2);
		self.add(self.shipModel);

    var key = new THREE.DirectionalLight( 0xffffff, 0.3 );
    key.position.set( -2, -2, 3 );
    key.position.multiplyScalar( 30 );
    key.castShadow = true;
    var d = 5;
    key.shadowCameraLeft = -d;
    key.shadowCameraRight = d;
    key.shadowCameraTop = d;
    key.shadowCameraBottom = -d;
    key.shadowDarkness = 0.5;

    self.add(key);
    self.add(hemiLight);

  });

  // Generate the healthbar
  this.healthbar = new Healthbar();
  this.add(this.healthbar);

  // Generate the minimap blip
  this.blip = new mm.blip();

  // Create a unique velocity vector for movement calculation
  this.velocity = new THREE.Vector3();

  // Create unique health and energy properties
  this.health = this.stats.maxHealth;
  this.energy = this.stats.maxEnergy;

}

ship.prototype = new THREE.Object3D();
ship.prototype.constructor = ship;

// Setup stuff
ship.prototype.loader = new THREE.JSONLoader();
ship.prototype.shipModel = new THREE.Mesh();

// Shared stats
ship.prototype.stats = {
  maxEnergy    : 72,   // Max Energy
  maxHealth    : 300,  // Max HP
  regen        : 10,   // Regen per second
  hitBoxRadius : 2.75, // Unit size of hit box radius
  turnRate     : 220,  // Degrees per second
  accelRate    : 35,   // Units per second per second
  maxSpeed     : 40,   // Units per second
  maxBankAngle : 0.3,  // Maximum banking angle
  bankAngle    : 0     // Current bank angle
};

// Flags
ship.prototype.isExploding = false;
ship.prototype.canFire = true;
ship.prototype.isTargeted = false;
ship.prototype.isDead = false;
ship.prototype.turning = false;

// Methods
ship.prototype.takeDmg = function(dmg, player) {
  this.health -= dmg;
  this.healthbar.setHealth(this.health/this.stats.maxHealth);
  if (this.health <= 0 && !this.isExploding) {
    this.explode();
    player.kills++;
  }
};

ship.prototype.regen = function(delta) {
  if ( this.energy < this.stats.maxEnergy ) {
    this.energy += this.stats.regen * delta;
    if ( this.energy > this.stats.maxEnergy ) this.energy = this.stats.maxEnergy;
  }
  if ( this.health < this.stats.maxHealth ) {
    this.health += this.stats.regen * delta;
    if ( this.health > this.stats.maxHealth ) this.health = this.stats.maxHealth;
  }
  this.healthbar.setHealth(this.health/this.stats.maxHealth);
};

ship.prototype.reset = function() {
  this.isExploding = false;
  this.canFire = true;
  this.isDead = false;
  this.isTargeted = false;
  this.health = this.stats.maxHealth;
  this.energy = this.stats.maxEnergy;
  this.shipModel.visible = true;
  this.velocity.x = 0;
  this.velocity.y = 0;
  this.rotation.z = 0;
  this.remove(this.explosion);
};

ship.prototype.explode = function() {
  this.isExploding = true;
  this.healthbar.visible = false;
  this.explosion = new Explosion();
  this.add(this.explosion);
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
  if(this.shipModel.rotation.z < this.stats.maxBankAngle) { // If below max bank angle
    this.shipModel.rotation.z += this.stats.maxBankAngle * 5 * delta; // Bank the ship a little
  }
};

ship.prototype.turnRight = function (delta) {
  this.rotateOnAxis( new THREE.Vector3(0,0,-1), delta * Math.PI/180 * this.stats.turnRate); // Rotate Right
  if(this.shipModel.rotation.z > -this.stats.maxBankAngle) { // If below max bank angle
    this.shipModel.rotation.z -= this.stats.maxBankAngle *  5 * delta; // Bank the ship a little
  }
};

ship.prototype.resetBankAngle = function (delta) {
  if (this.shipModel.rotation.z > 0) 
    this.shipModel.rotation.z -= this.stats.maxBankAngle * 5 * delta;
  if (this.shipModel.rotation.z < 0) 
    this.shipModel.rotation.z += this.stats.maxBankAngle * 5 * delta;
};

ship.prototype.move = function(delta) {
    this.position.x += delta * this.velocity.x;
    this.position.y += delta * this.velocity.y;
    this.blip.position.x = this.position.x;
    this.blip.position.y = this.position.y;
};

ship.prototype.toggleTargeted = function() {
  if (this.isTargeted) {
    this.isTargeted = false;
    this.blip.toggleBlink("off");
    this.healthbar.visible = false;
  } else {
    this.isTargeted = true;
    this.blip.toggleBlink("on");
    this.healthbar.visible = true;
  }
};

ship.prototype.updateFromServer = function(update) {

    this.position.x = update.position.x;
    this.position.y = update.position.y;
    this.rotation.z = update.rotation;
    this.velocity.x = update.velocity.x;
    this.velocity.y = update.velocity.y;
    this.health = update.health;
    this.energy = update.energy;

};

module.exports = ship;