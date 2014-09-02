// Camera setup
var Explosion = require('./explosion.js');
var Healthbar = require('./healthbar.js');

// Ship Constructor
function ship() {

  	THREE.Object3D.call(this);
  	this.velocity = new THREE.Vector3();

  	var _this = this;

  	this.shipModel = new THREE.Mesh();

    this.stats.health = this.stats.startHealth;

  	var jsonLoader = new THREE.JSONLoader();

    jsonLoader.load( "assets/ship.js", function(geometry, materials) {
  		var material = new THREE.MeshFaceMaterial( materials );
  		_this.shipModel = new THREE.Mesh( geometry, material );
  		_this.shipModel.rotateOnAxis( new THREE.Vector3(1,0,0), Math.PI / 2);
  		_this.add(_this.shipModel);
    });

    this.targeted = false;
    this.healthbar = new Healthbar();
    this.add(this.healthbar);


}

ship.prototype = new THREE.Object3D();
ship.prototype.constructor = ship;

ship.prototype.explode = function() {
  this.isExploding = true;
  this.explosion = new Explosion();
  this.add(this.explosion);
};
ship.prototype.isExploding = false;
ship.prototype.stats = {
  startHealth : 300,
  regen : 1, // Points Per Second  
  hitBoxRadius    : 2.75,
  turnRate  : 220,  // DEGREES PER SECOND
  accelRate : 35, // METERS PER SECOND PER SECOND
  maxSpeed  : 40,  // METERS PER SECOND
  maxBankAngle : 0.3,
  bankAngle: 0  // BANKING ANGLE * GRAPHIC EFFECT ONLY *
};

ship.prototype.takeDmg = function(dmg) {
  this.stats.health -= dmg;
  if (this.stats.health >= 0) 
    this.healthbar.setHealth(this.stats.health/this.stats.startHealth);
  if (this.stats.health <= 0) {
    if (!this.isExploding)
    this.explode();
  }
};






module.exports = ship;