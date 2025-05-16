import axios from "axios";

// Define your API base URL.
// It's a good practice to use environment variables for this in a real application.
const API_BASE_URL = "http://127.0.0.1:5001"; // Replace with your actual API base URL

// Create a new Axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL, // Corrected baseURL
  headers: {
    "Content-Type": "application/json",
    // We will add the Authorization header dynamically for protected routes
  },
  timeout: 10000, // Set a timeout for requests (e.g., 10 seconds)
});

// --- Axios Interceptor for adding JWT ---
// Add a request interceptor to add the JWT to the Authorization header
api.interceptors.request.use(
  (config) => {
    // Get the token from sessionStorage (as you indicated you are using it)
    const token = sessionStorage.getItem("token");

    // If the token exists, add it to the Authorization header
    // You might want to conditionally add this header only for protected routes
    if (token) {
      console.log("Token interceptor = ", token);
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

// --- End Axios Interceptor ---

// Define API endpoints configuration
const Endpoints = {
  register: {
    method: "POST",
    endpoint: "/auth/register",
    data: {
      required: ["username", "password", "email"],
      optional: [],
    },
  },
  login: {
    method: "POST",
    endpoint: "/auth/login",
    data: {
      required: ["emailOrUsername", "password"],
      optional: [],
    },
  },
  logout: {
    method: "POST",
    endpoint: "/auth/logout",
    data: {
      required: [],
      optional: [],
    },
  },
  user_data: {
    method: "GET",
    endpoint: "/auth/user_data",
    data: {
      required: [],
      optional: [],
    },
  },
  createmap: {
    method: "POST",
    endpoint: "/creation/createmap", // Matches the backend route
    data: {
      required: ["name", "goal", "description"], // Matches backend validation
      optional: [],
    },
  },
  createagent: {
    method: "POST",
    endpoint: "/creation/createagent", // Assuming this endpoint for creating agents
    data: {
      required: ["name", "type", "model", "system_prompt"], // Example required fields
      optional: [],
    },
  },
  // --- Add savenodemap endpoint ---
  savenodemap: {
    method: "POST",
    endpoint: "/creation/savenodemap", // Matches the backend route path
    data: {
      required: ["nodemap_id", "nodes", "edges"], // Matches backend expected fields
      optional: [],
    },
  },
  // --- End savenodemap endpoint ---
  // --- Update togglenodemapfavorite endpoint to expect ID in data ---
  togglenodemapfavorite: {
    method: "POST",
    endpoint: "/creation/togglenodemapfavorite", // Endpoint path remains the same
    data: {
      required: ["id"], // Require 'id' field in the data payload
      optional: [],
    },
  },
  // --- End update togglenodemapfavorite endpoint ---
  // --- Endpoint to get a single Node Map's data by ID (expects ID in body) ---
  getnodemapdata: {
    method: "POST", // Changed method to POST
    endpoint: "/creation/getnodemapdata", // Base path without ID
    data: {
      required: ["id"], // Require 'id' field in the data payload
      optional: [],
    },
  },
  // --- End Endpoints ---
};

/**
 * Calls the server API with the specified endpoint type and data.
 * Includes validation for required fields based on the Endpoints configuration.
 * Returns the full Axios response object on success (2xx status)
 * or the error.response object on non-2xx status codes.
 * @param {string} type - The type of the endpoint (key from Endpoints object).
 * @param {object} [data=null] - The data payload for the request (e.g., form data).
 * @param {string} [method='POST'] - The HTTP method (defaults to POST if not specified in endpoint config).
 * @returns {Promise<object>} - A promise that resolves with the Axios response object
 * or the error.response object.
 * @throws {Error} - Throws an error only for issues before the request is sent
 * (e.g., invalid endpoint type, missing required fields).
 */
const callServer = async (type = "", data = null, method = "POST") => {
  console.log("callServer - START");
  console.log("callServer - Received type:", type);
  console.log("callServer - Received data:", data);
  console.log("callServer - Received method:", method);

  const endpointConfig = Endpoints[type];
  console.log("callServer - endpointConfig:", endpointConfig);

  // Check if the endpoint type exists
  if (!endpointConfig) {
    console.error(`callServer Error: Endpoint type "${type}" not found.`);
    throw new Error(`Invalid endpoint type: ${type}`);
  }

  // Prioritize method from endpointConfig if available, otherwise use the passed method or default
  const requestMethod = endpointConfig.method || method;
  console.log("callServer - Determined request method:", requestMethod);

  const requiredFields = endpointConfig.data?.required || []; // Use optional chaining for data

  // --- Validation for required fields ---
  // Only validate required fields if data is expected in the body
  if (requiredFields.length > 0 && data !== null && typeof data === "object") {
    for (const field of requiredFields) {
      if (
        data[field] === null ||
        data[field] === undefined ||
        data[field] === ""
      ) {
        console.error(
          `API Error: Required field "${field}" is missing or invalid for endpoint: ${API_BASE_URL}${endpointConfig.endpoint}".`
        );
        throw new Error(`Missing required field: ${field}`);
      }
      // Optional: Add more specific validation here
    }
  } else if (requiredFields.length > 0 && data === null) {
    // If required fields are defined but no data object is provided for a method that expects one
    if (["post", "put", "patch"].includes(requestMethod.toLowerCase())) {
      console.error(
        `API Error: Data object is required for endpoint: ${API_BASE_URL}${endpointConfig.endpoint}".`
      );
      throw new Error(
        `Data object is required for endpoint: ${API_BASE_URL}${endpointConfig.endpoint}".`
      );
    }
  }
  // --- End of Validation ---

  try {
    const { endpoint } = endpointConfig; // Get endpoint path from config
    console.log("callServer - Using method:", requestMethod);
    console.log("callServer - Using endpoint path:", endpoint);
    console.log("callServer - Data to send:", data);

    // Use the determined requestMethod
    // This simplified call might still cause issues with methods that don't expect a body
    const response = await api[requestMethod.toLowerCase()](endpoint, data);

    // If the request is successful (2xx status), return the full response
    console.log("callServer - API call successful, returning response.");
    console.log("callServer - Response status:", response.status);
    console.log("callServer - Response data:", response.data);

    // Manually add 'ok' property to the response object for consistency if needed by calling code
    response.ok = response.status >= 200 && response.status < 300;

    return response;
  } catch (error) {
    // If an error occurs (e.g., non-2xx status, network error)
    console.error("API Error in callServer:", error);

    // Check if the error has a response property (meaning it was a server response, even if non-2xx)
    if (error.response) {
      // Return the response object from the error
      console.log("callServer - Error has response, returning error.response.");
      // Also add the 'ok' property to the error response
      error.response.ok =
        error.response.status >= 200 && error.response.status < 300;
      return error.response;
    } else {
      // If there's no response property (e.g., network error, request setup issue),
      // Re-throw the original error so the calling code's catch block handles it.
      console.error("callServer - Error has no response, re-throwing error.");
      throw error;
    }
  }
};

export { callServer };
