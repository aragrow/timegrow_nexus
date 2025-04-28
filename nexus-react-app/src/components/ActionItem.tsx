/**
 * Action Item Component.
 *
 * Represents a single, square, draggable button for a specific action on the dashboard overview.
 * Uses the `react-draggable` library to enable dragging.
 * When clicked, it triggers a callback function passed from the parent.
 */
import React from 'react';
import Draggable, { DraggableEvent, DraggableData } from 'react-draggable';

// Define the interface for the component's props
interface ActionItemProps {
  actionName: string; // The text label displayed on the action square (e.g., "Add New Company")
  onActionClick?: (actionName: string) => void; // Optional callback function when the item is clicked
  // You could add an icon prop here later, e.g., icon?: React.ReactNode;
}

/**
 * Renders a single draggable action item.
 * @param {ActionItemProps} props - The component's props.
 */
const ActionItem: React.FC<ActionItemProps> = ({ actionName, onActionClick }) => {

  /**
   * Handles the click event on the action item.
   * @param {React.MouseEvent} event - The click event object.
   */
  const handleClick = (event: React.MouseEvent) => {
     // Prevent the click event from propagating up the DOM tree if necessary,
     // which can sometimes interfere with the draggable library.
     // event.stopPropagation(); // Uncomment if clicks cause issues with dragging.

      // If a click handler was provided via props, call it, passing the action name.
      if (onActionClick) {
          onActionClick(actionName);
      }
      console.log(`Action clicked: ${actionName}`);
      // TODO: The actual logic triggered by clicking the action is handled in the parent component (DashboardPage).
      // This component just signals that a click occurred.
  };

  // Optional: Event handlers for the start and stop of dragging.
  // These are included if you want to log drag events or potentially save/load item positions.
  const handleDragStart = (e: DraggableEvent, ui: DraggableData) => {
    // console.log('Drag start:', ui);
  };

  const handleDragStop = (e: DraggableEvent, ui: DraggableData) => {
    // console.log('Drag stop:', ui);
    // TODO: If you implement saving drag positions, this is where you would capture the final position (ui.x, ui.y).
  };

  // The Draggable component requires a single child element that it will make draggable.
  // We make the main div with class 'action-item' draggable.
  return (
    // Draggable wrapper from react-draggable
    <Draggable
      axis="both" // Allow dragging horizontally and vertically
      handle=".action-item-content" // Specify that dragging only starts when dragging the element with class 'action-item-content'
      onStart={handleDragStart} // Optional callback for drag start
      onStop={handleDragStop}   // Optional callback for drag stop
      // Other useful props:
      // bounds="parent" // Restrict dragging within the immediate parent element
      // position={{x: 0, y: 0}} // Set initial position if loading from saved data
      // grid={[25, 25]} // Make the item snap to a grid of 25x25 pixels
    >
      {/* The actual HTML element that is made draggable. */}
      {/* The onClick handler is attached here to the draggable element. */}
      <div className="action-item" onClick={handleClick}>
         {/* The content inside the action item. */}
         {/* This div is also specified as the drag handle. */}
         <div className="action-item-content">
             {/* A paragraph element to display the action name, allows text wrapping */}
             <p className="action-item-text">{actionName}</p>
         </div>
      </div>
    </Draggable>
  );
};

export default ActionItem;