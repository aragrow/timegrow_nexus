/**
 * Nexus Input Bar Component.
 *
 * This component provides the user interface for typing and submitting
 * natural language queries to the Nexus backend.
 * It's a simple input field and a submit button.
 * It accepts a callback function to handle the submitted query text.
 */
import React, { useState } from 'react'; // Import useState hook

// Define the interface for the component's props
interface NexusInputBarProps {
  // Callback function that is called when the user submits a query (e.g., presses Enter or clicks Ask).
  // The submitted query string is passed as an argument to this function.
  onQuerySubmit: (query: string) => void;
  // Optional boolean prop to indicate if a query is currently being processed.
  // This is used to disable the input and button and show a loading indicator.
  loading?: boolean;
}

/**
 * Renders the natural language input bar at the bottom of the dashboard.
 * @param {NexusInputBarProps} props - The component's props.
 */
const NexusInputBar: React.FC<NexusInputBarProps> = ({ onQuerySubmit, loading = false }) => {
  // State to manage the current value of the input field.
  const [query, setQuery] = useState('');

  /**
   * Handles changes to the input field.
   * Updates the 'query' state as the user types.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The input change event.
   */
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  /**
   * Handles the form submission event (e.g., user presses Enter while in the input).
   * Calls the onQuerySubmit callback with the current query text.
   * @param {React.FormEvent} event - The form submission event.
   */
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // Prevent the browser's default form submission (page reload).

    // Trim whitespace from the query.
    const trimmedQuery = query.trim();

    // If the trimmed query is not empty and a submit handler was provided, call the handler.
    if (trimmedQuery && onQuerySubmit) {
      onQuerySubmit(trimmedQuery); // Call the callback function, passing the query text.
      // Optionally clear the input field after submission:
      // setQuery('');
    }
  };

  // Render the input bar UI.
  return (
    <div className="nexus-input-bar-container">
      {/* The form element wraps the input and button to handle submission via Enter key */}
      <form onSubmit={handleSubmit} className="nexus-input-form">
        {/* The text input field for the natural language query */}
        <input
          type="text"
          value={query} // Input value is controlled by the 'query' state.
          onChange={handleInputChange} // Update 'query' state on input change.
          // Placeholder text changes based on the loading state.
          placeholder={loading ? "Processing..." : "Ask Nexus anything..."}
          disabled={loading} // Disable input while loading.
          aria-label="Natural language query input" // Accessibility label
          className="nexus-input-field"
        />
        {/* The submit button */}
        <button type="submit" disabled={loading} className="nexus-input-button">
          {loading ? '...' : 'Ask'} {/* Button text changes based on loading state. */}
        </button>
      </form>
    </div>
  );
};

export default NexusInputBar;