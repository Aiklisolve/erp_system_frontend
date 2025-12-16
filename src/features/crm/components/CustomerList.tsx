import { useState, useEffect } from 'react';
import { useCrm } from '../hooks/useCrm';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Table, type TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
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
  const { customers, loading: customersLoading, create: createCustomer, remove: removeCustomer, refresh: refreshCustomers, metrics } = useCrm();
  
  // Users state
  const [users, setUsers] = useState<ErpUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'users' | 'customers'>('users');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingUser, setEditingUser] = useState<ErpUser | null>(null);
  
  // Delete confirmation states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [userToDelete, setUserToDelete] = useState<ErpUser | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [usersCurrentPage, setUsersCurrentPage] = useState(1);
  const [customersCurrentPage, setCustomersCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState<'ascending' | 'descending'>('ascending');

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
    if (!searchTerm || searchTerm === '') return true;
    
    const searchLower = (searchTerm || '').toLowerCase();
    return (
      (user.employee_number?.toLowerCase() || '').includes(searchLower) ||
      (user.username?.toLowerCase() || '').includes(searchLower) ||
      (user.email?.toLowerCase() || '').includes(searchLower) ||
      (user.full_name?.toLowerCase() || '').includes(searchLower) ||
      (user.mobile?.toLowerCase() || '').includes(searchLower)
    );
  });

  // Filter customers
  const filteredCustomers = customers.filter((customer) => {
    if (!searchTerm || searchTerm === '') return true;
    
    const searchLower = (searchTerm || '').toLowerCase();
    return (
      (customer.name?.toLowerCase() || '').includes(searchLower) ||
      (customer.customer_number?.toLowerCase() || '').includes(searchLower) ||
      (customer.email?.toLowerCase() || '').includes(searchLower) ||
      (customer.phone?.toLowerCase() || '').includes(searchLower) ||
      (customer.segment?.toLowerCase() || '').includes(searchLower) ||
      (customer.company_name?.toLowerCase() || '').includes(searchLower) ||
      (customer.city?.toLowerCase() || '').includes(searchLower) ||
      (customer.contact_person?.toLowerCase() || '').includes(searchLower)
    );
  });

  // Sort users by created_at
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    
    return sortOrder === 'ascending' ? dateA - dateB : dateB - dateA;
  });

  // Sort customers by created_at
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    
    return sortOrder === 'ascending' ? dateA - dateB : dateB - dateA;
  });

  // Pagination for users
  const usersTotalPages = Math.max(1, Math.ceil(sortedUsers.length / itemsPerPage));
  const usersStartIndex = (usersCurrentPage - 1) * itemsPerPage;
  const usersEndIndex = usersStartIndex + itemsPerPage;
  const paginatedUsers = sortedUsers.slice(usersStartIndex, usersEndIndex);

  // Pagination for customers
  const customersTotalPages = Math.max(1, Math.ceil(sortedCustomers.length / itemsPerPage));
  const customersStartIndex = (customersCurrentPage - 1) * itemsPerPage;
  const customersEndIndex = customersStartIndex + itemsPerPage;
  const paginatedCustomers = sortedCustomers.slice(customersStartIndex, customersEndIndex);

  // Reset pagination when switching tabs
  useEffect(() => {
    setUsersCurrentPage(1);
    setCustomersCurrentPage(1);
  }, [activeTab]);

  // Reset pagination when search term changes
  useEffect(() => {
    setUsersCurrentPage(1);
    setCustomersCurrentPage(1);
  }, [searchTerm]);

  // Reset pagination when sort order changes
  useEffect(() => {
    setUsersCurrentPage(1);
    setCustomersCurrentPage(1);
  }, [sortOrder]);

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
              onClick={async () => {
                // Fetch full user data including employee data
                try {
                  const fullUserData = await crmApi.getErpUserWithEmployeeData(row.id);
                  if (fullUserData) {
                    setEditingUser(fullUserData);
                    setModalOpen(true);
                  } else {
                    // Fallback to row data if fetch fails
                    setEditingUser(row);
                    setModalOpen(true);
                  }
                } catch (error) {
                  console.error('Error fetching user data:', error);
                  // Fallback to row data
                  setEditingUser(row);
                  setModalOpen(true);
                }
              }}
              className="text-[11px] text-primary hover:text-primary-light font-medium"
            >
              Edit
            </button>
          <button
            type="button"
            onClick={() => {
              setUserToDelete(row);
              setDeleteConfirmOpen(true);
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
      key: 'customer_number',
      header: 'Customer #',
      render: (row) => (
        <div className="font-medium text-slate-900 text-xs">{row.customer_number || '—'}</div>
      )
    },
    {
      key: 'name',
      header: 'Name',
      render: (row) => (
        <div className="font-medium text-slate-900">{row.name || '—'}</div>
      )
    },
    {
      key: 'company_name',
      header: 'Company',
      render: (row) => (
        <div className="text-xs text-slate-700">{row.company_name || '—'}</div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      render: (row) => (
        <div className="text-xs text-slate-900">{row.email || '—'}</div>
      )
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (row) => (
        <div className="text-xs text-slate-600">{row.phone || '—'}</div>
      )
    },
    {
      key: 'city',
      header: 'City',
      render: (row) => (
        <div className="text-xs text-slate-600">{row.city || '—'}</div>
      )
    },
    {
      key: 'segment',
      header: 'Segment',
      render: (row) => (
        <Badge tone="brand">{row.segment || '—'}</Badge>
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
            onClick={() => {
              setCustomerToDelete(row);
              setDeleteConfirmOpen(true);
            }}
            className="text-[11px] text-red-600 hover:text-red-700 font-medium"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  const handleCreateUser = async (data: Omit<ErpUser, 'id' | 'created_at' | 'updated_at' | 'password_hash'>) => {
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

  const handleUpdateUser = async (data: Omit<ErpUser, 'id' | 'created_at' | 'updated_at' | 'password_hash'>) => {
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
        // Refresh the customer list
        await refreshCustomers();
        toast.success('Customer updated successfully!');
      } catch (error) {
        toast.error('Failed to update customer');
      }
    }
  };

  const loading = activeTab === 'users' ? usersLoading : customersLoading;

  if (loading) {
    return (
      <div className="py-12 sm:py-16">
        <LoadingState label={`Loading ${activeTab}...`} size="md" variant="default" />
      </div>
    );
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
          // Page reset is handled by useEffect
          setSearchTerm('');
        }}
      />

      {/* Search Filter */}
      <Card>
        <div className="p-4 border-b border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Search
              </label>
              <Input
                placeholder={activeTab === 'users' ? 'Search by name, email, employee #, username...' : 'Search by name, email, phone...'}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  // Page reset is handled by useEffect
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Sort By
              </label>
              <Select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value as 'ascending' | 'descending');
                  // Page reset is handled by useEffect
                }}
                className="w-full"
              >
                <option value="ascending">Ascending</option>
                <option value="descending">Descending</option>
              </Select>
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
                          const newItemsPerPage = Number(e.target.value);
                          setItemsPerPage(newItemsPerPage);
                          setUsersCurrentPage(1);
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
                        page={usersCurrentPage}
                        totalPages={usersTotalPages}
                        onChange={(page) => {
                          setUsersCurrentPage(Math.max(1, Math.min(page, usersTotalPages)));
                        }}
                      />
                    </div>

                    {/* Right: Showing info */}
                    <div className="text-xs text-slate-600 whitespace-nowrap">
                      Showing <span className="font-medium text-slate-900">
                        {sortedUsers.length === 0 ? 0 : usersStartIndex + 1}
                      </span> to <span className="font-medium text-slate-900">
                        {Math.min(usersEndIndex, sortedUsers.length)}
                      </span> of <span className="font-medium text-slate-900">{sortedUsers.length}</span>
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
                          const newItemsPerPage = Number(e.target.value);
                          setItemsPerPage(newItemsPerPage);
                          setCustomersCurrentPage(1);
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
                        page={customersCurrentPage}
                        totalPages={customersTotalPages}
                        onChange={(page) => {
                          setCustomersCurrentPage(Math.max(1, Math.min(page, customersTotalPages)));
                        }}
                      />
                    </div>

                    {/* Right: Showing info */}
                    <div className="text-xs text-slate-600 whitespace-nowrap">
                      Showing <span className="font-medium text-slate-900">
                        {sortedCustomers.length === 0 ? 0 : customersStartIndex + 1}
                      </span> to <span className="font-medium text-slate-900">
                        {Math.min(customersEndIndex, sortedCustomers.length)}
                      </span> of <span className="font-medium text-slate-900">{sortedCustomers.length}</span>
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title={customerToDelete ? 'Delete Customer' : 'Delete User'}
        message={
          customerToDelete
            ? `Are you sure you want to delete "${customerToDelete.name}"? This action cannot be undone.`
            : userToDelete
            ? `Are you sure you want to delete "${userToDelete.full_name || userToDelete.username}"? This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={async () => {
          try {
            if (customerToDelete) {
              await removeCustomer(customerToDelete.id);
              await refreshCustomers();
              toast.success('Customer deleted successfully!');
            } else if (userToDelete) {
              await crmApi.deleteErpUser(userToDelete.id);
              await loadUsers();
              toast.success('User deleted successfully!');
            }
          } catch (error) {
            toast.error(`Failed to delete ${customerToDelete ? 'customer' : 'user'}`);
          } finally {
            setCustomerToDelete(null);
            setUserToDelete(null);
          }
        }}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setCustomerToDelete(null);
          setUserToDelete(null);
        }}
      />
    </div>
  );
}
