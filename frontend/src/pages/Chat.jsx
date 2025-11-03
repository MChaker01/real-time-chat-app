import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import services from "../services/api";
import UsersList from "../components/UsersList";
import Spinner from "../components/Spinner";

const Chat = () => {
  // Get current user and logout function from AuthContext
  const { user, logout } = useAuth();

  // State: list of all users fetched from API
  const [users, setUsers] = useState([]);

  // State: currently selected user to chat with (null if none selected)
  const [selectedUser, setSelectedUser] = useState(null);

  // State: loading state while fetching users
  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  /**
   * Fetch users when component mounts
   *
   * FLOW:
   * 1. Call API to get list of users
   * 2. Update users state with the response
   * 3. Set loading to false
   */

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await services.getUsers();

        setUsers(usersData.users);
      } catch (error) {
        console.error("Error while fetching users. ", error);
        setError("Error while fetching users.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="chat-container">
      {/* Header with logout */}
      <header className="chat-header">
        <h2>Welcome, {user?.username}!</h2>
        <button onClick={logout}>Logout</button>
      </header>

      <div className="chat-layout">
        {/* Left sidebar: Users list */}
        <UsersList
          users={users}
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
        />

        {/* Right panel: Chat (we'll build this later) */}
        <div className="chat-panel">
          {selectedUser ? (
            <p>Chat with {selectedUser.username} - Coming soon...</p>
          ) : (
            <p>Select a user to start chatting</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
