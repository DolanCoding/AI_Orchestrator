import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { callServer } from "../../utils/api"; // Import the callServer utility

const initialState = {
  agents: [], // Array to store the list of agents
  // Removed status and error properties as fetching is removed from this slice
  creationStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed' - for creating an agent
  creationError: null, // Stores error message for creating an agent
};

// --- Async Thunk for creating an agent ---
// This thunk will handle the API call to create a new agent on the backend.
const createAgent = createAsyncThunk(
  "agents/createAgent", // Action type prefix
  async (agentData, { dispatch, rejectWithValue }) => {
    // Thunk payload creator function receives agent data
    console.log(
      "createAgent Thunk: Calling /createagent API with data:",
      agentData
    );
    try {
      // Use callServer to create the agent.
      // Assuming your backend expects a POST request to '/createagent'.
      // The 'createagent' endpoint config should be defined in your api.js.
      const response = await callServer("createagent", agentData, "POST");
      console.log("createAgent Thunk: API response received:", response);

      // Check for a successful creation status (e.g., 201 Created)
      if (response.status === 201) {
        const data = response.data;
        console.log("createAgent Thunk: Agent created successfully:", data);
        // Assuming the response data includes the newly created agent object.
        // Dispatch an action to add the new agent to the state.
        // You might need to adjust 'data.agent' based on your backend response structure.
        // If the backend returns the full agent object directly, use 'data'.
        dispatch(addAgent(data.agent || data)); // Assuming response has 'agent' property or is the agent object

        return data; // Return the data to be the payload of the fulfilled action
      } else {
        console.error(
          "createAgent Thunk: API call failed with status:",
          response.status
        );
        // Use rejectWithValue to return a custom error payload
        return rejectWithValue(
          response.data?.error ||
            `Agent creation failed. Status: ${response.status}`
        );
      }
    } catch (error) {
      console.error("createAgent Thunk: Error during API call:", error);
      // Use rejectWithValue for errors that prevent a response (e.g., network errors)
      return rejectWithValue(
        error.message || "Network error during agent creation"
      );
    }
  }
);
// --- End Async Thunk for creating an agent ---

// Removed Async Thunk for fetching agents (fetchAgents)

export const agentsSlice = createSlice({
  name: "agents", // A name for this slice
  initialState, // The initial state
  reducers: {
    // Reducer to set the list of agents (will be used by userSlice thunks)
    setAgents: (state, action) => {
      // Ensure the payload is an array before setting
      if (Array.isArray(action.payload)) {
        state.agents = action.payload; // Assuming payload is the array of agents
      } else {
        console.error(
          "setAgents Reducer: Invalid payload received, expected an array.",
          action.payload
        );
        state.agents = []; // Reset to empty array on invalid payload
      }
    },
    // Reducer for adding a single agent (dispatched by createAgent thunk)
    addAgent: (state, action) => {
      // Ensure the payload is a valid object before pushing
      if (action.payload && typeof action.payload === "object") {
        state.agents.push(action.payload); // Assuming payload is the new agent object
      } else {
        console.error(
          "addAgent Reducer: Invalid payload received, cannot add to agents array.",
          action.payload
        );
      }
    },
    // You might add reducers for updating one or deleting one later
    // removeAgent: (state, action) => { state.agents = state.agents.filter(agent => agent.id !== action.payload); },
  },
  // --- Extra Reducers for handling Async Thunk actions ---
  extraReducers: (builder) => {
    builder
      // Handle the pending state of createAgent
      .addCase(createAgent.pending, (state) => {
        console.log("createAgent Thunk: Pending...");
        state.creationStatus = "loading";
        state.creationError = null; // Clear previous errors on new request
      })
      // Handle the fulfilled state of createAgent
      .addCase(createAgent.fulfilled, (state, action) => {
        console.log("createAgent Thunk: Fulfilled. Payload:", action.payload);
        state.creationStatus = "succeeded";
        state.creationError = null; // Clear any errors on success
        // The actual addition of the agent to the state is handled by the addAgent reducer
        // dispatched within the thunk.
      })
      // Handle the rejected state of createAgent
      .addCase(createAgent.rejected, (state, action) => {
        console.error(
          "createAgent Thunk: Rejected. Error:",
          action.payload || action.error.message
        );
        state.creationStatus = "failed";
        state.creationError = action.payload || action.error.message; // Store the error message
      });
    // Removed extra reducers for fetchAgents
  },
  // --- End Extra Reducers ---
});

// Action creators are generated for each case reducer function
export const { setAgents, addAgent } = agentsSlice.actions; // Export the addAgent and setAgents action creators

// Export the async thunks
export { createAgent }; // Export only the createAgent thunk

// The reducer itself
export default agentsSlice.reducer;
