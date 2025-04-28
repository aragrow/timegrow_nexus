**Instructions for Use:**

1.  **WordPress Setup:**
    *   Ensure you have a local WordPress site running (e.g., using Local by Flywheel).
    *   Create the `nexus-backend` plugin folder structure (`wp-content/plugins/nexus-backend/includes/`).
    *   Place the PHP files (`nexus-backend.php`, `class-nexus-custom-endpoints.php`) in their correct locations.
    *   Activate the "Nexus Custom Backend" plugin in your WordPress admin dashboard.
    *   Edit your `wp-config.php` file to add the `JWT_AUTH_SECRET_KEY`.
    *   **Crucially:** You need to **create your custom database tables** (`company_tracker`, etc.). The provided PHP code *defines* the *interface* to these tables, but doesn't *create* them automatically in this version. You would typically add this logic to a plugin activation hook using `dbDelta`. For testing the API endpoints, you can manually create the `company_tracker` table in your database using a tool like Adminer (available in Local by Flywheel) or phpMyAdmin, copying the `CREATE TABLE` syntax from the comments in `class-nexus-custom-endpoints.php`.
    *   Ensure CORS is enabled for your React app's origin (`http://localhost:5173`) in your WordPress setup (using a plugin or manual headers as discussed in the previous troubleshooting step).

2.  **React Setup:**
    *   Ensure you have Node.js and npm/Yarn installed.
    *   Navigate to your `my-nexus-react-app` directory in Terminal.
    *   Ensure `package.json` lists `react`, `react-dom`, `react-router-dom`, `react-draggable`, and Vite/TypeScript dev dependencies. Run `npm install` if needed.
    *   Place the `.tsx` and `.css` files in their correct locations within the `src` directory.
    *   **Replace all instances of `'YOUR_WORDPRESS_SITE_URL'`** in the React files (`AuthContext.tsx`, `useApi.ts`, `LoginForm.tsx`) with the actual URL of your local WordPress site (e.g., `'http://nexus-headless.local'`).
    *   Run the React development server: `npm run dev`.

3.  **Testing:**
    *   Open your browser to the address provided by Vite (e.g., `http://localhost:5173/`).
    *   Log in using your WordPress admin credentials.
    *   Test navigating to `/dashboard`.
    *   Test the "View All Companies" action (requires the `company_tracker` table to exist).
    *   Test the "Add New Company" action (requires the `company_tracker` table to exist).
    *   Test typing a natural language query in the bar ("list companies", "add company") and see the response.

**Project File Structure:**

