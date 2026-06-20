// src/App.jsx
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "./config/supabase";
import "./App.css";

// ═══ ICONS ═══
const Icons = {
  home: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
  money: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>,
  cart: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>,
  box: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/></svg>,
  people: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>,
  chart: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>,
  menu: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>,
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  add: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>,
  edit: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>,
  delete: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>,
  close: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>,
  arrow: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>,
  user: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>,
};

// ═══ HELPERS ═══
const genUUID = () => crypto.randomUUID();
const todayStr = () => new Date().toISOString().split("T")[0];
const fmt = (n) => Number(n || 0).toLocaleString("ar-EG");

function ld(k, fb) {
  try {
    const r = localStorage.getItem("fm_" + k);
    return r ? JSON.parse(r) : fb;
  } catch {
    return fb;
  }
}

function sd(k, v) {
  try {
    localStorage.setItem("fm_" + k, JSON.stringify(v));
  } catch {}
}

// ═══ MAIN APP ═══
export default function App() {
  const [user, setUser] = useState(() => ld("user", null));
  const [page, setPage] = useState("home");
  const [expenses, setExpenses] = useState(() => ld("expenses", []));
  const [revenues, setRevenues] = useState(() => ld("revenues", []));
  const [inventory, setInventory] = useState(() => ld("inventory", []));
  const [workers, setWorkers] = useState(() => ld("workers", []));

  useEffect(() => sd("user", user), [user]);
  useEffect(() => sd("expenses", expenses), [expenses]);
  useEffect(() => sd("revenues", revenues), [revenues]);
  useEffect(() => sd("inventory", inventory), [inventory]);
  useEffect(() => sd("workers", workers), [workers]);

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  const farmId = user.id;
  const myExpenses = expenses.filter((e) => e.farmId === farmId);
  const myRevenues = revenues.filter((r) => r.farmId === farmId);
  const myInventory = inventory.filter((i) => i.farmId === farmId);
  const myWorkers = workers.filter((w) => w.farmId === farmId);

  const totalRev = myRevenues.reduce((s, r) => s + Number(r.amount || 0), 0);
  const totalExp = myExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const netProfit = totalRev - totalExp;

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-greeting">مرحباً، {user.name} 👋</div>
            <div className="header-farm">{user.farmName || "مزرعتي"}</div>
          </div>
          <button className="header-menu">{Icons.menu}</button>
        </div>
      </header>

      {/* STATS CARDS */}
      {page === "home" && (
        <section className="stats">
          <div className="stat-card green">
            <div className="stat-icon">{Icons.money}</div>
            <div className="stat-label">الإيرادات</div>
            <div className="stat-value">{fmt(totalRev)}</div>
            <div className="stat-unit">جنيه</div>
          </div>
          <div className="stat-card red">
            <div className="stat-icon">{Icons.cart}</div>
            <div className="stat-label">المصروفات</div>
            <div className="stat-value">{fmt(totalExp)}</div>
            <div className="stat-unit">جنيه</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-icon">{Icons.chart}</div>
            <div className="stat-label">صافي الربح</div>
            <div className="stat-value">{fmt(netProfit)}</div>
            <div className="stat-unit">جنيه</div>
          </div>
          <div className="stat-card orange">
            <div className="stat-icon">{Icons.box}</div>
            <div className="stat-label">المخزون</div>
            <div className="stat-value">{myInventory.length}</div>
            <div className="stat-unit">صنف</div>
          </div>
        </section>
      )}

      {/* CONTENT */}
      <main className="content">
        {page === "home" && <HomePage data={{ expenses: myExpenses, revenues: myRevenues }} />}
        {page === "expenses" && <ExpensesPage data={myExpenses} setData={setExpenses} farmId={farmId} />}
        {page === "revenues" && <RevenuesPage data={myRevenues} setData={setRevenues} farmId={farmId} />}
        {page === "inventory" && <InventoryPage data={myInventory} setData={setInventory} farmId={farmId} />}
        {page === "workers" && <WorkersPage data={myWorkers} setData={setWorkers} farmId={farmId} />}
      </main>

      {/* BOTTOM NAV */}
      <nav className="bottom-nav">
        <button className={`nav-btn ${page === "home" ? "active" : ""}`} onClick={() => setPage("home")}>
          {Icons.home}
          <span>الرئيسية</span>
        </button>
        <button className={`nav-btn ${page === "expenses" ? "active" : ""}`} onClick={() => setPage("expenses")}>
          {Icons.cart}
          <span>مصروفات</span>
        </button>
        <button className="nav-btn-fab">{Icons.add}</button>
        <button className={`nav-btn ${page === "revenues" ? "active" : ""}`} onClick={() => setPage("revenues")}>
          {Icons.money}
          <span>إيرادات</span>
        </button>
        <button className={`nav-btn ${page === "inventory" ? "active" : ""}`} onClick={() => setPage("inventory")}>
          {Icons.box}
          <span>مخزن</span>
        </button>
      </nav>
    </div>
  );
}

