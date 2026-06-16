// ─── supabase.js ───
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://eczbanusmdjfeenttusb.supabase.co";
const SUPABASE_KEY = "sb_publishable_QsfpZIKxlH3WA-nALDXKJw_x44AiHXS";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// ─── اختبار الاتصال ───
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('farms')
      .select('id')
      .limit(1);

    if (error) {
      console.error("❌ Connection failed:", error.message);
      return false;
    }
    console.log("✅ Connected to Supabase!");
    return true;
  } catch(e) {
    console.error("❌ Connection error:", e.message);
    return false;
  }
}

// ─── الإنتاج ───
export async function getProduction() {
  const { data, error } = await supabase
    .from('production')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addProduction(item) {
  const { data, error }
