import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { appConfig } from '../../config/appConfig';
import { useSupabaseHealthCheck } from '../../hooks/useSupabaseHealthCheck';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { getExpiresAt } from '../../lib/sessionManager';
import { ProfileSettingsModal } from '../profile/ProfileSettingsModal';
import { ChangePasswordModal } from '../profile/ChangePasswordModal';

type NavbarProps = {
  onMenuClick?: () => void;
};

export function Navbar({ onMenuClick }: NavbarProps) {
  const { status } = useSupabaseHealthCheck();
  const { user, logout, getUserRole } = useAuth();
  const navigate = useNavigate();
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(0);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [connectionDropdownOpen, setConnectionDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const connectionDropdownRef = useRef<HTMLDivElement>(null);
  
  const userRole = getUserRole();
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (connectionDropdownRef.current && !connectionDropdownRef.current.contains(event.target as Node)) {
        setConnectionDropdownOpen(false);
      }
    };
    
    if (profileDropdownOpen || connectionDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen, connectionDropdownOpen]);
  
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
            <img 
              src="/aks logo.jpeg" 
              alt="Aiklisolve Logo" 
              className="h-9 w-9 rounded-xl object-cover shadow-soft border border-brand/30"
            />
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
              </span>
              <input
                type="search"
                placeholder="Search modules, records..."
                className="w-full rounded-full border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand focus-visible:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Connection Status Dropdown */}
            <div className="relative" ref={connectionDropdownRef}>
              <button
                type="button"
                onClick={() => setConnectionDropdownOpen(!connectionDropdownOpen)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all hover:shadow-sm ${
                  status === 'connected'
                    ? 'border-emerald-400/60 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'border-amber-400/60 bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full animate-pulse ${
                    status === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                {status === 'connected' ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Connected</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Demo Mode</span>
                  </>
                )}
                <svg className={`w-3 h-3 transition-transform ${connectionDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Connection Dropdown Menu */}
              {connectionDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50">
                  {/* Connection Status */}
                  <div className="px-4 py-3 border-b border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-900">Connection Status</span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                          status === 'connected'
                            ? 'border-emerald-400/60 bg-emerald-50 text-emerald-700'
                            : 'border-amber-400/60 bg-amber-50 text-amber-700'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${status === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        {status === 'connected' ? 'Live' : 'Demo'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600">
                      {status === 'connected' 
                        ? 'Connected to Supabase database. All data is synced in real-time.'
                        : 'Using local demo data. Connect to Supabase for live data.'}
                    </p>
                  </div>
                  
                  {/* Database Info */}
                  {status === 'connected' && (
                    <div className="px-4 py-3 border-b border-slate-200">
                      <div className="text-[10px] space-y-1.5">
                        <div className="flex items-center gap-2">
                          <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                          </svg>
                          <span className="text-slate-700 font-medium">Supabase Database</span>
                        </div>
                        {/* <div className="flex items-center gap-2 pl-5"> */}
                          {/* <span className="text-slate-500">URL:</span> */}
                          {/* <span className="text-slate-700 font-mono truncate">{import.meta.env.VITE_SUPABASE_URL?.replace('https://', '').split('.')[0]}...</span> */}
                        {/* </div> */}
                        {/* <div className="flex items-center gap-2 pl-5">
                          <span className="text-slate-500">Region:</span>
                          <span className="text-slate-700">Auto-detected</span>
                        </div> */}
                      </div>
                    </div>
                  )}
                  
                  {/* Demo Mode Info */}
                  {status === 'static-demo' && (
                    <div className="px-4 py-3 border-b border-slate-200 bg-amber-50/50">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="text-[10px]">
                          <p className="text-amber-800 font-medium mb-1">Demo Mode Active</p>
                          <p className="text-amber-700">
                            Configure Supabase credentials in your .env file to enable live data connection.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  {/* <div className="px-4 py-2">
                    {status === 'connected' ? (
                      // <button
                      //   type="button"
                      //   onClick={() => {
                      //     window.open(import.meta.env.VITE_SUPABASE_URL, '_blank');
                      //     setConnectionDropdownOpen(false);
                      //   }}
                      //   className="w-full px-3 py-2 text-left text-xs text-emerald-700 hover:bg-emerald-50 flex items-center justify-between gap-2 transition-colors rounded-md border border-emerald-200"
                      // >
                      //   <span className="flex items-center gap-2">
                      //     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      //     </svg>
                      //     <span>Open Supabase Dashboard</span>
                      //   </span>
                      //   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      //     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      //   </svg>
                      // </button>
                    ) : (
                      // <div className="text-[10px] text-slate-600 bg-slate-50 px-3 py-2 rounded-md">
                      //   <p className="font-medium text-slate-700 mb-1">To connect Supabase:</p>
                      //   <ol className="list-decimal list-inside space-y-0.5 text-slate-600">
                      //     <li>Create a .env file in project root</li>
                      //     <li>Add VITE_SUPABASE_URL</li>
                      //     <li>Add VITE_SUPABASE_ANON_KEY</li>
                      //     <li>Restart the dev server</li>
                      //   </ol>
                      // </div>
                    )}
                  </div> */}
                </div>
              )}
            </div>
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
              
              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-light/20 to-primary/10 border-2 border-primary/30 text-sm font-bold text-primary shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200"
                >
                  {user.email?.[0]?.toUpperCase() ?? 'U'}
                </button>
                
                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-slate-200">
                      <p className="text-xs font-semibold text-slate-900 truncate">{user.email}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{userRole?.replace('_', ' ')}</p>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileSettings(true);
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Edit Profile</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setShowChangePassword(true);
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        <span>Change Password</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          navigate('/dashboard');
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span>Dashboard</span>
                      </button>
                    </div>
                    
                    {/* Logout */}
                    <div className="border-t border-slate-200 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
      
      {/* Modals */}
      {showProfileSettings && (
        <ProfileSettingsModal
          open={showProfileSettings}
          onClose={() => setShowProfileSettings(false)}
        />
      )}
      
      {showChangePassword && (
        <ChangePasswordModal
          open={showChangePassword}
          onClose={() => setShowChangePassword(false)}
        />
      )}
    </header>
  );
}


