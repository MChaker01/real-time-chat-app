import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import services from "../services/api";
import UsersList from "../components/UsersList";
import Spinner from "../components/Spinner";
import ChatPanel from "../components/ChatPanel";
import { useSocket } from "../context/SocketContext";

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

  const [messages, setMessages] = useState([]);

  const { socket } = useSocket();

  const bottomRef = useRef(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth", // Smooth animation
      block: "end", // Align to the end of the scroll container
    });
  };

  const handleMessageSent = (newMessage) => {
    setMessages((prev) => [...prev, newMessage]);
  };

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

  useEffect(() => {
    // Only fetch if a user is selected
    if (selectedUser) {
      const fetchMessages = async () => {
        try {
          // Call the API to get messages between current user and selectedUser
          const data = await services.getMessages(selectedUser._id);
          // Extract the messages array from the response and store in state
          setMessages(data.messages);
        } catch (error) {
          console.error("Error while fetching previous messages.", error);
          setError("Error while fetching previous messages.");
        }
      };

      fetchMessages();
    } else {
      // If no user selected, clear messages
      setMessages([]);
    }
  }, [selectedUser]); // Re-run when selectedUser changes

  useEffect(() => {
    if (socket) {
      // Listen for 'receive_message' events
      socket.on("receive_message", (newMessage) => {
        console.log("📨 New message received:", newMessage);
        // Only add message if it's part of the current conversation
        if (selectedUser) {
          // Check if message is from selected user or sent to selected user
          const isFromSelectedUser = newMessage.sender._id === selectedUser._id;
          const isToSelectedUser = newMessage.receiver._id === selectedUser._id;

          if (isFromSelectedUser || isToSelectedUser) {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
          }
        }
      });

      return () => {
        socket.off("receive_message");
      };
    }
  }, [socket, selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

        {selectedUser ? (
          // selectedUser and messages are passed as props
          <ChatPanel
            selectedUser={selectedUser}
            messages={messages}
            onMessageSent={handleMessageSent}
            bottomRef={bottomRef}
          />
        ) : (
          <div className="chat-panel-placeholder">
            <p>Select a user to start chatting</p>
          </div>
        )}
      </div>
      {error && <div className="chat-error">{error}</div>} {/* Display error */}
    </div>
  );
};

export default Chat;
