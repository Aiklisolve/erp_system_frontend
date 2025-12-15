import { FormEvent, useState, useEffect } from 'react';
import type { Report, ReportType, ReportFormat } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';

type Props = {
  initial?: Partial<Report>;
  onSubmit: (values: {
    report_type: ReportType;
    report_name: string;
    description?: string;
    format: ReportFormat;
    start_date?: string;
    end_date?: string;
    filters?: Record<string, any>;
    parameters?: Record<string, any>;
  }) => void;
  onCancel?: () => void;
};

const REPORT_TYPES: { value: ReportType; label: string; category: string }[] = [
  // HR Reports
  { value: 'HR_EMPLOYEE', label: 'Employee Report', category: 'HR' },
  { value: 'HR_ATTENDANCE', label: 'Attendance Report', category: 'HR' },
  { value: 'HR_LEAVE', label: 'Leave Report', category: 'HR' },
  { value: 'HR_PAYROLL', label: 'Payroll Report', category: 'HR' },
  // Finance Reports
  { value: 'FINANCE_TRANSACTION', label: 'Transaction Report', category: 'Finance' },
  { value: 'FINANCE_BALANCE_SHEET', label: 'Balance Sheet', category: 'Finance' },
  { value: 'FINANCE_PROFIT_LOSS', label: 'Profit & Loss Statement', category: 'Finance' },
  // Project Reports
  { value: 'PROJECT_SUMMARY', label: 'Project Summary', category: 'Projects' },
  { value: 'PROJECT_PROGRESS', label: 'Project Progress', category: 'Projects' },
  { value: 'PROJECT_BUDGET', label: 'Project Budget', category: 'Projects' },
  // Inventory Reports
  { value: 'INVENTORY_STOCK', label: 'Stock Report', category: 'Inventory' },
  { value: 'INVENTORY_MOVEMENT', label: 'Stock Movement', category: 'Inventory' },
  // Sales Reports
  { value: 'SALES_ORDER', label: 'Sales Order Report', category: 'Sales' },
  { value: 'SALES_REVENUE', label: 'Sales Revenue', category: 'Sales' },
  // Procurement Reports
  { value: 'PROCUREMENT_PURCHASE', label: 'Purchase Report', category: 'Procurement' },
  { value: 'PROCUREMENT_VENDOR', label: 'Vendor Report', category: 'Procurement' },
  // Warehouse Reports
  { value: 'WAREHOUSE_STOCK', label: 'Warehouse Stock', category: 'Warehouse' },
  { value: 'WAREHOUSE_MOVEMENT', label: 'Warehouse Movement', category: 'Warehouse' },
  // Customer Reports
  { value: 'CUSTOMER_SUMMARY', label: 'Customer Summary', category: 'CRM' },
  { value: 'CUSTOMER_SALES', label: 'Customer Sales', category: 'CRM' },
];

const REPORT_FORMATS: { value: ReportFormat; label: string }[] = [
  { value: 'PDF', label: 'PDF' },
  { value: 'EXCEL', label: 'Excel (XLSX)' },
  { value: 'CSV', label: 'CSV' },
  { value: 'JSON', label: 'JSON' },
];

