import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import { useAuth } from "./context/AuthContext";
import Spinner from "./components/Spinner";

function App() {
  const { user, initialLoading } = useAuth();

  if (initialLoading) {
    return <Spinner />;
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/signup" element={<Register />}></Route>

        <Route path="/chat" element={user ? <Chat /> : <Login />}></Route>

        <Route path="/" element={user ? <Chat /> : <Login />}></Route>
      </Routes>
    </>
  );
}

export default App;
