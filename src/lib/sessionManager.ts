import type { StaticUser, ErpRole } from '../features/auth/data/staticUsers';

export interface SessionData {
  user: StaticUser;
  token: string;
  session_id?: string;
  expiresAt: number;
  role: ErpRole;
  loginTime: number;
  is_active?: boolean;
}

const SESSION_KEY = 'erp_session';
const SESSION_EXPIRY_MINUTES = 15; // 15 minutes session expiry

export function createSession(
  user: StaticUser,
  token?: string,
  sessionId?: string,
  expiresAt?: number
): SessionData {
  // Use provided expiresAt or calculate 15 minutes from now
  const sessionExpiresAt = expiresAt || Date.now() + SESSION_EXPIRY_MINUTES * 60 * 1000;
  
  const session: SessionData = {
    user,
    token: token || `token_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    session_id: sessionId,
    expiresAt: sessionExpiresAt,
    role: user.role,
    loginTime: Date.now(),
    is_active: true
  };
  
  // Store session in localStorage
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  
  // Also store individual items for easy access (similar to school system)
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', session.token);
  if (sessionId) {
    localStorage.setItem('session_id', sessionId);
  }
  localStorage.setItem('expires_at', sessionExpiresAt.toString());
  localStorage.setItem('is_active', 'true');
  
  return session;
}

export function getSession(): SessionData | null {
  try {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return null;
    
    const session: SessionData = JSON.parse(sessionStr);
    
    // Check if session expired
    if (Date.now() > session.expiresAt) {
      clearSession();
      return null;
    }
    
    return session;
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('static_user');
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('session_id');
  localStorage.removeItem('expires_at');
  localStorage.removeItem('is_active');
}

export function isSessionValid(): boolean {
  const session = getSession();
  return session !== null;
}

export function refreshSession(): SessionData | null {
  const session = getSession();
  if (!session) return null;
  
  // Extend session by another 15 minutes
  const newExpiresAt = Date.now() + SESSION_EXPIRY_MINUTES * 60 * 1000;
  const newSession: SessionData = {
    ...session,
    expiresAt: newExpiresAt
  };
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
  localStorage.setItem('expires_at', newExpiresAt.toString());
  return newSession;
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function getSessionId(): string | null {
  return localStorage.getItem('session_id');
}

export function getExpiresAt(): number | null {
  const expiresAt = localStorage.getItem('expires_at');
  return expiresAt ? parseInt(expiresAt, 10) : null;
}

export function getSessionUser(): StaticUser | null {
  const session = getSession();
  return session?.user || null;
}

export function getSessionRole(): ErpRole | null {
  const session = getSession();
  return session?.role || null;
}