1.  **my-nexus-react-app/**
├── public/
│   └── index.html      <-- Basic HTML page where React mounts (<div id="root"></div>)
├── src/
│   ├── components/
│   │   ├── ActionItem.tsx
│   │   ├── ActionGridSection.tsx
│   │   ├── CompanyForm.tsx
│   │   ├── CompanyTable.tsx
│   │   ├── DashboardLayout.tsx
│   │   ├── LoginForm.tsx
│   │   └── NexusInputBar.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   └── useApi.ts         <-- Note: Using .ts as discussed
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   └── LoginPage.tsx
│   ├── App.tsx             <-- Main App component (Router, AuthProvider, PrivateRoute)
│   ├── index.css           <-- Global styles
│   └── main.tsx            <-- Entry point (Renders App)
├── package.json          <-- Project dependencies (react, react-dom, react-router-dom, react-draggable, typescript, vite, etc.)
├── tsconfig.json         <-- TypeScript config (if using TS)
├── vite.config.ts        <-- Vite build config
└── ... other config files


2.  **Local Sites/your-site-name/app/public/**
└── wp-content/
    └── plugins/
        └── nexus-backend/      <-- Your custom plugin folder
            ├── includes/
            │   └── class-nexus-custom-endpoints.php
            └── nexus-backend.php   <-- Main plugin file


3.  **Local Sites/your-site-name/app/public/**
└── wp-config.php           <-- Need to add JWT_AUTH_SECRET_KEY here



---

## Frontend (React / Vite)

The React application is built using Vite and TypeScript. It handles the user interface, routing, state management for authentication, and communication with the WordPress REST API.

### Core Setup Files

*   `my-nexus-react-app/public/index.html`
    *   **Purpose:** The main HTML file served by the development server or static build. It's a simple container where the React application is mounted.
    *   **Key Elements:** Contains the `<div id="root"></div>` where React injects the entire application.
    *   **Notes:** Typically minimal, as React manages the rest of the DOM.

*   `my-nexus-react-app/src/main.tsx`
    *   **Purpose:** The primary entry point for the React application. It initializes React, finds the root DOM element (`#root`), and renders the main `App` component.
    *   **Key Responsibilities:** Setting up the React rendering root (`ReactDOM.createRoot`) and wrapping the main component in `React.StrictMode` for development checks.
    *   **Imports:** Imports `React`, `ReactDOM`, and `./App.tsx`.

*   `my-nexus-react-app/src/App.tsx`
    *   **Purpose:** Sets up the main structure of the application including routing and the authentication provider.
    *   **Key Responsibilities:**
        *   Initializes `react-router-dom` (`BrowserRouter`, `Routes`).
        *   Wraps the application routes with `AuthProvider` to make authentication context available globally.
        *   Defines the main application routes (`/login`, `/dashboard`).
        *   Includes a `PrivateRoute` component to protect routes requiring authentication.
    *   **Imports:** Imports `BrowserRouter`, `Routes`, `Route`, `Navigate` from `react-router-dom`, `AuthProvider`, `useAuth`, and the main page components (`LoginPage`, `DashboardPage`).
    *   **Notes:** Contains the `PrivateRoute` component logic which checks `user` and `loadingUser` from `AuthContext` before rendering children or navigating.

*   `my-nexus-react-app/src/index.css`
    *   **Purpose:** Provides global CSS styling for the entire React application.
    *   **Key Responsibilities:** Defines body styles, basic layout helpers, and specific styles for UI components like the dashboard layout, forms, tables, action grid, and Nexus input bar.
    *   **Notes:** Includes styling based on the components created in subsequent steps.

### Authentication & API

*   `my-nexus-react-app/src/context/AuthContext.tsx`
    *   **Purpose:** Implements the React Context for managing the application's authentication state.
    *   **Key Responsibilities:**
        *   Stores the JWT token and authenticated user data (`user`).
        *   Manages `loadingUser` state for initial authentication check.
        *   Provides `login` and `logout` functions to update the state and Local Storage.
        *   Uses `useEffect` to read token from Local Storage on load and fetch user data.
        *   Defines the `AuthContext` Provider (`AuthProvider`) and a custom hook (`useAuth`) to consume the context.
    *   **Imports:** Imports React hooks (`createContext`, `useState`, `useContext`, `useEffect`, `useCallback`).
    *   **Notes:** **Requires replacing `'YOUR_WORDPRESS_SITE_URL'`** with your actual WordPress backend URL. The `AuthProvider` wraps the application in `main.tsx` (via `App.tsx`).

*   `my-nexus-react-app/src/hooks/useApi.ts`
    *   **Purpose:** A custom React hook for making authenticated API calls to your custom WordPress REST API endpoints.
    *   **Key Responsibilities:**
        *   Provides an `apiFetch` function based on the browser's `fetch` API.
        *   Automatically includes the JWT token from `AuthContext` in the `Authorization: Bearer` header.
        *   Handles standard headers like `Content-Type: application/json`.
        *   Includes error handling, specifically logging out the user if a 401 (Unauthorized) or 403 (Forbidden) response is received.
        *   Constructs the full URL using the base WordPress URL and the custom namespace (`/wp-json/nexus/v1/`).
    *   **Imports:** Imports `useCallback` and `useAuth`.
    *   **Notes:** **Requires replacing `'YOUR_WORDPRESS_SITE_URL'`** with your actual WordPress backend URL. This hook is used by components needing to fetch or send data to the backend.

### Page Components

*   `my-nexus-react-app/src/pages/LoginPage.tsx`
    *   **Purpose:** The page component for the login view.
    *   **Key Responsibilities:**
        *   Renders the `LoginForm` component.
        *   Uses `useEffect` and `useAuth` to check if the user becomes logged in (e.g., successfully logs in or token from storage is valid) and navigates them to the dashboard.
        *   Uses `useNavigate` for programmatic redirection.
    *   **Imports:** Imports `React`, `useEffect`, `LoginForm`, `useAuth`, `useNavigate`.

*   `my-nexus-react-app/src/pages/DashboardPage.tsx`
    *   **Purpose:** The main protected page component for the dashboard view.
    *   **Key Responsibilities:**
        *   Uses the `DashboardLayout` component for the overall structure.
        *   Manages the `currentView` state to switch between different components in the main content area (overview, company list, add company form, query result).
        *   Defines the list of `primaryActions` for the `ActionGridSection`.
        *   Implements `handleActionClick` to update `currentView` and potentially `refreshData` based on user interaction with the action grid.
        *   Implements `handleQuerySubmit` to send natural language queries to the backend using `useApi` and manages `queryResult` and `queryLoading` states.
        *   Defines `handleDataChange` and `handleCancel` callbacks passed to forms/views.
        *   Uses a `renderMainContent` helper function to conditionally render the correct component based on `currentView`.
    *   **Imports:** Imports `React`, `useState`, `useEffect`, `useAuth`, `useApi`, and various components (`DashboardLayout`, `ActionGridSection`, `CompanyTable`, `CompanyForm`).
    *   **Notes:** This file orchestrates the main UI flow and data fetching/submission based on user actions (clicks or NL queries). The `refreshData` state is a common pattern to trigger re-fetching in child list components.

### UI Components

*   `my-nexus-react-app/src/components/LoginForm.tsx`
    *   **Purpose:** Renders the actual HTML form for username and password input.
    *   **Key Responsibilities:**
        *   Manages local state for `username`, `password`, `error`, and `loading`.
        *   Handles input changes to update state.
        *   Implements the `handleSubmit` function to call the JWT endpoint (`/wp-json/jwt-auth/v1/token`) using `fetch`.
        *   Calls `login(token)` from `useAuth()` on successful authentication.
        *   Displays loading/error messages.
        *   Uses `useEffect` and `useAuth` to check if already logged in and navigates away.
        *   Uses `useNavigate` to redirect programmatically.
    *   **Imports:** Imports `React`, `useState`, `useEffect`, `useAuth`, `useNavigate`.
    *   **Notes:** **Requires replacing `'YOUR_WORDPRESS_SITE_URL'`** with your actual WordPress backend URL. This component is rendered by `LoginPage.tsx`.

*   `my-nexus-react-app/src/components/DashboardLayout.tsx`
    *   **Purpose:** Provides the fixed layout structure for authenticated pages (header, sidebar, content area, bottom bar).
    *   **Key Responsibilities:**
        *   Renders the header with the app title and user info/logout button (using `useAuth`).
        *   Renders a placeholder sidebar navigation.
        *   Renders its `children` prop in the main content area (`.dashboard-content`).
        *   Renders the `NexusInputBar` at the bottom, passing down the `onQuerySubmit` callback and `loading` state received from its parent (`DashboardPage`).
    *   **Imports:** Imports `React`, `useAuth`, `NexusInputBar`.
    *   **Notes:** Designed to be a wrapper component used by `DashboardPage` and potentially other authenticated pages. The logout functionality is included in the header for easy access.

*   `my-nexus-react-app/src/components/ActionItem.tsx`
    *   **Purpose:** Renders a single draggable square representing a dashboard action (e.g., "Add New Company").
    *   **Key Responsibilities:**
        *   Uses the `react-draggable` library to make the component draggable.
        *   Displays the `actionName` text, allowing text wrapping.
        *   Handles click events and calls the optional `onActionClick` prop, passing its `actionName`.
    *   **Imports:** Imports `React`, `Draggable` from `react-draggable`.
    *   **Notes:** Styling ensures it's a fixed-size square with flexbox centering for the text.

*   `my-nexus-react-app/src/components/ActionGridSection.tsx`
    *   **Purpose:** A container component that displays a title and a collection of `ActionItem` components in a flexible, wrapping grid.
    *   **Key Responsibilities:**
        *   Renders a title (`<h2>`).
        *   Maps over an array of action names (`actions` prop) to render an `ActionItem` for each.
        *   Passes the `onActionClick` prop down to each `ActionItem`.
        *   Uses CSS flexbox to arrange the items.
    *   **Imports:** Imports `React`, `ActionItem`.
    *   **Notes:** This component is rendered by `DashboardPage` when the `overview` view is active.

*   `my-nexus-react-app/src/components/CompanyTable.tsx`
    *   **Purpose:** Fetches and displays data from the `company_tracker` table in a standard HTML table.
    *   **Key Responsibilities:**
        *   Uses `useState` for managing the list of companies, loading state, and error state.
        *   Uses `useApi` to perform an authenticated `GET` request to `/wp-json/nexus/v1/companies` within a `useEffect` hook.
        *   Includes `refreshTrigger` in the `useEffect` dependencies to refetch data when a parent signals a change.
        *   Renders loading, error, or "no companies found" messages.
        *   Maps over the fetched company data to render table rows.
    *   **Imports:** Imports `React`, `useState`, `useEffect`, `useApi`.
    *   **Notes:** Assumes the custom backend endpoint `/companies` is implemented for GET requests.

*   `my-nexus-react-app/src/components/CompanyForm.tsx`
    *   **Purpose:** Renders a form for creating a new entry in the `company_tracker` table.
    *   **Key Responsibilities:**
        *   Manages local state (`formData`) for all input fields.
        *   Handles input changes (`handleInputChange`).
        *   Implements the `handleSubmit` function to send an authenticated `POST` request to `/wp-json/nexus/v1/companies` using `useApi`.
        *   Handles loading, error, and success states for the submission.
        *   Clears the form and calls `onCompanyCreated` callback on success.
        *   Includes an optional "Cancel" button calling `onCancel` callback.
    *   **Imports:** Imports `React`, `useState`, `useApi`.
    *   **Notes:** Assumes the custom backend endpoint `/companies` is implemented for POST requests. **Includes example fields, you need to add inputs for all relevant columns from your schema.**

*   `my-nexus-react-app/src/components/NexusInputBar.tsx`
    *   **Purpose:** Renders the input field and button for submitting natural language queries.
    *   **Key Responsibilities:**
        *   Manages local state for the input `query`.
        *   Handles input changes (`handleInputChange`).
        *   Implements `handleSubmit` to call the `onQuerySubmit` callback prop with the trimmed query text.
        *   Uses the `loading` prop to disable input/button and change placeholder text.
    *   **Imports:** Imports `React`, `useState`.
    *   **Notes:** This component is rendered by `DashboardLayout`. It only provides the UI; the logic for *sending* the query using `useApi` and handling the response is in its parent (`DashboardPage`).

---

## Backend (WordPress / PHP)

The WordPress backend provides the database and custom REST API endpoints that the React frontend interacts with. It uses the global `$wpdb` object securely to interact with custom tables.

### Core Configuration

*   `Local Sites/your-site-name/app/public/wp-config.php`
    *   **Purpose:** The main WordPress configuration file.
    *   **Key Modification:** **Requires adding the line `define('JWT_AUTH_SECRET_KEY', 'YOUR_VERY_SECRET_KEY_GOES_HERE');`** with a unique, secret string. This key is used by the JWT Authentication plugin to sign and verify tokens.
    *   **Critical Note:** The value of `JWT_AUTH_SECRET_KEY` **must be kept secret** and should be a strong, random string different from your WordPress salts.

### Custom Plugin

*   `Local Sites/your-site-name/app/public/wp-content/plugins/aragrow-timegrow-nexus/aragrow-timegrow-nexus.php`
    *   **Purpose:** The main file for your custom WordPress plugin. WordPress recognizes this file as a plugin entry point based on the plugin header comments.
    *   **Key Responsibilities:**
        *   Includes the file containing the `Nexus_Custom_Endpoints` class.
        *   Hooks the `Nexus_Custom_Endpoints::register_routes` static method to the `rest_api_init` WordPress action. This action is the standard way to register custom REST API endpoints.
    *   **Notes:** You need to activate this plugin in the WordPress admin dashboard.

*   `Local Sites/your-site-name/app/public/wp-content/plugins/aragrow-timegrow-nexus/routes/includes/class-nexus-custom-endpoints.php`
    *   **Purpose:** Contains the PHP class responsible for defining and handling your custom REST API endpoints under the `nexus/v1` namespace.
    *   **Key Responsibilities:**
        *   Defines the namespace and constructs table names with the `$wpdb->prefix`.
        *   Implements the `register_routes` static method using `register_rest_route()` to define endpoints (`/companies`, `/query`).
        *   Defines `permission_callback` methods (`_permissions_check`) for each route to ensure the user is logged in and has necessary capabilities.
        *   Defines `callback` methods (`get_companies`, `create_company`, `handle_natural_language_query`) containing the logic to interact with the database and return responses.
        *   **Crucially:** Uses `$wpdb->prepare()`, `$wpdb->insert()`, `$wpdb->get_results()`, etc., with proper parameter handling (`%s`, `%d`, `%f`) and sanitization/validation (both in `args` and explicitly in callbacks) to prevent SQL injection and ensure data integrity.
        *   Includes placeholder logic for `handle_natural_language_query` demonstrating how the backend receives the query and structures a response, but lacks actual NLP implementation.
    *   **Dependencies:** Relies on the global `$wpdb` object provided by WordPress.
    *   **Critical Notes:**
        *   You need to **create your custom database tables** (`company_tracker`, etc.) in the WordPress database if you haven't already. This class *interacts* with them but doesn't *create* them. (Table creation is typically done in a plugin activation hook using `dbDelta`).
        *   The `args` validation and sanitization for each endpoint are essential for security.
        *   The permission checks are crucial for controlling access.
        *   The NLP logic in `handle_natural_language_query` is a **placeholder** and requires significant development.

---

This documentation provides a detailed overview of each file's role within the project. Remember to replace the placeholder URLs and secret key, and to ensure your custom database tables exist and CORS is configured correctly.