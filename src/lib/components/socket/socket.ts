import { io } from "socket.io-client";

const socket = io("https://domain.com");


//check for connection to server
socket.on("connect", () => {
    console.log(socket.id);
});



