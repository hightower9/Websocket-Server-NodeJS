import { useState, useEffect } from "react";
import "./App.css";
import io from "socket.io-client";

const socket = io.connect("http://localhost:5000");
const userSocket = io.connect("http://localhost:5000/user", {
    auth: { token: "Test" },
});

const App = () => {
    const [message, setMessage] = useState("");
    const [messageReceived, setMessageReceived] = useState("");
    const [room, setRoom] = useState("");

    useEffect(() => {
        userSocket.on("connect_error", (err) => {
            setMessage(err);
        });

        socket.on("receive-message", (data) => {
            setMessageReceived(data.message);
            console.log(data.message + " Received");
        });
    }, [socket]);

    const joinRoom = () => {
        socket.emit("join-room", room, (message) => {
            setMessage(message);
        });
        console.log("Room: " + room);
    };

    const sendMessage = () => {
        socket.emit(
            "send-message",
            {
                message,
            },
            room
        );
        console.log("Message sent!");
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Join room..."
                onChange={(e) => setRoom(e.target.value)}
                value={room}
            />
            <button type="submit" onClick={joinRoom}>
                Join Room
            </button>

            <input
                type="text"
                placeholder="Enter your message..."
                onChange={(e) => setMessage(e.target.value)}
                value={message}
            />

            <button type="submit" onClick={sendMessage}>
                Send Message
            </button>
            <h1>Message: </h1>
            <p>{messageReceived}</p>
        </div>
    );
};

export default App;

let count = 0;
setInterval(() => {
    socket.emit("ping", ++count);
}, 1000);

document.addEventListener("keydown", (e) => {
    if (e.target.matches("input")) return;

    if (e.key === "c") socket.connect();
    if (e.key === "d") socket.disconnect();
});
