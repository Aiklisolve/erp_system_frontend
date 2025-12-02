import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { appConfig } from '../../config/appConfig';
import { useSupabaseHealthCheck } from '../../hooks/useSupabaseHealthCheck';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { getExpiresAt } from '../../lib/sessionManager';

type NavbarProps = {
  onMenuClick?: () => void;
};

export function Navbar({ onMenuClick }: NavbarProps) {
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
  
  // Update session time remaining every 10 seconds for more accurate display
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
    const interval = setInterval(updateTimeRemaining, 10 * 1000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, [user]);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-slate-300 bg-white shadow-md h-[57px]">
      <div className="mx-auto flex max-w-full items-center justify-between px-3 sm:px-4 md:pl-[64px] py-3 gap-2 sm:gap-4 h-full">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            <svg
              className="w-6 h-6 text-slate-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          
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
                  <span className="text-[10px] text-text-secondary font-medium">
                    {userRole?.replace('_', ' ')}
                  </span>
                  {sessionTimeRemaining > 0 && (
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      <span>⏱️</span>
                      <span>Session: {Math.floor(sessionTimeRemaining / 60)}h {sessionTimeRemaining % 60}m</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-light/20 to-primary/10 border-2 border-primary/30 text-sm font-bold text-primary shadow-sm">
                {user.email?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <button
                type="button"
                className="group flex items-center gap-1.5 rounded-lg border-2 border-red-200 bg-gradient-to-r from-red-50 to-red-100 px-3 py-1.5 text-[11px] font-semibold text-red-700 hover:from-red-100 hover:to-red-200 hover:border-red-300 hover:shadow-md transition-all duration-200"
                onClick={handleLogout}
              >
                <svg
                  className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Logout</span>
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


