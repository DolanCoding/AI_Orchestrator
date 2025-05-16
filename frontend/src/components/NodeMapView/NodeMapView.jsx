import React, { useState, useCallback, useRef, useEffect } from "react";
import ReactFlow, {
  MiniMap, // Still import MiniMap if you might use it later, but it's removed from render
  Controls,
  Background,
  useNodesState,
  useEdgesState, // Corrected hook name
  addEdge,
  useReactFlow,
} from "reactflow";

import "reactflow/dist/style.css";

import { useSelector, useDispatch } from "react-redux";
import {
  saveNodemapData,
  fetchNodemapData,
  clearCurrentNodemapData,
} from "../../store/features/nodeMapsSlice"; // Import necessary actions/thunks

import styles from "./NodeMapView.module.css";

import AIAgentNode from "./CustomNodes/AIAgentNode";

// Simple debounce utility function
// Delays the execution of 'func' until 'delay' milliseconds
// have passed without it being called again.
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

// Define custom node types
const nodeTypes = {
  aiAgent: AIAgentNode, // Corrected type name to match onDrop
};

// Define custom edge types (none defined yet, but ready)
const edgeTypes = {
  // customEdge: CustomEdgeComponent,
};

// Simple counter for generating unique node IDs
let id = 0;
const getId = () => `dndnode_${id++}`;

/**
 * The main component for displaying and interacting with a Node Map.
 * Integrates react-flow for handling nodes, edges, and interactions.
 * Includes automatic saving on node/edge changes triggered by user actions.
 */
