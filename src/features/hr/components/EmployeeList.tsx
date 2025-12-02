import { useState } from 'react';
import { useHr } from '../hooks/useHr';
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
import type { Employee } from '../types';
import { EmployeeForm } from './EmployeeForm';

export function EmployeeList() {
  const { employees, loading, create, update, remove, refresh, metrics } = useHr();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'on_leave' | 'inactive'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
    
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    const matchesEmploymentType = employmentTypeFilter === 'all' || employee.employment_type === employmentTypeFilter;
    
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'active' && employee.status === 'ACTIVE') ||
      (activeTab === 'on_leave' && employee.status === 'ON_LEAVE') ||
      (activeTab === 'inactive' && (employee.status === 'INACTIVE' || employee.status === 'TERMINATED' || employee.status === 'RESIGNED'));
    
    return matchesSearch && matchesStatus && matchesDepartment && matchesEmploymentType && matchesTab;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);

  // Get unique values for filters
  const statuses = Array.from(new Set(employees.map((e) => e.status)));
  const departments = Array.from(new Set(employees.map((e) => e.department).filter(Boolean)));
  const employmentTypes = Array.from(new Set(employees.map((e) => e.employment_type)));

  // Calculate metrics
  const metricsByStatus = employees.reduce(
    (acc, e) => {
      if (e.status === 'ACTIVE') acc.active += 1;
      if (e.status === 'ON_LEAVE') acc.onLeave += 1;
      if (e.status === 'TERMINATED' || e.status === 'RESIGNED') acc.terminated += 1;
      if (e.employment_type === 'FULL_TIME') acc.fullTime += 1;
      if (e.performance_rating && e.performance_rating >= 4.5) acc.highPerformers += 1;
      return acc;
    },
    { active: 0, onLeave: 0, terminated: 0, fullTime: 0, highPerformers: 0 }
  );

  const columns: TableColumn<Employee>[] = [
    {
      key: 'employee_number',
      header: 'Emp #',
      render: (row) => row.employee_number || row.id,
    },
    {
      key: 'first_name',
      header: 'Employee',
      render: (row) => {
        const fullName = row.full_name || `${row.first_name} ${row.last_name}`.trim();
        return (
          <div className="space-y-0.5">
            <div className="font-medium text-slate-900">{fullName}</div>
            {row.email && (
              <div className="text-[10px] text-slate-500">{row.email}</div>
            )}
          </div>
        );
      },
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="text-slate-900">{row.role}</div>
          {row.erp_role && (
            <div className="text-[10px] text-slate-500">{row.erp_role.replace('_', ' ')}</div>
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
            {row.department.replace('_', ' ')}
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
        const color = typeColors[row.employment_type] || 'bg-slate-50 text-slate-700';
        return (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${color} border`}>
            {row.employment_type.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const statusTone =
          row.status === 'ACTIVE'
            ? 'success'
            : row.status === 'ON_LEAVE'
            ? 'warning'
            : row.status === 'TERMINATED' || row.status === 'RESIGNED'
            ? 'danger'
            : 'neutral';
        return <Badge tone={statusTone}>{row.status.replace('_', ' ')}</Badge>;
      },
    },
    {
      key: 'join_date',
      header: 'Join Date',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="text-slate-900">{row.join_date}</div>
          {row.years_of_experience && (
            <div className="text-[10px] text-slate-500">{row.years_of_experience} yrs exp</div>
          )}
        </div>
      ),
    },
    {
      key: 'performance_rating',
      header: 'Performance',
      render: (row) => {
        if (!row.performance_rating) return <span className="text-[11px] text-slate-400">-</span>;
        const ratingColor =
          row.performance_rating >= 4.5
            ? 'text-emerald-700 bg-emerald-50'
            : row.performance_rating >= 3.5
            ? 'text-blue-700 bg-blue-50'
            : row.performance_rating >= 2.5
            ? 'text-amber-700 bg-amber-50'
            : 'text-red-700 bg-red-50';
        return (
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${ratingColor} border`}>
            {row.performance_rating.toFixed(1)} ⭐
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
              setEditingEmployee(row);
              setModalOpen(true);
            }}
            className="text-[11px] text-primary hover:text-primary-dark"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => remove(row.id)}
            className="text-[11px] text-red-500 hover:text-red-600"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const handleFormSubmit = async (data: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingEmployee) {
      await update(editingEmployee.id, data);
    } else {
      await create(data);
    }
    setModalOpen(false);
    setEditingEmployee(null);
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
          value={metrics.total.toString()}
          helper="All employees in system."
          trend="up"
          variant="teal"
        />
        <StatCard
          label="Active"
          value={metrics.active.toString()}
          helper="Currently active."
          trend="up"
          variant="blue"
        />
        <StatCard
          label="On Leave"
          value={metrics.onLeave.toString()}
          helper="On approved leave."
          trend={metrics.onLeave > 0 ? 'down' : 'flat'}
          variant="yellow"
        />
        <StatCard
          label="Full Time"
          value={metricsByStatus.fullTime.toString()}
          helper="Full-time employees."
          trend="flat"
          variant="purple"
        />
        <StatCard
          label="High Performers"
          value={metricsByStatus.highPerformers.toString()}
          helper="Rating 4.5+."
          trend="up"
          variant="yellow"
        />
      </div>

      {/* Tabs */}
      <Card className="space-y-4">
        <Tabs
          items={[
            { id: 'all', label: 'All Employees' },
            { id: 'active', label: 'Active' },
            { id: 'on_leave', label: 'On Leave' },
            { id: 'inactive', label: 'Inactive' },
          ]}
          activeId={activeTab}
          onChange={(id) => {
            setActiveTab(id as 'all' | 'active' | 'on_leave' | 'inactive');
            setCurrentPage(1);
          }}
        />

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
              <option key={status} value={status}>
                {status.replace('_', ' ')}
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
                {type.replace('_', ' ')}
              </option>
            ))}
          </Select>
        </div>

        {/* Table */}
        {loading ? (
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
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <Select
                  value={itemsPerPage.toString()}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-32"
                >
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                </Select>
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onChange={setCurrentPage}
                />
              </div>
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
