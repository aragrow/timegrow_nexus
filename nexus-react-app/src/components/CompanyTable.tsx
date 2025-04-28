/**
 * Company Table Component.
 *
 * This component fetches and displays a list of companies from the
 * custom '/wp-json/nexus/v1/companies' REST API endpoint in a table format.
 * It uses the `useApi` hook for authenticated data fetching.
 * It includes loading and error states.
 * It accepts a `refreshTrigger` prop to signal when the data should be refetched.
 */
import React, { useEffect, useState } from 'react'; // Import useState and useEffect hooks
import useApi from '../hooks/useApi'; // Import the custom useApi hook

// Define the interface for the structure of a Company Tracker entry,
// based on the columns returned by your backend API.
// Note: DECIMAL comes back as a string in JSON.
interface Company {
  ID: number;
  name: string;
  legal_name: string | null;
  document_number: string | null;
  default_flat_fee: string | null; // DECIMAL is typically returned as a string
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  website: string | null;
  notes: string | null;
  status: number; // smallint(1)
  created_at: string | null; // timestamp strings (ISO 8601 format often)
  updated_at: string | null; // timestamp strings
}

// Define the interface for the component's props
interface CompanyTableProps {
  refreshTrigger?: number; // Optional prop to trigger data refresh (e.g., incremented after data change)
  // TODO: Add props for pagination, sorting, filtering parameters if needed
  // page?: number;
  // perPage?: number;
  // sortBy?: string;
  // sortOrder?: 'asc' | 'desc';
  // filters?: { [key: string]: any };
}


/**
 * Fetches and displays a table of company tracker entries.
 * @param {CompanyTableProps} props - The component's props.
 */
const CompanyTable: React.FC<CompanyTableProps> = ({ refreshTrigger }) => {
  // State to hold the array of company objects fetched from the API.
  const [companies, setCompanies] = useState<Company[]>([]);
  // State to indicate if data is currently being loaded from the API.
  const [loading, setLoading] = useState(true);
  // State to hold any error message that occurs during the fetch.
  const [error, setError] = useState<string | null>(null);

  // Get the apiFetch function from your custom useApi hook.
  // This hook ensures the JWT token is included in the request.
  const { apiFetch } = useApi();

  // useEffect hook to perform the data fetching when the component mounts
  // or when dependencies change.
  useEffect(() => {
    // Async function to perform the API call
    const fetchCompanies = async () => {
      setLoading(true); // Set loading state to true before fetching
      setError(null); // Clear any previous errors

      try {
        // Use apiFetch to call your custom backend endpoint for listing companies.
        // The endpoint 'companies' is relative to '/wp-json/nexus/v1/'.
        // The type assertion `<Company[]>` tells TypeScript what structure to expect.
        const data: Company[] = await apiFetch('companies'); // This makes a GET request by default

        // If the fetch is successful, update the 'companies' state with the received data.
        setCompanies(data);
        console.log('Fetched companies:', data);

      } catch (err: any) {
        // If an error occurs during the fetch, log it and set the error state.
        console.error('Error fetching companies:', err);
        setError(err.message || 'Failed to fetch companies.');
        // You might want to clear existing companies on error: setCompanies([]);
      } finally {
        // This block runs after the try or catch block finishes.
        setLoading(false); // Set loading state to false.
      }
    };

    // Call the fetch function when the component mounts or when 'apiFetch' or 'refreshTrigger' changes.
    // Including 'apiFetch' is a dependency because useCallback makes it stable,
    // but including 'refreshTrigger' is CRUCIAL for re-fetching when triggered by a parent component.
    fetchCompanies();

    // Optional: Cleanup function if you had subscriptions or timeouts
    // return () => { /* cleanup */ };

  }, [apiFetch, refreshTrigger]); // Dependencies: rerun effect if apiFetch or refreshTrigger changes.


  // --- Render Logic ---

  // Show a loading message while data is being fetched.
  if (loading) {
    return <p>Loading companies...</p>;
  }

  // Display an error message if a fetch error occurred.
  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  // Display a message if no companies were found after loading.
  if (companies.length === 0) {
       return <p>No companies found.</p>;
  }

  // If data is loaded and there are companies, render the table.
  return (
    <div className="company-table-container">
      <h2>Companies</h2>
      {/* HTML Table element */}
      <table>
        {/* Table Header */}
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Contact Person</th>
            <th>Email</th>
            <th>City</th>
            <th>Status</th>
            {/* Add more table headers corresponding to columns you want to display */}
            <th>Created At</th>
          </tr>
        </thead>
        {/* Table Body */}
        <tbody>
          {/* Map over the 'companies' array to create a table row for each company */}
          {companies.map((company) => (
            // Each row needs a unique 'key' prop for React to efficiently update the list.
            <tr key={company.ID}>
              <td>{company.ID}</td>
              <td>{company.name}</td>
              {/* Use logical OR (||) or ternary operator (?) to display a default value like '-' for null/empty fields */}
              <td>{company.contact_person || '-'}</td>
              <td>{company.email || '-'}</td>
              <td>{company.city || '-'}</td>
              {/* Display Status based on the number value */}
               <td>{company.status === 1 ? 'Active' : 'Inactive'}</td>
              {/* Add more table cells */}
              {/* Format the timestamp strings for better display */}
              <td>{company.created_at ? new Date(company.created_at).toLocaleDateString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
       {/* TODO: Add pagination controls here if your API supports it */}
    </div>
  );
};

export default CompanyTable;