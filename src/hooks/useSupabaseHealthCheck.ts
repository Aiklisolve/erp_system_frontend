import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type HealthStatus = 'static-demo' | 'connected';

export function useSupabaseHealthCheck() {
  const [status, setStatus] = useState<HealthStatus>('static-demo');

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    const checkHealth = async () => {
      try {
        // Check if backend API is being used (check for API base URL)
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
        const hasBackendApi = apiBaseUrl && apiBaseUrl !== '';
        
        if (hasBackendApi) {
          // If backend API is configured, check if Supabase is also available
          if (!('from' in supabase)) {
            if (isMounted) setStatus('static-demo');
            return;
          }

          const { error } = await supabase.from('health_check').select('*').limit(1);

          if (!isMounted) return;

          if (error) {
            // Backend API available but Supabase not connected
            if (isMounted) setStatus('static-demo');
          } else {
            // Both backend API and Supabase connected
            if (isMounted) setStatus('connected');
          }
        } else {
          // No backend API configured - check Supabase only
          if (!('from' in supabase)) {
            if (isMounted) setStatus('static-demo');
            return;
          }

          const { error } = await supabase.from('health_check').select('*').limit(1);

          if (!isMounted) return;

          if (error) {
            if (isMounted) setStatus('static-demo');
          } else {
            if (isMounted) setStatus('connected');
          }
        }
      } catch {
        if (isMounted) setStatus('static-demo');
      }
    };

    // Initial check
    void checkHealth();

    // Check every 30 seconds to update status
    intervalId = setInterval(() => {
      void checkHealth();
    }, 30000);

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  return { status };
}


