
var player = require('./player.js');

function players(scene) {

  var self = this;

  this.players = {};
  this.allPlayerShips = [];

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
    self.allPlayerShips.push(self.players[id].ship);
    return self.players[id];
  }
}

module.exports = players;

  
