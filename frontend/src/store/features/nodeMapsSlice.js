import { createSlice, createAsyncThunk, unwrapResult } from "@reduxjs/toolkit"; // Import unwrapResult
import { callServer } from "../../utils/api"; // Import the callServer utility

const initialState = {
  nodemaps: [], // Array to store the list of nodemaps
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed' - for fetching ALL nodemaps
  error: null, // Stores error message for fetching ALL nodemaps
  creationStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed' - for creating a nodemap
  creationError: null, // Stores error message for creating a nodemap
  saveStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed' - for saving nodemap data
  saveError: null, // Stores error message for saving nodemap data
  // Removed saveTrigger state
  // State for fetching single nodemap data
  fetchSingleStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed' - for fetching a single nodemap
  fetchSingleError: null, // Stores error message for fetching a single nodemap
  // State for toggling favorite status
  toggleFavoriteStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed' - for toggling favorite
  toggleFavoriteError: null, // Stores error message for toggling favorite
  // State to store the currently loaded nodemap's full data (nodes and edges)
  currentNodemapData: null, // Will store { nodes_data: [...], edges_data: [...] }
};

// --- Async Thunk for creating a nodemap ---
const createNodemap = createAsyncThunk(
  "nodemaps/createNodemap",
  async (nodemapData, { dispatch, rejectWithValue }) => {
    console.log(
      "createNodemap Thunk: Calling /createmap API with data:",
      nodemapData
    );
    try {
      const response = await callServer("createmap", nodemapData, "POST");
      console.log("createNodemap Thunk: API response received:", response);

      if (response.status === 201) {
        const data = response.data;
        console.log("createNodemap Thunk: Nodemap created successfully:", data);
        // Assuming the response includes the new nodemap object with ID
        dispatch(addNodemap(data)); // Add the new nodemap to the list
        // Selection is handled by clicking the card in NodeMaps.jsx
        return data;
      } else {
        console.error(
          "createNodemap Thunk: API call failed with status:",
          response.status
        );
        return rejectWithValue(
          response.data?.error ||
            `Nodemap creation failed. Status: ${response.status}`
        );
      }
    } catch (error) {
      console.error("createNodemap Thunk: Error during API call:", error);
      return rejectWithValue(
        error.message || "Network error during nodemap creation"
      );
    }
  }
);
// --- End Async Thunk for creating a nodemap ---

// --- Async Thunk for fetching all nodemaps ---
const fetchNodemaps = createAsyncThunk(
  "nodemaps/fetchNodemaps",
  async (_, { dispatch, rejectWithValue }) => {
    console.log("fetchNodemaps Thunk: Calling /getnodemaps API...");
    try {
      const response = await callServer("getnodemaps", null, "GET");
      console.log("fetchNodemaps Thunk: API response received:", response);

      if (response.status >= 200 && response.status < 300) {
        const data = response.data;
        console.log(
          "fetchNodemaps Thunk: Nodemaps fetched successfully:",
          data
        );
        // Assuming the response is { nodemaps: [...] }
        dispatch(setNodemaps(data.nodemaps || [])); // Set the list of nodemaps
        return data; // Return the full response data if needed
      } else {
        console.error(
          "fetchNodemaps Thunk: API call failed with status:",
          response.status
        );
        return rejectWithValue(
          response.data?.error ||
            `Failed to fetch nodemaps. Status: ${response.status}`
        );
      }
    } catch (error) {
      console.error("fetchNodemaps Thunk: Error during API call:", error);
      return rejectWithValue(
        error.message || "Network error during nodemap fetch"
      );
    }
  }
);
// --- End Async Thunk for fetching all nodemaps ---

