import { useState, useEffect } from 'react';
import { TaskManagement } from '../features/crm/components/TaskManagement';
import type { ErpUser } from '../features/crm/types';
import * as crmApi from '../features/crm/api/crmApi';
import { LoadingState } from '../components/ui/LoadingState';

export function InternalTasksPage() {
  const [employees, setEmployees] = useState<ErpUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await crmApi.listErpUsers();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to load employees:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 sm:py-16">
        <LoadingState label="Loading task management..." size="md" variant="default" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TaskManagement employees={employees} />
    </div>
  );
}

