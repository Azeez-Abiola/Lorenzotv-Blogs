import { useReducer, useCallback } from "react";

// This is the state initial data
const initialState = {
  isLoading: false,
  error: { hasError: false, message: "" },
  success: false,
};

// This is the function that will be dispatched whenever an action is dispatched.
const fetchReducer = (state, action) => {
  if (action.type === "LOADING") {
    return { ...state, isLoading: action.value };
  }
  if (action.type === "ERROR") {
    return { ...state, error: action.value };
  }
  if (action.type === "SUCCESS") {
    return { ...state, success: action.value };
  }
  return initialState;
};

const useFetch = () => {
  // Managing state
  const [fetchState, dispatchFn] = useReducer(fetchReducer, initialState);

  // A function to fetch data
  const fetchRequest = useCallback(
    async (requestConfig, getRequestData = (responseBody) => { }) => {
      dispatchFn({ type: "LOADING", value: true });
      dispatchFn({ type: "ERROR", value: { hasError: false, message: "" } });
      dispatchFn({ type: "SUCCESS", value: false });
      try {
        const headers = { ...requestConfig.headers };
        if (requestConfig.body) {
          headers["Content-Type"] = "application/json";
        }

        // Fetching data using the configuration provided
        const response = await fetch(requestConfig.url, {
          method: requestConfig.method ? requestConfig.method : "GET",
          body: requestConfig.body ? JSON.stringify(requestConfig.body) : null,
          headers: headers,
        });
        // Check if response is empty (e.g., 204 No Content)
        let responseBody = null;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          responseBody = await response.json();
        }
        // If the response is not ok, throw an error
        if (!response.ok) {
          const errorMessage = responseBody?.message || responseBody?.error || `Error: ${response.status} ${response.statusText}`;
          throw new Error(errorMessage);
        }
        dispatchFn({ type: "SUCCESS", value: true });

        // TODO: Handle responseBody
        getRequestData(responseBody);
      } catch (err) {
        console.log("Fetch Error:", err.message);

        // Handle expired token or unauthorized access
        if (err.message.toLowerCase().includes("expired") || err.message.toLowerCase().includes("401")) {
          // Clear authentication data
          document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          localStorage.removeItem("loggedInUser");

          // Optionally redirect to login if we are in an admin route
          if (window.location.pathname.startsWith('/admin')) {
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
          }
        }

        // If an error occured, set the error state
        dispatchFn({
          type: "ERROR",
          value: { hasError: true, message: err.message || "An error ocurred" },
        });
      }
      // After the request has been made, set the loading state to false
      dispatchFn({ type: "LOADING", value: false });
    },
    []
  );

  const clearError = () => {
    dispatchFn({
      type: "ERROR",
      value: {
        hasError: false,
        message: "",
      },
    });
  };

  // Destructuring the state
  const { isLoading, error, success } = fetchState;

  // Returning the state and the functions
  return { isLoading, error, success, fetchRequest, clearError };
};
export default useFetch;