// --- Async Thunk for saving nodemap data ---
const saveNodemapData = createAsyncThunk(
  "nodemaps/saveNodemapData",
  async ({ nodemapId, nodes, edges }, { dispatch, rejectWithValue }) => {
    console.log(
      `saveNodemapData Thunk: Calling /savenodemap API for ID ${nodemapId} with nodes and edges data...`
    );
    try {
      const dataToSave = {
        nodemap_id: nodemapId,
        nodes: nodes,
        edges: edges,
      };
      console.log("saveNodemapData Thunk: Data to send:", dataToSave);

      const response = await callServer("savenodemap", dataToSave, "POST");
      console.log("saveNodemapData Thunk: API response received:", response);

      if (response.status >= 200 && response.status < 300) {
        const data = response.data;
        console.log(
          "saveNodemapData Thunk: Nodemap data saved successfully:",
          data
        );
        // You might want to update the specific nodemap in the list if the response
        // includes updated metadata (though not the nodes/edges themselves).
        return data; // Return the success message/data
      } else {
        console.error(
          "saveNodemapData Thunk: API call failed with status:",
          response.status
        );
        return rejectWithValue(
          response.data?.error ||
            `Failed to save nodemap data. Status: ${response.status}`
        );
      }
    } catch (error) {
      console.error("saveNodemapData Thunk: Error during API call:", error);
      return rejectWithValue(
        error.message || "Network error during nodemap data save"
      );
    }
  }
);
// --- End Async Thunk for saving nodemap data ---

// --- Async Thunk for fetching a single nodemap's data (nodes and edges) ---
const fetchNodemapData = createAsyncThunk(
  "nodemaps/fetchNodemapData",
  async (nodemapId, { dispatch, rejectWithValue }) => {
    console.log(
      `fetchNodemapData Thunk: Calling /getnodemapdata API for ID ${nodemapId}...`
    );
    try {
      // The backend endpoint /getnodemapdata now expects the ID in the request body (POST)
      const dataToSend = { id: nodemapId };
      console.log("fetchNodemapData Thunk: Data to send:", dataToSend);

      // Use callServer with the correct endpoint type and the data payload
      const response = await callServer("getnodemapdata", dataToSend, "POST"); // Changed method to POST

      console.log("fetchNodemapData Thunk: API response received:", response);

      if (response.status >= 200 && response.status < 300) {
        const data = response.data;
        console.log(
          "fetchNodemapData Thunk: Nodemap data fetched successfully:",
          data
        );
        // The payload of this thunk will be the fetched nodemap data ({ nodes_data, edges_data, ... })
        return data;
      } else {
        console.error(
          "fetchNodemapData Thunk: API call failed with status:",
          response.status
        );
        return rejectWithValue(
          response.data?.error ||
            `Failed to fetch nodemap data for ID ${nodemapId}. Status: ${response.status}`
        );
      }
    } catch (error) {
      console.error("fetchNodemapData Thunk: Error during API call:", error);
      return rejectWithValue(
        error.message ||
          `Network error during nodemap data fetch for ID ${nodemapId}`
      );
    }
  }
);
// --- End Async Thunk for fetching a single nodemap's data ---

// --- Async Thunk for toggling favorite status ---
const toggleNodemapFavorite = createAsyncThunk(
  "nodemaps/toggleNodemapFavorite",
  async (nodemapId, { dispatch, rejectWithValue }) => {
    // Pass the endpoint type ("togglenodemapfavorite") and the data payload separately
    console.log(
      `toggleNodemapFavorite Thunk: Calling /togglenodemapfavorite API for ID ${nodemapsId}...`
    ); // Corrected variable name
    try {
      // Pass the nodemapId in the data payload as an object with an 'id' key
      const dataToSend = { id: nodemapId };
      console.log("toggleNodemapFavorite Thunk: Data to send:", dataToSend);

      // Use callServer with the correct endpoint type and the data payload
      // The api.js configuration for "togglenodemapfavorite" expects { id: ... } in the body
      const response = await callServer(
        "togglenodemapfavorite",
        dataToSend,
        "POST"
      );
      console.log(
        "toggleNodemapFavorite Thunk: API response received:",
        response
      );

      if (response.status >= 200 && response.status < 300) {
        const data = response.data;
        console.log(
          "toggleNodemapFavorite Thunk: Favorite status toggled successfully:",
          data
        );
        // The payload will contain the updated is_favorite status and nodemap_id
        return data;
      } else {
        console.error(
          "toggleNodemapFavorite Thunk: API call failed with status:",
          response.status
        );
        return rejectWithValue(
          response.data?.error ||
            `Failed to toggle favorite status for ID ${nodemapId}. Status: ${response.status}`
        );
      }
    } catch (error) {
      console.error(
        "toggleNodemapFavorite Thunk: Error during API call:",
        error
      );
      return rejectWithValue(
        error.message ||
          `Network error during favorite toggle for ID ${nodemapId}`
      );
    }
  }
);
// --- End Async Thunk for toggling favorite status ---