// ═══ LOGIN SCREEN ═══
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (username === "admin" && password === "1234") {
      onLogin({
        id: genUUID(),
        name: "المدير",
        farmName: "مزرعة النجاح",
        username: "admin",
      });
    } else {
      alert("خطأ في اسم المستخدم أو كلمة المرور");
    }
  };

  return (
    <div className="login">
      <div className="login-card">
        <div className="login-logo">🌾</div>
        <h1 className="login-title">Farmy</h1>
        <p className="login-subtitle">إدارة ذكية لمزرعتك</p>

        <div className="form-group">
          <label>اسم المستخدم</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" />
        </div>

        <div className="form-group">
          <label>كلمة المرور</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••" onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
        </div>

        <button className="btn-primary" onClick={handleLogin}>
          تسجيل الدخول
        </button>
      </div>
    </div>
  );
}

// ═══ HOME PAGE ═══
function HomePage({ data }) {
  return (
    <div className="page">
      <h2 className="page-title">آخر العمليات</h2>
      {data.expenses.slice(0, 5).map((e) => (
        <div key={e.id} className="list-item">
          <div className="item-icon red">{Icons.cart}</div>
          <div className="item-body">
            <div className="item-name">{e.category}</div>
            <div className="item-date">{e.date}</div>
          </div>
          <div className="item-amount red">-{fmt(e.amount)}</div>
        </div>
      ))}
    </div>
  );
}

// ═══ EXPENSES PAGE ═══
function ExpensesPage({ data, setData, farmId }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});

  const save = () => {
    const item = { ...form, id: genUUID(), farmId, date: form.date || todayStr() };
    setData((prev) => [...prev, item]);
    setShowModal(false);
    setForm({});
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">المصروفات</h2>
        <button className="btn-add" onClick={() => setShowModal(true)}>
          {Icons.add}
        </button>
      </div>

      {data.map((e) => (
        <div key={e.id} className="list-item">
          <div className="item-icon red">{Icons.cart}</div>
          <div className="item-body">
            <div className="item-name">{e.category}</div>
            <div className="item-date">{e.date}</div>
          </div>
          <div className="item-amount red">-{fmt(e.amount)}</div>
        </div>
      ))}

      {showModal && (
        <Modal title="إضافة مصروف" onClose={() => setShowModal(false)}>
          <div className="form-group">
            <label>النوع</label>
            <input type="text" value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <div className="form-group">
            <label>المبلغ</label>
            <input type="number" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </div>
          <button className="btn-primary" onClick={save}>
            حفظ
          </button>
        </Modal>
      )}
    </div>
  );
}

// ═══ REVENUES PAGE ═══
function RevenuesPage({ data, setData, farmId }) {
  return <div className="page"><h2>الإيرادات</h2></div>;
}

// ═══ INVENTORY PAGE ═══
function InventoryPage({ data }) {
  return <div className="page"><h2>المخزن</h2></div>;
}

// ═══ WORKERS PAGE ═══
function WorkersPage({ data }) {
  return <div className="page"><h2>العمالة</h2></div>;
}

// ═══ MODAL ═══
function Modal({ title, children, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>
            {Icons.close}
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
