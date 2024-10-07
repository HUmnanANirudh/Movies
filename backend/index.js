require("dotenv").config();
const express = require("express");
const http = require("http"); // Import Node's HTTP server module
const { Server } = require("socket.io"); // Import Socket.io Server constructor
const cors = require("cors");

const app = express(); // Initialize Express app
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json()); // For parsing JSON bodies in requests

// Create the HTTP server using Node's http module
const server = http.createServer(app);

// Set up the Socket.io server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Allow requests from your frontend (React)
    methods: ["GET", "POST"], // Specify allowed HTTP methods
  },
});

// Import your routers and pass the `io` instance to them
const mainrouter = require("./router/index")(io);
app.use("/api/v1", mainrouter);

// Handling socket.io events
io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

// Start the HTTP server and Socket.io
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
