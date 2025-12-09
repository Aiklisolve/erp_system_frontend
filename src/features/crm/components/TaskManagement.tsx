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
import { SearchableSelect } from '../../../components/ui/SearchableSelect';
import type { Task, TaskType, TaskStatus, TaskPriority, ErpUser } from '../types';
import type { Employee } from '../../hr/types';
import { toast } from '../../../lib/toast';
import * as crmApi from '../api/crmApi';
import * as hrApi from '../../hr/api/hrApi';

type TaskFormProps = {
  initial?: Partial<Task>;
  employees: ErpUser[];
  onSubmit: (values: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
};

// Generate task number
function generateTaskNumber(): string {
  const prefix = 'TSK';
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}-${random}`;
}

function TaskFormComponent({ initial, employees, onSubmit, onCancel }: TaskFormProps) {
  const [taskNumber, setTaskNumber] = useState(initial?.task_number ?? generateTaskNumber());
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [taskType, setTaskType] = useState<TaskType>(initial?.task_type ?? 'SUPPORT');
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority ?? 'MEDIUM');
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? 'NEW');
  const [assignedToId, setAssignedToId] = useState(initial?.assigned_to ?? '');
  const [startDate, setStartDate] = useState(initial?.start_date ?? '');
  const [dueDate, setDueDate] = useState(initial?.due_date ?? '');
  const [progressPercentage, setProgressPercentage] = useState(initial?.progress_percentage?.toString() ?? '');
  const [estimatedHours, setEstimatedHours] = useState(initial?.estimated_hours?.toString() ?? '');
  const [actualHours, setActualHours] = useState(initial?.actual_hours?.toString() ?? '');
  const [tags, setTags] = useState(initial?.tags?.join(', ') ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  // Employee dropdown state
  const [employeeList, setEmployeeList] = useState<Employee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  // Get logged-in user ID from localStorage
  const getLoggedInUserId = (): string | null => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        // Try different possible ID fields
        return user.id?.toString() || user.user_id?.toString() || user.employee_id?.toString() || null;
      }
      
      // Try session data
      const sessionData = localStorage.getItem('session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        if (session.user) {
          return session.user.id?.toString() || session.user.user_id?.toString() || session.user.employee_id?.toString() || null;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting logged-in user ID:', error);
      return null;
    }
  };

  // Fetch employees on mount
  useEffect(() => {
    const loadEmployees = async () => {
      setEmployeesLoading(true);
      try {
        const employees = await hrApi.listEmployees();
        setEmployeeList(employees);
      } catch (error) {
        console.error('Failed to load employees:', error);
      } finally {
        setEmployeesLoading(false);
      }
    };
    loadEmployees();
  }, []);

  // Prepare employee options for SearchableSelect
  const employeeOptions = employeeList.map((emp) => {
    const displayName = emp.full_name || `${emp.first_name} ${emp.last_name}`.trim() || 'Unknown Employee';
    const displayInfo = [
      emp.employee_number,
      emp.email,
      emp.department ? String(emp.department).replace(/_/g, ' ') : null,
      emp.role
    ].filter(Boolean).join(' • ');
    
    return {
      value: emp.id,
      label: displayInfo ? `${displayName} - ${displayInfo}` : displayName,
      id: emp.id,
    };
  });

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Task title is required';
    if (!assignedToId) newErrors.assignedToId = 'Please assign to an employee';
    if (dueDate && startDate && new Date(dueDate) < new Date(startDate)) {
      newErrors.dueDate = 'Due date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    const selectedEmployee = employeeList.find(emp => emp.id === assignedToId);
    const loggedInUserId = getLoggedInUserId();
    
    const payload: Omit<Task, 'id' | 'created_at' | 'updated_at'> = {
      task_number: taskNumber,
      title,
      description: description || undefined,
      task_type: taskType,
      priority,
      status,
      assigned_to: assignedToId,
      assigned_to_name: selectedEmployee?.full_name || `${selectedEmployee?.first_name} ${selectedEmployee?.last_name}`.trim() || '',
      assigned_to_email: selectedEmployee?.email,
      assigned_to_role: selectedEmployee?.erp_role || selectedEmployee?.role,
      assigned_by: loggedInUserId || initial?.assigned_by || undefined,
      assigned_date: initial?.assigned_date || new Date().toISOString().split('T')[0],
      start_date: startDate || undefined,
      due_date: dueDate || undefined,
      progress_percentage: progressPercentage ? parseFloat(progressPercentage) : undefined,
      estimated_hours: estimatedHours ? parseFloat(estimatedHours) : undefined,
      actual_hours: actualHours ? parseFloat(actualHours) : undefined,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      notes: notes || undefined
    };
    
    // Add approved_by_id (same as assigned_by for now, can be changed later)
    (payload as any).approved_by_id = loggedInUserId || initial?.assigned_by || undefined;
    
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Task Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Task Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Task Number <span className="text-red-500">*</span>
            </label>
            <Input
              value={taskNumber}
              onChange={(e) => setTaskNumber(e.target.value)}
              placeholder="TSK-2025-0001"
              required
            />
          </div>
          <div>
            {employeesLoading ? (
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Assign To <span className="text-red-500">*</span>
                </label>
                <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  Loading employees...
                </div>
              </div>
            ) : employeeList.length === 0 ? (
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Assign To <span className="text-red-500">*</span>
                </label>
                <div className="w-full rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-600">
                  No employees available. Please add employees first.
                </div>
              </div>
            ) : (
              <SearchableSelect
                label="Assign To"
                value={assignedToId}
                onChange={(value) => setAssignedToId(value)}
                options={employeeOptions}
                placeholder="Search and select employee..."
                required
                maxHeight="200px"
              />
            )}
            {errors.assignedToId && <p className="text-xs text-red-600 mt-1">{errors.assignedToId}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
            />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the task"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Task Classification */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Classification
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Task Type <span className="text-red-500">*</span>
            </label>
            <Select value={taskType} onChange={(e) => setTaskType(e.target.value as TaskType)} required>
              <option value="BUG">Bug Fix</option>
              <option value="FEATURE">Feature</option>
              <option value="SUPPORT">Support</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="DOCUMENTATION">Documentation</option>
              <option value="RESEARCH">Research</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Priority <span className="text-red-500">*</span>
            </label>
            <Select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} required>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Status <span className="text-red-500">*</span>
            </label>
            <Select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} required>
              <option value="NEW">New</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Dates & Progress */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Dates & Progress
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Due Date
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            {errors.dueDate && <p className="text-xs text-red-600 mt-1">{errors.dueDate}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Progress % (0-100)
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              value={progressPercentage}
              onChange={(e) => setProgressPercentage(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Estimated Hours
            </label>
            <Input
              type="number"
              step="0.5"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              placeholder="8"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Actual Hours
            </label>
            <Input
              type="number"
              step="0.5"
              value={actualHours}
              onChange={(e) => setActualHours(e.target.value)}
              placeholder="0"
            />
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
              Tags (comma-separated)
            </label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="bug, urgent, inventory"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about this task"
              rows={3}
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
          {initial ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}

export function TaskManagement({ employees }: { employees: ErpUser[] }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await crmApi.listTasks();
      console.log('Loaded tasks:', data);
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      searchTerm === '' ||
      task.task_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assigned_to_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTasks = filteredTasks.slice(startIndex, startIndex + itemsPerPage);

  // Calculate metrics
  const totalTasks = tasks.length;
  const newTasks = tasks.filter((t) => t.status === 'NEW').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;

  const columns: TableColumn<Task>[] = [
    {
      key: 'task_number',
      header: 'Task #',
      render: (row) => (
        <div className="font-medium text-slate-900">{row.task_number}</div>
      )
    },
    {
      key: 'title',
      header: 'Title',
      render: (row) => (
        <div>
          <div className="text-xs font-medium text-slate-900">{row.title}</div>
          {row.description && (
            <div className="text-[10px] text-slate-500 truncate max-w-xs" title={row.description}>
              {row.description}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'assigned_to_name',
      header: 'Assigned To',
      render: (row) => (
        <div>
          <div className="text-xs font-medium text-slate-900">{row.assigned_to_name}</div>
          <div className="text-[10px] text-slate-500">{row.assigned_to_role?.replace(/_/g, ' ')}</div>
        </div>
      )
    },
    {
      key: 'task_type',
      header: 'Type',
      render: (row) => (
        <Badge tone="brand">
          {row.task_type.replace(/_/g, ' ')}
        </Badge>
      )
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (row) => (
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${
            row.priority === 'URGENT' ? 'bg-red-500' :
            row.priority === 'HIGH' ? 'bg-orange-500' :
            row.priority === 'MEDIUM' ? 'bg-yellow-500' :
            'bg-green-500'
          }`} />
          <span className="text-xs text-slate-600">{row.priority}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          tone={
            row.status === 'COMPLETED'
              ? 'success'
              : row.status === 'IN_PROGRESS'
              ? 'brand'
              : row.status === 'NEW'
              ? 'warning'
              : 'neutral'
          }
        >
          {row.status.replace(/_/g, ' ')}
        </Badge>
      )
    },
    {
      key: 'due_date',
      header: 'Due Date',
      render: (row) => (
        <div className="text-xs text-slate-600">
          {row.due_date ? new Date(row.due_date).toLocaleDateString() : '—'}
        </div>
      )
    },
    {
      key: 'progress',
      header: 'Progress',
      render: (row) => (
        <div className="text-xs text-slate-600">
          {row.progress_percentage !== undefined ? `${row.progress_percentage}%` : '—'}
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
              setEditingTask(row);
              setModalOpen(true);
            }}
            className="text-[11px] text-primary hover:text-primary-light font-medium"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={async () => {
              if (window.confirm('Are you sure you want to delete this task?')) {
                try {
                  await crmApi.deleteTask(row.id);
                  await loadTasks();
                  toast.success('Task deleted successfully!');
                } catch (error) {
                  toast.error('Failed to delete task');
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

  const handleCreate = async (data: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await crmApi.createTask(data);
      setModalOpen(false);
      setEditingTask(null);
      await loadTasks();
      toast.success('Task created successfully!');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleUpdate = async (data: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingTask) {
      try {
        // Get logged-in user ID for update
        const getLoggedInUserId = (): string | null => {
          try {
            const userData = localStorage.getItem('user');
            if (userData) {
              const user = JSON.parse(userData);
              return user.id?.toString() || user.user_id?.toString() || user.employee_id?.toString() || null;
            }
            const sessionData = localStorage.getItem('session');
            if (sessionData) {
              const session = JSON.parse(sessionData);
              if (session.user) {
                return session.user.id?.toString() || session.user.user_id?.toString() || session.user.employee_id?.toString() || null;
              }
            }
            return null;
          } catch (error) {
            console.error('Error getting logged-in user ID:', error);
            return null;
          }
        };
        
        const loggedInUserId = getLoggedInUserId();
        const updateData = {
          ...data,
          assigned_by: loggedInUserId || data.assigned_by,
        };
        
        // Add approved_by_id (same as assigned_by for now)
        (updateData as any).approved_by_id = loggedInUserId || (data as any).approved_by_id;
        
        await crmApi.updateTask(editingTask.id, updateData);
        setModalOpen(false);
        setEditingTask(null);
        await loadTasks();
        toast.success('Task updated successfully!');
      } catch (error) {
        toast.error('Failed to update task');
      }
    }
  };

  if (loading) {
    return <LoadingState label="Loading tasks..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Task Management</h2>
          <p className="text-xs text-slate-600 mt-1">
            Create and assign tasks to employees, track progress and deadlines
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setEditingTask(null);
            setModalOpen(true);
          }}
        >
          + Create Task
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Tasks"
          value={totalTasks.toString()}
        />
        <StatCard
          label="New"
          value={newTasks.toString()}
        />
        <StatCard
          label="In Progress"
          value={inProgressTasks.toString()}
        />
        <StatCard
          label="Completed"
          value={completedTasks.toString()}
        />
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4 border-b border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Search
              </label>
              <Input
                placeholder="Search by task #, title, employee..."
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
                <option value="NEW">New</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="CANCELLED">Cancelled</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Priority
              </label>
              <Select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Table */}
        {paginatedTasks.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No tasks found"
              description="Create your first task or adjust your filters"
            />
            <div className="mt-4 text-center">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setEditingTask(null);
                  setModalOpen(true);
                }}
              >
                + Create Task
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Table
              data={paginatedTasks}
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
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTasks.length)} of {filteredTasks.length} tasks
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
          setEditingTask(null);
        }}
        title={editingTask ? 'Edit Task' : 'Create Task'}
      >
        <TaskFormComponent
          initial={editingTask || undefined}
          employees={employees}
          onSubmit={editingTask ? handleUpdate : handleCreate}
          onCancel={() => {
            setModalOpen(false);
            setEditingTask(null);
          }}
        />
      </Modal>
    </div>
  );
}

