import axios from "axios";

// Base URL for all API requests
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * Helper function to get the Authorization header configuration
 *
 * HOW IT WORKS:
 * 1. Retrieves user data from localStorage (where we stored it after login)
 * 2. Extracts the JWT token from the user object
 * 3. Returns an axios config object with the Authorization header
 *
 * WHY WE NEED THIS:
 * Protected routes on the backend require "Bearer <token>" in the header
 * This function centralizes that logic so we don't repeat it everywhere
 */
const getAuthConfig = () => {
  // Parse the JSON string from localStorage back into an object
  const user = JSON.parse(localStorage.getItem("user"));

  // If user exists and has a token, return the auth header config
  if (user && user.token) {
    return {
      headers: {
        Authorization: `Bearer ${user.token}`, // Format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      },
    };
  }

  // If no token, return empty config (for public routes)
  return {};
};

/**
 * Register a new user
 * @param {Object} userData - { username, email, password, userImage? }
 * @returns {Object} - User data with token
 *
 * FLOW:
 * 1. Send POST request to /api/auth/signup with user data
 * 2. Backend creates user, returns user info + JWT token
 * 3. Store the response in localStorage for persistence
 * 4. Return the data to the component
 */
const signup = async (userData) => {
  const response = await axios.post(API_URL + "/auth/signup", userData);

  // Store user data in localStorage so it persists across page refreshes
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }

  return response.data;
};

/**
 * Login an existing user
 * @param {Object} userData - { email, password }
 * @returns {Object} - User data with token
 *
 * FLOW:
 * 1. Send POST request to /api/auth/login with credentials
 * 2. Backend verifies credentials, returns user info + JWT token
 * 3. Store the response in localStorage
 * 4. Return the data to the component
 */
const login = async (userData) => {
  const response = await axios.post(API_URL + "/auth/login", userData);

  // Store user data in localStorage
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }

  return response.data;
};

/**
 * Logout the current user
 * Simply removes user data from localStorage
 * No backend call needed (JWT is stateless)
 */
const logout = () => {
  localStorage.removeItem("user");
};

/**
 * Get list of all users (except current user)
 * @returns {Object} - { users: [...] }
 *
 * PROTECTED ROUTE - Requires authentication
 * Uses getAuthConfig() to include the JWT token in the request
 */
const getUsers = async () => {
  const response = await axios.get(API_URL + "/users/", getAuthConfig());

  return response.data;
};

/**
 * Get conversation history with a specific user
 * @param {String} userId - The ID of the user to get messages with
 * @returns {Object} - { messages: [...] }
 *
 * PROTECTED ROUTE - Requires authentication
 * Backend will return all messages between current user and the specified userId
 */
const getMessages = async (userId) => {
  const response = await axios.get(
    API_URL + `/messages/${userId}`,
    getAuthConfig()
  );

  return response.data;
};

// Export all services as a single object for easy importing
const services = { signup, login, logout, getUsers, getMessages };

export default services;
