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

  getPlayers() {
    let players = [];
    for (let entry of this.players.entries()) {
      players.push(entry);
    }
    return players;
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

  isOver() {
    if (this.game.in_stalemate() || 
      this.game.in_draw() || 
      this.game.in_checkmate()) {
      return true;
    }
    return false;
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
        let squarePiece = this.game.get(square);
        if (squarePiece !== null && 
          squarePiece.type === piece &&
          squarePiece.color === color &&
          this.game.moves({square: square}).length > 0) {
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

    if (role === 1 || role === 3) {
      let handPiece = this.game.get(move.from);
      let brainPiece = this.game.get(this.lastMove.from);
      if (handPiece === null) {
        return false;
      }
      if (handPiece.type !== brainPiece.type && handPiece.color !== brainPiece.color) {
        return false;
      }
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
    let isOver = this.isOver();
    let squares = this.squares();
    let player = (this.currentPlayer + 3) % 4;
    return {position: position, squares: squares, player: player, isOver: isOver};
  }

  resetGame() {
    this.currentPlayer = 0;
    this.lastMove = {player: -1, move: null};
    this.game.reset();
  }

  resetLobby() {
    this.resetGame();
    this.phase = "lobby";
    this.players = new Map();
  }
}