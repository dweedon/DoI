
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