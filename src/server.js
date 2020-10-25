const Room = require("./room.js");
const express = require("express");
const app = express();
const http = require("http").Server(app);
const port = process.env.PORT || 8000;
const io = require("socket.io")(http);
const crypto = require("crypto");
const randomWords = require("random-words");

const rooms = new Map();

io.on("connection", socket => {
  let room;
  let userId;

  socket.on("login", id => {
    if (id === null) {
      id = createId();
    }
    userId = id;
    let name = randomWords() + " " + randomWords();
    socket.emit("loggedIn", {userId: userId, name: name});
  });

  socket.on("createRoom", () => {
    socket.emit("createdRoom", createRoom());
  });

  socket.on("joinRoom", roomId => {
    room = rooms.get(roomId);
    if (room !== undefined) {
      socket.join(room.id);
      socket.emit("joinedRoom", room.phase);
    }
  });

  socket.on("getLobby", () => {
    socket.emit("lobby", room.getPlayers());
  });

  socket.on("chooseRole", role => {
    room.chooseRole(userId, role);
    if (room.validatePlayers()) {
      io.to(room.id).emit("startedGame");
    }
    else {
      io.to(room.id).emit("lobby", room.getPlayers());
    }
  });

  socket.on("getBoard", () => {
    io.to(room.id).emit("board", room.boardState());
  });

  socket.on("move", move => {
    if (room.move(move, userId)) {
      io.to(room.id).emit("board", room.boardState());
    }
  });

  socket.on("resetGame", () => {
    room.resetGame();
    io.to(room.id).emit("board", room.boardState());
  });

  socket.on("resetLobby", () => {
    room.resetLobby();
    io.to(room.id).emit("joinedRoom", room.phase);
  })
});

function createId() {
  return crypto.randomBytes(20).toString("hex");
}

function createRoom() {
  let roomId = "/" + crypto.randomBytes(20).toString("hex");
  rooms.set(roomId, new Room(roomId));
  return roomId;
}

http.listen(port, () => {
    console.log("listening on *: " + port);
});