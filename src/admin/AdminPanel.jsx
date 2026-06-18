import { useState, useEffect } from "react";
import { useApi } from "../context/ApiContext";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../context/ApiContext";

// ─── Spinner ──────────────────────────────────────────────────
function Spinner({ sm }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`rounded-full border-2 border-cyan-400 border-t-transparent animate-spin inline-block ${sm?"w-3 h-3":"w-4 h-4"}`}/>
      {!sm && <span>Processing...</span>}
    </span>
  );
}

// ─── API helper ───────────────────────────────────────────────
async function apiPost(payload) {
  const res = await fetch(API_URL, {
    method:"POST", redirect:"follow",
    headers:{"Content-Type":"text/plain"},
    body: JSON.stringify(payload)
  });
  return res.json();
}

// ─── Search bar ───────────────────────────────────────────────
function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
      <input type="text" className="input-dark pl-9 py-2 text-sm w-full"
        placeholder={placeholder||"Search..."} value={value} onChange={e=>onChange(e.target.value)}/>
      {value && <button onClick={()=>onChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs">✕</button>}
    </div>
  );
}

// ─── PDF: Cards ───────────────────────────────────────────────
async function generateCardsPDF(cards, type, siteUrl) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
  const pageW=210, pageH=297, margin=10;
  const cardW=(pageW-margin*3)/2;
  const cardH=(pageH-margin*5)/4;
  const typeLabel = type==="quiz"?"Quiz":"Olympiad";
  let idx=0;
  while (idx<cards.length) {
    if (idx>0) doc.addPage();
    for (let row=0;row<4;row++) {
      for (let col=0;col<2;col++) {
        if (idx>=cards.length) break;
        const x=margin+col*(cardW+margin);
        const y=margin+row*(cardH+margin);
        doc.setFillColor(255,255,255); doc.roundedRect(x,y,cardW,cardH,3,3,"F");
        doc.setDrawColor(0,150,180); doc.setLineWidth(0.5); doc.roundedRect(x,y,cardW,cardH,3,3,"S");
        doc.setLineDashPattern([1,1],0); doc.setDrawColor(200,200,200);
        doc.roundedRect(x+0.5,y+0.5,cardW-1,cardH-1,3,3,"S"); doc.setLineDashPattern([],0);
        doc.setFillColor(11,20,40); doc.rect(x,y,cardW,10,"F");
        doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(0,220,240);
        doc.text(`SPARK FEST — ${typeLabel.toUpperCase()} REGISTRATION CARD`,x+cardW/2,y+6.5,{align:"center"});
        doc.setFontSize(6.5); doc.setTextColor(100,100,100);
        doc.text("CARD CODE",x+cardW/2,y+16,{align:"center"});
        doc.setFont("courier","bold"); doc.setFontSize(12); doc.setTextColor(10,10,10);
        doc.text(cards[idx].card_code||cards[idx],x+cardW/2,y+23,{align:"center"});
        doc.setDrawColor(220,220,220); doc.setLineWidth(0.3); doc.line(x+5,y+27,x+cardW-5,y+27);
        doc.setFont("helvetica","normal"); doc.setFontSize(6.5); doc.setTextColor(80,80,80);
        doc.text("Register at:",x+cardW/2,y+32,{align:"center"});
        doc.setFont("helvetica","bold"); doc.setFontSize(7); doc.setTextColor(0,80,180);
        doc.text(siteUrl||"https://spark-fest.netlify.app",x+cardW/2,y+37,{align:"center"});
        doc.setFont("helvetica","italic"); doc.setFontSize(5.5); doc.setTextColor(180,50,50);
        doc.text("* One-time use only. Non-transferable.",x+cardW/2,y+cardH-4,{align:"center"});
        idx++;
      }
    }
  }
  doc.save(`sparkfest-${typeLabel.toLowerCase()}-cards.pdf`);
}

// ─── PDF: Registration list ───────────────────────────────────
async function generateRegListPDF(data, title) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
  const pageW=210;
  doc.setFillColor(255,255,255); doc.rect(0,0,pageW,297,"F");
  doc.setFillColor(11,20,40); doc.rect(0,0,pageW,28,"F");
  doc.setFont("helvetica","bold"); doc.setFontSize(16); doc.setTextColor(0,220,240);
  doc.text("SPARK FEST 2026",pageW/2,12,{align:"center"});
  doc.setFontSize(10); doc.setTextColor(200,200,200);
  doc.text(title,pageW/2,21,{align:"center"});
  let y=38;
  doc.setFillColor(240,248,255); doc.rect(10,y-5,pageW-20,10,"F");
  doc.setFontSize(8); doc.setTextColor(0,80,150); doc.setFont("helvetica","bold");
  doc.text("#",14,y); doc.text("Name / Team",24,y); doc.text("Institution",90,y); doc.text("Status",170,y);
  y+=8;
  data.forEach((r,i)=>{
    if(y>275){doc.addPage();doc.setFillColor(255,255,255);doc.rect(0,0,210,297,"F");y=20;}
    doc.setFillColor(i%2===0?250:255,i%2===0?252:255,255); doc.rect(10,y-5,pageW-20,9,"F");
    doc.setTextColor(50,50,50); doc.setFont("helvetica","normal"); doc.setFontSize(7.5);
    doc.text(String(i+1),14,y);
    doc.text((r.team_name||r.name||"").substring(0,28),24,y);
    doc.text((r.institution||"").substring(0,25),90,y);
    const st=r.payment_status||"pending";
    doc.setTextColor(st==="confirmed"?0:st==="pending"?160:200,st==="confirmed"?130:80,0);
    doc.text(st.toUpperCase(),170,y); y+=9;
  });
  doc.setFont("helvetica","italic"); doc.setFontSize(7); doc.setTextColor(150,150,150);
  doc.text(`Generated: ${new Date().toLocaleString()} | Total: ${data.length}`,pageW/2,285,{align:"center"});
  doc.save(`sparkfest-${title.replace(/\s+/g,"-").toLowerCase()}.pdf`);
}

// ─── PDF: Result ─────────────────────────────────────────────
async function generateResultPDF(data, title) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
  const pageW=210;
  doc.setFillColor(255,255,255); doc.rect(0,0,pageW,297,"F");
  doc.setFillColor(11,20,40); doc.rect(0,0,pageW,32,"F");
  doc.setFont("helvetica","bold"); doc.setFontSize(18); doc.setTextColor(0,220,240);
  doc.text("SPARK FEST 2026",pageW/2,14,{align:"center"});
  doc.setFontSize(11); doc.setTextColor(200,200,200);
  doc.text(title,pageW/2,24,{align:"center"});
  doc.setDrawColor(0,200,220); doc.setLineWidth(0.5); doc.line(15,33,pageW-15,33);
  let y=42;
  const medals=["1ST PLACE","2ND PLACE","3RD PLACE"];
  const bgColors=[[255,248,220],[245,245,245],[255,245,230]];
  const borderColors=[[180,140,0],[130,130,130],[160,100,40]];
  const rankColors=[[120,90,0],[80,80,80],[120,70,20]];
  data.slice(0,3).forEach((r,i)=>{
    doc.setFillColor(...bgColors[i]); doc.roundedRect(10,y,pageW-20,14,2,2,"F");
    doc.setDrawColor(...borderColors[i]); doc.setLineWidth(0.4); doc.roundedRect(10,y,pageW-20,14,2,2,"S");
    doc.setFont("helvetica","bold"); doc.setFontSize(8.5); doc.setTextColor(...rankColors[i]);
    doc.text(medals[i],18,y+9);
    doc.setTextColor(20,20,20); doc.text((r.team_name||r.name||"").substring(0,34),55,y+9);
    doc.setTextColor(0,80,160); doc.text(String(r.total_marks||r.marks||0),pageW-18,y+9,{align:"right"});
    y+=16;
  });
  y+=4;
  doc.setFillColor(235,245,255); doc.rect(10,y-5,pageW-20,10,"F");
  doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(0,80,150);
  doc.text("Rank",14,y); doc.text("Name / Team",30,y); doc.text("Institution",110,y); doc.text("Marks",pageW-18,y,{align:"right"});
  y+=8;
  data.slice(3).forEach((r,i)=>{
    if(y>275){doc.addPage();doc.setFillColor(255,255,255);doc.rect(0,0,210,297,"F");y=20;}
    doc.setFillColor(i%2===0?250:255,i%2===0?252:255,255); doc.rect(10,y-5,pageW-20,9,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(80,80,80); doc.text(`#${i+4}`,14,y);
    doc.setFont("helvetica","normal"); doc.setTextColor(20,20,20); doc.text((r.team_name||r.name||"").substring(0,32),30,y);
    doc.setTextColor(100,100,100); doc.text((r.institution||"").substring(0,20),110,y);
    doc.setFont("helvetica","bold"); doc.setTextColor(0,80,160); doc.text(String(r.total_marks||r.marks||0),pageW-18,y,{align:"right"});
    y+=9;
  });
  doc.setFont("helvetica","italic"); doc.setFontSize(7); doc.setTextColor(150,150,150);
  doc.text(`Spark Fest 2026 | Generated: ${new Date().toLocaleString()}`,pageW/2,285,{align:"center"});
  doc.save(`result-${title.replace(/\s+/g,"-").toLowerCase()}.pdf`);
}

