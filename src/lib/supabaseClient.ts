import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

function isConfigured(): boolean {
  const importMeta: any = (import.meta as any);
  const url = importMeta?.env?.VITE_SUPABASE_URL || (typeof process !== "undefined" ? (process as any)?.env?.VITE_SUPABASE_URL : undefined);
  const key = importMeta?.env?.VITE_SUPABASE_ANON_KEY || (typeof process !== "undefined" ? (process as any)?.env?.VITE_SUPABASE_ANON_KEY : undefined);
  return Boolean(url && key);
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isConfigured()) return null;
  if (supabaseClient) return supabaseClient;
  const importMeta: any = (import.meta as any);
  const url = importMeta.env.VITE_SUPABASE_URL;
  const key = importMeta.env.VITE_SUPABASE_ANON_KEY;
  supabaseClient = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return supabaseClient;
}

export function isSupabaseAvailable(): boolean {
  return getSupabaseClient() !== null;
}