export function ReportForm({ initial, onSubmit, onCancel }: Props) {
  const [reportType, setReportType] = useState<ReportType>(initial?.report_type ?? 'HR_EMPLOYEE');
  const [reportName, setReportName] = useState(initial?.report_name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [format, setFormat] = useState<ReportFormat>(initial?.format ?? 'PDF');
  const [startDate, setStartDate] = useState(initial?.start_date ? initial.start_date.slice(0, 10) : '');
  const [endDate, setEndDate] = useState(initial?.end_date ? initial.end_date.slice(0, 10) : '');
  // Current date (for limiting date pickers)
  const today = new Date().toISOString().slice(0, 10);

  // Sync form fields when initial prop changes (for edit/view mode)
  useEffect(() => {
    if (initial) {
      setReportType(initial.report_type ?? 'HR_EMPLOYEE');
      setReportName(initial.report_name ?? '');
      setDescription(initial.description ?? '');
      setFormat(initial.format ?? 'PDF');
      if (initial.start_date) {
        setStartDate(initial.start_date.slice(0, 10));
      } else {
        setStartDate('');
      }
      if (initial.end_date) {
        setEndDate(initial.end_date.slice(0, 10));
      } else {
        setEndDate('');
      }
    } else {
      // Reset form when creating new report
      setReportType('HR_EMPLOYEE');
      setReportName('');
      setDescription('');
      setFormat('PDF');
      setStartDate('');
      setEndDate('');
    }
  }, [initial]);

  // Auto-generate report name based on type
  useEffect(() => {
    if (!initial && reportType) {
      const typeLabel = REPORT_TYPES.find(t => t.value === reportType)?.label || reportType;
      const dateRange = startDate && endDate 
        ? ` (${startDate} to ${endDate})`
        : startDate 
        ? ` (from ${startDate})`
        : '';
      setReportName(`${typeLabel}${dateRange}`);
    }
  }, [reportType, startDate, endDate, initial]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!reportName || !reportType) return;
    
    onSubmit({
      report_type: reportType,
      report_name: reportName,
      description: description || undefined,
      format,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      filters: {},
      parameters: {},
    });
  };

  // Group report types by category
  const groupedTypes = REPORT_TYPES.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, typeof REPORT_TYPES>);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      {/* Report Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Report Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-800">
              Report Type <span className="text-red-500">*</span>
            </label>
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              required
              disabled={!!initial}
            >
              {Object.entries(groupedTypes).map(([category, types]) => (
                <optgroup key={category} label={category}>
                  {types.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-800">
              Format <span className="text-red-500">*</span>
            </label>
            <Select
              value={format}
              onChange={(e) => setFormat(e.target.value as ReportFormat)}
              required
              disabled={!!initial}
            >
              {REPORT_FORMATS.map((fmt) => (
                <option key={fmt.value} value={fmt.value}>
                  {fmt.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <Input
          label="Report Name"
          value={reportName}
          onChange={(e) => setReportName(e.target.value)}
          placeholder="Enter report name"
          required
          disabled={!!initial}
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Report description (optional)"
          rows={3}
          disabled={!!initial}
        />
      </div>

      {/* Date Range */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Date Range</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={!!initial}
          />
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            max={today}
            disabled={!!initial}
          />
        </div>
      </div>

      {/* View Mode - Show Report Details */}
      {initial && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Report Details</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600">Status:</span>
              <span className="font-medium text-slate-900">{initial.status}</span>
            </div>
            {initial.generated_at && (
              <div className="flex justify-between">
                <span className="text-slate-600">Generated At:</span>
                <span className="font-medium text-slate-900">
                  {new Date(initial.generated_at).toLocaleString()}
                </span>
              </div>
            )}
            {(initial.generated_by_name || initial.generated_by) && (
              <div className="flex justify-between">
                <span className="text-slate-600">Generated By:</span>
                <span className="font-medium text-slate-900">
                  {initial.generated_by_name || initial.generated_by || 'Unknown'}
                </span>
              </div>
            )}
            {initial.file_name && (
              <div className="flex justify-between">
                <span className="text-slate-600">File Name:</span>
                <span className="font-medium text-slate-900">{initial.file_name}</span>
              </div>
            )}
            {initial.file_size && (
              <div className="flex justify-between">
                <span className="text-slate-600">File Size:</span>
                <span className="font-medium text-slate-900">
                  {(initial.file_size / 1024).toFixed(2)} KB
                </span>
              </div>
            )}
            {initial.error_message && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-red-700 font-medium">Error: </span>
                <span className="text-red-600">{initial.error_message}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 border-t border-slate-200 bg-white pt-3 flex flex-col sm:flex-row justify-end gap-2 sticky bottom-0">
        <Button
          type="button"
          variant="ghost"
          size="md"
          onClick={onCancel}
          className="w-full sm:w-auto"
        >
          {initial ? 'Close' : 'Cancel'}
        </Button>
        {!initial && (
          <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto">
            Generate Report
          </Button>
        )}
      </div>
    </form>
  );
}

