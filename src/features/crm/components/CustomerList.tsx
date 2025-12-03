import { useState, useEffect } from 'react';
import { useCrm } from '../hooks/useCrm';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Table, type TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { StatCard } from '../../../components/ui/StatCard';
import { Tabs } from '../../../components/ui/Tabs';
import { Badge } from '../../../components/ui/Badge';
import { Pagination } from '../../../components/ui/Pagination';
import type { Customer, ErpUser } from '../types';
import { CustomerForm } from './CustomerForm';
import { UserRegistrationForm } from './UserRegistrationForm';
import { toast } from '../../../lib/toast';
import * as crmApi from '../api/crmApi';

export function CustomerList() {
  const { customers, loading: customersLoading, create: createCustomer, remove: removeCustomer, metrics } = useCrm();
  
  // Users state
  const [users, setUsers] = useState<ErpUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'users' | 'customers'>('users');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingUser, setEditingUser] = useState<ErpUser | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Load users
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await crmApi.listErpUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    return (
      searchTerm === '' ||
      user.employee_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobile.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Filter customers
  const filteredCustomers = customers.filter((customer) => {
    return (
      searchTerm === '' ||
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Pagination for users
  const usersTotalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const usersStartIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(usersStartIndex, usersStartIndex + itemsPerPage);

  // Pagination for customers
  const customersTotalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const customersStartIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(customersStartIndex, customersStartIndex + itemsPerPage);

  // User columns
  const userColumns: TableColumn<ErpUser>[] = [
    {
      key: 'employee_number',
      header: 'Employee #',
      render: (row) => (
        <div className="font-medium text-slate-900">{row.employee_number || '—'}</div>
      )
    },
    {
      key: 'full_name',
      header: 'Name',
      render: (row) => (
        <div>
          <div className="text-xs font-medium text-slate-900">{row.full_name}</div>
          <div className="text-[10px] text-slate-500">{row.username}</div>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Contact',
      render: (row) => (
        <div>
          <div className="text-xs text-slate-900">{row.email}</div>
          <div className="text-[10px] text-slate-500">{row.mobile}</div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) => (
        <Badge tone="brand">
          {row.role.replace(/_/g, ' ')}
        </Badge>
      )
    },
    {
      key: 'department',
      header: 'Department',
      render: (row) => (
        <div className="text-xs text-slate-600">{row.department || '—'}</div>
      )
    },
    {
      key: 'employment_status',
      header: 'Status',
      render: (row) => (
        <Badge
          tone={
            row.employment_status === 'ACTIVE'
              ? 'success'
              : row.employment_status === 'ON_LEAVE'
              ? 'warning'
              : 'neutral'
          }
        >
          {row.employment_status || 'ACTIVE'}
        </Badge>
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
              setEditingUser(row);
              setModalOpen(true);
            }}
            className="text-[11px] text-primary hover:text-primary-light font-medium"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={async () => {
              if (window.confirm('Are you sure you want to delete this user?')) {
                try {
                  await crmApi.deleteErpUser(row.id);
                  await loadUsers();
                  toast.success('User deleted successfully!');
                } catch (error) {
                  toast.error('Failed to delete user');
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

  // Customer columns
  const customerColumns: TableColumn<Customer>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (row) => (
        <div className="font-medium text-slate-900">{row.name}</div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      render: (row) => (
        <div className="text-xs text-slate-900">{row.email}</div>
      )
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (row) => (
        <div className="text-xs text-slate-600">{row.phone}</div>
      )
    },
    {
      key: 'segment',
      header: 'Segment',
      render: (row) => (
        <Badge tone="brand">{row.segment}</Badge>
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
              setEditingCustomer(row);
              setModalOpen(true);
            }}
            className="text-[11px] text-primary hover:text-primary-light font-medium"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={async () => {
              if (window.confirm('Are you sure you want to delete this customer?')) {
                try {
                  await removeCustomer(row.id);
                  toast.success('Customer deleted successfully!');
                } catch (error) {
                  toast.error('Failed to delete customer');
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

  const handleCreateUser = async (data: Omit<ErpUser, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await crmApi.createErpUser(data);
      setModalOpen(false);
      setEditingUser(null);
      await loadUsers();
      toast.success('User registered successfully!');
    } catch (error) {
      toast.error('Failed to register user');
    }
  };

  const handleUpdateUser = async (data: Omit<ErpUser, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingUser) {
      try {
        await crmApi.updateErpUser(editingUser.id, data);
        setModalOpen(false);
        setEditingUser(null);
        await loadUsers();
        toast.success('User updated successfully!');
      } catch (error) {
        toast.error('Failed to update user');
      }
    }
  };

  const handleCreateCustomer = async (data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createCustomer(data);
      setModalOpen(false);
      setEditingCustomer(null);
      toast.success('Customer created successfully!');
    } catch (error) {
      toast.error('Failed to create customer');
    }
  };

  const handleUpdateCustomer = async (data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingCustomer) {
      try {
        await crmApi.updateCustomer(editingCustomer.id, data);
        setModalOpen(false);
        setEditingCustomer(null);
        toast.success('Customer updated successfully!');
        window.location.reload();
      } catch (error) {
        toast.error('Failed to update customer');
      }
    }
  };

  const loading = activeTab === 'users' ? usersLoading : customersLoading;

  if (loading) {
    return <LoadingState label={`Loading ${activeTab}...`} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            {activeTab === 'users' ? 'User Management' : 'Customer Management'}
          </h1>
          <p className="text-xs text-slate-600 max-w-2xl mt-1">
            {activeTab === 'users' 
              ? 'Register and manage ERP system users with role-based access'
              : 'Manage customer relationships and track customer information'
            }
          </p>
        </div>
        {(activeTab === 'users' || activeTab === 'customers') && (
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setEditingCustomer(null);
              setEditingUser(null);
              setModalOpen(true);
            }}
          >
            {activeTab === 'users' ? '+ Register User' : '+ New Customer'}
          </Button>
        )}
      </div>

      {/* Dynamic KPI Cards based on active tab */}
      {activeTab === 'users' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Users"
            value={users.length.toString()}
          />
          <StatCard
            label="Active Users"
            value={users.filter((u) => u.is_active !== false && u.employment_status === 'ACTIVE').length.toString()}
          />
          <StatCard
            label="Admins"
            value={users.filter((u) => u.role === 'ADMIN').length.toString()}
          />
          <StatCard
            label="Managers"
            value={users.filter((u) => u.role.includes('MANAGER')).length.toString()}
          />
        </div>
      ) : activeTab === 'customers' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Customers"
            value={customers.length.toString()}
          />
          <StatCard
            label="Enterprise"
            value={customers.filter((c) => c.segment.toLowerCase().includes('enterprise')).length.toString()}
          />
          <StatCard
            label="Mid-Market"
            value={customers.filter((c) => c.segment.toLowerCase().includes('mid')).length.toString()}
          />
          <StatCard
            label="Top Segment"
            value={metrics.total === 0 ? '—' : Object.entries(metrics.bySegment).sort((a, b) => b[1] - a[1])[0][0]}
          />
        </div>
      ) : null}

      {/* Tabs */}
      <Tabs
        items={[
          { id: 'users', label: `ERP Users (${users.length})` },
          { id: 'customers', label: `Customers (${customers.length})` }
        ]}
        activeId={activeTab}
        onChange={(id) => {
          setActiveTab(id as any);
          setCurrentPage(1);
          setSearchTerm('');
        }}
      />

      {/* Search Filter */}
      <Card>
        <div className="p-4 border-b border-slate-200">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Search
              </label>
              <Input
                placeholder={activeTab === 'users' ? 'Search by name, email, employee #, username...' : 'Search by name, email, phone...'}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>

        {/* Users Tab Content */}
        {activeTab === 'users' && (
          <>
            {paginatedUsers.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No users found"
                  description="Register your first ERP user or adjust your search"
                />
                <div className="mt-4 text-center">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      setEditingUser(null);
                      setModalOpen(true);
                    }}
                  >
                    + Register User
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Table
                  data={paginatedUsers}
                  columns={userColumns}
                  getRowKey={(row, index) => `${row.id}-${index}`}
                />

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
                        totalPages={usersTotalPages}
                        onChange={setCurrentPage}
                      />
                    </div>

                    {/* Right: Showing info */}
                    <div className="text-xs text-slate-600 whitespace-nowrap">
                      Showing <span className="font-medium text-slate-900">{usersStartIndex + 1}</span> to <span className="font-medium text-slate-900">{Math.min(usersStartIndex + itemsPerPage, filteredUsers.length)}</span> of <span className="font-medium text-slate-900">{filteredUsers.length}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Customers Tab Content */}
        {activeTab === 'customers' && (
          <>
            {paginatedCustomers.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No customers found"
                  description="Create your first customer or adjust your search"
                />
                <div className="mt-4 text-center">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      setEditingCustomer(null);
                      setModalOpen(true);
                    }}
                  >
                    + New Customer
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Table
                  data={paginatedCustomers}
                  columns={customerColumns}
                  getRowKey={(row, index) => `${row.id}-${index}`}
                />

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
                        totalPages={customersTotalPages}
                        onChange={setCurrentPage}
                      />
                    </div>

                    {/* Right: Showing info */}
                    <div className="text-xs text-slate-600 whitespace-nowrap">
                      Showing <span className="font-medium text-slate-900">{customersStartIndex + 1}</span> to <span className="font-medium text-slate-900">{Math.min(customersStartIndex + itemsPerPage, filteredCustomers.length)}</span> of <span className="font-medium text-slate-900">{filteredCustomers.length}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </Card>

      {/* Modal for Users */}
      {activeTab === 'users' && (
        <Modal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingUser(null);
          }}
          title={editingUser ? 'Edit User' : 'Register New User'}
          hideCloseButton
        >
          <UserRegistrationForm
            initial={editingUser || undefined}
            onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
            onCancel={() => {
              setModalOpen(false);
              setEditingUser(null);
            }}
          />
        </Modal>
      )}

      {/* Modal for Customers */}
      {activeTab === 'customers' && (
        <Modal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingCustomer(null);
          }}
          title={editingCustomer ? 'Edit Customer' : 'New Customer'}
        >
          <CustomerForm
            initial={editingCustomer || undefined}
            onSubmit={editingCustomer ? handleUpdateCustomer : handleCreateCustomer}
            onCancel={() => {
              setModalOpen(false);
              setEditingCustomer(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
