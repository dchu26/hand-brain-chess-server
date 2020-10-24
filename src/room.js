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
        return false;
      }
    }
    if (roles.size != 4) {
      return false;
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
      let target = this.game.get(move.from);
      let piece = target.type;
      let color = target.color;
      for (let square of this.game.SQUARES) {
        let boardSquare = this.game.get(square);
        if (boardSquare !== null && 
          boardSquare.type === piece &&
          boardSquare.color === color) {
          squares.push(square);
        }
      }
    }
    if (player === 1 || player === 3) {
      squares.push(move.from);
      squares.push(move.to);
    }
    return squares;
  }

  move(move, userId) {
    if (!this.players.has(userId)) {
      return false;
    }

    let role = this.players.get(userId);
    if (role !== this.currentPlayer) {
      return false;
    }

    let result = this.game.move(move);
    if (result === null) {
      return false;
    }

    if (role === 0 || role === 2) {
      this.game.undo();
    }

    this.lastMove.player = role;
    this.lastMove.move = move;
    this.currentPlayer = (this.currentPlayer + 1) % 4;
    return true;
  }

  boardState() {
    let position = this.game.fen();
    let gameState = "";//room.gameState();
    let squares = this.squares();
    return {position: position, squares: squares, gameState: gameState};
  }
}