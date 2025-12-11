/* eslint-disable react-refresh/only-export-components */
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import * as authApi from '../api/authApi';
import type { ErpRole } from '../data/staticUsers';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role?: ErpRole) => Promise<void>;
  logout: () => Promise<void>;
  getUserRole: () => ErpRole | null;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let sessionCheckInterval: ReturnType<typeof setInterval> | null = null;
    let inactivityTimer: ReturnType<typeof setTimeout> | null = null;

    const init = async () => {
      try {
        // Check localStorage for existing session
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        const storedSessionId = localStorage.getItem('session_id');

        if (storedUser && storedUser !== 'undefined' && storedToken && storedToken !== 'undefined') {
          try {
            const parsedUser = JSON.parse(storedUser);
            
            // Validate session if session_id exists
            if (storedSessionId) {
              const { validateSession } = await import('../../../lib/sessionValidator');
              const validationResult = await validateSession(storedSessionId, storedToken);
              
              if (validationResult.valid) {
                // Session is valid, fetch current user
                const currentUser = await authApi.getCurrentUser();
                if (!isMounted) return;
                setUser(currentUser);
              } else {
                // Session is invalid, logout
                console.log('Session validation failed on app load:', validationResult.reason);
                await authApi.logout();
                if (isMounted) {
                  setUser(null);
                }
              }
            } else {
              // No session_id, try to get current user
              const currentUser = await authApi.getCurrentUser();
              if (!isMounted) return;
              setUser(currentUser);
            }
          } catch (error) {
            console.error('Error parsing stored user:', error);
            await authApi.logout();
            if (isMounted) {
              setUser(null);
            }
          }
        } else {
          // No stored session, try to get current user (for Supabase)
          const currentUser = await authApi.getCurrentUser();
          if (!isMounted) return;
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void init();

    let listener: { subscription: { unsubscribe: () => void } } | null = null;

    if (hasSupabaseConfig) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (isMounted) {
          setUser(session?.user ?? null);
        }
      });
      listener = data;
    }

    // Set up session validation check every 2 minutes
    sessionCheckInterval = setInterval(async () => {
      const currentUser = await authApi.getCurrentUser();
      if (isMounted) {
        setUser(currentUser);
      }
    }, 2 * 60 * 1000); // Check every 2 minutes

    return () => {
      isMounted = false;
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
      }
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      if (listener) {
        listener.subscription.unsubscribe();
      }
    };
  }, []);

  // Inactivity timeout handler - redirects to login after 3 hours of no activity
  useEffect(() => {
    // Only set up inactivity tracking if user is authenticated
    if (!user) {
      return;
    }

    const INACTIVITY_TIMEOUT = 3 * 60 * 60 * 1000; // 3 hours
    let inactivityTimer: ReturnType<typeof setTimeout> | null = null;

    // Function to reset the inactivity timer
    const resetInactivityTimer = () => {
      // Clear existing timer
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }

      // Set new timer - if it expires, logout and redirect
      inactivityTimer = setTimeout(async () => {
        console.log('Session expired due to inactivity');
        await authApi.logout();
        setUser(null);
        // Redirect to login page
        window.location.href = '/login';
      }, INACTIVITY_TIMEOUT);
    };

    // List of events that indicate user activity
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Add event listeners for user activity
    activityEvents.forEach((event) => {
      document.addEventListener(event, resetInactivityTimer, true);
    });

    // Initialize the timer
    resetInactivityTimer();

    // Cleanup function
    return () => {
      // Clear the timer
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      // Remove event listeners
      activityEvents.forEach((event) => {
        document.removeEventListener(event, resetInactivityTimer, true);
      });
    };
  }, [user]);

  const handleLogin = async (email: string, password: string) => {
    setError(null);
    try {
      const user = await authApi.login(email, password);
      setUser(user ?? null);
    } catch (err: any) {
      setError(err?.message ?? 'Unable to login.');
      throw err;
    }
  };

  const handleRegister = async (
    email: string,
    password: string,
    fullName: string,
    role: ErpRole = 'VIEWER'
  ) => {
    setError(null);
    try {
      const user = await authApi.register(email, password, fullName, role);
      setUser(user ?? null);
    } catch (err: any) {
      setError(err?.message ?? 'Unable to register.');
      throw err;
    }
  };

  const handleLogout = async () => {
    setError(null);
    try {
      // Clear user state first
      setUser(null);
      
      // Call logout API which will clear all localStorage
      await authApi.logout();
      
      // Ensure all state is cleared
      setUser(null);
      setError(null);
      
      // Redirect to login page after logout
      // Using window.location.href to ensure full page reload and clear any cached state
      window.location.href = '/login';
    } catch (err: any) {
      setError(err?.message ?? 'Unable to logout.');
      // Even if logout fails, clear user state and localStorage
      setUser(null);
      
      // Force clear localStorage as fallback
      try {
        const { clearSession } = await import('../../../lib/sessionManager');
        clearSession();
      } catch {
        // If import fails, manually clear critical items
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('session_id');
        localStorage.removeItem('erp_session');
      }
      
      // Redirect to login
      window.location.href = '/login';
    }
  };

  const getUserRole = (): ErpRole | null => {
    if (!user) return null;
    return (user.user_metadata?.role as ErpRole) || null;
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        getUserRole,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}


