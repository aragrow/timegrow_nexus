/**
 * Entry Point of the React Application.
 *
 * This file is the first code that runs in the browser.
 * It finds the root DOM element (usually <div id="root"></div> in public/index.html)
 * and renders the main App component into it.
 * It uses React 18's createRoot for better performance.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx'; // Import the main App component
import './index.css'; // Import global styles

// Find the root element where the React app will be mounted
const container = document.getElementById('root');

// Check if the root container element was found
if (container) {
    // Create a React root using ReactDOM.createRoot (React 18+ API)
    const root = ReactDOM.createRoot(container);

    // Render the App component inside React's StrictMode (for development checks)
    // The App component contains the Router and AuthProvider.
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    // Log an error if the root element is not found, which means the app can't start
    console.error('Root element #root not found in the DOM.');
}