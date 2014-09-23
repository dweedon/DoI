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