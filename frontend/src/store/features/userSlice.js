import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"; // Import createAsyncThunk
import { callServer } from "../../utils/api"; // Import the callServer utility
import { setView } from "./uiSlice"; // Import setView action creator for navigation
import { setNodemaps } from "./nodeMapsSlice"; // Import setNodemaps action creator (for login/fetch thunks)
import { setAgents } from "./agentsSlice"; // Import setAgents action creator

// Define the initial state for the user slice
const initialState = {
  user: null, // Will store user data if logged in
  loggedIn: false, // Boolean to indicate authentication status
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed' - for fetchUserData
  error: null, // Stores error message for fetchUserData
  registrationStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed' - for registerUser
  registrationError: null, // Stores error message for registration
  loginStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed' - for loginUser
  loginError: null, // Stores error message for loginUser
  logoutStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed' - for logoutUser
  logoutError: null, // Stores error message for logoutUser
};

// --- Async Thunk for fetching user data ---
// createAsyncThunk generates pending, fulfilled, and rejected action types
const fetchUserData = createAsyncThunk(
  "user/fetchUserData", // Action type prefix
  async (_, { dispatch, rejectWithValue }) => {
    // Thunk payload creator function
    console.log("fetchUserData Thunk: Checking for token in sessionStorage...");
    const token = sessionStorage.getItem("token");

    if (!token) {
      console.log("fetchUserData Thunk: No token found. Skipping API call.");
      // If no token, we don't need to call the API, just resolve the thunk
      return null; // Resolve with null indicating no user data fetched
    }

    console.log("fetchUserData Thunk: Token found. Calling /user_data API...");
    try {
      // Use callServer to fetch user data
      const response = await callServer("user_data", null, "GET");
      console.log("fetchUserData Thunk: API response received:", response);

      if (response.status >= 200 && response.status < 300) {
        const data = response.data;
        console.log(
          "fetchUserData Thunk: User data fetched successfully:",
          data
        );
        // Dispatch setNodemaps here since user data fetch also returns nodemaps
        if (data.nodemaps) {
          dispatch(setNodemaps(data.nodemaps));
          console.log("fetchUserData Thunk: setNodemaps action dispatched.");
        }
        // Dispatch setAgents here since user data fetch also returns agents
        if (data.agents) {
          console.log(
            "fetchUserData Thunk: Agents data received:",
            data.agents
          ); // <-- Added log for agents data
          dispatch(setAgents(data.agents));
          console.log("fetchUserData Thunk: setAgents action dispatched.");
        } else {
          console.log(
            "fetchUserData Thunk: No agents data received in response."
          ); // <-- Added log if no agents data
        }

        // The fulfilled action will be dispatched automatically with 'data' as payload
        return data; // Return the data to be the payload of the fulfilled action
      } else {
        console.error(
          "fetchUserData Thunk: API call failed with status:",
          response.status
        );
        // Use rejectWithValue to return a custom error payload
        // This will trigger the rejected action
        return rejectWithValue(
          response.data?.error ||
            `Failed to fetch user data. Status: ${response.status}`
        );
      }
    } catch (error) {
      console.error("fetchUserData Thunk: Error during API call:", error);
      // Use rejectWithValue for errors that prevent a response (e.g., network errors)
      return rejectWithValue(error.message || "Network error");
    }
  }
);
// --- End Async Thunk ---

// --- Async Thunk for registering a user ---
const registerUser = createAsyncThunk(
  "user/registerUser", // Action type prefix
  async (userData, { dispatch, rejectWithValue }) => {
    // Thunk payload creator function receives user data
    console.log(
      "registerUser Thunk: Calling /register API with data:",
      userData
    );
    try {
      // Use callServer to register the user
      const response = await callServer("register", userData, "POST");
      console.log("registerUser Thunk: API response received:", response);

      if (response.status >= 200 && response.status < 300) {
        const data = response.data;
        console.log("registerUser Thunk: Registration successful:", data);
        // If registration is successful, the backend might return user data or a success message.
        // We might not automatically log the user in after registration,
        // but rather show a success message and redirect to login.
        // We can dispatch setView to 'Authentication' after successful registration.
        dispatch(setView("Authentication")); // Navigate to Authentication view
        console.log(
          "registerUser Thunk: setView action dispatched to Authentication."
        );

        return data; // Return the data to be the payload of the fulfilled action
      } else {
        console.error(
          "registerUser Thunk: API call failed with status:",
          response.status
        );
        // Use rejectWithValue to return a custom error payload
        return rejectWithValue(
          response.data?.error ||
            `Registration failed. Status: ${response.status}`
        );
      }
    } catch (error) {
      console.error("registerUser Thunk: Error during API call:", error);
      // Use rejectWithValue for errors that prevent a response (e.g., network errors)
      return rejectWithValue(
        error.message || "Network error during registration"
      );
    }
  }
);
// --- End Async Thunk for registering a user ---

