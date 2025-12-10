import { useState, FormEvent, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { toast } from '../../lib/toast';
import { apiRequest } from '../../config/api';
import { getSession } from '../../lib/sessionManager';

type ProfileSettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ProfileSettingsModal({ open, onClose }: ProfileSettingsModalProps) {
  const { user, getUserRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  
  // Get user ID from localStorage
  const getUserId = (): string | null => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        return user.id || user.user_id || null;
      }
      const sessionUser = localStorage.getItem('erp_user');
      if (sessionUser) {
        const user = JSON.parse(sessionUser);
        return user.id || user.user_id || null;
      }
    } catch (error) {
      console.error('Error getting user ID:', error);
    }
    return null;
  };
  
  // Form state
  const [userId, setUserId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [role] = useState(getUserRole() || '');
  
  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Helper function to populate form fields from user data
  const populateFormFields = (userData: any) => {
    if (!userData) {
      console.log('populateFormFields: No userData provided');
      return;
    }
    
    console.log('populateFormFields: Processing userData:', userData);
    
    // Handle name splitting - check multiple possible field names
    let firstNameValue = '';
    let lastNameValue = '';
    
    // Priority 1: Check for separate first_name and last_name fields
    if (userData.first_name && userData.last_name) {
      firstNameValue = String(userData.first_name).trim();
      lastNameValue = String(userData.last_name).trim();
    } else if (userData.user_metadata?.first_name && userData.user_metadata?.last_name) {
      firstNameValue = String(userData.user_metadata.first_name).trim();
      lastNameValue = String(userData.user_metadata.last_name).trim();
    }
    // Priority 2: Check for full_name (snake_case) or fullName (camelCase)
    else if (userData.full_name) {
      const nameParts = String(userData.full_name).trim().split(/\s+/);
      firstNameValue = nameParts[0] || '';
      lastNameValue = nameParts.slice(1).join(' ') || '';
    } else if (userData.fullName) {
      // StaticUser uses fullName (camelCase)
      const nameParts = String(userData.fullName).trim().split(/\s+/);
      firstNameValue = nameParts[0] || '';
      lastNameValue = nameParts.slice(1).join(' ') || '';
    } else if (userData.user_metadata?.full_name) {
      const nameParts = String(userData.user_metadata.full_name).trim().split(/\s+/);
      firstNameValue = nameParts[0] || '';
      lastNameValue = nameParts.slice(1).join(' ') || '';
    } else if (userData.name) {
      const nameParts = String(userData.name).trim().split(/\s+/);
      firstNameValue = nameParts[0] || '';
      lastNameValue = nameParts.slice(1).join(' ') || '';
    }
    
    // Get other fields with fallbacks
    const emailValue = String(userData.email || userData.user_metadata?.email || '').trim();
    const mobileValue = String(userData.mobile || userData.user_metadata?.mobile || userData.phone || '').trim();
    const phoneValue = String(userData.phone || userData.user_metadata?.phone || userData.mobile || userData.work_phone || '').trim();
    const departmentValue = String(userData.department || userData.user_metadata?.department || '').trim();
    const designationValue = String(userData.designation || userData.user_metadata?.designation || '').trim();
    const addressValue = String(userData.address || userData.user_metadata?.address || '').trim();
    const cityValue = String(userData.city || userData.user_metadata?.city || '').trim();
    const stateValue = String(userData.state || userData.user_metadata?.state || '').trim();
    const pincodeValue = String(userData.pincode || userData.user_metadata?.pincode || userData.postal_code || userData.user_metadata?.postal_code || '').trim();
    
    console.log('populateFormFields: Setting values:', {
      firstName: firstNameValue,
      lastName: lastNameValue,
      email: emailValue,
      mobile: mobileValue,
      phone: phoneValue,
      department: departmentValue,
      designation: designationValue,
      address: addressValue,
      city: cityValue,
      state: stateValue,
      pincode: pincodeValue
    });
    
    // Only update if we have at least email or name
    if (emailValue || firstNameValue || lastNameValue) {
      setFirstName(firstNameValue);
      setLastName(lastNameValue);
      setEmail(emailValue);
      setMobile(mobileValue);
      setPhone(phoneValue);
      setDepartment(departmentValue);
      setDesignation(designationValue);
      setAddress(addressValue);
      setCity(cityValue);
      setState(stateValue);
      setPincode(pincodeValue);
    } else {
      console.warn('populateFormFields: No valid data found to populate');
    }
  };
  
  // Fetch user details from backend API
  useEffect(() => {
    if (open) {
      console.log('ProfileSettingsModal: Modal opened, fetching user details');
      console.log('ProfileSettingsModal: user from useAuth:', user);
      
      // First, try to populate from the user object from useAuth
      if (user) {
        console.log('ProfileSettingsModal: Populating from useAuth user');
        populateFormFields(user);
      }
      
      // Then fetch from API/localStorage
      fetchUserDetails();
    } else {
      // Reset form when modal closes
      setFirstName('');
      setLastName('');
      setEmail('');
      setMobile('');
      setPhone('');
      setDepartment('');
      setDesignation('');
      setAddress('');
      setCity('');
      setState('');
      setPincode('');
    }
  }, [open]);
  
  const fetchUserDetails = async () => {
    console.log('fetchUserDetails: Starting to fetch user details');
    
    // First, try to get data from session manager
    const session = getSession();
    if (session && session.user) {
      console.log('fetchUserDetails: Found session user:', session.user);
      populateFormFields(session.user);
    }
    
    // Then try localStorage
    const storedUser = localStorage.getItem('user');
    const erpUser = localStorage.getItem('erp_user');
    const sessionUser = localStorage.getItem('erp_session');
    
    console.log('fetchUserDetails: localStorage check:', {
      hasStoredUser: !!storedUser,
      hasErpUser: !!erpUser,
      hasSessionUser: !!sessionUser
    });
    
    let localUserData: any = null;
    if (storedUser) {
      try {
        localUserData = JSON.parse(storedUser);
        console.log('fetchUserDetails: Parsed storedUser:', localUserData);
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
    if (!localUserData && erpUser) {
      try {
        localUserData = JSON.parse(erpUser);
        console.log('fetchUserDetails: Parsed erpUser:', localUserData);
      } catch (e) {
        console.error('Error parsing erp_user:', e);
      }
    }
    if (!localUserData && sessionUser) {
      try {
        const sessionData = JSON.parse(sessionUser);
        console.log('fetchUserDetails: Parsed session:', sessionData);
        if (sessionData.user) {
          localUserData = sessionData.user;
          console.log('fetchUserDetails: Extracted user from session:', localUserData);
        }
      } catch (e) {
        console.error('Error parsing erp_session:', e);
      }
    }
    
    // Populate from localStorage if we haven't already populated from session
    if (localUserData && (!session || !session.user)) {
      console.log('fetchUserDetails: Populating from localStorage data');
      populateFormFields(localUserData);
    } else if (!localUserData && (!session || !session.user)) {
      console.warn('fetchUserDetails: No localUserData found in localStorage or session');
    }
    
    const currentUserId = getUserId();
    if (!currentUserId) {
      // If we already populated from localStorage, we're done
      return;
    }
    
    setFetching(true);
    try {
      // Try /users/me first, then /users/:id
      let userData: any = null;
      
      try {
        const response = await apiRequest<any>('/users/me');
        if (response && (response.user || response.data || response.id)) {
          userData = response.user || response.data || response;
        }
      } catch (error) {
        console.log('Failed to fetch from /users/me, trying /users/:id', error);
        try {
          const response = await apiRequest<any>(`/users/${currentUserId}`);
          if (response && (response.user || response.data || response.id)) {
            userData = response.user || response.data || response;
          }
        } catch (idError) {
          console.log('Failed to fetch from /users/:id', idError);
        }
      }
      
      if (userData) {
        setUserId(currentUserId);
        populateFormFields(userData);
      }
      // If API call failed, we already populated from localStorage above
    } catch (error) {
      console.error('Error fetching user details:', error);
      // We already populated from localStorage above, so no need to do it again
    } finally {
      setFetching(false);
    }
  };
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Only validate fields that have values
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    if (mobile.trim() && !/^\+?[\d\s\-()]+$/.test(mobile)) {
      newErrors.mobile = 'Invalid mobile format';
    }
    if (phone.trim() && !/^\+?[\d\s\-()]+$/.test(phone)) {
      newErrors.phone = 'Invalid phone format';
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
      const currentUserId = userId || getUserId();
      if (!currentUserId) {
        toast.error('User ID not found');
        setLoading(false);
        return;
      }
      
      // Prepare update payload - only include fields that have non-empty values
      const updatePayload: any = {};
      
      // Only add fields that have non-empty values (user can update any subset of fields)
      if (email.trim()) {
        updatePayload.email = email.trim();
      }
      if (firstName.trim()) {
        updatePayload.first_name = firstName.trim();
      }
      if (lastName.trim()) {
        updatePayload.last_name = lastName.trim();
      }
      if (mobile.trim()) {
        updatePayload.mobile = mobile.trim();
      }
      if (phone.trim()) {
        updatePayload.phone = phone.trim();
      }
      if (department.trim()) {
        updatePayload.department = department.trim();
      }
      if (designation.trim()) {
        updatePayload.designation = designation.trim();
      }
      if (address.trim()) {
        updatePayload.address = address.trim();
      }
      if (city.trim()) {
        updatePayload.city = city.trim();
      }
      if (state.trim()) {
        updatePayload.state = state.trim();
      }
      if (pincode.trim()) {
        updatePayload.pincode = pincode.trim();
      }
      
      // If no fields to update, show error
      if (Object.keys(updatePayload).length === 0) {
        toast.error('Please fill at least one field to update');
        setLoading(false);
        return;
      }
      
      console.log('Update payload (only filled fields):', updatePayload);
      
      // Call backend API to update profile
      let updatedUser: any = null;
      
      try {
        // Try /users/me first, then /users/:id
        try {
          const response = await apiRequest<any>('/users/me', {
            method: 'PATCH',
            body: JSON.stringify(updatePayload)
          });
          updatedUser = response.user || response.data || response;
        } catch (error) {
          console.log('Failed to update via /users/me, trying /users/:id');
          const response = await apiRequest<any>(`/users/${currentUserId}`, {
            method: 'PATCH',
            body: JSON.stringify(updatePayload)
          });
          updatedUser = response.user || response.data || response;
        }
        
        if (updatedUser) {
          // Update localStorage
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            const updatedLocalUser = {
              ...parsedUser,
              ...updatedUser,
              email: updatedUser.email || email,
              first_name: updatedUser.first_name || firstName,
              last_name: updatedUser.last_name || lastName,
              mobile: updatedUser.mobile || mobile,
              phone: updatedUser.phone || phone,
              department: updatedUser.department || department,
              designation: updatedUser.designation || designation,
              address: updatedUser.address || address,
              city: updatedUser.city || city,
              state: updatedUser.state || state,
              pincode: updatedUser.pincode || pincode,
              user_metadata: {
                ...parsedUser.user_metadata,
                first_name: updatedUser.first_name || firstName,
                last_name: updatedUser.last_name || lastName,
                mobile: updatedUser.mobile || mobile,
                phone: updatedUser.phone || phone,
                department: updatedUser.department || department,
                designation: updatedUser.designation || designation,
                address: updatedUser.address || address,
                city: updatedUser.city || city,
                state: updatedUser.state || state,
                pincode: updatedUser.pincode || pincode,
              }
            };
            localStorage.setItem('user', JSON.stringify(updatedLocalUser));
          }
          
          toast.success('Profile updated successfully!');
          onClose();
          
          // Reload the page to reflect changes
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (apiError: any) {
        console.error('Backend API error:', apiError);
        // Fallback to localStorage update
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          const updatedLocalUser = {
            ...parsedUser,
            email: email,
            first_name: firstName,
            last_name: lastName,
            mobile: mobile,
            phone: phone,
            department: department,
            designation: designation,
            address: address,
            city: city,
            state: state,
            pincode: pincode,
            user_metadata: {
              ...parsedUser.user_metadata,
              first_name: firstName,
              last_name: lastName,
              mobile: mobile,
              phone: phone,
              department: department,
              designation: designation,
              address: address,
              city: city,
              state: state,
              pincode: pincode,
            }
          };
          localStorage.setItem('user', JSON.stringify(updatedLocalUser));
          toast.success('Profile updated locally (API unavailable)');
          onClose();
        } else {
          toast.error(apiError.message || 'Failed to update profile');
        }
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
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
      {fetching ? (
        <div className="py-8 text-center">
          <p className="text-sm text-slate-600">Loading user details...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Basic Information */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
              Basic Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    First Name
                  </label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                  />
                  {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Last Name
                  </label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                  />
                </div>
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Mobile
                  </label>
                  <Input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+1 555-0123"
                  />
                  {errors.mobile && <p className="text-xs text-red-600 mt-1">{errors.mobile}</p>}
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
              </div>
            </div>
          </div>
          
          {/* Employment Information */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
              Employment Information
            </h3>
            <div className="space-y-4">
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
                  Designation
                </label>
                <Input
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="Manager"
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
          
          {/* Address Information */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
              Address Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Address
                </label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    City
                  </label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New York"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    State
                  </label>
                  <Input
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="NY"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Postal Code
                </label>
                <Input
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="10001"
                />
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
              disabled={loading || fetching}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

