/**
 * Main Application Component.
 *
 * This component sets up the core structure of the React application:
 * - React Router: Manages navigation between different pages/routes.
 * - AuthProvider: Provides authentication state (user, token, login/logout) to the entire app via Context.
 * - PrivateRoute: A helper component to protect routes, redirecting unauthenticated users to the login page.
 * It defines the main routes for the application (Login and Dashboard).
 */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; // Import AuthProvider and useAuth hook

// Import the page components defined in the 'pages' directory
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
// import CompanyTrackerPage from './pages/CompanyTrackerPage'; // Example for future protected routes
// import ProjectTrackerPage from './pages/ProjectTrackerPage'; // Example for future protected routes


/**
 * PrivateRoute Component.
 *
 * A wrapper component that checks if a user is authenticated using the AuthContext.
 * If the user is loading or not authenticated, it redirects them to the login page.
 * Otherwise, it renders the child components (the protected page).
 * @param {object} props - The component's props.
 * @param {JSX.Element} props.children - The protected component(s) to render if authenticated.
 */
const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  // Use the useAuth hook to access the authentication state
  const { user, loadingUser } = useAuth();

  // If the authentication status is still being checked (e.g., reading token from storage)
  if (loadingUser) {
    // You could show a full-page loading spinner here
    return <div>Loading application state...</div>;
  }

  // If the user is not logged in (user is null)
  if (!user) {
    // Redirect the user to the login page
    // 'replace' prop prevents going back to the protected page using the browser's back button
    return <Navigate to="/login" replace />;
  }

  // If the user is logged in, render the children components (the protected page)
  return children;
};


/**
 * Main App Component.
 * Sets up the router and authentication provider, and defines the main application routes.
 */
function App() {
  return (
    // BrowserRouter provides the routing context for the application
    <Router>
      {/* AuthProvider wraps the routes, making auth state available to all route components */}
      <AuthProvider>
        {/* Routes component defines the different paths and the components to render */}
        <Routes>
          {/* Public route for the login page */}
          {/* The 'element' prop specifies the component to render for this path */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected route for the dashboard */}
          {/* This route uses the PrivateRoute wrapper */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                {/* If PrivateRoute allows access, render the DashboardPage */}
                <DashboardPage />
              </PrivateRoute>
            }
          />

           {/* Example of another protected route using PrivateRoute */}
           {/* <Route
             path="/companies"
             element={
               <PrivateRoute>
                 <CompanyTrackerPage /> // Component to view/manage companies
               </PrivateRoute>
             }
           /> */}
            {/* TODO: Add more protected routes for other entities (projects, expenses, etc.) */}


          {/* Default route: Redirects the root path "/" to "/login" */}
          {/* PrivateRoute on /dashboard will handle redirection if already logged in */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Optional: Catch-all route for 404 Not Found pages */}
          {/* <Route path="*" element={<div>404 Not Found</div>} /> */}

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;