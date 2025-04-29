/**
 * Authentication Context.
 *
 * This file provides the AuthContext using React's Context API.
 * It manages the application's authentication state (JWT token, user data, loading status).
 * - It reads the token from Local Storage on initialization for persistence.
 * - It includes functions to log in (set token, fetch user) and log out (clear token, clear user).
 * - It provides a custom hook `useAuth` for easily accessing the context value in components.
 */
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from 'react';

// Define a basic interface for the user object fetched from the /users/me endpoint
interface User {
  id: number;
  name: string;
  // Future expansions:
  // email?: string;
  // roles?: string[];
}

// Define the shape of the context value that will be provided
interface AuthContextType {
  token: string | null;
  user: User | null;
  loadingUser: boolean;
  login: (newToken: string) => void;
  logout: () => void;
  loginError: string | null; // Added to track login or token validation errors
}

// Create the Context with a default null value
const AuthContext = createContext<AuthContextType | null>(null);

// Environment config (you could later pull this from a .env file if needed)
const WP_API_URL = 'http://localhost:10003';

// AuthProvider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('wp_jwt_token'));
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Fetch user based on token
  const fetchUser = useCallback(async (currentToken: string): Promise<User | null> => {
    setLoadingUser(true);
    try {
      const response = await fetch(`${WP_API_URL}/wp-json/wp/v2/users/me`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch user data. Token might be invalid or expired.', response.status);
        return null;
      }

      const userData = await response.json();
      const mappedUser: User = {
        id: userData.id,
        name: userData.name || userData.slug,
        // Add fields as needed (e.g., email: userData.email)
      };

      console.log('User data fetched successfully:', mappedUser);
      return mappedUser;
    } catch (err) {
      console.error('Error fetching user data:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    console.log('Auth effect running. Current token:', token);

    const initializeAuth = async () => {
      if (token) {
        const fetchedUser = await fetchUser(token);
        if (fetchedUser) {
          setUser(fetchedUser);
          setLoginError(null);
        } else {
          logout();
          setLoginError('Session expired. Please log in again.');
        }
      } else {
        setUser(null);
      }
      setLoadingUser(false);
    };

    initializeAuth();
  }, [token, fetchUser]);

  // Login function
  const login = (newToken: string) => {
    console.log('Login function called with new token:', newToken);
    try {
      localStorage.setItem('wp_jwt_token', newToken);
      setToken(newToken);
      setLoginError(null);
    } catch (error) {
      console.error('Failed to store token in localStorage:', error);
      setLoginError('Unable to store authentication data.');
    }
  };

  // Logout function
  const logout = () => {
    console.log('Logout function called.');
    try {
      localStorage.removeItem('wp_jwt_token');
    } catch (error) {
      console.error('Failed to remove token from localStorage:', error);
    }
    setToken(null);
    setUser(null);
  };

  const contextValue: AuthContextType = {
    token,
    user,
    loadingUser,
    login,
    logout,
    loginError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {loadingUser ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.5rem',
        }}>
          Loading application...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

// Custom Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
