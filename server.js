const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const ACTIONS = require("./src/Actions");
const connectDB = require("./config/db").connectDB;

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Allow CORS for WebSocket & API requests
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
    transports: ["websocket", "polling"], // WebSocket support
  },
});

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Connect to Database
connectDB();

// Routes
const userRoutes = require("./routes/user");
const outputRoutes = require("./routes/output");

app.use("/api/", userRoutes);
app.use("/api/", outputRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Code Execution API is running!" });
});

// Store user connections
const userSocketMap = {};

// Get all clients in a room
function getAllConnectedClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => ({
      socketId,
      username: userSocketMap[socketId],
    })
  );
}

// Socket.io events
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Join Room
  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);

    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  // Code Change Event
  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.to(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  // Sync Code Event
  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  // Disconnecting Event
  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];

    rooms.forEach((roomId) => {
      socket.to(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });

    delete userSocketMap[socket.id];
  });

  // Disconnect Event
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Start server on EC2 (bind to 0.0.0.0)
const PORT = process.env.PORT || 5001;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);

module.exports = { io };
