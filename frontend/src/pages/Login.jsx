import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../assets/styles/login.css";
import Spinner from "./../components/Spinner";

const Login = () => {
  // State to store form input values (email and password)
  const [formData, setFormData] = useState({ email: "", password: "" });

  // Get authentication functions and state from AuthContext
  // - login: function to authenticate user
  // - isLoading: boolean for showing spinner
  // - user: logged-in user data (null if not logged in)
  // - error: error message from failed login attempts
  const { login, isLoading, user, error } = useAuth();

  // Hook to programmatically navigate to different pages
  const navigate = useNavigate();

  /**
   * Handle input changes
   * Updates formData state when user types in the form fields
   *
   * HOW IT WORKS:
   * - e.target.name = the input's name attribute ("email" or "password")
   * - e.target.value = what the user typed
   * - Spreads previous state and updates only the changed field
   */
  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  /**
   * Handle form submission
   * Called when user clicks "Log In" button
   *
   * FLOW:
   * 1. Prevent page refresh (default form behavior)
   * 2. Call login() from AuthContext with form data
   * 3. If login succeeds, user state updates and useEffect below handles redirect
   * 4. If login fails, error is caught and logged
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Stop the page from refreshing

    try {
      // Call the login function from AuthContext
      // This will make API call, store token, and update user state
      await login(formData);
    } catch (error) {
      console.error("Error while login : ", error);
    }
  };

  /**
   * Redirect to /chat when user successfully logs in
   *
   * WHY useEffect:
   * - We need to "watch" the user state
   * - When user changes from null to an object (login success), redirect
   * - useEffect runs whenever 'user' or 'navigate' changes
   */
  useEffect(() => {
    if (user) {
      navigate("/chat"); // Redirect to chat page
    }
  }, [navigate, user]); // Dependencies: re-run when these change

  // Show spinner while login API call is in progress
  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="auth-brutalist">
      <div className="grid-container">
        {/* Header with app branding */}
        <header className="grid-header">
          <h1 className="brand">
            <span>CHAT</span>CORE
          </h1>
          <p className="slogan">Direct. Honest. Real.</p>
        </header>

        <main className="grid-main">
          {/* Login form */}
          <form className="login-block" onSubmit={handleSubmit}>
            {/* Email input field */}
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email} // Controlled input (value from state)
                required
                onChange={onChange} // Update state when user types
              />
            </div>

            {/* Password input field */}
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password} // Controlled input
                required
                onChange={onChange}
              />
            </div>

            {/* Show error message if login fails */}
            {error && <p className="error">{error}</p>}

            {/* Submit button */}
            <button type="submit" className="btn-submit">
              Log In
            </button>

            {/* Link to register page for new users */}
            <p className="footer-note">
              New here? <Link to="/signup">Join now</Link>
            </p>
          </form>
        </main>
      </div>
    </div>
  );
};

export default Login;
