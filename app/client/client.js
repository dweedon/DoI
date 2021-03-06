(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function Laser(position, rotation, velocity, owner, timeTraveled) {

	THREE.Object3D.call(this);
  	this.sprite = new THREE.Sprite(this.spriteMaterial);
  	this.add(this.sprite);

  	this.owner = owner;

  	this.timeTraveled = timeTraveled || 0;

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

Laser.prototype.stats = {
	speed : 40,
	range : 1,
	accuracy : 0,
	dmg : 10
};

Laser.prototype.spriteMaterial = new THREE.SpriteMaterial({ 
	map: THREE.ImageUtils.loadTexture( "assets/particle.png" ), 
	transparent: true,
	blending: THREE.AdditiveBlending,
	color: 0xff0000,
	fog: true 
});

Laser.prototype.move = function(delta) {
	this.position.x += delta * this.velocity.x;
	this.position.y += delta * this.velocity.y;
	this.timeTraveled += delta * 1;
};

Laser.prototype.testCollision = function() {
	for ( var i = 0, l = players.ships.children.length; i < l; i++ ) {
		var ship = players.ships.children[i];
		var d = this.position.distanceTo(ship.position);
		if ( d < ship.stats.hitBoxRadius ) {
			return true;
		}
	}
};

module.exports = Laser;

},{}],2:[function(require,module,exports){
// background stars setup


var starCount = 250;

var geometry = new THREE.Geometry();

for ( i = 0; i < starCount; i ++ ) {

	var vertex = new THREE.Vector3();
	vertex.x = Math.random() * 300 - 150;
	vertex.y = Math.random() * 300 - 150;
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



stars.update = function (target) {

	// TODO: This is dumb but needed to fix a bug, bounding box does not seem to update, should be a cleaner way to fix...
	if (stars.geometry.boundingSphere !== null && stars.geometry.boundingSphere.radius !== 100000)  {
		stars.geometry.boundingSphere.radius = 100000;
	}

	for (var i = 0, l = stars.geometry.vertices.length; i < l; i++) {

		var star = stars.geometry.vertices[i];
		
		star.y = 
			target.y - star.y >  150 ? target.y + 150:
			target.y - star.y < -150 ? target.y - 150:
			star.y;

		star.x = 
			target.x - star.x >  150 ? target.x + 150:
			target.x - star.x < -150 ? target.x - 150:
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


function Explosion() {

	THREE.Sprite.call(this);

  	this.texture = THREE.ImageUtils.loadTexture( "assets/explosion.png" );
  	this.texture.wrapS = this.texture.wrapT = THREE.RepeatWrapping; 
  	this.texture.repeat.set(1/5, 1/5);

  	this.currentDisplayTime = 0;
  	this.currentTile = 0;

  	this.material = new THREE.SpriteMaterial({ 
		map: this.texture,
		blending: THREE.AdditiveBlending,
		fog: true 
	});

	this.visible = false;

	this.position.z = 2;
	this.scale.x = 12;
	this.scale.y = 12;
	this.scale.z = 12;

	
	this.startSound = new THREE.Sound3D("assets/explosion.wav", 220, 0.5, false);
	this.add(this.startSound);
	

}

Explosion.prototype = new THREE.Sprite(this.material);
Explosion.prototype.constructor = Explosion;

Explosion.prototype.currentDisplayTime = 0;
Explosion.prototype.currentTile = 0;
Explosion.prototype.numberOfTiles = 24;
Explosion.prototype.isOver = false;
Explosion.prototype.tileDisplayDuration = 50;

Explosion.prototype.update = function(delta) {
	
	this.currentDisplayTime += 1000 * delta;
	if (this.currentTile == 5) this.startSound.play();
	while (this.currentDisplayTime > this.tileDisplayDuration)
	{
		if (this.currentTile === this.numberOfTiles) this.isOver = true;
		this.visible = true;
		this.currentDisplayTime -= this.tileDisplayDuration;
		this.currentTile++;
		var currentColumn = this.currentTile % 5;
		this.texture.offset.x = currentColumn / 5;

		var currentRow = Math.floor( this.currentTile / 5 );
		this.texture.offset.y = 1 - (currentRow / 5);
	}
};

module.exports = Explosion;	
},{}],5:[function(require,module,exports){
function Healthbar() {

	THREE.Sprite.call(this);

  	this.map = THREE.ImageUtils.loadTexture( "assets/healthbar.png" );
  	this.material = new THREE.SpriteMaterial({ 
		map: this.map,
		color:  new THREE.Color( "rgb(0,255,0)" )
	});

	this.visible = false;
	this.scale.x = 7.5;
	this.scale.y = 7.5;

}

Healthbar.prototype = new THREE.Sprite();

Healthbar.prototype.constructor = Healthbar;

Healthbar.prototype.position.z = 2;

Healthbar.prototype.setHealth = function(h) {
	this.scale.x = h * 7.5;
	if ( h > 0.7 ) {
		this.material.color.g = 1;
		this.material.color.r = (1 - h) * (1/0.3);
	} else {
		this.material.color.g = h * (1/0.7);
		this.material.color.r = 1;
	} 
};

module.exports = Healthbar;
},{}],6:[function(require,module,exports){
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





},{"./background.js":2,"./camera.js":3,"./input.js":7,"./lasers":8,"./lighting.js":9,"./mm.js":10,"./playerStats.js":12,"./players.js":13,"./renderer.js":14,"./vendor/THREEx.js":19}],7:[function(require,module,exports){

var KeyboardState = require('./vendor/THREEx.js').KeyboardState;
var keyboard = new KeyboardState();

module.exports = {

    inputSeq : 0,

	getInput :  function() {

		 return  {
			up : keyboard.pressed("up"),
			left : keyboard.pressed("left"),  
			right: keyboard.pressed("right"),
			space : keyboard.pressed("space"),
			tab : this.keyUp("tab")
		};
		
	},

	getSeq : function() {
		this.inputSeq += 1;
		return this.inputSeq;
	},

	keyUp : function(key) {
		if (this.lastDown[key] === undefined) {
			this.lastDown[key] = false;
		}
		if (!keyboard.pressed(key)) {
			if (this.lastDown[key]) {
				this.lastDown[key] = false;
				return true;
			} else 
				return false;
		} else {
			this.lastDown[key] = true;
			return false;
		}
	},

	lastDown : {}

};
},{"./vendor/THREEx.js":19}],8:[function(require,module,exports){
var Laser = require('./Laser.js');

function lasers () {
  	THREE.Object3D.call(this);
}

lasers.prototype = new THREE.Object3D();
lasers.prototype.constructor = lasers;

lasers.prototype.update = function(delta) {
	var i = this.children.length;
	while(i > 0) {
		i--;
		var laser = this.children[i];
		if ( laser.timeTraveled < laser.stats.range ) { // if laser has not hit max range
			if (!laser.isDead) { // If laser is not dead (scheduled for removal)
				laser.move(delta); // Move the laser
				if (laser.testCollision()) {
					this.remove(laser);
					// TODO: Not garunteed to remove the right element as we add more sounds
					$( "audio" ).first().remove();
				}
			}
		} else {
			this.remove(laser);
			// TODO: Not garunteed to remove the right element as we add more sounds
			$( "audio" ).first().remove();
		}
	}
};

lasers.prototype.newLaser = function (position, rotation, velocity, owner, timeTraveled) {
	var laser = new Laser(position, rotation, velocity, owner, timeTraveled);
	this.add(laser);
};

lasers.prototype.newLaserFromServer = function(data) {
	console.log('laser added');
	var laser = new Laser(data.owner.ship.position, data.owner.ship.rotation.z, data.owner.ship.velocity, data.owner);
	this.add(laser);
};



module.exports = lasers;
},{"./Laser.js":1}],9:[function(require,module,exports){
// Player lighting setup


// Create some lights and position them
var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1.5 );
hemiLight.color.setHSL( 0.6, 1, 0.6 );
hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
hemiLight.position.set( 500, 500, 0 );


lighting = new THREE.Object3D(); // Add the lights to a container object
lighting.add(hemiLight);

module.exports = lighting;
},{}],10:[function(require,module,exports){
var mm = {};

mm.scene = new THREE.Scene();
// Camera setup
var width = 400, height = 400;

mm.camera =  new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 ); // Create Camera
mm.camera.position.set(0, 0, 150); // Set camera above and behind the targt
mm.camera.lookAt(new THREE.Vector3(0,0,0)); // Set camera to look at the target
mm.camera.update = function(target) {
	this.position.x = target.x;
	this.position.y = target.y;
};

// Renderer Setup
mm.renderer = new THREE.CanvasRenderer();
mm.renderer.setSize(200, 200); 

// Blip setup
mm.blip = function() {
  THREE.Sprite.call(this);

  this.material = new THREE.SpriteMaterial({ 
    map: THREE.ImageUtils.loadTexture( 'assets/mm-ship-dot.jpg' ),
    transparent : true
  });

  this.scale.x = 7;
  this.scale.y = 7;
  this.scale.z = 7;
};

mm.blip.prototype = new THREE.Sprite(this.material);
mm.blip.prototype.constructor = mm.blip;

mm.blip.prototype.isBlinking = false;

mm.blip.prototype.toggleBlink = function(t) {
  var opt = t || this.isBlinking ? "off" : "on";
  if (t === "off") {
    this.isBlinking = false;
  } else {
    this.isBlinking = true;
    this.blink();
  }
};

mm.blip.prototype.blink = function() {
  if ( !(this.isBlinking) )  {
    this.visible = true;
    return;
  }
  if (this.visible) this.visible = false;
  else this.visible = true;
  var self = this;
  setTimeout(function() {
    self.blink();
  }, 300);
};

mm.blips = new THREE.Object3D();

module.exports = mm;
},{}],11:[function(require,module,exports){
var ship = require('./ship.js');

function player(id, name) {
	this.id = id;
	this.name = name;
  this.kills = 0;
  this.deaths = 0;
  this.ship = new ship();
  this.inputs = [];
}

player.prototype = {

  ship : new ship(),

  serverUpdate : false,

  target : null,

  setTarget : function(target) {

    // If a target is already selected untarget it
    if (this.target !== null) this.target.ship.toggleTargeted();

    // Set the new target
    this.target = target;
    this.target.ship.toggleTargeted();

  },

  unsetTarget : function() {
    this.target.ship.toggleTargeted();
    this.target = null;
  },

  nextTarget : function() {

    var target;
    
    // If no target is selected, target the next player after this player (the user)
    if ( this.target === null ) {

      target = players.nextPlayer(this);

      // If the next player was also this player, then select no target
      if (target === this) return; 
    }

    // If a target is selected, target the next player after the current target
    else {
      target = players.nextPlayer(this.target); 

      // If the next player was also this player, then select no new target and deselect the current target
      if (target === this) {
        this.unsetTarget();
        return;
      }
    }

    // Set the target if everything above gets through
    this.setTarget(target);

  },

  handleServerUpdate: function() {

    // Accept Server Position Information
    this.ship.position.x = this.serverUpdate.ship.position.x;
    this.ship.position.y = this.serverUpdate.ship.position.y;
    this.ship.rotation.z = this.serverUpdate.ship.rotation;
    this.ship.velocity.x = this.serverUpdate.ship.velocity.x;
    this.ship.velocity.y = this.serverUpdate.ship.velocity.y;
    this.ship.health = this.serverUpdate.ship.health;
    this.ship.energy = this.serverUpdate.ship.energy;

    if ( this.serverUpdate.ship.isExploding ) this.ship.explode();

    if (this.inputs.length > 0) {
    
      var lastSeqIndex = -1;

      // Find and store the input index that the update from the server is associated with
      for(var i = 0, l = this.inputs.length; i < l; ++i) {
        if ( this.inputs[i].seq == this.serverUpdate.seq ) {
          lastSeqIndex = i;
          break;
        }
      }

      // Assuming we found a matching input seq from the server, dump everything before it
      if(lastSeqIndex != -1) {
        var numberToClear = Math.abs(lastSeqIndex + 1);
        this.inputs.splice(0, numberToClear);
      }

      // For each remaining input reprocess positioning except last
      for(i = 0, l = this.inputs.length - 1; i<l; i++) {
        
        var input = this.inputs[i].input;
        var delta = this.inputs[i].delta;
        if (input.up) this.ship.accelerate(delta);
        if (input.left) this.ship.turnLeft(delta);
        if (input.right) this.ship.turnRight(delta);
        this.ship.move(delta);

      }

      this.handleInput(this.inputs[this.inputs.length - 1]);

    }

    // Clear server update
    this.serverUpdate = false;


  },

  handleInput : function(input) {
    if (input.input.up) this.ship.accelerate(input.delta);
    if (input.input.left) this.ship.turnLeft(input.delta);
    if (input.input.right) this.ship.turnRight(input.delta);
    if (!input.input.left && !input.input.right ) this.ship.resetBankAngle(input.delta);
    if (input.input.tab) this.nextTarget();
    if (input.input.space) this.ship.fireLaser(this);
  },

  update: function(delta) {

    // If the player's ship is flagged as dead do nothing
    if (this.ship.isDead) return;

      if (this.ship.health <= 0 &&  !this.ship.isExploding ) {
        this.ship.explode();
      }

      // If the player's ship has a target, and the target's ship is dead, reset this players target to null
      if (this.target && this.target.ship.isDead) this.target = null;

      // Check for an update from the server, and recalculate position based on server position or just do local positioning
      if (this.serverUpdate) this.handleServerUpdate();
      else if (this.inputs.length > 0) this.handleInput(this.inputs[this.inputs.length - 1]);

      // Regen the ship's hp and energy
      this.ship.regen(delta);

      // Move the ship
      this.ship.move(delta);

      // Handle Explosion
      if (this.ship.isExploding) {

        // Progress Explosion Frames
        this.ship.explosion.update(delta);
        
        // Hide this player's ship when the explosion gets to frame 13 (largest part of animation)
        if( this.ship.explosion.currentTile == 13 ) this.ship.shipModel.visible = false;

        // Remove this player's ship when explosion is over and increase this players death count
        if ( this.ship.explosion.isOver ) { 
          players.removeShip(this.ship);
          this.ship.isDead = true;
          this.deaths++;
        }

      }
  }

};

module.exports = player;


},{"./ship.js":15}],12:[function(require,module,exports){
module.exports = function() {

	var hp = document.getElementById('playerHP');
	var energy = document.getElementById('playerEnergy');
	hp.width = energy.width = 199;
	hp.height = energy.height = 12;

	var energyContext = energy.getContext('2d');
	var hpContext = hp.getContext('2d');

	this.bar = {
	    x: 1,
	    y: 1,
	    width: 200,
	    height: 10
	};

	this.update = update;


	function update(player) {
		// Clear the canvas
		hp.width = hp.width;
		energy.width = energy.width;

		var health = player.ship.health / player.ship.stats.maxHealth;
		var e = player.ship.energy / player.ship.stats.maxEnergy;
		if ( e > 0 ) {

			var g = Math.floor(255 * e);
			var gs = g.toString();

			energyContext.fillStyle = 'rgb(0,' + gs + ',255)';
			energyContext.fillRect(this.bar.x, this.bar.y, this.bar.width * e, this.bar.height);			
		}
		if ( health > 0 ) {
			hpContext.fillStyle = "#" + player.ship.healthbar.material.color.getHexString();
			hpContext.fillRect(this.bar.x, this.bar.y, this.bar.width * health, this.bar.height);
		}
	}

};
},{}],13:[function(require,module,exports){
var player = require('./player.js');


var players = {

    players: [],

    ships: new THREE.Object3D(),

    lookup: function(id) {
      var playerIndex = this.players.map(function(x) {return x.id; }).indexOf(id);
      return this.players[playerIndex];
    },

    removePlayer: function(id) {    
      var playerIndex = this.players.map(function(x) {return x.id; }).indexOf(id);
      this.ships.remove(this.players[playerIndex].ship);
      mm.blips.remove(this.players[playerIndex].ship.blip);
      this.players.splice(playerIndex, 1);
    },

    addPlayer: function(id, name) {
      var playerIndex = this.players.push(new player(id, name));
      var newPlayer = this.players[playerIndex - 1];
      this.addShip(newPlayer.ship);
      return newPlayer;
    },

    removeShip: function(ship) {
      this.ships.remove(ship);
      mm.blips.remove(ship.blip);
    },

    addShip: function(ship, position) {
      this.ships.add(ship);
      mm.blips.add(ship.blip);
      var p = position || new THREE.Vector3();
      ship.position.x = p.x;
      ship.position.y = p.y;
      ship.reset();
    },

    nextPlayer: function(player) {
      var i = this.players.indexOf(player);
      if(i >= 0 && i < this.players.length - 1)
        return this.players[i + 1];
      else
        return this.players[0];
    }
};

module.exports = players;

  

},{"./player.js":11}],14:[function(require,module,exports){
var Detector = require('./vendor/Detector.js');

if ( Detector.webgl ) 
	renderer = new THREE.WebGLRenderer( {antialias:true} ); // if browser suports webgl use webgl renderer
else 
	renderer = new THREE.CanvasRenderer(); // fallback

renderer.setSize(window.innerWidth, window.innerHeight); // set renderer size based on window size
renderer.shadowMapEnabled = true; // Shadows allowed

module.exports = renderer;
},{"./vendor/Detector.js":17}],15:[function(require,module,exports){
var Explosion = require('./explosion.js');
var Healthbar = require('./healthbar.js');
var mm    = require('./mm.js');

function ship() {

	THREE.Object3D.call(this);
  var self = this;

  // Load ship model
  this.loader.load( "assets/ship.js", function(geometry, materials) {
		var material = new THREE.MeshFaceMaterial( materials );
		self.shipModel = new THREE.Mesh( geometry, material );
		self.shipModel.rotateOnAxis( new THREE.Vector3(1,0,0), Math.PI / 2);
		self.add(self.shipModel);

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

    self.add(key);
    self.add(hemiLight);

  });

  // Generate the healthbar
  this.healthbar = new Healthbar();
  this.add(this.healthbar);

  // Generate the minimap blip
  this.blip = new mm.blip();

  // Create a unique velocity vector for movement calculation
  this.velocity = new THREE.Vector3();

  // Create unique health and energy properties
  this.health = this.stats.maxHealth;
  this.energy = this.stats.maxEnergy;

}

ship.prototype = new THREE.Object3D();
ship.prototype.constructor = ship;

// Setup stuff
ship.prototype.loader = new THREE.JSONLoader();
ship.prototype.shipModel = new THREE.Mesh();

// Shared stats
ship.prototype.stats = {
  maxEnergy    : 72,   // Max Energy
  maxHealth    : 300,  // Max HP
  regen        : 10,   // Regen per second
  hitBoxRadius : 2.75, // Unit size of hit box radius
  turnRate     : 220,  // Degrees per second
  accelRate    : 35,   // Units per second per second
  maxSpeed     : 40,   // Units per second
  maxBankAngle : 0.3,  // Maximum banking angle
  bankAngle    : 0     // Current bank angle
};

// Flags
ship.prototype.isExploding = false;
ship.prototype.canFire = true;
ship.prototype.isTargeted = false;
ship.prototype.isDead = false;
ship.prototype.turning = false;

// Methods
ship.prototype.takeDmg = function(dmg, player) {
  this.health -= dmg;
  this.healthbar.setHealth(this.health/this.stats.maxHealth);
  if (this.health <= 0 && !this.isExploding) {
    this.explode();
    player.kills++;
  }
};

ship.prototype.regen = function(delta) {
  if ( this.energy < this.stats.maxEnergy ) {
    this.energy += this.stats.regen * delta;
    if ( this.energy > this.stats.maxEnergy ) this.energy = this.stats.maxEnergy;
  }
  if ( this.health < this.stats.maxHealth ) {
    this.health += this.stats.regen * delta;
    if ( this.health > this.stats.maxHealth ) this.health = this.stats.maxHealth;
  }
  this.healthbar.setHealth(this.health/this.stats.maxHealth);
};

ship.prototype.reset = function() {
  this.isExploding = false;
  this.canFire = true;
  this.isDead = false;
  this.isTargeted = false;
  this.health = this.stats.maxHealth;
  this.energy = this.stats.maxEnergy;
  this.shipModel.visible = true;
  this.velocity.x = 0;
  this.velocity.y = 0;
  this.rotation.z = 0;
  this.remove(this.explosion);
};

ship.prototype.explode = function() {
  this.isExploding = true;
  this.healthbar.visible = false;
  this.explosion = new Explosion();
  this.add(this.explosion);
};

ship.prototype.fireLaser = function(player) {
  var self = this;
  if ( this.energy >= 3 && this.canFire ) {
    lasers.newLaser(this.position, this.rotation.z, this.velocity, player);
    this.canFire = false;
    this.energy -= 3;
    setTimeout(function() {
        self.canFire = true;
    }, 100);
  }
};

ship.prototype.accelerate = function (delta) {
  this.velocity.x -= delta * this.stats.accelRate *  Math.sin(this.rotation.z); // Adjust X Velocity
  this.velocity.y += delta * this.stats.accelRate *  Math.cos(this.rotation.z); // Adjust Y Velocity
  if ( this.velocity.lengthSq() > Math.pow(this.stats.maxSpeed, 2) ) // If the new velocity is too fast
    this.velocity.setLength(this.stats.maxSpeed); // Bring it back to max speed
};

ship.prototype.turnLeft = function (delta) {
  this.rotateOnAxis( new THREE.Vector3(0,0,1), delta * Math.PI/180 * this.stats.turnRate); // Rotate Left
  if(this.shipModel.rotation.z < this.stats.maxBankAngle) { // If below max bank angle
    this.shipModel.rotation.z += this.stats.maxBankAngle * 5 * delta; // Bank the ship a little
  }
};

ship.prototype.turnRight = function (delta) {
  this.rotateOnAxis( new THREE.Vector3(0,0,-1), delta * Math.PI/180 * this.stats.turnRate); // Rotate Right
  if(this.shipModel.rotation.z > -this.stats.maxBankAngle) { // If below max bank angle
    this.shipModel.rotation.z -= this.stats.maxBankAngle *  5 * delta; // Bank the ship a little
  }
};

ship.prototype.resetBankAngle = function (delta) {
  if (this.shipModel.rotation.z > 0) 
    this.shipModel.rotation.z -= this.stats.maxBankAngle * 5 * delta;
  if (this.shipModel.rotation.z < 0) 
    this.shipModel.rotation.z += this.stats.maxBankAngle * 5 * delta;
};

ship.prototype.move = function(delta) {
    this.position.x += delta * this.velocity.x;
    this.position.y += delta * this.velocity.y;
    this.blip.position.x = this.position.x;
    this.blip.position.y = this.position.y;
};

ship.prototype.toggleTargeted = function() {
  if (this.isTargeted) {
    this.isTargeted = false;
    this.blip.toggleBlink("off");
    this.healthbar.visible = false;
  } else {
    this.isTargeted = true;
    this.blip.toggleBlink("on");
    this.healthbar.visible = true;
  }
};

ship.prototype.updateFromServer = function(update) {

    this.position.x = update.position.x;
    this.position.y = update.position.y;
    this.rotation.z = update.rotation;
    this.velocity.x = update.velocity.x;
    this.velocity.y = update.velocity.y;
    this.health = update.health;
    this.energy = update.energy;

};

module.exports = ship;
},{"./explosion.js":4,"./healthbar.js":5,"./mm.js":10}],16:[function(require,module,exports){
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
},{"./Sparks.js":18}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
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
},{}],19:[function(require,module,exports){
module.exports = {

	KeyboardState : require('./THREEx/KeyboardState.js'),

	WindowResize : require('./THREEx/WindowResize.js'),

	Sparks : require('./THREEx/Sparks.js'),

	FullScreen : require('./THREEx/FullScreen.js'),

	Domevent : require('./THREEx/Domevent.js')
	
};
},{"./THREEx/Domevent.js":20,"./THREEx/FullScreen.js":21,"./THREEx/KeyboardState.js":22,"./THREEx/Sparks.js":23,"./THREEx/WindowResize.js":24}],20:[function(require,module,exports){
// This THREEx helper makes it easy to handle the mouse events in your 3D scene
//
// * CHANGES NEEDED
//   * handle drag/drop
//   * notify events not object3D - like DOM
//     * so single object with property
//   * DONE bubling implement bubling/capturing
//   * DONE implement event.stopPropagation()
//   * DONE implement event.type = "click" and co
//   * DONE implement event.target
//
// # Lets get started
//
// First you include it in your page
//
// ```<script src='threex.domevent.js'></script>```
//
// # use the object oriented api
//
// You bind an event like this
// 
// ```mesh.on('click', function(object3d){ ... })```
//
// To unbind an event, just do
//
// ```mesh.off('click', function(object3d){ ... })```
//
// As an alternative, there is another naming closer DOM events.
// Pick the one you like, they are doing the same thing
//
// ```mesh.addEventListener('click', function(object3d){ ... })```
// ```mesh.removeEventListener('click', function(object3d){ ... })```
//
// # Supported Events
//
// Always in a effort to stay close to usual pratices, the events name are the same as in DOM.
// The semantic is the same too.
// Currently, the available events are
// [click, dblclick, mouseup, mousedown](http://www.quirksmode.org/dom/events/click.html),
// [mouseover and mouse out](http://www.quirksmode.org/dom/events/mouseover.html).
//
// # use the standalone api
//
// The object-oriented api modifies THREE.Object3D class.
// It is a global class, so it may be legitimatly considered unclean by some people.
// If this bother you, simply do ```THREEx.DomEvent.noConflict()``` and use the
// standalone API. In fact, the object oriented API is just a thin wrapper
// on top of the standalone API.
//
// First, you instanciate the object
//
// ```var domEvent = new THREEx.DomEvent();```
// 
// Then you bind an event like this
//
// ```domEvent.bind(mesh, 'click', function(object3d){ object3d.scale.x *= 2; });```
//
// To unbind an event, just do
//
// ```domEvent.unbind(mesh, 'click', callback);```
//
// 
// # Code

//

/** @namespace */
var THREEx    = THREEx    || {};

// # Constructor
THREEx.DomEvent = function(camera, domElement)
{
  this._camera  = camera || null;
  this._domElement= domElement || document;
  this._projector = new THREE.Projector();
  this._selected  = null;
  this._boundObjs = [];

  // Bind dom event for mouse and touch
  var _this = this;
  this._$onClick    = function(){ _this._onClick.apply(_this, arguments);   };
  this._$onDblClick = function(){ _this._onDblClick.apply(_this, arguments);  };
  this._$onMouseMove  = function(){ _this._onMouseMove.apply(_this, arguments); };
  this._$onMouseDown  = function(){ _this._onMouseDown.apply(_this, arguments); };
  this._$onMouseUp  = function(){ _this._onMouseUp.apply(_this, arguments);   };
  this._$onTouchMove  = function(){ _this._onTouchMove.apply(_this, arguments); };
  this._$onTouchStart = function(){ _this._onTouchStart.apply(_this, arguments);  };
  this._$onTouchEnd = function(){ _this._onTouchEnd.apply(_this, arguments);  };
  this._domElement.addEventListener( 'click'  , this._$onClick  , false );
  this._domElement.addEventListener( 'dblclick' , this._$onDblClick , false );
  this._domElement.addEventListener( 'mousemove'  , this._$onMouseMove  , false );
  this._domElement.addEventListener( 'mousedown'  , this._$onMouseDown  , false );
  this._domElement.addEventListener( 'mouseup'  , this._$onMouseUp  , false );
  this._domElement.addEventListener( 'touchmove'  , this._$onTouchMove  , false );
  this._domElement.addEventListener( 'touchstart' , this._$onTouchStart , false );
  this._domElement.addEventListener( 'touchend' , this._$onTouchEnd , false );
}

// # Destructor
THREEx.DomEvent.prototype.destroy = function()
{
  // unBind dom event for mouse and touch
  this._domElement.removeEventListener( 'click'   , this._$onClick  , false );
  this._domElement.removeEventListener( 'dblclick'  , this._$onDblClick , false );
  this._domElement.removeEventListener( 'mousemove' , this._$onMouseMove  , false );
  this._domElement.removeEventListener( 'mousedown' , this._$onMouseDown  , false );
  this._domElement.removeEventListener( 'mouseup'   , this._$onMouseUp  , false );
  this._domElement.removeEventListener( 'touchmove' , this._$onTouchMove  , false );
  this._domElement.removeEventListener( 'touchstart'  , this._$onTouchStart , false );
  this._domElement.removeEventListener( 'touchend'  , this._$onTouchEnd , false );
}

THREEx.DomEvent.eventNames  = [
  "click",
  "dblclick",
  "mouseover",
  "mouseout",
  "mousedown",
  "mouseup"
];

/********************************************************************************/
/*    domevent context            */
/********************************************************************************/

// handle domevent context in object3d instance

THREEx.DomEvent.prototype._objectCtxInit  = function(object3d){
  object3d._3xDomEvent = {};
}
THREEx.DomEvent.prototype._objectCtxDeinit  = function(object3d){
  delete object3d._3xDomEvent;
}
THREEx.DomEvent.prototype._objectCtxIsInit  = function(object3d){
  return object3d._3xDomEvent ? true : false;
}
THREEx.DomEvent.prototype._objectCtxGet = function(object3d){
  return object3d._3xDomEvent;
}

/********************************************************************************/
/*                    */
/********************************************************************************/

/**
 * Getter/Setter for camera
*/
THREEx.DomEvent.prototype.camera  = function(value)
{
  if( value ) this._camera  = value;
  return this._camera;
}

THREEx.DomEvent.prototype.bind  = function(object3d, eventName, callback, useCapture)
{
  console.assert( THREEx.DomEvent.eventNames.indexOf(eventName) !== -1, "not available events:"+eventName );

  if( !this._objectCtxIsInit(object3d) )  this._objectCtxInit(object3d);
  var objectCtx = this._objectCtxGet(object3d); 
  if( !objectCtx[eventName+'Handlers'] )  objectCtx[eventName+'Handlers'] = [];

  objectCtx[eventName+'Handlers'].push({
    callback  : callback,
    useCapture  : useCapture
  });
  
  // add this object in this._boundObjs
  this._boundObjs.push(object3d);
}

THREEx.DomEvent.prototype.unbind  = function(object3d, eventName, callback)
{
  console.assert( THREEx.DomEvent.eventNames.indexOf(eventName) !== -1, "not available events:"+eventName );

  if( !this._objectCtxIsInit(object3d) )  this._objectCtxInit(object3d);

  var objectCtx = this._objectCtxGet(object3d);
  if( !objectCtx[eventName+'Handlers'] )  objectCtx[eventName+'Handlers'] = [];

  var handlers  = objectCtx[eventName+'Handlers'];
  for(var i = 0; i < handlers.length; i++){
    var handler = handlers[i];
    if( callback != handler.callback )  continue;
    if( useCapture != handler.useCapture )  continue;
    handlers.splice(i, 1)
    break;
  }
  // from this object from this._boundObjs
  var index = this._boundObjs.indexOf(object3d);
  console.assert( index !== -1 );
  this._boundObjs.splice(index, 1);
}

THREEx.DomEvent.prototype._bound  = function(eventName, object3d)
{
  var objectCtx = this._objectCtxGet(object3d);
  if( !objectCtx )  return false;
  return objectCtx[eventName+'Handlers'] ? true : false;
}

/********************************************************************************/
/*    onMove                */
/********************************************************************************/

// # handle mousemove kind of events

THREEx.DomEvent.prototype._onMove = function(mouseX, mouseY, origDomEvent)
{
  var vector  = new THREE.Vector3( mouseX, mouseY, 1 );
  this._projector.unprojectVector( vector, this._camera );

  var ray   = new THREE.Ray( this._camera.position, vector.subSelf( this._camera.position ).normalize() );
  var intersects = ray.intersectObjects( this._boundObjs );
  
  var oldSelected = this._selected;

  if( intersects.length > 0 ){
    var intersect = intersects[ 0 ];
    var newSelected = intersect.object;
    this._selected  = newSelected;
  
    var notifyOver, notifyOut;
    if( oldSelected != newSelected ){
      // if newSelected bound mouseenter, notify it
      notifyOver  = this._bound('mouseover', newSelected);
      // if there is a oldSelect and oldSelected bound mouseleave, notify it
      notifyOut = oldSelected && this._bound('mouseout', oldSelected);
    }
  }else{
    // if there is a oldSelect and oldSelected bound mouseleave, notify it
    notifyOut = oldSelected && this._bound('mouseout', oldSelected);
    this._selected  = null;
  }

  // notify mouseEnter - done at the end with a copy of the list to allow callback to remove handlers
  notifyOver && this._notify('mouseover', newSelected, origDomEvent);
  // notify mouseLeave - done at the end with a copy of the list to allow callback to remove handlers
  notifyOut  && this._notify('mouseout', oldSelected, origDomEvent);
}


/********************************************************************************/
/*    onEvent               */
/********************************************************************************/

// # handle click kind of events

THREEx.DomEvent.prototype._onEvent  = function(eventName, mouseX, mouseY, origDomEvent)
{
  var vector  = new THREE.Vector3( mouseX, mouseY, 1 );
  this._projector.unprojectVector( vector, this._camera );

  vector.subSelf( this._camera.position ).normalize()
  var ray   = new THREE.Ray( this._camera.position, vector );
  var intersects  = ray.intersectObjects( this._boundObjs );

  // if there are no intersections, return now
  if( intersects.length === 0 ) return;

  // init some vairables
  var intersect = intersects[0];
  var object3d  = intersect.object;
  var objectCtx = this._objectCtxGet(object3d);
  if( !objectCtx )  return;

  // notify handlers
  this._notify(eventName, object3d, origDomEvent);
}

THREEx.DomEvent.prototype._notify = function(eventName, object3d, origDomEvent)
{
  var objectCtx = this._objectCtxGet(object3d);
  var handlers  = objectCtx ? objectCtx[eventName+'Handlers'] : null;

  // do bubbling
  if( !objectCtx || !handlers || handlers.length === 0 ){
    object3d.parent && this._notify(eventName, object3d.parent);
    return;
  }
  
  // notify all handlers
  var handlers  = objectCtx[eventName+'Handlers'];
  for(var i = 0; i < handlers.length; i++){
    var handler = handlers[i];
    var toPropagate = true;
    handler.callback({
      type    : eventName,
      target    : object3d,
      origDomEvent  : origDomEvent,
      stopPropagation : function(){
        toPropagate = false;
      }
    });
    if( !toPropagate )  continue;
    // do bubbling
    if( handler.useCapture === false ){
      object3d.parent && this._notify(eventName, object3d.parent);
    }
  }
}

/********************************************************************************/
/*    handle mouse events           */
/********************************************************************************/
// # handle mouse events

THREEx.DomEvent.prototype._onMouseDown  = function(event){ return this._onMouseEvent('mousedown', event); }
THREEx.DomEvent.prototype._onMouseUp  = function(event){ return this._onMouseEvent('mouseup'  , event); }


THREEx.DomEvent.prototype._onMouseEvent = function(eventName, domEvent)
{
  var mouseX  = +(domEvent.clientX / window.innerWidth ) * 2 - 1;
  var mouseY  = -(domEvent.clientY / window.innerHeight) * 2 + 1;
  return this._onEvent(eventName, mouseX, mouseY, domEvent);
}

THREEx.DomEvent.prototype._onMouseMove  = function(domEvent)
{
  var mouseX  = +(domEvent.clientX / window.innerWidth ) * 2 - 1;
  var mouseY  = -(domEvent.clientY / window.innerHeight) * 2 + 1;
  return this._onMove(mouseX, mouseY, domEvent);
}

THREEx.DomEvent.prototype._onClick    = function(event)
{
  // TODO handle touch ?
  return this._onMouseEvent('click' , event);
}
THREEx.DomEvent.prototype._onDblClick   = function(event)
{
  // TODO handle touch ?
  return this._onMouseEvent('dblclick'  , event);
}

/********************************************************************************/
/*    handle touch events           */
/********************************************************************************/
// # handle touch events


THREEx.DomEvent.prototype._onTouchStart = function(event){ return this._onTouchEvent('mousedown', event); }
THREEx.DomEvent.prototype._onTouchEnd = function(event){ return this._onTouchEvent('mouseup'  , event); }

THREEx.DomEvent.prototype._onTouchMove  = function(domEvent)
{
  if( domEvent.touches.length != 1 )  return undefined;

  domEvent.preventDefault();

  var mouseX  = +(domEvent.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1;
  var mouseY  = -(domEvent.touches[ 0 ].pageY / window.innerHeight) * 2 + 1;
  return this._onMove('mousemove', mouseX, mouseY, domEvent);
}

THREEx.DomEvent.prototype._onTouchEvent = function(eventName, domEvent)
{
  if( domEvent.touches.length != 1 )  return undefined;

  domEvent.preventDefault();

  var mouseX  = +(domEvent.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1;
  var mouseY  = -(domEvent.touches[ 0 ].pageY / window.innerHeight) * 2 + 1;
  return this._onEvent(eventName, mouseX, mouseY, domEvent);  
}

module.exports = THREEx.DomEvent;
},{}],21:[function(require,module,exports){
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
},{}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
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

},{"../Sparks.js":18}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){
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
},{}]},{},[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25]);