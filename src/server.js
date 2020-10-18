const Room = require("./room.js");
const express = require("express");
const app = express();
const http = require("http").Server(app);
const port = process.env.PORT || 8000;
const io = require("socket.io")(http);
const crypto = require("crypto");

const rooms = new Map();

io.on("connection", socket => {
  let room;
  let userId = 'asdf';

  socket.on("login", id => {
    if (id === null) {
      id = createId();
    }
    userId = id;
    socket.emit("loggedIn", userId);
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
    socket.emit("lobby", room.players);
  })

  socket.on("chooseRole", role => {
    room.chooseRole(userId, role);
    if (room.validatPlayers()) {
      io.to(room.id).emit("startedGame");
    }
    else {
      io.to(room.id).emit("lobby", room.players);
    }
  });
});

function createId() {
  return crypto.randomBytes(20).toString('hex');
}

function createRoom() {
  let roomId = "/" + crypto.randomBytes(20).toString('hex');
  rooms.set(roomId, new Room(roomId));
  return roomId;
}

http.listen(port, () => {
    console.log('listening on *: ' + port);
});