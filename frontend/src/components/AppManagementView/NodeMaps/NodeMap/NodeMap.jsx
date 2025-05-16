import React from "react";
import { useDispatch, useSelector } from "react-redux"; // Import useDispatch and useSelector hooks
import styles from "./NodeMap.module.css"; // Assuming the CSS module is in the same directory

// Import the action creators to set the selected nodemap and change the view
import {
  setSelectedNodemap,
  setView,
} from "../../../../store/features/uiSlice"; // Adjust the path based on your project structure

// Import the action creator to trigger the save
// import { setSaveTrigger } from "../../../../store/features/nodemapsSlice"; // Adjust the path - Removed as save trigger is handled differently now

// Import the async thunk for toggling favorite status
import { toggleNodemapFavorite } from "../../../../store/features/nodeMapsSlice"; // Import the thunk

/**
 * Displays a single Node Map item in a list.
 * Renders a Save button if it is the currently selected nodemap.
 * Displays a favorite indicator that changes color based on is_favorite status.
 * @param {object} props - Component props.
 * @param {object} props.nodeMap - A single node map object to display. Should have at least 'id', 'name', 'goal', 'description', 'created_at', and 'is_favorite'.
 */
const NodeMap = ({ nodeMap }) => {
  // Use useDispatch to get the dispatch function
  const dispatch = useDispatch();
  console.log(nodeMap);
  // Use useSelector to read the selectedNodemapId from the Redux store
  // NOTE: This selector is currently reading from the nodemaps slice,
  // but selectedNodemapId was moved to the uiSlice.
  // Corrected selector:
  const selectedNodemapId = useSelector(
    (state) => state.ui.selectedNodemapId // Read selectedNodemapId from ui slice
  );

  // Determine if this nodemap is the currently selected one
  const isSelected = nodeMap.id === selectedNodemapId;

  // Function to format the date string into "dd/Month/yyyy"
  const formatDate = (dateString) => {
    if (!dateString) {
      return "N/A"; // Handle cases where dateString might be null or undefined
    }
    try {
      const date = new Date(dateString);
      // Use toLocaleDateString for localized date formatting
      // 'en-GB' locale typically uses day/month/year order
      // Options specify the format: numeric day, long month name, numeric year
      const options = { day: "2-digit", month: "long", year: "numeric" };
      return date.toLocaleDateString("en-GB", options);
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "Invalid Date"; // Return an error message if formatting fails
    }
  };

  // Handler for clicking the nodemap item to select it and switch view
  const handleNodemapClick = () => {
    console.log("Nodemap clicked:", nodeMap.id);
    // Dispatch the action to set the selected nodemap ID in Redux state
    dispatch(setSelectedNodemap(nodeMap.id));
    // Dispatch the action to change the current view to "map"
    dispatch(setView("map"));
  };

  // Handler for clicking the Save button
  const handleSaveClick = (e) => {
    e.stopPropagation(); // Prevent the click from bubbling up to the list item's onClick
    console.log("Save button clicked for Nodemap ID:", nodeMap.id);
    // Dispatch the action to trigger the save process in NodeMapView
    // This assumes NodeMapView is listening for a specific action or state change to trigger save.
    // If you have a specific save action/thunk, dispatch it here.
    // Example: dispatch(saveCurrentNodemap()); // Assuming a thunk like this exists
    // For now, we'll just log and rely on NodeMapView's internal save mechanism if any.
    // If setSaveTrigger was intended for this, ensure it's correctly implemented and used.
    // dispatch(setSaveTrigger(true)); // If setSaveTrigger is still needed
  };

  // Handler for clicking the favorite indicator
  const handleFavoriteClick = (e) => {
    e.stopPropagation(); // Prevent the click from bubbling up to the list item's onClick
    console.log("Favorite indicator clicked for Nodemap ID:", nodeMap.id);
    // Dispatch the async thunk to toggle the favorite status
    dispatch(toggleNodemapFavorite(nodeMap.id)); // Pass the nodemap ID to the thunk
  };

  return (
    <>
      {/* Assuming this component is rendered within a <ul> or <ol> */}
      {/* Add onClick handler to the list item */}
      <li
        className={`${styles.nodeMapItem} ${isSelected ? styles.selected : ""}`}
        onClick={handleNodemapClick}
      >
        {/* Added conditional class for selected state */}
        <div>
          <h4>{nodeMap.name}</h4>
          {/* Format and display the created_at date */}
          <p>Created: {formatDate(nodeMap.created_at)}</p>
          <p>Goal: {nodeMap.goal}</p>
          {/* Removed: <p>Description: {nodeMap.description}</p> */}
        </div>

        {/* Favorite Indicator (Star Icon) */}
        {/* Conditionally apply the favoritedStar class based on nodeMap.is_favorite */}
        <div
          className={`${styles.favoriteIndicator} ${
            nodeMap.is_favorite ? styles.favoritedStar : ""
          }`}
          onClick={handleFavoriteClick} // Attach the click handler
          aria-label={
            nodeMap.is_favorite ? "Remove from favorites" : "Add to favorites"
          } // Accessibility label
        >
          {/* Use a star character or icon font */}
          {nodeMap.is_favorite ? "★" : "☆"}{" "}
          {/* Filled star if favorited, outline star otherwise */}
        </div>
      </li>
    </>
  );
};

export default NodeMap;
