import { useState, useEffect, FormEvent } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Textarea } from '../../../components/ui/Textarea';
import { Table, type TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { StatCard } from '../../../components/ui/StatCard';
import { Badge } from '../../../components/ui/Badge';
import { Pagination } from '../../../components/ui/Pagination';
import type { TransferApproval, TransferApprovalStatus } from '../types';
import { apiRequest } from '../../../config/api';
import { toast } from '../../../lib/toast';

// Mock data for transfer approvals
const mockTransferApprovals: TransferApproval[] = [
  {
    id: 'ta-001',
    transfer_number: 'TRF-2025-001',
    from_employee_id: 1,
    from_employee_name: 'John Smith',
    to_employee_id: 2,
    to_employee_name: 'Sarah Johnson',
    from_account_id: 1,
    from_account_name: 'Bank Account - Main',
    to_account_id: 3,
    to_account_name: 'Cash Account - Petty Cash',
    amount: 5000,
    currency: 'USD',
    purpose: 'Monthly petty cash replenishment',
    requested_date: '2025-01-15',
    expected_date: '2025-01-16',
    days_pending: 2,
    status: 'PENDING',
    comments: 'Urgent - needed for operational expenses',
    created_at: '2025-01-15'
  },
  {
    id: 'ta-002',
    transfer_number: 'TRF-2025-002',
    from_employee_id: 3,
    from_employee_name: 'Mike Wilson',
    to_employee_id: 4,
    to_employee_name: 'Lisa Anderson',
    from_account_id: 1,
    from_account_name: 'Bank Account - Main',
    to_account_id: 4,
    to_account_name: 'Bank Account - Payroll',
    amount: 185000,
    currency: 'USD',
    purpose: 'Monthly salary transfer',
    requested_date: '2025-01-10',
    expected_date: '2025-01-12',
    days_pending: 7,
    status: 'PENDING',
    comments: 'Payroll for January 2025',
    created_at: '2025-01-10'
  },
  {
    id: 'ta-003',
    transfer_number: 'TRF-2025-003',
    from_employee_id: 1,
    from_employee_name: 'John Smith',
    to_employee_id: 2,
    to_employee_name: 'Sarah Johnson',
    from_account_id: 1,
    from_account_name: 'Bank Account - Main',
    to_account_id: 5,
    to_account_name: 'Investment Account',
    amount: 50000,
    currency: 'USD',
    purpose: 'Investment fund transfer',
    requested_date: '2025-01-05',
    expected_date: '2025-01-06',
    days_pending: 0,
    status: 'APPROVED',
    approved_by_emp_id: 5,
    approved_by_name: 'CFO - David Chen',
    approval_datetime: '2025-01-05T14:30:00',
    approval_comments: 'Approved as per investment plan',
    created_at: '2025-01-05'
  }
];

// Map backend transfer approval to frontend format
function mapBackendTransferApproval(backendTransfer: any): TransferApproval {
  // IMPORTANT: Use backend's numeric ID as string (not mock ID like "ta-001")
  const transferId = backendTransfer.id?.toString() || backendTransfer.transfer_id?.toString();
  
  // Calculate days pending
  const requestedDate = new Date(backendTransfer.requested_date);
  const today = new Date();
  const daysPending = Math.floor((today.getTime() - requestedDate.getTime()) / (1000 * 60 * 60 * 24));
  
  console.log('Mapping transfer approval:', {
    backend_id: backendTransfer.id,
    mapped_id: transferId,
    transfer_number: backendTransfer.transfer_number
  });
  
  return {
    id: transferId, // Use backend numeric ID (e.g., "1", "2", "3")
    transfer_number: backendTransfer.transfer_number || '',
    from_employee_id: backendTransfer.from_employee_id,
    from_employee_name: backendTransfer.from_employee_name || '',
    to_employee_id: backendTransfer.to_employee_id,
    to_employee_name: backendTransfer.to_employee_name || '',
    from_account_id: backendTransfer.from_account_id,
    from_account_name: backendTransfer.from_account_name || '',
    to_account_id: backendTransfer.to_account_id,
    to_account_name: backendTransfer.to_account_name || '',
    amount: parseFloat(backendTransfer.amount) || 0,
    currency: backendTransfer.currency || 'INR',
    purpose: backendTransfer.purpose || '',
    requested_date: backendTransfer.requested_date ? new Date(backendTransfer.requested_date).toISOString().split('T')[0] : '',
    expected_date: backendTransfer.expected_date ? new Date(backendTransfer.expected_date).toISOString().split('T')[0] : undefined,
    days_pending: daysPending,
    status: backendTransfer.status as TransferApprovalStatus || 'PENDING',
    comments: backendTransfer.comments || '',
    approved_by_emp_id: backendTransfer.approved_by_emp_id,
    approved_by_name: backendTransfer.approved_by_name,
    approval_datetime: backendTransfer.approval_datetime,
    approval_comments: backendTransfer.approval_comments,
    rejected_by_emp_id: backendTransfer.rejected_by_emp_id,
    rejected_by_name: backendTransfer.rejected_by_name,
    rejection_datetime: backendTransfer.rejection_datetime,
    rejection_reason: backendTransfer.rejection_reason,
    created_at: backendTransfer.created_at,
  };
}

export function TransferApprovals() {
  const [transfers, setTransfers] = useState<TransferApproval[]>(mockTransferApprovals);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedTransfer, setSelectedTransfer] = useState<TransferApproval | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [actionComments, setActionComments] = useState('');
  
  // Load transfers from backend
  useEffect(() => {
    loadTransfers();
  }, [statusFilter]);
  
  const loadTransfers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        page: '1',
        limit: '100'
      });
      
      console.log('Loading transfer approvals with params:', params.toString());
      
      const response = await apiRequest<{ success: boolean; data: { transfer_approvals: any[] } }>(
        `/finance/transfer-approvals?${params.toString()}`
      );
      
      console.log('Transfer approvals response:', response);
      
      if (response.success && response.data?.transfer_approvals) {
        const mapped = response.data.transfer_approvals.map(mapBackendTransferApproval);
        console.log('Mapped transfer approvals:', mapped.length);
        setTransfers(mapped);
      } else {
        console.log('No transfers in response, using mock data');
        setTransfers(mockTransferApprovals);
      }
    } catch (error) {
      console.error('Failed to load transfer approvals:', error);
      setTransfers(mockTransferApprovals);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const filteredTransfers = transfers.filter((transfer) => {
    return statusFilter === 'all' || transfer.status === statusFilter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTransfers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransfers = filteredTransfers.slice(startIndex, startIndex + itemsPerPage);

  // Calculate metrics
  const pendingCount = transfers.filter((t) => t.status === 'PENDING').length;
  const approvedCount = transfers.filter((t) => t.status === 'APPROVED').length;
  const rejectedCount = transfers.filter((t) => t.status === 'REJECTED').length;
  const totalPendingAmount = transfers
    .filter((t) => t.status === 'PENDING')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleApprove = async () => {
    if (!selectedTransfer) return;
    
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData.id || userData.user_id || '1';
      
      console.log('Approving transfer:', selectedTransfer.id);
      
      const response = await apiRequest<{ success: boolean; data: any; message?: string }>(
        `/finance/transfer-approvals/${selectedTransfer.id}/approve`,
        {
          method: 'POST',
          body: JSON.stringify({
            approval_comments: actionComments,
            approved_by_emp_id: parseInt(userId)
          }),
        }
      );
      
      console.log('Approve response:', response);
      
      if (response.success) {
        toast.success('Transfer approved successfully!');
        setActionModalOpen(false);
        setSelectedTransfer(null);
        setActionComments('');
        loadTransfers(); // Refresh list
      } else {
        toast.error(response.message || 'Failed to approve transfer');
      }
    } catch (error: any) {
      console.error('Approve error:', error);
      toast.error(error.message || 'Failed to approve transfer');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedTransfer) return;
    
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData.id || userData.user_id || '1';
      
      console.log('Rejecting transfer:', selectedTransfer.id);
      
      const response = await apiRequest<{ success: boolean; data: any; message?: string }>(
        `/finance/transfer-approvals/${selectedTransfer.id}/reject`,
        {
          method: 'POST',
          body: JSON.stringify({
            rejection_reason: actionComments,
            rejected_by_emp_id: parseInt(userId)
          }),
        }
      );
      
      console.log('Reject response:', response);
      
      if (response.success) {
        toast.success('Transfer rejected successfully!');
        setActionModalOpen(false);
        setSelectedTransfer(null);
        setActionComments('');
        loadTransfers(); // Refresh list
      } else {
        toast.error(response.message || 'Failed to reject transfer');
      }
    } catch (error: any) {
      console.error('Reject error:', error);
      toast.error(error.message || 'Failed to reject transfer');
    } finally {
      setLoading(false);
    }
  };

  const columns: TableColumn<TransferApproval>[] = [
    {
      key: 'transfer_number',
      header: 'Transfer #',
      render: (row) => (
        <div className="font-medium text-slate-900">{row.transfer_number}</div>
      )
    },
    {
      key: 'requested_date',
      header: 'Requested Date',
      render: (row) => (
        <div>
          <div className="text-xs text-slate-900">{new Date(row.requested_date).toLocaleDateString()}</div>
          {row.days_pending > 0 && row.status === 'PENDING' && (
            <div className="text-[10px] text-amber-600">{row.days_pending} days pending</div>
          )}
        </div>
      )
    },
    {
      key: 'from_employee_name',
      header: 'From',
      render: (row) => (
        <div>
          <div className="text-xs font-medium text-slate-900">{row.from_employee_name || '—'}</div>
          <div className="text-[10px] text-slate-500">{row.from_account_name}</div>
        </div>
      )
    },
    {
      key: 'to_employee_name',
      header: 'To',
      render: (row) => (
        <div>
          <div className="text-xs font-medium text-slate-900">{row.to_employee_name || '—'}</div>
          <div className="text-[10px] text-slate-500">{row.to_account_name}</div>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => (
        <div className="text-right">
          <div className="text-xs font-semibold text-slate-900">
            {row.currency} {row.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      )
    },
    {
      key: 'purpose',
      header: 'Purpose',
      render: (row) => (
        <div className="text-xs text-slate-600 max-w-xs truncate" title={row.purpose}>
          {row.purpose}
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
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex items-center gap-2 justify-end">
          {row.status === 'PENDING' && (
            <>
              <button
                type="button"
                onClick={() => {
                  setSelectedTransfer(row);
                  setActionType('approve');
                  setActionModalOpen(true);
                }}
                className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedTransfer(row);
                  setActionType('reject');
                  setActionModalOpen(true);
                }}
                className="text-[11px] text-red-600 hover:text-red-700 font-medium"
              >
                Reject
              </button>
            </>
          )}
          {row.status !== 'PENDING' && (
            <span className="text-[11px] text-slate-400">No actions</span>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return <LoadingState label="Loading transfer approvals..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Transfer Approvals</h1>
          <p className="text-xs text-slate-600 max-w-2xl mt-1">
            Review and approve pending transfer requests between accounts
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pending Approvals"
          value={pendingCount.toString()}
        />
        <StatCard
          label="Pending Amount"
          value={`$${totalPendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
        <StatCard
          label="Approved"
          value={approvedCount.toString()}
        />
        <StatCard
          label="Rejected"
          value={rejectedCount.toString()}
        />
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4 border-b border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="PENDING">Pending Only</option>
                <option value="all">All Status</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        {paginatedTransfers.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No transfer approvals found"
              description="No transfers match your current filter"
            />
          </div>
        ) : (
          <>
            <Table
              data={paginatedTransfers}
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
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransfers.length)} of {filteredTransfers.length} transfers
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Action Modal */}
      <Modal
        open={actionModalOpen}
        onClose={() => {
          setActionModalOpen(false);
          setSelectedTransfer(null);
          setActionComments('');
        }}
        title={actionType === 'approve' ? 'Approve Transfer' : 'Reject Transfer'}
      >
        {selectedTransfer && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (actionType === 'approve') {
                handleApprove();
              } else {
                handleReject();
              }
            }}
            className="space-y-6"
          >
            {/* Transfer Details */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
                Transfer Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500">Transfer #:</span>
                  <div className="font-medium text-slate-900">{selectedTransfer.transfer_number}</div>
                </div>
                <div>
                  <span className="text-slate-500">Amount:</span>
                  <div className="font-semibold text-slate-900">{selectedTransfer.currency} {selectedTransfer.amount.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-slate-500">From:</span>
                  <div className="font-medium text-slate-900">{selectedTransfer.from_account_name}</div>
                </div>
                <div>
                  <span className="text-slate-500">To:</span>
                  <div className="font-medium text-slate-900">{selectedTransfer.to_account_name}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500">Purpose:</span>
                  <div className="text-slate-900">{selectedTransfer.purpose}</div>
                </div>
                {selectedTransfer.comments && (
                  <div className="col-span-2">
                    <span className="text-slate-500">Requestor Comments:</span>
                    <div className="text-slate-900">{selectedTransfer.comments}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Comments */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                {actionType === 'approve' ? 'Approval Comments' : 'Rejection Reason'} <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={actionComments}
                onChange={(e) => setActionComments(e.target.value)}
                placeholder={actionType === 'approve' ? 'Enter approval comments...' : 'Enter reason for rejection...'}
                rows={3}
                required
              />
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => {
                  setActionModalOpen(false);
                  setSelectedTransfer(null);
                  setActionComments('');
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full sm:w-auto"
              >
                {actionType === 'approve' ? 'Approve Transfer' : 'Reject Transfer'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
