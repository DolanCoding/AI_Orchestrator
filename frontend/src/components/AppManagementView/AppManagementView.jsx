import React, { useState } from "react";
import { useSelector } from "react-redux"; // Import useSelector hook
import styles from "./AppManagementView.module.css";

// Import the new parent components
import Agents from "./Agents/Agents";
import NodeMaps from "./NodeMaps/NodeMaps";

/**
 * Main component for the left-bound App Management side menu.
 * Manages the display of AI and NodeMap sections and settings.
 * Now renders AIs and NodeMaps parent components based on active section.
 * Reads nodeMaps data from the Redux store.
 */
// AppManagementView no longer receives nodeMaps as a prop
const AppManagementView = () => {
  // State to manage which primary section is currently active/displayed ('AIs' or 'NodeMaps')
  const [settings, setSettings] = useState("NodeMaps"); // Changed initial state to NodeMaps for consistency

  // Use useSelector to get the nodemaps data from the Redux store
  const nodeMaps = useSelector((state) => state.nodemaps.nodemaps); // Read nodemaps array from Redux state

  // --- Placeholder Data and Handlers ---
  // These will likely be passed down to the AIs and NodeMaps components
  // or managed by state/context higher up. Keeping them here for now
  // as a reminder they are needed by the child structures.
  const dummyAis = [
    { id: "ai-1", name: "Sentiment Analyzer", type: "NLP" },
    { id: "ai-2", name: "Image Recognizer", type: "Vision" },
    { id: "ai-3", name: "Recommendation Engine", type: "ML" },
  ];

  // Placeholder handler for creating an AI (will likely dispatch a Redux action later)
  const handleCreateAI = (aiData) => {
    console.log("Create AI called with:", aiData);
    // Logic to dispatch an action to create an AI
  };

  return (
    <div className={styles.appManagementView}>
      <h2>App Management</h2>

      {/* Section Switcher Buttons */}
      <div className={styles.sectionSwitcher}>
        <button
          className={`${styles.switchButton} ${
            settings === "NodeMaps" ? styles.active : ""
          }`}
          onClick={() => setSettings("NodeMaps")}
          aria-pressed={settings === "NodeMaps"} // Accessibility attribute
        >
          Node Maps
        </button>
        <button
          className={`${styles.switchButton} ${
            settings === "AIs" ? styles.active : ""
          }`}
          onClick={() => setSettings("AIs")}
          aria-pressed={settings === "AIs"} // Accessibility attribute
        >
          AIs
        </button>
      </div>

      {/* Render the active section component */}
      {settings === "AIs" && (
        // Pass necessary props down to the AIs component
        <Agents
          aisData={dummyAis} // Example: Pass data down (replace with Redux state later)
          onCreateAI={handleCreateAI} // Example: Pass handler down (replace with Redux action dispatch later)
        />
      )}

      {settings === "NodeMaps" && (
        // Pass necessary props down to the NodeMaps component
        <NodeMaps
          nodeMapsData={nodeMaps} // Pass nodemaps data read from Redux state
        />
      )}
    </div>
  );
};

export default AppManagementView;