export const nodemapsSlice = createSlice({
  name: "nodemaps",
  initialState,
  reducers: {
    setNodemaps: (state, action) => {
      if (Array.isArray(action.payload)) {
        state.nodemaps = action.payload;
      } else {
        console.error(
          "setNodemaps Reducer: Invalid payload received, expected an array.",
          action.payload
        );
        state.nodemaps = [];
      }
    },
    addNodemap: (state, action) => {
      if (action.payload && typeof action.payload === "object") {
        state.nodemaps.push(action.payload);
      } else {
        console.error(
          "addNodemap Reducer: Invalid payload received, cannot add to nodemaps array.",
          action.payload
        );
      }
    },
    // Reducer to set the current nodemap data (nodes and edges)
    setCurrentNodemapData: (state, action) => {
      // Assuming payload is the data object returned by fetchNodemapData thunk
      state.currentNodemapData = action.payload;
    },
    // Reducer to clear the current nodemap data (e.g., when switching away from map view)
    clearCurrentNodemapData: (state) => {
      state.currentNodemapData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNodemap.pending, (state) => {
        state.creationStatus = "loading";
        state.creationError = null;
      })
      .addCase(createNodemap.fulfilled, (state, action) => {
        state.creationStatus = "succeeded";
        state.creationError = null;
      })
      .addCase(createNodemap.rejected, (state, action) => {
        state.creationStatus = "failed";
        state.creationError = action.payload || action.error.message;
      })
      .addCase(fetchNodemaps.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchNodemaps.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(fetchNodemaps.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
        state.nodemaps = [];
      })
      // --- Handle states for saveNodemapData thunk ---
      .addCase(saveNodemapData.pending, (state) => {
        state.saveStatus = "loading";
        state.saveError = null;
      })
      .addCase(saveNodemapData.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        state.saveError = null;
        // Optionally update the nodemap in the list if needed
      })
      .addCase(saveNodemapData.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.saveError = action.payload || action.error.message;
      })
      // --- Handle states for fetchNodemapData thunk ---
      .addCase(fetchNodemapData.pending, (state) => {
        state.fetchSingleStatus = "loading";
        state.fetchSingleError = null;
        state.currentNodemapData = null; // Clear previous data while loading
        // --- Added: Reset saveStatus when fetching a new map ---
        state.saveStatus = "idle";
        state.saveError = null;
        // --- End Added ---
      })
      .addCase(fetchNodemapData.fulfilled, (state, action) => {
        state.fetchSingleStatus = "succeeded";
        state.fetchSingleError = null;
        state.currentNodemapData = action.payload; // Store the fetched data
      })
      .addCase(fetchNodemapData.rejected, (state, action) => {
        state.fetchSingleStatus = "failed";
        state.fetchSingleError = action.payload || action.error.message;
        state.currentNodemapData = null; // Clear data on failure
      })
      // --- Handle states for toggleNodemapFavorite thunk ---
      .addCase(toggleNodemapFavorite.pending, (state) => {
        state.toggleFavoriteStatus = "loading";
        state.toggleFavoriteError = null;
      })
      .addCase(toggleNodemapFavorite.fulfilled, (state, action) => {
        state.toggleFavoriteStatus = "succeeded";
        state.toggleFavoriteError = null;
        // Find the nodemap in the state array and update its is_favorite status
        const toggledNodemap = state.nodemaps.find(
          (nodemap) => nodemap.id === action.payload.nodemap_id
        );
        if (toggledNodemap) {
          toggledNodemap.is_favorite = action.payload.is_favorite;
        }
      })
      .addCase(toggleNodemapFavorite.rejected, (state, action) => {
        state.toggleFavoriteStatus = "failed";
        state.toggleFavoriteError = action.payload || action.error.message;
      });
    // --- End Handle states for toggleNodemapFavorite thunk ---
  },
  // --- End Extra Reducers ---
});

// Action creators are generated for each case reducer function
export const {
  setNodemaps,
  addNodemap,
  setCurrentNodemapData,
  clearCurrentNodemapData,
} = nodemapsSlice.actions; // Export new actions

// Export the async thunks
export {
  createNodemap,
  fetchNodemaps,
  saveNodemapData,
  fetchNodemapData,
  toggleNodemapFavorite,
}; // Export the new thunk

// The reducer itself
export default nodemapsSlice.reducer;
