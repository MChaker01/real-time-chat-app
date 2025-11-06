import React, { useState } from "react";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";

const MessageInput = ({ selectedUser, onMessageSent }) => {
  // ← Fixed typo
  const [message, setMessage] = useState("");
  const { socket } = useSocket();
  const { user } = useAuth();

  const handleSend = (e) => {
    if (e) e.preventDefault();

    // Check if socket is connected
    if (!socket) {
      console.error("Socket not connected");
      return;
    }

    // Check if message is not empty (trim removes whitespace)
    if (message.trim()) {
      // Create a temporary message object
      const tempMessage = {
        _id: Date.now().toString(),
        sender: { _id: user._id, username: user.username },
        receiverId: { _id: selectedUser._id, username: selectedUser.username },
        content: message,
        createdAt: new Date(),
      };

      // Add message to UI immediately (optimistic update)
      onMessageSent(tempMessage);

      socket.emit("send_message", {
        receiverId: selectedUser._id, // ← Fixed typo
        content: message,
      });
      setMessage(""); // ← Clear input after sending
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend(e);
    }
  };

  return (
    <div className="message-input-container">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Type a message..."
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default MessageInput;
