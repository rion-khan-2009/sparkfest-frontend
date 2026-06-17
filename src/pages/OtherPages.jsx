import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../context/ApiContext";
import { API_URL } from "../context/ApiContext";

// ══════════════════════════════════════════════════════════════
// STATUS
// ══════════════════════════════════════════════════════════════
export function Status() {
  const { post } = useApi();
  const [form, setForm]       = useState({ mobile:"", email:"" });
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  async function handleCheck(e) {
    e.preventDefault(); setError(""); setLoading(true); setResult(null);
    try {
      const mobile = form.mobile.replace(/\D/g, "").replace(/^0+/, "");
      const email  = form.email.trim().toLowerCase();
      const data   = await post({ action:"checkStatus", mobile, email });
      if (data.success) setResult(data);
      else setError(data.message);
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  const Badge = ({ status }) => {
    const m = { confirmed:{cls:"status-confirmed",label:"✅ Confirmed"}, pending:{cls:"status-pending",label:"⏳ Pending"}, rejected:{cls:"status-rejected",label:"❌ Rejected"} };
    const s = m[status] || m.pending;
    return <span className={s.cls}>{s.label}</span>;
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="section-title">🔍 Registration Status</h1>
          <p className="text-gray-400">Enter your mobile and email to check your status</p>
        </div>
        <form onSubmit={handleCheck} className="glass-card p-6 space-y-4 mb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Mobile Number</label>
            <div className="flex">
              <span className="flex items-center px-3 rounded-l-lg border border-r-0 border-white/10 text-gray-400 text-sm shrink-0" style={{background:"#0f172a"}}>+88</span>
              <input type="tel" className="input-dark rounded-l-none flex-1" placeholder="01XXXXXXXXX" maxLength={11} required
                value={form.mobile} onChange={e=>setForm(p=>({...p,mobile:e.target.value.replace(/\D/g,"").slice(0,11)}))}/>
            </div>
            {form.mobile && !/^01[0-9]{9}$/.test(form.mobile) && <p className="text-red-400 text-xs mt-1">⚠️ Must be 11 digits starting with 01</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email Address</label>
            <input type="email" placeholder="you@example.com" className="input-dark" required
              value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}/>
          </div>
          {error && <p className="text-red-400 text-sm">❌ {error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 font-bold rounded-lg transition-all"
            style={{background:"#06b6d4",color:"#000",opacity:loading?0.6:1}}>
            {loading?"⏳ Checking...":"🔍 Check Status"}
          </button>
        </form>

        {result && (
          <div className="space-y-4">
            {result.quiz && (
              <div className="glass-card p-6 border-l-4 border-cyan-400">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-cyan-400 text-lg">🧩 Quiz Competition</h3>
                  <Badge status={result.quiz.payment_status}/>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-gray-500">Team Name</p><p className="text-white font-medium">{result.quiz.team_name}</p></div>
                  <div><p className="text-gray-500">Institution</p><p className="text-white font-medium">{result.quiz.institution}</p></div>
                  <div className="col-span-2"><p className="text-gray-500">Registration ID</p><p className="font-mono text-cyan-400 text-xs">{result.quiz.reg_id}</p></div>
                </div>
              </div>
            )}
            {result.olympiad && (
              <div className="glass-card p-6 border-l-4 border-purple-400">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-purple-400 text-lg">🔭 Science Olympiad</h3>
                  <Badge status={result.olympiad.payment_status}/>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-gray-500">Name</p><p className="text-white font-medium">{result.olympiad.name}</p></div>
                  <div><p className="text-gray-500">Subjects</p><p className="text-purple-300">{result.olympiad.subjects}</p></div>
                  <div className="col-span-2"><p className="text-gray-500">Registration ID</p><p className="font-mono text-purple-400 text-xs">{result.olympiad.reg_id}</p></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// NOTICES
// ══════════════════════════════════════════════════════════════
export function Notices() {
  const { notices, loading } = useApi();
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="section-title">📢 Notice Board</h1>
          <p className="text-gray-400">Latest announcements from Agrodut</p>
        </div>
        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i=>(
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-5 rounded mb-3 w-1/2" style={{background:"rgba(255,255,255,0.1)"}}/>
              <div className="h-3 rounded mb-2" style={{background:"rgba(255,255,255,0.1)"}}/>
            </div>
          ))}</div>
        ) : notices.length===0 ? (
          <div className="text-center py-20 text-gray-500"><div className="text-6xl mb-4">📭</div><p>No notices yet.</p></div>
        ) : (
          <div className="space-y-4">
            {notices.map((n,i)=>(
              <div key={i} className="glass-card p-6 border-l-4 border-cyan-400/40 hover:border-cyan-400/70 transition-all">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="font-bold text-white text-lg">{n.title}</h3>
                  <span className="text-gray-500 text-xs whitespace-nowrap">{new Date(n.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</span>
                </div>
                <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">{n.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ABOUT
// ══════════════════════════════════════════════════════════════
export function About() {
  const { settings } = useApi();
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="section-title">🏫 About Agrodut</h1>
          <p className="text-gray-400">Jamalpur Zilla School Science Club</p>
        </div>
        <div className="space-y-6">
          <div className="glass-card p-8">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">Who We Are</h2>
            <p className="text-gray-300 leading-relaxed">**Agrodut** is an advanced educational platform that prepares students for various national and international Olympiads and competitions. It provides well-structured question sets, online classes, and competition-focused training. The platform is guided by experienced teachers, including national and international medal winners, ensuring high-quality mentorship. Agrodut aims to develop students’ skills, boost their competitive ability, and provide a trusted learning environment for academic excellence.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-purple-400 mb-3">🎯 Our Mission</h3>
              <p className="text-gray-400 leading-relaxed">To ignite the spark of scientific curiosity in every student and build a community of future scientists and innovators from Jamalpur.</p>
            </div>
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-cyan-400 mb-3">🌟 Our Vision</h3>
              <p className="text-gray-400 leading-relaxed">A Bangladesh where every young student can explore, experiment, and discover the wonders of science — regardless of background.</p>
            </div>
          </div>
          {settings.facebook_url && (
            <div className="glass-card p-8 text-center">
              <h3 className="text-lg font-bold text-white mb-4">Connect With Us</h3>
              <a href={settings.facebook_url} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-lg font-semibold transition-all text-white" style={{background:"#1877f2"}}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Follow Agrodut on Facebook
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// CONTACT
// ══════════════════════════════════════════════════════════════
export function Contact() {
  const { post } = useApi();
  const [form, setForm]   = useState({ name:"", email:"", message:"" });
  const [sent, setSent]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function handleSubmit(e) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const data = await post({ action:"submitReport", ...form });
      if (data.success) setSent(true); else setError(data.message);
    } catch { setError("Network error."); } finally { setLoading(false); }
  }
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="section-title">📬 Contact Us</h1>
          <p className="text-gray-400">Questions or issues? We are here to help.</p>
        </div>
        {sent ? (
          <div className="glass-card p-10 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-cyan-400 mb-2">Message Sent!</h2>
            <p className="text-gray-400 mb-6">We will get back to you soon.</p>
            <button onClick={()=>{setSent(false);setForm({name:"",email:"",message:""});}} className="neon-btn-cyan">Send Another</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
            <div><label className="block text-sm text-gray-400 mb-1">Your Name</label>
              <input type="text" className="input-dark" required placeholder="Full Name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></div>
            <div><label className="block text-sm text-gray-400 mb-1">Email</label>
              <input type="email" className="input-dark" required placeholder="you@example.com" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}/></div>
            <div><label className="block text-sm text-gray-400 mb-1">Message</label>
              <textarea rows="5" className="input-dark resize-none" required placeholder="Your message..." value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))}/></div>
            {error && <p className="text-red-400 text-sm">❌ {error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 font-bold rounded-lg transition-all" style={{background:"#06b6d4",color:"#000",opacity:loading?0.6:1}}>
              {loading?"Sending...":"📤 Send Message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// RESULTS — shows published results from Settings
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  { id:"round1", label:"Round 1" },
  { id:"round2", label:"Round 2" },
  { id:"round3", label:"Round 3" },
  { id:"final",  label:"Final Round" },
];
const SUBJECTS = [
  { id:"mathematics",        label:"Mathematics" },
  { id:"physics",            label:"Physics" },
  { id:"chemistry",          label:"Chemistry" },
  { id:"biology",            label:"Biology" },
  { id:"linguistic_science", label:"Linguistic Science" },
];

export function Results() {
  const { settings } = useApi();
  const [compType,     setCompType]     = useState("quiz");
  const [quizRound,    setQuizRound]    = useState("round1");
  const [olympSubject, setOlympSubject] = useState("mathematics");
  const [data,         setData]         = useState(null);
  const [loading,      setLoading]      = useState(false);

  // Which tab is currently published?
  const publishKey = compType === "quiz"
    ? `result_quiz_${quizRound}`
    : `result_olympiad_${olympSubject}`;
  const isPublished = settings[publishKey] === "published";

  // Lists of what IS published (for indicators)
  const pubRounds   = ROUNDS.filter(r   => settings[`result_quiz_${r.id}`]      === "published");
  const pubSubjects = SUBJECTS.filter(s => settings[`result_olympiad_${s.id}`]  === "published");

  // Auto-select first published tab when type changes
  useEffect(() => {
    if (compType === "quiz" && pubRounds.length > 0) setQuizRound(pubRounds[0].id);
    if (compType === "olympiad" && pubSubjects.length > 0) setOlympSubject(pubSubjects[0].id);
    setData(null);
  }, [compType, settings]);

  // Load result data whenever selection changes and it is published
  useEffect(() => {
    if (!isPublished) { setData(null); return; }
    async function load() {
      setLoading(true); setData(null);
      try {
        const url = compType === "quiz"
          ? `${API_URL}?action=getResults&type=quiz&round=${quizRound}`
          : `${API_URL}?action=getResults&type=olympiad&subject=${olympSubject}`;
        const res  = await fetch(url);
        const json = await res.json();
        if (json.success) {
          let arr = Array.isArray(json.data) ? json.data : [];
          arr = [...arr].sort((a,b)=>(b.total_marks||b.marks||0)-(a.total_marks||a.marks||0));
          setData(arr);
        }
      } catch {}
      finally { setLoading(false); }
    }
    load();
  }, [isPublished, compType, quizRound, olympSubject]);

  const roundLabel   = ROUNDS.find(r   => r.id === quizRound)?.label    || "";
  const subjectLabel = SUBJECTS.find(s => s.id === olympSubject)?.label  || "";

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="section-title">🏆 Results</h1>
          <p className="text-gray-400">Competition leaderboard and rankings</p>
        </div>

        {/* Competition type tabs */}
        <div className="flex rounded-xl overflow-hidden border border-white/10 mb-6 max-w-xs mx-auto">
          {["quiz","olympiad"].map(t=>(
            <button key={t} onClick={()=>setCompType(t)}
              className="flex-1 py-3 font-semibold text-sm transition-all capitalize"
              style={{background:compType===t?"rgba(0,245,255,0.12)":"transparent", color:compType===t?"#00f5ff":"#9ca3af"}}>
              {t==="quiz"?"🧩 Quiz":"🔭 Olympiad"}
            </button>
          ))}
        </div>

        {/* Quiz round selector */}
        {compType==="quiz" && (
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {ROUNDS.map(r=>{
              const pub = settings[`result_quiz_${r.id}`]==="published";
              return (
                <button key={r.id}
                  onClick={()=>{ if(pub){setQuizRound(r.id);} }}
                  className="px-4 py-2 rounded-lg text-sm border transition-all"
                  style={{
                    borderColor: quizRound===r.id?"#00f5ff": pub?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.05)",
                    color:       quizRound===r.id?"#00f5ff": pub?"#9ca3af":"#374151",
                    background:  quizRound===r.id?"rgba(0,245,255,0.1)":"transparent",
                    cursor:      pub?"pointer":"not-allowed",
                  }}>
                  {r.label}
                  {pub
                    ? <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-green-400 align-middle"/>
                    : <span className="ml-1.5 text-gray-600 text-xs">○</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Olympiad subject selector */}
        {compType==="olympiad" && (
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {SUBJECTS.map(s=>{
              const pub = settings[`result_olympiad_${s.id}`]==="published";
              return (
                <button key={s.id}
                  onClick={()=>{ if(pub){setOlympSubject(s.id);} }}
                  className="px-4 py-2 rounded-lg text-sm border transition-all"
                  style={{
                    borderColor: olympSubject===s.id?"#a855f7": pub?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.05)",
                    color:       olympSubject===s.id?"#a855f7": pub?"#9ca3af":"#374151",
                    background:  olympSubject===s.id?"rgba(168,85,247,0.1)":"transparent",
                    cursor:      pub?"pointer":"not-allowed",
                  }}>
                  {s.label}
                  {pub
                    ? <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-green-400 align-middle"/>
                    : <span className="ml-1.5 text-gray-600 text-xs">○</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Not yet published */}
        {!isPublished && (
          <div className="text-center py-16 text-gray-500">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-lg font-medium text-gray-400">Result not published yet</p>
            <p className="text-sm mt-2 text-gray-600">
              {compType==="quiz"
                ? pubRounds.length>0 ? `Available: ${pubRounds.map(r=>r.label).join(", ")}` : "No quiz results published yet."
                : pubSubjects.length>0 ? `Available: ${pubSubjects.map(s=>s.label).join(", ")}` : "No olympiad results published yet."}
            </p>
          </div>
        )}

        {/* Loading */}
        {isPublished && loading && (
          <div className="text-center py-16 text-cyan-400">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto mb-3"/>
            <p>Loading results...</p>
          </div>
        )}

        {/* No data */}
        {isPublished && !loading && data && data.length===0 && (
          <div className="text-center py-16 text-gray-500"><p>No marks entered for this round/subject yet.</p></div>
        )}

        {/* Result table */}
        {isPublished && !loading && data && data.length>0 && (()=>{
          // ✅ Filter out 0-marks entries, already sorted highest→lowest
          const ranked = data.filter(r => (r.total_marks||r.marks||0) > 0);
          if (ranked.length === 0) return (
            <div className="text-center py-16 text-gray-500"><p>No marks entered yet.</p></div>
          );
          // Podium: show [2nd, 1st, 3rd] visually left→center→right
          const podiumOrder = [1, 0, 2]; // indices into ranked[]
          const podiumColor = { 0:"#f59e0b", 1:"#9ca3af", 2:"#b45309" }; // 1st=gold,2nd=silver,3rd=bronze
          const podiumLabel = { 0:"1st", 1:"2nd", 2:"3rd" };
          const podiumHeight = { 0:"h-20", 1:"h-16", 2:"h-14" };
          return (
            <div className="glass-card overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10">
                <p className="font-bold text-white text-base">
                  {compType==="quiz" ? `Quiz — ${roundLabel}` : `Olympiad — ${subjectLabel}`} Results
                  <span className="text-gray-500 text-sm ml-2">({ranked.length} participants)</span>
                </p>
              </div>

              {/* Podium — only if ≥ 1 participant */}
              {ranked.length >= 1 && (
                <div className="py-6 px-4 border-b border-white/10 flex items-end justify-center gap-4">
                  {podiumOrder.map(dataIdx => {
                    const r = ranked[dataIdx];
                    if (!r) return <div key={dataIdx} className="w-24"/>;
                    const color = podiumColor[dataIdx];
                    const isFirst = dataIdx === 0;
                    return (
                      <div key={dataIdx} className={`flex flex-col items-center text-center w-28 ${isFirst ? "order-2" : dataIdx===1 ? "order-1" : "order-3"}`}>
                        <p className="text-white font-semibold text-sm mb-1 leading-tight line-clamp-2">
                          {(r.team_name||r.name||"").substring(0,18)}
                        </p>
                        <p className="font-bold text-sm mb-2" style={{color}}>{r.total_marks||r.marks||0} pts</p>
                        <div className={`w-full rounded-t-lg flex items-center justify-center font-bold text-white text-sm py-2 ${isFirst?"py-4":""}`}
                          style={{background:color, minHeight: isFirst?"60px":"44px"}}>
                          {podiumLabel[dataIdx]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Full ranking table */}
              <table className="w-full text-sm">
                <thead style={{background:"rgba(255,255,255,0.03)"}}>
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-400 font-medium w-14">Rank</th>
                    <th className="px-4 py-3 text-left text-gray-400 font-medium">Name / Team</th>
                    <th className="px-4 py-3 text-right text-gray-400 font-medium">Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((r, i) => (
                    <tr key={i} className="border-t border-white/5 hover:bg-white/2">
                      <td className="px-4 py-3 font-bold text-base"
                        style={{color: i===0?"#f59e0b": i===1?"#9ca3af": i===2?"#b45309":"#6b7280"}}>
                        {i + 1}
                      </td>
                      <td className="px-4 py-3 text-white font-medium">{r.team_name||r.name}</td>
                      <td className="px-4 py-3 text-right font-bold" style={{color: i===0?"#f59e0b": i===1?"#9ca3af": i===2?"#b45309":"#00f5ff"}}>
                        {r.total_marks||r.marks||0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>
    </div>
  );
}