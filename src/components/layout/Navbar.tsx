import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { appConfig } from '../../config/appConfig';
import { useSupabaseHealthCheck } from '../../hooks/useSupabaseHealthCheck';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { getExpiresAt } from '../../lib/sessionManager';

export function Navbar() {
  const { status } = useSupabaseHealthCheck();
  const { user, logout, getUserRole } = useAuth();
  const navigate = useNavigate();
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(0);
  
  const userRole = getUserRole();
  
  const handleLogout = async () => {
    try {
      // Call logout which will clear all session data and redirect
      await logout();
      // The logout function in useAuth already handles redirect,
      // but we can also use navigate as a backup
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, redirect to login
      navigate('/login', { replace: true });
    }
  };
  
  // Update session time remaining every minute
  useEffect(() => {
    const updateTimeRemaining = () => {
      const expiresAt = getExpiresAt();
      if (expiresAt) {
        const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / (60 * 1000)));
        setSessionTimeRemaining(remaining);
      } else {
        setSessionTimeRemaining(0);
      }
    };
    
    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60 * 1000); // Update every minute
    
    return () => clearInterval(interval);
  }, [user]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 gap-4">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-light/10 border border-brand/30 text-brand font-semibold text-lg shadow-soft">
              O
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-slate-900">
                {appConfig.brandName}
              </span>
              <span className="text-[11px] text-slate-500">
                {appConfig.shortTagline}
              </span>
            </div>
          </Link>
        </div>

        <div className="flex flex-1 items-center gap-4">
          <div className="hidden md:flex flex-1">
            <div className="relative w-full max-w-md">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400 text-xs">
                🔍
              </span>
              <input
                type="search"
                placeholder="Search modules, records..."
                className="w-full rounded-full border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand focus-visible:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
              status === 'connected'
                ? 'border-emerald-400/60 bg-emerald-50 text-emerald-700'
                : 'border-amber-400/60 bg-amber-50 text-amber-700'
            }`}
            >
              <span
              className={`h-1.5 w-1.5 rounded-full ${
                status === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            {status === 'connected' ? 'Supabase connected' : 'Static demo'}
            </span>
            {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex flex-col items-end leading-tight">
                <span className="text-xs font-medium text-text-primary truncate max-w-[160px]">
                  {user.email}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-text-secondary">
                    {userRole?.replace('_', ' ')}
                  </span>
                  {sessionTimeRemaining > 0 && (
                    <span className="text-[10px] text-text-secondary">
                      • {Math.floor(sessionTimeRemaining / 60)}h {sessionTimeRemaining % 60}m
                    </span>
                  )}
                </div>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light/20 text-[11px] font-semibold text-primary">
                {user.email?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <button
                type="button"
                className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] text-text-primary hover:border-primary/70 hover:text-primary transition-colors"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-[11px] font-medium text-brand hover:text-brand-dark"
            >
              Login
            </Link>
          )}
          </div>
        </div>
      </div>
    </header>
  );
}


