import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { appConfig } from '../../config/appConfig';
import { staticUsers, type ErpRole, roleDescriptions } from '../../features/auth/data/staticUsers';
import { getAuthMode, sendOTP, verifyOTPAndLogin } from '../../features/auth/api/authApi';

export function LoginPage() {
  const { error, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1); // 1: credentials, 2: OTP
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [selectedRole, setSelectedRole] = useState<ErpRole | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleHelp, setShowRoleHelp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [receivedOtp, setReceivedOtp] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const authMode = getAuthMode();

  const handleStep1Submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setLocalError(null);

    try {
      const result = await sendOTP(email, password);
      if (result.success && result.otp) {
        setReceivedOtp(result.otp);
        setOtpSent(true);
        setShowSuccessPopup(true);
        setStep(2);
        // Hide popup after 3 seconds
        setTimeout(() => {
          setShowSuccessPopup(false);
        }, 3000);
      } else {
        setLocalError(result.error || 'Failed to send OTP');
      }
    } catch (err: any) {
      setLocalError(err?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 4) return;

    setLoading(true);
    setLocalError(null);

    try {
      const user = await verifyOTPAndLogin(email, otp);
      if (user) {
        // Refresh auth context to update user state
        await refreshUser();
        // Navigate to dashboard
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      setLocalError(err?.message || 'Invalid OTP. Please try again.');
      setLoading(false);
    }
  };

  const handleSubmit = step === 1 ? handleStep1Submit : handleStep2Submit;

  const handleRoleSelect = (role: ErpRole) => {
    setSelectedRole(role);
    const user = staticUsers.find((u) => u.role === role);
    if (user) {
      setEmail(user.email);
      setPassword(user.password);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-text-primary">Welcome Back</h2>
        <p className="text-sm text-text-secondary">
          Sign in to access your ERP dashboard
        </p>
      </div>

      {authMode === 'static' && (
        <div className="rounded-xl border border-primary/20 bg-primary-light/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-primary">Demo Mode - Quick Login</p>
            <button
              type="button"
              onClick={() => setShowRoleHelp(!showRoleHelp)}
              className="text-xs text-primary hover:underline"
            >
              {showRoleHelp ? 'Hide' : 'Show'} Role Info
            </button>
          </div>
          {showRoleHelp && (
            <div className="grid grid-cols-2 gap-2 text-[10px] text-text-secondary">
              {Object.entries(roleDescriptions).map(([role, desc]) => (
                <div key={role} className="p-2 bg-white rounded border border-slate-200">
                  <p className="font-semibold text-primary">{role.replace('_', ' ')}</p>
                  <p className="mt-1">{desc}</p>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {staticUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleRoleSelect(user.role)}
                className={`px-3 py-1.5 text-[11px] font-medium rounded-lg border transition-all ${
                  selectedRole === user.role
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-text-secondary border-slate-200 hover:border-primary/50'
                }`}
              >
                {user.role.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      {showSuccessPopup && (
        <div className="fixed top-4 right-4 z-50 animate-slideInRight">
          <div className="bg-gradient-to-r from-primary to-[#0f766e] text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 border border-primary/40">
            <span className="text-2xl font-bold bg-white/20 w-10 h-10 rounded-full flex items-center justify-center">
              ✓
            </span>
            <p className="m-0 text-sm font-semibold">OTP sent successfully!</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {step === 1 ? (
          <>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-semibold text-text-primary">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-text-primary"
                placeholder="your.email@erp.local"
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs font-semibold text-text-primary">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-12 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-text-primary"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={loading}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-xl bg-primary-light/10 border border-primary/30 p-4 mb-2">
              <div className="flex items-center gap-3">
                <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold">
                  ✓
                </div>
                <div>
                  <p className="text-primary font-bold text-sm m-0">OTP Sent Successfully!</p>
                  <p className="text-text-secondary text-xs m-0 mt-1">
                    Sent to {email}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="otp" className="block text-xs font-semibold text-text-primary">
                Enter Verification Code (OTP)
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setOtp(value);
                }}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-text-primary font-bold text-center tracking-widest"
                placeholder="0000"
                maxLength={4}
                autoComplete="one-time-code"
                autoFocus
                disabled={loading}
                style={{ letterSpacing: '0.5em' }}
              />
            </div>

            {receivedOtp && (
              <div className="rounded-xl bg-primary-light/10 border border-primary/30 p-3 text-center">
                <p className="text-primary text-xs font-semibold m-0">
                  Your OTP: <span className="font-bold text-base tracking-wider">{receivedOtp}</span>
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp('');
                setLocalError(null);
                setOtpSent(false);
              }}
              className="text-primary hover:text-[#0f766e] text-xs font-semibold transition-colors flex items-center gap-2"
            >
              <span>←</span> Back to credentials
            </button>
          </>
        )}

        {(error || localError) && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700">
            {localError || error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (step === 1 ? (!email || !password) : !otp || otp.length !== 4)}
          className="w-full bg-primary text-white py-3 rounded-xl font-semibold text-sm transition-all hover:bg-[#0f766e] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {step === 1 ? 'Sending OTP...' : 'Verifying...'}
            </>
          ) : (
            <>
              {step === 1 ? 'Send OTP' : 'Verify & Login'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </form>

      <div className="text-center space-y-2">
        <p className="text-xs text-text-secondary">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create account
          </Link>
        </p>
        {authMode === 'static' && (
          <p className="text-[10px] text-text-secondary">
            Using static demo users. Configure Supabase to enable real authentication.
          </p>
        )}
      </div>
    </div>
  );
}
