/**
 * Login Form Component.
 *
 * This component renders the UI for the user login form.
 * - It manages the state for username and password input fields.
 * - It handles the form submission, sending credentials to the WordPress JWT endpoint.
 * - It uses the useAuth hook to call the `login` function from the AuthContext upon successful authentication.
 * - It uses react-router-dom's `useNavigate` to redirect the user after login or if already logged in.
 */
import React, { useState, useEffect } from 'react'; // Import useEffect
import { useAuth } from '../context/AuthContext'; // Import useAuth hook to access login function and user state
import { useNavigate } from 'react-router-dom'; // Import useNavigate for programmatic navigation

function LoginForm() {
  // State hooks for managing the form inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // State hook for displaying any error messages returned from the login attempt
  const [error, setError] = useState<string | null>(null);
  // State hook for showing a loading indicator while the login request is in progress
  const [loading, setLoading] = useState(false);

  // Access the login function and the current user state from the AuthContext
  const { login, user, loadingUser } = useAuth(); // Also get user and loadingUser

  // Get the navigate function from react-router-dom for redirection
  const navigate = useNavigate();

  // useEffect hook to handle redirection if the user is already authenticated.
  // This runs when the component mounts or when user/loadingUser state changes.
  useEffect(() => {
    // Only attempt to redirect if we are NOT currently checking auth status
    // and if the user object exists (meaning they are logged in).
    if (!loadingUser && user) {
      console.log('User detected in LoginForm, redirecting to dashboard.');
      // Redirect to the dashboard page.
      // 'replace: true' replaces the current entry in the browser history.
      navigate('/dashboard', { replace: true });
    }
     // Note: navigate is stable, but adding it as a dependency is standard practice in newer React/linters
  }, [user, loadingUser, navigate]); // Dependencies: Rerun effect if user, loadingUser, or navigate changes.

  // If user is already logged in or loading auth state, the useEffect will handle redirection.
  // We return null here to prevent rendering the form while redirection is pending or user exists.
  if (user || loadingUser) {
     return null; // Or a small loading indicator if redirect isn't instant
  }


  // --- IMPORTANT: Replace with your actual local WordPress site URL ---
  const WP_API_URL = 'YOUR_WORDPRESS_SITE_URL';
  // ------------------------------------------------------------

  /**
   * Handles the form submission event.
   * Sends the username and password to the WordPress JWT authentication endpoint.
   * Calls the login function from AuthContext on success.
   * Displays errors on failure.
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent the browser's default full-page form submission (reloads page)

    setError(null); // Clear any previous error messages
    setLoading(true); // Set the loading state to true to show indicator and disable form

    // The full URL for the JWT authentication endpoint provided by the plugin
    const loginUrl = `${WP_API_URL}/wp-json/jwt-auth/v1/token`;

    try {
      // Use the browser's built-in fetch API to send a POST request
      const response = await fetch(loginUrl, {
        method: 'POST', // Specify the HTTP method
        headers: {
          'Content-Type': 'application/json', // Indicate that the request body is in JSON format
        },
        // Convert the JavaScript object containing credentials into a JSON string for the request body
        body: JSON.stringify({ username, password }),
      });

      // Check if the HTTP status code of the response indicates success (status code 200-299)
      if (!response.ok) {
        // If the response is not OK, try to parse the error message from the response body
        // This assumes the WordPress API returns error details in JSON format
        const errorData = await response.json();
        // Throw a new Error with a specific message from the API or a default one
        throw new Error(errorData.message || 'Login failed. Please check your credentials.');
      }

      // If the response is OK, parse the JSON body to extract the token
      const data = await response.json();
      const receivedToken = data.token; // The JWT token returned by the successful API call

      // Call the login function provided by the AuthContext.
      // This function will store the token and update the application's authentication state,
      // which will in turn trigger the redirection to the dashboard via the useEffect hook.
      login(receivedToken);

      // Clear the form fields after a successful login attempt
      setUsername('');
      setPassword('');

      // Note: Navigation happens automatically via the useEffect hook reacting to the 'user' state change
      console.log('Login request successful. Token received. AuthContext state updating...');


    } catch (err: any) { // Catch any errors that occur during the fetch request or in the try block
      console.error('Login error:', err);
      // Set the error state to display the error message to the user
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      // This block of code always runs after the try block finishes, regardless of whether an error occurred or not.
      setLoading(false); // Ensure the loading indicator is turned off
    }
  };

  // Render the login form UI.
  // The form is only rendered if the user is null and not currently loading (handled by the initial check and useEffect).
  return (
    <div className="login-form-container">
      <h2>Login to Nexus</h2> {/* Heading for the form */}

      {/* Display loading or error messages conditionally */}
      {loading && <p>Logging in...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

       {/* The actual HTML form element */}
       <form onSubmit={handleSubmit} className="login-form">
         <div>
           {/* Label and input field for the username or email */}
           <label htmlFor="username">Username or Email:</label>
           <input
             type="text"
             id="username" // Unique ID for the label's 'htmlFor' attribute
             value={username} // Input value is controlled by the 'username' state
             onChange={(e) => setUsername(e.target.value)} // Update 'username' state when input changes
             required // HTML5 validation: field is required
             disabled={loading} // Disable the input fields while the login request is loading
           />
         </div>
         <div>
           {/* Label and input field for the password */}
           <label htmlFor="password">Password:</label>
           <input
             type="password"
             id="password" // Unique ID for the label's 'htmlFor' attribute
             value={password} // Input value is controlled by the 'password' state
             onChange={(e) => setPassword(e.target.value)} // Update 'password' state when input changes
             required // HTML5 validation: field is required
             disabled={loading} // Disable the input fields while loading
           />
         </div>
         {/* Submit button */}
         <button type="submit" disabled={loading}>
           {loading ? 'Logging In...' : 'Login'} {/* Button text changes based on the 'loading' state */}
         </button>
       </form>
    </div>
  );
}

export default LoginForm;