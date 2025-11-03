import React from "react";
import { useSocket } from "../context/SocketContext";
import "../assets/styles/users-list.css";

const UsersList = ({ users, selectedUser, onSelectUser }) => {
  const { onlineUsers } = useSocket();

  const safeOnlineUsers = onlineUsers || [];

  return (
    <aside className="users-sidebar">
      <h3 className="sidebar-title">USERS</h3>
      <div className="users-scroll">
        {users.map((user) => {
          const isUserOnline = safeOnlineUsers.includes(user._id);

          return (
            <div
              key={user._id}
              className={`user-item ${
                selectedUser?._id === user._id ? "selected" : ""
              }`}
              onClick={() => onSelectUser(user)}
            >
              <div className="user-info">
                <span
                  className={`status-dot ${
                    isUserOnline ? "online" : "offline"
                  }`}
                />
                <span className="username">{user.username}</span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default UsersList;
