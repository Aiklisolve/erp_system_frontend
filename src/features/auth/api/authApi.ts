import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import { staticUsers, type StaticUser, type ErpRole } from '../data/staticUsers';
import {
  createSession,
  clearSession,
  getSession,
  refreshSession,
  getToken,
  getSessionId
} from '../../../lib/sessionManager';
import { validateSession, generateToken, generateSessionId } from '../../../lib/sessionValidator';
import type { User } from '@supabase/supabase-js';

export type AuthMode = 'static' | 'supabase';

// Toggle this flag to switch between static and Supabase auth
let authMode: AuthMode = hasSupabaseConfig ? 'supabase' : 'static';

export function setAuthMode(mode: AuthMode) {
  authMode = mode;
}

export function getAuthMode(): AuthMode {
  return authMode;
}

function findStaticUser(email: string, password: string): StaticUser | null {
  return staticUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  ) ?? null;
}

function createMockUserFromStatic(staticUser: StaticUser): User {
  return {
    id: staticUser.id,
    email: staticUser.email,
    app_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    user_metadata: {
      full_name: staticUser.fullName,
      role: staticUser.role,
      department: staticUser.department
    }
  } as User;
}

export async function login(email: string, password: string): Promise<User | null> {
  // Static mode: check against static users
  if (authMode === 'static') {
    const user = findStaticUser(email, password);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    // Create session with proper session management
    createSession(user);
    // Also store in localStorage for backward compatibility
    localStorage.setItem('static_user', JSON.stringify(user));
    return createMockUserFromStatic(user);
  }

  // Supabase mode: use Supabase auth
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data.user;
  } catch (error) {
    handleApiError('auth.login', error);
    // Fallback to static mode on error
    const user = findStaticUser(email, password);
    if (user) {
      localStorage.setItem('static_user', JSON.stringify(user));
      return createMockUserFromStatic(user);
    }
    throw error;
  }
}

export async function register(
  email: string,
  password: string,
  fullName: string,
  role: ErpRole = 'VIEWER'
): Promise<User | null> {
  // Static mode: add to static users array (for demo only - in production this would be stored)
  if (authMode === 'static') {
    const newUser: StaticUser = {
      id: `user-${Date.now()}`,
      email,
      password,
      fullName,
      role,
      department: 'General'
    };
    // Note: In a real app, you'd save this to a backend. For demo, we just store in localStorage
    const existingUsers = JSON.parse(localStorage.getItem('static_users') || '[]');
    existingUsers.push(newUser);
    localStorage.setItem('static_users', JSON.stringify(existingUsers));
    
    // Create session for new user
    createSession(newUser);
    localStorage.setItem('static_user', JSON.stringify(newUser));
    return createMockUserFromStatic(newUser);
  }

  // Supabase mode: use Supabase auth
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          full_name: fullName,
          role,
          department: 'General'
        }
      }
    });
    if (error) throw error;
    return data.user;
  } catch (error) {
    handleApiError('auth.register', error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  // Get session_id before clearing localStorage
  const sessionId = getSessionId() || 
    (() => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== 'undefined') {
          const parsedUser = JSON.parse(storedUser);
          return parsedUser?.session_id;
        }
      } catch {
        // Ignore parsing errors
      }
      return null;
    })();

  // Call backend logout API if session_id exists and API is configured
  if (sessionId && import.meta.env.VITE_API_BASE_URL) {
    try {
      const token = getToken();
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/sessions/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          session_id: sessionId
        })
      });
      console.log('Backend logout successful');
    } catch (error) {
      // Even if backend logout fails, continue with local logout
      console.error('Backend logout error:', error);
    }
  }

  // Clear session and localStorage
  clearSession();
  
  if (authMode === 'supabase' && hasSupabaseConfig) {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      handleApiError('auth.logout', error);
    }
  }
}

// Generate a 4-digit OTP for demo purposes
function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Store pending login attempts with OTP
const pendingLogins = new Map<string, { otp: string; user: StaticUser; expiresAt: number }>();

