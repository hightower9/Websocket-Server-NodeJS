const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { instrument } = require("@socket.io/admin-ui");
const port = 5000;

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "https://admin.socket.io/"],
        credentials: false
        // methods: ["GET", "POST"],
        // transports: ["websocket", "polling"],
    },
});

// Namespaces
const userIo = io.of("/user");

userIo.on("connection", (socket) => {
    console.log("Connected to user namespace with username " + socket.username);
});

// Middleware
userIo.use((socket, next) => {
    if(socket.handshake.auth.token){
        socket.username = getUsernameFromToken(socket.handshake.auth.token);
        next();
    }
    else{
        next(new Error("Token does not exist"));
    }
});

function getUsernameFromToken(token){
    return token;
}

// Socket
io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("send-message", (data, room) => {
        console.log("data " + data + " room " + room);

        if (room == "" || room == null || room == undefined) {
            socket.broadcast.emit("receive-message", data);
        } else {
            console.log("room " + data)
            socket.to(room).emit("receive-message", data);
        }
    });

    socket.on("join-room", (room, cb) => {
        socket.join(room);
        cb(`${room} joined the room`);
        console.log(`User with ID: ${socket.id} joined room: ${room}`);
    });

    socket.on('ping', n => console.log(n));
});

app.get("/", (req, res) => {
    res.send("Hello World!");
});

instrument(io, {
    auth: false,
    // mode: "development",
  });

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
