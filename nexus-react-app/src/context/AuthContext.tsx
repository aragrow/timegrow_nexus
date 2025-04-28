/**
 * Authentication Context.
 *
 * This file provides the AuthContext using React's Context API.
 * It manages the application's authentication state (JWT token, user data, loading status).
 * - It reads the token from Local Storage on initialization for persistence.
 * - It includes functions to log in (set token, fetch user) and log out (clear token, clear user).
 * - It provides a custom hook `useAuth` for easily accessing the context value in components.
 */
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from 'react';

// Define a basic interface for the user object fetched from the /users/me endpoint
interface User {
  id: number;
  name: string;
  // Add other user properties you might fetch (e.g., email, roles)
  // email: string;
  // roles: string[];
}

// Define the shape of the context value that will be provided
interface AuthContextType {
  token: string | null; // The JWT token received after login
  user: User | null; // The authenticated user object
  loadingUser: boolean; // True while checking for token and fetching initial user data
  login: (newToken: string) => void; // Function to call upon successful login
  logout: () => void; // Function to call to initiate logout
  // Add other state/functions related to authentication if needed
  // loginError: string | null; // Example: State for handling login errors globally
}

// 1. Create the Context with a default null value.
// Components trying to consume the context outside of a Provider will get null.
const AuthContext = createContext<AuthContextType | null>(null);

// 2. Create the AuthProvider Component.
// This component wraps the part of the application that needs access to the context.
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State to store the JWT token. Initialize by reading from Local Storage.
  const [token, setToken] = useState<string | null>(localStorage.getItem('wp_jwt_token') || null);
  // State to store the fetched user data. Initially null.
  const [user, setUser] = useState<User | null>(null);
  // State to indicate if the initial authentication check (reading token, fetching user) is in progress.
  const [loadingUser, setLoadingUser] = useState(true); // Start as true because we need to check for token/user

  // --- IMPORTANT: Replace with your actual local WordPress site URL ---
  const WP_API_URL = 'YOUR_WORDPRESS_SITE_URL';
  // ------------------------------------------------------------

  // Memoized function to fetch user data using the current token.
  // useCallback prevents this function from being recreated on every render unless dependencies change.
  const fetchUser = useCallback(async (currentToken: string) => {
     setLoadingUser(true); // Indicate that we are loading user data
     try {
       // Make a GET request to the WordPress REST API's user endpoint.
       // '/wp/v2/users/me' is a standard endpoint that returns info about the currently authenticated user.
       const response = await fetch(`${WP_API_URL}/wp-json/wp/v2/users/me`, {
         headers: {
           // Include the JWT token in the Authorization header.
           'Authorization': `Bearer ${currentToken}`,
           'Content-Type': 'application/json', // Although GET usually doesn't need this, it's harmless
         },
       });

       // Check if the API call was successful (status code 200-299).
       if (!response.ok) {
         // If the response indicates an error (e.g., 401 Unauthorized, 403 Forbidden),
         // the token might be invalid or expired. Log an error and indicate failure.
         console.error('Failed to fetch user data. Token might be invalid or expired.', response.status);
         // Return null to signal that the user data could not be fetched.
         return null;
       }

       // Parse the JSON response body.
       const userData = await response.json();

       // Map the received WordPress user data to our User interface structure.
       const mappedUser: User = {
           id: userData.id,
           name: userData.name || userData.slug, // Use 'name' if available, fallback to 'slug'
           // Add other fields if you extended the User interface and your API provides them
           // email: userData.email,
       };

       console.log('User data fetched successfully:', mappedUser);
       // Return the mapped user data.
       return mappedUser;

     } catch (err) {
       // Catch any network errors or issues during the fetch process.
       console.error('Error fetching user data:', err);
       // Return null to signal failure.
       return null;
     } finally {
       // The setLoadingUser(false) call is handled AFTER this promise resolves/rejects
       // in the useEffect hook, to ensure state updates are synchronized.
     }
  }, [WP_API_URL]); // fetchUser function depends only on the fixed WP_API_URL

  // useEffect hook to perform side effects after the component mounts or state/props change.
  // This effect runs to check for a token and fetch user data initially or whenever the token changes.
  useEffect(() => {
    console.log('Auth effect running. Current token:', token);
    if (token) {
       // If a token exists (either from initial load or after a successful login)
       // attempt to fetch the associated user's data.
       fetchUser(token)
         .then(fetchedUser => {
           // This .then block executes after the fetchUser promise resolves (successfully or not).
           if (fetchedUser) {
             // If fetchUser returned a user object (success), update the user state.
             setUser(fetchedUser);
           } else {
             // If fetchUser returned null (failure), the token is likely invalid.
             // Call logout to clear the token from storage and state.
             logout();
           }
           // In either case (success or failure to fetch user), we are done with the initial loading process.
           setLoadingUser(false);
         });
    } else {
      // If no token is found (either initially or after logout),
      // ensure user state is null and the loading process is finished.
      setUser(null);
      setLoadingUser(false);
      console.log('No token found. User is logged out.');
    }
  }, [token, fetchUser]); // Dependencies: Rerun this effect if 'token' or 'fetchUser' changes.

  // Function called by the login form upon successful authentication with the backend.
  const login = (newToken: string) => {
    console.log('Login function called with new token:', newToken);
    // Store the received token in Local Storage for persistence.
    // WARNING: Local Storage has security risks (XSS). For production, consider HttpOnly cookies.
    localStorage.setItem('wp_jwt_token', newToken);
    // Update the token state. This state change is a dependency of the useEffect hook above,
    // which will trigger the fetchUser logic to get the authenticated user's details.
    setToken(newToken);
  };

  // Function called to log the user out.
  const logout = () => {
    console.log('Logout function called.');
    // Remove the token from Local Storage.
    localStorage.removeItem('wp_jwt_token');
    // Clear the token state.
    setToken(null);
    // Clear the user state.
    setUser(null);
    // Note: Redirection after logout is handled by components consuming the context (e.g., PrivateRoute or DashboardPage).
  };

  // The value object that will be provided by the AuthContext.Provider.
  const contextValue: AuthContextType = {
    token,
    user,
    loadingUser,
    login,
    logout,
  };

  // The Provider component renders its children.
  // We conditionally render children only AFTER loadingUser is false.
  // This pattern ensures that the application content is only shown once
  // the initial authentication status (checking token, potentially fetching user) is determined.
  return (
    <AuthContext.Provider value={contextValue}>
      {/* Optionally display a loading indicator while loadingUser is true */}
      {loadingUser ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '20px' }}>
            Loading application...
        </div>
      ) : (
        children // Render the actual application content (App component in main.tsx)
      )}
    </AuthContext.Provider>
  );
};

// 3. Create a custom Hook to Consume the Context.
// This hook simplifies accessing the context value in functional components.
export const useAuth = () => {
  // useContext hook retrieves the current value of the AuthContext.
  const context = useContext(AuthContext);
  // If useAuth is called outside of an AuthProvider, context will be null (our default value).
  if (context === null) {
    // Throw an error to alert developers if the hook is used incorrectly.
    throw new Error('useAuth must be used within an AuthProvider');
  }
  // Return the context value (token, user, login, logout, etc.)
  return context;
};