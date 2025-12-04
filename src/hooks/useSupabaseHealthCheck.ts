import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type HealthStatus = 'static-demo' | 'connected';

export function useSupabaseHealthCheck() {
  const [status, setStatus] = useState<HealthStatus>('static-demo');

  useEffect(() => {
    let isMounted = true;

    const checkHealth = async () => {
      try {
        // If supabase client is not properly instantiated, this will throw
        // or simply not have the "from" method.
        if (!('from' in supabase)) {
          if (isMounted) setStatus('static-demo');
          return;
        }

        const { error } = await supabase.from('health_check').select('*').limit(1);

        if (!isMounted) return;

        if (error) {
          setStatus('static-demo');
        } else {
          setStatus('connected');
        }
      } catch {
        if (isMounted) setStatus('static-demo');
      }
    };

    void checkHealth();

    return () => {
      isMounted = false;
    };
  }, []);

  return { status };
}


