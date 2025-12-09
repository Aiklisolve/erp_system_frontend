import { FormEvent, useState, useEffect } from 'react';
import type { ErpUser, ErpUserRole, Gender, EmploymentStatus } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { AsyncSearchableSelect } from '../../../components/ui/AsyncSearchableSelect';
import { fetchManagers, type Manager } from '../api/crmApi';

type Props = {
  initial?: Partial<ErpUser>;
  onSubmit: (values: Omit<ErpUser, 'id' | 'created_at' | 'updated_at' | 'password_hash'>) => void;
  onCancel?: () => void;
};

// Generate employee number
function generateEmployeeNumber(): string {
  const prefix = 'EMP';
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}-${random}`;
}

// Convert YYYY-MM-DD to dd/mm/yyyy
function formatDateForDisplay(dateString: string | undefined): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString; // Return as-is if parsing fails
  }
}

// Convert dd/mm/yyyy to YYYY-MM-DD for backend
function formatDateForBackend(dateString: string): string {
  if (!dateString) return '';
  // Check if already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  // Parse dd/mm/yyyy format
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return dateString;
}

// Validate dd/mm/yyyy date format
function isValidDateFormat(dateString: string): boolean {
  if (!dateString) return true; // Optional field
  const parts = dateString.split('/');
  if (parts.length !== 3) return false;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
  if (day < 1 || day > 31) return false;
  if (month < 1 || month > 12) return false;
  if (year < 1900 || year > 2100) return false;
  return true;
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
  const [gender, setGender] = useState<Gender>(initial?.gender ?? 'OTHER');
  const [dateOfBirth, setDateOfBirth] = useState(formatDateForDisplay(initial?.date_of_birth));
  const [mobile, setMobile] = useState(initial?.mobile ?? '');
  
  // Address Information
  const [address, setAddress] = useState(initial?.address ?? '');
  const [city, setCity] = useState(initial?.city ?? '');
  const [state, setState] = useState(initial?.state ?? '');
  const [pincode, setPincode] = useState(initial?.pincode ?? '');
  
  // Employment Details
  const [role, setRole] = useState<ErpUserRole>(initial?.role ?? 'EMPLOYEE');
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>(initial?.employment_status ?? 'ACTIVE');
  const [joiningDate, setJoiningDate] = useState(formatDateForDisplay(initial?.joining_date));
  const [designation, setDesignation] = useState(initial?.designation ?? '');
  const [department, setDepartment] = useState(initial?.department ?? '');
  const [managerErpUserId, setManagerErpUserId] = useState(initial?.manager_erp_user_id?.toString() ?? '');
  const [managerName, setManagerName] = useState(initial?.manager_name ?? '');
  const [workPhone, setWorkPhone] = useState(initial?.work_phone ?? '');
  const [salary, setSalary] = useState(initial?.salary?.toString() ?? '');
  
  // Emergency Contact
  const [emergencyContactName, setEmergencyContactName] = useState(initial?.emergency_contact_name ?? '');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(initial?.emergency_contact_phone ?? '');
  
  // Bank Details
  const [bankAccountNumber, setBankAccountNumber] = useState(initial?.bank_account_number ?? '');
  const [bankName, setBankName] = useState(initial?.bank_name ?? '');
  const [bankIfsc, setBankIfsc] = useState(initial?.bank_ifsc ?? '');
  
  // Identification
  const [panNumber, setPanNumber] = useState(initial?.pan_number ?? '');
  const [aadharNumber, setAadharNumber] = useState(initial?.aadhar_number ?? '');
  
  // Additional
  const [notes, setNotes] = useState(initial?.notes ?? '');

  // Update form fields when initial prop changes (for edit mode)
  useEffect(() => {
    if (initial) {
      console.log('🔄 Updating form fields from initial data:', initial);
      setEmployeeNumber(initial.employee_number ?? generateEmployeeNumber());
      setUsername(initial.username ?? '');
      setEmail(initial.email ?? '');
      setPassword('');
      setConfirmPassword('');
      setFirstName(initial.first_name ?? '');
      setLastName(initial.last_name ?? '');
      setGender(initial.gender ?? 'OTHER');
      setDateOfBirth(formatDateForDisplay(initial.date_of_birth));
      setMobile(initial.mobile ?? '');
      setAddress(initial.address ?? '');
      setCity(initial.city ?? '');
      setState(initial.state ?? '');
      setPincode(initial.pincode ?? '');
      setRole(initial.role ?? 'EMPLOYEE');
      setEmploymentStatus(initial.employment_status ?? 'ACTIVE');
      setJoiningDate(formatDateForDisplay(initial.joining_date));
      setDesignation(initial.designation ?? '');
      setDepartment(initial.department ?? '');
      setManagerErpUserId(initial.manager_erp_user_id?.toString() ?? '');
      setManagerName(initial.manager_name ?? '');
      setWorkPhone(initial.work_phone ?? '');
      setSalary(initial.salary != null ? initial.salary.toString() : '');
      setEmergencyContactName(initial.emergency_contact_name ?? '');
      setEmergencyContactPhone(initial.emergency_contact_phone ?? '');
      setBankAccountNumber(initial.bank_account_number ?? '');
      setBankName(initial.bank_name ?? '');
      setBankIfsc(initial.bank_ifsc ?? '');
      setPanNumber(initial.pan_number ?? '');
      setAadharNumber(initial.aadhar_number ?? '');
      setNotes(initial.notes ?? '');
      console.log('✅ Form fields updated. Salary:', initial.salary, 'Emergency Contact:', initial.emergency_contact_name, 'Bank:', initial.bank_account_number);
    } else {
      // Reset form when switching to create mode
      setEmployeeNumber(generateEmployeeNumber());
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFirstName('');
      setLastName('');
      setGender('OTHER');
      setDateOfBirth('');
      setMobile('');
      setAddress('');
      setCity('');
      setState('');
      setPincode('');
      setRole('EMPLOYEE');
      setEmploymentStatus('ACTIVE');
      setJoiningDate('');
      setDesignation('');
      setDepartment('');
      setManagerErpUserId('');
      setManagerName('');
      setWorkPhone('');
      setSalary('');
      setEmergencyContactName('');
      setEmergencyContactPhone('');
      setBankAccountNumber('');
      setBankName('');
      setBankIfsc('');
      setPanNumber('');
      setAadharNumber('');
      setNotes('');
    }
  }, [initial]);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!employeeNumber.trim()) newErrors.employeeNumber = 'Employee number is required';
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
    if (!joiningDate.trim()) newErrors.joiningDate = 'Joining date is required';
    else if (!isValidDateFormat(joiningDate)) {
      newErrors.joiningDate = 'Invalid date format. Use dd/mm/yyyy';
    }
    
    if (dateOfBirth && !isValidDateFormat(dateOfBirth)) {
      newErrors.dateOfBirth = 'Invalid date format. Use dd/mm/yyyy';
    }
    
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
    
    const payload: Omit<ErpUser, 'id' | 'created_at' | 'updated_at' | 'password_hash'> = {
      employee_number: employeeNumber,
      username,
      email,
      password: password || undefined,
      mobile: mobile || undefined,
      first_name: firstName,
      last_name: lastName,
      gender: gender || undefined,
      date_of_birth: dateOfBirth ? formatDateForBackend(dateOfBirth) : undefined,
      address: address || undefined,
      city: city || undefined,
      state: state || undefined,
      pincode: pincode || undefined,
      role,
      employment_status: employmentStatus,
      joining_date: formatDateForBackend(joiningDate),
      designation: designation || undefined,
      department: department || undefined,
      manager_erp_user_id: managerErpUserId ? parseInt(managerErpUserId, 10) : undefined,
      manager_name: managerName || undefined,
      work_phone: workPhone || undefined,
      salary: salary ? parseFloat(salary) : undefined,
      emergency_contact_name: emergencyContactName || undefined,
      emergency_contact_phone: emergencyContactPhone || undefined,
      bank_account_number: bankAccountNumber || undefined,
      bank_name: bankName || undefined,
      bank_ifsc: bankIfsc || undefined,
      pan_number: panNumber || undefined,
      aadhar_number: aadharNumber || undefined,
      notes: notes || undefined
    };
    
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
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
            {errors.employeeNumber && <p className="text-xs text-red-600 mt-1">{errors.employeeNumber}</p>}
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
              Mobile Number
            </label>
            <Input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="+1-555-0101"
            />
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
              Date of Birth
            </label>
            <Input
              type="text"
              value={dateOfBirth}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                // Format as dd/mm/yyyy
                if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
                if (value.length > 5) value = value.slice(0, 5) + '/' + value.slice(5, 9);
                setDateOfBirth(value);
              }}
              placeholder="dd/mm/yyyy"
              maxLength={10}
            />
            {errors.dateOfBirth && <p className="text-xs text-red-600 mt-1">{errors.dateOfBirth}</p>}
            <p className="text-[10px] text-slate-500 mt-1">Format: dd/mm/yyyy</p>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Address Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Address
            </label>
            <Textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street address"
              rows={2}
              className=""
            />
          </div>
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
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Pincode
            </label>
            <Input
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
              placeholder="10001"
              maxLength={10}
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
              Joining Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={joiningDate}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                // Format as dd/mm/yyyy
                if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
                if (value.length > 5) value = value.slice(0, 5) + '/' + value.slice(5, 9);
                setJoiningDate(value);
              }}
              placeholder="dd/mm/yyyy"
              maxLength={10}
              required
            />
            {errors.joiningDate && <p className="text-xs text-red-600 mt-1">{errors.joiningDate}</p>}
            <p className="text-[10px] text-slate-500 mt-1">Format: dd/mm/yyyy</p>
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
            <AsyncSearchableSelect
              label="Manager"
              value={managerErpUserId}
              onChange={(value, selectedManager) => {
                setManagerErpUserId(value);
                if (selectedManager) {
                  setManagerName(selectedManager.full_name);
                } else {
                  setManagerName('');
                }
              }}
              loadOptions={async (searchTerm) => {
                try {
                  const managers = await fetchManagers(searchTerm);
                  return managers;
                } catch (error) {
                  console.error('Error loading managers:', error);
                  return [];
                }
              }}
              getOptionLabel={(manager) => 
                `${manager.full_name} (${manager.employee_number})${manager.department ? ` - ${manager.department}` : ''}`
              }
              getOptionValue={(manager) => manager.erp_user_id.toString()}
              placeholder="Search for a manager..."
              maxHeight="300px"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Work Phone
            </label>
            <Input
              type="tel"
              value={workPhone}
              onChange={(e) => setWorkPhone(e.target.value)}
              placeholder="+1-555-0102"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Salary
            </label>
            <Input
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="50000"
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Emergency Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Emergency Contact Name
            </label>
            <Input
              value={emergencyContactName}
              onChange={(e) => setEmergencyContactName(e.target.value)}
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Emergency Contact Phone
            </label>
            <Input
              type="tel"
              value={emergencyContactPhone}
              onChange={(e) => setEmergencyContactPhone(e.target.value)}
              placeholder="+1-555-0103"
            />
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Bank Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Bank Account Number
            </label>
            <Input
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="1234567890"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Bank Name
            </label>
            <Input
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="State Bank of India"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Bank IFSC Code
            </label>
            <Input
              value={bankIfsc}
              onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
              placeholder="SBIN0001234"
              maxLength={11}
            />
            <p className="text-[10px] text-slate-500 mt-1">Format: 4 letters + 0 + 6 digits</p>
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
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Notes
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes about this employee"
            rows={3}
            className=""
          />
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
