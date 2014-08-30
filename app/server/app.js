var http    		= require('http'),
	
    sys     		= require('sys'),
    express 		= require('express'),
    bodyParser 		= require('body-parser');
    io 				= require('socket.io');

   	// Game Imports

var port = 3000;


var app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser());

var socket = io.listen(http.createServer(app).listen(port, 'localhost'));
sys.log('Started server on http://localhost:' + port + '/')

socket.sockets.on('connection', function(client) {
	


	sys.log('Client Connected');



});