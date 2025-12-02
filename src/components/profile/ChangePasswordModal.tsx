import { useState, FormEvent, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Tabs } from '../ui/Tabs';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { toast } from '../../lib/toast';

type ChangePasswordModalProps = {
  open: boolean;
  onClose: () => void;
};

// Simple password hashing function (same as used in registration)
const hashPassword = (password: string): string => {
  let hash = 0;
  if (password.length === 0) return hash.toString();

  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }

  const base = Math.abs(hash).toString(36);
  const longHash = Array(8)
    .fill(base)
    .map((b, i) => b + ((hash >> i) & 0xff).toString(36))
    .join('');

  return `$2b$10$${longHash}`;
};

// Generate random OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'otp' | 'password'>('otp');
  
  // Get user data from localStorage
  const getUserData = () => {
    const storedUser = localStorage.getItem('erp_user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  };
  
  const userData = getUserData();
  
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Change Password"
    >
      <div className="space-y-4">
        {/* Tabs */}
        <Tabs
          items={[
            { id: 'otp', label: 'Via OTP' },
            { id: 'password', label: 'Via Current Password' }
          ]}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as 'otp' | 'password')}
        />
        
        {/* Tab Content */}
        {activeTab === 'otp' ? (
          <OTPPasswordChange userData={userData} onClose={onClose} />
        ) : (
          <CurrentPasswordChange userData={userData} onClose={onClose} />
        )}
      </div>
    </Modal>
  );
}

