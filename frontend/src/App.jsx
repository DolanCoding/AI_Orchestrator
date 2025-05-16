import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./App.css";

// Import action creators and async thunks
import { fetchUserData, logout } from "./store/features/userSlice";
import { setView } from "./store/features/uiSlice";

import ChatView from "./components/ChatView/ChatView";
import ViewSwitcher from "./components/ViewSwitcher/ViewSwitcher";
import AppManagementView from "./components/AppManagementView/AppManagementView";
import CreationView from "./components/CreationView/CreationView";
import NodeMapView from "./components/NodeMapView/NodeMapView";
import Authentication from "./components/Authentication/Authentication";

// Import ReactFlowProvider from react-flow
import { ReactFlowProvider } from "reactflow";

function App() {
  // Use useSelector to access state from the Redux store
  const loggedIn = useSelector((state) => state.user.loggedIn);
  const currentView = useSelector((state) => state.ui.currentView);
  const userStatus = useSelector((state) => state.user.status);

  // Use useDispatch to get the dispatch function
  const dispatch = useDispatch();

  // Derive isLoading state from Redux user status
  const isLoading = userStatus === "loading";

  // Fetch user data on component mount
  useEffect(() => {
    console.log("App component mounted. Dispatching fetchUserData thunk...");
    dispatch(fetchUserData());
  }, [dispatch]);

  // Handle navigation after the initial fetch is done
  useEffect(() => {
    // If not loading and not logged in, navigate to Authentication view
    if (!isLoading && !loggedIn && currentView !== "Authentication") {
      console.log(
        "App useEffect: Not logged in after initial fetch, navigating to Authentication."
      );
      dispatch(setView("Authentication"));
    }
    // If not loading and logged in, and still on Authentication, navigate to Creation
    if (!isLoading && loggedIn && currentView === "Authentication") {
      console.log(
        "App useEffect: Logged in after initial fetch, navigating to Creation."
      );
      dispatch(setView("Creation"));
    }
  }, [isLoading, loggedIn, currentView, dispatch]);

  // Handle view changes and logout
  const handleViewChange = (view, isLogout) => {
    if (isLogout) {
      dispatch(logout());
    }
    dispatch(setView(view));
  };

  return (
    <>
      {/* Conditionally render a loading indicator or the main content */}
      {isLoading ? (
        <div>Loading...</div> // Replace with your actual loading spinner/component
      ) : (
        <>
          {/* Conditional rendering based on currentView from Redux state */}
          {/* Render Chat, Map, Creation views only if logged in */}
          {loggedIn && currentView === "chat" && <ChatView />}
          {loggedIn && currentView === "map" && (
            // Wrap NodeMapView with ReactFlowProvider
            <ReactFlowProvider>
              <NodeMapView />
            </ReactFlowProvider>
          )}
          {loggedIn && currentView === "Creation" && (
            <CreationView handleViewChange={handleViewChange} />
          )}

          {/* Only render Authentication view if not logged in */}
          {!loggedIn && currentView === "Authentication" && <Authentication />}

          {/* Render ViewSwitcher and AppManagementView if logged in */}
          {loggedIn && (
            <>
              <AppManagementView />
              <ViewSwitcher />
            </>
          )}
        </>
      )}
    </>
  );
}

export default App;
