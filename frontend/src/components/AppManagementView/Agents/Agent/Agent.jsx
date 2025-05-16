import React from "react";
import styles from "./Agent.module.css"; // Assuming the CSS module is in the same directory

/**
 * Displays a single AI Agent item in a list and makes it draggable.
 * @param {object} props - Component props.
 * @param {object} props.agent - A single agent object to display. Should have at least 'id', 'name', 'type', 'model'.
 */
const Agent = ({ agent }) => {
  // Handler for when dragging starts
  const onDragStart = (event, agentData) => {
    // Set the data to be transferred during the drag operation.
    // We'll stringify the agent data so it can be easily parsed on drop.
    // The 'application/reactflow' type is a convention used by react-flow
    // to distinguish between drags from the sidebar and other drag events.
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify(agentData)
    );
    // Set the drag effect to copy
    event.dataTransfer.effectAllowed = "move"; // Or 'copy' depending on desired behavior
    console.log("Agent onDragStart:", agentData);
  };

  // You might add an onClick handler here later if clicking an agent
  // should select it or navigate to a detailed view.
  const handleAgentClick = () => {
    console.log("Agent clicked:", agent.id);
    // TODO: Add logic to select the agent or change view if needed
    // Example: dispatch(setSelectedAgent(agent.id));
    // Example: dispatch(setView("AgentDetailView"));
  };

  return (
    <>
      {/* Assuming this component is rendered within a <ul> or <ol> in Agents.jsx */}
      {/* Add onClick handler if needed */}
      <li
        className={styles.agentItem}
        onClick={handleAgentClick}
        draggable="true" // Make the list item draggable
        onDragStart={(event) => onDragStart(event, agent)} // Attach the drag start handler
      >
        {" "}
        {/* Added onClick handler */}
        <div>
          <h4>{agent.name}</h4>
          <p>Type: {agent.type}</p>
          <p>Model: {agent.model}</p>
          {/* You might add other agent details here */}
          {/* Add buttons for View, Edit, Delete etc. here later if needed for individual items */}
        </div>
      </li>
    </>
  );
};

export default Agent;
