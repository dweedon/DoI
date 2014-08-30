// Camera setup


// Ship Constructor
function ship() {

  	THREE.Object3D.call(this);
  	this.velocity = new THREE.Vector3();

  	var _this = this;

  	this.shipModel = new THREE.Mesh();

  	var jsonLoader = new THREE.JSONLoader();
	jsonLoader.load( "assets/ship.js", function(geometry, materials) {
		var material = new THREE.MeshFaceMaterial( materials );
		_this.shipModel = new THREE.Mesh( geometry, material );
		_this.shipModel.rotateOnAxis( new THREE.Vector3(1,0,0), Math.PI / 2);
		_this.add(_this.shipModel);
	});

}
ship.prototype = new THREE.Object3D();
ship.prototype.constructor = ship;
ship.prototype.stats = {  
  turnRate  : 220,  // DEGREES PER SECOND
  accelRate : 35, // METERS PER SECOND PER SECOND
  maxSpeed  : 40,  // METERS PER SECOND
  maxBankAngle : 0.3,
  bankAngle: 0  // BANKING ANGLE * GRAPHIC EFFECT ONLY *
};

module.exports = ship;