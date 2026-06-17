// v6.1 — Farmy App with Login
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./config/supabase";
import "./App.css";

// ─── CONSTANTS ───────────────────────────────────────────
const EXP_TYPES    = ["فاتورة","كهرباء","وقود","صيانة","عمالة","سماد","مبيدات","ري","إيجار","أخرى"];
const REV_TYPES    = ["قمح","ذرة","طماطم","بطاطس","بصل","فلفل ألوان","خضروات","فاكهة","أخرى"];
const INV_TYPES    = ["سماد","مبيد","بذور","محروقات","أدوات","أخرى"];
const EXPENSE_ICONS= {"فاتورة":"🧾","كهرباء":"⚡","وقود":"⛽","صيانة":"🔧","عمالة":"👷","سماد":"🌱","مبيدات":"🧴","ري":"💧","إيجار":"🏠","أخرى":"📦"};
const REV_ICONS    = {"قمح":"🌾","ذرة":"🌽","طماطم":"🍅","بطاطس":"🥔","بصل":"🧅","فلفل ألوان":"🌶️","خضروات":"🥦","فاكهة":"🍎","أخرى":"📦"};
const INV_ICONS    = {"سماد":"🌱","مبيد":"🧴","بذور":"🌰","محروقات":"⛽","أدوات":"🔧","أخرى":"📦"};
const PAGE_KEYS    = ["dashboard","expenses","revenue","inventory","workers","reports"];

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

function createAuditEntry(user, action, entity, oldVal, newVal) {
  return {
    id: Date.now() + Math.random(),
    userId: user?.id,
    userName: user?.name || user?.username,
    action,
    entity,
    oldVal: oldVal ? JSON.stringify(oldVal) : null,
    newVal: newVal ? JSON.stringify(newVal) : null,
    time: new Date().toLocaleString("ar-EG"),
  };
}

