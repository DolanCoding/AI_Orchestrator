import React, { useState, useEffect } from "react"; // Import useEffect
import { useDispatch, useSelector } from "react-redux"; // Import useDispatch and useSelector
import style from "./CreationView.module.css"; // Assuming the CSS module is in the same directory

import CreateAI from "./CreateAIAgent/CreateAIAgent"; // Assuming CreateAI is in a CreateAI subdirectory
import CreateNodeMap from "./CreateNodeMap/CreateNodeMap"; // Assuming CreateNodeMap is in a CreateNodeMap subdirectory

// Import callServer (no longer needed in this component after thunk refactoring)
// import { callServer } from "../../utils/api"; // Adjust the path based on your project structure

// Import the createNodemap thunk and relevant state from nodemapsSlice
import { createNodemap } from "../../store/features/nodemapsSlice"; // Import the createNodemap thunk

// Import the createAgent thunk and relevant state from agentsSlice
import { createAgent } from "../../store/features/agentsSlice"; // Import the createAgent thunk

const CreationView = () => {
  // State to manage the type of item being created ('AI' or 'NodeMap')
  const [creationType, setCreationType] = useState("NodeMap"); // Changed initial state to NodeMap

  // Use useDispatch to get the dispatch function
  const dispatch = useDispatch();

  // Read creation status and error for Nodemap from Redux state
  const nodemapCreationStatus = useSelector(
    (state) => state.nodemaps.creationStatus
  );
  const nodemapCreationError = useSelector(
    (state) => state.nodemaps.creationError
  );

  // Read creation status and error for Agent from Redux state
  const agentCreationStatus = useSelector(
    (state) => state.agents.creationStatus
  );
  const agentCreationError = useSelector((state) => state.agents.creationError);

  // Local state for AI creation (REMOVED as it's now managed by Redux)
  // const [aiApiError, setAiApiError] = useState(null);
  // const [aiIsLoading, setAiIsLoading] = useState(false);
  // const [aiSuccessMessage, setAiSuccessMessage] = useState(null);

  // Handler for form submission from CreateAI or CreateNodeMap
  // This function receives the form data from the child component
  const handleCreationSubmit = async (formData) => {
    console.log(
      `CreationView handleCreationSubmit: Handling submission for type "${creationType}".`
    );

    if (creationType === "NodeMap") {
      console.log(
        "CreationView handleCreationSubmit: Dispatching createNodemap thunk."
      );
      // Dispatch the createNodemap thunk with the form data
      dispatch(createNodemap(formData));

      // Feedback (loading, success, error) for Nodemap creation is now
      // handled by the CreateNodeMap component reading Redux state.
    } else if (creationType === "AI") {
      console.log(
        "CreationView handleCreationSubmit: Dispatching createAgent thunk."
      );
      // Dispatch the createAgent thunk with the form data
      dispatch(createAgent(formData));

      // Feedback (loading, success, error) for AI creation is now
      // handled by the CreateAI component reading Redux state.
    }
  };

  // Handler for changing the creation type dropdown
  const handleTypeChange = (e) => {
    setCreationType(e.target.value);
    // Local AI messages are no longer needed to be cleared here
    // Redux state for creation status/error will reset on new submission
  };

  return (
    <div className={style.CreationViewContainer}>
      <select onChange={handleTypeChange} value={creationType}>
        <option value="AI">Create AI</option>
        <option value="NodeMap">Create NodeMap</option>
      </select>
      {/* Render the appropriate creation component based on state */}
      {creationType === "AI" && (
        // Pass the submit handler and Agent creation state from Redux to CreateAI
        <CreateAI
          onSubmit={handleCreationSubmit}
          disabled={agentCreationStatus === "loading"} // Disable while Redux status is loading
          creationStatus={agentCreationStatus} // Pass Redux status
          creationError={agentCreationError} // Pass Redux error
        />
      )}
      {creationType === "NodeMap" && (
        // Pass the submit handler and Nodemap creation state from Redux to CreateNodeMap
        <CreateNodeMap
          onSubmit={handleCreationSubmit}
          disabled={nodemapCreationStatus === "loading"} // Disable while Redux status is loading
          creationStatus={nodemapCreationStatus} // Pass Redux status
          creationError={nodemapCreationError} // Pass Redux error
        />
      )}
    </div>
  );
};

export default CreationView;
