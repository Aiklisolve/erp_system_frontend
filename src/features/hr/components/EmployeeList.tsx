import { useState, useEffect } from 'react';
import { useHr } from '../hooks/useHr';
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
import type { Employee, LeaveRequest, EmploymentType } from '../types';
import { EmployeeForm } from './EmployeeForm';
import { HrLeaveManagement } from './HrLeaveManagement';
import * as hrApi from '../api/hrApi';

export function EmployeeList() {
  const { employees, loading, create, update, remove, refresh, metrics } = useHr();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'on_leave' | 'inactive'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leavesLoading, setLeavesLoading] = useState(false);

  // Fetch leave requests to determine who is on leave
  useEffect(() => {
    const loadLeaves = async () => {
      setLeavesLoading(true);
      try {
        const leaves = await hrApi.listLeaves();
        setLeaveRequests(leaves);
      } catch (error) {
        console.error('Failed to load leave requests:', error);
      } finally {
        setLeavesLoading(false);
      }
    };
    loadLeaves();
  }, []);

  // Get employees currently on leave based on approved leave requests for current date
  const getEmployeesOnLeave = (): Set<string> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    const employeesOnLeave = new Set<string>();
    
    leaveRequests.forEach((leave) => {
      // Only consider APPROVED leaves
      if (leave.status === 'APPROVED' && leave.start_date && leave.end_date) {
        const startDate = new Date(leave.start_date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(leave.end_date);
        endDate.setHours(23, 59, 59, 999);
        const todayDate = new Date(todayStr);
        todayDate.setHours(0, 0, 0, 0);
        
        // Check if current date is between start and end date
        if (todayDate >= startDate && todayDate <= endDate) {
          const employeeId = leave.employee_id?.toString() || '';
          if (employeeId) {
            employeesOnLeave.add(employeeId);
            // Also try to match by employee number or name if ID doesn't match
            const matchingEmployee = employees.find(
              (emp) => 
                emp.id === employeeId || 
                emp.employee_id === employeeId ||
                emp.employee_number === employeeId ||
                (leave.employee_name && (emp.full_name === leave.employee_name || `${emp.first_name} ${emp.last_name}`.trim() === leave.employee_name))
            );
            if (matchingEmployee) {
              employeesOnLeave.add(matchingEmployee.id);
            }
          }
        }
      }
    });
    
    return employeesOnLeave;
  };

  // Get employees currently on leave (recalculate when leaveRequests or employees change)
  const employeesOnLeaveSet = getEmployeesOnLeave();

  // Filter employees based on search, status, department, employment type, and active tab
  const filteredEmployees = employees.filter((employee) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = employee.full_name || `${employee.first_name} ${employee.last_name}`.trim();
    const matchesSearch =
      fullName.toLowerCase().includes(searchLower) ||
      employee.first_name.toLowerCase().includes(searchLower) ||
      employee.last_name.toLowerCase().includes(searchLower) ||
      (employee.employee_number && employee.employee_number.toLowerCase().includes(searchLower)) ||
      (employee.email && employee.email.toLowerCase().includes(searchLower)) ||
      (employee.phone && employee.phone.includes(searchTerm)) ||
      (employee.role && employee.role.toLowerCase().includes(searchLower)) ||
      (employee.department && employee.department.toLowerCase().includes(searchLower)) ||
      (employee.national_id && employee.national_id.includes(searchTerm));
    
    const normalizedStatus = employee.status ? String(employee.status).toUpperCase() : '';
    const normalizedFilterStatus = statusFilter !== 'all' ? String(statusFilter).toUpperCase() : '';
    const matchesStatus = statusFilter === 'all' || normalizedStatus === normalizedFilterStatus;
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    const normalizedEmploymentType = employee.employment_type ? String(employee.employment_type).toUpperCase() : '';
    const normalizedFilterType = employmentTypeFilter !== 'all' ? String(employmentTypeFilter).toUpperCase() : '';
    const matchesEmploymentType = employmentTypeFilter === 'all' || normalizedEmploymentType === normalizedFilterType;
    
    // Tab filtering logic
    let matchesTab = false;
    if (activeTab === 'all') {
      matchesTab = true;
    } else if (activeTab === 'active') {
      matchesTab = normalizedStatus === 'ACTIVE' && !employeesOnLeaveSet.has(employee.id);
    } else if (activeTab === 'on_leave') {
      // Show employees who are currently on leave (based on leave requests)
      matchesTab = employeesOnLeaveSet.has(employee.id);
    } else if (activeTab === 'inactive') {
      matchesTab = (normalizedStatus === 'INACTIVE' || normalizedStatus === 'TERMINATED' || normalizedStatus === 'RESIGNED' || normalizedStatus === 'RETIRED');
    }
    
    return matchesSearch && matchesStatus && matchesDepartment && matchesEmploymentType && matchesTab;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);

  // Get unique values for filters
  const statuses = Array.from(new Set(employees.map((e) => e.status).filter(Boolean)));
  const departments = Array.from(new Set(employees.map((e) => e.department).filter(Boolean)));
  
  // All possible employment types (from type definition)
  const allEmploymentTypes: EmploymentType[] = [
    'FULL_TIME',
    'PART_TIME',
    'CONTRACT',
    'TEMPORARY',
    'INTERN',
    'CONSULTANT'
  ];
  
  // Get unique employment types from actual data (for reference)
  const employmentTypesFromData = Array.from(new Set(employees.map((e) => e.employment_type).filter(Boolean)));
  
  // Use all types for filter dropdown
  const employmentTypes = allEmploymentTypes;

  // Calculate metrics - use actual leave requests for onLeave count
  const metricsByStatus = employees.reduce(
    (acc, e) => {
      const normalizedStatus = e.status ? String(e.status).toUpperCase() : '';
      const isOnLeave = employeesOnLeaveSet.has(e.id);
      
      if (normalizedStatus === 'ACTIVE' && !isOnLeave) acc.active += 1;
      if (isOnLeave) acc.onLeave += 1;
      if (normalizedStatus === 'TERMINATED' || normalizedStatus === 'RESIGNED') acc.terminated += 1;
      if (e.employment_type === 'FULL_TIME') acc.fullTime += 1;
      if (e.employment_type === 'PART_TIME') acc.partTime += 1;
      if (normalizedStatus === 'INACTIVE') acc.inactive += 1;
      
      // Check for high performers - handle both number and string types
      const performanceRating = e.performance_rating;
      if (performanceRating !== null && performanceRating !== undefined) {
        const rating = typeof performanceRating === 'number' 
          ? performanceRating 
          : typeof performanceRating === 'string' 
            ? parseFloat(performanceRating) 
            : 0;
        if (!isNaN(rating) && rating >= 4.5) {
          acc.highPerformers += 1;
        }
      }
      
      return acc;
    },
    { active: 0, onLeave: 0, terminated: 0, fullTime: 0, partTime: 0, inactive: 0, highPerformers: 0 }
  );

  // Debug logging
  useEffect(() => {
    console.log('📊 HR Metrics:', {
      total: employees.length,
      active: metricsByStatus.active,
      onLeave: metricsByStatus.onLeave,
      fullTime: metricsByStatus.fullTime,
      highPerformers: metricsByStatus.highPerformers,
      employeesOnLeaveCount: employeesOnLeaveSet.size,
      leaveRequestsCount: leaveRequests.length,
      approvedLeaves: leaveRequests.filter(l => l.status === 'APPROVED').length
    });
  }, [employees.length, metricsByStatus, employeesOnLeaveSet.size, leaveRequests.length]);

  const columns: TableColumn<Employee>[] = [
    {
      key: 'employee_number',
      header: 'Emp #',
      render: (row) => (
        <span className="text-[11px] font-medium text-slate-900">
          {row.employee_number || row.id || '-'}
        </span>
      ),
    },
    {
      key: 'first_name',
      header: 'Employee',
      render: (row) => {
        const fullName = row.full_name || `${row.first_name} ${row.last_name}`.trim();
        return (
          <div className="space-y-0.5">
            <div className="font-medium text-slate-900">{fullName || '-'}</div>
            {row.email && (
              <div className="text-[10px] text-slate-500">{row.email}</div>
            )}
            {row.phone && (
              <div className="text-[10px] text-slate-500">{row.phone}</div>
            )}
          </div>
        );
      },
    },
    {
      key: 'role',
      header: 'Position/Role',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="text-slate-900 font-medium">{row.role || '-'}</div>
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
      key: 'employment_type',
      header: 'Type',
      render: (row) => {
        const typeColors = {
          FULL_TIME: 'bg-blue-50 text-blue-700',
          PART_TIME: 'bg-purple-50 text-purple-700',
          CONTRACT: 'bg-amber-50 text-amber-700',
          TEMPORARY: 'bg-orange-50 text-orange-700',
          INTERN: 'bg-green-50 text-green-700',
          CONSULTANT: 'bg-indigo-50 text-indigo-700',
        };
        if (!row.employment_type) return <span className="text-[11px] text-slate-400">-</span>;
        const color = typeColors[row.employment_type] || 'bg-slate-50 text-slate-700';
        return (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${color} border`}>
            {String(row.employment_type).replace(/_/g, ' ')}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const normalizedStatus = row.status ? String(row.status).toUpperCase() : '';
        const isOnLeave = employeesOnLeaveSet.has(row.id);
        
        // If employee is on leave, show that status
        if (isOnLeave) {
          const activeLeave = leaveRequests.find(
            (leave) => 
              leave.employee_id === row.id && 
              leave.status === 'APPROVED' &&
              leave.start_date && 
              leave.end_date &&
              (() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const startDate = new Date(leave.start_date);
                startDate.setHours(0, 0, 0, 0);
                const endDate = new Date(leave.end_date);
                endDate.setHours(23, 59, 59, 999);
                return today >= startDate && today <= endDate;
              })()
          );
          
          return (
            <div className="space-y-0.5">
              <Badge tone="warning">On Leave</Badge>
              {activeLeave && (
                <div className="text-[10px] text-slate-500">
                  {activeLeave.leave_type.replace(/_/g, ' ')} • Until {new Date(activeLeave.end_date).toLocaleDateString()}
                </div>
              )}
            </div>
          );
        }
        
        const statusTone =
          normalizedStatus === 'ACTIVE'
            ? 'success'
            : normalizedStatus === 'TERMINATED' || normalizedStatus === 'RESIGNED'
            ? 'danger'
            : 'neutral';
        if (!row.status) return <Badge tone="neutral">-</Badge>;
        return <Badge tone={statusTone}>{String(row.status).replace(/_/g, ' ')}</Badge>;
      },
    },
    {
      key: 'join_date',
      header: 'Join Date',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="text-slate-900">{row.join_date || '-'}</div>
          {row.years_of_experience && (
            <div className="text-[10px] text-slate-500">{row.years_of_experience} yrs exp</div>
          )}
        </div>
      ),
    },
    {
      key: 'manager_name',
      header: 'Manager',
      render: (row) => (
        <span className="text-[11px] text-slate-600">
          {row.manager_name || row.reporting_manager || '-'}
        </span>
      ),
    },
    {
      key: 'salary',
      header: 'Salary',
      render: (row) => {
        if (!row.salary) return <span className="text-[11px] text-slate-400">-</span>;
        const currency = row.currency || 'USD';
        const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'INR' ? '₹' : currency;
        return (
          <span className="text-[11px] text-slate-900 font-medium">
            {currencySymbol}{typeof row.salary === 'number' ? row.salary.toLocaleString() : row.salary}
          </span>
        );
      },
    },
    {
      key: 'location',
      header: 'Location',
      render: (row) => {
        const locationParts = [row.city, row.state].filter(Boolean);
        if (locationParts.length === 0) return <span className="text-[11px] text-slate-400">-</span>;
        return (
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-600">{locationParts.join(', ')}</span>
            {row.postal_code && (
              <div className="text-[10px] text-slate-500">{row.postal_code}</div>
            )}
          </div>
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
              setEditingEmployee(row);
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

  const handleFormSubmit = async (data: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => {
    const employeeName = data.full_name || `${data.first_name} ${data.last_name}`.trim();
    try {
      if (editingEmployee) {
        await update(editingEmployee.id, data);
        showToast('success', 'Employee Updated', `Employee "${employeeName}" has been updated successfully.`);
      } else {
        await create(data);
        showToast('success', 'Employee Created', `Employee "${employeeName}" has been created successfully.`);
      }
      setModalOpen(false);
      setEditingEmployee(null);
    } catch (error) {
      showToast('error', 'Operation Failed', 'Failed to save employee. Please try again.');
    }
  };

  const handleDelete = async (employee: Employee) => {
    const employeeName = employee.full_name || `${employee.first_name} ${employee.last_name}`.trim();
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await remove(employee.id);
        showToast('success', 'Employee Deleted', `Employee "${employeeName}" has been deleted successfully.`);
      } catch (error) {
        showToast('error', 'Deletion Failed', 'Failed to delete employee. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            HR Management
          </h1>
          <p className="text-xs text-slate-600 max-w-xl">
            Manage employee records, track performance, monitor leave balances, and maintain comprehensive HR information across departments and ERP roles.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingEmployee(null);
            setModalOpen(true);
          }}
        >
          New Employee
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total Employees"
          value={employees.length.toString()}
          helper="All employees in system."
          trend="up"
          variant="teal"
        />
        <StatCard
          label="Active"
          value={metricsByStatus.active.toString()}
          helper="Currently active (excluding on leave)."
          trend="up"
          variant="blue"
        />
        <StatCard
          label="On Leave"
          value={metricsByStatus.onLeave?.toString() || '0'}
          helper={`On approved leave (current date). ${employeesOnLeaveSet.size > 0 ? `${employeesOnLeaveSet.size} employee(s) on leave today.` : 'No employees on leave today.'}`}
          trend={metricsByStatus.onLeave > 0 ? 'down' : 'flat'}
          variant="yellow"
        />
        <StatCard
          label="Full Time"
          value={metricsByStatus.fullTime?.toString() || '0'}
          helper="Full-time employees."
          trend="flat"
          variant="purple"
        />
        <StatCard
          label="Terminated"
          value={metricsByStatus.terminated?.toString() || '0'}
          helper="Terminated or resigned employees."
          trend={metricsByStatus.terminated > 0 ? 'down' : 'flat'}
          variant="neutral"
        />
      </div>

      {/* Tabs */}
      <Card className="space-y-4">
        <Tabs
          items={[
            { id: 'all', label: 'All Employees' },
            { id: 'active', label: 'Active' },
            { id: 'leaves', label: 'Leave Management' },
            { id: 'on_leave', label: 'On Leave' },
            { id: 'inactive', label: 'Inactive' },
          ]}
          activeId={activeTab}
          onChange={(id) => {
            setActiveTab(id as 'all' | 'active' | 'on_leave' | 'inactive' | 'leaves');
            setCurrentPage(1);
          }}
        />

        {/* Conditional Content */}
        {activeTab === 'leaves' ? (
          <div className="p-4">
            <HrLeaveManagement employees={employees} />
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search by name, employee #, email, phone, role, department, or national ID..."
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
                  <option key={status || 'unknown'} value={status || ''}>
                    {status ? String(status).replace(/_/g, ' ') : 'Unknown'}
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
                value={employmentTypeFilter}
                onChange={(e) => {
                  setEmploymentTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-48"
              >
                <option value="all">All Types</option>
                {employmentTypes.map((type) => (
                  <option key={type} value={type}>
                    {String(type).replace(/_/g, ' ')}
                  </option>
                ))}
              </Select>
            </div>

            {/* Table */}
            {(loading || leavesLoading) ? (
              <LoadingState label="Loading employees..." />
            ) : filteredEmployees.length === 0 ? (
              <EmptyState
                title="No employees found"
                description={
                  searchTerm || statusFilter !== 'all' || departmentFilter !== 'all' || employmentTypeFilter !== 'all' || activeTab !== 'all'
                    ? 'Try adjusting your filters to see more results.'
                    : 'Create your first employee to get started.'
                }
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table
                    columns={columns}
                    data={paginatedEmployees}
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
                      Showing <span className="font-medium text-slate-900">{startIndex + 1}</span> to <span className="font-medium text-slate-900">{Math.min(startIndex + itemsPerPage, filteredEmployees.length)}</span> of <span className="font-medium text-slate-900">{filteredEmployees.length}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </Card>

      {/* Modal */}
      <Modal
        title={editingEmployee ? 'Edit Employee' : 'New Employee'}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingEmployee(null);
        }}
        hideCloseButton
      >
        <EmployeeForm
          initial={editingEmployee || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditingEmployee(null);
          }}
        />
      </Modal>
    </div>
  );
}
