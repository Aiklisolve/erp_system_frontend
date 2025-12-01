import { Link, useParams } from 'react-router-dom';
import { useErpModules } from '../features/erp/hooks/useErpModules';
import { useModuleRecords } from '../features/erp/hooks/useModuleRecords';
import type { ModuleRecordStatus } from '../features/erp/types';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const STATUS_OPTIONS: { value: ModuleRecordStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'closed', label: 'Closed' }
];

export function ModuleRecordsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { getModuleBySlug } = useErpModules();
  const module = slug ? getModuleBySlug(slug) : undefined;

  const {
    records,
    loading,
    createRecord,
    updateRecord,
    deleteRecord,
    changeStatus
  } = useModuleRecords(slug ?? '');

  if (!slug || !module) {
    return (
      <div className="space-y-6 text-center max-w-xl mx-auto">
        <SectionHeader
          eyebrow="Module records"
          title="Module not found"
          description="We couldn't find that ERP module. Navigate back and try again."
        />
        <Button asChild variant="primary">
          <Link to="/modules">Back to all modules</Link>
        </Button>
      </div>
    );
  }

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = (formData.get('title') as string) || '';
    const amount = Number(formData.get('amount')) || undefined;
    const status = (formData.get('status') as ModuleRecordStatus) || 'draft';
    const reference = (formData.get('reference') as string) || undefined;
    const notes = (formData.get('notes') as string) || undefined;

    if (!title.trim()) return;

    createRecord({
      title: title.trim(),
      amount,
      status,
      reference,
      notes,
      date: new Date().toISOString().slice(0, 10)
    });

    form.reset();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeader
          eyebrow={module.name}
          title="Demo records for this module"
          description="Use this space to create, edit, and delete example transactions tied to this ERP module. All data is stored locally in your browser."
        />
        <Button asChild variant="ghost">
          <Link to={`/modules/${module.slug}`}>&larr; Back to module overview</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr,1.3fr] items-start">
        <Card className="space-y-4 bg-slate-900/90">
          <h2 className="text-sm font-semibold text-slate-100">
            Create a new record
          </h2>
          <form className="space-y-3 text-sm" onSubmit={handleCreate}>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Title<span className="text-emerald-300"> *</span>
              </label>
              <input
                name="title"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                placeholder="e.g. January close, PO-1023, Inventory adjustment..."
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">
                  Reference
                </label>
                <input
                  name="reference"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  placeholder="e.g. INV-2025-001"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">
                  Amount
                </label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  placeholder="e.g. 2500"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Status
              </label>
              <select
                name="status"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                defaultValue="draft"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Notes
              </label>
              <textarea
                name="notes"
                rows={3}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                placeholder="Internal notes, assumptions, or next steps..."
              />
            </div>
            <Button type="submit" variant="primary" size="md" className="w-full">
              Save record
            </Button>
            <p className="text-[11px] text-slate-500">
              Data is stored only in your browser via localStorage. In a real
              implementation, this form would call Supabase to persist records.
            </p>
          </form>
        </Card>

        <Card className="space-y-3 bg-slate-900/90">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-100">
              Records for this module
            </h2>
            <span className="text-[11px] text-slate-400">
              {records.length} record{records.length === 1 ? '' : 's'}
            </span>
          </div>
          {loading ? (
            <p className="text-xs text-slate-400">Loading records...</p>
          ) : records.length === 0 ? (
            <p className="text-xs text-slate-400">
              No records yet. Use the form on the left to create your first example
              record for this module.
            </p>
          ) : (
            <div className="space-y-2">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-100">
                        {record.title}
                      </p>
                      {record.reference && (
                        <p className="text-[11px] text-slate-400">
                          Ref: {record.reference}
                        </p>
                      )}
                      {record.notes && (
                        <p className="mt-1 text-[11px] text-slate-400 line-clamp-2">
                          {record.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right space-y-1">
                      {record.amount !== undefined && (
                        <p className="font-semibold text-emerald-300">
                          {record.amount.toLocaleString(undefined, {
                            style: 'currency',
                            currency: 'USD'
                          })}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-500">
                        {record.date}
                      </p>
                      <select
                        className="mt-1 w-full rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] text-slate-100"
                        value={record.status}
                        onChange={(e) =>
                          changeStatus(record.id, e.target.value as ModuleRecordStatus)
                        }
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800 mt-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-[11px] px-2 py-1"
                      onClick={() => deleteRecord(record.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}


