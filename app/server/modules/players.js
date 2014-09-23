var player = require('./player.js');

var players = {

    players: [],

    lastID: 0,

    ships: new THREE.Object3D(),

    lookup: function(id) {
      var playerIndex = this.players.map(function(x) {return x.id; }).indexOf(id);
      return this.players[playerIndex];
    },

    removePlayer: function(id) {    
      var playerIndex = this.players.map(function(x) {return x.id; }).indexOf(id);
      this.ships.remove(this.players[playerIndex].ship);
      this.players.splice(playerIndex, 1);
    },

    addPlayer: function(name) {
      var id = this.lastID++;
      var playerIndex = this.players.push(new player(id, name));
      var newPlayer = this.players[playerIndex - 1];
      this.addShip(newPlayer.ship);
      return newPlayer;
    },

    removeShip: function(ship) {
      this.ships.remove(ship);
    },

    addShip: function(ship, position) {
      this.ships.add(ship);
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
    },

    getPacket: function() {
      var players = [];
      for(var i = 0, l = this.players.length; i<l; i++) {
        var player = this.players[i];
        if (!player.ship.isDead) {
          players.push({
            id : player.id,
            name : player.name,
            ship : player.ship.getPacket(),
            seq : player.seq
          });
        }
      }
      return players;
    }
};

module.exports = players;