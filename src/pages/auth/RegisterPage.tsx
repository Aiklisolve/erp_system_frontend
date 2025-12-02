import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { type ErpRole, roleDescriptions } from '../../features/auth/data/staticUsers';
import { getAuthMode } from '../../features/auth/api/authApi';
import { appConfig } from '../../config/appConfig';

const erpRoles: ErpRole[] = [
  'VIEWER',
  'WAREHOUSE_OPERATOR',
  'SALES_MANAGER',
  'HR_MANAGER',
  'PROCUREMENT_OFFICER',
  'INVENTORY_MANAGER',
  'FINANCE_MANAGER',
  'ADMIN'
];

export function RegisterPage() {
  const { register, error, loading } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<ErpRole>('VIEWER');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRoleHelp, setShowRoleHelp] = useState(false);

  const authMode = getAuthMode();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) return;
    if (password !== confirmPassword) {
      return;
    }

    try {
      await register(email, password, fullName, selectedRole);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by useAuth hook
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-teal-600/10 border border-primary/20 px-4 py-2 text-xs font-medium text-primary">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          New Account
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Create Account</h2>
        <p className="text-sm text-slate-600">
          Join OrbitERP and streamline your business operations
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="fullName" className="block text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>👤</span> Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 text-sm border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white text-slate-900 placeholder:text-slate-400 transition-all"
            placeholder="John Doe"
            required
            autoComplete="name"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>📧</span> Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 text-sm border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white text-slate-900 placeholder:text-slate-400 transition-all"
            placeholder="your.email@company.com"
            required
            autoComplete="email"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>🔒</span> Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 text-sm border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white text-slate-900 placeholder:text-slate-400 transition-all"
              placeholder="Create a strong password"
              required
              autoComplete="new-password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors p-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={loading}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>🔐</span> Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 text-sm border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white text-slate-900 placeholder:text-slate-400 transition-all"
              placeholder="Re-enter your password"
              required
              autoComplete="new-password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors p-1"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              disabled={loading}
            >
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {password && confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <span>⚠️</span> Passwords do not match
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>🎯</span> Select Your Role
            </label>
            <button
              type="button"
              onClick={() => setShowRoleHelp(!showRoleHelp)}
              className="text-xs text-primary hover:text-teal-700 font-semibold transition-colors"
            >
              {showRoleHelp ? '✕ Hide' : '📋 Show'} Role Info
            </button>
          </div>
          
          {showRoleHelp && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs">
              {erpRoles.map((role) => (
                <div key={role} className="flex items-start gap-2">
                  <span className="font-bold text-primary min-w-[140px]">{role.replace('_', ' ')}:</span>
                  <span className="text-slate-600">{roleDescriptions[role]}</span>
                </div>
              ))}
            </div>
          )}
          
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as ErpRole)}
            className="w-full px-4 py-3 text-sm border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white text-slate-900 transition-all"
            disabled={loading}
          >
            {erpRoles.map((role) => (
              <option key={role} value={role}>
                {role.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 px-5 py-4 text-sm text-red-700 flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !fullName || !email || !password || !confirmPassword || password !== confirmPassword}
          className="w-full bg-gradient-to-r from-primary to-teal-600 text-white py-4 rounded-xl font-bold text-base transition-all hover:shadow-2xl hover:shadow-primary/40 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              🚀 Create Account
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </form>

      <div className="text-center space-y-3">
        <p className="text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary hover:text-teal-700 transition-colors">
            Sign in →
          </Link>
        </p>
        <div className="pt-3 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-primary hover:underline">Terms</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
