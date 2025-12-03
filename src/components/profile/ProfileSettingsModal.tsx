import { useState, FormEvent, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { toast } from '../../lib/toast';

type ProfileSettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ProfileSettingsModal({ open, onClose }: ProfileSettingsModalProps) {
  const { user, getUserRole } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Get user data from localStorage
  const getUserData = () => {
    const storedUser = localStorage.getItem('erp_user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  };
  
  const userData = getUserData();
  
  // Form state
  const [fullName, setFullName] = useState(userData?.full_name || userData?.user_metadata?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(userData?.phone || userData?.user_metadata?.phone || '');
  const [department, setDepartment] = useState(userData?.department || userData?.user_metadata?.department || '');
  const [role] = useState(getUserRole() || '');
  
  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';
    if (phone && !/^\+?[\d\s\-()]+$/.test(phone)) newErrors.phone = 'Invalid phone format';
    
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
      // Update user data in localStorage
      const storedUser = getUserData();
      if (storedUser) {
        const updatedUser = {
          ...storedUser,
          full_name: fullName,
          email: email,
          phone: phone,
          department: department,
          user_metadata: {
            ...storedUser.user_metadata,
            full_name: fullName,
            phone: phone,
            department: department
          }
        };
        
        localStorage.setItem('erp_user', JSON.stringify(updatedUser));
        
        // Also update the main user object if it exists
        const mainUser = localStorage.getItem('user');
        if (mainUser) {
          const parsedMainUser = JSON.parse(mainUser);
          parsedMainUser.email = email;
          parsedMainUser.user_metadata = {
            ...parsedMainUser.user_metadata,
            full_name: fullName,
            phone: phone,
            department: department
          };
          localStorage.setItem('user', JSON.stringify(parsedMainUser));
        }
        
        toast.success('Profile updated successfully!');
        
        // Reload the page to reflect changes
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error('User data not found');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Profile"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Information */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
            Profile Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
              />
              {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.doe@example.com"
                required
              />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Phone
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-0123"
              />
              {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Department
              </label>
              <Input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Finance"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Role
              </label>
              <Input
                value={role.replace(/_/g, ' ')}
                readOnly
                className="bg-slate-50"
              />
              <p className="text-[10px] text-slate-500 mt-1">Role cannot be changed</p>
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
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