// ─── Constants ────────────────────────────────────────────────
const ROUNDS=[
  {id:"round1",label:"Round 1",next:"round2"},
  {id:"round2",label:"Round 2",next:"round3"},
  {id:"round3",label:"Round 3",next:"final"},
  {id:"final", label:"Final Round",next:null},
];
const SUBJECTS=[
  {id:"mathematics",       label:"Mathematics"},
  {id:"physics",           label:"Physics"},
  {id:"chemistry",         label:"Chemistry"},
  {id:"biology",           label:"Biology"},
  {id:"linguistic_science",label:"Linguistic Science"},
];

// ══════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════
export default function AdminPanel() {
  const {admin,login,logout}=useAuth();
  const [tab,setTab]=useState("dashboard");
  if(!admin) return <AdminLogin login={login}/>;
  const tabs=[
    {id:"dashboard",icon:"📊",label:"Dashboard"},
    {id:"cards",    icon:"🎴",label:"Card Generator"},
    {id:"regs",     icon:"📋",label:"Registrations"},
    {id:"marks",    icon:"📝",label:"Exam Marks"},
    {id:"results",  icon:"🏆",label:"Results"},
    {id:"notices",  icon:"📢",label:"Notices"},
    {id:"reports",  icon:"📬",label:"Reports"},
    {id:"settings", icon:"⚙️",label:"Settings"},
  ];
  return (
    <div className="min-h-screen flex" style={{background:"#0B0F1A"}}>
      <aside className="w-14 md:w-56 flex flex-col shrink-0 border-r border-white/5" style={{background:"#111827"}}>
        <div className="p-3 md:p-4 border-b border-white/5">
          <p className="hidden md:block text-cyan-400 font-bold text-sm">⚡ SPARK FEST</p>
          <p className="hidden md:block text-gray-500 text-xs mt-0.5">Admin Panel</p>
          <p className="md:hidden text-cyan-400 font-bold text-center text-lg">⚡</p>
        </div>
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className="w-full flex items-center gap-3 px-2 md:px-3 py-2.5 rounded-lg text-sm transition-all"
              style={{background:tab===t.id?"rgba(0,245,255,0.1)":"transparent",color:tab===t.id?"#00f5ff":"#9ca3af"}}>
              <span className="text-base shrink-0">{t.icon}</span>
              <span className="hidden md:block font-medium">{t.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-white/5">
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-2 md:px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-900/20 transition-all">
            <span>🚪</span><span className="hidden md:block">Logout</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="px-4 md:px-6 py-3 border-b border-white/5 flex items-center justify-between shrink-0" style={{background:"#111827"}}>
          <h1 className="font-bold text-white text-base md:text-lg">
            {tabs.find(t=>t.id===tab)?.icon} {tabs.find(t=>t.id===tab)?.label}
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm hidden sm:block">👤 {admin.name}</span>
            <span className="text-xs px-2 py-1 rounded-full text-cyan-400 border border-cyan-400/30"
              style={{background:"rgba(0,245,255,0.08)"}}>{admin.role}</span>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {tab==="dashboard" && <Dashboard setTab={setTab}/>}
          {tab==="cards"     && <CardGenerator/>}
          {tab==="regs"      && <Registrations/>}
          {tab==="marks"     && <MarksEntry/>}
          {tab==="results"   && <Results/>}
          {tab==="notices"   && <AdminNotices/>}
          {tab==="reports"   && <AdminReports/>}
          {tab==="settings"  && <Settings/>}
        </div>
      </main>
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────
function AdminLogin({login}) {
  const [form,setForm]=useState({email:"",password:""});
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  async function handle(e){
    e.preventDefault();setError("");setLoading(true);
    try{const d=await login(form.email,form.password);if(!d.success)setError(d.message||"Login failed");}
    catch{setError("Network error.");}finally{setLoading(false);}
  }
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background:"#0B0F1A"}}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
            style={{background:"linear-gradient(135deg,#00f5ff22,#a855f722)",border:"1px solid rgba(0,245,255,0.3)"}}>⚡</div>
          <h1 className="text-2xl font-bold text-cyan-400">Admin Login</h1>
          <p className="text-gray-500 text-sm mt-1">Spark Fest Control Panel</p>
        </div>
        <form onSubmit={handle} className="glass-card p-6 space-y-4">
          <div><label className="block text-sm text-gray-400 mb-1">Email</label>
            <input type="email" className="input-dark" required placeholder="admin@sparkfest.com"
              value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}/></div>
          <div><label className="block text-sm text-gray-400 mb-1">Password</label>
            <input type="password" className="input-dark" required placeholder="••••••••"
              value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))}/></div>
          {error&&<p className="text-red-400 text-sm">❌ {error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg font-bold transition-all"
            style={{background:"#06b6d4",color:"#000",opacity:loading?0.6:1}}>
            {loading?<Spinner/>:"🔐 Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────
function Dashboard({setTab}) {
  const {notices}=useApi();
  const {admin}=useAuth();
  const [stats,setStats]=useState(null);
  const [recentRegs,setRecentRegs]=useState([]);

  useEffect(()=>{
    async function load(){
      try{
        const [q,o]=await Promise.all([
          apiPost({action:"getRegistrations",type:"quiz",token:admin.token}),
          apiPost({action:"getRegistrations",type:"olympiad",token:admin.token}),
        ]);
        const qd=q.data||[]; const od=o.data||[];
        setStats({
          quiz:qd.length, olympiad:od.length,
          qPending:qd.filter(r=>r.payment_status==="pending").length,
          oPending:od.filter(r=>r.payment_status==="pending").length,
          qConfirm:qd.filter(r=>r.payment_status==="confirmed").length,
          oConfirm:od.filter(r=>r.payment_status==="confirmed").length,
          totalReg:qd.length+od.length,
        });
        // Recent 5 registrations across both
        const all=[...qd.map(r=>({...r,_type:"Quiz"})),...od.map(r=>({...r,_type:"Olympiad"}))]
          .sort((a,b)=>new Date(b.registered_at)-new Date(a.registered_at))
          .slice(0,5);
        setRecentRegs(all);
      }catch{}
    }
    load();
  },[]);

  const now=new Date();
  const greeting=now.getHours()<12?"Good Morning":now.getHours()<17?"Good Afternoon":"Good Evening";

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{background:"linear-gradient(135deg,rgba(0,245,255,0.1),rgba(168,85,247,0.1))",border:"1px solid rgba(0,245,255,0.2)"}}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10"
          style={{background:"radial-gradient(circle,#00f5ff,transparent)",transform:"translate(30%,-30%)"}}/>
        <p className="text-gray-400 text-sm mb-1">{greeting},</p>
        <h2 className="text-2xl font-bold text-white mb-1">{admin.name} 👋</h2>
        <p className="text-gray-400 text-sm">
          {new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="text-xs px-3 py-1.5 rounded-full font-medium"
            style={{background:"rgba(0,245,255,0.15)",color:"#00f5ff",border:"1px solid rgba(0,245,255,0.3)"}}>
            ⚡ {stats?.totalReg??0} Total Registrations
          </span>
          <span className="text-xs px-3 py-1.5 rounded-full font-medium"
            style={{background:"rgba(245,158,11,0.15)",color:"#f59e0b",border:"1px solid rgba(245,158,11,0.3)"}}>
            ⏳ {(stats?.qPending??0)+(stats?.oPending??0)} Pending Verifications
          </span>
          <span className="text-xs px-3 py-1.5 rounded-full font-medium"
            style={{background:"rgba(34,197,94,0.15)",color:"#22c55e",border:"1px solid rgba(34,197,94,0.3)"}}>
            ✅ {(stats?.qConfirm??0)+(stats?.oConfirm??0)} Confirmed
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {icon:"🧩",label:"Quiz Registrations",value:stats?.quiz,color:"#00f5ff",sub:`${stats?.qConfirm??0} confirmed`},
          {icon:"🔭",label:"Olympiad Regs",     value:stats?.olympiad,color:"#a855f7",sub:`${stats?.oConfirm??0} confirmed`},
          {icon:"⏳",label:"Quiz Pending",       value:stats?.qPending,color:"#f59e0b",sub:"awaiting payment"},
          {icon:"⏳",label:"Olympiad Pending",   value:stats?.oPending,color:"#f59e0b",sub:"awaiting payment"},
        ].map((s,i)=>(
          <div key={i} className="glass-card p-4 hover:border-white/20 transition-all">
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-2xl font-bold" style={{color:s.color}}>{s.value??<span className="text-base text-gray-600">—</span>}</span>
            </div>
            <p className="text-gray-300 text-sm font-medium">{s.label}</p>
            <p className="text-gray-600 text-xs mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Quick actions */}
        <div className="glass-card p-5 md:col-span-1">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse inline-block"/>
            Quick Actions
          </h3>
          <div className="space-y-2">
            {[
              {label:"Generate Cards",    tab:"cards",   icon:"🎴",color:"#00f5ff"},
              {label:"View Registrations",tab:"regs",    icon:"📋",color:"#a855f7"},
              {label:"Enter Exam Marks",  tab:"marks",   icon:"📝",color:"#f59e0b"},
              {label:"Generate Results",  tab:"results", icon:"🏆",color:"#22c55e"},
              {label:"Post Notice",       tab:"notices", icon:"📢",color:"#06b6d4"},
            ].map(a=>(
              <button key={a.tab} onClick={()=>setTab(a.tab)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left border border-white/5 hover:border-white/20 transition-all group"
                style={{background:"rgba(255,255,255,0.02)"}}>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 transition-all group-hover:scale-110"
                  style={{background:a.color+"18",border:`1px solid ${a.color}44`}}>
                  {a.icon}
                </span>
                <span className="text-gray-300 group-hover:text-white transition-colors">{a.label}</span>
                <span className="ml-auto text-gray-600 group-hover:text-gray-400 text-xs">→</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent registrations */}
        <div className="glass-card p-5 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse inline-block"/>
              Recent Registrations
            </h3>
            <button onClick={()=>setTab("regs")} className="text-cyan-400 text-xs hover:underline">View all →</button>
          </div>
          {recentRegs.length===0?(
            <div className="text-center py-8 text-gray-600">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm">No registrations yet</p>
            </div>
          ):(
            <div className="space-y-2">
              {recentRegs.map((r,i)=>(
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                  style={{background:"rgba(255,255,255,0.03)"}}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
                    style={{background:r._type==="Quiz"?"rgba(0,245,255,0.15)":"rgba(168,85,247,0.15)"}}>
                    {r._type==="Quiz"?"🧩":"🔭"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{r.team_name||r.name}</p>
                    <p className="text-gray-500 text-xs">{r.institution} · {r._type}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background:r.payment_status==="confirmed"?"rgba(34,197,94,0.15)":r.payment_status==="rejected"?"rgba(239,68,68,0.15)":"rgba(245,158,11,0.15)",
                        color:r.payment_status==="confirmed"?"#22c55e":r.payment_status==="rejected"?"#ef4444":"#f59e0b"
                      }}>
                      {(r.payment_status||"pending").toUpperCase()}
                    </span>
                    <p className="text-gray-600 text-xs mt-0.5">{new Date(r.registered_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notices preview */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse inline-block"/>
            Active Notices ({notices.length})
          </h3>
          <button onClick={()=>setTab("notices")} className="text-cyan-400 text-xs hover:underline">Manage →</button>
        </div>
        {notices.length===0?(
          <p className="text-gray-500 text-sm">No notices published yet.</p>
        ):(
          <div className="grid md:grid-cols-2 gap-3">
            {notices.slice(0,4).map((n,i)=>(
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-white/5"
                style={{background:"rgba(255,255,255,0.02)"}}>
                <span className="text-yellow-400 text-lg shrink-0">📌</span>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{n.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{n.content}</p>
                  <p className="text-gray-600 text-xs mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── CARD GENERATOR ────────────────────────────────────────────
function CardGenerator() {
  const {admin}=useAuth();
  const [type,setType]=useState("quiz");
  const [count,setCount]=useState(8);
  const [loading,setLoading]=useState(false);
  const [fetching,setFetching]=useState(true);
  const [msg,setMsg]=useState("");
  const [batches,setBatches]=useState([]);
  const [siteUrl,setSiteUrl]=useState("https://spark-fest.netlify.app");

  // Delete mode state
  const [deleteMode,setDeleteMode]=useState(false);
  const [selected,setSelected]=useState(new Set());
  const [confirmDelete,setConfirmDelete]=useState(false);
  const [deleting,setDeleting]=useState(false);

  async function loadBatches(){
    setFetching(true);
    try{
      const d=await apiPost({action:"getCardBatches",token:admin.token});
      if(d.success) setBatches(d.data||[]);
    }catch{}finally{setFetching(false);}
  }

  useEffect(()=>{loadBatches();},[]);

  async function generate(){
    if(!count||count<1) return setMsg("❌ Enter a valid number.");
    setLoading(true);setMsg("");
    try{
      const d=await apiPost({action:"generateCards",count:parseInt(count),type,token:admin.token});
      if(d.success){setMsg(`✅ ${d.data.length} ${type} cards generated!`);loadBatches();}
      else setMsg("❌ "+d.message);
    }catch{setMsg("❌ Network error.");}finally{setLoading(false);}
  }

  function toggleSelect(id){
    setSelected(prev=>{
      const next=new Set(prev);
      next.has(id)?next.delete(id):next.add(id);
      return next;
    });
  }

  function selectAll(){
    if(selected.size===batches.length) setSelected(new Set());
    else setSelected(new Set(batches.map(b=>b.id)));
  }

  async function deleteSelected(){
    setDeleting(true);
    try{
      // Remove selected batches from backend PropertiesService via deleteCardBatches action
      const d=await apiPost({action:"deleteCardBatches",ids:Array.from(selected),token:admin.token});
      if(d.success){
        setMsg(`✅ ${selected.size} batch(es) deleted.`);
        setSelected(new Set());setDeleteMode(false);setConfirmDelete(false);
        loadBatches();
      }else setMsg("❌ "+d.message);
    }catch{setMsg("❌ Network error.");}finally{setDeleting(false);}
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Generate form */}
      <div className="glass-card p-6">
        <h3 className="font-bold text-white mb-1">🎴 Generate Registration Cards</h3>
        <p className="text-gray-500 text-xs mb-4">8 cards per A4 page. One card = one registration only. All admins share the same list.</p>
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Type</label>
            <div className="flex rounded-lg overflow-hidden border border-white/10">
              {["quiz","olympiad"].map(t=>(
                <button key={t} onClick={()=>setType(t)} className="flex-1 py-2 text-sm font-medium capitalize transition-all"
                  style={{background:type===t?"rgba(0,245,255,0.15)":"transparent",color:type===t?"#00f5ff":"#9ca3af"}}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Count</label>
            <input type="number" min="1" max="200" className="input-dark" value={count} onChange={e=>setCount(e.target.value)}/>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Website URL (on card)</label>
            <input type="text" className="input-dark" placeholder="https://spark-fest.netlify.app" value={siteUrl} onChange={e=>setSiteUrl(e.target.value)}/>
          </div>
        </div>
        <button onClick={generate} disabled={loading}
          className="px-6 py-2.5 rounded-lg font-bold text-sm transition-all"
          style={{background:"#00f5ff",color:"#000",opacity:loading?0.6:1}}>
          {loading?<Spinner/>:`⚡ Generate ${count} ${type} Cards`}
        </button>
        {msg&&<p className={`mt-3 text-sm ${msg.includes("✅")?"text-green-400":"text-red-400"}`}>{msg}</p>}
      </div>

      {/* Batches list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-bold text-white">📦 All Generated Batches
            <span className="text-gray-500 text-sm font-normal ml-2">({batches.length})</span>
          </h3>
          <div className="flex gap-2">
            <button onClick={loadBatches} className="text-cyan-400 text-xs hover:underline px-2">🔄 Refresh</button>
            {batches.length>0&&!deleteMode&&(
              <button onClick={()=>{setDeleteMode(true);setSelected(new Set());setConfirmDelete(false);}}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-all">
                🗑 Delete History
              </button>
            )}
            {deleteMode&&(
              <div className="flex gap-2 items-center flex-wrap">
                <button onClick={selectAll}
                  className="px-3 py-1.5 rounded-lg text-xs border border-white/20 text-gray-300 hover:border-white/40 transition-all">
                  {selected.size===batches.length?"Deselect All":"Select All"}
                </button>
                {selected.size>0&&!confirmDelete&&(
                  <button onClick={()=>setConfirmDelete(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-all">
                    Delete {selected.size} selected
                  </button>
                )}
                {confirmDelete&&(
                  <div className="flex gap-2 items-center">
                    <span className="text-red-400 text-xs font-bold">Are you sure?</span>
                    <button onClick={deleteSelected} disabled={deleting}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500 text-white hover:bg-red-400 transition-all"
                      style={{opacity:deleting?0.6:1}}>
                      {deleting?<Spinner sm/>:"✅ Confirm Delete"}
                    </button>
                    <button onClick={()=>setConfirmDelete(false)}
                      className="px-3 py-1.5 rounded-lg text-xs border border-white/20 text-gray-400 hover:border-white/40">
                      Cancel
                    </button>
                  </div>
                )}
                <button onClick={()=>{setDeleteMode(false);setSelected(new Set());setConfirmDelete(false);}}
                  className="px-3 py-1.5 rounded-lg text-xs border border-white/20 text-gray-400 hover:border-white/40 transition-all">
                  ✕ Exit
                </button>
              </div>
            )}
          </div>
        </div>

        {fetching&&<div className="glass-card p-6 text-center text-cyan-400"><Spinner/></div>}
        {!fetching&&batches.length===0&&<div className="glass-card p-6 text-center text-gray-500">No cards generated yet.</div>}

        {!fetching&&batches.map(batch=>(
          <div key={batch.id} className="glass-card p-4 transition-all"
            style={{
              borderColor: deleteMode&&selected.has(batch.id)?"rgba(239,68,68,0.6)":"rgba(255,255,255,0.08)",
              background:  deleteMode&&selected.has(batch.id)?"rgba(239,68,68,0.05)":"rgba(17,24,39,0.8)",
            }}>
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              {/* Checkbox in delete mode */}
              {deleteMode&&(
                <button onClick={()=>toggleSelect(batch.id)}
                  className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all"
                  style={{
                    borderColor:selected.has(batch.id)?"#ef4444":"rgba(255,255,255,0.3)",
                    background: selected.has(batch.id)?"#ef4444":"transparent"
                  }}>
                  {selected.has(batch.id)&&<span className="text-white text-xs font-bold">✓</span>}
                </button>
              )}
              <div className="flex-1 flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${batch.type==="quiz"?"text-cyan-400 bg-cyan-400/10":"text-purple-400 bg-purple-400/10"}`}>
                  {(batch.type||"quiz").toUpperCase()}
                </span>
                <span className="text-white font-semibold">{batch.count} Cards</span>
                <span className="text-gray-500 text-xs">{new Date(batch.createdAt).toLocaleString()}</span>
              </div>
              {!deleteMode&&(
                <button onClick={()=>generateCardsPDF(batch.cards,batch.type||"quiz",siteUrl)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/10 transition-all shrink-0">
                  ⬇ Download PDF
                </button>
              )}
            </div>

            {/* Card code preview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
              {(batch.cards||[]).slice(0,8).map((c,i)=>(
                <div key={i} className="rounded px-2 py-1.5 font-mono text-xs text-center border border-white/10"
                  style={{background:"#0f172a",color:"#00f5ff"}}>{c.card_code||c}</div>
              ))}
              {(batch.cards||[]).length>8&&(
                <div className="rounded px-2 py-1.5 text-xs text-center text-gray-500 border border-white/10"
                  style={{background:"#0f172a"}}>+{batch.cards.length-8} more</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── REGISTRATIONS ─────────────────────────────────────────────
function Registrations() {
  const {admin}=useAuth();
  const [compType,setCompType]=useState("quiz");
  const [payType,setPayType]=useState("bkash");
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(false);
  const [actionLoading,setActionLoading]=useState({});
  const [msg,setMsg]=useState("");
  const [search,setSearch]=useState("");

  async function load(){
    setLoading(true);setData(null);setMsg("");setSearch("");
    try{
      const d=await apiPost({action:"getRegistrations",type:compType,token:admin.token});
      if(d.success)setData(d.data);else setMsg("❌ "+d.message);
    }catch{setMsg("❌ Network error.");}finally{setLoading(false);}
  }
  useEffect(()=>{load();},[compType]);

  async function updateStatus(reg_id,status){
    setActionLoading(p=>({...p,[reg_id]:true}));setMsg("");
    try{
      const d=await apiPost({action:"updatePaymentStatus",type:compType,reg_id,status,token:admin.token});
      if(d.success){setMsg("✅ Updated to "+status);setData(prev=>prev.map(r=>r.reg_id===reg_id?{...r,payment_status:status}:r));}
      else setMsg("❌ "+d.message);
    }catch{setMsg("❌ Network error.");}finally{setActionLoading(p=>({...p,[reg_id]:false}));}
  }

  const q=search.toLowerCase();
  const filtered=(data||[]).filter(r=>{
    const matchPay=payType==="card"?(r.payment_method==="card"||(r.card_code&&!r.bkash_txn_id)):(r.payment_method==="bkash"||r.bkash_txn_id);
    if(!matchPay)return false;
    if(!q)return true;
    return[r.team_name,r.name,r.institution,r.contact_mobile,r.email,r.reg_id,r.bkash_txn_id,r.bkash_number,r.card_code,r.member1_name,r.member2_name,r.member3_name]
      .some(v=>(v||"").toString().toLowerCase().includes(q));
  });
  const statusColor={confirmed:"#22c55e",pending:"#f59e0b",rejected:"#ef4444"};

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex gap-2 flex-wrap items-center">
        {["quiz","olympiad"].map(t=>(
          <button key={t} onClick={()=>setCompType(t)}
            className="px-4 py-2 rounded-lg text-sm font-semibold capitalize border transition-all"
            style={{borderColor:compType===t?(t==="quiz"?"#00f5ff":"#a855f7"):"rgba(255,255,255,0.1)",
              color:compType===t?(t==="quiz"?"#00f5ff":"#a855f7"):"#9ca3af",
              background:compType===t?(t==="quiz"?"rgba(0,245,255,0.1)":"rgba(168,85,247,0.1)"):"transparent"}}>
            {t==="quiz"?"🧩 Quiz":"🔭 Olympiad"}
          </button>
        ))}
        {data&&data.length>0&&(
          <button onClick={()=>generateRegListPDF(data,`${compType==="quiz"?"Quiz":"Olympiad"} Registrations`)}
            className="px-4 py-2 rounded-lg text-sm font-semibold border border-green-500/40 text-green-400 hover:bg-green-500/10 transition-all ml-auto">
            ⬇ Download PDF
          </button>
        )}
      </div>
      <div className="flex gap-2 p-1 rounded-xl border border-white/10 w-fit" style={{background:"#111827"}}>
        {["bkash","card"].map(p=>(
          <button key={p} onClick={()=>setPayType(p)}
            className="px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all"
            style={{background:payType===p?"rgba(0,245,255,0.15)":"transparent",color:payType===p?"#00f5ff":"#9ca3af"}}>
            {p==="bkash"?"📱 Bkash":"🎴 Card"}
          </button>
        ))}
      </div>
      <SearchBar value={search} onChange={setSearch} placeholder="Search name, mobile, email, school, TrxID, card code, reg ID..."/>
      {msg&&<p className={`text-sm ${msg.includes("✅")?"text-green-400":"text-red-400"}`}>{msg}</p>}
      {loading&&<div className="glass-card p-8 text-center text-cyan-400"><Spinner/></div>}
      {!loading&&data&&(
        <>
          <p className="text-gray-400 text-sm">
            <span className="text-white font-bold">{filtered.length}</span> of {data.length} registrations
            <button onClick={load} className="ml-3 text-cyan-400 hover:underline text-xs">🔄 Refresh</button>
          </p>
          {filtered.length===0?<div className="glass-card p-8 text-center text-gray-500">No registrations found.</div>
            :<div className="space-y-3">
              {filtered.map((r,i)=>(
                <div key={i} className="glass-card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-base">{r.team_name||r.name}</p>
                      <p className="text-gray-400 text-sm">{r.institution}</p>
                      <p className="text-gray-400 text-xs mt-0.5">📧 {r.email} · 📱 {r.contact_mobile}</p>
                      {compType==="quiz"&&<p className="text-gray-500 text-xs mt-0.5">👥 {[r.member1_name,r.member2_name,r.member3_name].filter(Boolean).join(" · ")}</p>}
                      {compType==="olympiad"&&<p className="text-purple-400 text-xs mt-0.5">{r.subjects}</p>}
                      <p className="text-gray-600 text-xs font-mono mt-1">{r.reg_id}</p>
                    </div>
                    <div className="text-right space-y-1 shrink-0">
                      <p className="text-sm font-bold" style={{color:statusColor[r.payment_status]||"#f59e0b"}}>● {(r.payment_status||"pending").toUpperCase()}</p>
                      {payType==="bkash"&&<><p className="text-gray-400 text-xs">TxID: <span className="text-white">{r.bkash_txn_id}</span></p>
                        <p className="text-gray-400 text-xs">From: <span className="text-white">{r.bkash_number}</span></p></>}
                      {payType==="card"&&<p className="text-gray-400 text-xs">Card: <span className="text-cyan-400 font-mono text-xs">{r.card_code}</span></p>}
                      <p className="text-gray-600 text-xs">{new Date(r.registered_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
                    {actionLoading[r.reg_id]?<div className="flex-1 py-2 text-center text-cyan-400 text-sm"><Spinner/></div>
                      :payType==="bkash"?<>
                        {r.payment_status!=="confirmed"&&<button onClick={()=>updateStatus(r.reg_id,"confirmed")} className="flex-1 py-2 rounded-lg text-xs font-bold border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-all">✅ Confirm</button>}
                        {r.payment_status!=="rejected"&&<button onClick={()=>updateStatus(r.reg_id,"rejected")} className="flex-1 py-2 rounded-lg text-xs font-bold border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all">❌ Decline</button>}
                        {r.payment_status==="confirmed"&&<p className="flex-1 text-center text-green-400 text-xs py-2">✅ Confirmed</p>}
                      </>:<>
                        {r.payment_status==="confirmed"?<p className="flex-1 text-center text-green-400 text-xs py-2">✅ Auto-Confirmed (Card)</p>:null}
                        <button onClick={()=>updateStatus(r.reg_id,"rejected")} className="flex-1 py-2 rounded-lg text-xs font-bold border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all">🚫 Cancel</button>
                      </>}
                  </div>
                </div>
              ))}
            </div>}
        </>
      )}
    </div>
  );
}

// ── MARKS ENTRY ───────────────────────────────────────────────
function MarksEntry() {
  const {admin}=useAuth();
  const [compType,setCompType]=useState("quiz");
  const [quizRound,setQuizRound]=useState("round1");
  const [olympSubject,setOlympSubject]=useState("mathematics");
  const [allRegs,setAllRegs]=useState([]);
  const [savedMarks,setSavedMarks]=useState({});
  const [localMarks,setLocalMarks]=useState({});
  const [qualifiedIds,setQualifiedIds]=useState({});
  const [qualifyInput,setQualifyInput]=useState({round1:"",round2:"",round3:""});
  const [loading,setLoading]=useState(false);
  const [saving,setSaving]=useState({});
  const [qualifying,setQualifying]=useState(false);
  const [msg,setMsg]=useState("");
  const [search,setSearch]=useState("");

  async function loadRegs(){
    setLoading(true);setMsg("");
    try{
      const d=await apiPost({action:"getRegistrations",type:compType,token:admin.token});
      if(d.success)setAllRegs(d.data.filter(r=>r.payment_status==="confirmed"));
      else setMsg("❌ "+d.message);
    }catch{setMsg("❌ Network error.");}finally{setLoading(false);}
  }

  async function loadMarks(){
    try{
      const round=compType==="quiz"?quizRound:undefined;
      const subject=compType==="olympiad"?olympSubject:undefined;
      const d=await apiPost({action:"getResults",type:compType,round,subject,token:admin.token});
      if(d.success&&Array.isArray(d.data)){
        const m={};
        d.data.forEach(r=>{m[r.reg_id]=r.marks||r.total_marks||0;});
        setSavedMarks(m);setLocalMarks(m);
      }
    }catch{}
  }

  async function loadQualified(){
    try{
      const d=await apiPost({action:"getQualified",token:admin.token});
      if(d.success)setQualifiedIds(d.data||{});
    }catch{}
  }

  useEffect(()=>{loadRegs();loadQualified();},[compType]);
  useEffect(()=>{if(allRegs.length>0)loadMarks();},[quizRound,olympSubject,allRegs.length]);

  function getVisibleRegs(){
    if(compType==="olympiad"){
      return allRegs.filter(r=>(r.subjects||"").toLowerCase().includes(olympSubject.replace(/_/g," ").toLowerCase())||(r.subjects||"").toLowerCase().includes(olympSubject.toLowerCase()));
    }
    if(quizRound==="round1")return allRegs;
    const ids=qualifiedIds[quizRound]||[];
    if(ids.length===0)return[];
    return allRegs.filter(r=>ids.includes(r.reg_id));
  }

  async function saveMark(reg_id,name,teamName){
    const val=localMarks[reg_id];
    if(val===undefined||val==="")return setMsg("❌ Enter marks first.");
    setSaving(p=>({...p,[reg_id]:true}));
    try{
      const payload=compType==="quiz"
        ?{action:"saveMarks",type:"quiz",token:admin.token,reg_id,team_name:teamName,round:quizRound,marks:val}
        :{action:"saveMarks",type:"olympiad",token:admin.token,reg_id,name,subject:olympSubject,marks:val};
      const d=await apiPost(payload);
      if(d.success){setSavedMarks(p=>({...p,[reg_id]:val}));setMsg("✅ Marks saved for "+(teamName||name));}
      else setMsg("❌ "+d.message);
    }catch{setMsg("❌ Network error.");}finally{setSaving(p=>({...p,[reg_id]:false}));}
  }

  async function handleQualify(fromRound){
    const n=parseInt(qualifyInput[fromRound]);
    if(!n||n<1)return setMsg("❌ Enter how many teams qualify.");
    setQualifying(true);setMsg("");
    try{
      const d=await apiPost({action:"getResults",type:"quiz",round:fromRound,token:admin.token});
      if(!d.success)return setMsg("❌ "+d.message);
      const sorted=[...(d.data||[])].sort((a,b)=>(b.marks||b.total_marks||0)-(a.marks||a.total_marks||0));
      const top=sorted.slice(0,n);
      const nextRound=ROUNDS.find(r=>r.id===fromRound)?.next;
      if(!nextRound)return setMsg("❌ No next round.");
      const newQ={...qualifiedIds,[nextRound]:top.map(t=>t.reg_id)};
      setQualifiedIds(newQ);
      await apiPost({action:"saveQualified",round:nextRound,ids:top.map(t=>t.reg_id),token:admin.token});
      setMsg(`✅ Top ${n} teams qualified for ${ROUNDS.find(r=>r.id===nextRound)?.label}: ${top.map(t=>t.team_name).join(", ")}`);
    }catch{setMsg("❌ Network error.");}finally{setQualifying(false);}
  }

  const visible=getVisibleRegs();
  const q=search.toLowerCase();
  const filtered=visible.filter(r=>!q||[r.team_name,r.name,r.institution,r.contact_mobile,r.email].some(v=>(v||"").toString().toLowerCase().includes(q)));

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex gap-2">
        {["quiz","olympiad"].map(t=>(
          <button key={t} onClick={()=>{setCompType(t);setSearch("");setSavedMarks({});setLocalMarks({});}}
            className="px-4 py-2 rounded-lg text-sm font-semibold capitalize border transition-all"
            style={{borderColor:compType===t?(t==="quiz"?"#00f5ff":"#a855f7"):"rgba(255,255,255,0.1)",
              color:compType===t?(t==="quiz"?"#00f5ff":"#a855f7"):"#9ca3af",
              background:compType===t?(t==="quiz"?"rgba(0,245,255,0.1)":"rgba(168,85,247,0.1)"):"transparent"}}>
            {t==="quiz"?"🧩 Quiz":"🔭 Olympiad"}
          </button>
        ))}
      </div>

      {compType==="quiz"&&(
        <div className="glass-card p-4 space-y-4">
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Select Round</p>
            <div className="flex flex-wrap gap-2">
              {ROUNDS.map(r=>{
                const isLocked=r.id!=="round1"&&(!qualifiedIds[r.id]||qualifiedIds[r.id].length===0);
                return(
                  <button key={r.id} onClick={()=>{if(!isLocked){setQuizRound(r.id);setSearch("");setSavedMarks({});setLocalMarks({});}}}
                    className="px-4 py-2 rounded-lg text-sm border transition-all"
                    style={{borderColor:quizRound===r.id?"#00f5ff":isLocked?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.15)",
                      color:quizRound===r.id?"#00f5ff":isLocked?"#374151":"#9ca3af",
                      background:quizRound===r.id?"rgba(0,245,255,0.1)":"transparent",cursor:isLocked?"not-allowed":"pointer"}}>
                    {r.label}
                    {isLocked&&<span className="ml-1 text-gray-600">🔒</span>}
                    {!isLocked&&r.id!=="round1"&&qualifiedIds[r.id]&&<span className="ml-1 text-xs text-cyan-400">({qualifiedIds[r.id].length})</span>}
                  </button>
                );
              })}
            </div>
          </div>
          {quizRound!=="final"&&(
            <div className="border-t border-white/10 pt-4">
              <p className="text-sm text-gray-300 font-semibold mb-1">
                🏅 Qualify: {ROUNDS.find(r=>r.id===quizRound)?.label} → {ROUNDS.find(r=>r.id===ROUNDS.find(x=>x.id===quizRound)?.next)?.label}
              </p>
              <p className="text-gray-500 text-xs mb-3">Save marks first, then qualify top teams.</p>
              <div className="flex gap-3 items-end">
                <div className="w-40">
                  <label className="block text-xs text-gray-500 mb-1">Number of qualifiers</label>
                  <input type="number" min="1" className="input-dark text-sm py-2" placeholder="e.g. 10"
                    value={qualifyInput[quizRound]||""} onChange={e=>setQualifyInput(p=>({...p,[quizRound]:e.target.value}))}/>
                </div>
                <button onClick={()=>handleQualify(quizRound)} disabled={qualifying}
                  className="px-5 py-2 rounded-lg text-sm font-bold border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 transition-all"
                  style={{opacity:qualifying?0.6:1}}>
                  {qualifying?<Spinner/>:"⚡ Qualify Top Teams"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {compType==="olympiad"&&(
        <div className="glass-card p-4">
          <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Select Subject</p>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map(s=>(
              <button key={s.id} onClick={()=>{setOlympSubject(s.id);setSearch("");setSavedMarks({});setLocalMarks({});}}
                className="px-3 py-1.5 rounded-lg text-sm border transition-all"
                style={{borderColor:olympSubject===s.id?"#a855f7":"rgba(255,255,255,0.1)",
                  color:olympSubject===s.id?"#a855f7":"#9ca3af",
                  background:olympSubject===s.id?"rgba(168,85,247,0.1)":"transparent"}}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {msg&&<div className={`text-sm p-3 rounded-lg border ${msg.includes("✅")?"text-green-400 border-green-500/20 bg-green-500/5":"text-red-400 border-red-500/20 bg-red-500/5"}`}>{msg}</div>}
      <SearchBar value={search} onChange={setSearch} placeholder="Search by name, school, reg ID..."/>
      {loading&&<div className="glass-card p-8 text-center text-cyan-400"><Spinner/></div>}
      {!loading&&(
        <div className="glass-card overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">
                <span className="text-white font-bold">{filtered.length}</span> participants
                {compType==="quiz"&&<span className="text-cyan-400 ml-2">— {ROUNDS.find(r=>r.id===quizRound)?.label}</span>}
                {compType==="olympiad"&&<span className="text-purple-400 ml-2">— {SUBJECTS.find(s=>s.id===olympSubject)?.label}</span>}
              </p>
              {compType==="quiz"&&quizRound!=="round1"&&visible.length===0&&(
                <p className="text-yellow-400 text-xs mt-0.5">⚠️ No teams qualified for this round yet.</p>
              )}
            </div>
            <button onClick={()=>{loadRegs();loadMarks();}} className="text-cyan-400 text-xs hover:underline">🔄 Refresh</button>
          </div>
          {filtered.length===0?(
            <div className="p-8 text-center text-gray-500">
              {compType==="quiz"&&quizRound!=="round1"?"No teams qualified yet.":"No confirmed participants found."}
            </div>
          ):(
            <div className="divide-y divide-white/5">
              {filtered.map((r,i)=>{
                const isSaved=savedMarks[r.reg_id]!==undefined;
                const isDirty=localMarks[r.reg_id]!==savedMarks[r.reg_id];
                return(
                  <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-white/2">
                    <span className="text-gray-500 text-sm w-6 shrink-0">{i+1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{r.team_name||r.name}</p>
                      <p className="text-gray-500 text-xs">{r.institution}</p>
                    </div>
                    {isSaved&&!isDirty&&<span className="text-green-400 text-xs shrink-0">✓ {savedMarks[r.reg_id]}</span>}
                    <div className="flex items-center gap-2 shrink-0">
                      <input type="number" min="0" placeholder="Marks"
                        className="input-dark text-sm py-1.5 w-24 text-center"
                        value={localMarks[r.reg_id]??""}
                        onChange={e=>setLocalMarks(p=>({...p,[r.reg_id]:e.target.value}))}/>
                      <button onClick={()=>saveMark(r.reg_id,r.name,r.team_name)} disabled={saving[r.reg_id]}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all whitespace-nowrap"
                        style={{borderColor:isDirty?"#00f5ff":"rgba(255,255,255,0.1)",color:isDirty?"#00f5ff":"#6b7280",
                          background:isDirty?"rgba(0,245,255,0.08)":"transparent",opacity:saving[r.reg_id]?0.6:1}}>
                        {saving[r.reg_id]?<Spinner sm/>:isSaved&&!isDirty?"✎ Edit":"💾 Save"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── RESULTS ───────────────────────────────────────────────────
function Results() {
  const {admin}=useAuth();
  const {fetchSettings}=useApi();
  const [compType,setCompType]=useState("quiz");
  const [quizRound,setQuizRound]=useState("round1");
  const [olympSubject,setOlympSubject]=useState("mathematics");
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(false);
  const [publishing,setPublishing]=useState(false);
  const [removing,setRemoving]=useState(false);
  const [msg,setMsg]=useState("");
  const [search,setSearch]=useState("");
  const [publishedKeys,setPublishedKeys]=useState({});

  useEffect(()=>{
    async function loadPublished(){
      try{
        const res=await fetch(`${API_URL}?action=getSettings`);
        const d=await res.json();
        if(d.success){
          const keys={};
          Object.keys(d.data).forEach(k=>{if(k.startsWith("result_"))keys[k]=d.data[k];});
          setPublishedKeys(keys);
        }
      }catch{}
    }
    loadPublished();
  },[]);

  async function load(){
    setLoading(true);setData(null);setMsg("");setSearch("");
    try{
      const d=await apiPost({action:"getResults",type:compType,round:compType==="quiz"?quizRound:undefined,subject:compType==="olympiad"?olympSubject:undefined,token:admin.token});
      if(d.success){
        let arr=Array.isArray(d.data)?d.data:(d.data[olympSubject]||[]);
        arr=[...arr].sort((a,b)=>(b.total_marks||b.marks||0)-(a.total_marks||a.marks||0));
        setData(arr);
      }else setMsg("❌ "+d.message);
    }catch{setMsg("❌ Network error.");}finally{setLoading(false);}
  }

  const publishKey=compType==="quiz"?`result_quiz_${quizRound}`:`result_olympiad_${olympSubject}`;
  const isPublished=publishedKeys[publishKey]==="published";

  async function publish(){
    setPublishing(true);setMsg("");
    try{
      const d=await apiPost({action:"updateSettings",token:admin.token,[publishKey]:"published"});
      if(d.success){setMsg("✅ Result published on website!");setPublishedKeys(p=>({...p,[publishKey]:"published"}));fetchSettings();}
      else setMsg("❌ "+d.message);
    }catch{setMsg("❌ Network error.");}finally{setPublishing(false);}
  }

  async function unpublish(){
    setRemoving(true);setMsg("");
    try{
      const d=await apiPost({action:"updateSettings",token:admin.token,[publishKey]:""});
      if(d.success){setMsg("✅ Result removed from website.");setPublishedKeys(p=>({...p,[publishKey]:""}));fetchSettings();}
      else setMsg("❌ "+d.message);
    }catch{setMsg("❌ Network error.");}finally{setRemoving(false);}
  }

  const q=search.toLowerCase();
  const filtered=(data||[]).filter(r=>!q||[r.team_name,r.name,r.institution].some(v=>(v||"").toString().toLowerCase().includes(q)));
  const roundLabel=ROUNDS.find(r=>r.id===quizRound)?.label||"";
  const subjectLabel=SUBJECTS.find(s=>s.id===olympSubject)?.label||"";
  const resultTitle=compType==="quiz"?`Quiz — ${roundLabel}`:`Olympiad — ${subjectLabel}`;

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex gap-2 flex-wrap">
        {["quiz","olympiad"].map(t=>(
          <button key={t} onClick={()=>{setCompType(t);setData(null);}}
            className="px-4 py-2 rounded-lg text-sm font-semibold capitalize border transition-all"
            style={{borderColor:compType===t?(t==="quiz"?"#00f5ff":"#a855f7"):"rgba(255,255,255,0.1)",
              color:compType===t?(t==="quiz"?"#00f5ff":"#a855f7"):"#9ca3af",
              background:compType===t?(t==="quiz"?"rgba(0,245,255,0.1)":"rgba(168,85,247,0.1)"):"transparent"}}>
            {t==="quiz"?"🧩 Quiz":"🔭 Olympiad"}
          </button>
        ))}
      </div>
      {compType==="quiz"&&(
        <div className="flex flex-wrap gap-2">
          {ROUNDS.map(r=>(
            <button key={r.id} onClick={()=>{setQuizRound(r.id);setData(null);}}
              className="px-3 py-1.5 rounded-lg text-sm border transition-all"
              style={{borderColor:quizRound===r.id?"#00f5ff":"rgba(255,255,255,0.1)",
                color:quizRound===r.id?"#00f5ff":"#9ca3af",
                background:quizRound===r.id?"rgba(0,245,255,0.1)":"transparent"}}>
              {r.label}
              {publishedKeys[`result_quiz_${r.id}`]==="published"&&<span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-green-400 align-middle"/>}
            </button>
          ))}
        </div>
      )}
      {compType==="olympiad"&&(
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map(s=>(
            <button key={s.id} onClick={()=>{setOlympSubject(s.id);setData(null);}}
              className="px-3 py-1.5 rounded-lg text-sm border transition-all"
              style={{borderColor:olympSubject===s.id?"#a855f7":"rgba(255,255,255,0.1)",
                color:olympSubject===s.id?"#a855f7":"#9ca3af",
                background:olympSubject===s.id?"rgba(168,85,247,0.1)":"transparent"}}>
              {s.label}
              {publishedKeys[`result_olympiad_${s.id}`]==="published"&&<span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-green-400 align-middle"/>}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-3 items-center">
        <button onClick={load} disabled={loading}
          className="px-5 py-2.5 rounded-lg font-bold text-sm border border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/10 transition-all"
          style={{opacity:loading?0.6:1}}>
          {loading?<Spinner/>:"📊 Load Results"}
        </button>
        {data&&data.length>0&&(
          <button onClick={()=>generateResultPDF(filtered.length>0?filtered:data,resultTitle)}
            className="px-5 py-2.5 rounded-lg font-bold text-sm border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 transition-all">
            ⬇ Download PDF
          </button>
        )}
        {data&&data.length>0&&!isPublished&&(
          <button onClick={publish} disabled={publishing}
            className="px-5 py-2.5 rounded-lg font-bold text-sm border border-green-500/40 text-green-400 hover:bg-green-500/10 transition-all"
            style={{opacity:publishing?0.6:1}}>
            {publishing?<Spinner/>:"📢 Publish on Website"}
          </button>
        )}
        {isPublished&&(
          <div className="flex items-center gap-3">
            <span className="text-green-400 text-sm font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block"/>
              Published on website
            </span>
            <button onClick={unpublish} disabled={removing}
              className="px-4 py-2 rounded-lg text-xs font-bold border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
              style={{opacity:removing?0.6:1}}>
              {removing?<Spinner sm/>:"Remove"}
            </button>
          </div>
        )}
      </div>
      {msg&&<div className={`text-sm p-3 rounded-lg border ${msg.includes("✅")?"text-green-400 border-green-500/20 bg-green-500/5":"text-red-400 border-red-500/20 bg-red-500/5"}`}>{msg}</div>}
      {data&&<SearchBar value={search} onChange={setSearch} placeholder="Search by name, team, school..."/>}
      {data&&(
        <div className="glass-card overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-sm font-semibold text-white">{resultTitle} Results
              <span className="text-gray-500 ml-2">({filtered.length} entries)</span></p>
          </div>
          {filtered.length===0?<div className="p-8 text-center text-gray-500">No marks entered yet.</div>
            :<table className="w-full text-sm">
              <thead style={{background:"rgba(0,245,255,0.08)"}}>
                <tr>
                  <th className="px-4 py-3 text-left text-cyan-400 font-semibold w-16">Rank</th>
                  <th className="px-4 py-3 text-left text-cyan-400 font-semibold">Name / Team</th>
                  <th className="px-4 py-3 text-left text-cyan-400 font-semibold hidden md:table-cell">Institution</th>
                  <th className="px-4 py-3 text-right text-cyan-400 font-semibold">Marks</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r,i)=>(
                  <tr key={i} className="border-t border-white/5" style={{background:i<3?"rgba(234,179,8,0.04)":"transparent"}}>
                    <td className="px-4 py-3 font-bold text-yellow-400">{i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}</td>
                    <td className="px-4 py-3 text-white font-medium">{r.team_name||r.name}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">{r.institution||"—"}</td>
                    <td className="px-4 py-3 text-right text-cyan-400 font-bold">{r.total_marks||r.marks||0}</td>
                  </tr>
                ))}
              </tbody>
            </table>}
        </div>
      )}
    </div>
  );
}

// ── NOTICES ───────────────────────────────────────────────────
function AdminNotices() {
  const {admin}=useAuth();
  const {notices,fetchNotices}=useApi();
  const [form,setForm]=useState({title:"",content:""});
  const [editing,setEditing]=useState(null);
  const [loading,setLoading]=useState({});
  const [msg,setMsg]=useState("");

  async function callApi(payload,key){
    setLoading(p=>({...p,[key]:true}));setMsg("");
    try{
      const d=await apiPost({...payload,token:admin.token});
      if(d.success){setMsg("✅ "+d.message);fetchNotices();setForm({title:"",content:""});setEditing(null);}
      else setMsg("❌ "+d.message);
    }catch{setMsg("❌ Network error.");}finally{setLoading(p=>({...p,[key]:false}));}
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-5xl">
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold text-white">{editing?"✏️ Edit":"➕ New"} Notice</h3>
        <div><label className="block text-sm text-gray-400 mb-1">Title</label>
          <input className="input-dark" placeholder="Title..." value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))}/></div>
        <div><label className="block text-sm text-gray-400 mb-1">Content</label>
          <textarea rows="6" className="input-dark resize-none" placeholder="Content..." value={form.content} onChange={e=>setForm(p=>({...p,content:e.target.value}))}/></div>
        {msg&&<p className={`text-sm ${msg.includes("✅")?"text-green-400":"text-red-400"}`}>{msg}</p>}
        <div className="flex gap-2">
          <button disabled={loading.save||!form.title}
            onClick={()=>callApi(editing?{action:"manageNotice",operation:"update",notice_id:editing,...form}:{action:"manageNotice",operation:"create",...form},"save")}
            className="flex-1 py-2.5 rounded-lg font-bold text-sm transition-all"
            style={{background:"#06b6d4",color:"#000",opacity:loading.save||!form.title?0.5:1}}>
            {loading.save?<Spinner/>:editing?"Update":"Publish"}
          </button>
          {editing&&<button onClick={()=>{setEditing(null);setForm({title:"",content:""}); }}
            className="px-4 py-2.5 rounded-lg text-sm text-gray-400 border border-white/10">Cancel</button>}
        </div>
      </div>
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
        <h3 className="font-bold text-white">All Notices ({notices.length})</h3>
        {notices.length===0?<div className="glass-card p-6 text-center text-gray-500">No notices.</div>
          :notices.map((n,i)=>(
          <div key={i} className="glass-card p-4">
            <p className="font-semibold text-white text-sm mb-1 line-clamp-1">{n.title}</p>
            <p className="text-gray-400 text-xs mb-3 line-clamp-2">{n.content}</p>
            <div className="flex gap-2">
              <button onClick={()=>{setEditing(n.notice_id);setForm({title:n.title,content:n.content});}}
                className="flex-1 py-1.5 text-xs rounded border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10">✏️ Edit</button>
              <button disabled={loading["del_"+n.notice_id]}
                onClick={()=>callApi({action:"manageNotice",operation:"delete",notice_id:n.notice_id},"del_"+n.notice_id)}
                className="flex-1 py-1.5 text-xs rounded border border-red-500/30 text-red-400 hover:bg-red-500/10">
                {loading["del_"+n.notice_id]?<Spinner sm/>:"🗑️ Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── REPORTS ───────────────────────────────────────────────────
function AdminReports() {
  const {admin}=useAuth();
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(false);
  const [actionLoading,setActionLoading]=useState({});
  const [msg,setMsg]=useState("");
  const [search,setSearch]=useState("");

  async function load(){
    setLoading(true);
    try{const d=await apiPost({action:"getReports",token:admin.token});if(d.success)setData(d.data);}
    catch{}finally{setLoading(false);}
  }
  async function doAction(report_id,operation,status){
    setActionLoading(p=>({...p,[report_id]:true}));setMsg("");
    try{
      const d=await apiPost({action:"updateReportStatus",report_id,operation,status,token:admin.token});
      if(d.success){setMsg("✅ Done");load();}else setMsg("❌ "+d.message);
    }catch{setMsg("❌ Network error.");}finally{setActionLoading(p=>({...p,[report_id]:false}));}
  }
  const statusColor={unread:"#f59e0b",read:"#06b6d4",resolved:"#22c55e"};
  const q=search.toLowerCase();
  const filtered=(data||[]).filter(r=>!q||[r.name,r.email,r.message].some(v=>(v||"").toLowerCase().includes(q)));

  return (
    <div className="space-y-4 max-w-3xl">
      {!data?<div className="glass-card p-8 text-center">
        <button onClick={load} disabled={loading} className="px-6 py-3 rounded-lg font-bold" style={{background:"#06b6d4",color:"#000"}}>
          {loading?<Spinner/>:"📬 Load Reports"}
        </button>
      </div>:<>
        <div className="flex items-center justify-between">
          <p className="text-gray-400 text-sm">Total: <span className="text-white font-bold">{data.length}</span></p>
          <button onClick={load} className="text-cyan-400 text-sm hover:underline">🔄 Refresh</button>
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Search name, email, message..."/>
        {msg&&<p className={`text-sm ${msg.includes("✅")?"text-green-400":"text-red-400"}`}>{msg}</p>}
        {filtered.length===0?<div className="glass-card p-8 text-center text-gray-500">No reports.</div>
          :filtered.map((r,i)=>(
          <div key={i} className="glass-card p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="font-bold text-white">{r.name}</p>
                <p className="text-gray-400 text-sm">{r.email}</p>
                <p className="text-gray-600 text-xs">{new Date(r.submitted_at).toLocaleString()}</p>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-full border whitespace-nowrap"
                style={{color:statusColor[r.status]||"#f59e0b",borderColor:statusColor[r.status]||"#f59e0b",background:(statusColor[r.status]||"#f59e0b")+"18"}}>
                {(r.status||"unread").toUpperCase()}
              </span>
            </div>
            <p className="text-gray-300 text-sm mb-3 p-3 rounded-lg" style={{background:"rgba(255,255,255,0.03)"}}>{r.message}</p>
            <div className="flex gap-2">
              {actionLoading[r.report_id]?<div className="flex-1 py-2 text-center text-cyan-400"><Spinner/></div>
                :<>
                  <button onClick={()=>doAction(r.report_id,"update","resolved")} className="flex-1 py-1.5 text-xs rounded border border-green-500/30 text-green-400 hover:bg-green-500/10">✅ Resolved</button>
                  <button onClick={()=>doAction(r.report_id,"delete")} className="flex-1 py-1.5 text-xs rounded border border-red-500/30 text-red-400 hover:bg-red-500/10">🗑️ Delete</button>
                </>}
            </div>
          </div>
        ))}
      </>}
    </div>
  );
}

// ── SETTINGS ─────────────────────────────────────────────────
function Settings() {
  const {admin}=useAuth();
  const {settings,fetchSettings}=useApi();
  const [form,setForm]=useState({logo_url:"",banner_image_url:"",event_title:"",countdown_date:"",facebook_url:""});
  const [loaded,setLoaded]=useState(false);
  const [loading,setLoading]=useState(false);
  const [msg,setMsg]=useState("");

  useEffect(()=>{
    if(!loaded&&settings.event_title){
      setForm({logo_url:settings.logo_url||"",banner_image_url:settings.banner_image_url||"",
        event_title:settings.event_title||"",countdown_date:settings.countdown_date||"",facebook_url:settings.facebook_url||""});
      setLoaded(true);
    }
  },[settings]);

  async function handleSave(e){
    e.preventDefault();setMsg("");setLoading(true);
    try{
      const d=await apiPost({action:"updateSettings",token:admin.token,...form});
      if(d.success){setMsg("✅ Saved! Changes reflect instantly.");fetchSettings();}
      else setMsg("❌ "+d.message);
    }catch{setMsg("❌ Network error.");}finally{setLoading(false);}
  }

  const F=({label,k,type2="text",placeholder="",hint=""})=>(
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      {hint&&<p className="text-gray-500 text-xs mb-1">{hint}</p>}
      <input type={type2} placeholder={placeholder} className="input-dark" value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}/>
    </div>
  );

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSave} className="glass-card p-6 space-y-5">
        <div className="border-b border-white/10 pb-3"><h3 className="font-bold text-cyan-400">🖼️ Logo & Banner</h3>
          <p className="text-gray-500 text-xs mt-0.5">Use ImgBB Direct Link (https://i.ibb.co/...) — NOT the page link</p>
        </div>
        <F label="Logo URL" k="logo_url" placeholder="https://i.ibb.co/xxxxx/logo.png"
          hint="ImgBB → Upload → Copy 'Direct Link' (starts with i.ibb.co)"/>
        {form.logo_url&&<img src={form.logo_url} alt="Logo" className="h-16 w-16 object-contain rounded-lg border border-white/10"/>}
        <F label="Banner Image URL" k="banner_image_url" placeholder="https://i.ibb.co/xxxxx/banner.jpg"
          hint="Recommended: 1920×600px landscape image"/>
        {form.banner_image_url&&<img src={form.banner_image_url} alt="Banner" className="w-full h-32 object-cover rounded-lg border border-white/10"/>}
        <div className="border-b border-white/10 pb-3 pt-1"><h3 className="font-bold text-purple-400">⚙️ Event Settings</h3></div>
        <F label="Event Title" k="event_title" placeholder="Spark Fest — Ignite Your Curiosity"/>
        <F label="Countdown Date" k="countdown_date" type2="date" hint="Event date — shown on home page countdown"/>
        {form.countdown_date&&(
          <p className="text-cyan-400 text-xs -mt-3">📅 {new Date(form.countdown_date).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p>
        )}
        <F label="Facebook URL" k="facebook_url" placeholder="https://facebook.com/agrodut"/>
        {msg&&<div className="p-4 rounded-lg text-sm border"
          style={{color:msg.includes("✅")?"#4ade80":"#f87171",
            borderColor:msg.includes("✅")?"rgba(74,222,128,0.2)":"rgba(248,113,113,0.2)",
            background:msg.includes("✅")?"rgba(74,222,128,0.08)":"rgba(248,113,113,0.08)"}}>
          {msg}</div>}
        <button type="submit" disabled={loading} className="w-full py-3 rounded-lg font-bold text-lg transition-all"
          style={{background:"#06b6d4",color:"#000",boxShadow:"0 0 20px rgba(0,245,255,0.3)",opacity:loading?0.6:1}}>
          {loading?<Spinner/>:"💾 Save Settings"}
        </button>
      </form>
    </div>
  );
}