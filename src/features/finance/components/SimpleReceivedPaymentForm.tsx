import { FormEvent, useState } from 'react';
import type { ReceivedPayment, PaymentMethod, Currency } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';

type Props = {
  initial?: Partial<ReceivedPayment>;
  onSubmit: (values: Omit<ReceivedPayment, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
};

// Generate payment number
function generatePaymentNumber(): string {
  const prefix = 'PAY';
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}-${random}`;
}

export function SimpleReceivedPaymentForm({ initial, onSubmit, onCancel }: Props) {
  // Only fields needed for backend API
  const [paymentNumber, setPaymentNumber] = useState(initial?.payment_number ?? generatePaymentNumber());
  const [customerId, setCustomerId] = useState(initial?.customer_id ?? '1');
  const [paymentDate, setPaymentDate] = useState(initial?.payment_date ?? new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? '');
  const [currency, setCurrency] = useState<Currency>(initial?.currency ?? 'INR');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initial?.payment_method ?? 'CASH');
  const [referenceNumber, setReferenceNumber] = useState(initial?.reference_number ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Create payload with only the fields backend needs
    const payload: Omit<ReceivedPayment, 'id' | 'created_at' | 'updated_at'> = {
      payment_number: paymentNumber,
      customer_id: customerId,
      customer_name: `Customer ${customerId}`, // Will be replaced by backend
      payment_date: paymentDate,
      amount: parseFloat(amount),
      currency,
      payment_method: paymentMethod,
      reference_number: referenceNumber || undefined,
      notes: notes || undefined,
      account: 'Default Account', // Required by type
      status: 'RECEIVED',
    };
    
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Details */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Payment Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Payment Number <span className="text-red-500">*</span>
            </label>
            <Input
              value={paymentNumber}
              onChange={(e) => setPaymentNumber(e.target.value)}
              placeholder="PAY-2025-0001"
              required
              disabled
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Customer ID <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="1"
              required
            />
            <p className="text-xs text-slate-500 mt-1">Numeric customer ID</p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Payment Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
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
              placeholder="CASH-2025-001"
            />
          </div>
        </div>
      </div>

      {/* Amount Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Amount Information
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
              placeholder="8000.00"
              required
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
            </Select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} required>
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CHECK">Check</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="DEBIT_CARD">Debit Card</option>
              <option value="ONLINE_PAYMENT">Online Payment</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Additional Information
        </h3>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Notes
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Cash received for invoice payment..."
            rows={3}
          />
        </div>
      </div>

      {/* Information Box */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 text-xl">ℹ️</div>
          <div className="text-xs text-blue-800">
            <p className="font-semibold mb-1">Payment Information</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li><strong>Customer ID</strong>: Numeric ID of the customer</li>
              <li><strong>Amount</strong>: Payment amount in selected currency</li>
              <li><strong>Reference Number</strong>: Bank/transaction reference</li>
              <li><strong>Payment Method</strong>: How the payment was received</li>
            </ul>
          </div>
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
          {initial ? 'Update Payment' : 'Record Payment'}
        </Button>
      </div>
    </form>
  );
}