// OTP-based Password Change Component
function OTPPasswordChange({ userData, onClose }: { userData: any; onClose: () => void }) {
  const [step, setStep] = useState<'select' | 'send' | 'verify'>('select');
  const [method, setMethod] = useState<'email' | 'mobile'>('email');
  const [contactValue, setContactValue] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [otpExpiryTime, setOtpExpiryTime] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Update time remaining every second
  useEffect(() => {
    if (step === 'verify' && otpExpiryTime > 0) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.floor((otpExpiryTime - Date.now()) / 1000));
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          clearInterval(interval);
          toast.error('OTP has expired. Please request a new one.');
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [step, otpExpiryTime]);
  
  const handleSendOTP = (e: FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!contactValue.trim()) {
      newErrors.contactValue = method === 'email' ? 'Email is required' : 'Mobile number is required';
    } else if (method === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactValue)) {
      newErrors.contactValue = 'Invalid email format';
    } else if (method === 'mobile' && !/^\+?[\d\s\-()]+$/.test(contactValue)) {
      newErrors.contactValue = 'Invalid mobile format';
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    setLoading(true);
    
    // Simulate OTP sending
    setTimeout(() => {
      const otp = generateOTP();
      const expiryTime = Date.now() + (10 * 60 * 1000); // 10 minutes from now
      setGeneratedOTP(otp);
      setOtpExpiryTime(expiryTime);
      console.log('Generated OTP:', otp); // In production, this would be sent via email/SMS
      console.log('OTP expires at:', new Date(expiryTime).toLocaleTimeString());
      toast.success(`OTP sent to ${contactValue} and the OTP is ${otp}`);
      setStep('verify');
      setLoading(false);
    }, 1000);
  };
  
  const handleVerifyAndChange = async (e: FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    // Check if OTP has expired
    if (Date.now() > otpExpiryTime) {
      newErrors.otp = 'OTP has expired. Please request a new one.';
      setErrors(newErrors);
      toast.error('OTP has expired. Please request a new one.');
      return;
    }
    
    if (!otp) newErrors.otp = 'OTP is required';
    else if (otp !== generatedOTP) newErrors.otp = 'Invalid OTP';
    
    if (!newPassword) newErrors.newPassword = 'New password is required';
    else if (newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
    
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    setLoading(true);
    
    try {
      if (!userData) {
        throw new Error('User data not found');
      }
      
      // Hash new password
      const hashedNewPassword = hashPassword(newPassword);
      
      // Update password in localStorage
      const updatedUserData = {
        ...userData,
        password: hashedNewPassword
      };
      localStorage.setItem('erp_user', JSON.stringify(updatedUserData));
      
      // Also update in static users if it exists
      const staticUsers = localStorage.getItem('static_users');
      if (staticUsers) {
        const users = JSON.parse(staticUsers);
        const userIndex = users.findIndex((u: any) => u.email === userData.email);
        if (userIndex !== -1) {
          users[userIndex].password = hashedNewPassword;
          localStorage.setItem('static_users', JSON.stringify(users));
        }
      }
      
      toast.success('Password changed successfully via OTP!');
      
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {step === 'select' && (
        <form onSubmit={(e) => { e.preventDefault(); setStep('send'); }} className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
              Select Verification Method
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-primary transition-colors">
                <input
                  type="radio"
                  name="method"
                  value="email"
                  checked={method === 'email'}
                  onChange={(e) => setMethod(e.target.value as 'email' | 'mobile')}
                  className="w-4 h-4 text-primary"
                />
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-xs font-medium text-slate-900">Email</p>
                    <p className="text-[10px] text-slate-500">Send OTP to your email</p>
                  </div>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-primary transition-colors">
                <input
                  type="radio"
                  name="method"
                  value="mobile"
                  checked={method === 'mobile'}
                  onChange={(e) => setMethod(e.target.value as 'email' | 'mobile')}
                  className="w-4 h-4 text-primary"
                />
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-xs font-medium text-slate-900">Mobile</p>
                    <p className="text-[10px] text-slate-500">Send OTP to your mobile</p>
                  </div>
                </div>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" size="md" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto">
              Continue
            </Button>
          </div>
        </form>
      )}
      
      {step === 'send' && (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
              Enter {method === 'email' ? 'Email Address' : 'Mobile Number'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  {method === 'email' ? 'Email' : 'Mobile Number'} <span className="text-red-500">*</span>
                </label>
                <Input
                  type={method === 'email' ? 'email' : 'tel'}
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  placeholder={method === 'email' ? 'your.email@example.com' : '+1 555-0123'}
                  required
                />
                {errors.contactValue && <p className="text-xs text-red-600 mt-1">{errors.contactValue}</p>}
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-[10px] text-blue-700">
                  📱 An OTP will be sent to your {method === 'email' ? 'email' : 'mobile number'}. 
                  Please check and enter the OTP in the next step.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" size="md" onClick={() => setStep('select')} className="w-full sm:w-auto">
              Back
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={loading} className="w-full sm:w-auto">
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>
          </div>
        </form>
      )}
      
      {step === 'verify' && (
        <form onSubmit={handleVerifyAndChange} className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
              Verify OTP & Set New Password
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Enter OTP <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  required
                />
                {errors.otp && <p className="text-xs text-red-600 mt-1">{errors.otp}</p>}
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] text-slate-500">
                    OTP sent to {contactValue}. 
                    <button type="button" onClick={() => setStep('send')} className="text-primary hover:underline ml-1">
                      Change
                    </button>
                  </p>
                  {timeRemaining > 0 && (
                    <p className={`text-[10px] font-semibold ${timeRemaining < 60 ? 'text-red-600' : 'text-emerald-600'}`}>
                      ⏱️ {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')} remaining
                    </p>
                  )}
                  {timeRemaining === 0 && otpExpiryTime > 0 && (
                    <p className="text-[10px] font-semibold text-red-600">
                      ❌ OTP Expired
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.newPassword && <p className="text-xs text-red-600 mt-1">{errors.newPassword}</p>}
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" size="md" onClick={() => setStep('send')} className="w-full sm:w-auto" disabled={loading}>
              Back
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={loading} className="w-full sm:w-auto">
              {loading ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

// Current Password-based Change Component
function CurrentPasswordChange({ userData, onClose }: { userData: any; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!newPassword) newErrors.newPassword = 'New password is required';
    else if (newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (currentPassword && newPassword && currentPassword === newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setLoading(true);
    
    try {
      if (!userData) {
        throw new Error('User data not found');
      }
      
      // Verify current password
      const hashedCurrentPassword = hashPassword(currentPassword);
      if (userData.password !== hashedCurrentPassword) {
        setErrors({ currentPassword: 'Current password is incorrect' });
        toast.error('Current password is incorrect');
        setLoading(false);
        return;
      }
      
      // Hash new password
      const hashedNewPassword = hashPassword(newPassword);
      
      // Update password in localStorage
      const updatedUserData = {
        ...userData,
        password: hashedNewPassword
      };
      localStorage.setItem('erp_user', JSON.stringify(updatedUserData));
      
      // Also update in static users if it exists
      const staticUsers = localStorage.getItem('static_users');
      if (staticUsers) {
        const users = JSON.parse(staticUsers);
        const userIndex = users.findIndex((u: any) => u.email === userData.email);
        if (userIndex !== -1) {
          users[userIndex].password = hashedNewPassword;
          localStorage.setItem('static_users', JSON.stringify(users));
        }
      }
      
      toast.success('Password changed successfully!');
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Password Information
        </h3>
        <div className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Current Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrentPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.currentPassword && <p className="text-xs text-red-600 mt-1">{errors.currentPassword}</p>}
          </div>
          
          {/* New Password */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNewPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.newPassword && <p className="text-xs text-red-600 mt-1">{errors.newPassword}</p>}
          </div>
          
          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
          </div>
          
          {/* Password Requirements */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-[10px] font-semibold text-slate-700 mb-1">Password Requirements:</p>
            <ul className="text-[10px] text-slate-600 space-y-0.5 list-disc list-inside">
              <li>At least 6 characters long</li>
              <li>Different from current password</li>
              <li>Must match confirmation</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Form Actions */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 pt-4 flex flex-col sm:flex-row gap-3 justify-end">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onClose}
          className="w-full sm:w-auto"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          size="md" 
          className="w-full sm:w-auto"
          disabled={loading}
        >
          {loading ? 'Changing...' : 'Change Password'}
        </Button>
      </div>
    </form>
  );
}
