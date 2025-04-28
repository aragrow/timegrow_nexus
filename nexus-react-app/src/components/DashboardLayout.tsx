/**
 * Dashboard Layout Component.
 *
 * This component provides the overall structural layout for the protected dashboard pages.
 * - It includes a header with the app title and user info (Welcome message, Logout button).
 * - It includes a sidebar for navigation (placeholder for now, could use React Router Links).
 * - It includes a main content area where child components (specific views like tables/forms) are rendered.
 * - It includes the NexusInputBar at the bottom for natural language queries.
 * It receives callbacks and state from the parent (DashboardPage) to handle navigation and query submission.
 */
import React from 'react';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook to get user info and logout function
import NexusInputBar from './NexusInputBar'; // Import the NexusInputBar component

// Define the interface for the component's props
interface DashboardLayoutProps {
  // Children prop to render the specific content of the current dashboard view (e.g., Action Grid, Table, Form)
  children: React.ReactNode;
  // Callback function to handle natural language query submission from the NexusInputBar
  onQuerySubmit: (query: string) => void;
  // Boolean prop to indicate if a natural language query is currently being processed
  queryLoading?: boolean;
  // Optional callback for sidebar navigation clicks if not using React Router Links directly
  // onChangeView?: (view: string) => void;
}

/**
 * Renders the main layout for the dashboard.
 * @param {DashboardLayoutProps} props - The component's props.
 */
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, onQuerySubmit, queryLoading = false /*, onChangeView */ }) => {
  // Access the authenticated user object and the logout function from the AuthContext
  const { user, logout } = useAuth();

  // Simple handler for sidebar button clicks if not using React Router Links
  // const handleSidebarClick = (view: string) => {
  //     if (onChangeView) {
  //          onChangeView(view); // Call the passed-down function to change the view state in DashboardPage
  //     }
  // }

  return (
    <div className="dashboard-layout">
      {/* Header Section */}
      <header className="dashboard-header">
        <h1>Nexus Dashboard</h1>
        {/* Display user info and logout button if a user is logged in */}
        {user && (
          <div className="user-info">
            {/* Display the user's name */}
            <span>Welcome, {user.name}</span>
            {/* Logout button */}
            <button onClick={logout} className="logout-button">Logout</button>
          </div>
        )}
      </header>

      {/* Main Content Area - uses flexbox to layout sidebar and main content */}
      <div className="dashboard-main">
        {/* Sidebar Section - for navigation */}
        <aside className="dashboard-sidebar">
          <nav>
              <ul>
                  {/* Navigation Links/Buttons */}
                  {/* TODO: Replace placeholder text with actual navigation elements */}
                  {/* You could use <button onClick={() => handleSidebarClick('overview')}>Overview</button> */}
                  {/* Or use <Link to="/dashboard/companies">Companies</Link> with nested routes in App.tsx */}
                  <li><button>Overview</button></li>
                  <li><button>Companies</button></li>
                  <li><button>Projects</button></li>
                  <li><button>Expenses</button></li>
                  <li><button>Team Members</button></li>
                   {/* Add buttons/links for other entities */}
              </ul>
          </nav>
        </aside>

        {/* Main Content Area - where the active view component is rendered */}
        <main className="dashboard-content">
          {children} {/* Render the child components (passed from DashboardPage) */}
        </main>
      </div>

      {/* Nexus Input Bar at the bottom - for natural language queries */}
      {/* Pass the onQuerySubmit callback and queryLoading state down to the input bar */}
      <NexusInputBar onQuerySubmit={onQuerySubmit} loading={queryLoading} />

      {/* Optional Footer Section */}
      {/* <footer className="dashboard-footer">
          <p>© {new Date().getFullYear()} Nexus App</p>
      </footer> */}
    </div>
  );
};

export default DashboardLayout;