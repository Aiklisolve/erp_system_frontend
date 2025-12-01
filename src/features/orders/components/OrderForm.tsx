import { FormEvent, useState } from 'react';
import type { SalesOrder, SalesOrderStatus } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';

type Props = {
  initial?: Partial<SalesOrder>;
  onSubmit: (values: Omit<SalesOrder, 'id' | 'created_at' | 'updated_at'>) => void;
};

export function OrderForm({ initial, onSubmit }: Props) {
  const [customer, setCustomer] = useState(initial?.customer ?? '');
  const [date, setDate] = useState(
    initial?.date ?? new Date().toISOString().slice(0, 10)
  );
  const [status, setStatus] = useState<SalesOrderStatus>(
    initial?.status ?? 'PENDING'
  );
  const [totalAmount, setTotalAmount] = useState(initial?.total_amount ?? 0);
  const [currency, setCurrency] = useState(initial?.currency ?? 'USD');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!customer || !totalAmount) return;
    onSubmit({
      customer,
      date,
      status,
      total_amount: Number(totalAmount),
      currency
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Customer & date</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Customer"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            placeholder="Customer name"
          />
          <Input
            label="Order date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Totals & status</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Total amount"
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(Number(e.target.value))}
          />
          <Input
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as SalesOrderStatus)}
          >
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
        </div>
      </div>

      <div className="sticky bottom-0 mt-4 -mx-4 border-t border-slate-200 bg-white px-4 pt-3 flex justify-end gap-2">
        <Button type="button" variant="ghost" size="md">
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md">
          Save order
        </Button>
      </div>
    </form>
  );
}


