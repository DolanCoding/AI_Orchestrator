import React, { useState, useEffect } from "react"; // Import useEffect
import { useDispatch, useSelector } from "react-redux"; // Import useDispatch and useSelector
import Login from "./Login/Login"; // Assuming Login is in a Login subdirectory
import Register from "./Register/Register"; // Assuming Register is in a Register subdirectory
import styles from "./Authentication.module.css"; // Assuming the CSS module is in the same directory

// Import action creators and async thunks
import { setView } from "../../store/features/uiSlice"; // Import setView action creator
import {
  loginUser,
  registerUser,
  logout,
} from "../../store/features/userSlice"; // Import loginUser, registerUser thunk, and logout action

// Import callServer if still needed elsewhere, otherwise remove
// import { callServer } from "../../utils/api"; // Removed callServer import as it's now only used in thunks

// Authentication component no longer receives callServer or handleViewChange as props
const Authentication = () => {
  // State to toggle between Login and Register views (kept local as it's internal UI state)
  const [isLoginView, setIsLoginView] = useState(true);

  // Read registration status and error from Redux state
  const registrationStatus = useSelector(
    (state) => state.user.registrationStatus
  );
  const registrationError = useSelector(
    (state) => state.user.registrationError
  );

  // Read login status and error from Redux state
  const loginStatus = useSelector((state) => state.user.loginStatus); // Read login status
  const loginError = useSelector((state) => state.user.loginError); // Read login error

  const loggedIn = useSelector((state) => state.user.loggedIn); // Read loggedIn state

  // Use useDispatch to get the dispatch function
  const dispatch = useDispatch();

  // useEffect to handle navigation after successful registration
  useEffect(() => {
    if (registrationStatus === "succeeded") {
      console.log(
        "Authentication useEffect: Registration succeeded, switching to Login view."
      );
      setIsLoginView(true); // Switch to login view on successful registration
      // Optionally show a success message to the user here
    }
  }, [registrationStatus]); // Depend on registrationStatus

  // useEffect to handle navigation after successful login
  // This useEffect will now be triggered by the loginStatus changing to 'succeeded'
  // The actual navigation to Creation view is handled within the loginUser thunk
  useEffect(() => {
    if (loginStatus === "succeeded") {
      console.log("Authentication useEffect: Login succeeded, state updated.");
      // No need to dispatch setView here, it's done in the thunk.
    }
  }, [loginStatus]); // Depend on loginStatus

  // This function handles the submission from Login or Register forms
  // It dispatches Redux thunks based on the form type
  const onSubmit = async (type, data, callbacks) => {
    console.log(
      `Authentication onSubmit: Handling submission for type "${type}".`
    );

    if (type === "register") {
      console.log("Authentication onSubmit: Dispatching registerUser thunk.");
      // Dispatch the registerUser thunk with the form data
      dispatch(registerUser(data));

      // We will rely on the form components to read registrationStatus/Error from Redux
      // and update their UI accordingly.
      // Remove optimistic callbacks for register
      // callbacks["success"](true);
      // callbacks["error"](null);
    } else if (type === "login") {
      console.log("Authentication onSubmit: Dispatching loginUser thunk.");
      // Dispatch the loginUser thunk with the login credentials
      dispatch(loginUser(data));

      // We will rely on the form components to read loginStatus/Error from Redux
      // and update their UI accordingly.
      // Remove optimistic callbacks for login
      // callbacks["success"](true);
      // callbacks["error"](null);
    }
  };

  // Function to toggle between Login and Register views
  const toggleView = () => {
    setIsLoginView(!isLoginView);
    // Optionally clear registration status/error when switching views
    // dispatch(resetRegistrationStatus()); // Need a reducer for this if desired
    // Optionally clear login status/error when switching views
    // dispatch(resetLoginStatus()); // Need a reducer for this if desired
  };

  // handleViewChange is now only used for non-logout view changes
  const handleViewChange = (view) => {
    console.log(
      `Authentication handleViewChange: Dispatching setView to "${view}".`
    );
    dispatch(setView(view)); // Dispatch action to update view state in Redux
  };

  return (
    <div className={styles.authenticationContainer}>
      <h1>{isLoginView ? "Login" : "Register"}</h1>
      {/* Button to switch between Login and Register forms */}
      <button onClick={toggleView}>
        Switch to {isLoginView ? "Register" : "Login"}
      </button>

      {/* Render either Login or Register component based on local state */}
      {isLoginView ? (
        // Pass onSubmit to Login
        <Login
          onSubmit={onSubmit}
          // Pass login status and error down to the Login form
          loginStatus={loginStatus}
          loginError={loginError}
        />
      ) : (
        // Pass onSubmit to Register
        <Register
          onSubmit={onSubmit}
          // Pass registration status and error down to the Register form
          registrationStatus={registrationStatus}
          registrationError={registrationError}
        />
      )}
    </div>
  );
};

export default Authentication;
