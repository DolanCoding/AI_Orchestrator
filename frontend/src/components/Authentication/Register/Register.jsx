import React, { useState, useEffect } from "react"; // Import useEffect
import styles from "./Register.module.css";

// Register component now receives registrationStatus and registrationError props
const Register = ({ onSubmit, registrationStatus, registrationError }) => {
  // State to hold the form input values
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState(""); // Keep local state for confirm password input

  // Local state for displaying success/error messages based on Redux state
  const [displayMessage, setDisplayMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  // useEffect to watch registrationStatus and update local message state
  useEffect(() => {
    if (registrationStatus === "loading") {
      setDisplayMessage("Registering...");
      setIsError(false);
    } else if (registrationStatus === "succeeded") {
      setDisplayMessage("Registration successful, you can now login!");
      setIsError(false);
      // Clear form after successful registration
      setFormData({ username: "", email: "", password: "" });
      setConfirmPassword(""); // Clear confirm password field
    } else if (registrationStatus === "failed") {
      // Use the registrationError prop from Redux state
      setDisplayMessage(`Registration failed: ${registrationError}`);
      setIsError(true);
    } else {
      // Reset message when status is 'idle'
      setDisplayMessage(null);
      setIsError(false);
    }
  }, [registrationStatus, registrationError]); // Depend on status and error props

  // Handler for input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "confirmPassword") {
      setConfirmPassword(value);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Register form submitted:", formData);

    // Client-side password match check before dispatching thunk
    if (formData.password !== confirmPassword) {
      setDisplayMessage("Passwords do not match");
      setIsError(true);
      return; // Stop submission if passwords don't match
    }

    // Clear previous messages on new valid submission
    setDisplayMessage(null);
    setIsError(false);

    // Call the onSubmit prop provided by the parent (Authentication)
    // The parent will dispatch the registerUser thunk.
    // We no longer rely on callbacks from onSubmit for feedback.
    onSubmit("register", formData, {
      // Callbacks are no longer used by this component for feedback
      success: () => {},
      error: () => {},
    });
  };

  return (
    <form className={styles.registerForm} onSubmit={handleSubmit}>
      {" "}
      {/* Use handleSubmit */}
      <div className={styles.formGroup}>
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="regPassword">Password:</label>{" "}
        {/* Changed id to regPassword for clarity */}
        <input
          type="password"
          id="regPassword"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="confirmPassword">Confirm Password:</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={confirmPassword}
          onChange={handleInputChange}
          required
        />
      </div>
      {/* Disable button while loading */}
      <button type="submit" disabled={registrationStatus === "loading"}>
        Register
      </button>
      {/* Display feedback message based on local state */}
      {displayMessage && (
        <p className={isError ? styles.error : styles.success}>
          {" "}
          {/* Corrected class names to match CSS */}
          {displayMessage}
        </p>
      )}
    </form>
  );
};

export default Register;
