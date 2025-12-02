import { FormEvent, useState, useEffect } from 'react';
import type { Campaign, CampaignChannel, CampaignStatus, CampaignType, BudgetType, BiddingStrategy, ConversionType } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';

type Props = {
  initial?: Partial<Campaign>;
  onSubmit: (values: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
};

// Generate campaign code
function generateCampaignCode(): string {
  const prefix = 'CAMP';
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${year}-${random}`;
}

const channels: CampaignChannel[] = [
  'EMAIL',
  'SOCIAL_MEDIA',
  'SEO',
  'PPC',
  'CONTENT',
  'AFFILIATE',
  'DISPLAY',
  'VIDEO',
  'MOBILE',
  'RADIO',
  'TV',
  'PRINT',
  'EVENTS',
  'OTHER',
];

export function CampaignForm({ initial, onSubmit, onCancel }: Props) {
  const [campaignCode, setCampaignCode] = useState(initial?.campaign_code ?? generateCampaignCode());
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  
  const [campaignType, setCampaignType] = useState<CampaignType | ''>(initial?.campaign_type ?? '');
  const [channel, setChannel] = useState<CampaignChannel>(initial?.channel ?? 'EMAIL');
  const [subChannel, setSubChannel] = useState(initial?.sub_channel ?? '');
  
  const [status, setStatus] = useState<CampaignStatus>(initial?.status ?? 'DRAFT');
  const [startDate, setStartDate] = useState(initial?.start_date ?? new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(initial?.end_date ?? '');
  const [launchDate, setLaunchDate] = useState(initial?.launch_date ?? '');
  
  const [budget, setBudget] = useState<number | ''>(initial?.budget ?? '');
  const [budgetType, setBudgetType] = useState<BudgetType>(initial?.budget_type ?? 'LIFETIME');
  const [dailyBudget, setDailyBudget] = useState<number | ''>(initial?.daily_budget ?? '');
  const [spent, setSpent] = useState<number | ''>(initial?.spent ?? '');
  const [currency, setCurrency] = useState(initial?.currency ?? 'USD');
  
  const [targetAudience, setTargetAudience] = useState(initial?.target_audience ?? '');
  const [targetDemographics, setTargetDemographics] = useState(initial?.target_demographics ?? '');
  const [targetLocations, setTargetLocations] = useState(initial?.target_locations?.join(', ') ?? '');
  const [targetInterests, setTargetInterests] = useState(initial?.target_interests?.join(', ') ?? '');
  const [targetKeywords, setTargetKeywords] = useState(initial?.target_keywords?.join(', ') ?? '');
  
  const [biddingStrategy, setBiddingStrategy] = useState<BiddingStrategy | ''>(initial?.bidding_strategy ?? '');
  const [costPerClick, setCostPerClick] = useState<number | ''>(initial?.cost_per_click ?? '');
  const [costPerMille, setCostPerMille] = useState<number | ''>(initial?.cost_per_mille ?? '');
  const [costPerAcquisition, setCostPerAcquisition] = useState<number | ''>(initial?.cost_per_acquisition ?? '');
  const [targetCpa, setTargetCpa] = useState<number | ''>(initial?.target_cpa ?? '');
  
  const [impressions, setImpressions] = useState<number | ''>(initial?.impressions ?? '');
  const [clicks, setClicks] = useState<number | ''>(initial?.clicks ?? '');
  const [uniqueClicks, setUniqueClicks] = useState<number | ''>(initial?.unique_clicks ?? '');
  const [reach, setReach] = useState<number | ''>(initial?.reach ?? '');
  
  const [leads, setLeads] = useState<number | ''>(initial?.leads ?? '');
  const [conversions, setConversions] = useState<number | ''>(initial?.conversions ?? '');
  const [conversionType, setConversionType] = useState<ConversionType | ''>(initial?.conversion_type ?? '');
  const [revenue, setRevenue] = useState<number | ''>(initial?.revenue ?? '');
  
  const [likes, setLikes] = useState<number | ''>(initial?.likes ?? '');
  const [shares, setShares] = useState<number | ''>(initial?.shares ?? '');
  const [comments, setComments] = useState<number | ''>(initial?.comments ?? '');
  const [videoViews, setVideoViews] = useState<number | ''>(initial?.video_views ?? '');
  const [emailOpens, setEmailOpens] = useState<number | ''>(initial?.email_opens ?? '');
  const [emailClicks, setEmailClicks] = useState<number | ''>(initial?.email_clicks ?? '');
  
  const [campaignUrl, setCampaignUrl] = useState(initial?.campaign_url ?? '');
  const [creativeAssets, setCreativeAssets] = useState(initial?.creative_assets?.join(', ') ?? '');
  const [adCopy, setAdCopy] = useState(initial?.ad_copy ?? '');
  const [callToAction, setCallToAction] = useState(initial?.call_to_action ?? '');
  
  const [campaignManager, setCampaignManager] = useState(initial?.campaign_manager ?? '');
  const [assignedTo, setAssignedTo] = useState(initial?.assigned_to ?? '');
  const [team, setTeam] = useState(initial?.team ?? '');
  
  const [trackingCode, setTrackingCode] = useState(initial?.tracking_code ?? '');
  const [analyticsId, setAnalyticsId] = useState(initial?.analytics_id ?? '');
  const [pixelId, setPixelId] = useState(initial?.pixel_id ?? '');
  
  const [targetImpressions, setTargetImpressions] = useState<number | ''>(initial?.target_impressions ?? '');
  const [targetClicks, setTargetClicks] = useState<number | ''>(initial?.target_clicks ?? '');
  const [targetLeads, setTargetLeads] = useState<number | ''>(initial?.target_leads ?? '');
  const [targetConversions, setTargetConversions] = useState<number | ''>(initial?.target_conversions ?? '');
  const [targetRevenue, setTargetRevenue] = useState<number | ''>(initial?.target_revenue ?? '');
  const [targetRoi, setTargetRoi] = useState<number | ''>(initial?.target_roi ?? '');
  
  const [isAbTest, setIsAbTest] = useState(initial?.is_ab_test ?? false);
  const [abTestVariant, setAbTestVariant] = useState(initial?.ab_test_variant ?? '');
  
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [internalNotes, setInternalNotes] = useState(initial?.internal_notes ?? '');

  // Auto-calculate remaining budget
  useEffect(() => {
    if (budget !== '' && spent !== '') {
      const remaining = Number(budget) - Number(spent);
      // This will be calculated on submit
    }
  }, [budget, spent]);

  // Auto-calculate CTR
  useEffect(() => {
    if (impressions !== '' && clicks !== '' && Number(impressions) > 0) {
      const ctr = (Number(clicks) / Number(impressions)) * 100;
      // This will be calculated on submit
    }
  }, [impressions, clicks]);

  // Auto-calculate conversion rate
  useEffect(() => {
    if (clicks !== '' && conversions !== '' && Number(clicks) > 0) {
      const convRate = (Number(conversions) / Number(clicks)) * 100;
      // This will be calculated on submit
    }
  }, [clicks, conversions]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || budget === '' || !startDate) return;
    
    // Calculate metrics
    const calculatedCtr = impressions && Number(impressions) > 0 && clicks
      ? (Number(clicks) / Number(impressions)) * 100
      : undefined;
    
    const calculatedConvRate = clicks && Number(clicks) > 0 && conversions
      ? (Number(conversions) / Number(clicks)) * 100
      : undefined;
    
    const calculatedCpl = leads && Number(leads) > 0 && spent
      ? Number(spent) / Number(leads)
      : undefined;
    
    const calculatedCpc = clicks && Number(clicks) > 0 && spent
      ? Number(spent) / Number(clicks)
      : undefined;
    
    const calculatedRoi = spent && Number(spent) > 0 && revenue
      ? ((Number(revenue) - Number(spent)) / Number(spent)) * 100
      : undefined;
    
    const calculatedRoas = spent && Number(spent) > 0 && revenue
      ? Number(revenue) / Number(spent)
      : undefined;
    
    const calculatedProfit = revenue && spent
      ? Number(revenue) - Number(spent)
      : undefined;
    
    const remainingBudget = budget && spent
      ? Number(budget) - Number(spent)
      : undefined;
    
    onSubmit({
      campaign_code: campaignCode,
      name,
      description: description || undefined,
      campaign_type: campaignType || undefined,
      channel,
      sub_channel: subChannel || undefined,
      status,
      start_date: startDate,
      end_date: endDate || undefined,
      launch_date: launchDate || undefined,
      budget: Number(budget),
      budget_type: budgetType,
      daily_budget: Number(dailyBudget) || undefined,
      spent: Number(spent) || undefined,
      remaining_budget: remainingBudget,
      currency: currency || undefined,
      target_audience: targetAudience || undefined,
      target_demographics: targetDemographics || undefined,
      target_locations: targetLocations ? targetLocations.split(',').map(l => l.trim()).filter(l => l) : undefined,
      target_interests: targetInterests ? targetInterests.split(',').map(i => i.trim()).filter(i => i) : undefined,
      target_keywords: targetKeywords ? targetKeywords.split(',').map(k => k.trim()).filter(k => k) : undefined,
      bidding_strategy: biddingStrategy || undefined,
      cost_per_click: Number(costPerClick) || calculatedCpc || undefined,
      cost_per_mille: Number(costPerMille) || undefined,
      cost_per_acquisition: Number(costPerAcquisition) || undefined,
      target_cpa: Number(targetCpa) || undefined,
      impressions: Number(impressions) || undefined,
      clicks: Number(clicks) || undefined,
      click_through_rate: calculatedCtr,
      unique_clicks: Number(uniqueClicks) || undefined,
      reach: Number(reach) || undefined,
      leads: Number(leads) || undefined,
      conversions: Number(conversions) || undefined,
      conversion_rate: calculatedConvRate,
      conversion_type: conversionType || undefined,
      revenue: Number(revenue) || undefined,
      cost_per_lead: calculatedCpl,
      cost_per_conversion: calculatedCpc,
      likes: Number(likes) || undefined,
      shares: Number(shares) || undefined,
      comments: Number(comments) || undefined,
      video_views: Number(videoViews) || undefined,
      email_opens: Number(emailOpens) || undefined,
      email_clicks: Number(emailClicks) || undefined,
      return_on_investment: calculatedRoi,
      return_on_ad_spend: calculatedRoas,
      profit: calculatedProfit,
      campaign_url: campaignUrl || undefined,
      creative_assets: creativeAssets ? creativeAssets.split(',').map(a => a.trim()).filter(a => a) : undefined,
      ad_copy: adCopy || undefined,
      call_to_action: callToAction || undefined,
      campaign_manager: campaignManager || undefined,
      assigned_to: assignedTo || undefined,
      team: team || undefined,
      tracking_code: trackingCode || undefined,
      analytics_id: analyticsId || undefined,
      pixel_id: pixelId || undefined,
      target_impressions: Number(targetImpressions) || undefined,
      target_clicks: Number(targetClicks) || undefined,
      target_leads: Number(targetLeads) || undefined,
      target_conversions: Number(targetConversions) || undefined,
      target_revenue: Number(targetRevenue) || undefined,
      target_roi: Number(targetRoi) || undefined,
      is_ab_test: isAbTest,
      ab_test_variant: abTestVariant || undefined,
      notes: notes || undefined,
      internal_notes: internalNotes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      {/* Campaign Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Campaign Information</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Campaign Code"
            value={campaignCode}
            onChange={(e) => setCampaignCode(e.target.value)}
            placeholder="Auto-generated"
          />
          <Input
            label="Campaign Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Campaign name"
            required
          />
          <Select
            label="Campaign Type"
            value={campaignType}
            onChange={(e) => setCampaignType(e.target.value as CampaignType)}
          >
            <option value="">Select type</option>
            <option value="BRAND_AWARENESS">Brand Awareness</option>
            <option value="LEAD_GENERATION">Lead Generation</option>
            <option value="SALES">Sales</option>
            <option value="RETENTION">Retention</option>
            <option value="REENGAGEMENT">Re-engagement</option>
            <option value="EDUCATION">Education</option>
            <option value="OTHER">Other</option>
          </Select>
        </div>
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Campaign description"
          rows={3}
        />
      </div>

      {/* Channel & Status */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Channel & Status</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Channel"
            value={channel}
            onChange={(e) => setChannel(e.target.value as CampaignChannel)}
            required
          >
            {channels.map((ch) => (
              <option key={ch} value={ch}>
                {ch.replace('_', ' ')}
              </option>
            ))}
          </Select>
          <Input
            label="Sub Channel"
            value={subChannel}
            onChange={(e) => setSubChannel(e.target.value)}
            placeholder="e.g., Facebook, Google Ads"
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as CampaignStatus)}
            required
          >
            <option value="DRAFT">Draft</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="ARCHIVED">Archived</option>
          </Select>
          <Input
            label="Launch Date"
            type="date"
            value={launchDate}
            onChange={(e) => setLaunchDate(e.target.value)}
            min={startDate}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
          />
        </div>
      </div>

      {/* Budget */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Budget</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Total Budget"
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            min={0}
            step="0.01"
            required
          />
          <Select
            label="Budget Type"
            value={budgetType}
            onChange={(e) => setBudgetType(e.target.value as BudgetType)}
            required
          >
            <option value="DAILY">Daily</option>
            <option value="LIFETIME">Lifetime</option>
            <option value="CUSTOM">Custom</option>
          </Select>
          {budgetType === 'DAILY' && (
            <Input
              label="Daily Budget"
              type="number"
              value={dailyBudget}
              onChange={(e) => setDailyBudget(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0.00"
              min={0}
              step="0.01"
            />
          )}
          <Select
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
          </Select>
        </div>
        <Input
          label="Amount Spent"
          type="number"
          value={spent}
          onChange={(e) => setSpent(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="0.00"
          min={0}
          step="0.01"
        />
      </div>

      {/* Targeting */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Targeting</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Textarea
            label="Target Audience"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="Audience description"
            rows={2}
          />
          <Input
            label="Target Demographics"
            value={targetDemographics}
            onChange={(e) => setTargetDemographics(e.target.value)}
            placeholder="Age, gender, etc."
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Target Locations"
            value={targetLocations}
            onChange={(e) => setTargetLocations(e.target.value)}
            placeholder="Location1, Location2 (comma-separated)"
          />
          <Input
            label="Target Interests"
            value={targetInterests}
            onChange={(e) => setTargetInterests(e.target.value)}
            placeholder="Interest1, Interest2 (comma-separated)"
          />
        </div>
        <Input
          label="Target Keywords"
          value={targetKeywords}
          onChange={(e) => setTargetKeywords(e.target.value)}
          placeholder="Keyword1, Keyword2 (comma-separated)"
        />
      </div>

      {/* Bidding & Optimization */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Bidding & Optimization</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Select
            label="Bidding Strategy"
            value={biddingStrategy}
            onChange={(e) => setBiddingStrategy(e.target.value as BiddingStrategy)}
          >
            <option value="">Select strategy</option>
            <option value="CPC">CPC (Cost Per Click)</option>
            <option value="CPM">CPM (Cost Per Mille)</option>
            <option value="CPA">CPA (Cost Per Acquisition)</option>
            <option value="CPV">CPV (Cost Per View)</option>
            <option value="AUTOMATIC">Automatic</option>
            <option value="MANUAL">Manual</option>
          </Select>
          <Input
            label="Cost Per Click (CPC)"
            type="number"
            value={costPerClick}
            onChange={(e) => setCostPerClick(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            min={0}
            step="0.01"
          />
          <Input
            label="Cost Per Mille (CPM)"
            type="number"
            value={costPerMille}
            onChange={(e) => setCostPerMille(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            min={0}
            step="0.01"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Cost Per Acquisition (CPA)"
            type="number"
            value={costPerAcquisition}
            onChange={(e) => setCostPerAcquisition(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            min={0}
            step="0.01"
          />
          <Input
            label="Target CPA"
            type="number"
            value={targetCpa}
            onChange={(e) => setTargetCpa(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            min={0}
            step="0.01"
          />
        </div>
      </div>

      {/* Performance Metrics - Impressions & Engagement */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Performance Metrics - Impressions & Engagement</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Impressions"
            type="number"
            value={impressions}
            onChange={(e) => setImpressions(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
          />
          <Input
            label="Clicks"
            type="number"
            value={clicks}
            onChange={(e) => setClicks(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
          />
          <Input
            label="Unique Clicks"
            type="number"
            value={uniqueClicks}
            onChange={(e) => setUniqueClicks(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
          />
          <Input
            label="Reach"
            type="number"
            value={reach}
            onChange={(e) => setReach(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
          />
        </div>
      </div>

      {/* Performance Metrics - Conversions */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Performance Metrics - Conversions</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Leads"
            type="number"
            value={leads}
            onChange={(e) => setLeads(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
          />
          <Input
            label="Conversions"
            type="number"
            value={conversions}
            onChange={(e) => setConversions(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
          />
          <Select
            label="Conversion Type"
            value={conversionType}
            onChange={(e) => setConversionType(e.target.value as ConversionType)}
          >
            <option value="">Select type</option>
            <option value="PURCHASE">Purchase</option>
            <option value="SIGNUP">Signup</option>
            <option value="DOWNLOAD">Download</option>
            <option value="FORM_SUBMIT">Form Submit</option>
            <option value="CALL">Call</option>
            <option value="VISIT">Visit</option>
            <option value="OTHER">Other</option>
          </Select>
          <Input
            label="Revenue"
            type="number"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            min={0}
            step="0.01"
          />
        </div>
      </div>

      {/* Performance Metrics - Engagement */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Performance Metrics - Engagement</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Likes"
            type="number"
            value={likes}
            onChange={(e) => setLikes(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
          />
          <Input
            label="Shares"
            type="number"
            value={shares}
            onChange={(e) => setShares(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
          />
          <Input
            label="Comments"
            type="number"
            value={comments}
            onChange={(e) => setComments(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
          />
          <Input
            label="Video Views"
            type="number"
            value={videoViews}
            onChange={(e) => setVideoViews(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Email Opens"
            type="number"
            value={emailOpens}
            onChange={(e) => setEmailOpens(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
          />
          <Input
            label="Email Clicks"
            type="number"
            value={emailClicks}
            onChange={(e) => setEmailClicks(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
          />
        </div>
      </div>

      {/* Campaign Details */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Campaign Details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Campaign URL"
            type="url"
            value={campaignUrl}
            onChange={(e) => setCampaignUrl(e.target.value)}
            placeholder="https://example.com/landing-page"
          />
          <Input
            label="Call to Action"
            value={callToAction}
            onChange={(e) => setCallToAction(e.target.value)}
            placeholder="Buy Now, Sign Up, etc."
          />
        </div>
        <Textarea
          label="Ad Copy"
          value={adCopy}
          onChange={(e) => setAdCopy(e.target.value)}
          placeholder="Ad text/content"
          rows={3}
        />
        <Input
          label="Creative Assets"
          value={creativeAssets}
          onChange={(e) => setCreativeAssets(e.target.value)}
          placeholder="URL1, URL2 (comma-separated)"
        />
      </div>

      {/* Assignment */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Assignment</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Campaign Manager"
            value={campaignManager}
            onChange={(e) => setCampaignManager(e.target.value)}
            placeholder="Manager name"
          />
          <Input
            label="Assigned To"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            placeholder="Team member name"
          />
          <Input
            label="Team"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            placeholder="Team name"
          />
        </div>
      </div>

      {/* Tracking & Analytics */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Tracking & Analytics</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Tracking Code"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            placeholder="UTM code"
          />
          <Input
            label="Analytics ID"
            value={analyticsId}
            onChange={(e) => setAnalyticsId(e.target.value)}
            placeholder="Google Analytics ID"
          />
          <Input
            label="Pixel ID"
            value={pixelId}
            onChange={(e) => setPixelId(e.target.value)}
            placeholder="Facebook Pixel ID"
          />
        </div>
      </div>

      {/* Goals & KPIs */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Goals & KPIs</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Target Impressions"
            type="number"
            value={targetImpressions}
            onChange={(e) => setTargetImpressions(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
          />
          <Input
            label="Target Clicks"
            type="number"
            value={targetClicks}
            onChange={(e) => setTargetClicks(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
          />
          <Input
            label="Target Leads"
            type="number"
            value={targetLeads}
            onChange={(e) => setTargetLeads(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Target Conversions"
            type="number"
            value={targetConversions}
            onChange={(e) => setTargetConversions(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
          />
          <Input
            label="Target Revenue"
            type="number"
            value={targetRevenue}
            onChange={(e) => setTargetRevenue(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            min={0}
            step="0.01"
          />
          <Input
            label="Target ROI (%)"
            type="number"
            value={targetRoi}
            onChange={(e) => setTargetRoi(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            min={0}
            step="0.01"
          />
        </div>
      </div>

      {/* A/B Testing */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">A/B Testing</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isAbTest"
              checked={isAbTest}
              onChange={(e) => setIsAbTest(e.target.checked)}
              className="rounded border-slate-300"
            />
            <label htmlFor="isAbTest" className="text-[11px] font-semibold text-slate-800">
              A/B Test Campaign
            </label>
          </div>
          {isAbTest && (
            <Input
              label="A/B Test Variant"
              value={abTestVariant}
              onChange={(e) => setAbTestVariant(e.target.value)}
              placeholder="Variant A, B, C, etc."
            />
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Notes</h3>
        <Textarea
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Campaign notes"
          rows={3}
        />
        <Textarea
          label="Internal Notes"
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          placeholder="Internal notes (confidential)"
          rows={3}
        />
      </div>

      <div className="mt-4 border-t border-slate-200 bg-white pt-3 flex flex-col sm:flex-row justify-end gap-2 sticky bottom-0">
        <Button
          type="button"
          variant="ghost"
          size="md"
          onClick={onCancel}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto">
          {initial ? 'Update Campaign' : 'Create Campaign'}
        </Button>
      </div>
    </form>
  );
}
