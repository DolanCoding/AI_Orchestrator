import React from "react";
import { useSelector, useDispatch } from "react-redux"; // Import Redux hooks
import styles from "./ViewSwitcher.module.css";

// Import action creators and the logoutUser thunk
import { setView } from "../../store/features/uiSlice"; // Import setView action creator
import { logoutUser } from "../../store/features/userSlice"; // Import the logoutUser thunk

// ViewSwitcher no longer receives any props from App.jsx
const ViewSwitcher = () => {
  // Use useSelector to get the current view from the Redux store
  const currentView = useSelector((state) => state.ui.currentView);
  // Use useSelector to get the loggedIn state from the user slice in the Redux store
  const loggedIn = useSelector((state) => state.user.loggedIn); // Get loggedIn state directly from Redux

  // Use useDispatch to get the dispatch function
  const dispatch = useDispatch();

  // Add a console log to check the loggedIn state read from Redux
  console.log("ViewSwitcher rendering. loggedIn state from Redux:", loggedIn);

  // Function to handle view changes by dispatching the setView action
  const handleViewChange = (view) => {
    dispatch(setView(view));
  };

  // Function to handle logout - now dispatches the logoutUser thunk
  const handleLogoutClick = () => {
    console.log(
      "ViewSwitcher: Logout button clicked. Dispatching logoutUser thunk."
    );
    // Dispatch the logoutUser thunk
    dispatch(logoutUser());
    // The thunk handles clearing state and navigating to Authentication view
  };

  return (
    <div className={styles.viewSwitcherContainer}>
      {/* Authentication/Logout Button */}
      <button
        className={`${styles.viewButton} ${
          currentView === "Authentication" ? styles.active : "" // Use Authentication view name from Redux state
        }`}
        // Use handleLogoutClick for loggedIn users, handleViewChange for others
        onClick={
          loggedIn
            ? handleLogoutClick
            : () => handleViewChange("Authentication")
        } // Dispatch actions
        disabled={currentView === "Authentication"} // Disable if already active
      >
        {loggedIn ? "Logout" : "Login"} {/* Uses loggedIn from Redux */}
      </button>

      {/* Account Button (only shown when logged in) */}
      {loggedIn && ( // Uses loggedIn from Redux
        <button
          className={`${styles.viewButton} ${
            currentView === "account" ? styles.active : ""
          }`}
          onClick={() => handleViewChange("account")} // Dispatch setView action
          disabled={currentView === "account"} // Disable if already active
        >
          Account
        </button>
      )}

      {/* Button to switch to Chat View */}
      <button
        className={`${styles.viewButton} ${
          currentView === "chat" ? styles.active : ""
        }`}
        onClick={() => handleViewChange("chat")} // Dispatch setView action
        disabled={currentView === "chat"} // Disable if already active
      >
        Chat
      </button>

      {/* Button to switch to Map View */}
      <button
        className={`${styles.viewButton} ${
          currentView === "map" ? styles.active : ""
        }`}
        onClick={() => handleViewChange("map")} // Dispatch setView action
        disabled={currentView === "map"} // Disable if already active
      >
        Map
      </button>
    </div>
  );
};
export default ViewSwitcher;
