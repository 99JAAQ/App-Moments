import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!cached) {
    cached = createClient(
      process.env.SUPABASE_URL ?? "https://placeholder.supabase.co",
      process.env.SUPABASE_ANON_KEY ?? "placeholder-key"
    );
  }
  return cached;
}

export interface DbCard {
  id: string;
  title: string;
  subtitle: string;
  message: string;
  unlocked: boolean;
  unlock_date: string;
  type: string;
  emoji: string;
  image: string;
}