// --- Async Thunk for logging in a user ---
const loginUser = createAsyncThunk(
  "user/loginUser", // Action type prefix
  async (credentials, { dispatch, rejectWithValue }) => {
    // Thunk payload creator function receives login credentials
    console.log(
      "loginUser Thunk: Calling /login API with credentials:",
      credentials
    );
    try {
      // Use callServer to log in the user
      const response = await callServer("login", credentials, "POST");
      console.log("loginUser Thunk: API response received:", response);

      if (response.status >= 200 && response.status < 300) {
        const data = response.data;
        console.log("loginUser Thunk: Login successful:", data);
        // Assuming the login response includes an access_token, user data, nodemaps, and agents
        if (data.access_token) {
          console.log(
            "loginUser Thunk: Access token found. Storing token and dispatching setUser, setNodemaps, setAgents, and setView."
          ); // Debug log
          sessionStorage.setItem("token", data.access_token); // Store token in sessionStorage
          // Dispatch action to set user data and loggedIn state in Redux
          dispatch(setUser({ user: data.user })); // Assuming data.user exists
          console.log("loginUser Thunk: setUser action dispatched."); // Debug log

          // Dispatch setNodemaps here since login also returns nodemaps
          if (data.nodemaps) {
            dispatch(setNodemaps(data.nodemaps));
            console.log("loginUser Thunk: setNodemaps action dispatched.");
          }
          // Dispatch setAgents here since login also returns agents
          if (data.agents) {
            console.log("loginUser Thunk: Agents data received:", data.agents); // <-- Added log for agents data
            dispatch(setAgents(data.agents));
            console.log("loginUser Thunk: setAgents action dispatched.");
          } else {
            console.log(
              "loginUser Thunk: No agents data received in response."
            ); // <-- Added log if no agents data
          }

          // After successful login, navigate to a default view by dispatching setView
          dispatch(setView("Creation")); // Navigate to Creation view
          console.log(
            "loginUser Thunk: setView action dispatched to Creation."
          );

          return data; // Return the data to be the payload of the fulfilled action
        } else {
          console.warn(
            "loginUser Thunk: Successful response but no access token found."
          ); // Corrected log message
          // Handle cases where login is successful but no token is returned
          // This might indicate a server issue, treat as a soft failure or show warning
          return rejectWithValue(
            "Login successful but no access token received."
          );
        }
      } else {
        console.error(
          "loginUser Thunk: API call failed with status:",
          response.status
        );
        // Use rejectWithValue to return a custom error payload
        return rejectWithValue(
          response.data?.error || `Login failed. Status: ${response.status}`
        );
      }
    } catch (error) {
      console.error("loginUser Thunk: Error during API call:", error);
      // Use rejectWithValue for errors that prevent a response (e.g., network errors)
      return rejectWithValue(error.message || "Network error during login");
    }
  }
);
// --- End Async Thunk for logging in a user ---

