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
      const mobile = form.mobile.replace(/\D/g,"").replace(/^0+/,"");
      const email  = form.email.trim().toLowerCase();
      const data   = await post({ action:"checkStatus", mobile, email });
      if (data.success) setResult(data);
      else setError(data.message);
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  const Badge = ({ status }) => {
    const m = {
      confirmed: { cls:"status-confirmed", label:"✅ Confirmed"  },
      pending:   { cls:"status-pending",   label:"⏳ Pending"    },
      rejected:  { cls:"status-rejected",  label:"❌ Rejected"   },
    };
    const s = m[status] || m.pending;
    return <span className={s.cls}>{s.label}</span>;
  };

  // Reusable info row
  const Row = ({ label, value }) => value ? (
    <div>
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="text-white font-medium text-sm">{value}</p>
    </div>
  ) : null;

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
              <span className="flex items-center px-3 rounded-l-lg border border-r-0 border-white/10 text-gray-400 text-sm shrink-0"
                style={{background:"#0f172a"}}>+88</span>
              <input type="tel" className="input-dark rounded-l-none flex-1"
                placeholder="01XXXXXXXXX" maxLength={11} required
                value={form.mobile}
                onChange={e=>setForm(p=>({...p,mobile:e.target.value.replace(/\D/g,"").slice(0,11)}))}/>
            </div>
            {form.mobile && !/^01[0-9]{9}$/.test(form.mobile) && (
              <p className="text-red-400 text-xs mt-1">⚠️ Must be 11 digits starting with 01</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email Address</label>
            <input type="email" placeholder="you@example.com" className="input-dark" required
              value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}/>
          </div>
          {error && <p className="text-red-400 text-sm">❌ {error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 font-bold rounded-lg transition-all"
            style={{background:"#06b6d4",color:"#000",opacity:loading?0.6:1}}>
            {loading ? "⏳ Checking..." : "🔍 Check Status"}
          </button>
        </form>

        {result && (
          <div className="space-y-4">

            {/* Quiz */}
            {result.quiz && (
              <div className="glass-card p-6 border-l-4 border-cyan-400">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-cyan-400 text-lg">🧩 Quiz Competition</h3>
                  <Badge status={result.quiz.payment_status}/>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Row label="Team Name"   value={result.quiz.team_name}/>
                  <Row label="Institution" value={result.quiz.institution}/>
                  <div className="col-span-2">
                    <p className="text-gray-500 text-xs">Registration ID</p>
                    <p className="font-mono text-cyan-400 text-xs">{result.quiz.reg_id}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Olympiad */}
            {result.olympiad && (
              <div className="glass-card p-6 border-l-4 border-purple-400">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-purple-400 text-lg">🔭 Science Olympiad</h3>
                  <Badge status={result.olympiad.payment_status}/>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Row label="Name"        value={result.olympiad.name}/>
                  <Row label="Institution" value={result.olympiad.institution}/>
                  <div>
                    <p className="text-gray-500 text-xs">Segments</p>
                    <p className="text-purple-300 text-sm">{result.olympiad.subjects}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 text-xs">Registration ID</p>
                    <p className="font-mono text-purple-400 text-xs">{result.olympiad.reg_id}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Science Project */}
            {result.science_project && (
              <div className="glass-card p-6 border-l-4" style={{borderColor:"#f59e0b"}}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg" style={{color:"#f59e0b"}}>🔬 Science Project Showcasing</h3>
                  <Badge status={result.science_project.payment_status}/>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Row label="Team Name"    value={result.science_project.team_name}/>
                  <Row label="Institution"  value={result.science_project.institution}/>
                  <div className="col-span-2">
                    <p className="text-gray-500 text-xs">Project Name</p>
                    <p className="text-white font-medium text-sm">{result.science_project.project_name}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 text-xs">Registration ID</p>
                    <p className="font-mono text-xs" style={{color:"#f59e0b"}}>{result.science_project.reg_id}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Astro Photography */}
            {result.astro_photo && (
              <div className="glass-card p-6 border-l-4" style={{borderColor:"#06b6d4"}}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg" style={{color:"#06b6d4"}}>🌌 Astro Photography</h3>
                  <span className="status-confirmed">✅ Registered</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Row label="Name"        value={result.astro_photo.name}/>
                  <Row label="Institution" value={result.astro_photo.institution}/>
                  <div className="col-span-2">
                    <p className="text-gray-500 text-xs">Photo / Work Title</p>
                    <p className="text-white font-medium text-sm">{result.astro_photo.photo_name}</p>
                  </div>
                  {result.astro_photo.photo_link && (
                    <div className="col-span-2">
                      <p className="text-gray-500 text-xs mb-1">Submitted Photo</p>
                      <a href={result.astro_photo.photo_link} target="_blank" rel="noreferrer"
                        className="text-xs underline transition-colors" style={{color:"#06b6d4"}}>
                        View on Google Drive →
                      </a>
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className="text-gray-500 text-xs">Registration ID</p>
                    <p className="font-mono text-xs" style={{color:"#06b6d4"}}>{result.astro_photo.reg_id}</p>
                  </div>
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
// ─── YouTube ID extract ───────────────────────────────────────
function getYouTubeId(url) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

// ─── Notice content — links clickable, YouTube thumbnail (no play button) ───
function NoticeContent({ content }) {
  if (!content) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts    = content.split(urlRegex);
  const urls     = parts.filter(p => urlRegex.test(p));
  // reset lastIndex after test()
  urlRegex.lastIndex = 0;

  return (
    <div className="space-y-3">
      {/* Text with inline clickable links */}
      <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
        {parts.map((part, i) => {
          if (!/(https?:\/\/[^\s]+)/.test(part)) return <span key={i}>{part}</span>;
          return (
            <a key={i} href={part} target="_blank" rel="noreferrer"
              className="underline break-all transition-colors"
              style={{color:"#06b6d4"}}>
              {part}
            </a>
          );
        })}
      </p>

      {/* YouTube thumbnails — no play button, click opens YouTube */}
      {parts.filter(p => /(https?:\/\/[^\s]+)/.test(p)).map((url, i) => {
        const ytId = getYouTubeId(url);
        if (!ytId) return null;
        return (
          <a key={i} href={url} target="_blank" rel="noreferrer"
            className="block rounded-xl overflow-hidden border border-white/10 hover:border-cyan-400/40 transition-all group relative"
            style={{maxWidth:"400px"}}>
            <img
              src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
              alt="YouTube video thumbnail"
              className="w-full object-cover"
              style={{aspectRatio:"16/9"}}
            />
            {/* Subtle hover overlay only — no play button */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all"/>
            {/* YouTube label at bottom */}
            <div className="absolute bottom-0 left-0 right-0 px-3 py-2"
              style={{background:"linear-gradient(transparent,rgba(0,0,0,0.75))"}}>
              <p className="text-white text-xs font-medium flex items-center gap-1.5">
                <svg width="14" height="10" viewBox="0 0 24 17" fill="red">
                  <path d="M23.5 2.5s-.3-1.8-1.1-2.6c-1-.8-2.2-.8-2.7-.9C16.7 0 12 0 12 0S7.3 0 4.3.1c-.5 0-1.7.1-2.7.9C.8.8.5 2.5.5 2.5S.2 4.6.2 6.7v2c0 2.1.3 4.2.3 4.2s.3 1.8 1.1 2.6c1 .8 2.4.8 3 .9C6.5 16.5 12 16.5 12 16.5s4.7 0 7.7-.2c.5 0 1.7-.1 2.7-.9.8-.8 1.1-2.6 1.1-2.6s.3-2.1.3-4.2v-2C23.8 4.6 23.5 2.5 23.5 2.5zM9.7 11.5V5l6.6 3.3-6.6 3.2z"/>
                </svg>
                Watch on YouTube
              </p>
            </div>
          </a>
        );
      })}
    </div>
  );
}

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
                <NoticeContent content={n.content} />
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
            <p className="text-gray-300 leading-relaxed">Agrodut is an advanced educational platform that prepares students for various national and international Olympiads and competitions. It provides well-structured question sets, online classes, and competition-focused training. The platform is guided by experienced teachers, including national and international medal winners, ensuring high-quality mentorship. Agrodut aims to develop students’ skills, boost their competitive ability, and provide a trusted learning environment for academic excellence.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-purple-400 mb-3">🎯 Our Mission</h3>
              <p className="text-gray-400 leading-relaxed">To empower students with top-tier academic resources, expert mentorship from medal-winning educators, and rigorous training modules. We strive to democratize competition preparation, build unwavering problem-solving confidence, and bridge the gap between classroom learning and global competitive excellence for every passionate learner.</p>
            </div>
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-cyan-400 mb-3">🌟 Our Vision</h3>
              <p className="text-gray-400 leading-relaxed">To ignite the spark of scientific curiosity in every student and nurture a dynamic, inclusive, and forward-thinking community of future scientists, innovators, researchers, and problem-solvers from Jamalpur who are equipped with deep knowledge, critical thinking ability, and creativity. This community will actively contribute to scientific advancement, technological innovation, and sustainable development, not only within Jamalpur and Bangladesh but also on the global stage, shaping a brighter and more progressive future for humanity.</p>
            </div>
          </div>
          
          <div className="glass-card p-8 text-center space-y-4">
            <h3 className="text-lg font-bold text-white mb-2">Connect With Us</h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {settings.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-lg font-semibold transition-all text-white w-full sm:w-auto justify-center" style={{background:"#1877f2"}}>
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Follow Agrodut on Facebook
                </a>
              )}
              <a href="https://www.facebook.com/share/g/1EBnd4h1VP/" target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-lg font-semibold transition-all text-white w-full sm:w-auto justify-center" style={{background:"#1877f2"}}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                JZS Science Club
              </a>
            </div>
          </div>
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
  { id:"ict",                label:"ICT" },
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
        {isPublished && !loading && data && data.length>0 && (
          <div className="glass-card overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10">
              <p className="font-bold text-white text-base">
                {compType==="quiz" ? `Quiz — ${roundLabel}` : `Olympiad — ${subjectLabel}`} Results
                <span className="text-gray-500 text-sm ml-2">({data.length} entries)</span>
              </p>
            </div>
            {/* Top 3 podium */}
            <div className="p-4 grid grid-cols-3 gap-3 border-b border-white/10">
              {[1,0,2].map(pos=>{
                const r = data[pos];
                if(!r) return <div key={pos}/>;
                const colors = ["#00f5ff","#f59e0b","#a855f7"];
                const labels = ["2nd","1st","3rd"];
                const sizes  = ["text-2xl","text-3xl","text-2xl"];
                const order  = [1,0,2]; // visual column → data index
                return (
                  <div key={pos} className={`flex flex-col items-center text-center ${pos===0?"order-2":"pos===2?order-3:order-1"}`}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-2 border-2"
                      style={{borderColor:colors[pos],background:colors[pos]+"18",color:colors[pos]}}>
                      {labels[pos]}
                    </div>
                    <p className="text-white font-semibold text-sm leading-tight">{(r.team_name||r.name||"").substring(0,16)}</p>
                    <p className="font-bold mt-1" style={{color:colors[pos]}}>{r.total_marks||r.marks||0} pts</p>
                  </div>
                );
              })}
            </div>
            {/* Full table */}
            <table className="w-full text-sm">
              <thead style={{background:"rgba(255,255,255,0.03)"}}>
                <tr>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium w-14">#</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Name / Team</th>
                  <th className="px-4 py-3 text-right text-gray-400 font-medium">Marks</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r,i)=>(
                  <tr key={i} className="border-t border-white/5 hover:bg-white/2">
                    <td className="px-4 py-3 font-bold" style={{color:i===0?"#f59e0b":i===1?"#9ca3af":i===2?"#b45309":"#6b7280"}}>
                      {i+1}
                    </td>
                    <td className="px-4 py-3 text-white font-medium">{r.team_name||r.name}</td>
                    <td className="px-4 py-3 text-right text-cyan-400 font-bold">{r.total_marks||r.marks||0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}