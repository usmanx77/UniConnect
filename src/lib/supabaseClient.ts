import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  });
}

export const isSupabaseAvailable = (): boolean => supabase !== null;

export const getSupabaseClient = (): SupabaseClient | null => supabase;

// Helper to get current user
export const getCurrentUser = async () => {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data: { user } } = await client.auth.getUser();
  return user;
};

// Helper to get current user's profile
export const getCurrentProfile = async () => {
  const client = getSupabaseClient();
  if (!client) return null;
  const user = await getCurrentUser();
  if (!user) return null;

  const { data } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return data;
};

export { supabase };
