var Detector = require('./vendor/Detector.js');

if ( Detector.webgl ) 
	renderer = new THREE.WebGLRenderer( {antialias:true} ); // if browser suports webgl use webgl renderer
else 
	renderer = new THREE.CanvasRenderer(); // fallback

renderer.setSize(window.innerWidth, window.innerHeight); // set renderer size based on window size
renderer.shadowMapEnabled = true; // Shadows allowed

module.exports = renderer;