import React, { useEffect } from "react"; // Import useEffect
import { useSelector, useDispatch } from "react-redux"; // Import useSelector and useDispatch hooks
import styles from "./NodeMaps.module.css"; // Assuming the CSS module is in the same directory

// Import the child component
import NodeMap from "./NodeMap/NodeMap"; // Import the individual NodeMap component

// Import the action creators to set the selected nodemap and change the view
import { setSelectedNodemap, setView } from "../../../store/features/uiSlice"; // Adjust the path

// Import the fetchNodemaps thunk (if not already fetched higher up)
// import { fetchNodemaps } from "../../../store/features/nodeMapsSlice"; // Adjust the path

/**
 * Container component for displaying the list of Node Maps.
 * Fetches nodemaps from Redux, sorts them (favorites first),
 * and automatically selects the first favorited (or first overall) map on load.
 * Renders individual NodeMap components.
 */
// NodeMaps component no longer receives nodeMapsData as a prop directly
const NodeMaps = () => {
  // Use useDispatch to get the dispatch function
  const dispatch = useDispatch();

  // Use useSelector to read the nodemaps data from the Redux store
  const allNodemaps = useSelector((state) => state.nodemaps.nodemaps); // Read all nodemaps
  // Read the status of fetching all nodemaps
  const nodemapsStatus = useSelector((state) => state.nodemaps.status); // Read status

  // --- Sorting Logic ---
  // Create a sorted copy of the nodemaps array
  // Sort by is_favorite (true comes before false) and then by creation date (newest first)
  const sortedNodemaps = [...allNodemaps].sort((a, b) => {
    // Sort favorites first (true = 1, false = 0, so b.is_favorite - a.is_favorite puts true first)
    const favoriteComparison = (b.is_favorite || 0) - (a.is_favorite || 0);

    if (favoriteComparison !== 0) {
      return favoriteComparison;
    }

    // If favorite status is the same, sort by creation date (newest first)
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return dateB - dateA; // Descending order for date (newest first)
  });
  // --- End Sorting Logic ---

  // --- useEffect for Initial Selection ---
  // This effect runs when the component mounts and when nodemapsStatus changes
  useEffect(() => {
    // Only attempt initial selection if nodemaps have been successfully fetched
    // and there are nodemaps in the list.
    if (nodemapsStatus === "succeeded" && sortedNodemaps.length > 0) {
      console.log(
        "NodeMaps useEffect: Nodemaps fetched, attempting initial selection."
      );

      // Find the first favorited nodemap
      const firstFavorited = sortedNodemaps.find(
        (nodemap) => nodemap.is_favorite
      );

      let nodemapToSelect = null;

      if (firstFavorited) {
        // If a favorited map exists, select it
        nodemapToSelect = firstFavorited;
        console.log(
          "NodeMaps useEffect: First favorited nodemap found, selecting ID:",
          nodemapToSelect.id
        );
      } else {
        // If no favorited map, select the first map in the sorted list
        nodemapToSelect = sortedNodemaps[0];
        console.log(
          "NodeMaps useEffect: No favorited nodemap found, selecting first map ID:",
          nodemapToSelect.id
        );
      }

      // Dispatch actions to select the nodemap and switch to the map view
      if (nodemapToSelect) {
        dispatch(setSelectedNodemap(nodemapToSelect.id));
        dispatch(setView("map")); // Automatically switch to map view
      }
    } else if (nodemapsStatus === "succeeded" && sortedNodemaps.length === 0) {
      console.log(
        "NodeMaps useEffect: Nodemaps fetched, but list is empty. No map to select."
      );
      // Optionally, you might want to navigate to a "Create New Map" view here
      // dispatch(setView("Creation"));
    }

    // Dependencies: nodemapsStatus, sortedNodemaps, dispatch, setSelectedNodemap, setView
    // Include nodemapsStatus to trigger when fetching is complete.
    // Include sortedNodemaps to react when the list data changes.
    // Include dispatch, setSelectedNodemap, and setView as they are used within the effect.
  }, [nodemapsStatus, sortedNodemaps, dispatch, setSelectedNodemap, setView]);
  // --- End useEffect for Initial Selection ---

  // Removed conditional rendering based on fetch status.
  // The list will now render based on the sortedNodemaps array.
  // Loading/error messages related to fetching should be handled elsewhere
  // (e.g., in AppManagementView or a wrapper component).

  return (
    <div className={styles.nodemapsContainer}>
      {" "}
      {/* Use the container class */}
      <h3>Your Node Maps</h3> {/* Added a main heading */}
      {/* Button to add a new Node Map */}
      <button
        className={styles.addNewButton}
        onClick={() => dispatch(setView("Creation"))}
      >
        {" "}
        {/* Dispatch setView directly */}
        Add New Node Map
      </button>
      {/* Render the list of Node Maps */}
      {/* Display message if no nodemaps found */}
      {sortedNodemaps.length === 0 && nodemapsStatus === "succeeded" && (
        <p>No node maps found. Click "Add New Node Map" to create one.</p>
      )}
      {/* Display loading message */}
      {nodemapsStatus === "loading" && <p>Loading node maps...</p>}
      {/* Display error message */}
      {nodemapsStatus === "failed" && (
        <p>Error loading node maps.</p> // You might display the actual error from state.nodemaps.error
      )}
      {/* Render the list if nodemaps are available */}
      {sortedNodemaps.length > 0 && (
        <ul className={styles.nodemapsList}>
          {" "}
          {/* Use the list class */}
          {sortedNodemaps.map((nodemap) => (
            // Render individual NodeMap component, passing the nodemap data
            <NodeMap key={nodemap.id} nodeMap={nodemap} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default NodeMaps;
