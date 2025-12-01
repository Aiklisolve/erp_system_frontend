export type KPI = { label: string; value: string; trend?: 'up' | 'down' | 'flat' };

export type ERPModule = {
  id: number;
  slug: string;
  name: string;
  icon: string;
  shortDescription: string;
  description: string;
  keyFeatures: string[];
  sampleKPIs: KPI[];
};

export type ModuleRecordStatus = 'draft' | 'open' | 'in-progress' | 'closed';

export type ModuleRecord = {
  id: string;
  moduleSlug: string;
  title: string;
  reference?: string;
  amount?: number;
  status: ModuleRecordStatus;
  date: string;
  notes?: string;
};


