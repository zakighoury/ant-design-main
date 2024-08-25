"use client";

import { io } from "socket.io-client";

// Initialize the socket connection with the server URL and optional configurations
export const socket = io("http://localhost:5000", {
  withCredentials: true, // Adjust this if you need to send cookies with the request
  transports: ["websocket", "polling"], // Specify transport methods if needed
});
