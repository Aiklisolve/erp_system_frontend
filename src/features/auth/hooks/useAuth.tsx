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

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      // If Supabase isn't configured, immediately fall back to a local mock session
      if (!hasSupabaseConfig) {
        if (!isMounted) return;
        const mockUser = {
          id: 'mock-user',
          email: 'demo@orbieterp.local'
        } as User;
        setUser(mockUser);
        setLoading(false);
        return;
      }

      try {
        const { data } = await supabase.auth.getUser();
        if (!isMounted) return;

        if (data.user) {
          setUser(data.user);
        }
      } catch {
        // if Supabase isn't configured, fall back to a local mock session
        const mockUser = {
          id: 'mock-user',
          email: 'demo@orbieterp.local'
        } as User;
        setUser(mockUser);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void init();

    if (!hasSupabaseConfig) {
      return () => {
        isMounted = false;
      };
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setError(null);

    // In mock mode, just set a demo user and exit.
    if (!hasSupabaseConfig) {
      const mockUser = {
        id: 'mock-user',
        email
      } as User;
      setUser(mockUser);
      return;
    }

    try {
      const user = await authApi.login(email, password);
      setUser(user ?? null);
    } catch (err: any) {
      setError(err?.message ?? 'Unable to login.');
    }
  };

  const handleRegister = async (
    email: string,
    password: string,
    fullName: string
  ) => {
    setError(null);

    if (!hasSupabaseConfig) {
      const mockUser = {
        id: 'mock-user',
        email,
        user_metadata: { full_name: fullName }
      } as unknown as User;
      setUser(mockUser);
      return;
    }

    try {
      const user = await authApi.register(email, password, fullName);
      setUser(user ?? null);
    } catch (err: any) {
      setError(err?.message ?? 'Unable to register.');
    }
  };

  const handleLogout = async () => {
    setError(null);

    if (!hasSupabaseConfig) {
      setUser(null);
      return;
    }

    try {
      await authApi.logout();
      setUser(null);
    } catch (err: any) {
      setError(err?.message ?? 'Unable to logout.');
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
        logout: handleLogout
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


