// Player lighting setup


// Create some lights and position them
var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1.5 );
hemiLight.color.setHSL( 0.6, 1, 0.6 );
hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
hemiLight.position.set( 500, 500, 0 );


lighting = new THREE.Object3D(); // Add the lights to a container object
lighting.add(hemiLight);

module.exports = lighting;