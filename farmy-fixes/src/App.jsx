// v6.0 — All 7 features added
import { useState, useEffect, useCallback, useRef } from "react";

// ─── CONSTANTS ───────────────────────────────────────────
const EXP_TYPES    = ["فاتورة","كهرباء","وقود","صيانة","عمالة","سماد","مبيدات","ري","إيجار","أخرى"];
const REV_TYPES    = ["قمح","ذرة","طماطم","بطاطس","بصل","خضروات","فاكهة","أخرى"];
const INV_TYPES    = ["سماد","مبيد","بذور","محروقات","أدوات","أخرى"];
const EXPENSE_ICONS= {"فاتورة":"🧾","كهرباء":"⚡","وقود":"⛽","صيانة":"🔧","عمالة":"👷","سماد":"🌱","مبيدات":"🧴","ري":"💧","إيجار":"🏠","أخرى":"📦"};
const REV_ICONS    = {"قمح":"🌾","ذرة":"🌽","طماطم":"🍅","بطاطس":"🥔","بصل":"🧅","خضروات":"🥦","فاكهة":"🍎","أخرى":"📦"};
const INV_ICONS    = {"سماد":"🌱","مبيد":"🧴","بذور":"🌰","محروقات":"⛽","أدوات":"🔧","أخرى":"📦"};
const PAGE_KEYS    = ["dashboard","expenses","revenue","inventory","workers","reports"];
const API_BASE     = "https://your-api-server.com/api"; // ← غيّر هذا للسيرفر الحقيقي

