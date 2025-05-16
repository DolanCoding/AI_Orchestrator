import React, { useState } from "react"; // Removed useEffect
import { useSelector, useDispatch } from "react-redux"; // Import useSelector and useDispatch hooks
import styles from "./Agents.module.css"; // Assuming the CSS module is in the same directory

// Import child components
import Agent from "./Agent/Agent"; // Import the individual Agent component

// Removed import for fetchAgents thunk
// Import the setView action creator from uiSlice
import { setView } from "../../../store/features/uiSlice"; // Adjust the path based on your project structure

/**
 * Container component for displaying the list of AI agents.
 * Renders individual Agent components across two expandable lists:
 * "Created AI Agents" and "Used AI Agents".
 * Data is read from the Redux store, fetching is not handled here.
 */
const Agents = () => {
  // Use useDispatch to get the dispatch function
  const dispatch = useDispatch();

  // Use useSelector to read the agents data from the Redux store
  const allAgents = useSelector((state) => state.agents.agents); // Read all agents
  // Removed useSelector for agentsStatus and agentsError
  // const agentsStatus = useSelector((state) => state.agents.status); // Read status
  // const agentsError = useSelector((state) => state.agents.error); // Read error message

  // Local state to manage the expanded/collapsed state of the lists
  const [createdAisExpanded, setCreatedAisExpanded] = useState(true); // State for Created AI list
  const [usedAisExpanded, setUsedAisExpanded] = useState(true); // State for Used AI list

  // Handlers to toggle the expanded state of each list
  const toggleCreatedAis = () => {
    setCreatedAisExpanded(!createdAisExpanded);
  };

  const toggleUsedAis = () => {
    setUsedAisExpanded(!usedAisExpanded);
  };

  // Handler for clicking the "Add New AI" button
  const handleAddNewAIClick = () => {
    console.log(
      "Agents component: 'Add New AI' button clicked. Dispatching setView to Creation."
    );
    // Dispatch the action to change the current view to "Creation"
    // The CreationView component will handle selecting the 'AI' creation type
    dispatch(setView("Creation"));
  };

  // --- Filtering Logic ---
  // Filter 'allAgents' into 'createdAgents' and 'usedAgents'.
  // For now, we'll assume all agents in the store are "created" agents
  // and the "used" list is empty. This logic will need refinement later.
  const createdAgents = allAgents; // Assuming all agents in state are created by the user
  const usedAgents = []; // Explicitly set the used agents list as empty for now
  // You will replace this with actual filtering logic later based on agent properties
  // or receive separate lists from the backend.
  // Example: const createdAgents = allAgents.filter(agent => agent.created_by_user);
  // Example: const usedAgents = allAgents.filter(agent => agent.is_used);
  // --- End Filtering Logic ---

  // Removed conditional rendering based on fetch status.
  // The lists will now render based on the expanded state and filtered data.
  // Loading/error messages related to fetching should be handled elsewhere
  // if needed (e.g., in AppManagementView or a wrapper component).

  return (
    <div className={styles.agentsContainer}>
      {" "}
      {/* Use the container class */}
      <h3>Your AI Agents</h3> {/* Added a main heading */}
      {/* Button to add a new AI Agent */}
      <button className={styles.addNewButton} onClick={handleAddNewAIClick}>
        {" "}
        {/* Assuming a CSS class for the button */}
        Add New AI
      </button>
      {/* --- Section for Created AI Agents --- */}
      <div className={styles.agentSection}>
        {" "}
        {/* Container for a section */}
        <div className={styles.sectionHeader} onClick={toggleCreatedAis}>
          {" "}
          {/* Clickable header */}
          <h4>Created AI Agents</h4> {/* Section heading */}
          {/* Optional: Add an icon to indicate expanded/collapsed state */}
          <span>{createdAisExpanded ? "▲" : "▼"}</span>{" "}
          {/* Example toggle indicator */}
        </div>
        <div
          className={`${styles.sectionContent} ${
            createdAisExpanded ? styles.expanded : styles.collapsed
          }`}
        >
          {" "}
          {/* Content area */}
          {/* Render the list of Created AI Agents if expanded and data is available */}
          {createdAgents.length > 0 ? (
            <ul className={styles.agentsList}>
              {" "}
              {/* Use the list class */}
              {createdAgents.map((agent) => (
                // Render individual Agent component
                <Agent key={agent.id} agent={agent} />
              ))}
            </ul>
          ) : (
            // Display message if no created agents found
            <p>No created AI agents found.</p>
          )}
        </div>
      </div>
      {/* --- End Section for Created AI Agents --- */}
      {/* --- Section for Used AI Agents --- */}
      <div className={styles.agentSection}>
        {" "}
        {/* Container for a section */}
        <div className={styles.sectionHeader} onClick={toggleUsedAis}>
          {" "}
          {/* Clickable header */}
          <h4>Used AI Agents</h4> {/* Section heading */}
          {/* Optional: Add an icon to indicate expanded/collapsed state */}
          <span>{usedAisExpanded ? "▲" : "▼"}</span>{" "}
          {/* Example toggle indicator */}
        </div>
        <div
          className={`${styles.sectionContent} ${
            usedAisExpanded ? styles.expanded : styles.collapsed
          }`}
        >
          {" "}
          {/* Content area */}
          {/* Render the list of Used AI Agents if expanded and data is available */}
          {usedAgents.length > 0 ? (
            <ul className={styles.agentsList}>
              {" "}
              {/* Use the list class */}
              {usedAgents.map((agent) => (
                // Render individual Agent component
                <Agent key={agent.id} agent={agent} />
              ))}
            </ul>
          ) : (
            // Display message if no used agents found
            <p>No used AI agents found.</p>
          )}
        </div>
      </div>
      {/* --- End Section for Used AI Agents --- */}
    </div>
  );
};

export default Agents;
