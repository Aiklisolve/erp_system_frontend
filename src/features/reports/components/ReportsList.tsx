import { useState } from 'react';
import { useReports } from '../hooks/useReports';
import { useToast } from '../../../hooks/useToast';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Table, type TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { Badge } from '../../../components/ui/Badge';
import { Pagination } from '../../../components/ui/Pagination';
import type { Report, ReportType, ReportFormat } from '../types';
import { ReportForm } from './ReportForm';

// Helper function to get file extension from format
function getFileExtensionFromFormat(format: ReportFormat): string {
  const formatLower = format.toLowerCase();
  if (formatLower === 'excel') return 'xlsx';
  if (formatLower === 'pdf') return 'pdf';
  if (formatLower === 'csv') return 'csv';
  if (formatLower === 'json') return 'json';
  return 'pdf'; // default
}

export function ReportsList() {
  const { reports, loading, generate, remove, download, refresh } = useReports();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [generating, setGenerating] = useState(false);

  // Filter reports
  const filteredReports = reports.filter((report) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      report.report_name.toLowerCase().includes(searchLower) ||
      report.report_code?.toLowerCase().includes(searchLower) ||
      report.report_type.toLowerCase().includes(searchLower) ||
      report.description?.toLowerCase().includes(searchLower);
    
    const matchesType = typeFilter === 'all' || report.report_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, startIndex + itemsPerPage);

  // Get unique report types and statuses
  const reportTypes = Array.from(new Set(reports.map((r) => r.report_type).filter(Boolean)));
  const statuses = Array.from(new Set(reports.map((r) => r.status).filter(Boolean)));

  const columns: TableColumn<Report>[] = [
    {
      key: 'report_code',
      header: 'Code',
      render: (row) => row.report_code || row.id,
    },
    {
      key: 'report_name',
      header: 'Report Name',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="font-medium text-slate-900">{row.report_name}</div>
          {row.description && (
            <div className="text-[10px] text-slate-500 line-clamp-1">{row.description}</div>
          )}
        </div>
      ),
    },
    {
      key: 'report_type',
      header: 'Type',
      render: (row) => {
        const typeLabels: Record<string, string> = {
          'HR_EMPLOYEE': 'HR Employee',
          'HR_ATTENDANCE': 'HR Attendance',
          'HR_LEAVE': 'HR Leave',
          'HR_PAYROLL': 'HR Payroll',
          'FINANCE_TRANSACTION': 'Finance Transaction',
          'FINANCE_BALANCE_SHEET': 'Balance Sheet',
          'FINANCE_PROFIT_LOSS': 'Profit & Loss',
          'PROJECT_SUMMARY': 'Project Summary',
          'PROJECT_PROGRESS': 'Project Progress',
          'PROJECT_BUDGET': 'Project Budget',
          'INVENTORY_STOCK': 'Inventory Stock',
          'INVENTORY_MOVEMENT': 'Inventory Movement',
          'SALES_ORDER': 'Sales Order',
          'SALES_REVENUE': 'Sales Revenue',
          'PROCUREMENT_PURCHASE': 'Procurement Purchase',
          'PROCUREMENT_VENDOR': 'Procurement Vendor',
          'WAREHOUSE_STOCK': 'Warehouse Stock',
          'WAREHOUSE_MOVEMENT': 'Warehouse Movement',
          'CUSTOMER_SUMMARY': 'Customer Summary',
          'CUSTOMER_SALES': 'Customer Sales',
        };
        const label = typeLabels[row.report_type] || String(row.report_type).replace(/_/g, ' ');
        return (
          <span className="text-[11px] font-medium text-slate-700">
            {label}
          </span>
        );
      },
    },
    {
      key: 'format',
      header: 'Format',
      render: (row) => (
        <Badge variant="outline" tone="neutral" className="text-[10px]">
          {row.format}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const statusColors = {
          'PENDING': 'bg-yellow-100 text-yellow-700 border-yellow-200',
          'PROCESSING': 'bg-blue-100 text-blue-700 border-blue-200',
          'COMPLETED': 'bg-green-100 text-green-700 border-green-200',
          'FAILED': 'bg-red-100 text-red-700 border-red-200',
        };
        const color = statusColors[row.status] || 'bg-slate-100 text-slate-700 border-slate-200';
        return (
          <Badge variant="outline" className={`text-[10px] ${color}`}>
            {row.status}
          </Badge>
        );
      },
    },
    {
      key: 'generated_at',
      header: 'Generated',
      render: (row) => {
        if (!row.generated_at) return <span className="text-[11px] text-slate-400">-</span>;
        const date = new Date(row.generated_at);
        return (
          <div className="text-[11px] text-slate-600">
            {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'COMPLETED' && row.file_url && (
            <button
              type="button"
              onClick={async () => {
                try {
                  // Get report format for proper file handling
                  const format = row.format as ReportFormat;
                  
                  // Show loading state
                  showToast('info', 'Downloading...', 'Preparing file download...');
                  
                  const { blob, filename } = await download(row.id, format);
                  
                  // Validate blob
                  if (!blob || blob.size === 0) {
                    throw new Error('Downloaded file is empty or corrupted. Please check backend file generation.');
                  }
                  
                  // Additional validation: Check if blob is too small (likely corrupted)
                  if (blob.size < 100) {
                    throw new Error('File appears to be corrupted (file size too small). Please regenerate the report.');
                  }
                  
                  // Use filename from API, fallback to report data
                  const downloadFilename = filename || row.file_name || 
                    `report-${row.report_code || row.id}.${getFileExtensionFromFormat(format)}`;
                  
                  // Create download link
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = downloadFilename;
                  
                  // Append to body and trigger download
                  document.body.appendChild(a);
                  a.click();
                  
                  // Cleanup
                  setTimeout(() => {
                    window.URL.revokeObjectURL(url);
                    if (document.body.contains(a)) {
                      document.body.removeChild(a);
                    }
                  }, 100);
                  
                  showToast('success', 'Download Started', `File "${downloadFilename}" is downloading...`);
                } catch (error) {
                  console.error('Download error:', error);
                  const errorMessage = error instanceof Error ? error.message : 'Failed to download report';
                  
                  // Provide helpful error message
                  let userMessage = errorMessage;
                  let userTitle = 'Download Failed';
                  
                  if (errorMessage.includes('report metadata JSON instead of the actual file') || errorMessage.includes('JSON response instead of binary file')) {
                    userTitle = 'Backend Configuration Error';
                    userMessage = 'The backend download endpoint is returning JSON (report metadata) instead of the actual file. The endpoint should return binary file content, not JSON. Please check backend download endpoint implementation.';
                  } else if (errorMessage.includes('JSON error instead of file') || errorMessage.includes('HTML error page')) {
                    userTitle = 'Backend Error';
                    userMessage = 'The backend returned an error instead of a file. Please check backend logs and ensure the report file was generated correctly.';
                  } else if (errorMessage.includes('Invalid file format') || errorMessage.includes('magic bytes')) {
                    userTitle = 'Invalid File Format';
                    userMessage = 'The downloaded file is not a valid PDF/Excel/CSV file. The backend may not be generating files correctly. Please check backend file generation implementation.';
                  } else if (errorMessage.includes('corrupted')) {
                    userTitle = 'Corrupted File';
                    userMessage = 'The downloaded file appears to be corrupted. Please regenerate the report from the backend.';
                  } else if (errorMessage.includes('empty')) {
                    userTitle = 'Empty File';
                    userMessage = 'The downloaded file is empty. Please check backend file generation.';
                  } else if (errorMessage.includes('Failed to download')) {
                    userTitle = 'Download Error';
                    userMessage = 'Failed to download the report. Please check your connection and try again.';
                  }
                  
                  // Show detailed error in console for debugging
                  console.error('📋 Full error details:', {
                    error,
                    reportId: row.id,
                    reportFormat: row.format,
                    reportName: row.report_name
                  });
                  
                  showToast('error', userTitle, userMessage);
                }
              }}
              className="text-[11px] text-primary hover:text-primary-dark"
            >
              Download
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setEditingReport(row);
              setModalOpen(true);
            }}
            className="text-[11px] text-primary hover:text-primary-dark"
          >
            View
          </button>
          <button
            type="button"
            onClick={async () => {
              if (window.confirm('Are you sure you want to delete this report?')) {
                try {
                  await remove(row.id);
                  showToast('success', 'Report Deleted', `Report "${row.report_name}" has been deleted successfully.`);
                } catch (error) {
                  showToast('error', 'Deletion Failed', 'Failed to delete report. Please try again.');
                }
              }
            }}
            className="text-[11px] text-red-600 hover:text-red-700"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const handleFormSubmit = async (data: {
    report_type: ReportType;
    report_name: string;
    description?: string;
    format: ReportFormat;
    start_date?: string;
    end_date?: string;
    filters?: Record<string, any>;
    parameters?: Record<string, any>;
  }) => {
    setGenerating(true);
    try {
      await generate(data);
      showToast('success', 'Report Generated', `Report "${data.report_name}" is being generated.`);
      setModalOpen(false);
      setEditingReport(null);
      // Refresh after a delay to check status
      setTimeout(() => {
        refresh();
        setGenerating(false);
      }, 2000);
    } catch (error) {
      setGenerating(false);
      showToast('error', 'Generation Failed', 'Failed to generate report. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Reports
          </h1>
          <p className="text-xs text-slate-600 max-w-xl">
            Generate and manage reports across all ERP modules including HR, Finance, Projects, Inventory, Sales, and more.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingReport(null);
            setModalOpen(true);
          }}
        >
          Generate Report
        </Button>
      </div>

      {/* Filters */}
      <Card className="space-y-4">
        <div className="flex flex-col gap-3">
          <div className="w-full">
            <Input
              placeholder="Search by report name, code, type, or description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full"
            >
              <option value="all">All Types</option>
              {reportTypes.map((type) => (
                <option key={type} value={type}>
                  {String(type).replace(/_/g, ' ')}
                </option>
              ))}
            </Select>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full"
            >
              <option value="all">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {String(status)}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-12 sm:py-16">
            <LoadingState label="Loading reports..." size="md" variant="default" />
          </div>
        ) : filteredReports.length === 0 ? (
          <EmptyState
            title="No reports found"
            description={
              searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Generate your first report to get started.'
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table
                columns={columns}
                data={paginatedReports}
                getRowKey={(row, index) => `${row.id}-${index}`}
              />
            </div>
            {/* Pagination */}
            <div className="px-3 sm:px-4 py-3 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-600 w-full sm:w-auto justify-center sm:justify-start">
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
                <div className="flex-1 flex justify-center w-full sm:w-auto">
                  <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    onChange={setCurrentPage}
                  />
                </div>
                <div className="text-xs text-slate-600 whitespace-nowrap text-center sm:text-left">
                  Showing <span className="font-medium text-slate-900">{startIndex + 1}</span> to <span className="font-medium text-slate-900">{Math.min(startIndex + itemsPerPage, filteredReports.length)}</span> of <span className="font-medium text-slate-900">{filteredReports.length}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Modal */}
      <Modal
        title={editingReport ? 'View Report' : 'Generate New Report'}
        open={modalOpen}
        onClose={() => {
          if (!generating) {
            setModalOpen(false);
            setEditingReport(null);
          }
        }}
        hideCloseButton
      >
        {generating ? (
          <div className="py-12">
            <LoadingState label="Generating report..." size="md" variant="default" />
          </div>
        ) : (
          <ReportForm
            key={editingReport?.id || 'new-report'}
            initial={editingReport || undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setModalOpen(false);
              setEditingReport(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}

