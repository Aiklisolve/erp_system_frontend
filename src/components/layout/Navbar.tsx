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
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const userRole = getUserRole();
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    
    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);
  
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
            {status === 'connected' ? 'Supabase connected' : 'Live demo'}
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


