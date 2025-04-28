/**
 * Dashboard Page Component.
 *
 * This is the main protected page view after a user logs in.
 * - It uses the DashboardLayout for overall structure (header, sidebar, content, Nexus bar).
 * - It manages the state for the main content area, switching between different views
 *   like the overview, company list, company form, or query results.
 * - It handles the actions triggered by the Action Grid or the Nexus Input Bar.
 * - It uses the useAuth hook to access user data (though primarily for display in layout).
 * - It uses the useApi hook to send natural language queries to the backend.
 */
import React, { useState, useEffect } from 'react'; // Import necessary hooks
import { useAuth } from '../context/AuthContext'; // Import useAuth hook
import useApi from '../hooks/useApi'; // Import useApi hook

// Import layout and component pieces
import DashboardLayout from '../components/DashboardLayout';
import ActionGridSection from '../components/ActionGridSection';
import CompanyTable from '../components/CompanyTable'; // Component to display companies
import CompanyForm from '../components/CompanyForm'; // Component for adding a company

// Define the possible states (views) for the main content area
type DashboardView = 'overview' | 'companies_list' | 'add_company' | 'query_result' | 'message';
// Add more views as you create components for other entities (e.g., 'projects_list', 'add_project', 'expenses_list', etc.)

const DashboardPage: React.FC = () => {
    // Get user info from context (used here mainly for rendering content, logout handled in layout)
    const { user } = useAuth();
    // Get the API fetching function from your custom hook
    const { apiFetch } = useApi();

    // State variable to control which component is displayed in the main content area
    const [currentView, setCurrentView] = useState<DashboardView>('overview');

    // State variable to signal that data needs to be refreshed (e.g., after a new record is added)
    // Incrementing this number in a dependency array will cause useEffects to re-run.
    const [refreshData, setRefreshData] = useState(0);

    // State variable to store the result received from a natural language query
    const [queryResult, setQueryResult] = useState<any>(null); // 'any' type for now, as result structure varies

    // State variable to indicate if a natural language query is currently being processed
    const [queryLoading, setQueryLoading] = useState(false);


    // Define the list of primary action names to display in the action grid
    // These names are mapped to specific actions/views in the handleActionClick function.
    const primaryActions = [
       'Add New Company',
       'View All Companies', // Action to view the list of companies
       'Add New Project',
       'View All Projects', // Placeholder
       'Add New Client',
       'View All Clients', // Placeholder
       'Add Time Entry',
       'View All Time Entries', // Placeholder
       'Add Expense',
       'View All Expenses', // Placeholder
       // Add more actions based on your entity types and common tasks
    ];

    // Function to handle clicks on the action square buttons in the grid.
    const handleActionClick = (actionName: string) => {
       console.log(`Action "${actionName}" clicked.`);
       // Logic to change the currentView state based on the clicked action name.
       // This determines which component is rendered in the main content area.

       setQueryResult(null); // Clear any previous query results when a standard action is taken.

       if (actionName === 'View All Companies') {
           setCurrentView('companies_list');
           // Increment refreshData to signal the CompanyTable to re-fetch data.
           setRefreshData(prev => prev + 1);
       } else if (actionName === 'Add New Company') {
           setCurrentView('add_company');
       }
       // TODO: Add more conditions here to handle clicks for other entity actions:
       // else if (actionName === 'View All Projects') { setCurrentView('projects_list'); setRefreshData(prev => prev + 1); }
       // else if (actionName === 'Add New Project') { setCurrentView('add_project'); }
       // else if (actionName === 'View All Expenses') { setCurrentView('expenses_list'); setRefreshData(prev => prev + 1); }
       // else if (actionName === 'Add Expense') { setCurrentView('add_expense'); }
       // ... and so on for Clients, Team Members, Time Entries.

       // Handle actions that don't map directly to a specific list/form view, or are not yet implemented.
       else {
           console.warn(`Action "${actionName}" does not have a defined view handler.`);
           // Optionally display a message to the user indicating the action is not implemented.
           setQueryResult({ message: `Action "${actionName}" is not yet implemented.` });
           setCurrentView('message'); // Or a dedicated 'info' view
       }
    };

    // Function to handle data changes (e.g., after a new record is created or updated).
    // This is passed down to forms/edit components via props.
    const handleDataChange = () => {
         console.log("Data changed, triggering list refresh and returning to list view...");
         // Increment refreshData to trigger re-fetching in relevant list components.
         setRefreshData(prev => prev + 1);
         // Optionally navigate the user back to the relevant list view after a change.
         // This assumes the last action was adding/editing. You might need more sophisticated state
         // to know which list to return to (e.g., after adding a company, go back to companies_list).
         // For simplicity, let's just go back to the overview or a known list view.
         setCurrentView('companies_list'); // Example: always go back to the companies list for now.
         setQueryResult(null); // Clear query results when returning to a list view.
    }

     // Function to handle cancellation from forms or other views.
     // This is passed down to forms/edit components via props.
     const handleCancel = () => {
          console.log("Action cancelled, returning to overview.");
          // Return to the overview page.
          setCurrentView('overview');
          setQueryResult(null); // Clear any pending query results
     }


    // Function to handle natural language query submission from the NexusInputBar.
    // This sends the query to the backend's custom '/query' endpoint.
    const handleQuerySubmit = async (query: string) => {
         console.log(`Natural Language Query Submitted: "${query}"`);
         setQueryLoading(true); // Start the query loading indicator
         setQueryResult(null); // Clear any previous query results or messages
         setCurrentView('query_result'); // Switch the view to display the query processing state and result

         try {
             // Use the apiFetch hook to call your custom backend endpoint for natural language queries.
             // This will automatically include the JWT token.
             const result = await apiFetch('query', { // Endpoint is relative to /wp-json/nexus/v1/
                 method: 'POST',
                 // Send the natural language query text in the request body as JSON.
                 body: JSON.stringify({ query: query }),
             });

             console.log('Query result received:', result);
             // Store the result received from the backend in state.
             setQueryResult(result);

         } catch (err: any) {
             // Catch any errors during the API fetch and display an error message.
             console.error('Error during query submission:', err);
             setQueryResult({ error: err.message || 'Failed to process query.' }); // Store error message in result state
         } finally {
             // Ensure loading state is turned off regardless of success or failure.
             setQueryLoading(false);
         }
    };


    // Function to render the appropriate component in the main content area based on the currentView state.
    const renderMainContent = () => {
        switch (currentView) {
            case 'overview':
                // Render the initial overview content.
                return (
                     <>
                        <h2>Dashboard Overview</h2>
                        {user && <p>Welcome back, {user.name}!</p>}
                        <p>Select an action above or type a natural language query below.</p>
                        {/* TODO: Add summary widgets or other overview content here */}
                     </>
                );
            case 'companies_list':
                // Render the CompanyTable component.
                // Pass the refreshTrigger prop so the table can re-fetch data when it changes.
                return <CompanyTable key="company-list" refreshTrigger={refreshData} />;
            case 'add_company':
                // Render the CompanyForm component for adding a new company.
                // Pass handleDataChange callback to be called after successful creation.
                // Pass handleCancel callback to allow closing the form.
                return <CompanyForm key="add-company-form" onCompanyCreated={handleDataChange} onCancel={handleCancel} />;
             case 'query_result':
                 // Render the area to display natural language query results.
                 return (
                     <div className="query-result-display">
                         <h2>Query Result</h2>
                         {queryLoading ? (
                             // Show loading message while query is processing.
                             <p>Processing natural language query...</p>
                         ) : queryResult ? (
                             // If a result exists (either data or an error message), display it.
                             // For now, display the raw JSON result.
                             // TODO: Create components to format different types of results (list, single item, report, message).
                             <pre>{JSON.stringify(queryResult, null, 2)}</pre>
                         ) : (
                              // Default message if no result is pending or available.
                              <p>No query result to display yet.</p>
                         )}
                         {/* Add a button to return to the overview page when not loading. */}
                         {!queryLoading && <button onClick={() => setCurrentView('overview')}>Back to Overview</button>}
                     </div>
                 );
            case 'message':
                // Render a simple message view
                 return (
                     <div className="message-display">
                          <h2>Information</h2>
                          {queryResult && queryResult.message && <p>{queryResult.message}</p>}
                          <button onClick={() => setCurrentView('overview')}>Back to Overview</button>
                     </div>
                 );
            // TODO: Add cases for rendering other views (projects_list, add_project, etc.)
            default:
                // Handle unexpected view states.
                return (
                     <>
                        <h2>Unknown View</h2>
                        <p>An invalid view was requested.</p>
                         <button onClick={() => setCurrentView('overview')}>Return to Overview</button>
                     </>
                );
        }
    };

    // The DashboardPage component renders the DashboardLayout and passes down necessary props.
    // The DashboardLayout then renders its children (the main content based on currentView)
    // and the NexusInputBar, which also receives props.
  return (
    <DashboardLayout
       onQuerySubmit={handleQuerySubmit} // Pass the handler for NL query submission
       queryLoading={queryLoading} // Pass the loading state for the NL query bar
       // You could pass setCurrentView down here if you wanted the sidebar links
       // in DashboardLayout to directly control the view state in DashboardPage.
       // onChangeView={setCurrentView} // Example
    >
      {/* Action Grid Section - Only show on the overview page */}
      {currentView === 'overview' && (
           <ActionGridSection
               title="Quick Actions"
               actions={primaryActions}
               onActionClick={handleActionClick} // Pass the action square click handler
           />
       )}


      {/* Main Content Display Area */}
      <div className="main-view-area">
          {/* Call the renderMainContent function to display the current view component */}
          {renderMainContent()}
      </div>

       {/* Note: The NexusInputBar is now rendered inside DashboardLayout */}

    </DashboardLayout>
  );
};

export default DashboardPage;