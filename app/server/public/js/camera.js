// Camera setup
var zoom = 1,
	VIEW_ANGLE = 30, 
	ASPECT = window.innerWidth / window.innerHeight, 
	NEAR = 0.1, 
	FAR = 20000;

var camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR); // Create Camera

camera.update = function (target) {
	camera.position.x = target.x;
	camera.position.y = target.y - (70 * zoom);
};

camera.position.set(0,-70*zoom,150*zoom); // Set camera above and behind the targt
camera.lookAt(new THREE.Vector3(0,0,0)); // Set camera to look at the target

module.exports = camera;