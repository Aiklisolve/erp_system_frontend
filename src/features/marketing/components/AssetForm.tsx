import { FormEvent, useState, useEffect } from 'react';
import type { MarketingAsset, Campaign } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { SearchableSelect } from '../../../components/ui/SearchableSelect';

type Props = {
  initial?: Partial<MarketingAsset>;
  campaigns: Campaign[];
  onSubmit: (values: Omit<MarketingAsset, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
};

export function AssetForm({ initial, campaigns, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<MarketingAsset['type']>(initial?.type ?? 'IMAGE');
  const [url, setUrl] = useState(initial?.url ?? '');
  const [fileSize, setFileSize] = useState(initial?.file_size?.toString() ?? '');
  const [campaignId, setCampaignId] = useState(initial?.campaign_id ?? '');
  const [tags, setTags] = useState(initial?.tags?.join(', ') ?? '');

  // Update form fields when initial prop changes (for edit mode)
  useEffect(() => {
    if (initial) {
      setName(initial.name ?? '');
      setType(initial.type ?? 'IMAGE');
      setUrl(initial.url ?? '');
      setFileSize(initial.file_size?.toString() ?? '');
      setCampaignId(initial.campaign_id ?? '');
      setTags(initial.tags?.join(', ') ?? '');
    } else {
      setName('');
      setType('IMAGE');
      setUrl('');
      setFileSize('');
      setCampaignId('');
      setTags('');
    }
  }, [initial]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Asset name is required';
    if (url && !/^https?:\/\/.+/.test(url)) {
      newErrors.url = 'Invalid URL format. Must start with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    const payload: Omit<MarketingAsset, 'id' | 'created_at' | 'updated_at'> = {
      name,
      type: type || undefined,
      url: url || undefined,
      file_size: fileSize ? parseInt(fileSize, 10) : undefined,
      campaign_id: campaignId || undefined,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined
    };
    
    onSubmit(payload);
  };

  const campaignOptions = campaigns.map((campaign) => ({
    value: campaign.id,
    label: `${campaign.name} (${campaign.campaign_code || campaign.id})`
  }));

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Asset Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Q1 Launch Banner"
              required
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Asset Type
            </label>
            <Select value={type} onChange={(e) => setType(e.target.value as MarketingAsset['type'])}>
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
              <option value="DOCUMENT">Document</option>
              <option value="AUDIO">Audio</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
        </div>
      </div>

      {/* URL & File Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          File Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              URL
            </label>
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/assets/banner.jpg"
            />
            {errors.url && <p className="text-xs text-red-600 mt-1">{errors.url}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              File Size (bytes)
            </label>
            <Input
              type="number"
              value={fileSize}
              onChange={(e) => setFileSize(e.target.value)}
              placeholder="245760"
              min="0"
            />
            {fileSize && !isNaN(parseInt(fileSize, 10)) && (
              <p className="text-[10px] text-slate-500 mt-1">
                {formatFileSize(parseInt(fileSize, 10))}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Campaign Assignment */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Campaign Assignment
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
        </div>
      </div>

      {/* Tags */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Tags
        </h3>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Tags (comma-separated)
          </label>
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="banner, launch, q1"
          />
          <p className="text-[10px] text-slate-500 mt-1">Separate multiple tags with commas</p>
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
          {initial ? 'Update Asset' : 'Create Asset'}
        </Button>
      </div>
    </form>
  );
}


