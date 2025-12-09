import { FormEvent, useState, useEffect } from 'react';
import type { Employee, EmployeeStatus, EmploymentType, Department, Gender, MaritalStatus } from '../types';
import type { ErpRole } from '../../auth/data/staticUsers';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';

type Props = {
  initial?: Partial<Employee>;
  onSubmit: (values: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
};

// Generate employee number
function generateEmployeeNumber(): string {
  const prefix = 'EMP';
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${year}-${random}`;
}

// ERP Roles from auth system
const erpRoles: ErpRole[] = [
  'ADMIN',
  'FINANCE_MANAGER',
  'INVENTORY_MANAGER',
  'PROCUREMENT_OFFICER',
  'HR_MANAGER',
  'SALES_MANAGER',
  'WAREHOUSE_OPERATOR',
  'VIEWER',
];

const departments: Department[] = [
  'IT',
  'FINANCE',
  'OPERATIONS',
  'SALES',
  'HR',
  'WAREHOUSE',
  'PROCUREMENT',
  'MANUFACTURING',
  'CUSTOMER_SERVICE',
  'ADMINISTRATION',
  'MARKETING',
  'OTHER',
];

export function EmployeeForm({ initial, onSubmit, onCancel }: Props) {
  const [employeeNumber, setEmployeeNumber] = useState(initial?.employee_number ?? generateEmployeeNumber());
  const [firstName, setFirstName] = useState(initial?.first_name ?? initial?.name?.split(' ')[0] ?? '');
  const [lastName, setLastName] = useState(initial?.last_name ?? initial?.name?.split(' ').slice(1).join(' ') ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(initial?.date_of_birth ?? '');
  const [gender, setGender] = useState<Gender | ''>(initial?.gender ?? '');
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus | ''>(initial?.marital_status ?? '');
  const [nationalId, setNationalId] = useState(initial?.national_id ?? '');
  const [passportNumber, setPassportNumber] = useState(initial?.passport_number ?? '');
  
  const [email, setEmail] = useState(initial?.email ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [alternatePhone, setAlternatePhone] = useState(initial?.alternate_phone ?? '');
  const [emergencyContactName, setEmergencyContactName] = useState(initial?.emergency_contact_name ?? '');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(initial?.emergency_contact_phone ?? '');
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState(initial?.emergency_contact_relationship ?? '');
  
  const [address, setAddress] = useState(initial?.address ?? '');
  const [city, setCity] = useState(initial?.city ?? '');
  const [state, setState] = useState(initial?.state ?? '');
  const [postalCode, setPostalCode] = useState(initial?.postal_code ?? '');
  const [country, setCountry] = useState(initial?.country ?? '');
  
  const [role, setRole] = useState(initial?.role ?? '');
  const [erpRole, setErpRole] = useState<ErpRole | ''>(initial?.erp_role ?? '');
  const [department, setDepartment] = useState<Department | ''>(initial?.department ?? '');
  const [employmentType, setEmploymentType] = useState<EmploymentType>(initial?.employment_type ?? 'FULL_TIME');
  const [status, setStatus] = useState<EmployeeStatus>(initial?.status ?? 'ACTIVE');
  
  const [joinDate, setJoinDate] = useState(initial?.join_date ?? new Date().toISOString().slice(0, 10));
  const [probationEndDate, setProbationEndDate] = useState(initial?.probation_end_date ?? '');
  const [contractStartDate, setContractStartDate] = useState(initial?.contract_start_date ?? '');
  const [contractEndDate, setContractEndDate] = useState(initial?.contract_end_date ?? '');
  const [lastPromotionDate, setLastPromotionDate] = useState(initial?.last_promotion_date ?? '');
  const [terminationDate, setTerminationDate] = useState(initial?.termination_date ?? '');
  
  const [managerName, setManagerName] = useState(initial?.manager_name ?? '');
  const [reportingManager, setReportingManager] = useState(initial?.reporting_manager ?? '');
  const [team, setTeam] = useState(initial?.team ?? '');
  
  const [salary, setSalary] = useState<number | ''>(initial?.salary ?? '');
  const [hourlyRate, setHourlyRate] = useState<number | ''>(initial?.hourly_rate ?? '');
  const [currency, setCurrency] = useState(initial?.currency ?? 'USD');
  const [payFrequency, setPayFrequency] = useState(initial?.pay_frequency ?? 'MONTHLY');
  const [bonus, setBonus] = useState<number | ''>(initial?.bonus ?? '');
  const [commissionRate, setCommissionRate] = useState<number | ''>(initial?.commission_rate ?? '');
  
  const [benefits, setBenefits] = useState(initial?.benefits?.join(', ') ?? '');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState(initial?.insurance_policy_number ?? '');
  const [insuranceExpiry, setInsuranceExpiry] = useState(initial?.insurance_expiry ?? '');
  
  const [skills, setSkills] = useState(initial?.skills?.join(', ') ?? '');
  const [certifications, setCertifications] = useState(initial?.certifications?.join(', ') ?? '');
  const [educationLevel, setEducationLevel] = useState(initial?.education_level ?? '');
  const [educationField, setEducationField] = useState(initial?.education_field ?? '');
  const [yearsOfExperience, setYearsOfExperience] = useState<number | ''>(initial?.years_of_experience ?? '');
  
  const [performanceRating, setPerformanceRating] = useState<number | ''>(initial?.performance_rating ?? '');
  const [lastReviewDate, setLastReviewDate] = useState(initial?.last_review_date ?? '');
  const [nextReviewDate, setNextReviewDate] = useState(initial?.next_review_date ?? '');
  
  const [annualLeaveBalance, setAnnualLeaveBalance] = useState<number | ''>(initial?.annual_leave_balance ?? '');
  const [sickLeaveBalance, setSickLeaveBalance] = useState<number | ''>(initial?.sick_leave_balance ?? '');
  const [otherLeaveBalance, setOtherLeaveBalance] = useState<number | ''>(initial?.other_leave_balance ?? '');
  
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [internalNotes, setInternalNotes] = useState(initial?.internal_notes ?? '');

  // Auto-generate full name
  useEffect(() => {
    if (firstName || lastName) {
      // Full name is generated on submit
    }
  }, [firstName, lastName]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !role || !joinDate) return;
    
    const fullName = `${firstName} ${lastName}`.trim();
    
    onSubmit({
      employee_number: employeeNumber,
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      date_of_birth: dateOfBirth || undefined,
      gender: gender || undefined,
      marital_status: maritalStatus || undefined,
      national_id: nationalId || undefined,
      passport_number: passportNumber || undefined,
      email,
      phone: phone || undefined,
      alternate_phone: alternatePhone || undefined,
      emergency_contact_name: emergencyContactName || undefined,
      emergency_contact_phone: emergencyContactPhone || undefined,
      emergency_contact_relationship: emergencyContactRelationship || undefined,
      address: address || undefined,
      city: city || undefined,
      state: state || undefined,
      postal_code: postalCode || undefined,
      country: country || undefined,
      role,
      erp_role: erpRole || undefined,
      department: department || undefined,
      employment_type: employmentType,
      status,
      join_date: joinDate,
      probation_end_date: probationEndDate || undefined,
      contract_start_date: contractStartDate || undefined,
      contract_end_date: contractEndDate || undefined,
      last_promotion_date: lastPromotionDate || undefined,
      termination_date: terminationDate || undefined,
      manager_name: managerName || undefined,
      reporting_manager: reportingManager || undefined,
      team: team || undefined,
      salary: Number(salary) || undefined,
      hourly_rate: Number(hourlyRate) || undefined,
      currency: currency || undefined,
      pay_frequency: payFrequency,
      bonus: Number(bonus) || undefined,
      commission_rate: Number(commissionRate) || undefined,
      benefits: benefits ? benefits.split(',').map(b => b.trim()).filter(b => b) : undefined,
      insurance_policy_number: insurancePolicyNumber || undefined,
      insurance_expiry: insuranceExpiry || undefined,
      skills: skills ? skills.split(',').map(s => s.trim()).filter(s => s) : undefined,
      certifications: certifications ? certifications.split(',').map(c => c.trim()).filter(c => c) : undefined,
      education_level: educationLevel || undefined,
      education_field: educationField || undefined,
      years_of_experience: Number(yearsOfExperience) || undefined,
      performance_rating: Number(performanceRating) || undefined,
      last_review_date: lastReviewDate || undefined,
      next_review_date: nextReviewDate || undefined,
      annual_leave_balance: Number(annualLeaveBalance) || undefined,
      sick_leave_balance: Number(sickLeaveBalance) || undefined,
      other_leave_balance: Number(otherLeaveBalance) || undefined,
      notes: notes || undefined,
      internal_notes: internalNotes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      {/* Employee Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Employee Information</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Employee Number"
            value={employeeNumber}
            onChange={(e) => setEmployeeNumber(e.target.value)}
            placeholder="Auto-generated"
            readOnly
            className="bg-slate-50"
          />
          <Input
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            required
          />
          <Input
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            required
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Contact Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="employee@company.com"
            required
          />
          <Input
            label="Phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>

      {/* Employment Details */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Employment Details</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Job Title/Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Job title"
            required
          />
          <Select
            label="ERP Role"
            value={erpRole}
            onChange={(e) => setErpRole(e.target.value as ErpRole)}
          >
            <option value="">Select ERP role</option>
            {erpRoles.map((r) => (
              <option key={r} value={r}>
                {r.replace('_', ' ')}
              </option>
            ))}
          </Select>
          <Select
            label="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value as Department)}
          >
            <option value="">Select department</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept.replace('_', ' ')}
              </option>
            ))}
          </Select>
          <Select
            label="Employment Type"
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
            required
          >
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="TEMPORARY">Temporary</option>
            <option value="INTERN">Intern</option>
            <option value="CONSULTANT">Consultant</option>
          </Select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as EmployeeStatus)}
            required
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="TERMINATED">Terminated</option>
            <option value="RESIGNED">Resigned</option>
            <option value="RETIRED">Retired</option>
          </Select>
          <Input
            label="Team"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            placeholder="Team name"
          />
        </div>
      </div>

      {/* Dates */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Important Dates</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Join Date"
            type="date"
            value={joinDate}
            onChange={(e) => setJoinDate(e.target.value)}
            required
            max={new Date().toISOString().slice(0, 10)}
          />
          {(status === 'TERMINATED' || status === 'RESIGNED') && (
            <Input
              label="Termination Date"
              type="date"
              value={terminationDate}
              onChange={(e) => setTerminationDate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
            />
          )}
        </div>
      </div>

      {/* Manager & Reporting */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Manager & Reporting</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Manager Name"
            value={managerName}
            onChange={(e) => setManagerName(e.target.value)}
            placeholder="Direct manager"
          />
        </div>
      </div>

      {/* Compensation */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Compensation</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Salary"
            type="number"
            value={salary}
            onChange={(e) => setSalary(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            min={0}
            step="0.01"
          />
          <Select
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
          </Select>
          <Select
            label="Pay Frequency"
            value={payFrequency}
            onChange={(e) => setPayFrequency(e.target.value as any)}
          >
            <option value="MONTHLY">Monthly</option>
            <option value="BIWEEKLY">Biweekly</option>
            <option value="WEEKLY">Weekly</option>
            <option value="DAILY">Daily</option>
          </Select>
        </div>
      </div>

      {/* Skills & Qualifications */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Skills & Qualifications</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Skills"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="Skill 1, Skill 2, Skill 3 (comma-separated)"
          />
          <Select
            label="Education Level"
            value={educationLevel}
            onChange={(e) => setEducationLevel(e.target.value)}
          >
            <option value="">Select level</option>
            <option value="HIGH_SCHOOL">High School</option>
            <option value="ASSOCIATE">Associate</option>
            <option value="BACHELOR">Bachelor</option>
            <option value="MASTER">Master</option>
            <option value="DOCTORATE">Doctorate</option>
            <option value="OTHER">Other</option>
          </Select>
        </div>
        <Input
          label="Years of Experience"
          type="number"
          value={yearsOfExperience}
          onChange={(e) => setYearsOfExperience(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="0"
          min={0}
        />
      </div>

      {/* Notes */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Notes</h3>
        <Textarea
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Employee notes"
          rows={3}
        />
      </div>

      <div className="mt-4 border-t border-slate-200 bg-white pt-3 flex flex-col sm:flex-row justify-end gap-2 sticky bottom-0">
        <Button
          type="button"
          variant="ghost"
          size="md"
          onClick={onCancel}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto">
          {initial ? 'Update Employee' : 'Create Employee'}
        </Button>
      </div>
    </form>
  );
}
