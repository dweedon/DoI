(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var endSound = new THREE.Sound3D("assets/hit.wav", 220, 1.5, false);



function Laser(position, rotation, velocity) {

	THREE.Object3D.call(this);
  	this.sprite = new THREE.Sprite(this.spriteMaterial);
  	this.add(this.sprite);

  	// Copy ship rotation and then randomize slightly based on set accuracy
  	this.rotation.z = rotation;
	this.rotateOnAxis( new THREE.Vector3(0,0,1), Math.PI/180 * ( Math.random() * this.stats.accuracy ));  	

	// Copy ship velocity then add new velocity based on rotation and set speed
	this.velocity = new THREE.Vector3();
	this.velocity.x = velocity.x - (this.stats.speed * Math.sin(this.rotation.z));
	this.velocity.y = velocity.y + (this.stats.speed * Math.cos(this.rotation.z));

	// Position a little above game plane and directly in front of ship
	this.position.x = position.x - ( 3 * Math.sin(this.rotation.z));
	this.position.y = position.y + ( 3 * Math.cos(this.rotation.z));
	this.position.z = 0.2;

	// Sound
	this.startSound = new THREE.Sound3D("assets/laser.mp3", 220, 0.05, false);
	this.add(this.startSound);
	this.startSound.play();

}

Laser.prototype = new THREE.Object3D();
Laser.prototype.constructor = Laser;


Laser.prototype.spriteMaterial = new THREE.SpriteMaterial({ 
	map: THREE.ImageUtils.loadTexture( "assets/particle.png" ), 
	transparent: true,
	blending: THREE.AdditiveBlending,
	color: 0xff0000,
	fog: true 
});

Laser.prototype.stats = {
	speed : 40,
	range : 1,
	accuracy : 5,
	dmg : 10
};
Laser.prototype.timeTraveled = 0;





Laser.prototype.destroy = function() {

	this.sprite.visible = false;
};

module.exports = Laser;

},{}],2:[function(require,module,exports){
// background stars setup


var starCount = 1000;

var geometry = new THREE.Geometry();

for ( i = 0; i < starCount; i ++ ) {

	var vertex = new THREE.Vector3();
	vertex.x = Math.random() * 600 - 300;
	vertex.y = Math.random() * 600 - 300;
	vertex.z = Math.random() * 100 - 100;
	geometry.vertices.push( vertex );

	color = new THREE.Color( 0xffffff );
	color.setHSL( Math.random(), Math.random() - 0.2, Math.random() + 0.2 );
	geometry.colors.push( color );

}

var material = new THREE.PointCloudMaterial({ 
	map: THREE.ImageUtils.loadTexture( "../assets/star.png" ),
	blending: THREE.AdditiveBlending,
	transparent: true,
	size: 2.5, 
	vertexColors: THREE.VertexColors
});

stars = new THREE.PointCloud( geometry, material );
stars.sortParticles = true;

stars.update = function (target) {

	for (var i = 0, l = stars.geometry.vertices.length; i < l; i++) {

		var star = stars.geometry.vertices[i];
		
		star.y = 
			target.y - star.y >  300 ? target.y + 300:
			target.y - star.y < -300 ? target.y - 300:
			star.y;
		star.x = 
			target.x - star.x >  300 ? target.x + 300:
			target.x - star.x < -300 ? target.x - 300:
			star.x;
		
	}

	stars.geometry.verticesNeedUpdate = true;

};

module.exports = stars;





},{}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){

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
	user.update({
		delta : delta,
		input : input()
	});
	renderer.render(scene, camera);
	soundRenderer.render( scene, camera );
	requestAnimationFrame( play );
};


