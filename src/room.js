const { Chess } = require("chess.js");

module.exports = class Room {
  constructor(id) {
    this.id = id;
    this.game = new Chess();
    this.phase = "lobby";
    this.players = new Map();
    this.currentPlayer = 0;
    this.lastMove = {player: -1, move: null};
    this.gameState = "";
  }

  chooseRole(userId, role) {
    // 0 wb, 1 wh, 2 bb, 3 bh
    if (this.phase !== "lobby") {
      return;
    }
    this.players.delete(userId);
    this.players.set(userId, role);
  }

  validatePlayers() {
    let roles  = new Set();
    for (let value of this.players.values()) {
      if (roles.add(value) === false) {
        //return false;
      }
    }
    if (roles.size != 4) {
      //return false;
    }
    this.phase = "game";
    return true;
  }

  gameState() {
    if (this.game.in_stalemate() || 
      this.game.in_draw() || 
      this.game.in_checkmate()) {
      return "ended";
    }
    return "";
  }

  squares() {
    let squares = [];
    let player = this.lastMove.player;
    let move = this.lastMove.move;
    if (player === 0 || player === 2) {
      let target = this.game.get(move.to);
      let piece = target.type;
      let color = target.color;
      for (let square of this.game.SQUARES) {
        let boardSquare = this.game.get(square);
        if (boardSquare !== null && 
          boardSquare.type === piece &&
          boardSquare.color === color) {
          squares.push(boardSquare);
        }
      }
    }
    if (player === 1 || player === 3) {
      squares.push(move.from);
      squares.push(move.to);
    }
    return squares;
  }
}