// ─── supabase.js ─────────────────────────────────────────
import { createClient } from "@supabase/supabase-js";

// ⚠️  المشكلة: الـ KEY المستخدمة "sb_publishable_..." مش صح
// المطلوب: الـ "anon public" key من Supabase Dashboard
// اذهب إلى: Project Settings → API → "anon public"
// الشكل الصح يبدأ بـ: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

const SUPABASE_URL = "https://eczbanusmdjfeenttusb.supabase.co";

// ← ضع هنا الـ anon key الصحيح من Supabase Dashboard
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_KEY || "REPLACE_WITH_YOUR_ANON_KEY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// دالة للتحقق إن الاتصال شغال
export async function testConnection() {
  try {
    const { error } = await supabase.from("expenses").select("id").limit(1);
    if (error) {
      console.error("Supabase connection error:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error("Supabase unreachable:", e);
    return false;
  }
}
