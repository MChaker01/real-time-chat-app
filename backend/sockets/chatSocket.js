const User = require("../models/User");
const Message = require("../models/Message");

// Create a Map to store online users
const onlineUsers = new Map();

const chatSocket = (io) => {
  // Socket.io connection handling
  io.on("connection", async (socket) => {
    // When user connects, store their mapping
    onlineUsers.set(socket.user._id.toString(), socket.id);
    console.log(`User ${socket.user.username} mapped to socket ${socket.id}`);

    const token = socket.handshake.auth.token;
    console.log("🔌 New user connected: ", token);

    // Update the user's isOnline status to true in the database
    const connectionStatus = await User.findByIdAndUpdate(
      socket.user._id,
      { isOnline: true },
      {
        new: true,
      }
    );

    // Broadcast to other users that this user came online using socket.broadcast.emit()
    socket.broadcast.emit("user_status", {
      userId: socket.user._id,
      username: socket.user.username,
      isOnline: true,
    });

    // Handle incoming messages
    socket.on("send_message", async (data) => {
      // Extract receiverId and content from data
      const { receiverId, content } = data;
      // Save the message to MongoDB using Message.create()
      const messageData = await Message.create({
        sender: socket.user._id,
        receiver: receiverId,
        content,
      });
      // Find receiver's socket ID from onlineUsers Map
      const receiverSocketId = onlineUsers.get(data.receiverId);
      // If receiver is online, emit 'receive_message' to their socket
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive_message", messageData);
      }
    });

    // Handle user disconnection
    socket.on("disconnect", async () => {
      // When user disconnects, remove their mapping
      onlineUsers.delete(socket.user._id.toString());

      const connectionStatus = await User.findByIdAndUpdate(
        socket.user._id,
        { isOnline: false },
        { new: true }
      );

      // Broadcast to other users that this user went offline
      socket.broadcast.emit("user_status", {
        userId: socket.user._id,
        username: socket.user.username,
        isOnline: false,
      });
    });
  });
};
module.exports = chatSocket;
