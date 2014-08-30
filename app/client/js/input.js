
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
