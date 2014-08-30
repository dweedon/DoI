// Player lighting setup


// Create some lights and position them
var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1.5 );
hemiLight.color.setHSL( 0.6, 1, 0.6 );
hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
hemiLight.position.set( 500, 500, 0 );

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


lighting = new THREE.Object3D(); // Add the lights to a container object
lighting.add(key);
lighting.add(hemiLight);

module.exports = lighting;