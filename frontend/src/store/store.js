import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/userSlice"; // Import the user reducer
import nodemapsReducer from "./features/nodeMapsSlice"; // Import the nodemaps reducer
import uiReducer from "./features/uiSlice"; // Import the UI reducer
import agentsReducer from "./features/agentsSlice"; // Import the agents reducer

export const store = configureStore({
  reducer: {
    // Add the imported reducers here
    user: userReducer,
    nodemaps: nodemapsReducer,
    ui: uiReducer, // Add the UI reducer under the 'ui' key
    agents: agentsReducer, // Add the agents reducer under the 'agents' key
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
// These are helpful for TypeScript, but good to have for documentation
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
