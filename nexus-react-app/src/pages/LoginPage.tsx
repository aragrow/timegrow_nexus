/**
 * Login Page Component.
 *
 * This component represents the login page view.
 * It primarily renders the LoginForm component.
 * It uses the useAuth hook to check if the user is already logged in
 * and redirects them to the dashboard if they are.
 */
import React, { useEffect } from 'react';
import LoginForm from '../components/LoginForm'; // Import the LoginForm component
import { useAuth } from '../context/AuthContext'; // Import useAuth hook to check auth status
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

const LoginPage: React.FC = () => {
  // Access user and loadingUser from the AuthContext
  const { user, loadingUser } = useAuth();
  const navigate = useNavigate(); // Get the navigate function from react-router-dom

  // useEffect hook to handle redirection if the user is already authenticated.
  // This runs when the component mounts or when user/loadingUser state changes.
  useEffect(() => {
    // Only attempt to redirect if we are NOT currently loading/checking auth status
    // and if the user object exists (meaning they are logged in).
    if (!loadingUser && user) {
      console.log('User detected on login page, redirecting to dashboard.');
      // Redirect to the dashboard page.
      // 'replace: true' replaces the current entry in the browser history,
      // so the user can't use the back button to return to the login page after logging in.
      navigate('/dashboard', { replace: true });
    }
     // Note: navigate is stable, but adding it as a dependency is standard practice in newer React/linters
  }, [user, loadingUser, navigate]); // Dependencies: Rerun effect if user, loadingUser, or navigate changes.

  // If currently loading authentication status, show a simple loading message.
  // The full loading spinner for the entire app is handled in AuthProvider.
  if (loadingUser) {
    return <div>Checking authentication status...</div>;
  }

  // If the user is already logged in, the useEffect above will handle redirection.
  // We return null here because the navigation will happen before rendering the form.
  if (user) {
     return null;
  }


  // If the user is NOT logged in and loading is complete, render the login form container.
  return (
    <div className="login-page">
      {/* Render the LoginForm component */}
      <LoginForm />
    </div>
  );
};

export default LoginPage;