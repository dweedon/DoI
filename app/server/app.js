var http    		= require('http'),
    sys     		= require('sys'),
    express 		= require('express'),
    bodyParser 		= require('body-parser');
    io 				= require('socket.io');

    THREE			= require('three');
    players			= require('./modules/players.js');
    Lasers			= require('./modules/lasers.js');
    lasers 			= new Lasers();

   	// Game Imports

var port = 3000;

var app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser());

var socket = io.listen(http.createServer(app).listen(port, '0.0.0.0'));
sys.log('Started server on http://localhost:' + port + '/');

socket.sockets.on('connection', function(client) {
	
	var clock  = new THREE.Clock();
	var user = players.addPlayer('David');

	client.emit('init', {
		id : user.id,
		players : players.getPacket()
	});

	client.broadcast.emit('newPlayer', {
		id: user.id,
		name: user.name
	});

	client.on('disconnect', function() {
		players.removePlayer(user.id);
		socket.sockets.emit('removePlayer', user.id);
	});

	client.on('input', function(input) {
		// Fake some lag
		var delta = clock.getDelta();
		user.update({
			delta : delta,
			input : input.input,
			seq   : input.seq,
		});
		lasers.update(delta, players);
	});

});

var updateLoop = function() {
	socket.sockets.emit('update', {
		players : players.getPacket(),
		lasers  : lasers.getPacket()
	});
	setTimeout(updateLoop, 10);
}
updateLoop();