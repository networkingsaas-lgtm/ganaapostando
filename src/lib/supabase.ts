import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getRequiredClientEnv } from './env';

let supabaseClient: SupabaseClient | null = null;

export const getSupabaseClient = () => {
  if (supabaseClient) {
    return supabaseClient;
  }

  supabaseClient = createClient(
    getRequiredClientEnv('VITE_SUPABASE_URL'),
    getRequiredClientEnv('VITE_SUPABASE_KEY'),
  );

  return supabaseClient;
};
