import { createContext, useContext, useEffect, useState } from "react";
import services from "../services/api";

/**
 * Create the Authentication Context
 *
 * WHAT IS CONTEXT?
 * Context is React's way to share data across the entire component tree
 * without manually passing props through every level.
 *
 * WHY WE NEED IT HERE:
 * Many components need to know:
 * - Is a user logged in?
 * - What's their username/email?
 * - How to login/logout?
 *
 * Instead of passing these through props everywhere, we use Context.
 */
const AuthContext = createContext();

/**
 * AuthProvider Component
 *
 * This wraps your entire app (in main.jsx) and provides authentication
 * state and functions to all child components.
 *
 * @param {Object} children - All nested components (your entire app)
 */
export const AuthProvider = ({ children }) => {
  // STATE: Current logged-in user (null if not logged in)
  // Contains: { username, email, token, _id }
  const [user, setUser] = useState(null);

  // STATE: Loading state for async operations (login, register)
  // Used to show loading spinners in components
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState("");

  /**
   * Register a new user
   *
   * FLOW:
   * 1. Set loading to true (show spinner in UI)
   * 2. Call the signup API service
   * 3. If successful, update user state with the returned data
   * 4. api.js already saved to localStorage, so we're persistent
   * 5. Set loading to false (hide spinner)
   *
   * @param {Object} userData - { username, email, password }
   */
  const signup = async (userData) => {
    try {
      setIsLoading(true);
      setError("");
      // Call the API service (which handles localStorage storage)
      const registeredUser = await services.signup(userData);
      // Update the user state so components know someone is logged in
      setUser(registeredUser);
    } catch (error) {
      console.error("Error during registration : ", error);
      const errorMessage =
        error.response?.data?.message || "Error during registration :";

      setError(errorMessage);
    } finally {
      // Always set loading to false, even if there's an error
      setIsLoading(false);
    }
  };

  /**
   * Login an existing user
   *
   * FLOW:
   * Same as signup, but calls the login service instead
   *
   * @param {Object} userData - { email, password }
   */
  const login = async (userData) => {
    try {
      setIsLoading(true);
      setError("");

      // Call the API service (which handles localStorage storage)
      const connectedUser = await services.login(userData);
      // Update the user state
      setUser(connectedUser);
    } catch (error) {
      console.error("Error during connection : ", error);
      const errorMessage =
        error.response?.data?.message || "Connection ERROR. Please try again.";

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout the current user
   *
   * FLOW:
   * 1. Call the logout service (removes data from localStorage)
   * 2. Clear the user state (this triggers re-renders, showing login page)
   */
  const logout = () => {
    services.logout(); // Remove from localStorage
    setUser(null); // Clear state (user is now logged out)
  };

  /**
   * useEffect: Check if user is already logged in on app load
   *
   * WHY WE NEED THIS:
   * When the user refreshes the page, React state is reset to null.
   * But if they were logged in, their data is still in localStorage.
   * This effect checks localStorage and restores the user state.
   *
   * WHEN IT RUNS:
   * Only once when the component mounts (empty dependency array [])
   */
  useEffect(() => {
    // Try to get user data from localStorage
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      // Parse the JSON string back into an object
      const user = JSON.parse(storedUser);
      // Restore the user state
      setUser(user);
      // Now the user is "logged in" even after page refresh!
    }
  }, []); // Empty array = run only once on mount

  /**
   * The value object contains everything we want to share
   *
   * WHAT COMPONENTS GET:
   * - user: Current user data (or null if not logged in)
   * - isLoading: Boolean for showing loading states
   * - signup: Function to register new users
   * - login: Function to log in users
   * - logout: Function to log out users
   */
  const value = {
    user,
    isLoading,
    error,
    setError,
    signup,
    login,
    logout,
  };

  /**
   * Provider makes the value available to all child components
   *
   * Any component inside <AuthProvider> can access these values
   * by using the useAuth() hook (defined below)
   */
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use the Auth Context
 *
 * HOW TO USE IN COMPONENTS:
 * const { user, login, logout } = useAuth();
 *
 * WHY THIS IS BETTER THAN useContext(AuthContext):
 * - Shorter syntax
 * - Built-in error checking (throws error if used outside Provider)
 * - More semantic and readable
 *
 * @returns {Object} - { user, isLoading, signup, login, logout }
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  // If someone tries to use useAuth() outside of <AuthProvider>,
  // this will catch it and show a helpful error message
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
};
