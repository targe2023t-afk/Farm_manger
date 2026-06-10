// ─── supabase.js ─────────────────────────────────────────
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://eczbanusmdjfeenttusb.supabase.co";

// ⚠️ المشكلة: الـ key ده غلط — لازم تاخد الـ anon key الصح
// روح: supabase.com → مشروعك → Settings → API
// انسخ "anon public" key (بيبدأ بـ eyJ...)
const SUPABASE_KEY = "ضع_الـ_anon_key_هنا";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
