import { useEffect, useState } from 'react';
import type { Report, ReportType, ReportFormat } from '../types';
import * as api from '../api/reportsApi';

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void refresh();
  }, []);

  const refresh = async (params?: {
    report_type?: ReportType;
    status?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    setLoading(true);
    try {
      const data = await api.listReports(params);
      setReports(data);
    } catch (error) {
      console.error('Error refreshing reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generate = async (payload: {
    report_type: ReportType;
    report_name: string;
    description?: string;
    format: ReportFormat;
    start_date?: string;
    end_date?: string;
    filters?: Record<string, any>;
    parameters?: Record<string, any>;
  }) => {
    const generated = await api.generateReport(payload);
    setReports((prev) => [generated, ...prev]);
    return generated;
  };

  const remove = async (id: string) => {
    await api.deleteReport(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const download = async (id: string, format?: ReportFormat) => {
    return await api.downloadReport(id, format);
  };

  return {
    reports,
    loading,
    generate,
    remove,
    download,
    refresh
  };
}