// --- Async Thunk for logging out a user ---
const logoutUser = createAsyncThunk(
  "user/logoutUser", // Action type prefix
  async (_, { dispatch, rejectWithValue }) => {
    // Thunk payload creator function (no payload needed for logout)
    console.log("logoutUser Thunk: Calling /logout API...");
    try {
      // Use callServer to inform the backend about logout
      // The backend might invalidate the token or clear session data
      const response = await callServer("logout", null, "POST");
      console.log("logoutUser Thunk: API response received:", response);

      // Even if the backend returns a non-2xx status, we might still want
      // to clear the client-side state and token. However, a successful
      // 2xx response confirms the backend processed the logout.
      if (response.status >= 200 && response.status < 300) {
        console.log("logoutUser Thunk: Backend logout successful.");
        // Dispatch the regular logout action to clear client-side state and token
        dispatch(logout());
        console.log("logoutUser Thunk: Client-side logout action dispatched.");
        // Navigate to the Authentication view after logout
        dispatch(setView("Authentication"));
        console.log(
          "logoutUser Thunk: setView action dispatched to Authentication."
        );

        return response.data; // Return response data on success
      } else {
        console.warn(
          "logoutUser Thunk: Backend logout returned non-2xx status:",
          response.status
        );
        // Even on non-2xx, we should probably still clear client-side state
        dispatch(logout());
        console.log(
          "logoutUser Thunk: Client-side logout action dispatched on non-2xx status."
        );
        dispatch(setView("Authentication"));
        console.log(
          "logoutUser Thunk: setView action dispatched to Authentication on non-2xx status."
        );
        // Reject with a warning message
        return rejectWithValue(
          response.data?.error ||
            `Backend logout failed with status: ${response.status}`
        );
      }
    } catch (error) {
      console.error("logoutUser Thunk: Error during API call:", error);
      // On network error during logout, still clear client-side state
      dispatch(logout());
      console.log(
        "logoutUser Thunk: Client-side logout action dispatched on network error."
      );
      dispatch(setView("Authentication"));
      console.log(
        "logoutUser Thunk: setView action dispatched to Authentication on network error."
      );
      // Reject with the error message
      return rejectWithValue(error.message || "Network error during logout");
    }
  }
);
// --- End Async Thunk for logging out a user ---

