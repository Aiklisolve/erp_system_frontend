import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
export const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseKey);

export const supabase =
  hasSupabaseConfig
    ? createClient(supabaseUrl as string, supabaseKey as string)
    : // Fallback dummy client shape to avoid runtime crashes when env is missing
      ({} as ReturnType<typeof createClient>);

