import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { appConfig } from '../../config/appConfig';
import { staticUsers, type ErpRole, roleDescriptions } from '../../features/auth/data/staticUsers';
import { getAuthMode, sendOTP, verifyOTPAndLogin } from '../../features/auth/api/authApi';
import { toast } from '../../lib/toast';

export function LoginPage() {
  const { login: authLogin, error, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: select method, 2: enter contact, 3: enter OTP
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpId, setOtpId] = useState<string | null>(null);
  const [otpMethod, setOtpMethod] = useState<'EMAIL' | 'PHONE'>('EMAIL');
  const [selectedRole, setSelectedRole] = useState<ErpRole | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleHelp, setShowRoleHelp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [receivedOtp, setReceivedOtp] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [loginMode, setLoginMode] = useState<'otp' | 'direct'>('direct'); // 'otp' or 'direct'

  const authMode = getAuthMode();

  // Direct login handler (for backend API)
  const handleDirectLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setLocalError(null);

    try {
      await authLogin(email, password);
      toast.success('Login successful!');
      await refreshUser();
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setLocalError(err?.message || 'Login failed. Please check your credentials.');
      toast.error(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Select Email or Phone
  const handleSelectMethod = (method: 'EMAIL' | 'PHONE') => {
    setOtpMethod(method);
    setStep(2);
    setLocalError(null);
  };

  // Step 2: Send OTP
  const handleSendOTP = async (e: FormEvent) => {
    e.preventDefault();
    
    if (otpMethod === 'EMAIL' && !email) {
      setLocalError('Email is required');
      return;
    }
    if (otpMethod === 'PHONE' && !phone) {
      setLocalError('Phone number is required');
      return;
    }

    setLoading(true);
    setLocalError(null);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
      
      const requestBody = otpMethod === 'EMAIL' 
        ? { email, method: 'EMAIL' }
        : { phone, method: 'PHONE' };
      
      console.log('Sending OTP:', requestBody);
      
      const response = await fetch(`${API_BASE_URL}/auth/otp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('OTP Send Response:', data);

      if (response.ok && data.success && data.data) {
        const backendOtp = data.data.otp || data.otp;
        const backendOtpId = data.data.otp_id || data.otp_id;
        
        setReceivedOtp(backendOtp);
        setOtpId(backendOtpId?.toString() || null);
        setOtpSent(true);
        setShowSuccessPopup(true);
        setStep(3);
        
        toast.success(`OTP sent to your ${otpMethod === 'EMAIL' ? 'email' : 'phone'}!`);
        
        setTimeout(() => {
          setShowSuccessPopup(false);
        }, 3000);
      } else {
        setLocalError(data.message || 'Failed to send OTP');
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      console.error('Send OTP error:', err);
      setLocalError(err?.message || 'Failed to send OTP. Please try again.');
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify OTP
  const handleVerifyOTP = async (e: FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setLocalError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setLocalError(null);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
      
      const requestBody = otpMethod === 'EMAIL'
        ? { email, otp_code: otp, otp_id: otpId }
        : { phone, otp_code: otp, otp_id: otpId };
      
      console.log('Verifying OTP:', requestBody);
      
      const response = await fetch(`${API_BASE_URL}/auth/otp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('OTP Verify Response:', data);

      if (response.ok && data.success && data.data) {
        const { user: backendUser, token, session_id } = data.data;
        
        // Store all authentication data
        localStorage.setItem('token', token);
        localStorage.setItem('session_id', session_id?.toString() || '');
        localStorage.setItem('user', JSON.stringify(backendUser));
        localStorage.setItem('expires_at', (Date.now() + 60 * 60 * 1000).toString());
        
        toast.success('Login successful!');
        await refreshUser();
        navigate('/dashboard', { replace: true });
      } else {
        setLocalError(data.message || 'Invalid OTP. Please try again.');
        toast.error(data.message || 'Invalid OTP');
      }
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      setLocalError(err?.message || 'Failed to verify OTP. Please try again.');
      toast.error('Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = loginMode === 'direct' ? handleDirectLogin : (step === 2 ? handleSendOTP : handleVerifyOTP);

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
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-teal-600/10 border border-primary/20 px-4 py-2 text-xs font-medium text-primary">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Secure Login
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Welcome Back</h2>
        <p className="text-sm text-slate-600">
          Sign in to access your ERP dashboard
        </p>
      </div>

      {authMode === 'static' && (
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-teal-600/5 p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎭</span>
              <p className="text-sm font-bold text-primary">Demo Mode - Quick Login</p>
            </div>
            <button
              type="button"
              onClick={() => setShowRoleHelp(!showRoleHelp)}
              className="text-xs text-primary hover:text-teal-700 font-semibold transition-colors"
            >
              {showRoleHelp ? '✕ Hide' : '📋 Show'} Roles
            </button>
          </div>
          {showRoleHelp && (
            <div className="grid grid-cols-2 gap-3 text-[10px]">
              {Object.entries(roleDescriptions).map(([role, desc]) => (
                <div key={role} className="p-3 bg-white/80 backdrop-blur rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <p className="font-bold text-primary mb-1">{role.replace('_', ' ')}</p>
                  <p className="text-slate-600 leading-relaxed">{desc}</p>
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
                className={`px-4 py-2 text-xs font-semibold rounded-xl border-2 transition-all ${
                  selectedRole === user.role
                    ? 'bg-gradient-to-r from-primary to-teal-600 text-white border-primary shadow-lg scale-105'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-primary/50 hover:shadow-md'
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
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400">
            <span className="text-2xl font-bold bg-white/20 w-12 h-12 rounded-full flex items-center justify-center">
              ✓
            </span>
            <p className="m-0 text-sm font-semibold">OTP sent successfully!</p>
          </div>
        </div>
      )}

      {/* Login Mode Toggle */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
        <button
          type="button"
          onClick={() => setLoginMode('direct')}
          className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            loginMode === 'direct'
              ? 'bg-white text-primary shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🔑 Password Login
        </button>
        <button
          type="button"
          onClick={() => setLoginMode('otp')}
          className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            loginMode === 'otp'
              ? 'bg-white text-primary shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📧 OTP Login
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Password Login Mode */}
        {loginMode === 'direct' && (
          <>
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
                placeholder="your.email@aiklisolve.com"
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
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors p-1"
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
        )}
        
        {/* OTP Login Mode */}
        {loginMode === 'otp' && (
          <>
            {/* Step 1: Select Method */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm font-bold text-slate-900 mb-2">Choose OTP Delivery Method</p>
                  <p className="text-xs text-slate-600">Select how you want to receive your verification code</p>
                </div>
                
                <button
                  type="button"
                  onClick={() => handleSelectMethod('EMAIL')}
                  className="w-full p-4 border-2 border-slate-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-4 group"
                >
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    📧
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold text-slate-900 text-sm">Email OTP</p>
                    <p className="text-xs text-slate-600">Send verification code to your email</p>
                  </div>
                  <svg className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleSelectMethod('PHONE')}
                  className="w-full p-4 border-2 border-slate-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-4 group"
                >
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    📱
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold text-slate-900 text-sm">Phone OTP</p>
                    <p className="text-xs text-slate-600">Send verification code to your phone</p>
                  </div>
                  <svg className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
            
            {/* Step 2: Enter Email or Phone */}
            {step === 2 && (
              <>
                <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg">
                      {otpMethod === 'EMAIL' ? '📧' : '📱'}
                    </div>
                    <div>
                      <p className="text-blue-800 font-bold text-sm m-0">
                        OTP via {otpMethod === 'EMAIL' ? 'Email' : 'Phone'}
                      </p>
                      <p className="text-blue-600 text-xs m-0 mt-1">
                        Enter your {otpMethod === 'EMAIL' ? 'email address' : 'phone number'} to receive OTP
                      </p>
                    </div>
                  </div>
                </div>
                
                {otpMethod === 'EMAIL' ? (
                  <div className="space-y-2">
                    <label htmlFor="email-otp" className="block text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>📧</span> Email Address
                    </label>
                    <input
                      id="email-otp"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white text-slate-900 placeholder:text-slate-400 transition-all"
                      placeholder="your.email@aiklisolve.com"
                      required
                      autoComplete="email"
                      autoFocus
                      disabled={loading}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>📱</span> Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white text-slate-900 placeholder:text-slate-400 transition-all"
                      placeholder="1234567890"
                      required
                      autoComplete="tel"
                      autoFocus
                      disabled={loading}
                    />
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setLocalError(null);
                  }}
                  className="text-primary hover:text-teal-700 text-sm font-bold transition-colors flex items-center gap-2"
                >
                  <span>←</span> Change method
                </button>
              </>
            )}
            
            {/* Step 3: Enter OTP */}
            {step === 3 && (
              <>
                <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 p-5 mb-2">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold shadow-lg">
                      ✓
                    </div>
                    <div>
                      <p className="text-emerald-700 font-bold text-base m-0">OTP Sent Successfully!</p>
                      <p className="text-emerald-600 text-sm m-0 mt-1">
                        {otpMethod === 'EMAIL' ? `📧 Sent to ${email}` : `📱 Sent to ${phone}`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="otp" className="block text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>🔐</span> Enter Verification Code (OTP)
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(value);
                    }}
                    className="w-full px-4 py-4 text-2xl border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white text-slate-900 font-bold text-center tracking-widest transition-all"
                    placeholder="000000"
                    maxLength={6}
                    autoComplete="one-time-code"
                    autoFocus
                    disabled={loading}
                    style={{ letterSpacing: '0.5em' }}
                  />
                </div>

                {receivedOtp && (
                  <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-teal-600/10 border-2 border-primary/30 p-4 text-center">
                    <p className="text-primary text-sm font-semibold m-0">
                      🎯 Your OTP: <span className="font-bold text-2xl tracking-wider ml-2">{receivedOtp}</span>
                    </p>
                    <p className="text-xs text-slate-600 mt-2 m-0">
                      OTP ID: <span className="font-mono font-semibold">{otpId}</span>
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setStep(2);
                    setOtp('');
                    setLocalError(null);
                    setReceivedOtp(null);
                  }}
                  className="text-primary hover:text-teal-700 text-sm font-bold transition-colors flex items-center gap-2"
                >
                  <span>←</span> Change {otpMethod === 'EMAIL' ? 'email' : 'phone'}
                </button>
              </>
            )}
          </>
        )}

        {(error || localError) && (
          <div className="rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 px-5 py-4 text-sm text-red-700 flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <span>{localError || error}</span>
          </div>
        )}

        {/* Submit Button */}
        {(loginMode === 'direct' || step === 2 || step === 3) && (
          <button
            type="submit"
            disabled={
              loading || 
              (loginMode === 'direct' && (!email || !password)) || 
              (loginMode === 'otp' && step === 2 && otpMethod === 'EMAIL' && !email) || 
              (loginMode === 'otp' && step === 2 && otpMethod === 'PHONE' && !phone) || 
              (loginMode === 'otp' && step === 3 && otp.length !== 6)
            }
            className="w-full bg-gradient-to-r from-primary to-teal-600 text-white py-3.5 px-4 rounded-xl font-bold text-base hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>
                  {loginMode === 'direct' ? 'Logging in...' : (step === 2 ? 'Sending OTP...' : 'Verifying...')}
                </span>
              </>
            ) : (
              <>
                <span>
                  {loginMode === 'direct' ? 'Login' : (step === 2 ? 'Send OTP' : 'Verify & Login')}
                </span>
                <span className="text-lg">→</span>
              </>
            )}
          </button>
        )}
      </form>

      <div className="text-center space-y-3">
        <p className="text-sm text-slate-600">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-bold text-primary hover:text-teal-700 transition-colors">
            Create account →
          </Link>
        </p>
        <div className="pt-3 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Protected by enterprise-grade security 🔒
          </p>
        </div>
      </div>
    </div>
  );
}
