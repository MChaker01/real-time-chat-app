import { useAuth } from "../context/AuthContext";

const Chat = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Welcome to Chat, {user?.username}!</h1>
      <button onClick={logout}>Logout</button>
      <p>Chat interface coming soon...</p>
    </div>
  );
};

export default Chat;
