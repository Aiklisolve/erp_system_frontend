import { useState, useEffect, FormEvent } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { Table, type TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { StatCard } from '../../../components/ui/StatCard';
import { Badge } from '../../../components/ui/Badge';
import { Pagination } from '../../../components/ui/Pagination';
import type { Leave, LeaveType, LeaveStatus, ErpUser } from '../types';
import { toast } from '../../../lib/toast';
import * as crmApi from '../api/crmApi';

type LeaveFormProps = {
  initial?: Partial<Leave>;
  employees: ErpUser[];
  onSubmit: (values: Omit<Leave, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
};

// Generate leave number
function generateLeaveNumber(): string {
  const prefix = 'LV';
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}-${random}`;
}

// Calculate days between dates
function calculateDays(start: string, end: string): number {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}

function LeaveFormComponent({ initial, employees, onSubmit, onCancel }: LeaveFormProps) {
  const [leaveNumber, setLeaveNumber] = useState(initial?.leave_number ?? generateLeaveNumber());
  const [employeeId, setEmployeeId] = useState(initial?.employee_id ?? '');
  const [leaveType, setLeaveType] = useState<LeaveType>(initial?.leave_type ?? 'CASUAL_LEAVE');
  const [startDate, setStartDate] = useState(initial?.start_date ?? '');
  const [endDate, setEndDate] = useState(initial?.end_date ?? '');
  const [totalDays, setTotalDays] = useState(initial?.total_days?.toString() ?? '0');
  const [reason, setReason] = useState(initial?.reason ?? '');
  const [status, setStatus] = useState<LeaveStatus>(initial?.status ?? 'PENDING');
  const [emergencyContactName, setEmergencyContactName] = useState(initial?.emergency_contact_name ?? '');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(initial?.emergency_contact_phone ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  // Auto-calculate total days
  useEffect(() => {
    if (startDate && endDate) {
      const days = calculateDays(startDate, endDate);
      setTotalDays(days.toString());
    }
  }, [startDate, endDate]);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!employeeId) newErrors.employeeId = 'Please select an employee';
    if (!startDate) newErrors.startDate = 'Start date is required';
    if (!endDate) newErrors.endDate = 'End date is required';
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    if (!reason.trim()) newErrors.reason = 'Reason is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    const selectedEmployee = employees.find(emp => emp.id === employeeId);
    
    const payload: Omit<Leave, 'id' | 'created_at' | 'updated_at'> = {
      leave_number: leaveNumber,
        employee_id: employeeId,
      employee_number: selectedEmployee?.employee_number,
      employee_name: selectedEmployee?.full_name || `${selectedEmployee?.first_name} ${selectedEmployee?.last_name}`,
      employee_email: selectedEmployee?.email,
      employee_role: selectedEmployee?.role,
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      total_days: parseInt(totalDays),
      reason,
      status,
      applied_date: initial?.applied_date || new Date().toISOString().split('T')[0],
      emergency_contact_name: emergencyContactName || undefined,
      emergency_contact_phone: emergencyContactPhone || undefined,
      notes: notes || undefined
    };
    
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Leave Information */}
              <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Leave Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Leave Number <span className="text-red-500">*</span>
            </label>
            <Input
              value={leaveNumber}
              onChange={(e) => setLeaveNumber(e.target.value)}
              placeholder="LV-2025-0001"
              required
            />
              </div>
                <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Employee <span className="text-red-500">*</span>
            </label>
            <Select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required>
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name || `${emp.first_name} ${emp.last_name}`} - {emp.employee_number}
                </option>
              ))}
            </Select>
            {errors.employeeId && <p className="text-xs text-red-600 mt-1">{errors.employeeId}</p>}
                </div>
                <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Leave Type <span className="text-red-500">*</span>
            </label>
            <Select value={leaveType} onChange={(e) => setLeaveType(e.target.value as LeaveType)} required>
              <option value="CASUAL_LEAVE">Casual Leave</option>
              <option value="SICK_LEAVE">Sick Leave</option>
              <option value="ANNUAL_LEAVE">Annual Leave</option>
              <option value="MATERNITY_LEAVE">Maternity Leave</option>
              <option value="PATERNITY_LEAVE">Paternity Leave</option>
              <option value="UNPAID_LEAVE">Unpaid Leave</option>
              <option value="COMP_OFF">Comp Off</option>
              <option value="OTHER">Other</option>
            </Select>
                </div>
                <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Status <span className="text-red-500">*</span>
            </label>
            <Select value={status} onChange={(e) => setStatus(e.target.value as LeaveStatus)} required>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
                </div>
                </div>
              </div>

      {/* Leave Dates */}
                <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Leave Dates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Start Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            {errors.startDate && <p className="text-xs text-red-600 mt-1">{errors.startDate}</p>}
                </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              End Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
            {errors.endDate && <p className="text-xs text-red-600 mt-1">{errors.endDate}</p>}
          </div>
              <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Total Days (Auto-calculated)
            </label>
            <Input
              type="number"
              value={totalDays}
              readOnly
              className="bg-slate-50"
            />
              </div>
                </div>
            </div>

      {/* Leave Details */}
                          <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Leave Details
                            </h3>
        <div className="space-y-4">
                          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Reason <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide reason for leave"
              rows={3}
              required
            />
            {errors.reason && <p className="text-xs text-red-600 mt-1">{errors.reason}</p>}
                          </div>
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
                placeholder="+1-555-0101"
              />
            </div>
                          </div>
                          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Additional Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information"
              rows={2}
            />
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
          {initial ? 'Update Leave' : 'Apply Leave'}
        </Button>
                  </div>
    </form>
  );
}

export function LeaveManagement({ employees }: { employees: ErpUser[] }) {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState<Leave | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    setLoading(true);
    try {
      const data = await crmApi.listLeaves();
      console.log('Loaded leaves:', data);
      setLeaves(data);
    } catch (error) {
      console.error('Failed to load leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const filteredLeaves = leaves.filter((leave) => {
    const matchesSearch =
      searchTerm === '' ||
      leave.leave_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.employee_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.employee_email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || leave.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeaves = filteredLeaves.slice(startIndex, startIndex + itemsPerPage);

  // Calculate metrics
  const totalLeaves = leaves.length;
  const pendingLeaves = leaves.filter((l) => l.status === 'PENDING').length;
  const approvedLeaves = leaves.filter((l) => l.status === 'APPROVED').length;
  const rejectedLeaves = leaves.filter((l) => l.status === 'REJECTED').length;

  console.log('Leave Management - Total leaves:', totalLeaves);
  console.log('Filtered leaves:', filteredLeaves.length);
  console.log('Paginated leaves:', paginatedLeaves.length);
  console.log('Paginated leaves data:', paginatedLeaves);

  const columns: TableColumn<Leave>[] = [
    {
      key: 'leave_number',
      header: 'Leave #',
      render: (row) => (
        <div className="font-medium text-slate-900">{row.leave_number}</div>
      )
    },
    {
      key: 'employee_name',
      header: 'Employee',
      render: (row) => (
                    <div>
          <div className="text-xs font-medium text-slate-900">{row.employee_name}</div>
          <div className="text-[10px] text-slate-500">{row.employee_number} - {row.employee_role?.replace(/_/g, ' ')}</div>
                    </div>
      )
    },
    {
      key: 'leave_type',
      header: 'Leave Type',
      render: (row) => (
        <Badge tone="brand">
          {row.leave_type.replace(/_/g, ' ')}
        </Badge>
      )
    },
    {
      key: 'dates',
      header: 'Dates',
      render: (row) => (
                    <div>
          <div className="text-xs text-slate-900">
            {new Date(row.start_date).toLocaleDateString()} - {new Date(row.end_date).toLocaleDateString()}
                    </div>
          <div className="text-[10px] text-slate-500">{row.total_days} days</div>
                    </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
                      <Badge
          tone={
            row.status === 'APPROVED'
              ? 'success'
              : row.status === 'REJECTED'
              ? 'danger'
              : row.status === 'PENDING'
              ? 'warning'
              : 'neutral'
          }
        >
          {row.status}
                      </Badge>
      )
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (row) => (
        <div className="text-xs text-slate-600 max-w-xs truncate" title={row.reason}>
          {row.reason}
                    </div>
      )
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={() => {
              setEditingLeave(row);
              setModalOpen(true);
            }}
            className="text-[11px] text-primary hover:text-primary-light font-medium"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={async () => {
              if (window.confirm('Are you sure you want to delete this leave?')) {
                try {
                  await crmApi.deleteLeave(row.id);
                  await loadLeaves();
                  toast.success('Leave deleted successfully!');
                } catch (error) {
                  toast.error('Failed to delete leave');
                }
              }
            }}
            className="text-[11px] text-red-600 hover:text-red-700 font-medium"
          >
            Delete
          </button>
                  </div>
      )
    }
  ];

  const handleCreate = async (data: Omit<Leave, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await crmApi.createLeave(data);
      setModalOpen(false);
      setEditingLeave(null);
      await loadLeaves();
      toast.success('Leave applied successfully!');
    } catch (error) {
      toast.error('Failed to apply leave');
    }
  };

  const handleUpdate = async (data: Omit<Leave, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingLeave) {
      try {
        await crmApi.updateLeave(editingLeave.id, data);
        setModalOpen(false);
        setEditingLeave(null);
        await loadLeaves();
        toast.success('Leave updated successfully!');
      } catch (error) {
        toast.error('Failed to update leave');
      }
    }
  };

  if (loading) {
    return (
      <div className="py-12 sm:py-16">
        <LoadingState label="Loading leaves..." size="md" variant="default" />
      </div>
    );
  }

                        return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Leave Management</h2>
          <p className="text-xs text-slate-600 mt-1">
            Manage employee leave requests and track leave balances
          </p>
                            </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setEditingLeave(null);
            setModalOpen(true);
          }}
        >
          + Apply Leave
        </Button>
              </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Leaves"
          value={totalLeaves.toString()}
        />
        <StatCard
          label="Pending"
          value={pendingLeaves.toString()}
        />
        <StatCard
          label="Approved"
          value={approvedLeaves.toString()}
        />
        <StatCard
          label="Rejected"
          value={rejectedLeaves.toString()}
                />
              </div>

      {/* Filters */}
      <Card>
        <div className="p-4 border-b border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Search
                    </label>
                    <Input
                placeholder="Search by leave #, employee name, employee #..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                    />
                  </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Status
                    </label>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </Select>
                  </div>
                </div>
              </div>

        {/* Table */}
        {paginatedLeaves.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No leaves found"
              description="Apply your first leave or adjust your filters"
            />
            <div className="mt-4 text-center">
                <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setEditingLeave(null);
                  setModalOpen(true);
                }}
              >
                + Apply Leave
                </Button>
              </div>
            </div>
        ) : (
          <>
            <Table
              data={paginatedLeaves}
              columns={columns}
              getRowKey={(row, index) => `${row.id}-${index}`}
            />

            {/* Pagination */}
            <div className="p-4 border-t border-slate-200">
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onChange={setCurrentPage}
              />
              <div className="mt-2 text-center text-xs text-slate-600">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredLeaves.length)} of {filteredLeaves.length} leaves
      </div>
            </div>
          </>
        )}
      </Card>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingLeave(null);
        }}
        title={editingLeave ? 'Edit Leave' : 'Apply Leave'}
      >
        <LeaveFormComponent
          initial={editingLeave || undefined}
          employees={employees}
          onSubmit={editingLeave ? handleUpdate : handleCreate}
          onCancel={() => {
            setModalOpen(false);
            setEditingLeave(null);
          }}
        />
      </Modal>
    </div>
  );
}