// Clean up expired pending logins
function cleanupExpiredLogins() {
  const now = Date.now();
  for (const [email, data] of pendingLogins.entries()) {
    if (data.expiresAt < now) {
      pendingLogins.delete(email);
    }
  }
}

export async function sendOTP(email: string, password: string): Promise<{ success: boolean; otp?: string; error?: string }> {
  cleanupExpiredLogins();
  
  try {
    // Validate credentials first
    const user = findStaticUser(email, password);
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    // Store pending login
    pendingLogins.set(email.toLowerCase(), {
      otp,
      user,
      expiresAt
    });

    // In production, you would send OTP via email/SMS here
    // For demo, we return it directly
    console.log(`[Demo] OTP for ${email}: ${otp} (expires in 10 minutes)`);

    return { success: true, otp };
  } catch (error) {
    handleApiError('auth.sendOTP', error);
    return { success: false, error: 'Failed to send OTP. Please try again.' };
  }
}

export async function verifyOTPAndLogin(
  email: string,
  otp: string
): Promise<User | null> {
  cleanupExpiredLogins();

  const pending = pendingLogins.get(email.toLowerCase());
  
  if (!pending) {
    throw new Error('No pending login found. Please start the login process again.');
  }

  if (pending.expiresAt < Date.now()) {
    pendingLogins.delete(email.toLowerCase());
    throw new Error('OTP has expired. Please request a new one.');
  }

  if (pending.otp !== otp) {
    throw new Error('Invalid OTP. Please try again.');
  }

  // OTP is valid, proceed with login
  const user = pending.user;
  pendingLogins.delete(email.toLowerCase());

  // Generate JWT token and session ID
  const token = generateToken(user.id, user.email);
  const sessionId = generateSessionId();
  
  // Calculate expiry time (15 minutes from now)
  const expiresAt = Date.now() + 15 * 60 * 1000;

  // Create session with JWT token and session ID
  createSession(user, token, sessionId, expiresAt);
  
  // Also store in localStorage for backward compatibility
  localStorage.setItem('static_user', JSON.stringify(user));

  // Validate session after creation
  const validationResult = await validateSession(sessionId, token);
  if (!validationResult.valid) {
    clearSession();
    throw new Error('Session validation failed. Please try logging in again.');
  }
  
  return createMockUserFromStatic(user);
}

export async function getCurrentUser(): Promise<User | null> {
  // Check session first (preferred method)
  const session = getSession();
  if (session && session.user) {
    // Validate session with backend (if configured)
    const sessionId = session.session_id || getSessionId();
    const token = session.token || getToken();
    
    if (sessionId && token) {
      const validationResult = await validateSession(sessionId, token);
      if (!validationResult.valid) {
        // Session is invalid, clear it
        clearSession();
        return null;
      }
    }
    
    // Refresh session if needed (extend expiry)
    refreshSession();
    return createMockUserFromStatic(session.user);
  }

  // Fallback: Check localStorage for user and token
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');
  const storedSessionId = localStorage.getItem('session_id');
  
  if (storedUser && storedToken && storedUser !== 'undefined' && storedToken !== 'undefined') {
    try {
      const user: StaticUser = JSON.parse(storedUser);
      
      // Validate session if session_id exists
      if (storedSessionId) {
        const validationResult = await validateSession(storedSessionId, storedToken);
        if (!validationResult.valid) {
          clearSession();
          return null;
        }
      }
      
      // Migrate to session if not already in session
      const expiresAt = localStorage.getItem('expires_at');
      createSession(
        user,
        storedToken,
        storedSessionId || undefined,
        expiresAt ? parseInt(expiresAt, 10) : undefined
      );
      return createMockUserFromStatic(user);
    } catch {
      // Invalid JSON, continue to Supabase check
    }
  }

  // Supabase mode
  if (authMode === 'supabase' && hasSupabaseConfig) {
    try {
      const { data } = await supabase.auth.getUser();
      return data.user ?? null;
    } catch (error) {
      handleApiError('auth.getCurrentUser', error);
      return null;
    }
  }

  return null;
}
