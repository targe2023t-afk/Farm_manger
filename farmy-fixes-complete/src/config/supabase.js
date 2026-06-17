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

export async function getExpenses() {
  const { data, error } = await supabase
    .from('expenses').select('*').order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addExpense(item) {
  const { data, error } = await supabase.from('expenses').insert(item).select();
  if (error) throw error;
  return data;
}

export async function getInventory() {
  const { data, error } = await supabase.from('inventory').select('*').order('item_name');
  if (error) throw error;
  return data;
}

export async function getWorkers() {
  const { data, error } = await supabase.from('workers').select('*').order('name');
  if (error) throw error;
  return data;
}

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
