import { FormEvent, useState, useEffect } from 'react';
import type { ErpUser, ErpUserRole, Gender, EmploymentStatus } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';

type Props = {
  initial?: Partial<ErpUser>;
  onSubmit: (values: Omit<ErpUser, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
};

// Generate employee number
function generateEmployeeNumber(): string {
  const prefix = 'EMP';
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}-${random}`;
}

export function UserRegistrationForm({ initial, onSubmit, onCancel }: Props) {
  // Basic Information
  const [employeeNumber, setEmployeeNumber] = useState(initial?.employee_number ?? generateEmployeeNumber());
  const [username, setUsername] = useState(initial?.username ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Personal Information
  const [firstName, setFirstName] = useState(initial?.first_name ?? '');
  const [lastName, setLastName] = useState(initial?.last_name ?? '');
  const [fullName, setFullName] = useState(initial?.full_name ?? '');
  const [gender, setGender] = useState<Gender>(initial?.gender ?? 'OTHER');
  const [age, setAge] = useState(initial?.age?.toString() ?? '');
  
  // Contact Information
  const [mobile, setMobile] = useState(initial?.mobile ?? '');
  const [workPhonenumber, setWorkPhonenumber] = useState(initial?.work_phonenumber ?? '');
  const [emergencyContact, setEmergencyContact] = useState(initial?.emergency_contact ?? '');
  
  // Address
  const [address, setAddress] = useState(initial?.address ?? '');
  
  // Employment Details
  const [role, setRole] = useState<ErpUserRole>(initial?.role ?? 'EMPLOYEE');
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>(initial?.employment_status ?? 'ACTIVE');
  const [joiningDate, setJoiningDate] = useState(initial?.joining_date ?? '');
  const [designation, setDesignation] = useState(initial?.designation ?? '');
  const [department, setDepartment] = useState(initial?.department ?? '');
  const [managerName, setManagerName] = useState(initial?.manager_name ?? '');
  
  // Identification
  const [panNumber, setPanNumber] = useState(initial?.pan_number ?? '');
  const [aadharNumber, setAadharNumber] = useState(initial?.aadhar_number ?? '');
  
  // Additional
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);

  // Auto-generate full name
  useEffect(() => {
    if (firstName && lastName) {
      setFullName(`${firstName} ${lastName}`);
    }
  }, [firstName, lastName]);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!username.trim()) newErrors.username = 'Username is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';
    
    // Password validation (only for new users)
    if (!initial) {
      if (!password) newErrors.password = 'Password is required';
      else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
      else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!mobile.trim()) newErrors.mobile = 'Mobile number is required';
    else if (!/^\+?[\d\s-()]+$/.test(mobile)) newErrors.mobile = 'Invalid mobile number format';
    
    // Aadhar validation (if provided)
    if (aadharNumber && !/^\d{12}$/.test(aadharNumber.replace(/\s/g, ''))) {
      newErrors.aadharNumber = 'Aadhar must be 12 digits';
    }
    
    // PAN validation (if provided)
    if (panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.toUpperCase())) {
      newErrors.panNumber = 'Invalid PAN format (e.g., ABCDE1234F)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    const payload: Omit<ErpUser, 'id' | 'created_at' | 'updated_at'> = {
      employee_number: employeeNumber,
      username,
      email,
      password: password || undefined,
      mobile,
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      gender: gender || undefined,
      age: age ? parseInt(age) : undefined,
      address: address || undefined,
      emergency_contact: emergencyContact || undefined,
      role,
      employment_status: employmentStatus,
      joining_date: joiningDate || undefined,
      designation: designation || undefined,
      department: department || undefined,
      manager_name: managerName || undefined,
      work_phonenumber: workPhonenumber || undefined,
      pan_number: panNumber || undefined,
      aadhar_number: aadharNumber || undefined,
      notes: notes || undefined,
      is_active: isActive
    };
    
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Employee Number <span className="text-red-500">*</span>
            </label>
            <Input
              value={employeeNumber}
              onChange={(e) => setEmployeeNumber(e.target.value)}
              placeholder="EMP-2025-0001"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Username <span className="text-red-500">*</span>
            </label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="john.smith"
              required
            />
            {errors.username && <p className="text-xs text-red-600 mt-1">{errors.username}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john.smith@company.com"
              required
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <Input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="+1-555-0101"
              required
            />
            {errors.mobile && <p className="text-xs text-red-600 mt-1">{errors.mobile}</p>}
          </div>
          
          {/* Password fields - only show for new users */}
          {!initial && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              First Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              required
            />
            {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Last Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Smith"
              required
            />
            {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Full Name (Auto-generated)
            </label>
            <Input
              value={fullName}
              readOnly
              className="bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Gender
            </label>
            <Select value={gender} onChange={(e) => setGender(e.target.value as Gender)}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Age
            </label>
            <Input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="30"
            />
          </div>
        </div>
      </div>

      {/* Contact & Address */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Contact & Address
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Work Phone
            </label>
            <Input
              type="tel"
              value={workPhonenumber}
              onChange={(e) => setWorkPhonenumber(e.target.value)}
              placeholder="+1-555-0102"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Emergency Contact
            </label>
            <Input
              type="tel"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="+1-555-0103"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Address
            </label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, City, State"
            />
          </div>
        </div>
      </div>

      {/* Employment Details */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Employment Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              ERP Role <span className="text-red-500">*</span>
            </label>
            <Select value={role} onChange={(e) => setRole(e.target.value as ErpUserRole)} required>
              <option value="ADMIN">Admin</option>
              <option value="FINANCE_MANAGER">Finance Manager</option>
              <option value="INVENTORY_MANAGER">Inventory Manager</option>
              <option value="PROCUREMENT_OFFICER">Procurement Officer</option>
              <option value="HR_MANAGER">HR Manager</option>
              <option value="SALES_MANAGER">Sales Manager</option>
              <option value="WAREHOUSE_OPERATOR">Warehouse Operator</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="VIEWER">Viewer</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Designation
            </label>
            <Input
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="Senior Manager"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Department
            </label>
            <Input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Operations"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Employment Status
            </label>
            <Select value={employmentStatus} onChange={(e) => setEmploymentStatus(e.target.value as EmploymentStatus)}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="TERMINATED">Terminated</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Joining Date
            </label>
            <Input
              type="date"
              value={joiningDate}
              onChange={(e) => setJoiningDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Manager Name
            </label>
            <Input
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              placeholder="Sarah Johnson"
            />
          </div>
        </div>
      </div>

      {/* Identification */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Identification (Optional)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              PAN Number
            </label>
            <Input
              value={panNumber}
              onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
              placeholder="ABCDE1234F"
              maxLength={10}
            />
            {errors.panNumber && <p className="text-xs text-red-600 mt-1">{errors.panNumber}</p>}
            <p className="text-[10px] text-slate-500 mt-1">Format: 5 letters + 4 digits + 1 letter</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Aadhar Number
            </label>
            <Input
              value={aadharNumber}
              onChange={(e) => setAadharNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="123456789012"
              maxLength={12}
            />
            {errors.aadharNumber && <p className="text-xs text-red-600 mt-1">{errors.aadharNumber}</p>}
            <p className="text-[10px] text-slate-500 mt-1">12 digits only</p>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Additional Details
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about this employee"
              rows={3}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
            />
            <label htmlFor="isActive" className="text-xs font-medium text-slate-700">
              Active User
            </label>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 pt-4 flex flex-col sm:flex-row gap-3 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto">
          {initial ? 'Update User' : 'Register User'}
        </Button>
      </div>
    </form>
  );
}

