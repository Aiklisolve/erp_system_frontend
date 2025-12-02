// Session validation utility
// This can be extended to call a backend API for session validation

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export interface ValidationResult {
  valid: boolean;
  reason?: 'missing_credentials' | 'invalid_session' | 'expired_session' | 'validation_error';
}

/**
 * Validate session with backend (if API is configured)
 * Falls back to local validation if API is not available
 */
export async function validateSession(
  sessionId: string | null,
  token: string | null
): Promise<ValidationResult> {
  // If no credentials, session is invalid
  if (!sessionId || !token) {
    return { valid: false, reason: 'missing_credentials' };
  }

  // Check if API is configured
  const hasApiConfig = Boolean(import.meta.env.VITE_API_BASE_URL);

  if (!hasApiConfig) {
    // Local validation: check if token exists and is not expired
    const expiresAt = localStorage.getItem('expires_at');
    if (expiresAt) {
      const expiryTime = parseInt(expiresAt, 10);
      if (Date.now() > expiryTime) {
        return { valid: false, reason: 'expired_session' };
      }
    }
    // For static mode, just check if token exists
    return { valid: true };
  }

  // Backend validation (if API is configured)
  try {
    const response = await fetch(`${API_BASE_URL}/sessions/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        session_id: sessionId,
        token: token
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.valid === true || response.status === 200) {
        return { valid: true };
      }
      return { valid: false, reason: 'invalid_session' };
    }

    if (response.status === 401 || response.status === 403) {
      return { valid: false, reason: 'invalid_session' };
    }

    return { valid: false, reason: 'validation_error' };
  } catch (error) {
    console.error('Session validation error:', error);
    // On error, fall back to local validation
    const expiresAt = localStorage.getItem('expires_at');
    if (expiresAt) {
      const expiryTime = parseInt(expiresAt, 10);
      if (Date.now() > expiryTime) {
        return { valid: false, reason: 'expired_session' };
      }
    }
    return { valid: true }; // Assume valid if validation fails (graceful degradation)
  }
}

/**
 * Generate a JWT-like token (for demo purposes)
 * In production, this would come from the backend
 */
export function generateToken(userId: string, email: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: userId,
      email: email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 15 * 60 // 15 minutes
    })
  );
  // In production, this would include a signature
  return `${header}.${payload}`;
}

/**
 * Generate a session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 15)}`;
}