export default function App() {
  const [user,setUser]           = useState(()=>ld("user",null));
  const [page,setPage]           = useState("dashboard");
  const [toast,setToast]         = useState(null);
  const [syncStatus,setSyncStatus] = useState("local");

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

  const audit = useCallback((action,entity,oldV,newV)=>{
    setAuditLog(l=>[createAuditEntry(user,action,entity,oldV,newV),...l].slice(0,500));
  },[user]);

  const syncTimerRef = useRef(null);
  const isFirstRender = useRef(true);

  const autoSync = useCallback(async (table, rows) => {
    if (!rows || rows.length === 0) return;
    setSyncStatus("syncing");
    try {
      const { error } = await supabase
        .from(table)
        .upsert(rows, { onConflict: "id", ignoreDuplicates: false });
      if (error) throw new Error(error.message);
      setSyncStatus("synced");
      setTimeout(() => setSyncStatus("local"), 2000);
    } catch(e) {
      setSyncStatus("error");
      console.error("Auto sync error [" + table + "]:", e.message);
      setTimeout(() => setSyncStatus("local"), 3000);
    }
  }, []);

  const debouncedSync = useCallback((table, rows) => {
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => autoSync(table, rows), 2000);
  }, [autoSync]);

  useEffect(() => { if(isFirstRender.current) return; debouncedSync("expenses",  expenses);  }, [expenses]);
  useEffect(() => { if(isFirstRender.current) return; debouncedSync("revenues",  revenues);  }, [revenues]);
  useEffect(() => { if(isFirstRender.current) return; debouncedSync("inventory", inventory); }, [inventory]);
  useEffect(() => { if(isFirstRender.current) return; debouncedSync("workers",   workers);   }, [workers]);
  useEffect(() => { if(isFirstRender.current) return; debouncedSync("usage_log", usageLog);  }, [usageLog]);

  const syncToServer = useCallback(async () => {
    setSyncStatus("syncing");
    try {
      const tables = [
        ["expenses", expenses], ["revenues", revenues],
        ["inventory", inventory], ["workers", workers], ["usage_log", usageLog],
      ];
      for (const [table, rows] of tables) {
        if (rows?.length) {
          const { error } = await supabase
            .from(table)
            .upsert(rows, { onConflict: "id", ignoreDuplicates: false });
          if (error) throw new Error(`${table}: ${error.message}`);
        }
      }
      setSyncStatus("synced");
      showToast("✅ تم المزامنة مع السيرفر");
    } catch(e) {
      setSyncStatus("error");
      showToast("⚠️ فشل: " + e.message);
      console.error("syncToServer error:", e.message);
    }
    setTimeout(() => setSyncStatus("local"), 3000);
  }, [expenses, revenues, inventory, workers, usageLog, showToast]);

  useEffect(()=>{
    setSyncStatus("syncing");
    const loadFromServer = async () => {
      try {
        const fetchTable = async (t) => {
          const { data, error } = await supabase.from(t).select("*");
          if (error) throw new Error(`${t}: ${error.message}`);
          return data;
        };
        const [expData, revData, invData, wrkData, useData, usrData] = await Promise.all([
          fetchTable("expenses"), fetchTable("revenues"), fetchTable("inventory"),
          fetchTable("workers"), fetchTable("usage_log"), fetchTable("users"),
        ]);
        if (expData?.length) setExpenses(expData);
        if (revData?.length) setRevenues(revData);
        if (invData?.length) setInventory(invData);
        if (wrkData?.length) setWorkers(wrkData);
        if (useData?.length) setUsageLog(useData);
        if (usrData?.length) setUsers(usrData);
        setSyncStatus("synced");
        setTimeout(()=>setSyncStatus("local"),2000);
      } catch(e){
        console.error("Load from server error:", e.message);
        showToast("خطأ: " + e.message);
        setSyncStatus("error");
        setTimeout(()=>setSyncStatus("local"),4000);
      } finally {
        isFirstRender.current = false;
      }
    };
    loadFromServer();
  }, []);

  const lowStock  = inventory.filter(i=>Number(i.minStock)>0&&Number(i.quantity)<=Number(i.minStock));
  const perms     = user?.role==="admin"?defPerms():(user?.permissions||defPerms());
  const canE      = pg=>user?.role==="admin"||(perms.canEdit||[]).includes(pg);
  const canD      = pg=>user?.role==="admin"||(perms.canDelete||[]).includes(pg);
  const pPages    = user?.role==="admin"?[...PAGE_KEYS,"users"]:(perms.pages||PAGE_KEYS);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  if(!user) return (
    <LoginPage users={users} setUsers={setUsers} onLogin={u=>{
      setUser(u);
      const allowed = u.role==="admin" ? [...PAGE_KEYS,"users"] : (u.permissions?.pages || PAGE_KEYS);
      const first = allowed[0] || "dashboard";
      setPage(first);
    }}/>
  );

  const NAV = [
    {k:"dashboard", ic:Nav.home, l:"الرئيسية"},
    {k:"expenses",  ic:Nav.exp,  l:"المصروفات"},
    {k:"revenue",   ic:Nav.rev,  l:"الإيرادات"},
    {k:"inventory", ic:Nav.inv,  l:"المخزن"},
    {k:"workers",   ic:Nav.wrk,  l:"العمالة"},
    {k:"reports",   ic:Nav.rep,  l:"التقارير"},
  ].filter(n=>pPages.includes(n.k));

  if(user?.role==="admin") NAV.push({k:"users", ic:<svg viewBox="0 0 24 24" fill="currentColor" style={{width:22,height:22}}><path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>, l:"المستخدمون"});

  const pageTitle = NAV.find(n=>n.k===page)?.l || page;
  const roleLabel = user.role==="admin"?"مدير":user.role==="supervisor"?"مشرف":"عامل";

  return (
    <div className="app" dir="rtl">

      {syncStatus==="syncing"&&<div className="sync-bar">🔄 جاري المزامنة مع السيرفر...</div>}
      {syncStatus==="synced" &&<div className="sync-bar">✅ تمت المزامنة بنجاح</div>}
      {syncStatus==="error"  &&<div className="sync-bar" style={{background:"#ffebee",color:"var(--red)",cursor:"pointer",justifyContent:"center"}} onClick={syncToServer}>⚠️ تعذر الاتصال بـ Supabase — اضغط للمحاولة مجدداً</div>}

      <div className={page==="dashboard"?"top":"page-top"}>
        {page==="dashboard" ? (
          <>
            <div className="top-row1">
              <div>
                <div style={{fontSize:12,color:"rgba(255,255,255,.75)"}}>مرحباً 👋 {user.name}</div>
                <div className="farm-name">{user.farmName||"farmy"}</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button className="top-icon" onClick={syncToServer} title="مزامنة">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" style={{width:18,height:18}}><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
                </button>
                <button className="top-icon" onClick={()=>setSidebarOpen(true)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" style={{width:20,height:20}}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                </button>
              </div>
            </div>
            <div className="top-date">
              <div className="date-badge">{Nav.cal}<span style={{fontSize:12,color:"rgba(255,255,255,.9)"}}>اليوم: {todayAr()}</span></div>
            </div>
          </>
        ) : (
          <>
            <button className="back-btn" onClick={()=>{
              const allowed = user?.role==="admin" ? [...PAGE_KEYS,"users"] : (perms?.pages || PAGE_KEYS);
              setPage(allowed[0] || "dashboard");
            }}>←</button>
            <div className="page-title">{pageTitle}</div>
            <button className="back-btn" onClick={()=>setSidebarOpen(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" style={{width:18,height:18}}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </>
        )}
      </div>

      <div className="cnt">
        {page==="dashboard" && pPages.includes("dashboard") && <DashPage expenses={expenses} revenues={revenues} inventory={inventory} workers={workers} lowStock={lowStock} setPage={setPage}/>}
        {page==="dashboard" && !pPages.includes("dashboard") && (
          <div style={{padding:40,textAlign:"center",color:"var(--text3)"}}>
            <div style={{fontSize:40,marginBottom:12}}>🔒</div>
            <div style={{fontSize:15,fontWeight:700}}>ليس لديك صلاحية لهذه الصفحة</div>
          </div>
        )}
        {page==="expenses"  && <ExpPage  data={expenses} setData={setExpenses} trash={trE} setTrash={setTrE} canEdit={canE("expenses")} canDel={canD("expenses")} showToast={showToast} audit={audit}/>}
        {page==="revenue"   && <RevPage  data={revenues} setData={setRevenues} trash={trR} setTrash={setTrR} canEdit={canE("revenue")}  canDel={canD("revenue")}  showToast={showToast} audit={audit}/>}
        {page==="inventory" && <InvPage  data={inventory} setData={setInventory} trash={trI} setTrash={setTrI} usageLog={usageLog} setUsageLog={setUsageLog} canEdit={canE("inventory")} canDel={canD("inventory")} showToast={showToast} lowStock={lowStock} audit={audit}/>}
        {page==="workers"   && <WrkPage  data={workers} setData={setWorkers} trash={trW} setTrash={setTrW} canEdit={canE("workers")} canDel={canD("workers")} showToast={showToast} audit={audit}/>}
        {page==="reports"   && <RepPage  expenses={expenses} revenues={revenues} workers={workers} inventory={inventory} auditLog={auditLog} users={users}/>}
        {page==="users"     && user.role==="admin" && <UsrPage users={users} setUsers={setUsers} currentUser={user} showToast={showToast} audit={audit}/>}
      </div>

      {sidebarOpen&&(
        <>
          <div className="sidebar-overlay" onClick={()=>setSidebarOpen(false)}/>
          <div className="sidebar">
            <div className="sb-header">
              <div className="sb-avatar">👤</div>
              <div className="sb-name">{user.name}</div>
              <div className="sb-role">{roleLabel} — {user.farmName||"farmy"}</div>
            </div>
            <div className="sb-body">
              {NAV.map(n=>(
                <button key={n.k} className={`sb-item ${page===n.k?"on":""}`}
                  onClick={()=>{ setPage(n.k); setSidebarOpen(false); }}>
                  <div className="sb-item-ic">{n.ic}</div>
                  {n.l}
                </button>
              ))}
              <div className="sb-divider"/>
              <button className="sb-item" onClick={()=>{ setSidebarOpen(false); syncToServer(); }}>
                <div className="sb-item-ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:20,height:20}}><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
                </div>
                مزامنة البيانات
              </button>
            </div>
            <div className="sb-footer">
              <button className="sb-logout" onClick={()=>{ setUser(null); setSidebarOpen(false); }}>
                <div className="sb-item-ic" style={{background:"#ffebee"}}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" style={{width:20,height:20}}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                </div>
                تسجيل الخروج
              </button>
              <div className="sb-version">farmy v6.1</div>
            </div>
          </div>
        </>
      )}

      {toast&&<div className="toast">{toast}</div>}
    </div>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────
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
      <div className="login-top">
        <div className="login-logo">🌾</div>
        <div className="login-title">farmy</div>
        <div className="login-sub">إدارة ذكية لمزرعتك</div>
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
        ].map((s,i)=>{
          const clsName = s.cls === "green" ? "stat-value green" : s.cls === "red" ? "stat-value red" : "stat-value blue";
          return (
          <div key={i} className="stat-card">
            <div className={`stat-icon ${s.bg}`}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className={clsName}>{fmt(s.val)}</div>
            <div className="stat-sub">جنيه</div>
          </div>
        )})}
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
        {sorted.map(item=>{
          const icon = EXPENSE_ICONS[item.category] || "📦";
          return (
          <div key={item.id} className="list-item">
            <div className="li-icon" style={{background:"#ffebee"}}>{icon}</div>
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
        )})}
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
        {sorted.map(item=>{
          const icon = REV_ICONS[item.product] || "📦";
          return (
          <div key={item.id} className="list-item">
            <div className="li-icon" style={{background:"#e8f5ec"}}>{icon}</div>
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
        )})}
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

  const handleScan=(code)=>{
    setShowScanner(false);
    const found=data.find(i=>i.barcode===code);
    if(found){
      setQ("");
      setUse(found); setUQ("");
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
  const [repTab,setRepTab]=useState("financial");

  const filtered=(arr,dk)=>{
    if(period==="daily") return arr.filter(i=>i[dk]===selDate);
    if(period==="monthly") return arr.filter(i=>(i[dk]||"").startsWith(selDate.slice(0,7)));
    if(period==="seasonal"){ const m=new Date(selDate).getMonth(); const s=m<3||m===11?[11,0,1,2]:m<6?[3,4,5]:m<9?[6,7,8]:[9,10,11]; return arr.filter(i=>s.includes(new Date(i[dk]).getMonth())); }
    return arr.filter(i=>(i[dk]||"").startsWith(selDate.slice(0,4)));
  };

  const fExp=filtered(expenses,"date"), fRev=filtered(revenues,"date");
  const totRev=fRev.reduce((s,r)=>s+(Number(r.amount)||0),0);
  const totExp=fExp.reduce((s,e)=>s+(Number(e.amount)||0),0);

  const wCost=workers.reduce((s,w)=>{
    const wd=daysBetween(w.startDate,w.endDate||null)*(Number(w.dailyRate)||0);
    return s+wd;
  },0);
  const wPaid=workers.reduce((s,w)=>s+(Number(w.paid)||0),0);

  const netProfit=totRev-totExp-wCost;
  const invValue=inventory.reduce((s,i)=>s+(Number(i.quantity)||0)*(Number(i.price)||0),0);

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
      <div className="rep-tabs">
        {TABS.map(tb=><button key={tb.k} className={`rep-tab ${period===tb.k?"on":""}`} onClick={()=>setPeriod(tb.k)}>{tb.l}</button>)}
      </div>
      <div className="rep-date">
        {Nav.cal}<input type="date" value={selDate} onChange={e=>setSelDate(e.target.value)}/>
      </div>

      <div className="rep-tabs" style={{paddingTop:8}}>
        {REP_TABS.map(tb=><button key={tb.k} className={`rep-tab ${repTab===tb.k?"on":""}`} style={{fontSize:12}} onClick={()=>setRepTab(tb.k)}>{tb.l}</button>)}
      </div>

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
          <div className="section">
            <div className="section-title">مخطط الإيرادات والمصروفات (آخر 5 أيام)</div>
            <div className="bar-chart">
              <div className="bar-wrap">
                {days5.map((d,i)=>{
                  const rh=Math.max(4,(d.r/maxV)*100);
                  const eh=Math.max(4,(d.e/maxV)*100);
                  return (
                    <div key={i} className="bar-group">
                      <div className="bar-pair">
                        <div className="bar g" style={{height:rh}} title={`إيراد: ${fmt(d.r)}`}/>
                        <div className="bar r" style={{height:eh}} title={`مصروف: ${fmt(d.e)}`}/>
                      </div>
                      <div className="bar-label">{d.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="section">
            <div className="section-title">تفاصيل الإيرادات</div>
            {fRev.length===0&&<div className="no-data">لا توجد بيانات</div>}
            {fRev.map(item=>(
              <div key={item.id} className="list-item" style={{margin:"0 0 8px"}}>
                <div className="li-icon" style={{background:"#e8f5ec"}}>{REV_ICONS[item.product]||"📦"}</div>
                <div className="li-body"><div className="li-title">{item.product}</div><div className="li-sub">{item.date}</div></div>
                <div className="li-right"><div className="li-amount" style={{color:"var(--green)"}}>+{fmt(item.amount)}</div><div className="li-date">جنيه</div></div>
              </div>
            ))}
          </div>
          <div className="section" style={{paddingBottom:14}}>
            <div className="section-title">تفاصيل المصروفات</div>
            {fExp.length===0&&<div className="no-data">لا توجد بيانات</div>}
            {fExp.map(item=>(
              <div key={item.id} className="list-item" style={{margin:"0 0 8px"}}>
                <div className="li-icon" style={{background:"#ffebee"}}>{EXPENSE_ICONS[item.category]||"📦"}</div>
                <div className="li-body"><div className="li-title">{item.category}</div><div className="li-sub">{item.date}</div></div>
                <div className="li-right"><div className="li-amount" style={{color:"var(--red)"}}>-{fmt(item.amount)}</div><div className="li-date">جنيه</div></div>
              </div>
            ))}
          </div>
        </>
      )}

      {repTab==="workers"&&(
        <div className="section" style={{marginTop:12}}>
          <div className="section-title">تقرير العمالة</div>
          <div className="summary-card">
            <div className="sum-row"><span className="sum-label">👷 عدد العمال</span><span className="sum-value b">{workers.length}</span></div>
            <div className="sum-row"><span className="sum-label">✅ الحاضرين</span><span className="sum-value g">{workers.filter(w=>!w.endDate).length}</span></div>
            <div className="sum-row"><span className="sum-label">❌ المغادرين</span><span className="sum-value r">{workers.filter(w=>w.endDate).length}</span></div>
            <div className="sum-row"><span className="sum-label">💰 إجمالي تكلفة العمالة</span><span className="sum-value r">{fmt(wCost)} جنيه</span></div>
            <div className="sum-row"><span className="sum-label">💳 إجمالي المدفوع</span><span className="sum-value g">{fmt(wPaid)} جنيه</span></div>
            <div className="sum-row"><span className="sum-label">📊 المتبقي</span><span className={`sum-value ${wCost-wPaid>0?"r":"g"}`}>{fmt(wCost-wPaid)} جنيه</span></div>
          </div>
          {workers.length===0&&<div className="no-data">لا توجد بيانات</div>}
          {workers.map(w=>{
            const d=daysBetween(w.startDate,w.endDate||null), tot=d*(Number(w.dailyRate)||0), paid=Number(w.paid)||0;
            return (
              <div key={w.id} className="list-item" style={{margin:"0 0 8px"}}>
                <div className="li-icon" style={{background:"#e3f2fd"}}>👷</div>
                <div className="li-body">
                  <div className="li-title">{w.name}</div>
                  <div className="li-sub">{w.startDate} → {w.endDate||"حاضر"} · أيام: {d}</div>
                </div>
                <div className="li-right">
                  <div className="li-amount">{fmt(tot)}</div>
                  <div className="li-date">متبقي: {fmt(tot-paid)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {repTab==="inventory"&&(
        <div className="section" style={{marginTop:12}}>
          <div className="section-title">تقرير المخزن</div>
          <div className="summary-card">
            <div className="sum-row"><span className="sum-label">📦 عدد الأصناف</span><span className="sum-value b">{inventory.length}</span></div>
            <div className="sum-row"><span className="sum-label">💰 القيمة الإجمالية</span><span className="sum-value g">{fmt(invValue)} جنيه</span></div>
            <div className="sum-row"><span className="sum-label">⚠️ الكميات المنخفضة</span><span className="sum-value r">{inventory.filter(i=>Number(i.minStock)>0&&Number(i.quantity)<=Number(i.minStock)).length}</span></div>
          </div>
          {inventory.length===0&&<div className="no-data">لا توجد بيانات</div>}
          {inventory.map(i=>{
            const low=Number(i.minStock)>0&&Number(i.quantity)<=Number(i.minStock);
            return (
              <div key={i.id} className="inv-item">
                <div className="inv-top">
                  <div>
                    <div className="inv-name">{INV_ICONS[i.type]||"📦"} {i.name}</div>
                    <div className="inv-pkg">{i.type}</div>
                  </div>
                  <div className={`inv-row-v ${low?"warn":"ok"}`}>{fmt(i.quantity)} {i.unit}</div>
                </div>
                <div className="inv-rows">
                  <div className="inv-row"><div className="inv-row-l">الحد الأدنى</div><div className="inv-row-v">{fmt(i.minStock)||"—"}</div></div>
                  <div className="inv-row"><div className="inv-row-l">القيمة</div><div className="inv-row-v">{fmt(Number(i.quantity)*Number(i.price))} جنيه</div></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {repTab==="audit"&&(
        <div className="section" style={{marginTop:12}}>
          <div className="section-title">سجل التغييرات</div>
          {auditLog.length===0&&<div className="no-data">لا توجد بيانات</div>}
          {auditLog.slice(0,50).map(a=>{
            const actionColor=a.action==="delete"?"var(--red)":a.action==="add"?"var(--green)":"var(--orange)";
            return (
              <div key={a.id} className="audit-item">
                <div className="audit-user">👤 {getUserName(a.userId)} · <span style={{color:actionColor}}>{a.action}</span></div>
                <div className="audit-action">{a.entity}</div>
                {a.oldVal&&<div className="audit-change">قبل: {a.oldVal.slice(0,100)}</div>}
                {a.newVal&&<div className="audit-change">بعد: {a.newVal.slice(0,100)}</div>}
                <div className="audit-time">{a.time}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── USERS ─────────────────────────────────────────────────
function UsrPage({users,setUsers,currentUser,showToast,audit}) {
  const [showForm,setShowForm]=useState(false);
  const [edit,setEdit]=useState(null);
  const [f,setF]=useState({});
  const s=(k,v)=>setF(x=>{
    const nf={...x,[k]:v};
    if(k==="role"&&v!=="admin"){ nf.permissions=defPerms(); }
    return nf;
  });

  const save=()=>{
    const item={...f,id:edit?edit.id:Date.now(),status:edit?edit.status:"active",createdBy:edit?edit.createdBy:currentUser.id};
    if(edit){ audit("edit","مستخدم",edit,item); setUsers(u=>u.map(x=>x.id===edit.id?item:x)); }
    else{ audit("add","مستخدم",null,item); setUsers(u=>[...u,item]); }
    setShowForm(false);setEdit(null);setF({});showToast("تم الحفظ ✓");
  };
  const del=id=>{ const u=users.find(x=>x.id===id); if(u){ audit("delete","مستخدم",u,null); setUsers(us=>us.filter(x=>x.id!==id)); showToast("تم الحذف"); } };
  const toggleStatus=id=>{ setUsers(u=>u.map(x=>x.id===id?{...x,status:x.status==="active"?"suspended":"active"}:x)); showToast("تم تغيير الحالة"); };
  const togglePerm=(id,pk,field)=>{
    setUsers(u=>u.map(x=>{
      if(x.id!==id) return x;
      const p={...x.permissions};
      const arr=[...(p[field]||[])];
      if(arr.includes(pk)) p[field]=arr.filter(a=>a!==pk);
      else p[field]=[...arr,pk];
      return {...x,permissions:p};
    }));
  };

  return (
    <div>
      <button className="add-btn-full" onClick={()=>{setF({role:"manager"});setEdit(null);setShowForm(true);}}>+ إضافة مستخدم</button>
      <div className="section"><div className="section-title">المستخدمون</div></div>
      {users.length===0&&<div className="no-data">لا توجد بيانات</div>}
      {users.map(u=>{
        const isAdmin=u.role==="admin";
        const isSuspended=u.status==="suspended";
        return (
          <div key={u.id} className="usr-item">
            <div className="w-avatar">👤</div>
            <div style={{flex:1}}>
              <div className="w-name">{u.name} <span style={{fontSize:11,color:"var(--text3)",fontWeight:400}}>({u.username})</span></div>
              <div className="w-daily">{u.role==="admin"?"مدير":u.role==="manager"?"مدير فرع":"مشرف"} · {u.phone||"—"}</div>
              <div style={{fontSize:11,color:isSuspended?"var(--red)":"var(--green)",marginTop:2}}>{isSuspended?"🚫 موقوف":"✅ نشط"}</div>
            </div>
            <div style={{display:"flex",gap:4,alignItems:"center"}}>
              {!isAdmin&&<button className="ibt" style={{background:isSuspended?"var(--green3)":"#ffebee",color:isSuspended?"var(--green)":"var(--red)"}} onClick={()=>toggleStatus(u.id)}>{isSuspended?"✅":"🚫"}</button>}
              <button className="ibt ibt-g" onClick={()=>{setF({...u,password:""});setEdit(u);setShowForm(true);}}>✏️</button>
              {!isAdmin&&<button className="ibt ibt-r" onClick={()=>del(u.id)}>🗑️</button>}
            </div>
          </div>
        );
      })}

      {showForm&&(
        <div className="modal-ov" onClick={()=>setShowForm(false)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div className="modal-handle"/>
            <div className="modal-title">{edit?"تعديل مستخدم":"+ إضافة مستخدم"}</div>
            <div className="frow2">
              <div><div className="flbl">الاسم</div><input className="finp" value={f.name||""} onChange={e=>s("name",e.target.value)}/></div>
              <div><div className="flbl">الهاتف</div><input className="finp" value={f.phone||""} onChange={e=>s("phone",e.target.value)}/></div>
            </div>
            <div className="frow2">
              <div><div className="flbl">اسم المستخدم</div><input className="finp" value={f.username||""} onChange={e=>s("username",e.target.value)}/></div>
              <div><div className="flbl">كلمة المرور {edit?"(اترك فارغاً للحفظ)":""}</div><input className="finp" type="password" value={f.password||""} onChange={e=>s("password",e.target.value)}/></div>
            </div>
            <div className="frow"><div className="flbl">الدور</div>
              <select className="finp" value={f.role||"manager"} onChange={e=>s("role",e.target.value)}>
                <option value="manager">مدير فرع</option>
                <option value="supervisor">مشرف</option>
                <option value="admin">مدير</option>
              </select></div>
            {f.role!=="admin"&&(
              <div style={{marginTop:10}}>
                <div style={{fontSize:12,fontWeight:700,color:"var(--text2)",marginBottom:6}}>الصلاحيات</div>
                <div className="perm-grid">
                  <div style={{fontSize:11,color:"var(--text3)"}}>الصفحة</div>
                  <div style={{fontSize:11,color:"var(--text3)",textAlign:"center"}}>عرض</div>
                  <div style={{fontSize:11,color:"var(--text3)",textAlign:"center"}}>تعديل</div>
                  <div style={{fontSize:11,color:"var(--text3)",textAlign:"center"}}>حذف</div>
                  {PAGE_KEYS.map(pk=>{
                    const p=f.permissions||defPerms();
                    return (
                      <React.Fragment key={pk}>
                        <div style={{fontSize:12}}>{pk}</div>
                        <button className="ptoggle" style={{background:(p.pages||[]).includes(pk)?"var(--green3)":"var(--bg)",color:(p.pages||[]).includes(pk)?"var(--green)":"var(--text3)"}} onClick={()=>togglePerm(f.id||Date.now(),pk,"pages")}>{(p.pages||[]).includes(pk)?"✓":"✗"}</button>
                        <button className="ptoggle" style={{background:(p.canEdit||[]).includes(pk)?"var(--green3)":"var(--bg)",color:(p.canEdit||[]).includes(pk)?"var(--green)":"var(--text3)"}} onClick={()=>togglePerm(f.id||Date.now(),pk,"canEdit")}>{(p.canEdit||[]).includes(pk)?"✓":"✗"}</button>
                        <button className="ptoggle" style={{background:(p.canDelete||[]).includes(pk)?"var(--green3)":"var(--bg)",color:(p.canDelete||[]).includes(pk)?"var(--green)":"var(--text3)"}} onClick={()=>togglePerm(f.id||Date.now(),pk,"canDelete")}>{(p.canDelete||[]).includes(pk)?"✓":"✗"}</button>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}
            <div style={{height:10}}/>
            <button className="save-btn" onClick={save}>حفظ</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RESTORE MODAL ─────────────────────────────────────────
function RestoreModal({trash,onRestore,onClose}) {
  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}>
        <div className="modal-handle"/>
        <div className="modal-title">🗑 استرجاع المحذوفات</div>
        {trash.length===0&&<div className="no-data">لا يوجد محذوفات</div>}
        {trash.map((item,i)=>{
          const name=item.name||item.category||item.product||"عنصر";
          return (
            <div key={item._d||i} className="restore-row">
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700}}>{name}</div>
                <div style={{fontSize:11,color:"var(--text3)"}}>تاريخ الحذف: {new Date(item._d).toLocaleString("ar-EG")}</div>
              </div>
              <button className="ibt ibt-g" onClick={()=>onRestore(item)}>↩️</button>
            </div>
          );
        })}
        <button style={{width:"100%",marginTop:10,padding:11,background:"var(--bg)",border:"1px solid var(--border)",borderRadius:10,fontFamily:"'Cairo',sans-serif",fontSize:14,cursor:"pointer",color:"var(--text2)"}} onClick={onClose}>إغلاق</button>
      </div>
    </div>
  );
}
