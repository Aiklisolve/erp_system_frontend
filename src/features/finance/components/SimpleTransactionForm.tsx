import { FormEvent, useState, useEffect } from 'react';
import type { FinanceTransaction, FinanceTransactionType, FinanceTransactionStatus, PaymentMethod, Currency } from '../types';
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

export function SimpleTransactionForm({ initial, onSubmit, onCancel }: Props) {
  // Only fields needed for backend API
  const [transactionNumber, setTransactionNumber] = useState(initial?.transaction_number ?? generateTransactionNumber());
  const [referenceNumber, setReferenceNumber] = useState(initial?.reference_number ?? '');
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<FinanceTransactionType>(initial?.type ?? 'EXPENSE');
  const [status, setStatus] = useState<FinanceTransactionStatus>(initial?.status ?? 'POSTED');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? '');
  const [currency, setCurrency] = useState<Currency>(initial?.currency ?? 'INR');
  const [taxAmount, setTaxAmount] = useState(initial?.tax_amount?.toString() ?? '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initial?.payment_method ?? 'BANK_TRANSFER');
  const [description, setDescription] = useState(initial?.description ?? '');
  
  // Auto-calculate net amount for display
  const [netAmount, setNetAmount] = useState('0.00');
  
  useEffect(() => {
    const amountVal = parseFloat(amount) || 0;
    const taxVal = parseFloat(taxAmount) || 0;
    const calculatedNet = amountVal - taxVal;
    setNetAmount(calculatedNet.toFixed(2));
  }, [amount, taxAmount]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Create payload with only the fields backend needs
    const payload: Omit<FinanceTransaction, 'id' | 'created_at' | 'updated_at'> = {
      transaction_number: transactionNumber,
      reference_number: referenceNumber || undefined,
      date,
      type,
      status,
      account: 'Default Account', // Required by frontend type
      account_type: 'BANK', // Required by frontend type
      amount: parseFloat(amount),
      currency,
      tax_amount: taxAmount ? parseFloat(taxAmount) : undefined,
      payment_method: paymentMethod,
      description: description || undefined,
      category: category || undefined,
    };
    
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Transaction Identification */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Transaction Details
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
              disabled
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Reference Number
            </label>
            <Input
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="UTR87653453"
            />
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Transaction Information
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
              <option value="COMPLETED">Completed</option>
              <option value="VOID">Void</option>
              <option value="REJECTED">Rejected</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Material Purchase, Sales Revenue, etc."
              required
            />
          </div>
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
              Currency <span className="text-red-500">*</span>
            </label>
            <Select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} required>
              <option value="INR">INR - Indian Rupee</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="CNY">CNY - Chinese Yuan</option>
              <option value="AUD">AUD - Australian Dollar</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Net Amount (Auto-calculated)
            </label>
            <Input
              value={netAmount}
              disabled
              className="bg-slate-50 text-slate-600 font-semibold"
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
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Description
        </h3>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Transaction Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the transaction..."
            rows={3}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4 border-t border-slate-200">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          className="w-full sm:w-auto"
        >
          {initial ? 'Update Transaction' : 'Create Transaction'}
        </Button>
      </div>
    </form>
  );
}

