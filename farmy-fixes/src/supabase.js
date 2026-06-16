// ─── supabase.js — REST API مباشرة (بدون client library) ───
const SUPABASE_URL = "https://eczbanusmdjfeenttusb.supabase.co";
const SUPABASE_KEY = "sb_publishable_QsfpZIKxlH3WA-nALDXKJw_x44AiHXS";

const headers = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_KEY,
  "Prefer": "return=representation",
};

export const supabase = {
  from: (table) => ({
    select: (cols = "*") => ({
      data: null, error: null,
      then: async (resolve) => {
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${cols}`, { headers });
          const data = await res.json();
          if (!res.ok) resolve({ data: null, error: data });
          else resolve({ data, error: null });
        } catch(e) { resolve({ data: null, error: e }); }
      },
      limit: (n) => ({
        then: async (resolve) => {
          try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${cols}&limit=${n}`, { headers });
            const data = await res.json();
            if (!res.ok) resolve({ data: null, error: data });
            else resolve({ data, error: null });
          } catch(e) { resolve({ data: null, error: e }); }
        }
      })
    }),
    upsert: async (rows, opts = {}) => {
      try {
        const arr = Array.isArray(rows) ? rows : [rows];
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
          method: "POST",
          headers: { ...headers, "Prefer": "resolution=merge-duplicates,return=minimal" },
          body: JSON.stringify(arr),
        });
        if (!res.ok) {
          const err = await res.json();
          return { error: err };
        }
        return { error: null };
      } catch(e) { return { error: e }; }
    },
    insert: async (rows) => {
      try {
        const arr = Array.isArray(rows) ? rows : [rows];
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
          method: "POST",
          headers,
          body: JSON.stringify(arr),
        });
        if (!res.ok) {
          const err = await res.json();
          return { error: err };
        }
        return { data: await res.json(), error: null };
      } catch(e) { return { error: e }; }
    },
    delete: () => ({
      eq: async (col, val) => {
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${col}=eq.${val}`, {
            method: "DELETE", headers,
          });
          return { error: res.ok ? null : await res.json() };
        } catch(e) { return { error: e }; }
      }
    }),
  }),
};

// دالة اختبار الاتصال
export async function testConnection() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?select=id&limit=1`, { headers });
    console.log("Connection test status:", res.status);
    return res.ok;
  } catch(e) {
    console.error("Connection failed:", e.message);
    return false;
  }
}
