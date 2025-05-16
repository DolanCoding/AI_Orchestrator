import React, { useState, useEffect } from "react"; // Import useEffect
import styles from "./Login.module.css"; // Assuming the CSS module is in the same directory

// Define the props the Login component expects - now includes loginStatus and loginError
const Login = ({ onSubmit, loginStatus, loginError }) => {
  // State to hold the form input values
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });

  // Local state for displaying success/error messages based on Redux state
  const [displayMessage, setDisplayMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  // useEffect to watch loginStatus and update local message state
  useEffect(() => {
    if (loginStatus === "loading") {
      setDisplayMessage("Logging in...");
      setIsError(false);
    } else if (loginStatus === "succeeded") {
      setDisplayMessage("Login successful!");
      setIsError(false);
      // We don't clear the form here automatically on success,
      // as the user is typically navigated away immediately.
    } else if (loginStatus === "failed") {
      // Use the loginError prop from Redux state
      setDisplayMessage(`Login failed: ${loginError}`);
      setIsError(true);
    } else {
      // Reset message when status is 'idle'
      setDisplayMessage(null);
      setIsError(false);
    }
  }, [loginStatus, loginError]); // Depend on status and error props

  // Handler for input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handler for form submission
  const handleSubmit = (e) => {
    // Created a named handleSubmit function
    e.preventDefault(); // Corrected event property access
    console.log("Login form submitted:", formData);

    // Clear previous messages on new submission
    setDisplayMessage(null);
    setIsError(false);

    // Call the onSubmit prop provided by the parent (Authentication)
    // The parent will dispatch the loginUser thunk.
    // We no longer rely on callbacks from onSubmit for feedback.
    onSubmit("login", formData, {
      // Callbacks are no longer used by this component for feedback
      success: () => {},
      error: () => {},
    });
  };

  return (
    <form
      className={styles.loginForm}
      onSubmit={handleSubmit} // Use the named handleSubmit function
    >
      <div className={styles.formGroup}>
        <label htmlFor="emailOrUsername">Email or Username:</label>
        <input
          type="text"
          id="emailOrUsername"
          name="emailOrUsername"
          value={formData.emailOrUsername}
          onChange={handleInputChange}
          required // HTML5 validation
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          required // HTML5 validation
        />
      </div>
      {/* Disable button while loading */}
      <button type="submit" disabled={loginStatus === "loading"}>
        Login
      </button>

      {/* Display feedback message based on local state */}
      {displayMessage && (
        <p className={isError ? styles.error : styles.success}>
          {" "}
          {/* Use local state for styling */}
          {displayMessage}
        </p>
      )}
    </form>
  );
};

export default Login;
