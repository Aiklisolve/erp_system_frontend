import { FormEvent, useState } from 'react';
import type { Campaign, CampaignChannel, CampaignStatus } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';

type Props = {
  initial?: Partial<Campaign>;
  onSubmit: (values: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
};

const CHANNELS: CampaignChannel[] = ['EMAIL', 'SOCIAL_MEDIA', 'SEO', 'PPC', 'CONTENT', 'AFFILIATE'];
const STATUSES: CampaignStatus[] = ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'];

export function CampaignForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [channel, setChannel] = useState<CampaignChannel>(initial?.channel ?? 'EMAIL');
  const [startDate, setStartDate] = useState(
    initial?.start_date ?? new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(
    initial?.end_date ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [status, setStatus] = useState<CampaignStatus>(initial?.status ?? 'DRAFT');
  const [budget, setBudget] = useState(initial?.budget ?? 0);
  const [impressions, setImpressions] = useState(initial?.impressions ?? 0);
  const [clicks, setClicks] = useState(initial?.clicks ?? 0);
  const [leads, setLeads] = useState(initial?.leads ?? 0);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || budget < 0) return;
    onSubmit({
      name,
      channel,
      start_date: startDate,
      end_date: endDate,
      status,
      budget: Number(budget),
      impressions: Number(impressions),
      clicks: Number(clicks),
      leads: Number(leads)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">Campaign Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Campaign name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Q1 Product Launch"
          />
          <Select
            label="Channel"
            value={channel}
            onChange={(e) => setChannel(e.target.value as CampaignChannel)}
          >
            {CHANNELS.map((ch) => (
              <option key={ch} value={ch}>
                {ch.replace('_', ' ')}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">Dates & Status</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Start date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="End date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as CampaignStatus)}
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {st.charAt(0) + st.slice(1).toLowerCase()}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">Budget & Performance</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Budget (USD)"
            type="number"
            step="0.01"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
          />
        </div>
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-text-primary">
            Performance Metrics (Optional)
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Impressions"
              type="number"
              value={impressions}
              onChange={(e) => setImpressions(Number(e.target.value))}
            />
            <Input
              label="Clicks"
              type="number"
              value={clicks}
              onChange={(e) => setClicks(Number(e.target.value))}
            />
            <Input
              label="Leads"
              type="number"
              value={leads}
              onChange={(e) => setLeads(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 bg-card border-t border-slate-200 p-4 flex justify-end gap-2 -mx-6 -mb-6 mt-auto">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Save Campaign
        </Button>
      </div>
    </form>
  );
}

