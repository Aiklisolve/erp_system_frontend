import { useState } from 'react';
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
import type { Account, AccountType, Currency } from '../types';
import * as accountsApi from '../api/financeApi';
import { FormEvent, useEffect } from 'react';
import { SimpleAccountForm } from './SimpleAccountForm';
import { toast } from '../../../lib/toast';

type AccountFormProps = {
  initial?: Partial<Account>;
  onSubmit: (data: Omit<Account, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
};

function AccountForm({ initial, onSubmit, onCancel }: AccountFormProps) {
  const [accountNumber, setAccountNumber] = useState(initial?.account_number ?? '');
  const [accountName, setAccountName] = useState(initial?.account_name ?? '');
  const [accountType, setAccountType] = useState<AccountType>(initial?.account_type ?? 'BANK');
  const [parentAccount, setParentAccount] = useState(initial?.parent_account ?? '');
  const [currency, setCurrency] = useState<Currency>(initial?.currency ?? 'USD');
  const [openingBalance, setOpeningBalance] = useState(initial?.opening_balance?.toString() ?? '0');
  const [currentBalance, setCurrentBalance] = useState(initial?.current_balance?.toString() ?? '0');
  const [availableBalance, setAvailableBalance] = useState(initial?.available_balance?.toString() ?? '');
  const [bankName, setBankName] = useState(initial?.bank_name ?? '');
  const [branchName, setBranchName] = useState(initial?.branch_name ?? '');
  const [ifscCode, setIfscCode] = useState(initial?.ifsc_code ?? '');
  const [swiftCode, setSwiftCode] = useState(initial?.swift_code ?? '');
  const [accountHolderName, setAccountHolderName] = useState(initial?.account_holder_name ?? '');
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [isDefault, setIsDefault] = useState(initial?.is_default ?? false);
  const [description, setDescription] = useState(initial?.description ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const payload: Omit<Account, 'id' | 'created_at' | 'updated_at'> = {
      account_number: accountNumber,
      account_name: accountName,
      account_type: accountType,
      parent_account: parentAccount || undefined,
      currency,
      opening_balance: parseFloat(openingBalance),
      current_balance: parseFloat(currentBalance),
      available_balance: availableBalance ? parseFloat(availableBalance) : undefined,
      bank_name: bankName || undefined,
      branch_name: branchName || undefined,
      ifsc_code: ifscCode || undefined,
      swift_code: swiftCode || undefined,
      account_holder_name: accountHolderName || undefined,
      is_active: isActive,
      is_default: isDefault,
      description: description || undefined,
      notes: notes || undefined
    };
    
    onSubmit(payload);
  };

    return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Account Number <span className="text-red-500">*</span>
            </label>
            <Input
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="ACC-1001"
              required
            />
      </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Account Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Bank Account - Main"
              required
            />
        </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Account Type <span className="text-red-500">*</span>
            </label>
            <Select value={accountType} onChange={(e) => setAccountType(e.target.value as AccountType)} required>
              <option value="BANK">Bank</option>
              <option value="CASH">Cash</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="ASSET">Asset</option>
              <option value="LIABILITY">Liability</option>
              <option value="EQUITY">Equity</option>
              <option value="REVENUE">Revenue</option>
              <option value="EXPENSE">Expense</option>
            </Select>
      </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Parent Account
            </label>
            <Input
              value={parentAccount}
              onChange={(e) => setParentAccount(e.target.value)}
              placeholder="Parent account name"
            />
                            </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Currency <span className="text-red-500">*</span>
            </label>
            <Select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} required>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="INR">INR - Indian Rupee</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="CNY">CNY - Chinese Yuan</option>
              <option value="AUD">AUD - Australian Dollar</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </Select>
                            </div>
        </div>
      </div>

      {/* Balance Information */}
              <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Balance Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Opening Balance <span className="text-red-500">*</span>
            </label>
                <Input
              type="number"
              step="0.01"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
              placeholder="0.00"
              required
                />
              </div>
              <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Current Balance <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              value={currentBalance}
              onChange={(e) => setCurrentBalance(e.target.value)}
              placeholder="0.00"
              required
                />
              </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Available Balance
            </label>
            <Input
              type="number"
              step="0.01"
              value={availableBalance}
              onChange={(e) => setAvailableBalance(e.target.value)}
              placeholder="0.00"
            />
              </div>
              </div>
            </div>

      {/* Bank Details */}
      {(accountType === 'BANK' || accountType === 'CREDIT_CARD') && (
              <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
            Bank Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Bank Name
              </label>
              <Input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="First National Bank"
              />
              </div>
              <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Branch Name
              </label>
                <Input
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="Downtown Branch"
              />
              </div>
              <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                IFSC Code
              </label>
                <Input
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                placeholder="FNBK0001234"
                />
              </div>
              <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                SWIFT Code
              </label>
              <Input
                value={swiftCode}
                onChange={(e) => setSwiftCode(e.target.value)}
                placeholder="FNBKUS33XXX"
              />
              </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Account Holder Name
              </label>
              <Input
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="OrbitERP Manufacturing Inc"
              />
              </div>
            </div>
        </div>
      )}

      {/* Status & Settings */}
                <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Status & Settings
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
            />
            <label htmlFor="isActive" className="text-xs font-medium text-slate-700">
              Active Account
            </label>
              </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
            />
            <label htmlFor="isDefault" className="text-xs font-medium text-slate-700">
              Set as Default Account
            </label>
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
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the account"
              rows={2}
                />
              </div>
              <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes"
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
          {initial ? 'Update Account' : 'Create Account'}
                </Button>
              </div>
    </form>
  );
}