init();


},{"./background.js":2,"./camera.js":3,"./input.js":5,"./lasers":7,"./lighting.js":8,"./players.js":10,"./renderer.js":11,"./vendor/THREEx.js":17}],5:[function(require,module,exports){

var KeyboardState = require('./vendor/THREEx.js').KeyboardState;
var keyboard = new KeyboardState();

module.exports = function () {
	return {
		up : keyboard.pressed("up"),
		left : keyboard.pressed("left"),  
		right: keyboard.pressed("right"),
		space : keyboard.pressed("space")
	};
};

},{"./vendor/THREEx.js":17}],6:[function(require,module,exports){

},{}],7:[function(require,module,exports){
var Laser = require('./Laser.js');
function lasers (scene) {

	this.scene = scene;

	this.lasers = [];

	this.update = update;

	this.newLaser = newLaser;

	function update(delta) {

		var self = this;
		var i = this.lasers.length;
		while(i > 0) {
			i--;
			var laser = this.lasers[i];
			if ( laser.timeTraveled < laser.stats.range ) {
				// TODO: handle overshooting
				laser.position.x += delta * laser.velocity.x;
				laser.position.y += delta * laser.velocity.y;
				laser.timeTraveled += delta * 1;
				
				for ( var id in players.players ) {
					var ship = players.players[id].ship;
					var d = laser.position.distanceTo(ship.position);
				    if (  d < 3 ) 
				    {
				    	laser.destroy();
				    }
				}
			}
			else {
				scene.remove(laser);
				this.lasers.splice(i,1);
				// TODO: Not garunteed to remove the right element as we add more sounds
				$( "audio" ).first().remove();
			}
		}
	}

	function newLaser (position, rotation, velocity) {
		
		this.lasers.push(new Laser(position, rotation, velocity));
		scene.add(this.lasers[this.lasers.length - 1]);

	}
}
module.exports = lasers;
},{"./Laser.js":1}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
var ship = require('./ship.js');

function player(id, name) {
  	this.id = id;
  	this.name = name;
  	this.ship = new ship();
}

player.prototype = {

  ship : new ship(),

  input : {
    up    : false,
    down  : false,
    left  : false,
    right : false,
    space : false,
    reset : function () {
      this.up = false;
      this.down = false;
      this.left = false;
      this.right = false;
      this.space = false;
    }
  },

  accelerate : function (delta) {
    this.ship.velocity.x -= delta * this.ship.stats.accelRate *  Math.sin(this.ship.rotation.z); // Adjust X Velocity
    this.ship.velocity.y += delta * this.ship.stats.accelRate *  Math.cos(this.ship.rotation.z); // Adjust Y Velocity
    if ( this.ship.velocity.lengthSq() > Math.pow(this.ship.stats.maxSpeed, 2) ) // If the new velocity is too fast
      this.ship.velocity.setLength(this.ship.stats.maxSpeed); // Bring it back to max speed
  },

  turnLeft : function (delta) {
    this.ship.rotateOnAxis( new THREE.Vector3(0,0,1), delta * Math.PI/180 * this.ship.stats.turnRate); // Rotate Left
    if(this.ship.shipModel.rotation.z < this.ship.stats.maxBankAngle) { // If below max bank angle
      this.ship.shipModel.rotation.z += this.ship.stats.maxBankAngle * 0.05; // Bank the ship a little
      //this.ship.thrust.container.rotation.y -= this.ship.stats.maxBankAngle * 0.05; // Bank the thrust too
    }
  },

  turnRight: function (delta) {
    this.ship.rotateOnAxis( new THREE.Vector3(0,0,-1), delta * Math.PI/180 * this.ship.stats.turnRate); // Rotate Right
    if(this.ship.shipModel.rotation.z > -this.ship.stats.maxBankAngle) { // If below max bank angle
      this.ship.shipModel.rotation.z -= this.ship.stats.maxBankAngle * 0.05; // Bank the ship a little
      //this.ship.thrust.container.rotation.y += this.ship.stats.maxBankAngle * 0.05; // Bank the thrust too
    }
  },

  canFire : true,

  fireLaser : function (delta) {
    var self = this;
    if ( self.canFire ) {
      lasers.newLaser(this.ship.position, this.ship.rotation.z, this.ship.velocity);
      this.canFire = false;
      setTimeout(function() {
        self.canFire = true;
      }, 100);
    }
  },

  updateInput : function() {

  },

  update: function(update) {

      if (update.input.up) {
        this.accelerate(update.delta);
        //this.ship.thrust.on();
      } else {
        //this.ship.thrust.off();
      }
      if (update.input.left) {
        this.turnLeft(update.delta);
      }
      if (update.input.right) {
        this.turnRight(update.delta);
      }
      if (!update.input.left && !update.input.right ) {
        if (this.ship.shipModel.rotation.z > 0) {
          this.ship.shipModel.rotation.z -= this.ship.stats.maxBankAngle * 0.05;
          //this.ship.thrust.container.rotation.y += this.ship.stats.maxBankAngle * 0.05;
        }
        if (this.ship.shipModel.rotation.z < 0) {
          this.ship.shipModel.rotation.z += this.ship.stats.maxBankAngle * 0.05;
          //this.ship.thrust.container.rotation.y -= this.ship.stats.maxBankAngle * 0.05;
        }
      } 
      if (update.input.space) {
        this.fireLaser();
      }

    this.ship.position.x += update.delta * this.ship.velocity.x;
    this.ship.position.y += update.delta * this.ship.velocity.y;

  }

};

module.exports = player;


},{"./ship.js":13}],10:[function(require,module,exports){

var player = require('./player.js');

function players(scene) {

  var self = this;

  this.players = {};

  this.scene = scene;

  this.lookup = lookup;
  this.deletePlayer = deletePlayer;
  this.addPlayer = addPlayer;

  function lookup(id) {
    return self.players[id];
  }
  function deletePlayer(id) {
    self.scene.remove(self.players[id].ship);
    delete self.players[id];
  }
  function addPlayer(id, name) {
    self.players[id] = new player(id, name);
    self.scene.add(self.players[id].ship);
    return self.players[id];
  }
}

module.exports = players;

  

},{"./player.js":9}],11:[function(require,module,exports){

var Detector = require('./vendor/Detector.js');

if ( Detector.webgl ) 
	renderer = new THREE.WebGLRenderer( {antialias:true} ); // if browser suports webgl use webgl renderer
else 
	renderer = new THREE.CanvasRenderer(); // fallback

renderer.setSize(window.innerWidth, window.innerHeight); // set renderer size based on window size
renderer.shadowMapEnabled = true; // Shadows allowed

module.exports = renderer;
},{"./vendor/Detector.js":15}],12:[function(require,module,exports){
module.exports = new THREE.Scene();
},{}],13:[function(require,module,exports){
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
},{}],14:[function(require,module,exports){
SPARKS = require('./Sparks.js');

(function(){ 

	/************************
	* Canvas shader programs
	*************************/

	var PI2 = Math.PI * 2;

	var particleShaders = []; 

	var circles = function ( context ) {
		context.beginPath();
		context.arc( 0, 0, 1, 0, PI2, true );
		context.closePath();
		context.fill();
	};

	// circle circum
	var circleLines = function 	( context ) {
		context.lineWidth = 0.1; //0.05
		context.beginPath();
		context.arc( 0, 0, 1, 0, PI2, true );
		context.closePath();
		context.stroke();
	}

	var squares = function ( context ) {
		context.beginPath();
		context.rect( 0, 0, 1, 1 );
		context.closePath();
		context.fill();
	}

	var hearts = function ( context ) {
		context.globalAlpha = 0.5;
		var x = 0, y = 0;
		context.scale(0.1, -0.1);
		context.beginPath();
		context.bezierCurveTo( x + 2.5, y + 2.5, x + 2.0, y, x, y );
		context.bezierCurveTo( x - 3.0, y, x - 3.0, y + 3.5,x - 3.0,y + 3.5 );
		context.bezierCurveTo( x - 3.0, y + 5.5, x - 1.0, y + 7.7, x + 2.5, y + 9.5 );
		context.bezierCurveTo( x + 6.0, y + 7.7, x + 8.0, y + 5.5, x + 8.0, y + 3.5 );
		context.bezierCurveTo( x + 8.0, y + 3.5, x + 8.0, y, x + 5.0, y );
		context.bezierCurveTo( x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5 );
		context.closePath();
		context.fill();
		
		context.lineWidth = 0.05; //0.05
		context.stroke();
	}

	var hexagons = function ( ctx ) {
		var x = y = 0;
		var width = 1, height = 1;
		var dist  = 1;
		var cx  = x * (width + dist) - y * (width + dist) / 2,
         cy  = y * (3/4 * height + dist);

		ctx.beginPath();
	    ctx.moveTo(cx, cy - height/2);
	    ctx.lineTo(cx + width/2, cy - height/4);
	    ctx.lineTo(cx + width/2, cy + height/4);
	    ctx.lineTo(cx, cy + height/2);
	    ctx.lineTo(cx - width/2, cy + height/4);
	    ctx.lineTo(cx - width/2, cy - height/4);
	    ctx.lineTo(cx, cy - height/2);  
	    ctx.fill();
		//context.fill();
		//context.lineWidth = 0.4; //0.05
		//context.stroke();
	}

	var polygons = function(context, sides, radius, fill, stroke)  {
		// drived from http://www.kozlenko.info/blog/2010/11/19/how-to-calulate-polygon-points-for-html5-canvas/
		var delta_theta = 2.0 * Math.PI / sides;
		var theta = 0;

		context.beginPath();

		for (var i = 0, x, y; i < sides; i++ ) {
			x = (radius * Math.cos(theta));
			y = (radius * Math.sin(theta));
			context.lineTo(x, y);

			theta += delta_theta;
		}

		context.closePath();
		if (fill) context.fill();
		if (stroke)  {
			context.lineWidth = 0.5;
			if (fill) context.stroke(); 
		}

	}


	//var star TODO

	var octagons = function(context) {
		return polygons(context, 5, 3, true, true);
	}

	var septagon = function(context) {
		return polygons(context, 8, 3, true, true);
	}

	var random = function(context) {
		var i = Math.floor(Math.random()*particleShaders.length);
		return particleShaders[i];
	}



particleShaders.push(circles);
particleShaders.push(circleLines);
particleShaders.push(squares);
particleShaders.push(hearts);
particleShaders.push(hexagons);
particleShaders.push(octagons);
particleShaders.push(septagon);

SPARKS.CanvasShadersUtils = {};
SPARKS.CanvasShadersUtils.circles = circles;
SPARKS.CanvasShadersUtils.circleLines = circleLines;
SPARKS.CanvasShadersUtils.squares = squares;
SPARKS.CanvasShadersUtils.hearts = hearts;
SPARKS.CanvasShadersUtils.hexagons = hexagons;
SPARKS.CanvasShadersUtils.octagons = octagons;
SPARKS.CanvasShadersUtils.septagon = septagon;
SPARKS.CanvasShadersUtils.random = random;



})(SPARKS);
},{"./Sparks.js":16}],15:[function(require,module,exports){
/**
 * @author alteredq / http://alteredqualia.com/
 * @author mr.doob / http://mrdoob.com/
 */

module.exports = {

	canvas: !! window.CanvasRenderingContext2D,
	webgl: ( function () { try { return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ); } catch( e ) { return false; } } )(),
	workers: !! window.Worker,
	fileapi: window.File && window.FileReader && window.FileList && window.Blob,

	getWebGLErrorMessage: function () {

		var element = document.createElement( 'div' );
		element.id = 'webgl-error-message';
		element.style.fontFamily = 'monospace';
		element.style.fontSize = '13px';
		element.style.fontWeight = 'normal';
		element.style.textAlign = 'center';
		element.style.background = '#fff';
		element.style.color = '#000';
		element.style.padding = '1.5em';
		element.style.width = '400px';
		element.style.margin = '5em auto 0';

		if ( ! this.webgl ) {

			element.innerHTML = window.WebGLRenderingContext ? [
				'Your graphics card does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br />',
				'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'
			].join( '\n' ) : [
				'Your browser does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br/>',
				'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'
			].join( '\n' );

		}

		return element;

	},

	addGetWebGLMessage: function ( parameters ) {

		var parent, id, element;

		parameters = parameters || {};

		parent = parameters.parent !== undefined ? parameters.parent : document.body;
		id = parameters.id !== undefined ? parameters.id : 'oldie';

		element = Detector.getWebGLErrorMessage();
		element.id = id;

		parent.appendChild( element );

	}

};

},{}],16:[function(require,module,exports){
/*
 * @author zz85 (http://github.com/zz85 http://www.lab4games.net/zz85/blog)
 *
 * a simple to use javascript 3d particles system inspired by FliNT and Stardust
 * created with TWEEN.js and THREE.js
 *
 * for feature requests or bugs, please visit https://github.com/zz85/sparks.js
 *
 * licensed under the MIT license 
 */

var SPARKS = {};

/********************************
* Emitter Class
*
*   Creates and Manages Particles
*********************************/


SPARKS.Engine = {
	// Combined Singleton Engine;
	_TIMESTEP: 15,
	_timer: null,
	_lastTime: null,
	_timerStep: 10,
	_velocityVerlet: false,
	_emitters: [],
	_isRunning: false,
	
	add: function(emitter) {
		this._emitters.push(emitter);
	},
	// run its built in timer / stepping
	start: function() {
		this._lastTime = Date.now();
		this._timer = setTimeout(this.step, this._timerStep, this);
		
		for (var i=0,il=this._emitters.length;i<il;i++) {
			this._emitters[i]._isRunning = true;
		}
		
		this._isRunning = true;
	},
	
	stop: function() {
		this._isRunning = false;
		for (var i=0,il=this._emitters.length;i<il;i++) {
			this._emitters[i]._isRunning = false;
		}
		clearTimeout(this._timer);
	},
	
	isRunning: function() {
		return this._isRunning;
	},
	
	// Step gets called upon by the engine
	// but attempts to call update() on a regular basics
	step: function(me) {
		
		var time = Date.now();
		var elapsed = time - me._lastTime;
	   	
		if (!this._velocityVerlet) {
			// if elapsed is way higher than time step, (usually after switching tabs, or excution cached in ff)
			// we will drop cycles. perhaps set to a limit of 10 or something?
			var maxBlock = me._TIMESTEP * 20;
			
			if (elapsed >= maxBlock) {
				//console.log('warning: sparks.js is fast fowarding engine, skipping steps', elapsed / emitter._TIMESTEP);
				//emitter.update( (elapsed - maxBlock) / 1000);
				elapsed = maxBlock;
			}
		
			while(elapsed >= me._TIMESTEP) {
				me.update(me._TIMESTEP / 1000);
				elapsed -= me._TIMESTEP;
			}
			me._lastTime = time - elapsed;
			
		} else {
			me.update(elapsed/1000);
			me._lastTime = time;
		}
		
		
		setTimeout(me.step, me._timerStep, me);
		
	},
	
	update: function(time) {
		for (var i=0,il=this._emitters.length;i<il;i++) {
			this._emitters[i].update(time);
		}
	}
	
};

SPARKS.Emitter = function (counter) {
    
    this._counter = counter ? counter : new SPARKS.SteadyCounter(10); // provides number of particles to produce
    
    this._particles = [];
    
    
    this._initializers = []; // use for creation of particles
    this._actions = [];     // uses action to update particles
    this._activities = [];  //  not supported yet
        
    this._handlers = [];
    
    this.callbacks = {};
};


SPARKS.Emitter.prototype = {
	
	_TIMESTEP: 15,
	_timer: null,
	_lastTime: null,
	_timerStep: 10,
	_velocityVerlet: false,
	_isRunning: false,
	
	// run its built in timer / stepping
	start: function() {
		this._lastTime = Date.now();
		this._timer = setTimeout(this.step, this._timerStep, this);
		this._isRunning = true;
	},
	
	stop: function() {
		this._isRunning = false;
		clearTimeout(this._timer);
	},
	
	isRunning: function() {
		return this._isRunning;
	},
	
	// Step gets called upon by the engine
	// but attempts to call update() on a regular basics
	// This method is also described in http://gameclosure.com/2011/04/11/deterministic-delta-tee-in-js-games/
	step: function(emitter) {
		
		var time = Date.now();
		var elapsed = time - emitter._lastTime;
	   	
		if (!this._velocityVerlet) {
			// if elapsed is way higher than time step, (usually after switching tabs, or excution cached in ff)
			// we will drop cycles. perhaps set to a limit of 10 or something?
			var maxBlock = emitter._TIMESTEP * 20;
			
			if (elapsed >= maxBlock) {
				//console.log('warning: sparks.js is fast fowarding engine, skipping steps', elapsed / emitter._TIMESTEP);
				//emitter.update( (elapsed - maxBlock) / 1000);
				elapsed = maxBlock;
			}
		
			while(elapsed >= emitter._TIMESTEP) {
				emitter.update(emitter._TIMESTEP / 1000);
				elapsed -= emitter._TIMESTEP;
			}
			emitter._lastTime = time - elapsed;
			
		} else {
			emitter.update(elapsed/1000);
			emitter._lastTime = time;
		}
		
		
		
		if (emitter._isRunning)
		setTimeout(emitter.step, emitter._timerStep, emitter);
		
	},


	// Update particle engine in seconds, not milliseconds
    update: function(time) {
		
        var len = this._counter.updateEmitter( this, time );
        
        // Create particles
        for( i = 0; i < len; i++ ) {
            this.createParticle();
        }
        
        // Update activities
        len = this._activities.length;
        for ( i = 0; i < len; i++ )
        {
            this._activities[i].update( this, time );
        }
        
        
        len = this._actions.length;
        var action;
        var len2 = this._particles.length;
        
        for( j = 0; j < len; j++ )
        {
            action = this._actions[j];
            for ( i = 0; i < len2; ++i )
            {
                particle = this._particles[i];
                action.update( this, particle, time );
            }
        }
        
        
        // remove dead particles
        for ( i = len2; i--; )
        {
            particle = this._particles[i];
            if ( particle.isDead )
            {
                //particle = 
				this._particles.splice( i, 1 );
                this.dispatchEvent("dead", particle);
				SPARKS.VectorPool.release(particle.position); //
				SPARKS.VectorPool.release(particle.velocity);
                
            } else {
                this.dispatchEvent("updated", particle);
            }
        }
        
		this.dispatchEvent("loopUpdated");
		
    },
    
    createParticle: function() {
        var particle = new SPARKS.Particle();
        // In future, use a Particle Factory
        var len = this._initializers.length, i;

        for ( i = 0; i < len; i++ ) {
            this._initializers[i].initialize( this, particle );
        }
        
        this._particles.push( particle );
        
        this.dispatchEvent("created", particle); // ParticleCreated
        
        return particle;
    },
    
    addInitializer: function (initializer) {
        this._initializers.push(initializer);
    },
    
    addAction: function (action) {
        this._actions.push(action);
    },

    removeInitializer: function (initializer) {
		var index = this._initializers.indexOf(initializer);
		if (index > -1) {
			this._initializers.splice( index, 1 );
		}
    },

    removeAction: function (action) {
		var index = this._actions.indexOf(action);
		if (index > -1) {
			this._actions.splice( index, 1 );
		}
		//console.log('removeAction', index, this._actions);
    },
    
    addCallback: function(name, callback) {
        this.callbacks[name] = callback;
    },
    
    removeCallback: function(name) {
        delete this.callbacks[name];
    },
    
    dispatchEvent: function(name, args) {
        var callback = this.callbacks[name];
        if (callback) {
            callback(args);
        }
    
    }
    

};


/*
 * Constant Names for
 * Events called by emitter.dispatchEvent()
 * 
 */
SPARKS.EVENT_PARTICLE_CREATED = "created"
SPARKS.EVENT_PARTICLE_UPDATED = "updated"
SPARKS.EVENT_PARTICLE_DEAD = "dead";
SPARKS.EVENT_LOOP_UPDATED = "loopUpdated";



/*
 * Steady Counter attempts to produces a particle rate steadily
 *
 */

// Number of particles per seconds
SPARKS.SteadyCounter = function(rate) {
    this.rate = rate;
    
	// we use a shortfall counter to make up for slow emitters 
	this.leftover = 0;
	
};

SPARKS.SteadyCounter.prototype.updateEmitter = function(emitter, time) {

	var targetRelease = time * this.rate + this.leftover;
	var actualRelease = Math.floor(targetRelease);
	
	this.leftover = targetRelease - actualRelease;
	
	return actualRelease;
};


/*
 * Shot Counter produces specified particles 
 * on a single impluse or burst
 */

SPARKS.ShotCounter = function(particles) {
	this.particles = particles;
	this.used = false;
};

SPARKS.ShotCounter.prototype.updateEmitter = function(emitter, time) {

	if (this.used) {
		return 0;
	} else {
		this.used = true;
	}
	
	return this.particles;
};


/********************************
* Particle Class
*
*   Represents a single particle
*********************************/
SPARKS.Particle = function() {

    /**
     * The lifetime of the particle, in seconds.
     */
    this.lifetime = 0;
    
    /**
     * The age of the particle, in seconds.
     */
    this.age = 0;
    
    /**
     * The energy of the particle.
     */
    this.energy = 1;
    
    /**
     * Whether the particle is dead and should be removed from the stage.
     */
    this.isDead = false;
    
    this.target = null; // tag
    
    /**
     * For 3D
     */
     
     this.position = SPARKS.VectorPool.get().set(0,0,0); //new THREE.Vector3( 0, 0, 0 );
     this.velocity = SPARKS.VectorPool.get().set(0,0,0); //new THREE.Vector3( 0, 0, 0 );
	this._oldvelocity = SPARKS.VectorPool.get().set(0,0,0);
     // rotation vec3
     // angVelocity vec3
     // faceAxis vec3
    
};


/********************************
* Action Classes
*
*   An abstract class which have
*   update function
*********************************/
SPARKS.Action = function() {
    this._priority = 0;
};


SPARKS.Age = function(easing) {
    this._easing = (easing == null) ? TWEEN.Easing.Linear.EaseNone : easing;
};

SPARKS.Age.prototype.update = function (emitter, particle, time) {
    particle.age += time;
    if( particle.age >= particle.lifetime )
    {
        particle.energy = 0;
        particle.isDead = true;
    }
    else
    {
        var t = this._easing(particle.age / particle.lifetime);
        particle.energy = -1 * t + 1;
    }
};

/*
// Mark particle as dead when particle's < 0

SPARKS.Death = function(easing) {
    this._easing = (easing == null) ? TWEEN.Linear.EaseNone : easing;
};

SPARKS.Death.prototype.update = function (emitter, particle, time) {
    if (particle.life <= 0) {
        particle.isDead = true;
    }
};
*/
			

SPARKS.Move = function() {
    
};

SPARKS.Move.prototype.update = function(emitter, particle, time) {
    // attempt verlet velocity updating.
    var p = particle.position;
	var v = particle.velocity;
    var old = particle._oldvelocity;
	
	if (this._velocityVerlet) {	
		p.x += (v.x + old.x) * 0.5 * time;
		p.y += (v.y + old.y) * 0.5 * time;
		p.z += (v.z + old.z) * 0.5 * time;
	} else {
		p.x += v.x * time;
		p.y += v.y * time;
		p.z += v.z * time;
	}

    //  OldVel = Vel;
    // Vel = Vel + Accel * dt;
    // Pos = Pos + (vel + Vel + Accel * dt) * 0.5 * dt;
	


};

/* Marks particles found in specified zone dead */
SPARKS.DeathZone = function(zone) {
    this.zone = zone;
};

SPARKS.DeathZone.prototype.update = function(emitter, particle, time) {
    
    if (this.zone.contains(particle.position)) {
		particle.isDead = true;
	}

};

/*
 * SPARKS.ActionZone applies an action when particle is found in zone
 */
SPARKS.ActionZone = function(action, zone) {
	this.action = action;
    this.zone = zone;
};

SPARKS.ActionZone.prototype.update = function(emitter, particle, time) {

    if (this.zone.contains(particle.position)) {
		this.action.update( emitter, particle, time );
	}

};

/*
 * Accelerate action affects velocity in specified 3d direction 
 */
SPARKS.Accelerate = function(x,y,z) {
	
	if (x instanceof THREE.Vector3) {
		this.acceleration = x;
		return;
	}

    this.acceleration = new THREE.Vector3(x,y,z);
    
};

SPARKS.Accelerate.prototype.update = function(emitter, particle, time) {
    var acc = this.acceleration;
    
    var v = particle.velocity;
    
	particle._oldvelocity.set(v.x, v.y, v.z);
	
    v.x += acc.x * time;
    v.y += acc.y * time;
    v.z += acc.z * time; 

};

/*
 * Accelerate Factor accelerate based on a factor of particle's velocity.
 */
SPARKS.AccelerateFactor = function(factor) {
    this.factor = factor;
};

SPARKS.AccelerateFactor.prototype.update = function(emitter, particle, time) {
    var factor = this.factor;
    
    var v = particle.velocity;
	var len = v.length();
	var adjFactor;
    if (len>0) {

		adjFactor = factor * time / len;
		adjFactor += 1;
		
		v.multiplyScalar(adjFactor);

	}

};

/*
AccelerateNormal
 * AccelerateVelocity affects velocity based on its velocity direction
 */
SPARKS.AccelerateVelocity = function(factor) {

	this.factor = factor;

};

SPARKS.AccelerateVelocity.prototype.update = function(emitter, particle, time) {
    var factor = this.factor;

    var v = particle.velocity;


    v.z += - v.x * factor;
    v.y += v.z * factor;
    v.x +=  v.y * factor;

};


/* Set the max ammount of x,y,z drift movements in a second */
SPARKS.RandomDrift = function(x,y,z) {
	if (x instanceof THREE.Vector3) {
		this.drift = x;
		return;
	}

    this.drift = new THREE.Vector3(x,y,z);
}


SPARKS.RandomDrift.prototype.update = function(emitter, particle, time) {
    var drift = this.drift;
    
    var v = particle.velocity;
    
    v.x += ( Math.random() - 0.5 ) * drift.x * time;
    v.y += ( Math.random() - 0.5 ) * drift.y * time;
    v.z += ( Math.random() - 0.5 ) * drift.z * time;

};

/********************************
* Zone Classes
*
*   An abstract classes which have
*   getLocation() function
*********************************/
SPARKS.Zone = function() {
};

// TODO, contains() for Zone

SPARKS.PointZone = function(pos) {
    this.pos = pos;
};

SPARKS.PointZone.prototype.getLocation = function() {
    return this.pos;
};

SPARKS.PointZone = function(pos) {
    this.pos = pos;
};

SPARKS.PointZone.prototype.getLocation = function() {
    return this.pos;
};

SPARKS.LineZone = function(start, end) {
    this.start = start;
	this.end = end;
	this._length = end.clone().sub( start );
};

SPARKS.LineZone.prototype.getLocation = function() {
    var len = this._length.clone();

	len.multiplyScalar( Math.random() );
	return len.add( this.start );
	
};

// Basically a RectangleZone
SPARKS.ParallelogramZone = function(corner, side1, side2) {
    this.corner = corner;
	this.side1 = side1;
	this.side2 = side2;
};

SPARKS.ParallelogramZone.prototype.getLocation = function() {
    
	var d1 = this.side1.clone().multiplyScalar( Math.random() );
	var d2 = this.side2.clone().multiplyScalar( Math.random() );
	d1.add(d2);
	return d1.add( this.corner );
	
};

SPARKS.CubeZone = function(position, x, y, z) {
    this.position = position;
	this.x = x;
	this.y = y;
	this.z = z;
};

SPARKS.CubeZone.prototype.getLocation = function() {
    //TODO use pool?

	var location = this.position.clone();
	location.x += Math.random() * this.x;
	location.y += Math.random() * this.y;
	location.z += Math.random() * this.z;
	
	return location;
	
};


SPARKS.CubeZone.prototype.contains = function(position) {

	var startX = this.position.x;
	var startY = this.position.y;
	var startZ = this.position.z;
	var x = this.x; // width
	var y = this.y; // depth
	var z = this.z; // height
	
	if (x<0) {
		startX += x;
		x = Math.abs(x);
	}
	
	if (y<0) {
		startY += y;
		y = Math.abs(y);
	}
	
	if (z<0) {
		startZ += z;
		z = Math.abs(z);
	}
	
	var diffX = position.x - startX;
	var diffY = position.y - startY;
	var diffZ = position.z - startZ;
	
	if ( (diffX > 0) && (diffX < x) && 
			(diffY > 0) && (diffY < y) && 
			(diffZ > 0) && (diffZ < z) ) {
		return true;
	}
	
	return false;
	
};



/**
 * The constructor creates a DiscZone 3D zone.
 * 
 * @param centre The point at the center of the disc.
 * @param normal A vector normal to the disc.
 * @param outerRadius The outer radius of the disc.
 * @param innerRadius The inner radius of the disc. This defines the hole 
 * in the center of the disc. If set to zero, there is no hole. 
 */

/*
// BUGGY!!
SPARKS.DiscZone = function(center, radiusNormal, outerRadius, innerRadius) {
    this.center = center;
	this.radiusNormal = radiusNormal;
	this.outerRadius = (outerRadius==undefined) ? 0 : outerRadius;
	this.innerRadius = (innerRadius==undefined) ? 0 : innerRadius;
	
};

SPARKS.DiscZone.prototype.getLocation = function() {
    var rand = Math.random();
	var _innerRadius = this.innerRadius;
	var _outerRadius = this.outerRadius;
	var center = this.center;
	var _normal = this.radiusNormal;
	
	_distToOrigin = _normal.dot( center );
	
	var radius = _innerRadius + (1 - rand * rand ) * ( _outerRadius - _innerRadius );
	var angle = Math.random() * SPARKS.Utils.TWOPI;
	
	var _distToOrigin = _normal.dot( center );
	var axes = SPARKS.Utils.getPerpendiculars( _normal.clone() );
	var _planeAxis1 = axes[0];
	var _planeAxis2 = axes[1];
	
	var p = _planeAxis1.clone();
	p.multiplyScalar( radius * Math.cos( angle ) );
	var p2 = _planeAxis2.clone();
	p2.multiplyScalar( radius * Math.sin( angle ) );
	p.add( p2 );
	return _center.add( p );
	
};
*/

SPARKS.SphereCapZone = function(x, y, z, minr, maxr, angle) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.minr = minr;
    this.maxr = maxr;
    this.angle = angle;
};

SPARKS.SphereCapZone.prototype.getLocation = function() {
    var theta = Math.PI *2  * SPARKS.Utils.random();
    var r = SPARKS.Utils.random();
    
    //new THREE.Vector3
    var v =  SPARKS.VectorPool.get().set(r * Math.cos(theta), -1 / Math.tan(this.angle * SPARKS.Utils.DEGREE_TO_RADIAN), r * Math.sin(theta));
    
    //v.length = StardustMath.interpolate(0, _minRadius, 1, _maxRadius, Math.random());
            
    var i = this.minr - ((this.minr-this.maxr) *  Math.random() );
    v.multiplyScalar(i);

	v.__markedForReleased = true;
    
    return v;
};


/********************************
* Initializer Classes
*
*   Classes which initializes
*   particles. Implements initialize( emitter:Emitter, particle:Particle )
*********************************/

// Specifies random life between max and min
SPARKS.Lifetime = function(min, max) {
    this._min = min;
    
    this._max = max ? max : min;
    
};

SPARKS.Lifetime.prototype.initialize = function( emitter/*Emitter*/, particle/*Particle*/ ) {
    particle.lifetime = this._min + SPARKS.Utils.random() * ( this._max - this._min );
};


SPARKS.Position = function(zone) {
    this.zone = zone;
};

SPARKS.Position.prototype.initialize = function( emitter/*Emitter*/, particle/*Particle*/ ) {
    var pos = this.zone.getLocation();
    particle.position.set(pos.x, pos.y, pos.z);
};

SPARKS.Velocity = function(zone) {
    this.zone = zone;
};

SPARKS.Velocity.prototype.initialize = function( emitter/*Emitter*/, particle/*Particle*/ ) {
    var pos = this.zone.getLocation();
    particle.velocity.set(pos.x, pos.y, pos.z);
	if (pos.__markedForReleased) {
		//console.log("release");
		SPARKS.VectorPool.release(pos);
		pos.__markedForReleased = false;
	}
};

SPARKS.Target = function(target, callback) {
    this.target = target;
    this.callback = callback;
};

SPARKS.Target.prototype.initialize = function( emitter, particle ) {

    if (this.callback) {
        particle.target = this.callback();
    } else {
        particle.target = this.target;
    }

};

/********************************
* VectorPool 
*
*  Reuse much of Vectors if possible
*********************************/

SPARKS.VectorPool = {
	__pools: [],

	// Get a new Vector
	get: function() {
		if (this.__pools.length>0) {
			return this.__pools.pop();
		}
		
		return this._addToPool();
		
	},
	
	// Release a vector back into the pool
	release: function(v) {
		this.__pools.push(v);
	},
	
	// Create a bunch of vectors and add to the pool
	_addToPool: function() {
		//console.log("creating some pools");
		
		for (var i=0, size = 100; i < size; i++) {
			this.__pools.push(new THREE.Vector3());
		}
		
		return new THREE.Vector3();
		
	}
	
	
	
};


/********************************
* Util Classes
*
*   Classes which initializes
*   particles. Implements initialize( emitter:Emitter, particle:Particle )
*********************************/
SPARKS.Utils = {
    random: function() {
        return Math.random();
    },
    DEGREE_TO_RADIAN: Math.PI / 180,
	TWOPI: Math.PI * 2,

	getPerpendiculars: function(normal) {
		var p1 = this.getPerpendicular( normal );
		var p2 = normal.cross( p1 );
		p2.normalize();
		return [ p1, p2 ];
	},
	
	getPerpendicular: function( v )
	{
		if( v.x == 0 )
		{
			return new THREE.Vector3D( 1, 0, 0 );
		}
		else
		{
			var temp = new THREE.Vector3( v.y, -v.x, 0 );
			return temp.normalize();
		}
	}

};

module.exports = SPARKS;
},{}],17:[function(require,module,exports){
module.exports = {

	KeyboardState : require('./THREEx/KeyboardState.js'),

	WindowResize : require('./THREEx/WindowResize.js'),

	Sparks : require('./THREEx/Sparks.js'),

	FullScreen : require('./THREEx/FullScreen.js'),
	
};
},{"./THREEx/FullScreen.js":18,"./THREEx/KeyboardState.js":19,"./THREEx/Sparks.js":20,"./THREEx/WindowResize.js":21}],18:[function(require,module,exports){
// This THREEx helper makes it easy to handle the fullscreen API
// * it hides the prefix for each browser
// * it hides the little discrepencies of the various vendor API
// * at the time of this writing (nov 2011) it is available in 
//   [firefox nightly](http://blog.pearce.org.nz/2011/11/firefoxs-html-full-screen-api-enabled.html),
//   [webkit nightly](http://peter.sh/2011/01/javascript-full-screen-api-navigation-timing-and-repeating-css-gradients/) and
//   [chrome stable](http://updates.html5rocks.com/2011/10/Let-Your-Content-Do-the-Talking-Fullscreen-API).

// # Code

/** @namespace */
var THREEx	=  {};
THREEx.FullScreen = {};

/**
 * test if it is possible to have fullscreen
 * 
 * @returns {Boolean} true if fullscreen API is available, false otherwise
*/
THREEx.FullScreen.available	= function()
{
	return this._hasWebkitFullScreen || this._hasMozFullScreen;
}

/**
 * test if fullscreen is currently activated
 * 
 * @returns {Boolean} true if fullscreen is currently activated, false otherwise
*/
THREEx.FullScreen.activated	= function()
{
	if( this._hasWebkitFullScreen ){
		return document.webkitIsFullScreen;
	}else if( this._hasMozFullScreen ){
		return document.mozFullScreen;
	}else{
		console.assert(false);
	}
}

/**
 * Request fullscreen on a given element
 * @param {DomElement} element to make fullscreen. optional. default to document.body
*/
THREEx.FullScreen.request	= function(element)
{
	element	= element	|| document.body;
	if( this._hasWebkitFullScreen ){
		element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
	}else if( this._hasMozFullScreen ){
		element.mozRequestFullScreen();
	}else{
		console.assert(false);
	}
}

/**
 * Cancel fullscreen
*/
THREEx.FullScreen.cancel	= function()
{
	if( this._hasWebkitFullScreen ){
		document.webkitCancelFullScreen();
	}else if( this._hasMozFullScreen ){
		document.mozCancelFullScreen();
	}else{
		console.assert(false);
	}
}

// internal functions to know which fullscreen API implementation is available
THREEx.FullScreen._hasWebkitFullScreen	= 'webkitCancelFullScreen' in document	? true : false;	
THREEx.FullScreen._hasMozFullScreen	= 'mozCancelFullScreen' in document	? true : false;	

/**
 * Bind a key to renderer screenshot
 * usage: THREEx.FullScreen.bindKey({ charCode : 'a'.charCodeAt(0) }); 
*/
THREEx.FullScreen.bindKey	= function(opts){
	opts		= opts		|| {};
	var charCode	= opts.charCode	|| 'f'.charCodeAt(0);
	var dblclick	= opts.dblclick !== undefined ? opts.dblclick : false;
	var element	= opts.element

	var toggle	= function(){
		if( THREEx.FullScreen.activated() ){
			THREEx.FullScreen.cancel();
		}else{
			THREEx.FullScreen.request(element);
		}		
	}

	var onKeyPress	= function(event){
		if( event.which !== charCode )	return;
		toggle();
	}.bind(this);

	document.addEventListener('keypress', onKeyPress, false);

	dblclick && document.addEventListener('dblclick', toggle, false);

	return {
		unbind	: function(){
			document.removeEventListener('keypress', onKeyPress, false);
			dblclick && document.removeEventListener('dblclick', toggle, false);
		}
	};
}

module.exports = THREEx.FullScreen;
},{}],19:[function(require,module,exports){
// THREEx.KeyboardState.js keep the current state of the keyboard.
// It is possible to query it at any time. No need of an event.
// This is particularly convenient in loop driven case, like in
// 3D demos or games.
//
// # Usage
//
// **Step 1**: Create the object
//
// ```var keyboard	= new THREEx.KeyboardState();```
//
// **Step 2**: Query the keyboard state
//
// This will return true if shift and A are pressed, false otherwise
//
// ```keyboard.pressed("shift+A")```
//
// **Step 3**: Stop listening to the keyboard
//
// ```keyboard.destroy()```
//
// NOTE: this library may be nice as standaline. independant from three.js
// - rename it keyboardForGame
//
// # Code
//

/** @namespace */
var THREEx	= THREEx 		|| {};

/**
 * - NOTE: it would be quite easy to push event-driven too
 *   - microevent.js for events handling
 *   - in this._onkeyChange, generate a string from the DOM event
 *   - use this as event name
*/
THREEx.KeyboardState	= function()
{
	// to store the current state
	this.keyCodes	= {};
	this.modifiers	= {};
	
	// create callback to bind/unbind keyboard events
	var self	= this;
	this._onKeyDown	= function(event){ self._onKeyChange(event, true); };
	this._onKeyUp	= function(event){ self._onKeyChange(event, false);};

	// bind keyEvents
	document.addEventListener("keydown", this._onKeyDown, false);
	document.addEventListener("keyup", this._onKeyUp, false);
}

/**
 * To stop listening of the keyboard events
*/
THREEx.KeyboardState.prototype.destroy	= function()
{
	// unbind keyEvents
	document.removeEventListener("keydown", this._onKeyDown, false);
	document.removeEventListener("keyup", this._onKeyUp, false);
}

THREEx.KeyboardState.MODIFIERS	= ['shift', 'ctrl', 'alt', 'meta'];
THREEx.KeyboardState.ALIAS	= {
	'left'		: 37,
	'up'		: 38,
	'right'		: 39,
	'down'		: 40,
	'space'		: 32,
	'pageup'	: 33,
	'pagedown'	: 34,
	'tab'		: 9
};

/**
 * to process the keyboard dom event
*/
THREEx.KeyboardState.prototype._onKeyChange	= function(event, pressed)
{
	// log to debug
	//console.log("onKeyChange", event, pressed, event.keyCode, event.shiftKey, event.ctrlKey, event.altKey, event.metaKey)

	// update this.keyCodes
	var keyCode		= event.keyCode;
	this.keyCodes[keyCode]	= pressed;

	// update this.modifiers
	this.modifiers['shift']= event.shiftKey;
	this.modifiers['ctrl']	= event.ctrlKey;
	this.modifiers['alt']	= event.altKey;
	this.modifiers['meta']	= event.metaKey;
}

/**
 * query keyboard state to know if a key is pressed of not
 *
 * @param {String} keyDesc the description of the key. format : modifiers+key e.g shift+A
 * @returns {Boolean} true if the key is pressed, false otherwise
*/
THREEx.KeyboardState.prototype.pressed	= function(keyDesc)
{
	var keys	= keyDesc.split("+");
	for(var i = 0; i < keys.length; i++){
		var key		= keys[i];
		var pressed;
		if( THREEx.KeyboardState.MODIFIERS.indexOf( key ) !== -1 ){
			pressed	= this.modifiers[key];
		}else if( Object.keys(THREEx.KeyboardState.ALIAS).indexOf( key ) != -1 ){
			pressed	= this.keyCodes[ THREEx.KeyboardState.ALIAS[key] ];
		}else {
			pressed	= this.keyCodes[key.toUpperCase().charCodeAt(0)]
		}
		if( !pressed)	return false;
	};
	return true;
}

module.exports = THREEx.KeyboardState;

},{}],20:[function(require,module,exports){
// This THREEx helper makes it even easier to use spark.js with three.js
// * FIXME This is currently only with WebGL


// 
// # Code

//

var SPARKS = require('../Sparks.js');

var THREEx	= THREEx 	|| {};


THREEx.Sparks	= function(opts)
{
	opts		= opts	|| {};
	this._maxParticles = opts.maxParticles	|| console.assert(false);
	this._texture	= opts.texture	|| this._buildDefaultTexture();
	var counter	= opts.counter	|| console.assert(false);
	
	var vertexIndexPool = {
		__pools: [],
		// Get a new Vector
		get: function() {
			if( this.__pools.length > 0 )	return this.__pools.pop();
			console.assert(false, "pool ran out!")
			return null;
		},
		// Release a vector back into the pool
		add: function(v){ this.__pools.push(v);	}
	};
	
	
	var particles	= new THREE.Geometry();
	var vertices	= particles.vertices;
	for ( i = 0; i < this._maxParticles; i++ ) {
		var position	= new THREE.Vector3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
		vertices.push(new THREE.Vector3(position));
		vertexIndexPool.add(i);
	}

	// to handle window resize
	this._$onWindowResize	= this._onWindowResize.bind(this);
	window.addEventListener('resize', this._$onWindowResize, false);

	var attributes	= this._attributes	= {
		size	: { type: 'f', value: [] },
		aColor	: { type: 'c', value: [] }
	};

	var uniforms	= this._uniforms	= {
		texture		: { type: "t", texture: this._texture 		},
		color		: { type: "c", value: new THREE.Color(0xffffff)	},
		sizeRatio	: { type: "f", value: this._computeSizeRatio()	}
	};

	// fill attributes array
	var valuesSize	= this._attributes.size.value;
	var valuesColor	= this._attributes.aColor.value;
	for(var v = 0; v < particles.vertices.length; v++ ){
		valuesSize[v]	= 99;
		valuesColor[v]	= new THREE.Color( 0x000000 );
	}
	
	var material	= new THREE.ShaderMaterial( {
		uniforms	: this._uniforms,
		attributes	: this._attributes,
		vertexShader	: THREEx.Sparks.vertexShaderText,
		fragmentShader	: THREEx.Sparks.fragmentShaderText,

		blending	: THREE.AdditiveBlending,
		depthWrite	: false,
		transparent	: true
	});

	this._group	= new THREE.ParticleSystem( particles, material );
	//this._group.dynamic		= true;
	//this._group.sortParticles	= true;	// TODO is this needed ?	

	//// EMITTER STUFF

	var setTargetParticle = function() {					
		var vertexIdx	= vertexIndexPool.get();
		var target	= {
			vertexIdx	: vertexIdx,
			size		: function(value){
				if( value !== undefined )	valuesSize[vertexIdx] = value;
				return valuesSize[vertexIdx];
			},
			color		: function(value){
				if( value !== undefined )	valuesColor[vertexIdx] = value;
				return valuesColor[vertexIdx];
			}
		};
		return target;
	};


	var onParticleCreated = function(particle) {
		var vertexIdx	= particle.target.vertexIdx;
		// copy particle position into three.js geometry
		vertices[vertexIdx].position	= particle.position;						
	};
	
	var onParticleDead = function(particle) {
		var vertexIdx	= particle.target.vertexIdx;

		// Hide the particle
		valuesColor[vertexIdx].setHex( 0x000000 );
		vertices[vertexIdx].position.set(Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
		
		// Mark particle system as available by returning to pool
		vertexIndexPool.add( vertexIdx );
	};
	
	var emitter	= this._emitter	= new SPARKS.Emitter(counter);

	emitter.addInitializer(new SPARKS.Target(null, setTargetParticle));
	emitter.addCallback("created"	, onParticleCreated	);
	emitter.addCallback("dead"	, onParticleDead	);
}


THREEx.Sparks.prototype.destroy	= function()
{
	window.removeEventListener('resize', this._$onWindowResize);

	if( this._emitter.isRunning() )	this._emitter.stop();
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

THREEx.Sparks.prototype.container = function()
{
	return this._group;
}

THREEx.Sparks.prototype.emitter = function()
{
	return this._emitter;
}

THREEx.Sparks.prototype.update = function()
{
	this._group.geometry.__dirtyVertices = true;
	this._group.geometry.__dirtyColors	 = true;
	this._attributes.size.needsUpdate	 = true;
	this._attributes.aColor.needsUpdate	 = true;
}

//////////////////////////////////////////////////////////////////////////////////
//		handle window resize						//
//////////////////////////////////////////////////////////////////////////////////

THREEx.Sparks.prototype._onWindowResize	= function()
{
	this._uniforms.sizeRatio.value	= this._computeSizeRatio();
	this._uniforms.sizeRatio.needsUpdate	= true;
}


THREEx.Sparks.prototype._computeSizeRatio = function()
{
	return window.innerHeight / 1024;
}


//////////////////////////////////////////////////////////////////////////////////
//		Shader Text							//
//////////////////////////////////////////////////////////////////////////////////

THREEx.Sparks.vertexShaderText	= [
	"attribute float size;",
	"attribute vec3 pcolor;",
	"varying vec3 vColor;",
	"void main() {",
		"vColor = pcolor;",
		"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
		"gl_PointSize = size * ( 200.0 / length( mvPosition.xyz ) );",
		"gl_Position = projectionMatrix * mvPosition;",
	"}"
].join('\n')
THREEx.Sparks.fragmentShaderText = [
	"uniform sampler2D texture;",
	"varying vec3 vColor;",
	"void main() {",
		"vec4 outColor = texture2D( texture, gl_PointCoord );",
		"gl_FragColor = outColor * vec4( vColor, 1.0 );",
	"}"
].join('\n'),

//////////////////////////////////////////////////////////////////////////////////
//		Texture								//
//////////////////////////////////////////////////////////////////////////////////

THREEx.Sparks.prototype._buildDefaultTexture	= function(size)
{
	size		= size || 128;
	var canvas	= document.createElement( 'canvas' );
	var context	= canvas.getContext( '2d' );
	canvas.width	= canvas.height	= size;
	
	var gradient	= context.createRadialGradient( canvas.width/2, canvas.height /2, 0, canvas.width /2, canvas.height /2, canvas.width /2 );				
	gradient.addColorStop( 0  , 'rgba(255,255,255,1)' );
	gradient.addColorStop( 0.2, 'rgba(255,255,255,1)' );
	gradient.addColorStop( 0.4, 'rgba(128,128,128,1)' );
	gradient.addColorStop( 1  , 'rgba(0,0,0,1)' );

	context.beginPath();
	context.arc(size/2, size/2, size/2, 0, Math.PI*2, false);
	context.closePath();
	
	context.fillStyle	= gradient;
	//context.fillStyle	= 'rgba(128,128,128,1)';
	context.fill();
			
	var texture	= new THREE.Texture( canvas );
	texture.needsUpdate = true;
	
	return texture;
}

module.exports = THREEx.Sparks;

},{"../Sparks.js":16}],21:[function(require,module,exports){
// This THREEx helper makes it easy to handle window resize.
// It will update renderer and camera when window is resized.
//
// # Usage
//
// **Step 1**: Start updating renderer and camera
//
// ```var windowResize = THREEx.WindowResize(aRenderer, aCamera)```
//    
// **Step 2**: Start updating renderer and camera
//
// ```windowResize.stop()```
// # Code

//

/** @namespace */
var THREEx	= THREEx 		|| {};

/**
 * Update renderer and camera when the window is resized
 * 
 * @param {Object} renderer the renderer to update
 * @param {Object} Camera the camera to update
*/
THREEx.WindowResize	= function(renderer, camera){
	var callback	= function(){
		// notify the renderer of the size change
		renderer.setSize( window.innerWidth, window.innerHeight );
		// update the camera
		camera.aspect	= window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
	}
	// bind the resize event
	window.addEventListener('resize', callback, false);
	// return .stop() the function to stop watching window resize
	return {
		/**
		 * Stop watching window resize
		*/
		stop	: function(){
			window.removeEventListener('resize', callback);
		}
	};
}

module.exports = THREEx.WindowResize;

},{}],22:[function(require,module,exports){
THREE.Sound3D=function(a,b,c,d){
	THREE.Object3D.call(this);
	this.isLoaded=!1;
	this.isAddedToDOM=!1;
	this.isPlaying=!1;
	this.duration=-1;
	this.radius=b!==undefined?Math.abs(b):100;
	this.volume=Math.min(1,Math.max(0,c!==undefined?c:1));
	this.domElement=document.createElement("audio");
	this.domElement.volume=0;
	this.domElement.pan=0;
	this.domElement.loop=d!==undefined?d:!0;
	this.sources=a instanceof Array?a:[a];
	var f;
	c=this.sources.length;
	for(a=0;a<c;a++){
		b=this.sources[a];
		b.toLowerCase();
		if(b.indexOf(".mp3")!==-1)
			f="audio/mpeg";
		else if(b.indexOf(".ogg")!==-1)
			f="audio/ogg";
		else 
			b.indexOf(".wav")!==-1&&(f="audio/wav");
		if(this.domElement.canPlayType(f)){
			f=document.createElement("source");
			f.src=this.sources[a];
			this.domElement.THREESound3D=this;
			this.domElement.appendChild(f);
			this.domElement.addEventListener("canplay",this.onLoad,!0);
			this.domElement.load();
			break
		}
	}
};

THREE.Sound3D.prototype=new THREE.Object3D;
THREE.Sound3D.prototype.constructor=THREE.Sound3D;
THREE.Sound3D.prototype.supr=THREE.Object3D.prototype;
THREE.Sound3D.prototype.onLoad=function(){
	var a=this.THREESound3D;
	if(!a.isLoaded){
		this.removeEventListener("canplay",this.onLoad,!0);
		a.isLoaded=!0;
		a.duration=this.duration;
		a.isPlaying&&a.play()
	}
};
THREE.Sound3D.prototype.addToDOM=function(a){
	this.isAddedToDOM=!0;
	a.appendChild(this.domElement)
};
THREE.Sound3D.prototype.play=function(a){
	this.isPlaying=!0;
	if(this.isLoaded){
		this.domElement.play();
		if(a)
			this.domElement.currentTime=a%this.duration
	}
};
THREE.Sound3D.prototype.pause=function(){
	this.isPlaying=!1;
	this.domElement.pause()
};
THREE.Sound3D.prototype.stop=function(){
	this.isPlaying=!1;
	this.domElement.pause();
	this.domElement.currentTime=0
};
THREE.Sound3D.prototype.calculateVolumeAndPan=function(a){
	a=a.length();
	this.domElement.volume=a<=this.radius?this.volume*(1-a/this.radius):0
};
THREE.Sound3D.prototype.update=function(a,b,c){
	if(this.matrixAutoUpdate){
		this.localMatrix.setPosition(this.position);
		b=!0
	}
	if(b||this.matrixNeedsUpdate){
		a?this.globalMatrix.multiply(a,this.localMatrix):this.globalMatrix.copy(this.localMatrix);
		this.matrixNeedsUpdate=!1;
		b=!0
	}
	var d=this.children.length;
	for(a=0;a<d;a++)
		this.children[a].update(this.globalMatrix,b,c)
};
},{}]},{},[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22]);