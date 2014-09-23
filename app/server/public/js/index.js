// Connection Stuff
var socket = io.connect();

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



// Game Stuff

var renderer 		= require('./renderer.js'),
	camera  		= require('./camera.js'),
	lighting 		= require('./lighting.js'),
	background		= require('./background.js'),
	PlayerStats 	= require('./playerStats.js'),
	Lasers			= require('./lasers'),
	THREEx 			= require('./vendor/THREEx.js'),
	input 			= require('./input.js'),
	playerStats 	= new PlayerStats(),
	clock 			= new THREE.Clock(),
	scene 			= new THREE.Scene(),
	soundRenderer 	= new THREE.SoundRenderer();

	// Globals TODO: BAD FIX PLZ
	mm = require('./mm.js');
	players = require('./players.js');
	lasers 	= new Lasers();

var user;

socket.on('init', function(init) {
	setup(init);
});

socket.on('newPlayer', function(player) {
	players.addPlayer(player.id, player.name);
});

socket.on('removePlayer', function(player) {
	players.removePlayer(player);
});

socket.on('update', function(update) {

	// Handle Player Update
	for ( var i = 0, l = update.players.length; i<l; i++ ) {
		var player = players.lookup(update.players[i].id);
		player.serverUpdate = update.players[i];
	}

	
	
	for ( i = 0, l = update.lasers.length; i<l; i++ ) {
		var owner = players.lookup(update.lasers[i].owner);
		console.log(update.lasers[i].owner);
		if (owner === user) continue;
		
		update.lasers[i].owner = owner;
		lasers.newLaserFromServer(update.lasers[i]);
	}
	

});

function setup(init) {

	// Turn off default input TODO: Make this more selective
	$(document).keydown(function(event){ event.preventDefault(); });

	// Setup scene
	scene.add(camera);
	scene.add(background);
	scene.add(players.ships);
	scene.add(lighting);
	scene.add(lasers);

	mm.scene.add(mm.camera);
	mm.scene.add(mm.blips);

	// Add renderers to DOM
	$('#game').append( soundRenderer.domElement );
	$('#game').append( renderer.domElement );
	$('#game').append( mm.renderer.domElement );

	// Handle window resizing
	THREEx.WindowResize(renderer, camera); 

	// Bind fullscreen mode to 'm' key
	THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) }); 

	// Spawn players
	for ( var i = 0, l = init.players.length; i<l; i++ ) {
		players.addPlayer(init.players[i].id, init.players[i].name);
	}

	// Set User
	user = players.lookup(init.id);

	play();

}

function play() {

	// Get time delta
	var delta = clock.getDelta();

	// Update the lasers
	lasers.update(delta);

	

	var newInput = {
		input : input.getInput(),
		seq : input.getSeq(),
		delta : delta
	};

	user.inputs.push(newInput);
	socket.emit('input', newInput);

	// update all players
	for (var i = 0, l = players.players.length; i<l; i++) {
		players.players[i].update(delta);
	}

	// update user onscreen stats
	playerStats.update(user);

	// Loop the background
	background.update(user.ship.position);

	// Update Camera
	camera.update(user.ship.position);

	// Update the minimap camera
	mm.camera.update(user.ship.position);
	// Renderers
	mm.renderer.render(mm.scene, mm.camera);
	renderer.render(scene, camera);
	soundRenderer.render( scene, camera );

	// Recursion
	requestAnimationFrame( play );

	$('#testvar').text('deaths:' + user.deaths + ' kills:' + user.kills +'\n x:' + Math.floor(user.ship.position.x) + ' y:' + Math.floor(user.ship.position.y));

}




