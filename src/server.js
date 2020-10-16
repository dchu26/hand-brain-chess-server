const { Chess } = require("chess.js");
const express = require("express");
const app = express();
const http = require("http").Server(app);
const port = process.env.PORT || 8000;
const io = require('socket.io')(http);

io.on("connection", socket => {
  console.log(socket.handshake.address);
  let game = new Chess();
  socket.emit("position", game.fen());
  socket.on("move", move => {
    if (game.move(move) !== null) {
      socket.emit("position", game.fen());
    }
  });
});

http.listen(port, () => {
    console.log('listening on *: ' + port);
});