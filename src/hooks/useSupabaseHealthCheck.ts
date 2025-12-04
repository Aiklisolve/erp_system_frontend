import { useEffect, useState } from 'react';
import { supabase, hasSupabaseConfig, supabaseUrl, supabaseKey } from '../lib/supabaseClient';

type HealthStatus = 'static-demo' | 'connected';

export function useSupabaseHealthCheck() {
  const [status, setStatus] = useState<HealthStatus>('static-demo');

  useEffect(() => {
    let isMounted = true;

    const checkHealth = async () => {
      try {
        // First, check if Supabase config exists
        if (!hasSupabaseConfig || !supabaseUrl || !supabaseKey) {
          console.log('Supabase config missing');
          if (isMounted) setStatus('static-demo');
          return;
        }

        // Check if supabase client is properly instantiated
        if (!('from' in supabase)) {
          console.log('Supabase client not initialized');
          if (isMounted) setStatus('static-demo');
          return;
        }

        console.log('Testing Supabase connection...', { url: supabaseUrl });

        // Try to query the auth users (this should work if connection is valid)
        // We use auth.getSession() which doesn't require any tables to exist
        const { data, error } = await supabase.auth.getSession();

        if (!isMounted) return;

        // If we can call the API without network errors, we're connected
        // Even if there's no session, it means the connection works
        if (error && error.message?.includes('fetch')) {
          // Network error - not connected
          console.log('Network error:', error);
          setStatus('static-demo');
        } else {
          // API responded - we're connected!
          console.log('Supabase connection successful!', { hasSession: !!data?.session });
          setStatus('connected');
        }
      } catch (err) {
        console.error('Supabase health check error:', err);
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


