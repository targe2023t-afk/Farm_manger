import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://eczbanusmdjfeenttusb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjemJhbnVzbWRqZmVlbnR0dXNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNTcyOTQsImV4cCI6MjA5NjYzMzI5NH0.Kd9CttNPY4BkXyF3SA74bWHfat734aEBEytyDrgFfzs";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// ─── TEST CONNECTION ─────────────────────────────
export async function testConnection() {
  try {
    const { error } = await supabase.from('expenses').select('id').limit(1);
    if (error) {
      console.error("Connection failed:", error.message);
      return false;
    }
    console.log("Connected to Supabase!");
    return true;
  } catch(e) {
    console.error("Connection error:", e.message);
    return false;
  }
}

// ─── EXPENSES ────────────────────────────────────
export async function getExpenses() {
  const { data, error } = await supabase
    .from('expenses').select('*').order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function upsertExpense(item) {
  const { data, error } = await supabase
    .from('expenses')
    .upsert(item, { onConflict: 'id' })
    .select();
  if (error) throw error;
  return data;
}

export async function deleteExpense(id) {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
}

// ─── REVENUES ────────────────────────────────────
export async function getRevenues() {
  const { data, error } = await supabase
    .from('revenues').select('*').order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function upsertRevenue(item) {
  const { data, error } = await supabase
    .from('revenues')
    .upsert(item, { onConflict: 'id' })
    .select();
  if (error) throw error;
  return data;
}

export async function deleteRevenue(id) {
  const { error } = await supabase.from('revenues').delete().eq('id', id);
  if (error) throw error;
}

// ─── INVENTORY ───────────────────────────────────
export async function getInventory() {
  const { data, error } = await supabase
    .from('inventory').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function upsertInventory(item) {
  const { data, error } = await supabase
    .from('inventory')
    .upsert(item, { onConflict: 'id' })
    .select();
  if (error) throw error;
  return data;
}

export async function deleteInventory(id) {
  const { error } = await supabase.from('inventory').delete().eq('id', id);
  if (error) throw error;
}

// ─── WORKERS ─────────────────────────────────────
export async function getWorkers() {
  const { data, error } = await supabase
    .from('workers').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function upsertWorker(item) {
  const { data, error } = await supabase
    .from('workers')
    .upsert(item, { onConflict: 'id' })
    .select();
  if (error) throw error;
  return data;
}

export async function deleteWorker(id) {
  const { error } = await supabase.from('workers').delete().eq('id', id);
  if (error) throw error;
}

// ─── USAGE LOG ───────────────────────────────────
export async function getUsageLog() {
  const { data, error } = await supabase
    .from('usage_log').select('*').order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function upsertUsageLog(item) {
  const { data, error } = await supabase
    .from('usage_log')
    .upsert(item, { onConflict: 'id' })
    .select();
  if (error) throw error;
  return data;
}

// ─── USERS (Local Auth System) ───────────────────
// App.jsx uses local auth, but we sync users table to Supabase
export async function getUsers() {
  const { data, error } = await supabase
    .from('users').select('*');
  if (error) throw error;
  return data;
}

export async function upsertUser(item) {
  const { data, error } = await supabase
    .from('users')
    .upsert(item, { onConflict: 'id' })
    .select();
  if (error) throw error;
  return data;
}

// ─── BATCH SYNC (for autoSync in App.jsx) ────────
export async function syncTable(tableName, rows) {
  if (!rows || rows.length === 0) return [];
  const { data, error } = await supabase
    .from(tableName)
    .upsert(rows, { onConflict: 'id', ignoreDuplicates: false });
  if (error) throw error;
  return data;
}

// ─── FETCH ALL TABLES (for initial load) ─────────
export async function fetchAllData() {
  const [
    { data: expenses, error: e1 },
    { data: revenues, error: e2 },
    { data: inventory, error: e3 },
    { data: workers, error: e4 },
    { data: usageLog, error: e5 },
    { data: users, error: e6 }
  ] = await Promise.all([
    supabase.from('expenses').select('*'),
    supabase.from('revenues').select('*'),
    supabase.from('inventory').select('*'),
    supabase.from('workers').select('*'),
    supabase.from('usage_log').select('*'),
    supabase.from('users').select('*')
  ]);

  if (e1) throw new Error(`expenses: ${e1.message}`);
  if (e2) throw new Error(`revenues: ${e2.message}`);
  if (e3) throw new Error(`inventory: ${e3.message}`);
  if (e4) throw new Error(`workers: ${e4.message}`);
  if (e5) throw new Error(`usage_log: ${e5.message}`);
  if (e6) throw new Error(`users: ${e6.message}`);

  return { expenses, revenues, inventory, workers, usageLog, users };
}

// ─── LEGACY AUTH (Not used in App.jsx - kept for compatibility) ───
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
