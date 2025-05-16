import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentView: "Authentication", // Initial view state, matching your App.jsx initial state
  selectedNodemapId: null, // Add state to track the ID of the currently selected nodemap
  // You could add other UI-related states here later, e.g., modal status, sidebar visibility
};

export const uiSlice = createSlice({
  name: "ui", // A name for this slice
  initialState, // The initial state
  reducers: {
    // Reducer to set the current view
    setView: (state, action) => {
      state.currentView = action.payload; // Assuming payload is the view name string
    },
    // New reducer to set the selected nodemap ID
    setSelectedNodemap: (state, action) => {
      state.selectedNodemapId = action.payload; // Assuming payload is the nodemap ID
    },
    // You might add other UI reducers here later
  },
});

// Action creators are generated for each case reducer function
export const { setView, setSelectedNodemap } = uiSlice.actions; // Export the new action creator

// The reducer itself
export default uiSlice.reducer;
