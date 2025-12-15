import { FormEvent, useState, useEffect } from 'react';
import type { Lead, Campaign } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Textarea } from '../../../components/ui/Textarea';
import { SearchableSelect } from '../../../components/ui/SearchableSelect';

type Props = {
  initial?: Partial<Lead>;
  campaigns: Campaign[];
  onSubmit: (values: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
};

export function LeadForm({ initial, campaigns, onSubmit, onCancel }: Props) {
  const [campaignId, setCampaignId] = useState(initial?.campaign_id ?? '');
  const [source, setSource] = useState(initial?.source ?? '');
  const [firstName, setFirstName] = useState(initial?.first_name ?? '');
  const [lastName, setLastName] = useState(initial?.last_name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [company, setCompany] = useState(initial?.company ?? '');
  const [jobTitle, setJobTitle] = useState(initial?.job_title ?? '');
  const [status, setStatus] = useState<Lead['status']>(initial?.status ?? 'NEW');
  const [score, setScore] = useState(initial?.score?.toString() ?? '0');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  // Update form fields when initial prop changes (for edit mode)
  useEffect(() => {
    if (initial) {
      setCampaignId(initial.campaign_id ?? '');
      setSource(initial.source ?? '');
      setFirstName(initial.first_name ?? '');
      setLastName(initial.last_name ?? '');
      setEmail(initial.email ?? '');
      setPhone(initial.phone ?? '');
      setCompany(initial.company ?? '');
      setJobTitle(initial.job_title ?? '');
      setStatus(initial.status ?? 'NEW');
      setScore(initial.score?.toString() ?? '0');
      setNotes(initial.notes ?? '');
    } else {
      setCampaignId('');
      setSource('');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setCompany('');
      setJobTitle('');
      setStatus('NEW');
      setScore('0');
      setNotes('');
    }
  }, [initial]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    if (phone && phone.length !== 10) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }
    if (score && (isNaN(parseInt(score, 10)) || parseInt(score, 10) < 0 || parseInt(score, 10) > 100)) {
      newErrors.score = 'Score must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    // Get campaign name if campaign_id is selected
    const selectedCampaign = campaigns.find(c => c.id === campaignId);
    const campaignName = selectedCampaign?.name || initial?.campaign_name;
    
    const payload: Omit<Lead, 'id' | 'created_at' | 'updated_at'> = {
      campaign_id: campaignId || undefined,
      campaign_name: campaignName || undefined,
      source: source || undefined,
      first_name: firstName || undefined,
      last_name: lastName || undefined,
      email: email || undefined,
      phone: phone || undefined,
      company: company || undefined,
      job_title: jobTitle || undefined,
      status: status || 'NEW',
      score: score ? parseInt(score, 10) : 0,
      notes: notes || undefined
    };
    
    onSubmit(payload);
  };

  const campaignOptions = campaigns.map((campaign) => ({
    value: campaign.id,
    label: `${campaign.name} (${campaign.campaign_code || campaign.id})`
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Campaign & Source */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Campaign & Source
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <SearchableSelect
              label="Campaign"
              value={campaignId}
              onChange={(value) => setCampaignId(value)}
              options={campaignOptions}
              placeholder="Select a campaign (optional)"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Source
            </label>
            <Input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Website Form, Social Media, Referral, etc."
            />
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              First Name
            </label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Last Name
            </label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john.doe@example.com"
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Phone
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => {
                // Remove any non-digit characters
                const digitsOnly = e.target.value.replace(/\D/g, '');
                // Limit to 10 digits
                const limitedDigits = digitsOnly.slice(0, 10);
                setPhone(limitedDigits);
              }}
              placeholder="1234567890"
              maxLength={10}
            />
            {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
            {phone.length === 10 && !errors.phone && (
              <p className="text-xs text-slate-500 mt-1">10 digits entered</p>
            )}
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Company Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Company
            </label>
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Acme Corporation"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Job Title
            </label>
            <Input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="CTO, Marketing Manager, etc."
            />
          </div>
        </div>
      </div>

      {/* Status & Score */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Status & Score
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Status
            </label>
            <Select value={status} onChange={(e) => setStatus(e.target.value as Lead['status'])}>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="CONVERTED">Converted</option>
              <option value="LOST">Lost</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Lead Score (0-100)
            </label>
            <Input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="0"
              min="0"
              max="100"
            />
            {errors.score && <p className="text-xs text-red-600 mt-1">{errors.score}</p>}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Additional Notes
        </h3>
        <div>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes about this lead..."
            rows={4}
          />
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
          {initial ? 'Update Lead' : 'Create Lead'}
        </Button>
      </div>
    </form>
  );
}

