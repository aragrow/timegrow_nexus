// src/hooks/useApi.ts
/**
 * Custom Hook for Authenticated API Calls.
 *
 * This hook provides a memoized function `apiFetch` to make requests
 * to the custom WordPress REST API endpoints.
 * - It correctly handles Header management using the browser's Headers API.
 * - It automatically includes the JWT token from the AuthContext in the Authorization header.
 * - It handles basic error checking, including logging out the user if a 401/403 error occurs.
 * - It ensures the correct Content-Type header is sent for JSON bodies.
 */
import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

// Define a basic interface for the return value of the hook
interface UseApi {
  // apiFetch function signature: takes endpoint string and optional fetch options, returns a Promise
  // Promise<any> is used for flexibility, but ideally you'd type the response based on the endpoint
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<any>;
  // You could add more specific functions here later, e.g.:
  // getCompanies: () => Promise<Company[]>;
  // createCompany: (data: CompanyFormData) => Promise<Company>;
}

// --- IMPORTANT: Replace with your actual local WordPress site URL ---
const WP_API_URL = 'http://localhost:10003'; // Ensure this is correct
// ------------------------------------------------------------

/**
 * Custom hook to facilitate making authenticated requests to custom WordPress REST API endpoints.
 * @returns {UseApi} An object containing the apiFetch function.
 */
const useApi = (): UseApi => {
  // Get the JWT token and the logout function from the AuthContext
  const { token, logout } = useAuth();

  // Use useCallback to memoize the apiFetch function.
  // This prevents unnecessary re-creations of the function unless its dependencies change.
  const apiFetch = useCallback(
    async (endpoint: string, options: RequestInit = {}): Promise<any> => {
      // Construct the full API URL.
      // Assumes your custom endpoints are under the 'nexus/v1' namespace.
      const url = `${WP_API_URL}/wp-json/nexus/v1/${endpoint}`;

      // --- Use the Headers API for robust header management ---
      // Initialize a new Headers object, potentially populating it with headers from the options.
      const headers = new Headers(options.headers);

      // Automatically add the Authorization header if a token exists.
      // Use the .set() method of the Headers object.
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      // Set Content-Type for requests that typically have a body (POST, PUT, PATCH, DELETE).
      // Check if the Content-Type header is already set (case-insensitive) before setting it.
      if (options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method.toUpperCase())) {
          if (!headers.has('Content-Type') && !headers.has('content-type')) {
            headers.set('Content-Type', 'application/json');
          }
      }


      try {
        // Perform the fetch request.
        const response = await fetch(url, {
          ...options, // Spread any other options (method, body, cache, etc.)
          headers: headers, // Pass the Headers object here
        });

        // Check for authentication/permissions errors (401 Unauthorized, 403 Forbidden).
        // If these status codes are received, it likely means the token is invalid or insufficient permissions.
        if (response.status === 401 || response.status === 403) {
          console.error('API call failed due to authentication/permissions error. Status:', response.status);
          // Automatically log out the user, as their authentication is no longer valid for this action.
          logout();
          // Throw an error to stop further processing and let calling components handle the failure.
          throw new Error(`Authentication failed (${response.status}).`);
        }

        // Check for other HTTP errors (status codes outside 200-299 range).
        if (!response.ok) {
             // Attempt to parse the response body to get a detailed error message from the API.
             // Use response.text() and JSON.parse for better error handling than just response.json()
             // in case the server returns non-JSON error messages.
            const errorBody = await response.text();
            try {
                const errorData = JSON.parse(errorBody);
                console.error(`API Error (${response.status}):`, errorData);
                // Throw an error using the API's message or status text.
                throw new Error(errorData.message || response.statusText || 'API request failed');
            } catch (jsonError) {
                // If the body wasn't JSON, just throw a generic error with status text.
                console.error(`API Error (${response.status}):`, errorBody);
                throw new Error(response.statusText || 'API request failed (Non-JSON error)');
            }
        }

        // If the response is OK, parse the JSON body and return the data.
        const data = await response.json();
        return data;

      } catch (error) {
        // Catch any network errors (e.g., server unreachable) or errors thrown above.
        console.error('Error during API fetch:', error);
        // Re-throw the error so the component that called apiFetch can handle it (e.g., display an error message to the user).
        throw error;
      }
    },
    [token, logout, WP_API_URL] // Dependencies: apiFetch depends on the token, logout function, and base API URL.
  );

  // Return the apiFetch function and any other helpers provided by this hook.
  return { apiFetch };
};

export default useApi;