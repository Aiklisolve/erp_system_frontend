import { FormEvent, useState, useEffect } from 'react';
import type { Shift, ShiftStatus, ShiftType, Department } from '../types';
import type { ErpRole } from '../../auth/data/staticUsers';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { SearchableSelect } from '../../../components/ui/SearchableSelect';
import * as workforceApi from '../api/workforceApi';
import type { EmployeeOption, UserOption } from '../api/workforceApi';

type Props = {
  initial?: Partial<Shift>;
  onSubmit: (values: Omit<Shift, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
};

// Generate shift number
function generateShiftNumber(): string {
  const prefix = 'SHF';
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

// Employee search state will be managed in component

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
  'OTHER',
];

export function ShiftForm({ initial, onSubmit, onCancel }: Props) {
  const [shiftNumber, setShiftNumber] = useState(initial?.shift_number ?? generateShiftNumber());
  const [employeeId, setEmployeeId] = useState(initial?.employee_id ?? '');
  const [employeeName, setEmployeeName] = useState(initial?.employee_name ?? '');
  const [employeeEmail, setEmployeeEmail] = useState(initial?.employee_email ?? '');
  
  // Employee dropdown state
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  
  // Users dropdown state
  const [schedulingUsers, setSchedulingUsers] = useState<UserOption[]>([]);
  const [approvalUsers, setApprovalUsers] = useState<UserOption[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState(initial?.start_time ?? '08:00');
  const [endTime, setEndTime] = useState(initial?.end_time ?? '16:00');
  const [breakDuration, setBreakDuration] = useState<number | ''>(initial?.break_duration_minutes ?? '');
  
  const [role, setRole] = useState(initial?.role ?? '');
  const [erpRole, setErpRole] = useState<ErpRole | ''>(initial?.erp_role ?? '');
  const [department, setDepartment] = useState<Department | ''>(initial?.department ?? '');
  const [jobTitle, setJobTitle] = useState(initial?.job_title ?? '');
  const [location, setLocation] = useState(initial?.location ?? '');
  
  const [shiftType, setShiftType] = useState<ShiftType>(initial?.shift_type ?? 'REGULAR');
  const [status, setStatus] = useState<ShiftStatus>(initial?.status ?? 'SCHEDULED');
  const [isOvertime, setIsOvertime] = useState(initial?.is_overtime ?? false);
  
  const [scheduledBy, setScheduledBy] = useState(initial?.scheduled_by ?? '');
  const [approvedBy, setApprovedBy] = useState(initial?.approved_by ?? '');
  const [approvalDate, setApprovalDate] = useState(initial?.approval_date ?? '');
  
  const [clockInTime, setClockInTime] = useState(initial?.clock_in_time ?? '');
  const [clockOutTime, setClockOutTime] = useState(initial?.clock_out_time ?? '');
  const [actualHours, setActualHours] = useState<number | ''>(initial?.actual_hours ?? '');
  
  const [attendanceStatus, setAttendanceStatus] = useState(initial?.attendance_status ?? '');
  const [lateMinutes, setLateMinutes] = useState<number | ''>(initial?.late_minutes ?? '');
  const [earlyLeaveMinutes, setEarlyLeaveMinutes] = useState<number | ''>(initial?.early_leave_minutes ?? '');
  
  const [assignedTasks, setAssignedTasks] = useState(initial?.assigned_tasks?.join(', ') ?? '');
  const [taskCompletionRate, setTaskCompletionRate] = useState<number | ''>(initial?.task_completion_rate ?? '');
  
  const [performanceRating, setPerformanceRating] = useState<number | ''>(initial?.performance_rating ?? '');
  const [qualityScore, setQualityScore] = useState<number | ''>(initial?.quality_score ?? '');
  
  const [hourlyRate, setHourlyRate] = useState<number | ''>(initial?.hourly_rate ?? '');
  const [totalPay, setTotalPay] = useState<number | ''>(initial?.total_pay ?? '');
  const [overtimeHours, setOvertimeHours] = useState<number | ''>(initial?.overtime_hours ?? '');
  const [overtimeRate, setOvertimeRate] = useState<number | ''>(initial?.overtime_rate ?? '');
  const [currency, setCurrency] = useState(initial?.currency ?? 'USD');
  
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [internalNotes, setInternalNotes] = useState(initial?.internal_notes ?? '');

  // Calculate total hours from start/end time and break duration
  const calculateTotalHours = (): number => {
    if (!startTime || !endTime) return 0;
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    if (end < start) {
      // Handle overnight shifts
      end.setDate(end.getDate() + 1);
    }
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const breakHours = (Number(breakDuration) || 0) / 60;
    return Math.max(0, diffHours - breakHours);
  };

  // Calculate total pay based on hours and rates
  const calculateTotalPay = (): number => {
    const rate = Number(hourlyRate) || 0;
    if (rate <= 0) return 0;

    // Use actual_hours if available, otherwise use calculated total_hours
    const totalHoursWorked = Number(actualHours) || calculateTotalHours();
    const otHours = Number(overtimeHours) || 0;
    
    // Calculate regular hours (total hours minus overtime)
    const regularHours = Math.max(0, totalHoursWorked - otHours);
    
    // Calculate overtime rate (use provided rate or default to 1.5x)
    const otRate = Number(overtimeRate) || (rate * 1.5);
    
    // Calculate pay
    const regularPay = regularHours * rate;
    const overtimePay = otHours * otRate;
    
    return regularPay + overtimePay;
  };

  // Update total pay when relevant fields change
  useEffect(() => {
    const calculatedPay = calculateTotalPay();
    if (calculatedPay > 0) {
      setTotalPay(calculatedPay);
    } else {
      setTotalPay('');
    }
  }, [startTime, endTime, breakDuration, actualHours, hourlyRate, overtimeHours, overtimeRate]);

  // Fetch employees from backend API
  useEffect(() => {
    const fetchEmployees = async () => {
      setEmployeesLoading(true);
      try {
        const data = await workforceApi.listEmployees();
        setEmployees(data);
        
        // If editing and employee_id exists, set the employee details
        if (initial?.employee_id && !employeeId) {
          const foundEmployee = data.find((e) => e.id === initial.employee_id || e.employee_id === initial.employee_id);
          if (foundEmployee) {
            setEmployeeId(foundEmployee.id);
            setEmployeeName(foundEmployee.full_name || foundEmployee.name || initial.employee_name || '');
            setEmployeeEmail(foundEmployee.email || initial.employee_email || '');
            if (foundEmployee.department) {
              setDepartment(foundEmployee.department as Department);
            }
          } else if (initial.employee_name) {
            // If employee not found in list but we have name, use it
            setEmployeeName(initial.employee_name);
            setEmployeeEmail(initial.employee_email || '');
          }
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        setEmployees([]);
      } finally {
        setEmployeesLoading(false);
      }
    };
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Fetch users for scheduling and approval dropdowns
  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const [schedulingData, approvalData] = await Promise.all([
          workforceApi.listUsersForScheduling(),
          workforceApi.listUsersForApproval(),
        ]);
        setSchedulingUsers(schedulingData);
        setApprovalUsers(approvalData);
        
        // If editing and scheduled_by/approved_by exist, try to match with users
        if (initial?.scheduled_by && !scheduledBy) {
          const foundUser = schedulingData.find((u) => 
            u.name === initial.scheduled_by || 
            u.full_name === initial.scheduled_by ||
            u.username === initial.scheduled_by
          );
          if (foundUser) {
            setScheduledBy(foundUser.name);
          } else {
            setScheduledBy(initial.scheduled_by);
          }
        }
        
        if (initial?.approved_by && !approvedBy) {
          const foundUser = approvalData.find((u) => 
            u.name === initial.approved_by || 
            u.full_name === initial.approved_by ||
            u.username === initial.approved_by
          );
          if (foundUser) {
            setApprovedBy(foundUser.name);
          } else {
            setApprovedBy(initial.approved_by);
          }
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setSchedulingUsers([]);
        setApprovalUsers([]);
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Prepare employee options for SearchableSelect
  const employeeOptions = employees.map((emp) => {
    const displayName = emp.full_name || emp.name || 'Unknown Employee';
    const displayInfo = [
      emp.employee_number,
      emp.email,
      emp.department
    ].filter(Boolean).join(' • ');
    
    return {
      value: emp.id,
      label: displayInfo ? `${displayName} - ${displayInfo}` : displayName,
      id: emp.id,
    };
  });
  
  // Prepare scheduling user options for SearchableSelect
  const schedulingUserOptions = schedulingUsers.map((user) => {
    const displayName = user.full_name || user.name || 'Unknown User';
    const displayInfo = [
      user.email,
      user.role || user.erp_role
    ].filter(Boolean).join(' • ');
    
    return {
      value: user.name || user.full_name || user.id,
      label: displayInfo ? `${displayName} - ${displayInfo}` : displayName,
      id: user.id,
    };
  });
  
  // Prepare approval user options for SearchableSelect
  const approvalUserOptions = approvalUsers.map((user) => {
    const displayName = user.full_name || user.name || 'Unknown User';
    const displayInfo = [
      user.email,
      user.role || user.erp_role
    ].filter(Boolean).join(' • ');
    
    return {
      value: user.name || user.full_name || user.id,
      label: displayInfo ? `${displayName} - ${displayInfo}` : displayName,
      id: user.id,
    };
  });

  // Auto-fill employee details when employee is selected
  useEffect(() => {
    if (employeeId) {
      const employee = employees.find((e) => e.id === employeeId || e.employee_id === employeeId);
      if (employee) {
        setEmployeeName(employee.full_name || employee.name);
        setEmployeeEmail(employee.email);
        if (employee.department) {
          setDepartment(employee.department as Department);
        }
      }
    }
  }, [employeeId, employees]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!employeeName || !date || !startTime || !endTime || !role) return;
    
    // Calculate total hours from schedule
    const calculatedHours = calculateTotalHours();
    
    // Calculate total pay (recalculate to ensure accuracy)
    const calculatedPay = calculateTotalPay();
    
    onSubmit({
      shift_number: shiftNumber,
      employee_id: employeeId || undefined,
      employee_name: employeeName,
      employee_email: employeeEmail || undefined,
      date,
      start_time: startTime,
      end_time: endTime,
      break_duration_minutes: Number(breakDuration) || undefined,
      total_hours: calculatedHours,
      role,
      erp_role: erpRole || undefined,
      department: department || undefined,
      job_title: jobTitle || undefined,
      location: location || undefined,
      shift_type: shiftType,
      status,
      is_overtime: isOvertime,
      scheduled_by: scheduledBy || undefined,
      approved_by: approvedBy || undefined,
      approval_date: approvalDate || undefined,
      clock_in_time: clockInTime || undefined,
      clock_out_time: clockOutTime || undefined,
      actual_hours: Number(actualHours) || undefined,
      attendance_status: attendanceStatus ? (attendanceStatus as 'PRESENT' | 'ABSENT' | 'LATE' | 'EARLY_LEAVE' | 'ON_TIME') : undefined,
      late_minutes: Number(lateMinutes) || undefined,
      early_leave_minutes: Number(earlyLeaveMinutes) || undefined,
      assigned_tasks: assignedTasks ? assignedTasks.split(',').map(t => t.trim()).filter(t => t) : undefined,
      task_completion_rate: Number(taskCompletionRate) || undefined,
      performance_rating: Number(performanceRating) || undefined,
      quality_score: Number(qualityScore) || undefined,
      hourly_rate: Number(hourlyRate) || undefined,
      total_pay: calculatedPay > 0 ? calculatedPay : (Number(totalPay) || undefined),
      overtime_hours: Number(overtimeHours) || undefined,
      overtime_rate: Number(overtimeRate) || undefined,
      currency: currency || undefined,
      notes: notes || undefined,
      internal_notes: internalNotes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      {/* Shift Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Shift Information</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Shift Number"
            value={shiftNumber}
            onChange={(e) => setShiftNumber(e.target.value)}
            placeholder="Auto-generated"
          />
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <Select
            label="Shift Type"
            value={shiftType}
            onChange={(e) => setShiftType(e.target.value as ShiftType)}
            required
          >
            <option value="REGULAR">Regular</option>
            <option value="OVERTIME">Overtime</option>
            <option value="HOLIDAY">Holiday</option>
            <option value="ON_CALL">On Call</option>
            <option value="TRAINING">Training</option>
            <option value="MEETING">Meeting</option>
          </Select>
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ShiftStatus)}
            required
          >
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="NO_SHOW">No Show</option>
          </Select>
        </div>
      </div>

      {/* Employee Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Employee Information</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {employeesLoading ? (
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                Employee <span className="text-red-500">*</span>
              </label>
              <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                Loading employees...
              </div>
            </div>
          ) : employeeOptions.length === 0 ? (
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                Employee <span className="text-red-500">*</span>
              </label>
              <div className="w-full rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-600">
                No employees available. Please add employees first.
              </div>
            </div>
          ) : (
            <SearchableSelect
              label="Employee"
              value={employeeId}
              onChange={(value) => {
                const selectedEmployee = employees.find((e) => e.id === value);
                if (selectedEmployee) {
                  setEmployeeId(value);
                  const displayName = selectedEmployee.full_name || selectedEmployee.name || '';
                  setEmployeeName(displayName);
                  setEmployeeEmail(selectedEmployee.email);
                  if (selectedEmployee.department) {
                    setDepartment(selectedEmployee.department as Department);
                  }
                } else {
                  setEmployeeId('');
                  setEmployeeName('');
                  setEmployeeEmail('');
                }
              }}
              options={employeeOptions}
              placeholder="Search and select employee..."
              required
              maxHeight="200px"
            />
          )}
          <Input
            label="Employee Name"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            placeholder="Employee name"
            required
          />
          <Input
            label="Email"
            type="email"
            value={employeeEmail}
            onChange={(e) => setEmployeeEmail(e.target.value)}
            placeholder="employee@company.com"
          />
        </div>
      </div>

      {/* Role & Department */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Role & Department</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Role/Job Title"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Job title or role"
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
          <Input
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Work location"
          />
        </div>
        <Input
          label="Job Title"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="Specific job title"
        />
      </div>

      {/* Time Schedule */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Time Schedule</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Start Time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
          <Input
            label="End Time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
          <Input
            label="Break Duration (minutes)"
            type="number"
            value={breakDuration}
            onChange={(e) => setBreakDuration(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="30"
            min={0}
          />
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="isOvertime"
              checked={isOvertime}
              onChange={(e) => setIsOvertime(e.target.checked)}
              className="rounded border-slate-300"
            />
            <label htmlFor="isOvertime" className="text-[11px] font-semibold text-slate-800">
              Overtime Shift
            </label>
          </div>
        </div>
      </div>

      {/* Time Tracking */}
      {(status === 'IN_PROGRESS' || status === 'COMPLETED') && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Time Tracking</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label="Clock In Time"
              type="time"
              value={clockInTime}
              onChange={(e) => setClockInTime(e.target.value)}
            />
            <Input
              label="Clock Out Time"
              type="time"
              value={clockOutTime}
              onChange={(e) => setClockOutTime(e.target.value)}
            />
            <Input
              label="Actual Hours"
              type="number"
              value={actualHours}
              onChange={(e) => setActualHours(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="8.0"
              min={0}
              step="0.25"
            />
          </div>
        </div>
      )}

      {/* Attendance */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Attendance</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Select
            label="Attendance Status"
            value={attendanceStatus}
            onChange={(e) => setAttendanceStatus(e.target.value)}
          >
            <option value="">Select status</option>
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="LATE">Late</option>
            <option value="EARLY_LEAVE">Early Leave</option>
            <option value="ON_TIME">On Time</option>
          </Select>
          <Input
            label="Late Minutes"
            type="number"
            value={lateMinutes}
            onChange={(e) => setLateMinutes(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
          />
          <Input
            label="Early Leave Minutes"
            type="number"
            value={earlyLeaveMinutes}
            onChange={(e) => setEarlyLeaveMinutes(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
          />
        </div>
      </div>

      {/* Tasks & Performance */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Tasks & Performance</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Assigned Tasks"
            value={assignedTasks}
            onChange={(e) => setAssignedTasks(e.target.value)}
            placeholder="Task 1, Task 2, Task 3 (comma-separated)"
          />
          <Input
            label="Task Completion Rate (%)"
            type="number"
            value={taskCompletionRate}
            onChange={(e) => setTaskCompletionRate(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="100"
            min={0}
            max={100}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Performance Rating (1-5)"
            type="number"
            value={performanceRating}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= 1 && val <= 5) setPerformanceRating(val);
            }}
            placeholder="4.5"
            min={1}
            max={5}
            step="0.1"
          />
          <Input
            label="Quality Score (1-5)"
            type="number"
            value={qualityScore}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= 1 && val <= 5) setQualityScore(val);
            }}
            placeholder="4.5"
            min={1}
            max={5}
            step="0.1"
          />
        </div>
      </div>

      {/* Payroll & Cost */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Payroll & Cost</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Hourly Rate"
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            min={0}
            step="0.01"
          />
          <Input
            label="Overtime Hours"
            type="number"
            value={overtimeHours}
            onChange={(e) => setOvertimeHours(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.0"
            min={0}
            step="0.25"
          />
          <Input
            label="Overtime Rate"
            type="number"
            value={overtimeRate}
            onChange={(e) => setOvertimeRate(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Auto: 1.5x hourly"
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
        </div>
        <div>
          <Input
            label="Total Pay"
            type="number"
            value={totalPay}
            onChange={(e) => setTotalPay(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Auto-calculated"
            min={0}
            step="0.01"
            readOnly
            className="bg-slate-50"
          />
          {(() => {
            const totalHrs = Number(actualHours) || calculateTotalHours();
            const otHrs = Number(overtimeHours) || 0;
            const regHrs = Math.max(0, totalHrs - otHrs);
            const rate = Number(hourlyRate) || 0;
            const otRate = Number(overtimeRate) || (rate * 1.5);
            if (rate > 0 && totalHrs > 0) {
              const calcPay = calculateTotalPay();
              return (
                <div className="text-[10px] text-slate-500 mt-1">
                  Formula: (Regular Hours × Hourly Rate) + (Overtime Hours × Overtime Rate)
                  <br />
                  = ({regHrs.toFixed(2)}h × ${rate.toFixed(2)}) + ({otHrs.toFixed(2)}h × ${otRate.toFixed(2)}) = ${calcPay.toFixed(2)}
                </div>
              );
            }
            return null;
          })()}
        </div>
      </div>

      {/* Approval */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Approval</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {usersLoading ? (
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                Scheduled By
              </label>
              <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                Loading users...
              </div>
            </div>
          ) : schedulingUserOptions.length === 0 ? (
            <Input
              label="Scheduled By"
              value={scheduledBy}
              onChange={(e) => setScheduledBy(e.target.value)}
              placeholder="Scheduler name"
            />
          ) : (
            <SearchableSelect
              label="Scheduled By"
              value={scheduledBy}
              onChange={(value) => setScheduledBy(value)}
              options={schedulingUserOptions}
              placeholder="Search and select scheduler..."
              maxHeight="200px"
            />
          )}
          {usersLoading ? (
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                Approved By
              </label>
              <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                Loading users...
              </div>
            </div>
          ) : approvalUserOptions.length === 0 ? (
            <Input
              label="Approved By"
              value={approvedBy}
              onChange={(e) => setApprovedBy(e.target.value)}
              placeholder="Manager name"
            />
          ) : (
            <SearchableSelect
              label="Approved By"
              value={approvedBy}
              onChange={(value) => setApprovedBy(value)}
              options={approvalUserOptions}
              placeholder="Search and select approver..."
              maxHeight="200px"
            />
          )}
          <Input
            label="Approval Date"
            type="date"
            value={approvalDate}
            onChange={(e) => setApprovalDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Notes</h3>
        <Textarea
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Shift notes"
          rows={3}
        />
        <Textarea
          label="Internal Notes"
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          placeholder="Internal notes (not visible to employee)"
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
          {initial ? 'Update Shift' : 'Create Shift'}
        </Button>
      </div>
    </form>
  );
}