export function AccountManagement() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await accountsApi.listAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply search and filters
  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      searchTerm === '' ||
      account.account_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.bank_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || account.account_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? account.is_active : !account.is_active);

    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAccounts = filteredAccounts.slice(startIndex, startIndex + itemsPerPage);

  // Calculate metrics
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.current_balance, 0);
  const activeAccounts = accounts.filter((acc) => acc.is_active).length;
  const bankAccounts = accounts.filter((acc) => acc.account_type === 'BANK').length;
  const cashAccounts = accounts.filter((acc) => acc.account_type === 'CASH').length;

  const columns: TableColumn<Account>[] = [
    {
      key: 'account_number',
      header: 'Account #',
      render: (row) => (
        <div className="font-medium text-slate-900">
          {row.account_number}
          {row.is_default && (
            <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Default</span>
          )}
            </div>
      )
    },
    {
      key: 'account_name',
      header: 'Account Name',
      render: (row) => (
        <div>
          <div className="text-xs font-medium text-slate-900">{row.account_name}</div>
          {row.bank_name && (
            <div className="text-[10px] text-slate-500">{row.bank_name}</div>
          )}
        </div>
      )
    },
    {
      key: 'account_type',
      header: 'Type',
      render: (row) => (
        <Badge
          tone={
            row.account_type === 'BANK' || row.account_type === 'CASH'
              ? 'success'
              : 'neutral'
          }
        >
          {row.account_type}
        </Badge>
      )
    },
    {
      key: 'current_balance',
      header: 'Current Balance',
      render: (row) => (
        <div className="text-right">
          <div className={`text-xs font-semibold ${
            row.current_balance >= 0 ? 'text-emerald-600' : 'text-red-600'
          }`}>
            {row.currency} {row.current_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          {row.available_balance !== undefined && (
            <div className="text-[10px] text-slate-500">
              Available: {row.currency} {row.available_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (row) => (
        <Badge tone={row.is_active ? 'success' : 'neutral'}>
          {row.is_active ? 'Active' : 'Inactive'}
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
              setEditingAccount(row);
              setModalOpen(true);
            }}
            className="text-[11px] text-primary hover:text-primary-light font-medium"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row)}
            className="text-[11px] text-red-600 hover:text-red-700 font-medium"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  const handleCreate = async (data: Omit<Account, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await accountsApi.createAccount(data);
      toast.success('Account created successfully!');
      setModalOpen(false);
      setEditingAccount(null);
      loadAccounts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    }
  };

  const handleUpdate = async (data: Omit<Account, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingAccount) {
      try {
        await accountsApi.updateAccount(editingAccount.id, data);
        toast.success('Account updated successfully!');
        setModalOpen(false);
        setEditingAccount(null);
        loadAccounts();
      } catch (error: any) {
        toast.error(error.message || 'Failed to update account');
      }
    }
  };

  const handleDelete = async (account: Account) => {
    if (window.confirm(`Are you sure you want to delete account "${account.account_name}"?`)) {
      try {
        await accountsApi.deleteAccount(account.id);
        toast.success('Account deleted successfully!');
        loadAccounts();
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete account');
      }
    }
  };

  if (loading) {
    return (
      <div className="py-12 sm:py-16">
        <LoadingState label="Loading accounts..." size="md" variant="default" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Account Management</h1>
          <p className="text-xs text-slate-600 max-w-2xl mt-1">
            Manage bank accounts, cash accounts, and other financial accounts
          </p>
              </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setEditingAccount(null);
            setModalOpen(true);
          }}
        >
          + New Account
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Balance"
          value={`₹${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
        <StatCard
          label="Active Accounts"
          value={activeAccounts.toString()}
        />
        <StatCard
          label="Bank Accounts"
          value={bankAccounts.toString()}
        />
        <StatCard
          label="Cash Accounts"
          value={cashAccounts.toString()}
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
                placeholder="Search by account #, name, bank..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                />
              </div>
              <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Account Type
              </label>
              <Select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Types</option>
                <option value="BANK">Bank</option>
                <option value="CASH">Cash</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="ASSET">Asset</option>
                <option value="LIABILITY">Liability</option>
                <option value="EQUITY">Equity</option>
                <option value="REVENUE">Revenue</option>
                <option value="EXPENSE">Expense</option>
                </Select>
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
              </div>
              </div>
            </div>

        {/* Table */}
        {paginatedAccounts.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No accounts found"
              description="Create your first account or adjust your filters"
            />
            <div className="mt-4 text-center">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setEditingAccount(null);
                  setModalOpen(true);
                }}
              >
                + New Account
              </Button>
                </div>
                </div>
        ) : (
          <>
            <Table
              data={paginatedAccounts}
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
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAccounts.length)} of {filteredAccounts.length} accounts
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
          setEditingAccount(null);
        }}
        title={editingAccount ? 'Edit Account' : 'New Account'}
      >
        <SimpleAccountForm
          initial={editingAccount || undefined}
          onSubmit={editingAccount ? handleUpdate : handleCreate}
          onCancel={() => {
            setModalOpen(false);
            setEditingAccount(null);
          }}
        />
      </Modal>
    </div>
  );
}