function ld(k,fb){ try{ const r=localStorage.getItem("fmv6_"+k); return r?JSON.parse(r):fb; }catch{ return fb; } }
function sd(k,v){ try{ localStorage.setItem("fmv6_"+k,JSON.stringify(v)); }catch{} }
function todayStr(){ return new Date().toISOString().split("T")[0]; }
function todayAr(){
  const d=new Date();
  const days=["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
  const months=["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
function fmt(n){ return Number(n||0).toLocaleString("ar-EG"); }
function daysBetween(a,b){ if(!a) return 0; return Math.max(0,Math.floor((new Date(b||new Date())-new Date(a))/86400000)+1); }
function defPerms(){ return {pages:[...PAGE_KEYS],canEdit:[...PAGE_KEYS],canDelete:[...PAGE_KEYS]}; }

// ─── CSS ─────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;900&display=swap');
:root{--green:#1a7a3c;--green2:#22963f;--green3:#e8f5ec;--green4:#c8e6d0;--red:#e53935;--red2:#fff0f0;--orange:#f57c00;--orange2:#fff8f0;--text:#1a1a1a;--text2:#555;--text3:#999;--bg:#f4f6f8;--white:#fff;--border:#e8eaed;--shadow:0 2px 12px rgba(0,0,0,.08);--r:14px;--r2:10px;}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
html,body,#root{height:100%;background:var(--bg);overflow:hidden;}
body{font-family:'Cairo',sans-serif;direction:rtl;color:var(--text);}
.app{display:flex;flex-direction:column;height:100vh;max-width:430px;margin:0 auto;background:var(--bg);position:relative;overflow:hidden;}
.top{background:var(--green);padding:14px 18px 18px;flex-shrink:0;}
.top-row1{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;}
.farm-name{font-size:17px;font-weight:700;color:#fff;}
.top-icon{width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;}
.top-date{font-size:12px;color:rgba(255,255,255,.8);}
.date-badge{background:rgba(255,255,255,.15);border-radius:20px;padding:4px 10px;display:inline-flex;align-items:center;gap:5px;}
.page-top{background:var(--green);padding:16px 18px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
.page-title{font-size:18px;font-weight:700;color:#fff;}
.back-btn{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;color:#fff;font-size:18px;}
.cnt{flex:1;overflow-y:auto;overflow-x:hidden;padding-bottom:80px;}
.cnt::-webkit-scrollbar{display:none;}
.bnav{position:absolute;bottom:0;left:0;right:0;background:var(--white);border-top:1px solid var(--border);display:flex;align-items:stretch;height:68px;z-index:100;box-shadow:0 -2px 12px rgba(0,0,0,.08);}
.bni{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;cursor:pointer;border:none;background:transparent;color:var(--text3);font-family:'Cairo',sans-serif;font-size:11px;font-weight:600;transition:all .2s;padding:6px 2px;}
.bni.on{color:var(--green);}
.bni-dot{width:4px;height:4px;border-radius:50%;background:var(--green);margin-top:1px;}
.stats-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:14px 14px 0;}
.stat-card{background:var(--white);border-radius:var(--r);padding:14px;box-shadow:var(--shadow);}
.stat-label{font-size:11px;color:var(--text3);margin-bottom:4px;font-weight:600;}
.stat-value{font-size:22px;font-weight:900;color:var(--text);}
.stat-value.green{color:var(--green);}
.stat-value.red{color:var(--red);}
.stat-value.blue{color:#1565c0;}
.stat-sub{font-size:11px;color:var(--text3);margin-top:2px;}
.stat-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:8px;}
.si-g{background:var(--green3);}
.si-r{background:var(--red2);}
.si-b{background:#e3f2fd;}
.si-o{background:var(--orange2);}
.section{padding:12px 14px 0;}
.section-title{font-size:14px;font-weight:700;color:var(--text);margin-bottom:10px;}
.summary-card{background:var(--white);border-radius:var(--r);padding:14px;box-shadow:var(--shadow);}
.sum-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);}
.sum-row:last-child{border-bottom:none;}
.sum-label{font-size:13px;color:var(--text2);display:flex;align-items:center;gap:8px;}
.sum-value{font-size:13px;font-weight:700;}
.sum-value.g{color:var(--green);}
.sum-value.r{color:var(--red);}
.sum-value.b{color:#1565c0;}
.alert-card{background:var(--white);border-radius:var(--r);padding:12px 14px;box-shadow:var(--shadow);}
.alert-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);}
.alert-row:last-child{border-bottom:none;}
.alert-name{font-size:13px;font-weight:600;}
.alert-badge{font-size:11px;color:var(--red);font-weight:700;}
.add-btn-full{margin:14px;background:var(--green);color:#fff;border:none;border-radius:var(--r2);padding:14px;width:calc(100% - 28px);font-family:'Cairo',sans-serif;font-size:15px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 15px rgba(26,122,60,.3);transition:all .2s;}
.add-btn-full:hover{background:var(--green2);}
.form-card{margin:0 14px;background:var(--white);border-radius:var(--r);padding:16px;box-shadow:var(--shadow);}
.frow{margin-bottom:12px;}
.flbl{font-size:12px;font-weight:700;color:var(--text2);margin-bottom:5px;}
.finp{width:100%;padding:11px 13px;border:1.5px solid var(--border);border-radius:var(--r2);font-family:'Cairo',sans-serif;font-size:14px;color:var(--text);background:var(--bg);outline:none;transition:border-color .2s;}
.finp:focus{border-color:var(--green);}
.finp.ro{background:#f0f0f0;color:var(--text3);}
.frow2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;}
.save-btn{width:100%;background:var(--green);color:#fff;border:none;border-radius:var(--r2);padding:13px;font-family:'Cairo',sans-serif;font-size:15px;font-weight:700;cursor:pointer;margin-top:4px;box-shadow:0 4px 12px rgba(26,122,60,.25);}
.save-btn:hover{background:var(--green2);}
.list-items{padding:0 14px;}
.list-item{background:var(--white);border-radius:var(--r2);padding:12px 14px;margin-bottom:8px;box-shadow:var(--shadow);display:flex;align-items:center;gap:12px;}
.li-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}
.li-body{flex:1;}
.li-title{font-size:14px;font-weight:700;color:var(--text);}
.li-sub{font-size:11px;color:var(--text3);margin-top:2px;}
.li-right{text-align:start;}
.li-amount{font-size:15px;font-weight:900;}
.li-date{font-size:11px;color:var(--text3);margin-top:2px;}
.li-actions{display:flex;gap:6px;}
.inv-item{background:var(--white);border-radius:var(--r);padding:14px;margin:0 14px 10px;box-shadow:var(--shadow);}
.inv-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;}
.inv-name{font-size:15px;font-weight:700;}
.inv-pkg{font-size:11px;color:var(--text3);margin-top:2px;}
.inv-rows{display:grid;grid-template-columns:1fr 1fr;gap:6px;}
.inv-row{background:var(--bg);border-radius:8px;padding:8px 10px;}
.inv-row-l{font-size:11px;color:var(--text3);margin-bottom:2px;}
.inv-row-v{font-size:13px;font-weight:700;}
.inv-row-v.ok{color:var(--green);}
.inv-row-v.warn{color:var(--red);}
.use-btn{background:var(--green3);color:var(--green);border:none;border-radius:8px;padding:6px 12px;font-family:'Cairo',sans-serif;font-size:12px;font-weight:700;cursor:pointer;}
.worker-item{background:var(--white);border-radius:var(--r2);padding:12px 14px;margin:0 14px 8px;display:flex;align-items:center;gap:12px;box-shadow:var(--shadow);}
.w-avatar{width:42px;height:42px;border-radius:50%;background:var(--green3);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}
.w-name{font-size:14px;font-weight:700;}
.w-daily{font-size:12px;color:var(--text3);margin-top:2px;}
.w-badge{padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;}
.wb-g{background:var(--green3);color:var(--green);}
.wb-r{background:var(--red2);color:var(--red);}
.rep-tabs{display:flex;gap:8px;padding:14px 14px 0;overflow-x:auto;}
.rep-tab{padding:8px 16px;border-radius:20px;font-family:'Cairo',sans-serif;font-size:13px;font-weight:700;cursor:pointer;border:none;transition:all .2s;background:var(--white);color:var(--text3);white-space:nowrap;}
.rep-tab.on{background:var(--green);color:#fff;}
.rep-date{margin:10px 14px 0;background:var(--white);border-radius:var(--r2);padding:10px 13px;display:flex;align-items:center;gap:8px;box-shadow:var(--shadow);}
.rep-date input{border:none;background:transparent;font-family:'Cairo',sans-serif;font-size:13px;outline:none;color:var(--text);flex:1;}
.bar-chart{padding:14px;}
.bar-wrap{display:flex;align-items:flex-end;gap:4px;height:130px;background:var(--white);border-radius:var(--r);padding:12px;box-shadow:var(--shadow);}
.bar-group{display:flex;flex-direction:column;align-items:center;gap:2px;flex:1;}
.bar-pair{display:flex;gap:2px;align-items:flex-end;height:100px;}
.bar{border-radius:4px 4px 0 0;width:14px;transition:height .4s ease;}
.bar.g{background:var(--green);}
.bar.r{background:var(--red);}
.bar-label{font-size:9px;color:var(--text3);font-weight:600;}
.modal-ov{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:200;display:flex;align-items:flex-end;}
.modal-box{background:var(--white);border-radius:20px 20px 0 0;padding:20px;width:100%;max-height:88vh;overflow-y:auto;animation:slideUp .25s ease;}
@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
.modal-title{font-size:16px;font-weight:700;margin-bottom:16px;color:var(--text);}
.modal-handle{width:40px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 16px;}
.login-wrap{min-height:100vh;background:var(--green);display:flex;flex-direction:column;}
.login-top{padding:40px 24px 30px;text-align:center;}
.login-title{font-size:26px;font-weight:900;color:#fff;}
.login-sub{font-size:14px;color:rgba(255,255,255,.75);margin-top:4px;}
.login-card{background:var(--white);border-radius:24px 24px 0 0;flex:1;padding:28px 22px;}
.login-tabs{display:flex;gap:0;margin-bottom:22px;background:var(--bg);border-radius:12px;padding:4px;}
.login-tab{flex:1;padding:9px;text-align:center;border-radius:9px;cursor:pointer;font-size:14px;font-weight:700;color:var(--text3);transition:all .2s;border:none;background:transparent;font-family:'Cairo',sans-serif;}
.login-tab.on{background:var(--green);color:#fff;}
.err-msg{background:#ffebee;border-radius:8px;padding:10px 12px;color:var(--red);font-size:13px;margin-bottom:14px;}
.ok-msg{background:var(--green3);border-radius:8px;padding:10px 12px;color:var(--green);font-size:13px;margin-bottom:14px;}
.ibt{width:30px;height:30px;border-radius:8px;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;transition:all .2s;}
.ibt-g{background:var(--green3);color:var(--green);}
.ibt-r{background:var(--red2);color:var(--red);}
.usr-item{background:var(--white);border-radius:var(--r2);padding:12px 14px;margin:0 14px 8px;display:flex;align-items:center;gap:12px;box-shadow:var(--shadow);}
.perm-grid{display:grid;grid-template-columns:1fr 44px 44px 44px;gap:6px 8px;align-items:center;}
.ptoggle{width:36px;height:36px;border-radius:8px;border:none;cursor:pointer;font-size:14px;font-weight:700;transition:all .2s;}
.search-bar{margin:12px 14px 0;background:var(--white);border-radius:var(--r2);padding:10px 14px;display:flex;align-items:center;gap:8px;box-shadow:var(--shadow);}
.search-bar input{border:none;background:transparent;font-family:'Cairo',sans-serif;font-size:14px;outline:none;color:var(--text);flex:1;}
.toast{position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1a1a1a;color:#fff;padding:10px 22px;border-radius:25px;font-size:13px;font-weight:600;z-index:999;white-space:nowrap;animation:tin .3s ease;}
@keyframes tin{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
.restore-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);}
.restore-row:last-child{border-bottom:none;}
.no-data{text-align:center;padding:30px;color:var(--text3);font-size:13px;}
.sync-bar{background:var(--green3);border-bottom:1px solid var(--green4);padding:6px 14px;font-size:12px;color:var(--green);display:flex;align-items:center;gap:6px;flex-shrink:0;}
.audit-item{padding:10px 0;border-bottom:1px solid var(--border);}
.audit-item:last-child{border-bottom:none;}
.audit-user{font-size:12px;font-weight:700;color:var(--green);}
.audit-action{font-size:13px;color:var(--text);}
.audit-change{font-size:11px;color:var(--text3);margin-top:3px;}
.audit-time{font-size:10px;color:var(--text3);}
/* Barcode scanner */
.scan-wrap{margin:10px 14px;background:var(--white);border-radius:var(--r);overflow:hidden;box-shadow:var(--shadow);}
.scan-header{background:var(--green);padding:10px 14px;color:#fff;font-size:13px;font-weight:700;display:flex;justify-content:space-between;align-items:center;}
.scan-video{width:100%;height:200px;object-fit:cover;display:block;}
.scan-overlay{position:relative;}
.scan-line{position:absolute;top:50%;left:10%;right:10%;height:2px;background:var(--green);animation:scanAnim 1.5s ease-in-out infinite;}
@keyframes scanAnim{0%{top:20%}50%{top:80%}100%{top:20%}}
`;

// ─── ICONS ───────────────────────────────────────────────
const Nav = {
  home:<svg viewBox="0 0 24 24" fill="currentColor" style={{width:22,height:22}}><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
  exp:<svg viewBox="0 0 24 24" fill="currentColor" style={{width:22,height:22}}><path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7.8 14h9.2c.8 0 1.4-.4 1.7-1l4-7.2A1 1 0 0021.8 4H5.2L4 1H1v2h2l3.6 7.6L5 13c-.5 1 .2 2 1.2 2H20v-2H7.8z"/></svg>,
  rev:<svg viewBox="0 0 24 24" fill="currentColor" style={{width:22,height:22}}><path d="M3.5 18.5l6-6 4 4L22 6.92 20.59 5.5l-7.09 8-4-4L2 17z"/></svg>,
  inv:<svg viewBox="0 0 24 24" fill="currentColor" style={{width:22,height:22}}><path d="M19 3H5c-1.1 0-2 .9-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>,
  wrk:<svg viewBox="0 0 24 24" fill="currentColor" style={{width:22,height:22}}><path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>,
  rep:<svg viewBox="0 0 24 24" fill="currentColor" style={{width:22,height:22}}><path d="M19 3H5c-1.1 0-2 .9-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>,
  cal:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  bell:<svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" style={{width:18,height:18}}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  scan:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><path d="M3 9V5a2 2 0 012-2h4M15 3h4a2 2 0 012 2v4M21 15v4a2 2 0 01-2 2h-4M9 21H5a2 2 0 01-2-2v-4"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  logout:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

// ─── AUDIT LOG helper ─────────────────────────────────────
function createAuditEntry(user, action, entity, oldVal, newVal) {
  return {
    id: Date.now() + Math.random(),
    userId: user?.id,
    userName: user?.name || user?.username,
    action, // 'add' | 'edit' | 'delete'
    entity,
    oldVal: oldVal ? JSON.stringify(oldVal) : null,
    newVal: newVal ? JSON.stringify(newVal) : null,
    time: new Date().toLocaleString("ar-EG"),
  };
}

// ─── APP ─────────────────────────────────────────────────
export default function App() {
  const [user,setUser]           = useState(()=>ld("user",null));
  const [page,setPage]           = useState("dashboard");
  const [toast,setToast]         = useState(null);
  const [syncStatus,setSyncStatus] = useState("local"); // 'local'|'syncing'|'synced'|'error'

  const [users,setUsers]         = useState(()=>ld("users",[
    {id:1,username:"admin",password:"1234",role:"admin",name:"المدير العام",phone:"",status:"active"},
    {id:2,username:"ahmed",password:"1234",role:"manager",name:"أحمد محمد",phone:"",status:"active",createdBy:1,permissions:defPerms()},
  ]));
  const [expenses,setExpenses]   = useState(()=>ld("expenses",[]));
  const [revenues,setRevenues]   = useState(()=>ld("revenues",[]));
  const [inventory,setInventory] = useState(()=>ld("inventory",[]));
  const [workers,setWorkers]     = useState(()=>ld("workers",[]));
  const [usageLog,setUsageLog]   = useState(()=>ld("usageLog",[]));
  const [auditLog,setAuditLog]   = useState(()=>ld("auditLog",[]));
  const [trE,setTrE]             = useState(()=>ld("trE",[]));
  const [trR,setTrR]             = useState(()=>ld("trR",[]));
  const [trI,setTrI]             = useState(()=>ld("trI",[]));
  const [trW,setTrW]             = useState(()=>ld("trW",[]));

  useEffect(()=>sd("user",user),[user]);
  useEffect(()=>sd("users",users),[users]);
  useEffect(()=>sd("expenses",expenses),[expenses]);
  useEffect(()=>sd("revenues",revenues),[revenues]);
  useEffect(()=>sd("inventory",inventory),[inventory]);
  useEffect(()=>sd("workers",workers),[workers]);
  useEffect(()=>sd("usageLog",usageLog),[usageLog]);
  useEffect(()=>sd("auditLog",auditLog),[auditLog]);
  useEffect(()=>sd("trE",trE),[trE]);
  useEffect(()=>sd("trR",trR),[trR]);
  useEffect(()=>sd("trI",trI),[trI]);
  useEffect(()=>sd("trW",trW),[trW]);

  const showToast = useCallback(msg=>{ setToast(msg); setTimeout(()=>setToast(null),2200); },[]);

  // Audit helper wrapped with current user
  const audit = useCallback((action,entity,oldV,newV)=>{
    setAuditLog(l=>[createAuditEntry(user,action,entity,oldV,newV),...l].slice(0,500));
  },[user]);

  // ── SERVER SYNC ──
  const syncToServer = useCallback(async()=>{
    if(!API_BASE||API_BASE.includes("your-api-server")){
      showToast("💾 البيانات محفوظة محلياً");
      return;
    }
    setSyncStatus("syncing");
    try {
      const controller = new AbortController();
      const timeout = setTimeout(()=>controller.abort(), 8000);
      const payload = { expenses, revenues, inventory, workers, usageLog, timestamp: Date.now() };
      const res = await fetch(`${API_BASE}/sync`, {
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${ld("token","")}`},
        body:JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if(res.ok){ setSyncStatus("synced"); showToast("✅ تم المزامنة مع السيرفر"); }
      else { setSyncStatus("error"); showToast("⚠️ فشل الاتصال بالسيرفر"); }
    } catch(e){
      setSyncStatus("error");
      if(e.name==="AbortError") showToast("⏱️ انتهت مهلة الاتصال - محفوظ محلياً");
      else showToast("📴 لا يوجد اتصال - البيانات محفوظة محلياً");
    }
    setTimeout(()=>setSyncStatus("local"),3000);
  },[expenses,revenues,inventory,workers,usageLog,showToast]);

  const lowStock  = inventory.filter(i=>Number(i.minStock)>0&&Number(i.quantity)<=Number(i.minStock));
  const perms     = user?.role==="admin"?defPerms():(user?.permissions||defPerms());
  const canE      = pg=>user?.role==="admin"||(perms.canEdit||[]).includes(pg);
  const canD      = pg=>user?.role==="admin"||(perms.canDelete||[]).includes(pg);
  const pPages    = user?.role==="admin"?[...PAGE_KEYS,"users"]:(perms.pages||PAGE_KEYS);

  if(!user) return (
    <><style>{CSS}</style>
      <LoginPage users={users} setUsers={setUsers} onLogin={u=>{ setUser(u); setPage("dashboard"); }}/>
    </>
  );

  const NAV = [
    {k:"dashboard",ic:Nav.home,l:"الرئيسية"},
    {k:"expenses",ic:Nav.exp,l:"المصروفات"},
    {k:"revenue",ic:Nav.rev,l:"الإيرادات"},
    {k:"inventory",ic:Nav.inv,l:"المخزن"},
    {k:"workers",ic:Nav.wrk,l:"العمالة"},
    {k:"reports",ic:Nav.rep,l:"التقارير"},
  ].filter(n=>pPages.includes(n.k));

  return (
    <><style>{CSS}</style>
    <div className="app" dir="rtl">
      {/* SYNC BAR */}
      {syncStatus==="syncing"&&<div className="sync-bar">🔄 جاري المزامنة مع السيرفر...</div>}
      {syncStatus==="synced" &&<div className="sync-bar">✅ تمت المزامنة بنجاح</div>}
      {syncStatus==="error"  &&<div className="sync-bar" style={{background:"#ffebee",color:"var(--red)",cursor:"pointer"}} onClick={syncToServer}>⚠️ تعذر الاتصال - اضغط للمحاولة مجدداً</div>}

      {/* TOP */}
      {page==="dashboard"
        ? <div className="top">
            <div className="top-row1">
              <div><div style={{fontSize:12,color:"rgba(255,255,255,.75)"}}>مرحباً 👋</div>
                <div className="farm-name">{user.farmName||"مزرعة الخير"}</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button className="top-icon" onClick={syncToServer} title="مزامنة مع السيرفر">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" style={{width:18,height:18}}><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
                </button>
                <button className="top-icon" onClick={()=>{ setUser(null); }}>{Nav.logout}</button>
              </div>
            </div>
            <div className="top-date">
              <div className="date-badge">{Nav.cal}<span style={{fontSize:12,color:"rgba(255,255,255,.9)"}}>اليوم: {todayAr()}</span></div>
            </div>
          </div>
        : <div className="page-top">
            <button className="back-btn" onClick={()=>setPage("dashboard")}>←</button>
            <div className="page-title">{page==="users"?"إدارة المستخدمين":NAV.find(n=>n.k===page)?.l||page}</div>
            {/* logout in sub-pages */}
            <button style={{width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,.2)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setUser(null)}>{Nav.logout}</button>
          </div>
      }

      {/* CONTENT */}
      <div className="cnt">
        {page==="dashboard" && <DashPage expenses={expenses} revenues={revenues} inventory={inventory} workers={workers} lowStock={lowStock} setPage={setPage}/>}
        {page==="expenses"  && <ExpPage  data={expenses} setData={setExpenses} trash={trE} setTrash={setTrE} canEdit={canE("expenses")} canDel={canD("expenses")} showToast={showToast} audit={audit}/>}
        {page==="revenue"   && <RevPage  data={revenues} setData={setRevenues} trash={trR} setTrash={setTrR} canEdit={canE("revenue")}  canDel={canD("revenue")}  showToast={showToast} audit={audit}/>}
        {page==="inventory" && <InvPage  data={inventory} setData={setInventory} trash={trI} setTrash={setTrI} usageLog={usageLog} setUsageLog={setUsageLog} canEdit={canE("inventory")} canDel={canD("inventory")} showToast={showToast} lowStock={lowStock} audit={audit}/>}
        {page==="workers"   && <WrkPage  data={workers} setData={setWorkers} trash={trW} setTrash={setTrW} canEdit={canE("workers")} canDel={canD("workers")} showToast={showToast} audit={audit}/>}
        {page==="reports"   && <RepPage  expenses={expenses} revenues={revenues} workers={workers} inventory={inventory} auditLog={auditLog} users={users}/>}
        {page==="users"     && user.role==="admin" && <UsrPage users={users} setUsers={setUsers} currentUser={user} showToast={showToast} audit={audit}/>}
      </div>

      {/* BOTTOM NAV */}
      <div className="bnav">
        {NAV.slice(0,4).map(n=>(
          <button key={n.k} className={`bni ${page===n.k?"on":""}`} onClick={()=>setPage(n.k)}>
            {n.ic}<span>{n.l}</span>{page===n.k&&<div className="bni-dot"/>}
          </button>
        ))}
        <button className={`bni ${page==="reports"?"on":""}`} onClick={()=>setPage("reports")}>
          {Nav.rep}<span>التقارير</span>{page==="reports"&&<div className="bni-dot"/>}
        </button>
        {user?.role==="admin"&&(
          <button className={`bni ${page==="users"?"on":""}`} onClick={()=>setPage("users")}>
            <svg viewBox="0 0 24 24" fill="currentColor" style={{width:22,height:22}}><path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            <span>المستخدمون</span>{page==="users"&&<div className="bni-dot"/>}
          </button>
        )}
      </div>

      {toast&&<div className="toast">{toast}</div>}
    </div>
    </>
  );
}

// ─── LOGIN ───────────────────────────────────────────────
function LoginPage({users,setUsers,onLogin}) {
  const [tab,setTab]=useState("login");
  const [f,setF]=useState({});
  const [err,setErr]=useState("");
  const [ok,setOk]=useState("");
  const s=(k,v)=>setF(x=>({...x,[k]:v}));

  const doLogin=()=>{
    const u=users.find(x=>x.username===f.username&&x.password===f.password&&x.status==="active");
    if(u){setErr("");onLogin(u);}else setErr("خطأ في اسم المستخدم أو كلمة المرور");
  };
  const doReg=()=>{
    if(!f.username||!f.password||!f.fullName){setErr("يرجى ملء الحقول المطلوبة");return;}
    if(f.password!==f.confirmPassword){setErr("كلمة المرور غير متطابقة");return;}
    if(users.find(u=>u.username===f.username)){setErr("اسم المستخدم موجود بالفعل");return;}
    setUsers(u=>[...u,{id:Date.now(),username:f.username,password:f.password,name:f.fullName,phone:f.phone||"",farmName:f.farmName||"",role:"manager",status:"active",permissions:defPerms()}]);
    setOk("تم إنشاء الحساب بنجاح");setErr("");
    setTimeout(()=>{setOk("");setTab("login");setF({username:f.username,password:f.password});},1400);
  };

  return (
    <div className="login-wrap" dir="rtl" style={{fontFamily:"'Cairo',sans-serif"}}>
      <style>{CSS}</style>
      <div className="login-top">
        <div style={{fontSize:50,marginBottom:8}}>🌾</div>
        <div className="login-title">نظام إدارة المزرعة</div>
        <div className="login-sub">إدارة ذكية لمزرعتك الزراعية</div>
      </div>
      <div className="login-card">
        <div className="login-tabs">
          <button className={`login-tab ${tab==="login"?"on":""}`} onClick={()=>{setTab("login");setErr("");setOk("");}}>تسجيل دخول</button>
          <button className={`login-tab ${tab==="reg"?"on":""}`} onClick={()=>{setTab("reg");setErr("");setOk("");}}>حساب جديد</button>
        </div>
        {err&&<div className="err-msg">{err}</div>}
        {ok&&<div className="ok-msg">{ok}</div>}
        {tab==="login"?(
          <>
            <div className="frow"><div className="flbl">اسم المستخدم</div><input className="finp" value={f.username||""} onChange={e=>s("username",e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()}/></div>
            <div className="frow"><div className="flbl">كلمة المرور</div><input className="finp" type="password" value={f.password||""} onChange={e=>s("password",e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()}/></div>
            <button className="save-btn" onClick={doLogin}>تسجيل الدخول</button>
            <div style={{textAlign:"center",marginTop:14,fontSize:12,color:"var(--text3)"}}>🔑 admin/1234</div>
          </>
        ):(
          <>
            <div className="frow2">
              <div><div className="flbl">الاسم الكامل *</div><input className="finp" value={f.fullName||""} onChange={e=>s("fullName",e.target.value)}/></div>
              <div><div className="flbl">الهاتف</div><input className="finp" value={f.phone||""} onChange={e=>s("phone",e.target.value)}/></div>
            </div>
            <div className="frow"><div className="flbl">اسم المزرعة</div><input className="finp" value={f.farmName||""} onChange={e=>s("farmName",e.target.value)}/></div>
            <div className="frow2">
              <div><div className="flbl">اسم المستخدم *</div><input className="finp" value={f.username||""} onChange={e=>s("username",e.target.value)}/></div>
              <div><div className="flbl">كلمة المرور *</div><input className="finp" type="password" value={f.password||""} onChange={e=>s("password",e.target.value)}/></div>
            </div>
            <div className="frow"><div className="flbl">تأكيد كلمة المرور *</div><input className="finp" type="password" value={f.confirmPassword||""} onChange={e=>s("confirmPassword",e.target.value)}/></div>
            <button className="save-btn" onClick={doReg}>إنشاء الحساب</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── BARCODE SCANNER ─────────────────────────────────────
function BarcodeScanner({onScan,onClose}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error,setError] = useState("");
  const [manualCode,setManualCode] = useState("");

  useEffect(()=>{
    let interval;
    async function startCamera(){
      try {
        const stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
        streamRef.current = stream;
        if(videoRef.current){ videoRef.current.srcObject=stream; videoRef.current.play(); }
        // Poll for barcode using BarcodeDetector API if available
        if("BarcodeDetector" in window){
          const detector = new window.BarcodeDetector({formats:["ean_13","ean_8","qr_code","code_128","code_39"]});
          interval = setInterval(async()=>{
            if(videoRef.current){
              try{
                const barcodes = await detector.detect(videoRef.current);
                if(barcodes.length>0){ onScan(barcodes[0].rawValue); stopCamera(); }
              }catch(_){}
            }
          },500);
        }
      } catch(e){ setError("لا يمكن الوصول للكاميرا. تأكد من السماح بالإذن."); }
    }
    const stopCamera=()=>{ if(streamRef.current){ streamRef.current.getTracks().forEach(t=>t.stop()); } clearInterval(interval); };
    startCamera();
    return ()=>{ if(streamRef.current){ streamRef.current.getTracks().forEach(t=>t.stop()); } clearInterval(interval); };
  },[onScan]);

  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}>
        <div className="modal-handle"/>
        <div className="modal-title">📷 مسح الباركود</div>
        {error
          ? <div className="err-msg">{error}</div>
          : <div className="scan-wrap" style={{margin:"0 0 14px"}}>
              <div className="scan-header"><span>وجّه الكاميرا نحو الباركود</span></div>
              <div className="scan-overlay">
                <video ref={videoRef} className="scan-video" muted playsInline/>
                <div className="scan-line"/>
              </div>
            </div>
        }
        <div style={{textAlign:"center",fontSize:12,color:"var(--text3)",marginBottom:12}}>أو أدخل الكود يدوياً</div>
        <div style={{display:"flex",gap:8}}>
          <input className="finp" style={{flex:1}} placeholder="أدخل الباركود..." value={manualCode} onChange={e=>setManualCode(e.target.value)} onKeyDown={e=>e.key==="Enter"&&manualCode&&onScan(manualCode)}/>
          <button className="save-btn" style={{width:"auto",padding:"11px 18px"}} onClick={()=>manualCode&&onScan(manualCode)}>تأكيد</button>
        </div>
        <button style={{width:"100%",marginTop:10,padding:11,background:"var(--bg)",border:"1px solid var(--border)",borderRadius:10,fontFamily:"'Cairo',sans-serif",fontSize:14,cursor:"pointer",color:"var(--text2)"}} onClick={onClose}>إلغاء</button>
      </div>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────
function DashPage({expenses,revenues,inventory,workers,lowStock,setPage}) {
  const todayS  = todayStr();
  const totRev  = revenues.reduce((s,r)=>s+(Number(r.amount)||0),0);
  const totExp  = expenses.reduce((s,e)=>s+(Number(e.amount)||0),0);
  const net     = totRev-totExp;
  const todayExp= expenses.filter(e=>e.date===todayS).reduce((s,e)=>s+(Number(e.amount)||0),0);
  const todayRevItems = revenues.filter(r=>r.date===todayS);
  const todayExpItems = expenses.filter(e=>e.date===todayS);

  return (
    <div>
      <div className="stats-row">
        {[
          {label:"إجمالي الإيرادات",val:totRev,cls:"green",icon:"💰",bg:"si-g"},
          {label:"إجمالي المصروفات",val:totExp,cls:"red",icon:"🛒",bg:"si-r"},
          {label:"صافي الربح",val:Math.abs(net),cls:net>=0?"green":"red",icon:"📈",bg:"si-g"},
          {label:"مشتريات اليوم",val:todayExp,cls:"blue",icon:"🛍️",bg:"si-b"},
        ].map((s,i)=>(
          <div key={i} className="stat-card">
            <div className={`stat-icon ${s.bg}`}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-value ${s.cls}`}>{fmt(s.val)}</div>
            <div className="stat-sub">جنيه</div>
          </div>
        ))}
      </div>
      <div className="section">
        <div className="section-title">ملخص اليوم</div>
        <div className="summary-card">
          <div className="sum-row"><span className="sum-label">💰 إجمالي الإيرادات</span><span className="sum-value g">{fmt(totRev)} جنيه</span></div>
          <div className="sum-row"><span className="sum-label">🛒 إجمالي المصروفات</span><span className="sum-value r">{fmt(totExp)} جنيه</span></div>
          <div className="sum-row"><span className="sum-label">📊 صافي الربح</span><span className={`sum-value ${net>=0?"g":"r"}`}>{fmt(net)} جنيه</span></div>
        </div>
      </div>
      {lowStock.length>0&&(
        <div className="section">
          <div className="section-title">تنبيهات المخزن</div>
          <div className="alert-card">
            {lowStock.map(i=>(
              <div key={i.id} className="alert-row">
                <span className="alert-name">{i.name}</span>
                <span className="alert-badge">⚠️ كمية منخفضة</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {todayRevItems.length>0&&(
        <div className="section">
          <div className="section-title">إيرادات اليوم</div>
          {todayRevItems.map(item=>(
            <div key={item.id} className="list-item" style={{margin:"0 0 8px"}}>
              <div className="li-icon" style={{background:"#e8f5ec"}}>{REV_ICONS[item.product]||"📦"}</div>
              <div className="li-body"><div className="li-title">{item.product}</div><div className="li-sub">{item.date}</div></div>
              <div className="li-right"><div className="li-amount" style={{color:"var(--green)"}}>+{fmt(item.amount)}</div><div className="li-date">جنيه</div></div>
            </div>
          ))}
        </div>
      )}
      {todayExpItems.length>0&&(
        <div className="section" style={{paddingBottom:14}}>
          <div className="section-title">مصروفات اليوم</div>
          {todayExpItems.map(item=>(
            <div key={item.id} className="list-item" style={{margin:"0 0 8px"}}>
              <div className="li-icon" style={{background:"#ffebee"}}>{EXPENSE_ICONS[item.category]||"📦"}</div>
              <div className="li-body"><div className="li-title">{item.category}</div><div className="li-sub">{item.description||item.notes||""}</div></div>
              <div className="li-right"><div className="li-amount" style={{color:"var(--red)"}}>-{fmt(item.amount)}</div><div className="li-date">جنيه</div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── EXPENSES ────────────────────────────────────────────
function ExpPage({data,setData,trash,setTrash,canEdit,canDel,showToast,audit}) {
  const [showForm,setShowForm]=useState(false);
  const [showR,setShowR]=useState(false);
  const [edit,setEdit]=useState(null);
  const [f,setF]=useState({});
  const s=(k,v)=>setF(x=>({...x,[k]:v}));
  // نوع الإيصال بدل العبوة
  const RECEIPT_TYPES=["فاتورة رسمية","إيصال عادي","بدون إيصال"];

  const save=()=>{
    const item={...f,id:edit?edit.id:Date.now()};
    if(edit){ audit("edit","مصروف",edit,item); setData(d=>d.map(i=>i.id===edit.id?item:i)); }
    else{ audit("add","مصروف",null,item); setData(d=>[...d,item]); }
    setShowForm(false);setEdit(null);setF({});showToast("تم الحفظ ✓");
  };
  const del=item=>{ audit("delete","مصروف",item,null); setTrash(tr=>[{...item,_d:Date.now()},...tr]);setData(d=>d.filter(i=>i.id!==item.id));showToast("تم الحذف"); };
  const restore=item=>{ setData(d=>[...d,item]);setTrash(tr=>tr.filter(i=>i.id!==item.id));showToast("تم الاسترجاع ✓"); };
  const sorted=[...data].sort((a,b)=>new Date(b.date)-new Date(a.date));

  return (
    <div>
      {canEdit&&<button className="add-btn-full" onClick={()=>{setF({date:todayStr()});setEdit(null);setShowForm(true);}}>+ إضافة مصروف</button>}
      {canEdit&&trash.length>0&&<div style={{padding:"0 14px 10px",textAlign:"center"}}><button style={{background:"var(--bg)",border:"1px solid var(--border)",borderRadius:20,padding:"6px 16px",fontFamily:"'Cairo',sans-serif",fontSize:12,cursor:"pointer",color:"var(--text2)"}} onClick={()=>setShowR(true)}>🗑 استرجاع ({trash.length})</button></div>}
      <div className="section"><div className="section-title">آخر المصروفات</div></div>
      <div className="list-items">
        {sorted.length===0&&<div className="no-data">لا توجد بيانات</div>}
        {sorted.map(item=>(
          <div key={item.id} className="list-item">
            <div className="li-icon" style={{background:"#ffebee"}}>{EXPENSE_ICONS[item.category]||"📦"}</div>
            <div className="li-body">
              <div className="li-title">{item.category}{item.receiptType?` · ${item.receiptType}`:""}</div>
              <div className="li-sub">{item.description||item.notes||""}</div>
            </div>
            <div className="li-right">
              <div className="li-amount" style={{color:"var(--red)"}}>{fmt(item.amount)}</div>
              <div className="li-date">{item.date}</div>
              {(canEdit||canDel)&&<div className="li-actions" style={{marginTop:4}}>
                {canEdit&&<button className="ibt ibt-g" onClick={()=>{setF({...item});setEdit(item);setShowForm(true);}}>✏️</button>}
                {canDel&&<button className="ibt ibt-r" onClick={()=>del(item)}>🗑️</button>}
              </div>}
            </div>
          </div>
        ))}
      </div>
      {showForm&&(
        <div className="modal-ov" onClick={()=>setShowForm(false)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div className="modal-handle"/>
            <div className="modal-title">{edit?"تعديل المصروف":"+ إضافة مصروف"}</div>
            <div className="frow"><div className="flbl">نوع المصروف</div>
              <select className="finp" value={f.category||""} onChange={e=>s("category",e.target.value)}>
                <option value="">اختر نوع المصروف</option>{EXP_TYPES.map(x=><option key={x}>{x}</option>)}
              </select></div>
            <div className="frow"><div className="flbl">نوع الإيصال</div>
              <select className="finp" value={f.receiptType||""} onChange={e=>s("receiptType",e.target.value)}>
                <option value="">اختر نوع الإيصال</option>{RECEIPT_TYPES.map(x=><option key={x}>{x}</option>)}
              </select></div>
            <div className="frow2">
              <div><div className="flbl">المبلغ (جنيه)</div><input className="finp" type="number" placeholder="أدخل المبلغ" value={f.amount||""} onChange={e=>s("amount",e.target.value)}/></div>
              <div><div className="flbl">التاريخ</div><input className="finp" type="date" value={f.date||""} onChange={e=>s("date",e.target.value)}/></div>
            </div>
            <div className="frow"><div className="flbl">ملاحظات</div><input className="finp" placeholder="أدخل ملاحظات (اختياري)" value={f.notes||""} onChange={e=>s("notes",e.target.value)}/></div>
            <button className="save-btn" onClick={save}>حفظ</button>
          </div>
        </div>
      )}
      {showR&&<RestoreModal trash={trash} onRestore={restore} onClose={()=>setShowR(false)}/>}
    </div>
  );
}

// ─── REVENUE ─────────────────────────────────────────────
function RevPage({data,setData,trash,setTrash,canEdit,canDel,showToast,audit}) {
  const [showForm,setShowForm]=useState(false);
  const [showR,setShowR]=useState(false);
  const [edit,setEdit]=useState(null);
  const [f,setF]=useState({});
  const s=(k,v)=>setF(x=>{
    const nf={...x,[k]:v};
    if(k==="quantity"||k==="price"){ nf.amount=(Number(k==="quantity"?v:nf.quantity)||0)*(Number(k==="price"?v:nf.price)||0); }
    return nf;
  });

  const save=()=>{
    const item={...f,id:edit?edit.id:Date.now()};
    if(edit){ audit("edit","إيراد",edit,item); setData(d=>d.map(i=>i.id===edit.id?item:i)); }
    else{ audit("add","إيراد",null,item); setData(d=>[...d,item]); }
    setShowForm(false);setEdit(null);setF({});showToast("تم الحفظ ✓");
  };
  const del=item=>{ audit("delete","إيراد",item,null); setTrash(tr=>[{...item,_d:Date.now()},...tr]);setData(d=>d.filter(i=>i.id!==item.id));showToast("تم الحذف"); };
  const restore=item=>{ setData(d=>[...d,item]);setTrash(tr=>tr.filter(i=>i.id!==item.id));showToast("تم الاسترجاع ✓"); };
  const sorted=[...data].sort((a,b)=>new Date(b.date)-new Date(a.date));

  return (
    <div>
      {canEdit&&<button className="add-btn-full" onClick={()=>{setF({date:todayStr()});setEdit(null);setShowForm(true);}}>+ إضافة إيراد</button>}
      {canEdit&&trash.length>0&&<div style={{padding:"0 14px 10px",textAlign:"center"}}><button style={{background:"var(--bg)",border:"1px solid var(--border)",borderRadius:20,padding:"6px 16px",fontFamily:"'Cairo',sans-serif",fontSize:12,cursor:"pointer",color:"var(--text2)"}} onClick={()=>setShowR(true)}>🗑 استرجاع ({trash.length})</button></div>}
      <div className="section"><div className="section-title">آخر الإيرادات</div></div>
      <div className="list-items">
        {sorted.length===0&&<div className="no-data">لا توجد بيانات</div>}
        {sorted.map(item=>(
          <div key={item.id} className="list-item">
            <div className="li-icon" style={{background:"#e8f5ec"}}>{REV_ICONS[item.product]||"📦"}</div>
            <div className="li-body">
              <div className="li-title">{item.product}</div>
              <div className="li-sub">{item.traderName?`التاجر: ${item.traderName} · `:""}{item.date}</div>
            </div>
            <div className="li-right">
              <div className="li-amount" style={{color:"var(--green)"}}>{fmt(item.amount)}</div>
              <div className="li-date">جنيه</div>
              {(canEdit||canDel)&&<div className="li-actions" style={{marginTop:4}}>
                {canEdit&&<button className="ibt ibt-g" onClick={()=>{setF({...item});setEdit(item);setShowForm(true);}}>✏️</button>}
                {canDel&&<button className="ibt ibt-r" onClick={()=>del(item)}>🗑️</button>}
              </div>}
            </div>
          </div>
        ))}
      </div>
      {showForm&&(
        <div className="modal-ov" onClick={()=>setShowForm(false)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div className="modal-handle"/>
            <div className="modal-title">{edit?"تعديل الإيراد":"+ إضافة إيراد"}</div>
            <div className="frow"><div className="flbl">نوع الإيراد</div>
              <select className="finp" value={f.product||""} onChange={e=>s("product",e.target.value)}>
                <option value="">اختر نوع الإيراد</option>{REV_TYPES.map(x=><option key={x}>{x}</option>)}
              </select></div>
            <div className="frow2">
              <div><div className="flbl">الكمية</div><input className="finp" type="number" value={f.quantity||""} onChange={e=>s("quantity",e.target.value)}/></div>
              <div><div className="flbl">سعر البيع</div><input className="finp" type="number" value={f.price||""} onChange={e=>s("price",e.target.value)}/></div>
            </div>
            <div className="frow2">
              <div><div className="flbl">المبلغ (تلقائي)</div><input className="finp ro" readOnly value={f.amount||0}/></div>
              <div><div className="flbl">التاريخ</div><input className="finp" type="date" value={f.date||""} onChange={e=>s("date",e.target.value)}/></div>
            </div>
            <div className="frow2">
              <div><div className="flbl">اسم التاجر</div><input className="finp" value={f.traderName||""} onChange={e=>s("traderName",e.target.value)}/></div>
              <div><div className="flbl">هاتف التاجر</div><input className="finp" value={f.traderPhone||""} onChange={e=>s("traderPhone",e.target.value)}/></div>
            </div>
            <div className="frow"><div className="flbl">ملاحظات</div><input className="finp" value={f.notes||""} onChange={e=>s("notes",e.target.value)}/></div>
            <button className="save-btn" onClick={save}>حفظ</button>
          </div>
        </div>
      )}
      {showR&&<RestoreModal trash={trash} onRestore={restore} onClose={()=>setShowR(false)}/>}
    </div>
  );
}

// ─── INVENTORY ───────────────────────────────────────────
function InvPage({data,setData,trash,setTrash,usageLog,setUsageLog,canEdit,canDel,showToast,lowStock,audit}) {
  const [showForm,setShowForm]=useState(false);
  const [showR,setShowR]=useState(false);
  const [showScanner,setShowScanner]=useState(false);
  const [useItem,setUse]=useState(null);
  const [edit,setEdit]=useState(null);
  const [f,setF]=useState({});
  const [useQty,setUQ]=useState("");
  const [q,setQ]=useState("");
  const s=(k,v)=>setF(x=>({...x,[k]:v}));

  const save=()=>{
    const item={...f,id:edit?edit.id:Date.now()};
    if(edit){ audit("edit","مخزون",edit,item); setData(d=>d.map(i=>i.id===edit.id?item:i)); }
    else{ audit("add","مخزون",null,item); setData(d=>[...d,item]); }
    setShowForm(false);setEdit(null);setF({});showToast("تم الحفظ ✓");
  };
  const del=item=>{ audit("delete","مخزون",item,null); setTrash(tr=>[{...item,_d:Date.now()},...tr]);setData(d=>d.filter(i=>i.id!==item.id));showToast("تم الحذف"); };
  const restore=item=>{ setData(d=>[...d,item]);setTrash(tr=>tr.filter(i=>i.id!==item.id));showToast("تم الاسترجاع ✓"); };
  const doUse=()=>{
    const qty=Number(useQty);
    if(!qty||qty<=0){showToast("أدخل كمية صحيحة");return;}
    const old={...useItem};
    const updated={...useItem,quantity:Math.max(0,Number(useItem.quantity)-qty)};
    audit("edit","استخدام مخزون",old,updated);
    setData(d=>d.map(i=>i.id===useItem.id?updated:i));
    setUsageLog(l=>[...l,{id:Date.now(),itemName:useItem.name,qty,date:todayStr()}]);
    setUse(null);setUQ("");showToast("تم الخصم من المخزن ✓");
  };

  // Barcode scan handler — يفتح نافذة الاستخدام تلقائياً لو الصنف موجود
  const handleScan=(code)=>{
    setShowScanner(false);
    const found=data.find(i=>i.barcode===code);
    if(found){
      setQ("");
      setUse(found); setUQ(""); // فتح نافذة الاستخدام مباشرة
      showToast(`✅ تم العثور على: ${found.name}`);
    } else {
      setF({barcode:code});setEdit(null);setShowForm(true);
      showToast("باركود جديد - أكمل بيانات الصنف");
    }
  };

  const filtered=data.filter(i=>(i.name||"").includes(q)||(i.barcode||"").includes(q)||(i.type||"").includes(q));

  return (
    <div>
      <div className="search-bar">
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" style={{width:18,height:18,flexShrink:0}}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input placeholder="بحث عن صنف أو باركود..." value={q} onChange={e=>setQ(e.target.value)}/>
      </div>

      {canEdit&&(
        <div style={{display:"flex",gap:8,margin:"10px 14px 0"}}>
          <button className="add-btn-full" style={{margin:0,flex:1}} onClick={()=>{setF({});setEdit(null);setShowForm(true);}}>+ إضافة صنف</button>
          <button className="add-btn-full" style={{margin:0,width:"auto",padding:"14px 16px",background:"#1565c0"}} onClick={()=>setShowScanner(true)}>
            {Nav.scan}
          </button>
        </div>
      )}
      {canEdit&&trash.length>0&&<div style={{padding:"8px 14px 4px",textAlign:"center"}}><button style={{background:"var(--bg)",border:"1px solid var(--border)",borderRadius:20,padding:"6px 16px",fontFamily:"'Cairo',sans-serif",fontSize:12,cursor:"pointer",color:"var(--text2)"}} onClick={()=>setShowR(true)}>🗑 استرجاع ({trash.length})</button></div>}

      <div style={{height:10}}/>
      {filtered.length===0&&<div className="no-data">لا توجد بيانات</div>}
      {filtered.map(item=>{
        const low=Number(item.minStock)>0&&Number(item.quantity)<=Number(item.minStock);
        const out=Number(item.quantity)===0;
        return (
          <div key={item.id} className="inv-item">
            <div className="inv-top">
              <div>
                <div className="inv-name">{INV_ICONS[item.type]||"📦"} {item.name}</div>
                <div className="inv-pkg">{item.type}{item.barcode?` · 🔲 ${item.barcode}`:""}</div>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                {canEdit&&<button className="use-btn" onClick={()=>{setUse(item);setUQ("");}}>استخدام</button>}
                {canEdit&&<button className="ibt ibt-g" onClick={()=>{setF({...item});setEdit(item);setShowForm(true);}}>✏️</button>}
                {canDel&&<button className="ibt ibt-r" onClick={()=>del(item)}>🗑️</button>}
              </div>
            </div>
            <div className="inv-rows">
              <div className="inv-row">
                <div className="inv-row-l">الكمية المتاحة</div>
                <div className={`inv-row-v ${out?"warn":low?"warn":"ok"}`}>{fmt(item.quantity)} {item.unit||""}</div>
              </div>
              <div className="inv-row">
                <div className="inv-row-l">الحد الأدنى</div>
                <div className="inv-row-v">{fmt(item.minStock)||"—"} {item.unit||""}</div>
              </div>
            </div>
            {item.price&&<div style={{marginTop:6,fontSize:12,color:"var(--text3)"}}>💰 القيمة: <b style={{color:"var(--green)"}}>{fmt(Number(item.quantity)*Number(item.price))} جنيه</b></div>}
            {(out||low)&&<div style={{marginTop:8,background:"#ffebee",borderRadius:8,padding:"6px 10px",fontSize:12,color:"var(--red)",fontWeight:700}}>⚠️ {out?"نفد المخزن":"كمية منخفضة"}</div>}
          </div>
        );
      })}

      {showScanner&&<BarcodeScanner onScan={handleScan} onClose={()=>setShowScanner(false)}/>}

      {showForm&&(
        <div className="modal-ov" onClick={()=>setShowForm(false)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div className="modal-handle"/>
            <div className="modal-title">{edit?"تعديل الصنف":"+ إضافة صنف"}</div>
            <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"flex-end"}}>
              <div style={{flex:1}}>
                <div className="flbl">الباركود</div>
                <input className="finp" value={f.barcode||""} onChange={e=>s("barcode",e.target.value)} placeholder="أدخل أو امسح..."/>
              </div>
              <button style={{height:42,padding:"0 12px",background:"#1565c0",color:"#fff",border:"none",borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontFamily:"'Cairo',sans-serif",fontSize:13,fontWeight:700}} onClick={()=>{ setShowForm(false); setShowScanner(true); }}>
                {Nav.scan} مسح
              </button>
            </div>
            <div className="frow2">
              <div><div className="flbl">الاسم</div><input className="finp" value={f.name||""} onChange={e=>s("name",e.target.value)}/></div>
              <div><div className="flbl">النوع</div>
                <select className="finp" value={f.type||""} onChange={e=>s("type",e.target.value)}>
                  <option value="">اختر النوع</option>{INV_TYPES.map(x=><option key={x}>{x}</option>)}
                </select></div>
            </div>
            <div className="frow2">
              <div><div className="flbl">الكمية المتاحة</div><input className="finp" type="number" value={f.quantity||""} onChange={e=>s("quantity",e.target.value)}/></div>
              <div><div className="flbl">الوحدة</div>
                <select className="finp" value={f.unit||""} onChange={e=>s("unit",e.target.value)}>
                  <option value="">الوحدة</option>{["كجم","طن","لتر","عبوة","قطعة"].map(x=><option key={x}>{x}</option>)}
                </select></div>
            </div>
            <div className="frow2">
              <div><div className="flbl">الحد الأدنى للتنبيه</div><input className="finp" type="number" value={f.minStock||""} onChange={e=>s("minStock",e.target.value)}/></div>
              <div><div className="flbl">سعر الوحدة (جنيه)</div><input className="finp" type="number" value={f.price||""} onChange={e=>s("price",e.target.value)}/></div>
            </div>
            <button className="save-btn" onClick={save}>حفظ</button>
          </div>
        </div>
      )}

      {useItem&&(
        <div className="modal-ov" onClick={()=>setUse(null)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div className="modal-handle"/>
            <div className="modal-title">استخدام من المخزن — {useItem.name}</div>
            <div style={{background:"var(--green3)",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:13}}>
              <span style={{color:"var(--text2)"}}>المتاح: </span><b style={{color:"var(--green)"}}>{fmt(useItem.quantity)} {useItem.unit}</b>
            </div>
            <div className="frow"><div className="flbl">الكمية المستخدمة</div><input className="finp" type="number" value={useQty} onChange={e=>setUQ(e.target.value)} autoFocus/></div>
            <button className="save-btn" onClick={doUse}>تأكيد الاستخدام</button>
          </div>
        </div>
      )}
      {showR&&<RestoreModal trash={trash} onRestore={restore} onClose={()=>setShowR(false)}/>}
    </div>
  );
}

// ─── WORKERS ─────────────────────────────────────────────
function WrkPage({data,setData,trash,setTrash,canEdit,canDel,showToast,audit}) {
  const [showForm,setShowForm]=useState(false);
  const [showR,setShowR]=useState(false);
  const [edit,setEdit]=useState(null);
  const [f,setF]=useState({});
  const s=(k,v)=>setF(x=>({...x,[k]:v}));
  const days=w=>daysBetween(w.startDate,w.endDate||null);
  const total=w=>days(w)*(Number(w.dailyRate)||0);
  const active=data.filter(w=>!w.endDate).length;
  const todayCost=data.filter(w=>!w.endDate).reduce((s,w)=>s+(Number(w.dailyRate)||0),0);

  const save=()=>{
    const item={...f,id:edit?edit.id:Date.now()};
    if(edit){ audit("edit","عامل",edit,item); setData(d=>d.map(i=>i.id===edit.id?item:i)); }
    else{ audit("add","عامل",null,item); setData(d=>[...d,item]); }
    setShowForm(false);setEdit(null);setF({});showToast("تم الحفظ ✓");
  };
  const del=item=>{ audit("delete","عامل",item,null); setTrash(tr=>[{...item,_d:Date.now()},...tr]);setData(d=>d.filter(i=>i.id!==item.id));showToast("تم الحذف"); };
  const restore=item=>{ setData(d=>[...d,item]);setTrash(tr=>tr.filter(i=>i.id!==item.id));showToast("تم الاسترجاع ✓"); };
  const checkout=w=>{ audit("edit","خروج عامل",w,{...w,endDate:todayStr()}); setData(d=>d.map(i=>i.id===w.id?{...i,endDate:todayStr()}:i));showToast("تم تسجيل الخروج ✓"); };

  return (
    <div>
      <div style={{margin:"14px 14px 0",background:"var(--white)",borderRadius:14,padding:16,boxShadow:"var(--shadow)"}}>
        <div style={{display:"flex",gap:14}}>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:11,color:"var(--text3)",marginBottom:4}}>إجمالي عدد العمال</div>
            <div style={{fontSize:28,fontWeight:900,color:"var(--text)"}}>{active}</div>
          </div>
          <div style={{width:1,background:"var(--border)"}}/>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:11,color:"var(--text3)",marginBottom:4}}>إجمالي تكلفة العمالة اليوم</div>
            <div style={{fontSize:22,fontWeight:900,color:"var(--green)"}}>{fmt(todayCost)}</div>
            <div style={{fontSize:11,color:"var(--text3)"}}>جنيه</div>
          </div>
        </div>
      </div>
      {canEdit&&<button className="add-btn-full" style={{marginTop:12}} onClick={()=>{setF({startDate:todayStr()});setEdit(null);setShowForm(true);}}>+ إضافة عامل</button>}
      {canEdit&&trash.length>0&&<div style={{padding:"0 14px 4px",textAlign:"center"}}><button style={{background:"var(--bg)",border:"1px solid var(--border)",borderRadius:20,padding:"6px 16px",fontFamily:"'Cairo',sans-serif",fontSize:12,cursor:"pointer",color:"var(--text2)"}} onClick={()=>setShowR(true)}>🗑 استرجاع ({trash.length})</button></div>}
      {data.length===0&&<div className="no-data">لا توجد بيانات</div>}
      {data.map(item=>{
        const d=days(item),tot=total(item),paid=Number(item.paid)||0;
        const isActive=!item.endDate;
        return (
          <div key={item.id} className="worker-item">
            <div className="w-avatar">👷</div>
            <div style={{flex:1}}>
              <div className="w-name">{item.name}</div>
              <div className="w-daily">الأجر اليومي: {fmt(item.dailyRate)} جنيه</div>
              <div style={{fontSize:12,color:"var(--text2)",marginTop:3}}>
                أيام: <b>{d}</b> · إجمالي: <b style={{color:"var(--green)"}}>{fmt(tot)}</b> · متبقي: <b style={{color:tot-paid>0?"var(--red)":"var(--green)"}}>{fmt(tot-paid)}</b>
              </div>
            </div>
            <div style={{textAlign:"center"}}>
              <span className={`w-badge ${isActive?"wb-g":"wb-r"}`}>{isActive?"حاضر":"خرج"}</span>
              <div style={{display:"flex",gap:4,marginTop:6,justifyContent:"center"}}>
                {canEdit&&isActive&&<button className="ibt ibt-g" title="تسجيل خروج" onClick={()=>checkout(item)}>✔️</button>}
                {canEdit&&<button className="ibt ibt-g" onClick={()=>{setF({...item});setEdit(item);setShowForm(true);}}>✏️</button>}
                {canDel&&<button className="ibt ibt-r" onClick={()=>del(item)}>🗑️</button>}
              </div>
            </div>
          </div>
        );
      })}
      {showForm&&(
        <div className="modal-ov" onClick={()=>setShowForm(false)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div className="modal-handle"/>
            <div className="modal-title">{edit?"تعديل بيانات العامل":"+ إضافة عامل"}</div>
            <div className="frow2">
              <div><div className="flbl">الاسم</div><input className="finp" value={f.name||""} onChange={e=>s("name",e.target.value)}/></div>
              <div><div className="flbl">الهاتف</div><input className="finp" value={f.phone||""} onChange={e=>s("phone",e.target.value)}/></div>
            </div>
            <div className="frow2">
              <div><div className="flbl">تاريخ البداية</div><input className="finp" type="date" value={f.startDate||""} onChange={e=>s("startDate",e.target.value)}/></div>
              <div><div className="flbl">تاريخ الانتهاء</div><input className="finp" type="date" value={f.endDate||""} onChange={e=>s("endDate",e.target.value)}/></div>
            </div>
            <div className="frow2">
              <div><div className="flbl">الأجر اليومي</div><input className="finp" type="number" value={f.dailyRate||""} onChange={e=>s("dailyRate",e.target.value)}/></div>
              <div><div className="flbl">المدفوع</div><input className="finp" type="number" value={f.paid||""} onChange={e=>s("paid",e.target.value)}/></div>
            </div>
            {f.startDate&&f.dailyRate&&<div style={{background:"var(--green3)",borderRadius:8,padding:"8px 12px",fontSize:12,marginBottom:10}}>
              أيام: <b>{daysBetween(f.startDate,f.endDate||null)}</b> · إجمالي: <b style={{color:"var(--green)"}}>{fmt(daysBetween(f.startDate,f.endDate||null)*(Number(f.dailyRate)||0))}</b> جنيه
            </div>}
            <button className="save-btn" onClick={save}>حفظ</button>
          </div>
        </div>
      )}
      {showR&&<RestoreModal trash={trash} onRestore={restore} onClose={()=>setShowR(false)}/>}
    </div>
  );
}

// ─── REPORTS ─────────────────────────────────────────────
function RepPage({expenses,revenues,workers,inventory,auditLog,users}) {
  const [period,setPeriod]=useState("daily");
  const [selDate,setSelDate]=useState(todayStr());
  const [repTab,setRepTab]=useState("financial"); // financial | workers | inventory | audit

  const filtered=(arr,dk)=>{
    if(period==="daily") return arr.filter(i=>i[dk]===selDate);
    if(period==="monthly") return arr.filter(i=>(i[dk]||"").startsWith(selDate.slice(0,7)));
    if(period==="seasonal"){ const m=new Date(selDate).getMonth(); const s=m<3||m===11?[11,0,1,2]:m<6?[3,4,5]:m<9?[6,7,8]:[9,10,11]; return arr.filter(i=>s.includes(new Date(i[dk]).getMonth())); }
    return arr.filter(i=>(i[dk]||"").startsWith(selDate.slice(0,4)));
  };

  const fExp=filtered(expenses,"date"), fRev=filtered(revenues,"date");
  const totRev=fRev.reduce((s,r)=>s+(Number(r.amount)||0),0);
  const totExp=fExp.reduce((s,e)=>s+(Number(e.amount)||0),0);

  // Worker cost for period
  const wCost=workers.reduce((s,w)=>{
    const wd=daysBetween(w.startDate,w.endDate||null)*(Number(w.dailyRate)||0);
    return s+wd;
  },0);
  const wPaid=workers.reduce((s,w)=>s+(Number(w.paid)||0),0);

  // Net profit = revenue - expenses - worker cost
  const netProfit=totRev-totExp-wCost;

  // Inventory total value
  const invValue=inventory.reduce((s,i)=>s+(Number(i.quantity)||0)*(Number(i.price)||0),0);

  // Chart data
  const days5=[...Array(5)].map((_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-4+i);
    const ds=d.toISOString().split("T")[0];
    const r=revenues.filter(x=>x.date===ds).reduce((s,x)=>s+(Number(x.amount)||0),0);
    const e=expenses.filter(x=>x.date===ds).reduce((s,x)=>s+(Number(x.amount)||0),0);
    const label=`${d.getDate()}/${d.getMonth()+1}`;
    return {label,r,e};
  });
  const maxV=Math.max(...days5.map(d=>Math.max(d.r,d.e)),1);

  const TABS=[{k:"daily",l:"يومي"},{k:"monthly",l:"شهري"},{k:"seasonal",l:"موسمي"},{k:"yearly",l:"سنة"}];
  const REP_TABS=[{k:"financial",l:"مالي"},{k:"workers",l:"العمالة"},{k:"inventory",l:"المخزن"},{k:"audit",l:"سجل التغييرات"}];

  const getUserName=id=>{ const u=users.find(x=>x.id===id); return u?u.name:"مجهول"; };

  return (
    <div>
      {/* Period tabs */}
      <div className="rep-tabs">
        {TABS.map(tb=><button key={tb.k} className={`rep-tab ${period===tb.k?"on":""}`} onClick={()=>setPeriod(tb.k)}>{tb.l}</button>)}
      </div>
      <div className="rep-date">
        {Nav.cal}<input type="date" value={selDate} onChange={e=>setSelDate(e.target.value)}/>
      </div>

      {/* Report type tabs */}
      <div className="rep-tabs" style={{paddingTop:8}}>
        {REP_TABS.map(tb=><button key={tb.k} className={`rep-tab ${repTab===tb.k?"on":""}`} style={{fontSize:12}} onClick={()=>setRepTab(tb.k)}>{tb.l}</button>)}
      </div>

      {/* FINANCIAL */}
      {repTab==="financial"&&(
        <>
          <div className="section" style={{marginTop:12}}>
            <div className="section-title">ملخص التقرير المالي</div>
            <div className="summary-card">
              <div className="sum-row"><span className="sum-label">💰 إجمالي الإيرادات</span><span className="sum-value g">{fmt(totRev)} جنيه</span></div>
              <div className="sum-row"><span className="sum-label">🛒 إجمالي المصروفات</span><span className="sum-value r">{fmt(totExp)} جنيه</span></div>
              <div className="sum-row"><span className="sum-label">👷 تكلفة العمالة</span><span className="sum-value r">{fmt(wCost)} جنيه</span></div>
              <div className="sum-row" style={{background:"var(--green3)",borderRadius:8,padding:"8px 10px",margin:"4px 0"}}>
                <span className="sum-label" style={{fontWeight:700}}>📊 صافي الربح الحقيقي</span>
                <span className={`sum-value ${netProfit>=0?"g":"r"}`} style={{fontSize:15}}>{fmt(netProfit)} جنيه</span>
              </div>
            </div>
          </div>
          <div className="section"><div className="section-title">رسم بياني للإيرادات والمصروفات</div></div>
          <div className="bar-chart">
            <div className="bar-wrap">
              {days5.map((d,i)=>(
                <div key={i} className="bar-group">
                  <div className="bar-pair">
                    <div className="bar g" style={{height:`${(d.r/maxV)*95}px`}}/>
                    <div className="bar r" style={{height:`${(d.e/maxV)*95}px`}}/>
                  </div>
                  <div className="bar-label">{d.label}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:16,justifyContent:"center",marginTop:10,fontSize:12}}>
              <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:12,height:12,background:"var(--green)",borderRadius:3,display:"inline-block"}}/> الإيرادات</span>
              <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:12,height:12,background:"var(--red)",borderRadius:3,display:"inline-block"}}/> المصروفات</span>
            </div>
          </div>
        </>
      )}

      {/* WORKERS */}
      {repTab==="workers"&&(
        <div className="section" style={{marginTop:12}}>
          <div className="section-title">تقرير العمالة</div>
          <div className="summary-card">
            <div className="sum-row"><span className="sum-label">👷 عدد العمال النشطين</span><span className="sum-value b">{workers.filter(w=>!w.endDate).length}</span></div>
            <div className="sum-row"><span className="sum-label">💰 إجمالي الاستحقاق</span><span className="sum-value r">{fmt(wCost)} جنيه</span></div>
            <div className="sum-row"><span className="sum-label">✅ المدفوع</span><span className="sum-value g">{fmt(wPaid)} جنيه</span></div>
            <div className="sum-row"><span className="sum-label">⏳ المتبقي</span><span className="sum-value r">{fmt(wCost-wPaid)} جنيه</span></div>
          </div>
          <div style={{height:14}}/>
          {workers.map(w=>{
            const d=daysBetween(w.startDate,w.endDate||null), tot=d*(Number(w.dailyRate)||0);
            return (
              <div key={w.id} style={{background:"var(--white)",borderRadius:10,padding:"12px 14px",marginBottom:8,boxShadow:"var(--shadow)"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <b style={{fontSize:14}}>{w.name}</b>
                  <span className={`w-badge ${!w.endDate?"wb-g":"wb-r"}`}>{!w.endDate?"حاضر":"خرج"}</span>
                </div>
                <div style={{fontSize:12,color:"var(--text2)"}}>
                  {w.startDate} ← {w.endDate||"الآن"} · <b>{d} يوم</b> · <b style={{color:"var(--green)"}}>{fmt(tot)} جنيه</b>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* INVENTORY VALUE */}
      {repTab==="inventory"&&(
        <div className="section" style={{marginTop:12}}>
          <div className="section-title">قيمة المخزن الحالي</div>
          <div className="summary-card" style={{marginBottom:14}}>
            <div className="sum-row"><span className="sum-label">📦 إجمالي قيمة المخزن</span><span className="sum-value g">{fmt(invValue)} جنيه</span></div>
            <div className="sum-row"><span className="sum-label">🗂️ عدد الأصناف</span><span className="sum-value b">{inventory.length}</span></div>
          </div>
          {inventory.map(item=>(
            <div key={item.id} style={{background:"var(--white)",borderRadius:10,padding:"12px 14px",marginBottom:8,boxShadow:"var(--shadow)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <b style={{fontSize:14}}>{INV_ICONS[item.type]||"📦"} {item.name}</b>
                  <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>{item.type} · {fmt(item.quantity)} {item.unit}</div>
                </div>
                <div style={{textAlign:"left"}}>
                  <div style={{fontSize:14,fontWeight:700,color:"var(--green)"}}>{fmt(Number(item.quantity)*Number(item.price||0))} جنيه</div>
                  <div style={{fontSize:11,color:"var(--text3)"}}>سعر الوحدة: {fmt(item.price)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AUDIT LOG */}
      {repTab==="audit"&&(
        <div className="section" style={{marginTop:12,paddingBottom:14}}>
          <div className="section-title">سجل التغييرات ({auditLog.length})</div>
          {auditLog.length===0&&<div className="no-data">لا توجد تغييرات مسجلة</div>}
          <div style={{background:"var(--white)",borderRadius:"var(--r)",padding:"0 14px",boxShadow:"var(--shadow)"}}>
            {auditLog.slice(0,50).map(entry=>{
              let oldParsed=null,newParsed=null;
              try{oldParsed=entry.oldVal?JSON.parse(entry.oldVal):null;}catch{}
              try{newParsed=entry.newVal?JSON.parse(entry.newVal):null;}catch{}
              const actionColor=entry.action==="add"?"var(--green)":entry.action==="delete"?"var(--red)":"var(--orange)";
              const actionLabel=entry.action==="add"?"إضافة":entry.action==="delete"?"حذف":"تعديل";
              return (
                <div key={entry.id} className="audit-item">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <span className="audit-user">{entry.userName}</span>
                      <span style={{margin:"0 6px",color:"var(--text3)"}}>·</span>
                      <span style={{fontSize:12,background:actionColor,color:"#fff",borderRadius:6,padding:"1px 8px",fontWeight:700}}>{actionLabel}</span>
                      <span style={{margin:"0 6px",fontSize:12,color:"var(--text2)"}}>{entry.entity}</span>
                    </div>
                    <span className="audit-time">{entry.time}</span>
                  </div>
                  {entry.action==="edit"&&oldParsed&&newParsed&&(
                    <div className="audit-change">
                      {Object.keys(newParsed).filter(k=>k!=="id"&&newParsed[k]!==oldParsed[k]).map(k=>(
                        <div key={k} style={{display:"flex",gap:6,alignItems:"center",marginTop:3}}>
                          <span style={{color:"var(--text3)",fontSize:11}}>{k}:</span>
                          <span style={{color:"var(--red)",fontSize:11,textDecoration:"line-through"}}>{String(oldParsed[k]).slice(0,20)}</span>
                          <span style={{color:"var(--text3)"}}>→</span>
                          <span style={{color:"var(--green)",fontSize:11}}>{String(newParsed[k]).slice(0,20)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {entry.action==="add"&&newParsed&&(
                    <div className="audit-change" style={{color:"var(--green)",fontSize:11,marginTop:3}}>
                      {newParsed.name||newParsed.category||newParsed.product||"بيان جديد"}
                    </div>
                  )}
                  {entry.action==="delete"&&oldParsed&&(
                    <div className="audit-change" style={{color:"var(--red)",fontSize:11,marginTop:3}}>
                      حُذف: {oldParsed.name||oldParsed.category||oldParsed.product||"بيان"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── USERS ───────────────────────────────────────────────
function UsrPage({users,setUsers,currentUser,showToast,audit}) {
  const [showForm,setShowForm]=useState(false);
  const [showPerms,setShowP]=useState(null);
  const [edit,setEdit]=useState(null);
  const [f,setF]=useState({});
  const s=(k,v)=>setF(x=>({...x,[k]:v}));
  const pageLabels={dashboard:"الرئيسية",expenses:"المصروفات",revenue:"الإيرادات",inventory:"المخزن",workers:"العمالة",reports:"التقارير"};

  const save=()=>{
    const item={...f,permissions:f.permissions||defPerms()};
    if(edit){ setUsers(d=>d.map(i=>i.id===edit.id?{...item,id:edit.id}:i)); }
    else{ setUsers(d=>[...d,{...item,id:Date.now(),createdBy:currentUser.id}]); }
    setShowForm(false);setEdit(null);setF({});showToast("تم الحفظ ✓");
  };
  const togglePage=(uid,pg)=>{
    setUsers(d=>d.map(u=>{ if(u.id!==uid) return u;
      const p=u.permissions||defPerms(), has=(p.pages||[]).includes(pg);
      return {...u,permissions:{...p,pages:has?p.pages.filter(x=>x!==pg):[...(p.pages||[]),pg],canEdit:has?(p.canEdit||[]).filter(x=>x!==pg):(p.canEdit||[]),canDelete:has?(p.canDelete||[]).filter(x=>x!==pg):(p.canDelete||[])}};
    }));
  };
  const togglePerm=(uid,type,pg)=>{
    setUsers(d=>d.map(u=>{ if(u.id!==uid) return u;
      const p=u.permissions||defPerms(), list=p[type]||[];
      return {...u,permissions:{...p,[type]:list.includes(pg)?list.filter(x=>x!==pg):[...list,pg]}};
    }));
  };

  const myUsers=users.filter(u=>u.id!==currentUser.id&&(currentUser.id===1||u.createdBy===currentUser.id));
  const pu=showPerms?users.find(x=>x.id===showPerms.id)||showPerms:null;

  return (
    <div>
      <button className="add-btn-full" onClick={()=>{setF({status:"active",permissions:defPerms()});setEdit(null);setShowForm(true);}}>+ إضافة مستخدم</button>
      {myUsers.length===0&&<div className="no-data">لا توجد مستخدمون</div>}
      {myUsers.map(u=>(
        <div key={u.id} className="usr-item">
          <div className="w-avatar" style={{fontSize:18}}>👤</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:14}}>{u.name}</div>
            <div style={{fontSize:12,color:"var(--text3)"}}>{u.username} · {u.role==="admin"?"مدير":u.role==="manager"?"مشرف":"مشاهد"}</div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <button style={{background:"var(--green3)",color:"var(--green)",border:"none",borderRadius:8,padding:"6px 10px",fontFamily:"'Cairo',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer"}} onClick={()=>setShowP(u)}>⚙️</button>
            <button className="ibt ibt-g" onClick={()=>{setF({...u});setEdit(u);setShowForm(true);}}>✏️</button>
            <button className="ibt ibt-r" onClick={()=>{setUsers(d=>d.filter(i=>i.id!==u.id));showToast("تم الحذف");}}>🗑️</button>
          </div>
        </div>
      ))}

      {showForm&&(
        <div className="modal-ov" onClick={()=>setShowForm(false)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div className="modal-handle"/>
            <div className="modal-title">{edit?"تعديل المستخدم":"إضافة مستخدم"}</div>
            <div className="frow2">
              <div><div className="flbl">الاسم</div><input className="finp" value={f.name||""} onChange={e=>s("name",e.target.value)}/></div>
              <div><div className="flbl">الهاتف</div><input className="finp" value={f.phone||""} onChange={e=>s("phone",e.target.value)}/></div>
            </div>
            <div className="frow2">
              <div><div className="flbl">اسم المستخدم</div><input className="finp" value={f.username||""} onChange={e=>s("username",e.target.value)}/></div>
              <div><div className="flbl">كلمة المرور</div><input className="finp" type="password" value={f.password||""} onChange={e=>s("password",e.target.value)}/></div>
            </div>
            <div className="frow"><div className="flbl">الحالة</div>
              <select className="finp" value={f.status||"active"} onChange={e=>s("status",e.target.value)}>
                <option value="active">نشط</option><option value="inactive">غير نشط</option>
              </select></div>
            <button className="save-btn" onClick={save}>حفظ</button>
          </div>
        </div>
      )}

      {pu&&(
        <div className="modal-ov" onClick={()=>setShowP(null)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div className="modal-handle"/>
            <div className="modal-title">⚙️ إدارة الصلاحيات — {pu.name}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 40px 40px 40px",gap:"6px",alignItems:"center",marginBottom:8}}>
              <div style={{fontSize:11,fontWeight:700,color:"var(--text3)"}}>الصفحة</div>
              <div style={{fontSize:10,color:"var(--text3)",textAlign:"center"}}>عرض</div>
              <div style={{fontSize:10,color:"var(--text3)",textAlign:"center"}}>تعديل</div>
              <div style={{fontSize:10,color:"var(--text3)",textAlign:"center"}}>حذف</div>
            </div>
            {PAGE_KEYS.map(pg=>{
              const pp=pu.permissions||defPerms();
              const hasP=(pp.pages||[]).includes(pg),hasE=(pp.canEdit||[]).includes(pg),hasD=(pp.canDelete||[]).includes(pg);
              const btn=(on,c,fn)=>(
                <button className="ptoggle" style={{background:on?c:"#f0f0f0",color:on?"#fff":"#999",opacity:hasP?1:0.3}} onClick={fn}>{on?"✓":"✗"}</button>
              );
              return (
                <div key={pg} style={{display:"grid",gridTemplateColumns:"1fr 40px 40px 40px",gap:"6px",alignItems:"center",padding:"8px 0",borderTop:"1px solid var(--border)"}}>
                  <div style={{fontWeight:600,fontSize:13}}>{pageLabels[pg]}</div>
                  {btn(hasP,"var(--green)",()=>togglePage(pu.id,pg))}
                  {btn(hasE&&hasP,"#1565c0",()=>hasP&&togglePerm(pu.id,"canEdit",pg))}
                  {btn(hasD&&hasP,"var(--red)",()=>hasP&&togglePerm(pu.id,"canDelete",pg))}
                </div>
              );
            })}
            <button className="save-btn" style={{marginTop:14}} onClick={()=>setShowP(null)}>حفظ</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RESTORE MODAL ───────────────────────────────────────
function RestoreModal({trash,onRestore,onClose}) {
  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}>
        <div className="modal-handle"/>
        <div className="modal-title">🗑 استرجاع المحذوف ({trash.length})</div>
        {trash.length===0&&<div className="no-data">لا يوجد محذوف</div>}
        {trash.map(item=>(
          <div key={item.id} className="restore-row">
            <div style={{flex:1}}>
              <div style={{fontWeight:600,fontSize:13}}>{item.name||item.description||item.product||item.category||"—"}</div>
              <div style={{fontSize:11,color:"var(--text3)"}}>{item.date||item.startDate||""}{item.amount?` · ${fmt(item.amount)} جنيه`:""}</div>
            </div>
            <button style={{background:"var(--green3)",color:"var(--green)",border:"none",borderRadius:8,padding:"6px 14px",fontFamily:"'Cairo',sans-serif",fontSize:13,fontWeight:700,cursor:"pointer"}} onClick={()=>onRestore(item)}>استرجاع</button>
          </div>
        ))}
        <button style={{width:"100%",marginTop:14,padding:11,background:"var(--bg)",border:"1px solid var(--border)",borderRadius:10,fontFamily:"'Cairo',sans-serif",fontSize:14,cursor:"pointer",color:"var(--text2)"}} onClick={onClose}>إلغاء</button>
      </div>
    </div>
  );
}
