import React from "react";
// Import Handle component from react-flow to define connection points
import { Handle, Position } from "reactflow";

import styles from "./AIAgentNode.module.css"; // Import the CSS module

/**
 * Custom React Flow Node component for displaying an AI Agent.
 * This component defines the visual representation and connection handles
 * for an AI agent node in the Node Map.
 *
 * @param {object} props - Props passed by react-flow.
 * @param {object} props.data - The data object for this node, containing agent details.
 * @param {string} props.data.label - The main label for the node (e.g., agent name).
 * @param {string} props.data.agentType - The type of the AI agent (e.g., 'chat', 'text').
 * @param {string} props.data.agentModel - The model of the AI agent (e.g., 'model-a').
 * // Add other relevant agent data fields here as needed from the node's data property
 */
const AIAgentNode = ({ data }) => {
  console.log("Rendering AIAgentNode with data:", data);

  return (
    <div className={styles.aiAgentNode}>
      {" "}
      {/* Apply custom node styling */}
      {/* Input Handle (Top) - Allows connecting edges to the top of the node */}
      {/* Type 'target' means it's a point where an edge can connect TO this node */}
      <Handle type="target" position={Position.Top} className={styles.handle} />
      {/* Node Content */}
      <div className={styles.nodeContent}>
        <div className={styles.nodeLabel}>{data.label}</div>{" "}
        {/* Display the main label (agent name) */}
        {/* Display other agent details from the data prop */}
        <div className={styles.nodeDetails}>
          <p>Type: {data.agentType}</p>
          <p>Model: {data.agentModel}</p>
          {/* Add more details here if available in data */}
        </div>
      </div>
      {/* Output Handle (Bottom) - Allows connecting edges from the bottom of the node */}
      {/* Type 'source' means it's a point where an edge can connect FROM this node */}
      <Handle
        type="source"
        position={Position.Bottom}
        className={styles.handle}
      />
      {/* You can add more handles (e.g., Left, Right, or multiple handles) as needed */}
      {/*
      <Handle type="target" position={Position.Left} id="left-target" className={styles.handle} />
      <Handle type="source" position={Position.Right} id="right-source" className={styles.handle} />
      */}
    </div>
  );
};

export default AIAgentNode;
