import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import io from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  // Get the current user from AuthContext
  // We need this to know: 1) Is someone logged in? 2) What's their token?
  const { user } = useAuth();

  // State: The socket connection instance
  // null when not connected, socket object when connected
  const [socket, setSocket] = useState(null);

  // State: Array of user IDs who are currently online
  // Example: ["user123", "user456", "user789"]
  const [onlineUsers, setOnlineUsers] = useState([]);

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

  // Connect/disconnect socket based on user login status
  useEffect(() => {
    if (user && user.token) {
      // Connect to Socket.io with token
      const newSocket = io(SOCKET_URL, {
        auth: { token: user.token },
      });

      setSocket(newSocket);

      // 4. Cleanup when component unmounts or user logs out
      return () => {
        console.log("User logged out, disconnecting socket...");
        newSocket.disconnect();
        setSocket(null);
      };
    } else {
      setSocket(null);
    }
  }, [user]);

  // Listen for user_status events and update onlineUsers
  useEffect(() => {
    if (socket) {
      // Only set up listeners if socket exists (user is logged in)
      console.log("Setting up socket event listeners...");

      // Listen for 'user_status' events from the server
      socket.on("user_status", (data) => {
        console.log("User status changed:", data);

        // User came online: add their ID to the array
        if (data.isOnline) {
          setOnlineUsers((prev) => {
            const curretUsers = Array.isArray(prev) ? prev : [];
            // Only add if not already in the array
            if (!curretUsers.includes(data.userId)) {
              return [...curretUsers, data.userId];
            }
            return curretUsers;
          });
        } else {
          // User went offline: remove their ID from the array
          setOnlineUsers((prev) => {
            const currentUsers = Array.isArray(prev) ? prev : [];
            return currentUsers.filter((id) => id !== data.userId);
          });
        }
      });

      // Receive the initial list of online users when connecting
      socket.on("online_users_list", (userIds) => {
        console.log("📋 Received online users list:", userIds);
        setOnlineUsers(userIds);
      });

      return () => {
        socket.off("user_status");
        socket.off("online_users_list");
      };
    }
  }, [socket]);

  const value = { socket, onlineUsers };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};
