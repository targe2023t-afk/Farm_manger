// src/config/supabase.js
import { createClient } from '@supabase/supabase-js';

// ─── CONFIGURATION ───────────────────────────────
const SUPABASE_URL = "https://eczbanusmdjfeenttusb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjemJhbnVzbWRqZmVlbnR0dXNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNTcyOTQsImV4cCI6MjA5NjYzMzI5NH0.Kd9CttNPY4BkXyF3SA74bWHfat734aEBEytyDrgFfzs";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'farmy-app'
    }
  }
});

// ─── TEST CONNECTION ─────────────────────────────
export async function testConnection() {
  try {
    const { error } = await supabase.from('expenses').select('id').limit(1);
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

// ─── FARM-BASED FILTERING ────────────────────────
// Get current user's farmId from localStorage
function getCurrentFarmId() {
  try {
    const userData = localStorage.getItem('fmv6_user');
    if (!userData) return null;
    const user = JSON.parse(userData);
    return user?.id || user?.farmId || null;
  } catch {
    return null;
  }
}

// ─── EXPENSES ────────────────────────────────────
export async function getExpenses(farmId = null) {
  const targetFarmId = farmId || getCurrentFarmId();
  
  let query = supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false });
  
  // Filter by farmId if provided
  if (targetFarmId) {
    query = query.eq('farmId', targetFarmId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function upsertExpense(item) {
  // Ensure farmId is set
  const farmId = item.farmId || getCurrentFarmId();
  const itemWithFarm = { ...item, farmId };
  
  const { data, error } = await supabase
    .from('expenses')
    .upsert(itemWithFarm, { onConflict: 'id' })
    .select();
  if (error) throw error;
  return data;
}

export async function deleteExpense(id) {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
}

// ─── REVENUES ────────────────────────────────────
export async function getRevenues(farmId = null) {
  const targetFarmId = farmId || getCurrentFarmId();
  
  let query = supabase
    .from('revenues')
    .select('*')
    .order('date', { ascending: false });
  
  if (targetFarmId) {
    query = query.eq('farmId', targetFarmId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function upsertRevenue(item) {
  const farmId = item.farmId || getCurrentFarmId();
  const itemWithFarm = { ...item, farmId };
  
  const { data, error } = await supabase
    .from('revenues')
    .upsert(itemWithFarm, { onConflict: 'id' })
    .select();
  if (error) throw error;
  return data;
}

export async function deleteRevenue(id) {
  const { error } = await supabase.from('revenues').delete().eq('id', id);
  if (error) throw error;
}

// ─── INVENTORY ───────────────────────────────────
export async function getInventory(farmId = null) {
  const targetFarmId = farmId || getCurrentFarmId();
  
  let query = supabase
    .from('inventory')
    .select('*')
    .order('name');
  
  if (targetFarmId) {
    query = query.eq('farmId', targetFarmId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function upsertInventory(item) {
  const farmId = item.farmId || getCurrentFarmId();
  const itemWithFarm = { ...item, farmId };
  
  const { data, error } = await supabase
    .from('inventory')
    .upsert(itemWithFarm, { onConflict: 'id' })
    .select();
  if (error) throw error;
  return data;
}

export async function deleteInventory(id) {
  const { error } = await supabase.from('inventory').delete().eq('id', id);
  if (error) throw error;
}

// ─── WORKERS ─────────────────────────────────────
export async function getWorkers(farmId = null) {
  const targetFarmId = farmId || getCurrentFarmId();
  
  let query = supabase
    .from('workers')
    .select('*')
    .order('name');
  
  if (targetFarmId) {
    query = query.eq('farmId', targetFarmId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function upsertWorker(item) {
  const farmId = item.farmId || getCurrentFarmId();
  const itemWithFarm = { ...item, farmId };
  
  const { data, error } = await supabase
    .from('workers')
    .upsert(itemWithFarm, { onConflict: 'id' })
    .select();
  if (error) throw error;
  return data;
}

export async function deleteWorker(id) {
  const { error } = await supabase.from('workers').delete().eq('id', id);
  if (error) throw error;
}

// ─── USAGE LOG ───────────────────────────────────
export async function getUsageLog(farmId = null) {
  const targetFarmId = farmId || getCurrentFarmId();
  
  let query = supabase
    .from('usage_log')
    .select('*')
    .order('date', { ascending: false });
  
  if (targetFarmId) {
    query = query.eq('farmId', targetFarmId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function upsertUsageLog(item) {
  const farmId = item.farmId || getCurrentFarmId();
  const itemWithFarm = { ...item, farmId };
  
  const { data, error } = await supabase
    .from('usage_log')
    .upsert(itemWithFarm, { onConflict: 'id' })
    .select();
  if (error) throw error;
  return data;
}

// ─── USERS ───────────────────────────────────────
export async function getUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('name');
  if (error) throw error;
  return data || [];
}

export async function getUsersByFarm(farmId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('farmId', farmId)
    .order('name');
  if (error) throw error;
  return data || [];
}

export async function upsertUser(item) {
  const { data, error } = await supabase
    .from('users')
    .upsert(item, { onConflict: 'id' })
    .select();
  if (error) throw error;
  return data;
}

export async function deleteUser(id) {
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) throw error;
}

// ─── BATCH SYNC ──────────────────────────────────
export async function syncTable(tableName, rows) {
  if (!rows || rows.length === 0) return [];
  
  // Ensure all rows have farmId
  const farmId = getCurrentFarmId();
  const rowsWithFarm = rows.map(row => 
    row.farmId ? row : { ...row, farmId }
  );
  
  const { data, error } = await supabase
    .from(tableName)
    .upsert(rowsWithFarm, { onConflict: 'id', ignoreDuplicates: false });
  
  if (error) throw error;
  return data || [];
}

// ─── FETCH ALL DATA (with farm filtering) ────────
export async function fetchAllData(farmId = null) {
  const targetFarmId = farmId || getCurrentFarmId();
  
  try {
    // Build queries with optional farm filtering
    const buildQuery = (table) => {
      let query = supabase.from(table).select('*');
      if (targetFarmId) {
        query = query.eq('farmId', targetFarmId);
      }
      return query;
    };
    
    const [
      { data: expenses, error: e1 },
      { data: revenues, error: e2 },
      { data: inventory, error: e3 },
      { data: workers, error: e4 },
      { data: usageLog, error: e5 },
      { data: users, error: e6 }
    ] = await Promise.all([
      buildQuery('expenses'),
      buildQuery('revenues'),
      buildQuery('inventory'),
      buildQuery('workers'),
      buildQuery('usage_log'),
      supabase.from('users').select('*') // Users: no farm filter
    ]);

    if (e1) throw new Error(`expenses: ${e1.message}`);
    if (e2) throw new Error(`revenues: ${e2.message}`);
    if (e3) throw new Error(`inventory: ${e3.message}`);
    if (e4) throw new Error(`workers: ${e4.message}`);
    if (e5) throw new Error(`usage_log: ${e5.message}`);
    if (e6) throw new Error(`users: ${e6.message}`);

    return { 
      expenses: expenses || [], 
      revenues: revenues || [], 
      inventory: inventory || [], 
      workers: workers || [], 
      usageLog: usageLog || [], 
      users: users || [] 
    };
  } catch (error) {
    console.error('❌ fetchAllData error:', error);
    throw error;
  }
}

// ─── REALTIME SUBSCRIPTIONS ──────────────────────
export function subscribeToTable(tableName, farmId, callback) {
  const channel = supabase
    .channel(`${tableName}-changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: tableName,
        filter: farmId ? `farmId=eq.${farmId}` : undefined
      },
      (payload) => {
        console.log(`📡 ${tableName} change:`, payload);
        callback(payload);
      }
    )
    .subscribe();

  return channel;
}

export function unsubscribe(channel) {
  if (channel) {
    supabase.removeChannel(channel);
  }
}

// ─── AUDIT LOG ───────────────────────────────────
export async function logAudit(entry) {
  const farmId = entry.farmId || getCurrentFarmId();
  const auditEntry = {
    ...entry,
    farmId,
    timestamp: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('audit_log')
    .insert(auditEntry)
    .select();
  
  if (error) console.error('Audit log error:', error);
  return data;
}

export async function getAuditLog(farmId = null, limit = 100) {
  const targetFarmId = farmId || getCurrentFarmId();
  
  let query = supabase
    .from('audit_log')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit);
  
  if (targetFarmId) {
    query = query.eq('farmId', targetFarmId);
  }
  
  const { data, error } = await query;
  if (error) console.error('Get audit log error:', error);
  return data || [];
}

// ─── STATISTICS ──────────────────────────────────
export async function getStatistics(farmId = null) {
  const targetFarmId = farmId || getCurrentFarmId();
  
  try {
    const [expensesData, revenuesData, workersData, inventoryData] = await Promise.all([
      getExpenses(targetFarmId),
      getRevenues(targetFarmId),
      getWorkers(targetFarmId),
      getInventory(targetFarmId)
    ]);

    const totalExpenses = expensesData.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const totalRevenues = revenuesData.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const netProfit = totalRevenues - totalExpenses;
    
    const inventoryValue = inventoryData.reduce(
      (sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.price) || 0), 
      0
    );
    
    const activeWorkers = workersData.filter(w => !w.endDate).length;
    
    return {
      totalExpenses,
      totalRevenues,
      netProfit,
      inventoryValue,
      activeWorkers,
      totalWorkers: workersData.length,
      lowStockItems: inventoryData.filter(
        i => Number(i.minStock) > 0 && Number(i.quantity) <= Number(i.minStock)
      ).length
    };
  } catch (error) {
    console.error('❌ Statistics error:', error);
    throw error;
  }
}

// ─── LEGACY AUTH (Not used - kept for compatibility) ───
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

// ─── EXPORT DEFAULT ──────────────────────────────
export default supabase;