export const userSlice = createSlice({
  name: "user", // A name for this slice, used in action types
  initialState, // The initial state for the reducer
  reducers: {
    // Reducer to set user data and loggedIn status upon successful login/auth check
    // This reducer will still be used, potentially by a login thunk later
    setUser: (state, action) => {
      state.user = action.payload.user; // Assuming payload has a 'user' property
      state.loggedIn = true;
      state.status = "succeeded"; // Set status to succeeded on manual set (e.e.g., after login)
      state.error = null; // Clear any previous errors
      state.loginStatus = "succeeded"; // Also set login status to succeeded
      state.loginError = null; // Clear login errors
      // registrationStatus and registrationError remain unchanged on login
    },
    // Reducer to clear user data and set loggedIn to false upon logout
    // This reducer is now dispatched by the logoutUser thunk
    logout: (state) => {
      state.user = null;
      state.loggedIn = false;
      state.status = "idle"; // Reset status on logout
      state.error = null; // Clear any errors
      state.loginStatus = "idle"; // Reset login status
      state.loginError = null; // Clear login errors
      state.registrationStatus = "idle"; // Reset registration status
      state.registrationError = null; // Clear registration errors
      sessionStorage.removeItem("token"); // Clear token from sessionStorage
    },
    // You might add other reducers here later, e.e.g., updateUserProfile
  },
  // --- Extra Reducers for handling Async Thunk actions ---
  extraReducers: (builder) => {
    builder
      // Handle the pending state of fetchUserData
      .addCase(fetchUserData.pending, (state) => {
        console.log("fetchUserData Thunk: Pending...");
        state.status = "loading";
        state.error = null; // Clear previous errors on new request
      })
      // Handle the fulfilled state of fetchUserData
      .addCase(fetchUserData.fulfilled, (state, action) => {
        console.log("fetchUserData Thunk: Fulfilled. Payload:", action.payload);
        state.status = "succeeded";
        // If the thunk returned data (meaning a token was found and user data fetched)
        if (action.payload) {
          state.user = action.payload.user; // Assuming payload has user data
          state.loggedIn = true;
          // Note: setNodemaps and setAgents are now dispatched within the thunk itself
        } else {
          // If payload is null, it means no token was found
          state.user = null;
          state.loggedIn = false;
        }
        state.error = null; // Clear any errors on success
      })
      // Handle the rejected state of fetchUserData
      .addCase(fetchUserData.rejected, (state, action) => {
        console.error(
          "fetchUserData Thunk: Rejected. Error:",
          action.payload || action.error.message
        );
        state.status = "failed";
        state.error = action.payload || action.error.message; // Store the error message
        state.user = null; // Ensure user is null on failed fetch
        state.loggedIn = false; // Ensure loggedIn is false on failed fetch
        sessionStorage.removeItem("token"); // Clear token on failed fetch (token might be invalid/expired)
        // Dispatch setView to Authentication on failed fetch - Handled in App.jsx useEffect
        // dispatch(setView("Authentication")); // Removed dispatch from reducer
        console.log(
          "fetchUserData Thunk: setView action dispatched to Authentication on rejection."
        ); // This log is now misleading
      })
      // --- Handle the pending state of registerUser ---
      .addCase(registerUser.pending, (state) => {
        console.log("registerUser Thunk: Pending...");
        state.registrationStatus = "loading";
        state.registrationError = null; // Clear previous errors on new request
      })
      // --- Handle the fulfilled state of registerUser ---
      .addCase(registerUser.fulfilled, (state, action) => {
        console.log("registerUser Thunk: Fulfilled. Payload:", action.payload);
        state.registrationStatus = "succeeded";
        state.registrationError = null; // Clear any errors on success
        // Note: We don't set user/loggedIn state here as registration might not auto-login
        // Navigation to login view is handled within the thunk itself
      })
      // --- Handle the rejected state of registerUser ---
      .addCase(registerUser.rejected, (state, action) => {
        console.error(
          "registerUser Thunk: Rejected. Error:",
          action.payload || action.error.message
        );
        state.registrationStatus = "failed";
        state.registrationError = action.payload || action.error.message; // Store the error message
        // We don't change user/loggedIn state on registration failure
      })
      // --- Handle the pending state of loginUser ---
      .addCase(loginUser.pending, (state) => {
        console.log("loginUser Thunk: Pending...");
        state.loginStatus = "loading";
        state.loginError = null; // Clear previous errors on new request
      })
      // --- Handle the fulfilled state of loginUser ---
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log("loginUser Thunk: Fulfilled. Payload:", action.payload);
        state.loginStatus = "succeeded";
        state.loginError = null; // Clear any errors on success
        // User and loggedIn state are set by dispatching setUser within the thunk
        // Navigation to Creation view is handled within the thunk
      })
      // --- Handle the rejected state of loginUser ---
      .addCase(loginUser.rejected, (state, action) => {
        console.error(
          "loginUser Thunk: Rejected. Error:",
          action.payload || action.error.message
        );
        state.loginStatus = "failed";
        state.loginError = action.payload || action.error.message; // Store the error message
        state.user = null; // Ensure user is null on failed login
        state.loggedIn = false; // Ensure loggedIn is false on failed login
        sessionStorage.removeItem("token"); // Clear token on failed login
        // Navigation to Authentication view on failed login is handled in the thunk
      })
      // --- Handle the pending state of logoutUser ---
      .addCase(logoutUser.pending, (state) => {
        console.log("logoutUser Thunk: Pending...");
        state.logoutStatus = "loading";
        state.logoutError = null; // Clear previous errors on new request
      })
      // --- Handle the fulfilled state of logoutUser ---
      .addCase(logoutUser.fulfilled, (state, action) => {
        console.log("logoutUser Thunk: Fulfilled. Payload:", action.payload);
        state.logoutStatus = "succeeded";
        state.logoutError = null; // Clear any errors on success
        // Client-side state clearing and navigation are handled by dispatching `logout` and `setView` within the thunk
      })
      // --- Handle the rejected state of logoutUser ---
      .addCase(logoutUser.rejected, (state, action) => {
        console.error(
          "logoutUser Thunk: Rejected. Error:",
          action.payload || action.error.message
        );
        state.logoutStatus = "failed";
        state.logoutError = action.payload || action.error.message; // Store the error message
        // Client-side state clearing and navigation are handled by dispatching `logout` and `setView` within the thunk
      });
  },
  // --- End Extra Reducers ---
});

// Action creators are generated for each case reducer function
export const { setUser, logout } = userSlice.actions;

// Export the async thunks
export { fetchUserData, registerUser, loginUser, logoutUser }; // Export the new logoutUser thunk

// The reducer itself
export default userSlice.reducer;
