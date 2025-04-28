/**
 * Action Grid Section Component.
 *
 * This component acts as a container for a group of draggable ActionItem components.
 * It displays a title for the section and lays out the ActionItems in a flex container
 * that allows wrapping, forming a grid-like appearance.
 * It receives the list of action names and the click handler to pass down to each ActionItem.
 */
import React from 'react';
import ActionItem from './ActionItem'; // Import the individual ActionItem component

// Define the interface for the component's props
interface ActionGridSectionProps {
  title: string; // The title for this section (e.g., "Quick Actions", "Reporting Actions")
  actions: string[]; // An array of strings, where each string is the name/label of an action
  onActionClick?: (actionName: string) => void; // Optional callback function to pass to each ActionItem
}

/**
 * Renders a section containing a grid of ActionItems.
 * @param {ActionGridSectionProps} props - The component's props.
 */
const ActionGridSection: React.FC<ActionGridSectionProps> = ({ title, actions, onActionClick }) => {
  return (
    <div className="action-grid-section">
      {/* Display the section title */}
      <h2>{title}</h2>
      {/* Container for the ActionItem components - uses flexbox for layout */}
      <div className="action-grid-container">
        {/* Map over the 'actions' array */}
        {actions.map((actionName, index) => (
          // For each action name, render an ActionItem component
          <ActionItem
            // Use a unique key prop for each item when mapping over arrays.
            // Using the index is acceptable here because the list of actions is static and its order doesn't change based on external data.
            key={index}
            actionName={actionName} // Pass the action name as a prop
            onActionClick={onActionClick} // Pass the click handler down
          />
        ))}
      </div>
    </div>
  );
};

export default ActionGridSection;