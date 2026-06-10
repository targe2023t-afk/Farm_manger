// ─── supabase.js ─────────────────────────────────────────
// ضع هذا الملف في نفس مجلد App.jsx
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://eczbanusmdjfeenttusb.supabase.co";
const SUPABASE_KEY = "sb_publishable_QsfpZIKxlH3WA-nALDXKJw_x44AiHXS";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
