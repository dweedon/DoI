
var THREEx = require('./vendor/THREEx.js');
var input = require('./input.js');

var camera  		= require('./camera.js'),
	lighting 		= require('./lighting.js'),
	background		= require('./background.js'),
	renderer 		= require('./renderer.js'),
	clock 			= new THREE.Clock(),
	scene 			= new THREE.Scene(),
	Players			= require('./players.js');
	players 		= new Players(scene);
	Lasers			= require('./lasers');
	lasers 			= new Lasers(scene);
	soundRenderer 	= new THREE.SoundRenderer();

var user;

// Connection Stuff
var socket = io.connect('http://localhost');

$("#login button").click( function(e) {
	e.preventDefault();
	var loginInfo = {
		name : $("#login input[name='username']").val()
	};
	socket.emit("login", loginInfo);
});

socket.on('success', function(success) {
	$( ".login" ).remove();
	alert("Logged in as: " + success.name + " with an ID of: " + success.id);
});


var init, play;


var init = function() {

	scene.add(camera);
	scene.add(lighting);
	scene.add(background);

	$('#game').append( soundRenderer.domElement );
	$('#game').append( renderer.domElement );  // Add renderer to DOM
	THREEx.WindowResize(renderer, camera); // Resize game to fit window
	THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) }); // bind fullscreen mode to 'm' key



	user = players.addPlayer(1, 'David');
	players.addPlayer(2, 'NPC');
	user.camera = camera;

	play();

};

var play = function() {

	var delta = clock.getDelta();
	background.update(user.ship.position);
	camera.update(user.ship.position);
	lasers.update(delta);

	for ( var id in players.players ) {
		if ( id == user.id ) continue;
		players.players[id].update({
			delta: delta,
			input: {
				up: false,
				left: true,
				space: false,
				right: false,
				tab : false
			}
		});
	}
	user.update({
		delta : delta,
		input : input()
	});
	renderer.render(scene, camera);
	soundRenderer.render( scene, camera );
	requestAnimationFrame( play );
};


init();




