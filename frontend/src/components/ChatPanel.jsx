import React from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import MessageInput from "../components/MessageInput";
import "../assets/styles/chat-panel.css";

const ChatPanel = ({ selectedUser, messages, onMessageSent, bottomRef }) => {
  const { user } = useAuth();
  const { onlineUsers } = useSocket(); // Get real-time online users

  // Check if selected user is online in real-time
  const safeOnlineUsers = onlineUsers || [];
  const isUserOnline = safeOnlineUsers.includes(selectedUser._id);

  return (
    <div className="chat-panel">
      {/* Header: Show selected user info */}
      <header className="chat-header-user">
        <div className="chat-header-user-info">
          <img src={selectedUser.userImage} alt={selectedUser.username} />
          <div className="user-name">{selectedUser.username}</div>
        </div>

        <div className="user-status-info">
          {isUserOnline ? (
            <div>
              Online <span className="status-dot online"></span>
            </div>
          ) : (
            <div>
              Offline <span className="status-dot offline"></span>
            </div>
          )}
        </div>
      </header>

      {/* Messages area */}
      <section className="messages-container">
        {messages.length === 0 ? (
          <p className="no-messages">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((message) => {
            return (
              <p
                key={message._id} // Key moved to the direct flex item
                className={
                  user._id === message.sender._id
                    ? "message-wrapper sent"
                    : "message-wrapper received"
                }
              >
                {message.content}
              </p>
            );
          })
        )}
        <div ref={bottomRef}></div>
      </section>
      <MessageInput selectedUser={selectedUser} onMessageSent={onMessageSent} />
    </div>
  );
};

export default ChatPanel;
