import { FormEvent, useState } from 'react';
import type { Account, AccountType } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';

type Props = {
  initial?: Partial<Account>;
  onSubmit: (values: Omit<Account, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
};

export function SimpleAccountForm({ initial, onSubmit, onCancel }: Props) {
  // Only fields needed for backend API
  const [accountCode, setAccountCode] = useState(initial?.account_number ?? '');
  const [accountName, setAccountName] = useState(initial?.account_name ?? '');
  const [accountType, setAccountType] = useState<AccountType>(initial?.account_type ?? 'ASSET');
  const [openingBalance, setOpeningBalance] = useState(initial?.opening_balance?.toString() ?? '0');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Create payload with only the fields backend needs
    const payload: Omit<Account, 'id' | 'created_at' | 'updated_at'> = {
      account_number: accountCode,
      account_name: accountName,
      account_type: accountType,
      opening_balance: parseFloat(openingBalance) || 0,
      current_balance: parseFloat(openingBalance) || 0,
      currency: 'INR', // Default
      is_active: true,
      parent_account: undefined,
      available_balance: undefined,
      bank_name: undefined,
      branch_name: undefined,
      ifsc_code: undefined,
      swift_code: undefined,
      account_holder_name: undefined,
    };
    
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Account Details */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Account Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Account Code <span className="text-red-500">*</span>
            </label>
            <Input
              value={accountCode}
              onChange={(e) => setAccountCode(e.target.value)}
              placeholder="BANK01"
              required
            />
            <p className="text-xs text-slate-500 mt-1">Unique identifier for the account</p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Account Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="HDFC Bank"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Account Type <span className="text-red-500">*</span>
            </label>
            <Select 
              value={accountType} 
              onChange={(e) => setAccountType(e.target.value as AccountType)} 
              required
            >
              <option value="BANK">Bank Account</option>
              <option value="CASH">Cash Account</option>
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
              Opening Balance <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
              placeholder="100000"
              required
            />
            <p className="text-xs text-slate-500 mt-1">Initial balance for this account</p>
          </div>
        </div>
      </div>

      {/* Information Box */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 text-xl">ℹ️</div>
          <div className="text-xs text-blue-800">
            <p className="font-semibold mb-1">Account Information</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li><strong>Account Code</strong>: Unique identifier (e.g., BANK01, CASH01)</li>
              <li><strong>Account Name</strong>: Display name (e.g., HDFC Bank, Petty Cash)</li>
              <li><strong>Account Type</strong>: Classification for reporting</li>
              <li><strong>Opening Balance</strong>: Starting balance in INR</li>
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
          {initial ? 'Update Account' : 'Create Account'}
        </Button>
      </div>
    </form>
  );
}

