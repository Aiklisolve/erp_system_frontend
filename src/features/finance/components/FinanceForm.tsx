import { FormEvent, useState, useEffect } from 'react';
import type { FinanceTransaction, FinanceTransactionType, FinanceTransactionStatus, PaymentMethod, AccountType, Currency } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';

type Props = {
  initial?: Partial<FinanceTransaction>;
  onSubmit: (values: Omit<FinanceTransaction, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
};

// Generate transaction number
function generateTransactionNumber(): string {
  const prefix = 'TXN';
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}-${random}`;
}

export function FinanceForm({ initial, onSubmit, onCancel }: Props) {
  // Transaction Identification
  const [transactionNumber, setTransactionNumber] = useState(initial?.transaction_number ?? generateTransactionNumber());
  const [referenceNumber, setReferenceNumber] = useState(initial?.reference_number ?? '');
  const [invoiceNumber, setInvoiceNumber] = useState(initial?.invoice_number ?? '');
  
  // Basic Information
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(initial?.due_date ?? '');
  const [type, setType] = useState<FinanceTransactionType>(initial?.type ?? 'INCOME');
  const [status, setStatus] = useState<FinanceTransactionStatus>(initial?.status ?? 'DRAFT');
  
  // Account Information
  const [account, setAccount] = useState(initial?.account ?? '');
  const [accountType, setAccountType] = useState<AccountType>(initial?.account_type ?? 'BANK');
  const [accountNumber, setAccountNumber] = useState(initial?.account_number ?? '');
  const [fromAccount, setFromAccount] = useState(initial?.from_account ?? '');
  const [toAccount, setToAccount] = useState(initial?.to_account ?? '');
  
  // Amount Details
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? '');
  const [currency, setCurrency] = useState<Currency>(initial?.currency ?? 'USD');
  const [exchangeRate, setExchangeRate] = useState(initial?.exchange_rate?.toString() ?? '');
  const [taxAmount, setTaxAmount] = useState(initial?.tax_amount?.toString() ?? '');
  const [discountAmount, setDiscountAmount] = useState(initial?.discount_amount?.toString() ?? '');
  const [netAmount, setNetAmount] = useState(initial?.net_amount?.toString() ?? '');
  
  // Payment Information
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initial?.payment_method ?? 'BANK_TRANSFER');
  const [paymentTerms, setPaymentTerms] = useState(initial?.payment_terms ?? '');
  const [paymentDate, setPaymentDate] = useState(initial?.payment_date ?? '');
  const [checkNumber, setCheckNumber] = useState(initial?.check_number ?? '');
  const [transactionId, setTransactionId] = useState(initial?.transaction_id ?? '');
  
  // Party Information
  const [partyName, setPartyName] = useState(initial?.party_name ?? '');
  const [partyType, setPartyType] = useState<'CUSTOMER' | 'VENDOR' | 'EMPLOYEE' | 'OTHER'>(initial?.party_type ?? 'CUSTOMER');
  const [partyId, setPartyId] = useState(initial?.party_id ?? '');
  const [contactPerson, setContactPerson] = useState(initial?.contact_person ?? '');
  const [contactEmail, setContactEmail] = useState(initial?.contact_email ?? '');
  const [contactPhone, setContactPhone] = useState(initial?.contact_phone ?? '');
  
  // Category & Classification
  const [category, setCategory] = useState(initial?.category ?? '');
  const [subcategory, setSubcategory] = useState(initial?.subcategory ?? '');
  const [department, setDepartment] = useState(initial?.department ?? '');
  const [projectId, setProjectId] = useState(initial?.project_id ?? '');
  const [costCenter, setCostCenter] = useState(initial?.cost_center ?? '');
  
  // Approval & Workflow
  const [createdBy, setCreatedBy] = useState(initial?.created_by ?? '');
  const [approvedBy, setApprovedBy] = useState(initial?.approved_by ?? '');
  const [approvedDate, setApprovedDate] = useState(initial?.approved_date ?? '');
  const [postedBy, setPostedBy] = useState(initial?.posted_by ?? '');
  const [postedDate, setPostedDate] = useState(initial?.posted_date ?? '');
  
  // Additional Details
  const [description, setDescription] = useState(initial?.description ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [internalNotes, setInternalNotes] = useState(initial?.internal_notes ?? '');
  const [tags, setTags] = useState(initial?.tags?.join(', ') ?? '');
  
  // Reconciliation
  const [isReconciled, setIsReconciled] = useState(initial?.is_reconciled ?? false);
  const [reconciledBy, setReconciledBy] = useState(initial?.reconciled_by ?? '');
  const [reconciledDate, setReconciledDate] = useState(initial?.reconciled_date ?? '');
  const [bankStatementDate, setBankStatementDate] = useState(initial?.bank_statement_date ?? '');
  const [bankStatementRef, setBankStatementRef] = useState(initial?.bank_statement_ref ?? '');
  
  // Recurring
  const [isRecurring, setIsRecurring] = useState(initial?.is_recurring ?? false);
  const [recurrencePattern, setRecurrencePattern] = useState(initial?.recurrence_pattern ?? '');
  const [nextOccurrenceDate, setNextOccurrenceDate] = useState(initial?.next_occurrence_date ?? '');

  // Auto-calculate net amount
  useEffect(() => {
    const amountVal = parseFloat(amount) || 0;
    const taxVal = parseFloat(taxAmount) || 0;
    const discountVal = parseFloat(discountAmount) || 0;
    const calculatedNet = amountVal - taxVal - discountVal;
    setNetAmount(calculatedNet.toFixed(2));
  }, [amount, taxAmount, discountAmount]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const payload: Omit<FinanceTransaction, 'id' | 'created_at' | 'updated_at'> = {
      transaction_number: transactionNumber,
      reference_number: referenceNumber || undefined,
      invoice_number: invoiceNumber || undefined,
      date,
      due_date: dueDate || undefined,
      type,
      status,
      account,
      account_type: accountType,
      account_number: accountNumber || undefined,
      from_account: type === 'TRANSFER' ? fromAccount : undefined,
      to_account: type === 'TRANSFER' ? toAccount : undefined,
      amount: parseFloat(amount),
      currency,
      exchange_rate: exchangeRate ? parseFloat(exchangeRate) : undefined,
      tax_amount: taxAmount ? parseFloat(taxAmount) : undefined,
      discount_amount: discountAmount ? parseFloat(discountAmount) : undefined,
      net_amount: netAmount ? parseFloat(netAmount) : undefined,
      payment_method: paymentMethod,
      payment_terms: paymentTerms || undefined,
      payment_date: paymentDate || undefined,
      check_number: checkNumber || undefined,
      transaction_id: transactionId || undefined,
      party_name: partyName || undefined,
      party_type: partyType || undefined,
      party_id: partyId || undefined,
      contact_person: contactPerson || undefined,
      contact_email: contactEmail || undefined,
      contact_phone: contactPhone || undefined,
      category: category || undefined,
      subcategory: subcategory || undefined,
      department: department || undefined,
      project_id: projectId || undefined,
      cost_center: costCenter || undefined,
      created_by: createdBy || undefined,
      approved_by: approvedBy || undefined,
      approved_date: approvedDate || undefined,
      posted_by: postedBy || undefined,
      posted_date: postedDate || undefined,
      reconciled_by: reconciledBy || undefined,
      reconciled_date: reconciledDate || undefined,
      description: description || undefined,
      notes: notes || undefined,
      internal_notes: internalNotes || undefined,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      is_reconciled: isReconciled,
      bank_statement_date: bankStatementDate || undefined,
      bank_statement_ref: bankStatementRef || undefined,
      is_recurring: isRecurring,
      recurrence_pattern: recurrencePattern || undefined,
      next_occurrence_date: nextOccurrenceDate || undefined
    };
    
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Transaction Identification */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Transaction Identification
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Transaction Number <span className="text-red-500">*</span>
            </label>
            <Input
              value={transactionNumber}
              onChange={(e) => setTransactionNumber(e.target.value)}
              placeholder="TXN-2025-0001"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Reference Number
            </label>
            <Input
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="REF-001"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Invoice Number
            </label>
            <Input
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="INV-2025-001"
            />
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Transaction Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
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
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Transaction Type <span className="text-red-500">*</span>
            </label>
            <Select value={type} onChange={(e) => setType(e.target.value as FinanceTransactionType)} required>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
              <option value="TRANSFER">Transfer</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Status <span className="text-red-500">*</span>
            </label>
            <Select value={status} onChange={(e) => setStatus(e.target.value as FinanceTransactionStatus)} required>
              <option value="DRAFT">Draft</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="POSTED">Posted</option>
              <option value="RECONCILED">Reconciled</option>
              <option value="VOID">Void</option>
              <option value="REJECTED">Rejected</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Account Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {type !== 'TRANSFER' ? (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Account <span className="text-red-500">*</span>
                </label>
                <Input
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
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
                  Account Number
                </label>
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="ACC-1001"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  From Account <span className="text-red-500">*</span>
                </label>
                <Input
                  value={fromAccount}
                  onChange={(e) => setFromAccount(e.target.value)}
                  placeholder="Bank Account - Main"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  To Account <span className="text-red-500">*</span>
                </label>
                <Input
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value)}
                  placeholder="Cash Account - Petty Cash"
                  required
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Amount Details */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Amount Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Amount <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
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
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Exchange Rate
            </label>
            <Input
              type="number"
              step="0.0001"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              placeholder="1.0000"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Tax Amount
            </label>
            <Input
              type="number"
              step="0.01"
              value={taxAmount}
              onChange={(e) => setTaxAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Discount Amount
            </label>
            <Input
              type="number"
              step="0.01"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Net Amount (Auto-calculated)
            </label>
            <Input
              type="number"
              step="0.01"
              value={netAmount}
              readOnly
              className="bg-slate-50"
            />
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Payment Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} required>
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CHECK">Check</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="DEBIT_CARD">Debit Card</option>
              <option value="WIRE_TRANSFER">Wire Transfer</option>
              <option value="ONLINE_PAYMENT">Online Payment</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Payment Terms
            </label>
            <Input
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              placeholder="Net 30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Payment Date
            </label>
            <Input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>
          {paymentMethod === 'CHECK' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Check Number
              </label>
              <Input
                value={checkNumber}
                onChange={(e) => setCheckNumber(e.target.value)}
                placeholder="CHK-001"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Transaction ID
            </label>
            <Input
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="TXN-BANK-001"
            />
          </div>
        </div>
      </div>

      {/* Party Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Party Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Party Name
            </label>
            <Input
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder="Acme Corporation"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Party Type
            </label>
            <Select value={partyType} onChange={(e) => setPartyType(e.target.value as any)}>
              <option value="CUSTOMER">Customer</option>
              <option value="VENDOR">Vendor</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Party ID
            </label>
            <Input
              value={partyId}
              onChange={(e) => setPartyId(e.target.value)}
              placeholder="CUST-001"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Contact Person
            </label>
            <Input
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="John Smith"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Contact Email
            </label>
            <Input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Contact Phone
            </label>
            <Input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+1-555-0101"
            />
          </div>
        </div>
      </div>

      {/* Category & Classification */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Category & Classification
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Category
            </label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Product Sales"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Subcategory
            </label>
            <Input
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              placeholder="Manufacturing Equipment"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Department
            </label>
            <Input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Sales"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Project ID
            </label>
            <Input
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="PROJ-2025-001"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Cost Center
            </label>
            <Input
              value={costCenter}
              onChange={(e) => setCostCenter(e.target.value)}
              placeholder="CC-SALES-01"
            />
          </div>
        </div>
      </div>

      {/* Approval & Workflow */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Approval & Workflow
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Created By
            </label>
            <Input
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
              placeholder="Sarah Johnson"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Approved By
            </label>
            <Input
              value={approvedBy}
              onChange={(e) => setApprovedBy(e.target.value)}
              placeholder="Mike Wilson"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Approved Date
            </label>
            <Input
              type="date"
              value={approvedDate}
              onChange={(e) => setApprovedDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Posted By
            </label>
            <Input
              value={postedBy}
              onChange={(e) => setPostedBy(e.target.value)}
              placeholder="Finance Team"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Posted Date
            </label>
            <Input
              type="date"
              value={postedDate}
              onChange={(e) => setPostedDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Reconciliation */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Reconciliation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isReconciled"
              checked={isReconciled}
              onChange={(e) => setIsReconciled(e.target.checked)}
              className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
            />
            <label htmlFor="isReconciled" className="text-xs font-medium text-slate-700">
              Is Reconciled
            </label>
          </div>
          {isReconciled && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Reconciled By
                </label>
                <Input
                  value={reconciledBy}
                  onChange={(e) => setReconciledBy(e.target.value)}
                  placeholder="Lisa Anderson"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Reconciled Date
                </label>
                <Input
                  type="date"
                  value={reconciledDate}
                  onChange={(e) => setReconciledDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Bank Statement Date
                </label>
                <Input
                  type="date"
                  value={bankStatementDate}
                  onChange={(e) => setBankStatementDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Bank Statement Reference
                </label>
                <Input
                  value={bankStatementRef}
                  onChange={(e) => setBankStatementRef(e.target.value)}
                  placeholder="STMT-2025-001"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recurring */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Recurring Transaction
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isRecurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
            />
            <label htmlFor="isRecurring" className="text-xs font-medium text-slate-700">
              Is Recurring
            </label>
          </div>
          {isRecurring && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Recurrence Pattern
                </label>
                <Select value={recurrencePattern} onChange={(e) => setRecurrencePattern(e.target.value)}>
                  <option value="">Select Pattern</option>
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="YEARLY">Yearly</option>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Next Occurrence Date
                </label>
                <Input
                  type="date"
                  value={nextOccurrenceDate}
                  onChange={(e) => setNextOccurrenceDate(e.target.value)}
                />
              </div>
            </>
          )}
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
              placeholder="Brief description of the transaction"
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
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Internal Notes
            </label>
            <Textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Internal notes (not visible to external parties)"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Tags (comma-separated)
            </label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="sales, manufacturing, equipment"
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
          {initial ? 'Update Transaction' : 'Create Transaction'}
        </Button>
      </div>
    </form>
  );
}