const NodeMapView = () => {
  // Ref for the React Flow wrapper div to calculate drop position
  const reactFlowWrapper = useRef(null);
  // Removed isInitialLoad ref as we are now triggering save on specific user events

  // Manage nodes and edges state using react-flow hooks
  // onNodesChange and onEdgesChange functions returned here are used to update local state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]); // Corrected hook name

  // Get the reactFlowInstance for interacting with the flow
  const reactFlowInstance = useReactFlow();

  // Get dispatch function for Redux actions
  const dispatch = useDispatch();

  // Read the selectedNodemapId from the uiSlice state
  const selectedNodemapId = useSelector((state) => state.ui.selectedNodemapId);

  // Get the currently loaded nodemap data (nodes and edges) from nodemapsSlice
  const currentNodemapData = useSelector(
    (state) => state.nodemaps.currentNodemapData
  );
  const fetchSingleStatus = useSelector(
    (state) => state.nodemaps.fetchSingleStatus
  );
  const fetchSingleError = useSelector(
    (state) => state.nodemaps.fetchSingleError
  );
  const saveStatus = useSelector((state) => state.nodemaps.saveStatus);
  const saveError = useSelector((state) => state.nodemaps.saveError);

  // --- State to control the display of the save success/failure messages ---
  const [displaySaveSuccess, setDisplaySaveSuccess] = useState(false); // State for success message
  const [displaySaveFailure, setDisplaySaveFailure] = useState(false); // New state for failure message
  // --- End State ---

  // --- Debounced Save Function (for automatic save) ---
  // Moved the declaration of debouncedSave BEFORE the handlers that call it
  // Memoize the debounced function using useCallback
  const debouncedSave = useCallback(
    debounce(() => {
      console.log("Debounced save triggered.");
      // Ensure reactFlowInstance is available and a nodemap is selected before saving
      if (selectedNodemapId !== null && reactFlowInstance) {
        const currentNodes = reactFlowInstance.getNodes();
        const currentEdges = reactFlowInstance.getEdges();

        console.log("NodeMapView: Saving map data...");
        console.log("  Nodemap ID:", selectedNodemapId);
        console.log("  Current Nodes:", currentNodes);
        console.log("NodeMapView: Current Edges:", currentEdges);

        // Dispatch the saveNodemapData thunk
        dispatch(
          saveNodemapData({
            nodemapId: selectedNodemapId,
            nodes: currentNodes,
            edges: currentEdges,
          })
        );
      } else {
        console.log(
          "Debounced save skipped: No nodemap selected or reactFlowInstance not ready."
        );
      }
    }, 1000), // 1000ms (1 second) debounce delay
    [selectedNodemapId, reactFlowInstance, dispatch, saveNodemapData] // Dependencies for the debounced function
  );
  // --- End Debounced Save Function ---

  // --- Effect to fetch nodemap data when selectedNodemapId changes ---
  useEffect(() => {
    console.log(
      "NodeMapView useEffect: selectedNodemapId changed or component mounted.",
      selectedNodemapId
    );
    // Removed isInitialLoad.current = false;

    // Fetch data only if a nodemap is selected
    if (selectedNodemapId) {
      console.log(
        `NodeMapView useEffect: Dispatching fetchNodemapData for ID ${selectedNodemapId}`
      );
      dispatch(fetchNodemapData(selectedNodemapId));
    } else {
      // If no nodemap is selected (e.g., navigating away), clear the current data
      console.log(
        "NodeMapView useEffect: No nodemap selected, clearing current data."
      );
      dispatch(clearCurrentNodemapData());
      // Also clear React Flow state
      setNodes([]);
      setEdges([]);
    }

    // Cleanup function: clear data when the component unmounts or selectedNodemapId changes
    return () => {
      console.log(
        "NodeMapView useEffect Cleanup: Clearing current nodemap data."
      );
      dispatch(clearCurrentNodemapData());
      setNodes([]);
      setEdges([]);
      // Removed isInitialLoad.current = false;
    };
  }, [selectedNodemapId, dispatch]); // Depend on selectedNodemapId and dispatch

  // --- Effect to initialize React Flow with fetched data ---
  useEffect(() => {
    console.log(
      "NodeMapView useEffect: currentNodemapData updated.",
      currentNodemapData
    );
    // Initialize nodes and edges when currentNodemapData is loaded
    if (currentNodemapData) {
      console.log(
        "NodeMapView useEffect: Initializing React Flow with fetched data."
      );
      // Assuming currentNodemapData has nodes_data and edges_data properties
      // Ensure nodes_data and edges_data are arrays, default to empty arrays if null/undefined
      const initialNodes = currentNodemapData.nodes_data || [];
      const initialEdges = currentNodemapData.edges_data || [];

      // Use the state setters directly to populate React Flow state
      setNodes(initialNodes);
      setEdges(initialEdges);
      console.log("NodeMapView useEffect: React Flow nodes and edges set.");
      // Removed isInitialLoad.current = true;
    } else {
      // If currentNodemapData is null (e.g., after clearing), reset React Flow state
      console.log(
        "NodeMapView useEffect: currentNodemapData is null, resetting React Flow state."
      );
      setNodes([]);
      setEdges([]);
      // Removed isInitialLoad.current = false;
    }
  }, [currentNodemapData, setNodes, setEdges]); // Depend on currentNodemapData and state setters

  // --- Effect to manage the display of the save success/failure messages ---
  useEffect(() => {
    let successTimer;
    let failureTimer;

    if (saveStatus === "succeeded") {
      console.log("Save succeeded. Displaying success message.");
      setDisplaySaveSuccess(true);
      setDisplaySaveFailure(false); // Ensure failure message is hidden
      // Set a timer to hide the success message after 3 seconds
      successTimer = setTimeout(() => {
        console.log("Hiding success message after 3 seconds.");
        setDisplaySaveSuccess(false);
      }, 3000); // 3000 milliseconds = 3 seconds
    } else if (saveStatus === "failed") {
      // Handle failed status
      console.log("Save failed. Displaying failure message.");
      setDisplaySaveFailure(true);
      setDisplaySaveSuccess(false); // Ensure success message is hidden
      // Set a timer to hide the failure message after 3 seconds
      failureTimer = setTimeout(() => {
        console.log("Hiding failure message after 3 seconds.");
        setDisplaySaveFailure(false);
      }, 3000); // 3000 milliseconds = 3 seconds
    } else {
      // If status is idle or loading, ensure both messages are not displayed
      setDisplaySaveSuccess(false);
      setDisplaySaveFailure(false);
    }

    // Cleanup function to clear both timers if the effect re-runs or component unmounts
    return () => {
      console.log(
        "Save status effect cleanup: Clearing success/failure message timers."
      );
      clearTimeout(successTimer);
      clearTimeout(failureTimer);
    };
  }, [saveStatus]); // Depend on the saveStatus from Redux
  // --- End Effect ---

  // --- Handler for connecting edges ---
  // Use useCallback to memoize the onConnect function
  const onConnect = useCallback(
    (params) => {
      // Update local edges state
      setEdges((eds) => addEdge(params, eds));
      // Trigger debounced save after adding an edge (user action)
      console.log("Edge connected. Triggering debounced save.");
      debouncedSave(); // Call debouncedSave directly
    },
    [setEdges, debouncedSave] // Depend on setEdges and debouncedSave
  );
  // --- End Handler for connecting edges ---

  // --- Handler for saving the current map state (Manual Save Button) ---
  const handleSaveMap = useCallback(() => {
    if (!reactFlowInstance || !selectedNodemapId) {
      console.warn(
        "NodeMapView handleSaveMap: React Flow instance not available or no nodemap selected."
      );
      return;
    }

    // Get the current state of the nodes and edges from the React Flow instance
    const currentNodes = reactFlowInstance.getNodes();
    const currentEdges = reactFlowInstance.getEdges();

    console.log("NodeMapView handleSaveMap: Saving map data...");
    console.log("  Nodemap ID:", selectedNodemapId);
    console.log("  Current Nodes:", currentNodes);
    console.log("  Current Edges:", currentEdges);

    // Dispatch the saveNodemapData thunk
    dispatch(
      saveNodemapData({
        nodemapId: selectedNodemapId,
        nodes: currentNodes,
        edges: currentEdges,
      })
    );
  }, [reactFlowInstance, selectedNodemapId, dispatch, saveNodemapData]); // Depend on necessary values

  // --- End Handler for saving the current map state ---

  // --- Modified onNodesChange handler (only updates state) ---
  // This handler is called by React Flow when nodes change (including position changes)
  // We will NOT trigger save from here anymore.
  const handleNodesChange = useCallback(
    (changes) => {
      // Apply the changes to the nodes state
      onNodesChange(changes);
      // Removed debouncedSave() call from here
    },
    [onNodesChange]
  ); // Depend on onNodesChange
  // --- End Modified onNodesChange handler ---

  // --- Handler for when a node drag stops ---
  // This is a specific user interaction event for node movement
  const onNodeDragStop = useCallback(
    (event, node) => {
      console.log("Node drag stopped for node ID:", node.id);
      // Trigger debounced save after a node drag stops (user action)
      debouncedSave(); // Call debouncedSave directly
    },
    [debouncedSave]
  ); // Depend on debouncedSave
  // --- End Handler for when a node drag stops ---

  // --- Removed the useEffect that watched nodes and edges ---
  /*
  useEffect(() => {
    console.log("Nodes or Edges state changed. Triggering debounced save.");
    if (isInitialLoad.current && selectedNodemapId) {
       console.log("Initial load complete and nodemap selected, triggering debounced save.");
       debouncedSave();
    } else {
        console.log(`Initial load not complete (${isInitialLoad.current}) or no nodemap selected (${selectedNodemapId}), skipping debounced save.`);
    }
    return () => {
      console.log("Nodes/Edges useEffect cleanup: Clearing debounce timer.");
    };
  }, [nodes, edges, debouncedSave, selectedNodemapId]); // Removed fetchSingleStatus from dependencies
  */
  // --- End Removed useEffect ---

  // --- Handle Drag Over for dropping nodes ---
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    // Set the drop effect to 'move' or 'copy'
    event.dataTransfer.dropEffect = "move"; // Or 'copy'
  }, []);
  // --- End Handle Drag Over ---

  // --- Handle Drop for dropping nodes ---
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");

      if (typeof type === "undefined" || !type) {
        console.warn(
          "onDrop: Dropped item does not have 'application/reactflow' type."
        );
        return;
      }

      let agentData = null;
      try {
        agentData = JSON.parse(type);
        console.log("onDrop: Parsed agent data:", agentData);
        if (!agentData || !agentData.id || !agentData.name) {
          console.warn("onDrop: Parsed data is not a valid agent object.");
          return;
        }
      } catch (error) {
        console.error("onDrop: Failed to parse dropped data:", error);
        return;
      }

      // Ensure reactFlowInstance is available before projecting position
      if (!reactFlowInstance) {
        console.warn("onDrop: React Flow instance not available.");
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: getId(),
        type: "aiAgent", // Corrected type name to match nodeTypes definition
        position,
        data: {
          label: agentData.name,
          agentId: agentData.id,
          agentType: agentData.type,
          agentModel: agentData.model,
        },
      };

      console.log("onDrop: Adding new node:", newNode);
      // Use setNodes with a callback to ensure we have the latest state when adding
      setNodes((nds) => nds.concat(newNode));

      // --- Trigger debounced save after adding a new node via drop ---
      console.log("New node added via drop. Triggering debounced save.");
      debouncedSave(); // Call debouncedSave directly after adding the node
      // --- End Trigger ---
    },
    [reactFlowInstance, setNodes, reactFlowWrapper, debouncedSave]
  ); // Added debouncedSave as a dependency

  // Add more handlers here later for features like:
  // - onNodeClick: Handling clicks on individual nodes
  // - onEdgeClick: Handling clicks on edges

  console.log("NodeMapView rendering with nodes:", nodes, "and edges:", edges);

  // --- Conditional Rendering based on fetch status ---
  if (!selectedNodemapId) {
    // Display a message if no nodemap is selected
    return (
      <div className={styles.nodeMapViewContainer}>
        <p>Please select a nodemap from the left panel to view or edit.</p>
      </div>
    );
  }

  if (fetchSingleStatus === "loading") {
    // Display a loading message while fetching data
    return (
      <div className={styles.nodeMapViewContainer}>
        <p>Loading nodemap data...</p>
      </div>
    );
  }

  if (fetchSingleStatus === "failed") {
    // Display an error message if fetching failed
    return (
      <div className={styles.nodeMapViewContainer}>
        <p>Error loading nodemap data: {fetchSingleError}</p>
      </div>
    );
  }

  if (!currentNodemapData) {
    // This case might happen briefly after selecting before data is loaded,
    // or if a selected nodemap somehow has no data.
    return (
      <div className={styles.nodeMapViewContainer}>
        <p>No data available for the selected nodemap.</p>
      </div>
    );
  }
  // --- End Conditional Rendering ---

  // Render the React Flow component when data is successfully loaded
  return (
    <div className={styles.nodeMapViewContainer} ref={reactFlowWrapper}>
      {" "}
      {/* Apply container styling and ref */}
      {/* Apply the reactFlowWrapper class to the ReactFlow component */}
      <ReactFlow
        className={styles.reactFlowWrapper} // Apply the wrapper class here
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange} // Use the modified handler
        onEdgesChange={onEdgesChange} // Corrected hook name
        onConnect={onConnect} // Use the modified handler
        onNodeDragStop={onNodeDragStop} // Add handler for node drag stop
        nodeTypes={nodeTypes} // Register custom node types
        edgeTypes={edgeTypes} // Register custom edge types
        onDrop={onDrop} // Use the modified handler
        onDragOver={onDragOver} // Add onDragOver handler
        // Add fitView prop to initially center the graph
        fitView
        // Add other react-flow props here as needed:
        // onInit={(reactFlowInstance) => console.log('flow initialized:', reactFlowInstance)}
        // defaultZoom={1}
        // panOnScroll={true}
        // zoomOnScroll={true}
        // zoomOnDoubleClick={true}
        // panOnDrag={[1, 2]}
        // selectionOnDrag={true}
        // proOptions={{ hideAttribution: true }}
      >
        <Controls /> {/* Add default controls (zoom, pan, etc.) */}
        {/* Removed MiniMap as requested */}
        {/* Changed Background variant to grid */}
        <Background variant="lines" gap={20} size={1} color="#444" />{" "}
        {/* Example grid background */}
      </ReactFlow>
      {/* Wrapper for the Save button and status messages at the bottom */}
      <div className={styles.saveControls}>
        {" "}
        {/* Apply new CSS class */}
        {/* Display save status/error messages - Moved BEFORE the button */}
        {/* Conditionally apply hiddenMessage class based on displaySaveSuccess and saveStatus */}
        <p
          className={`${styles.saveSuccess} ${
            !displaySaveSuccess ? styles.hiddenMessage : ""
          }`}
        >
          Map saved successfully!
        </p>
        {/* Conditionally apply hiddenMessage class based on displaySaveFailure */}
        <p
          className={`${styles.saveError} ${
            !displaySaveFailure ? styles.hiddenMessage : ""
          }`}
        >
          Failed to save map: {saveError}
        </p>
        <p
          className={`${styles.saveSuccess} ${
            saveStatus !== "loading" ? styles.hiddenMessage : ""
          }`}
        >
          Saving...
        </p>
        {/* Add a Save button */}
        <button
          onClick={handleSaveMap}
          className={styles.saveMapButton} // Apply CSS class for styling
          disabled={saveStatus === "loading"} // Disable button while saving
        >
          {"Save Map"}
        </button>
      </div>
    </div>
  );
};

export default NodeMapView;
