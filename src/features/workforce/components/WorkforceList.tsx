import { useState } from 'react';
import { useWorkforce } from '../hooks/useWorkforce';
import { useToast } from '../../../hooks/useToast';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Table, type TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { StatCard } from '../../../components/ui/StatCard';
import { Tabs } from '../../../components/ui/Tabs';
import { Badge } from '../../../components/ui/Badge';
import { Pagination } from '../../../components/ui/Pagination';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import type { Shift } from '../types';
import { ShiftForm } from './ShiftForm';

export function WorkforceList() {
  const { shifts, loading, create, update, remove, refresh, metrics } = useWorkforce();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'all' | 'scheduled' | 'in_progress' | 'completed'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<Shift | null>(null);
  const [sortOrder, setSortOrder] = useState<'ascending' | 'descending'>('descending');

  // Filter shifts based on search, status, type, department, and active tab
  const filteredShifts = shifts.filter((shift) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      shift.employee_name.toLowerCase().includes(searchLower) ||
      (shift.employee_email && shift.employee_email.toLowerCase().includes(searchLower)) ||
      (shift.shift_number && shift.shift_number.toLowerCase().includes(searchLower)) ||
      (shift.role && shift.role.toLowerCase().includes(searchLower)) ||
      (shift.job_title && shift.job_title.toLowerCase().includes(searchLower)) ||
      (shift.department && shift.department.toLowerCase().includes(searchLower)) ||
      (shift.location && shift.location.toLowerCase().includes(searchLower)) ||
      shift.date.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || shift.status === statusFilter;
    const matchesType = typeFilter === 'all' || shift.shift_type === typeFilter;
    const matchesDepartment = departmentFilter === 'all' || shift.department === departmentFilter;
    
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'scheduled' && shift.status === 'SCHEDULED') ||
      (activeTab === 'in_progress' && shift.status === 'IN_PROGRESS') ||
      (activeTab === 'completed' && shift.status === 'COMPLETED');
    
    return matchesSearch && matchesStatus && matchesType && matchesDepartment && matchesTab;
  });

  // Sort filtered shifts
  const sortedShifts = [...filteredShifts].sort((a, b) => {
    // Sort by date first, then by employee name
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    
    if (dateA !== dateB) {
      return sortOrder === 'ascending' ? dateA - dateB : dateB - dateA;
    }
    
    // If dates are equal, sort by employee name
    const nameA = (a.employee_name || '').toLowerCase();
    const nameB = (b.employee_name || '').toLowerCase();
    return sortOrder === 'ascending' 
      ? nameA.localeCompare(nameB)
      : nameB.localeCompare(nameA);
  });

  // Pagination
  const totalPages = Math.ceil(sortedShifts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedShifts = sortedShifts.slice(startIndex, startIndex + itemsPerPage);

  // Get unique values for filters
  const statuses = Array.from(new Set(shifts.map((s) => s.status)));
  const types = Array.from(new Set(shifts.map((s) => s.shift_type)));
  const departments = Array.from(new Set(shifts.map((s) => s.department).filter(Boolean)));

  // Calculate metrics
  const metricsByStatus = shifts.reduce(
    (acc, s) => {
      if (s.status === 'SCHEDULED') acc.scheduled += 1;
      if (s.status === 'IN_PROGRESS') acc.inProgress += 1;
      if (s.status === 'COMPLETED') acc.completed += 1;
      if (s.is_overtime) acc.overtime += 1;
      if (s.attendance_status === 'LATE' || s.attendance_status === 'ABSENT') acc.attendanceIssues += 1;
      return acc;
    },
    { scheduled: 0, inProgress: 0, completed: 0, overtime: 0, attendanceIssues: 0 }
  );

  // Calculate total hours and pay
  const totalHours = shifts.reduce((sum, s) => {
    const hours = s.total_hours || s.actual_hours || 0;
    // Ensure hours is a number
    const numHours = typeof hours === 'number' ? hours : parseFloat(String(hours)) || 0;
    return sum + numHours;
  }, 0);
  const totalPay = shifts.reduce((sum, s) => {
    const pay = s.total_pay || 0;
    // Ensure pay is a number
    const numPay = typeof pay === 'number' ? pay : parseFloat(String(pay)) || 0;
    return sum + numPay;
  }, 0);

  const columns: TableColumn<Shift>[] = [
    {
      key: 'shift_number',
      header: 'Shift #',
      render: (row) => row.shift_number || row.id,
    },
    { 
      key: 'date', 
      header: 'Date',
      render: (row) => {
        if (!row.date) return <span className="text-[11px] text-slate-400">-</span>;
        // Format date for display (YYYY-MM-DD to readable format)
        try {
          const date = new Date(row.date);
          if (isNaN(date.getTime())) return row.date; // Return as-is if invalid
          return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch {
          return row.date;
        }
      }
    },
    {
      key: 'employee_name',
      header: 'Employee',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="font-medium text-slate-900">{row.employee_name || 'Unknown Employee'}</div>
          {row.employee_email && (
            <div className="text-[10px] text-slate-500">{row.employee_email}</div>
          )}
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="text-slate-900">{row.role}</div>
          {row.erp_role && (
            <div className="text-[10px] text-slate-500">{String(row.erp_role).replace(/_/g, ' ')}</div>
          )}
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (row) => {
        if (!row.department) return <span className="text-[11px] text-slate-400">-</span>;
        return (
          <span className="text-[11px] text-slate-600">
            {String(row.department).replace(/_/g, ' ')}
          </span>
        );
      },
    },
    {
      key: 'shift_type',
      header: 'Type',
      render: (row) => {
        const typeColors = {
          REGULAR: 'bg-blue-50 text-blue-700',
          OVERTIME: 'bg-amber-50 text-amber-700',
          HOLIDAY: 'bg-purple-50 text-purple-700',
          ON_CALL: 'bg-indigo-50 text-indigo-700',
          TRAINING: 'bg-green-50 text-green-700',
          MEETING: 'bg-pink-50 text-pink-700',
        };
        const color = typeColors[row.shift_type] || 'bg-slate-50 text-slate-700';
        return (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${color} border`}>
            {String(row.shift_type).replace(/_/g, ' ')}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const statusTone =
          row.status === 'COMPLETED'
            ? 'success'
            : row.status === 'CANCELLED' || row.status === 'NO_SHOW'
            ? 'danger'
            : row.status === 'IN_PROGRESS'
            ? 'warning'
            : 'neutral';
        return <Badge tone={statusTone}>{String(row.status).replace(/_/g, ' ')}</Badge>;
      },
    },
    {
      key: 'start_time',
      header: 'Time',
      render: (row) => {
        const startTime = row.start_time || 'N/A';
        const endTime = row.end_time || 'N/A';
        const totalHours = row.total_hours || row.actual_hours;
        
        // Safely format hours
        const formatHours = (hours: any): string => {
          if (!hours) return '';
          const numHours = typeof hours === 'number' ? hours : parseFloat(String(hours));
          if (isNaN(numHours)) return '';
          return `${numHours.toFixed(1)}h`;
        };
        
        return (
          <div className="space-y-0.5">
            <div className="text-slate-900">
              {startTime} - {endTime}
            </div>
            {totalHours && (
              <div className="text-[10px] text-slate-500">
                {formatHours(totalHours)}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'attendance_status',
      header: 'Attendance',
      render: (row) => {
        if (!row.attendance_status) return <span className="text-[11px] text-slate-400">-</span>;
        const attendanceColors = {
          PRESENT: 'text-emerald-700',
          ON_TIME: 'text-emerald-700',
          LATE: 'text-amber-700',
          EARLY_LEAVE: 'text-orange-700',
          ABSENT: 'text-red-700',
        };
        const color = attendanceColors[row.attendance_status] || 'text-slate-700';
        return (
          <span className={`text-[11px] font-medium ${color}`}>
            {String(row.attendance_status).replace(/_/g, ' ')}
          </span>
        );
      },
    },
    {
      key: 'id',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingShift(row);
              setModalOpen(true);
            }}
            className="text-[11px] text-primary hover:text-primary-dark"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row)}
            className="text-[11px] text-red-500 hover:text-red-600"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const handleFormSubmit = async (data: Omit<Shift, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingShift) {
        await update(editingShift.id, data);
        showToast('success', 'Shift Updated', `Shift for "${data.employee_name}" has been updated successfully.`);
      } else {
        await create(data);
        showToast('success', 'Shift Created', `Shift for "${data.employee_name}" has been created successfully.`);
      }
      setModalOpen(false);
      setEditingShift(null);
    } catch (error: any) {
      // Re-throw error so form can handle validation errors
      // The form will display detailed validation errors
      throw error;
    }
  };

  const handleDelete = (shift: Shift) => {
    setShiftToDelete(shift);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!shiftToDelete) return;
    
    try {
      await remove(shiftToDelete.id);
      showToast('success', 'Shift Deleted', `Shift for "${shiftToDelete.employee_name}" has been deleted successfully.`);
    } catch (error) {
      showToast('error', 'Deletion Failed', 'Failed to delete shift. Please try again.');
    } finally {
      setShiftToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Workforce Management
          </h1>
          <p className="text-xs text-slate-600 max-w-xl">
            Manage employee shifts, track attendance, monitor performance, and schedule workforce across departments and ERP roles.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingShift(null);
            setModalOpen(true);
          }}
        >
          New Shift
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total Shifts"
          value={metrics.totalShifts.toString()}
          helper="All scheduled shifts."
          trend="up"
          variant="teal"
        />
        <StatCard
          label="Scheduled"
          value={metricsByStatus.scheduled.toString()}
          helper="Upcoming shifts."
          trend="flat"
          variant="blue"
        />
        <StatCard
          label="In Progress"
          value={metricsByStatus.inProgress.toString()}
          helper="Currently active."
          trend="up"
          variant="yellow"
        />
        <StatCard
          label="Total Hours"
          value={typeof totalHours === 'number' ? totalHours.toFixed(1) : '0.0'}
          helper="Scheduled/worked hours."
          trend="flat"
          variant="purple"
        />
        <StatCard
          label="Overtime Shifts"
          value={metricsByStatus.overtime.toString()}
          helper="Overtime scheduled."
          trend={metricsByStatus.overtime > 0 ? 'down' : 'flat'}
          variant="yellow"
        />
      </div>

      {/* Tabs */}
      <Card className="space-y-4">
        <Tabs
          items={[
            { id: 'all', label: 'All Shifts' },
            { id: 'scheduled', label: 'Scheduled' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
          ]}
          activeId={activeTab}
          onChange={(id) => {
            setActiveTab(id as 'all' | 'scheduled' | 'in_progress' | 'completed');
            setCurrentPage(1);
          }}
        />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by employee name, email, shift #, role, department, or location..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-48"
          >
            <option value="all">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </Select>
          <Select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-48"
          >
            <option value="all">All Types</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type.replace('_', ' ')}
              </option>
            ))}
          </Select>
          <Select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-48"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept?.replace('_', ' ')}
              </option>
            ))}
          </Select>
          <Select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value as 'ascending' | 'descending');
              setCurrentPage(1);
            }}
            className="w-full sm:w-48"
          >
            <option value="ascending">Sort By: Ascending</option>
            <option value="descending">Sort By: Descending</option>
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-12 sm:py-16">
            <LoadingState label="Loading shifts..." size="md" variant="default" />
          </div>
        ) : sortedShifts.length === 0 ? (
          <EmptyState
            title="No shifts found"
            description={
              searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || departmentFilter !== 'all' || activeTab !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Create your first shift to get started.'
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table
                columns={columns}
                data={paginatedShifts}
                getRowKey={(row, index) => `${row.id}-${index}`}
              />
            </div>
            {/* Pagination */}
            <div className="px-4 py-3 border-t border-slate-200">
              <div className="flex items-center justify-between gap-4">
                {/* Left: Page size selector */}
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span>Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-slate-200 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>per page</span>
                </div>

                {/* Center: Page numbers */}
                <div className="flex-1 flex justify-center">
                  <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    onChange={setCurrentPage}
                  />
                </div>

                {/* Right: Showing info */}
                <div className="text-xs text-slate-600 whitespace-nowrap">
                  Showing <span className="font-medium text-slate-900">{startIndex + 1}</span> to <span className="font-medium text-slate-900">{Math.min(startIndex + itemsPerPage, sortedShifts.length)}</span> of <span className="font-medium text-slate-900">{sortedShifts.length}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Modal */}
      <Modal
        title={editingShift ? 'Edit Shift' : 'New Shift'}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingShift(null);
        }}
        hideCloseButton
      >
        <ShiftForm
          key={editingShift?.id || 'new-shift'}
          initial={editingShift || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditingShift(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Shift"
        message={
          shiftToDelete
            ? `Are you sure you want to delete the shift for "${shiftToDelete.employee_name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this shift? This action cannot be undone.'
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setShiftToDelete(null);
        }}
      />
    </div>
  );
}
