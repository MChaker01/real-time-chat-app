import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Spinner from "./../components/Spinner";
import "../assets/styles/signup.css";

const Register = () => {
  // State to store all form input values
  // Includes username (not in Login), email, password, and confirmPassword
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Get authentication functions and state from AuthContext
  // - signup: function to register new user
  // - user: logged-in user data (will be set after successful registration)
  // - isLoading: boolean for showing spinner during API call
  // - error: error message from failed registration
  // - setError: function to manually set error (for password validation)
  const { user, isLoading, error, setError, signup } = useAuth();

  // Hook to programmatically navigate to different pages
  const navigate = useNavigate();

  /**
   * Handle input changes
   * Updates formData state when user types in any form field
   *
   * HOW IT WORKS:
   * - e.target.name = the input's name attribute (username, email, password, confirmPassword)
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
   * Called when user clicks "SIGN UP" button
   *
   * FLOW:
   * 1. Prevent page refresh
   * 2. Validate that password and confirmPassword match
   * 3. If they don't match, set error and stop
   * 4. If they match, call signup() from AuthContext
   * 5. If signup succeeds, user state updates and useEffect below handles redirect
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Stop the page from refreshing

    try {
      // Client-side validation: check if passwords match
      if (formData.password !== formData.confirmPassword) {
        // Set error message (will display in the form)
        return setError("Passwords don't match");
      }

      // Call the signup function from AuthContext
      // This will make API call, store token, and update user state
      await signup(formData);
    } catch (error) {
      console.error("Error while registering : ", error);
    }
  };

  /**
   * Redirect to /chat when user successfully registers
   *
   * WHY useEffect:
   * - After successful registration, user state changes from null to user object
   * - This effect detects that change and redirects to chat page
   * - Same behavior as Login page
   */
  useEffect(() => {
    if (user) {
      navigate("/chat"); // Redirect to chat page
    }
  }, [user, navigate]); // Dependencies: re-run when these change

  // Show spinner while signup API call is in progress
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
        </header>

        <main className="grid-main">
          {/* Registration form */}
          <form className="register-block" onSubmit={handleSubmit}>
            {/* Username input field (unique to Register, not in Login) */}
            <div className="field">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username} // Controlled input (value from state)
                required
                onChange={onChange} // Update state when user types
              />
            </div>

            {/* Email input field */}
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email} // Controlled input
                required
                onChange={onChange}
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

            {/* Confirm Password field (unique to Register) */}
            {/* Used to validate that user typed password correctly */}
            <div className="field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword} // Controlled input
                required
                onChange={onChange}
              />
            </div>

            {/* Show error message if registration fails or passwords don't match */}
            {error && <p className="error">{error}</p>}

            {/* Submit button */}
            <button type="submit" className="btn-submit">
              SIGN UP
            </button>

            {/* Link to login page for existing users */}
            <p className="footer-note">
              Already have account? <Link to="/login">Login</Link>
            </p>
          </form>
        </main>
      </div>
    </div>
  );
};

export default Register;
