import { FormEvent, useState } from 'react';
import type { FinanceTransaction, FinanceTransactionType, FinanceTransactionStatus } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';

type Props = {
  initial?: Partial<FinanceTransaction>;
  onSubmit: (values: Omit<FinanceTransaction, 'id' | 'created_at' | 'updated_at'>) => void;
};

export function FinanceForm({ initial, onSubmit }: Props) {
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<FinanceTransactionType>(initial?.type ?? 'INCOME');
  const [account, setAccount] = useState(initial?.account ?? '');
  const [amount, setAmount] = useState(initial?.amount ?? 0);
  const [currency, setCurrency] = useState(initial?.currency ?? 'USD');
  const [status, setStatus] = useState<FinanceTransactionStatus>(initial?.status ?? 'DRAFT');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!account || !amount) return;
    onSubmit({
      date,
      type,
      account,
      amount: Number(amount),
      currency,
      status,
      notes
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Basic info</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Select
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value as FinanceTransactionType)}
          >
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </Select>
        </div>
        <Input
          label="Account"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          placeholder="4000 - Product revenue"
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Amounts & status</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <Input
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as FinanceTransactionStatus)}
          >
            <option value="DRAFT">Draft</option>
            <option value="POSTED">Posted</option>
            <option value="VOID">Void</option>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-800">Notes</label>
          <textarea
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <div className="sticky bottom-0 mt-4 -mx-4 border-t border-slate-200 bg-white px-4 pt-3 flex justify-end gap-2">
        <Button type="button" variant="ghost" size="md">
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md">
          Save transaction
        </Button>
      </div>
    </form>
  );
}


