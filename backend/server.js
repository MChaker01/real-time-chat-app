const express = require("express");
const mongoose = require("mongoose");
// 1. Import Node's http module
const http = require("http");
// 2. Import Socket.io Server class
const { Server } = require("socket.io"); // This class will manage all real-time WebSocket connections.

const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// --- Import routes ---
const authRoutes = require("./routes/authRoutes");

// --- Define Routes ---
// All routes starting with /api/auth will be handled by authRoutes
app.use("/api/auth", authRoutes);

// 3. Create an HTTP server that wraps Express
const server = http.createServer(app);

// 4. Attach Socket.io to the HTTP server
// Socket.io needs to attach itself to an HTTP server to handle WebSocket connections.
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // React dev server.
    method: ["GET", "POST"],
  },
});

const DB_URI = process.env.DB_URI;

mongoose
  .connect(DB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB successfully.");

    const PORT = process.env.PORT || 3000;
    // 5. IMPORTANT: Use server.listen() instead of app.listen()
    server.listen(PORT, () => {
      console.log(`🚀 Server successfully started on port ${PORT}`);
      console.log(`Local access : http://localhost:${PORT}`);
      console.log(`🔌 Socket.io is ready for real-time connections`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });
