import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://eczbanusmdjfeenttusb.supabase.co";
const SUPABASE_KEY = "sb_publishable_QsfpZIKxlH3WA-nALDXKJw_x44AiHXS";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ✅ دالة اختبار الاتصال
export async function testConnection() {
  try {
    const { data, error } = await supabase.from("expenses").select("id").limit(1);
    if (error) {
      console.error("Supabase error:", error.message);
      return false;
    }
    console.log("✅ Supabase connected");
    return true;
  } catch(e) {
    console.error("Supabase connection failed:", e);
    return false;
  }
}
