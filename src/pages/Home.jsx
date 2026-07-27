import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../context/ApiContext";

// ─── YouTube ID extract ───────────────────────────────────────
function getYouTubeId(url) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

// ─── Notice content — links + YouTube thumbnail (no play button) ─
function NoticeContent({ content, preview }) {
  if (!content) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);

  if (preview) {
    // Home page preview: plain text only, no thumbnails
    return (
      <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
        {content.replace(urlRegex, url => url.length > 40 ? url.slice(0, 40) + "…" : url)}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
        {parts.map((part, i) => {
          if (!/(https?:\/\/[^\s]+)/.test(part)) return <span key={i}>{part}</span>;
          return (
            <a key={i} href={part} target="_blank" rel="noreferrer"
              className="underline break-all transition-colors" style={{color:"#06b6d4"}}>
              {part}
            </a>
          );
        })}
      </p>
      {parts.filter(p => /(https?:\/\/[^\s]+)/.test(p)).map((url, i) => {
        const ytId = getYouTubeId(url);
        if (!ytId) return null;
        return (
          <a key={i} href={url} target="_blank" rel="noreferrer"
            className="block rounded-xl overflow-hidden border border-white/10 hover:border-cyan-400/40 transition-all group relative"
            style={{maxWidth:"400px"}}>
            <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
              alt="YouTube thumbnail" className="w-full object-cover" style={{aspectRatio:"16/9"}}/>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all"/>
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

// ─── Countdown ────────────────────────────────────────────────
function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    function calc() {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) return setTimeLeft({ d:0, h:0, m:0, s:0 });
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    }
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  if (!timeLeft) return null;

  const Unit = ({ val, label }) => (
    <div className="flex flex-col items-center">
      <div className="rounded-xl font-bold tabular-nums text-cyan-400 border border-cyan-400/30 flex items-center justify-center"
        style={{
          background:"rgba(0,245,255,0.07)",
          fontSize:"clamp(1.5rem,6vw,2.5rem)",
          width:"clamp(60px,16vw,90px)",
          height:"clamp(60px,16vw,90px)",
        }}>
        {String(val).padStart(2,"0")}
      </div>
      <p className="text-gray-500 text-xs mt-2 tracking-widest uppercase">{label}</p>
    </div>
  );

  return (
    <div className="flex items-end gap-2 sm:gap-4 justify-center">
      <Unit val={timeLeft.d} label="Days"/>
      <span className="text-cyan-400 font-bold text-2xl sm:text-3xl mb-6">:</span>
      <Unit val={timeLeft.h} label="Hours"/>
      <span className="text-cyan-400 font-bold text-2xl sm:text-3xl mb-6">:</span>
      <Unit val={timeLeft.m} label="Minutes"/>
      <span className="text-cyan-400 font-bold text-2xl sm:text-3xl mb-6">:</span>
      <Unit val={timeLeft.s} label="Seconds"/>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// HOME PAGE
// ══════════════════════════════════════════════════════════════
export default function Home() {
  const { settings, notices, loading } = useApi();
  const date = settings.countdown_date;

  return (
    <div className="min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
        {/* Background banner */}
        {settings.banner_image_url && (
          <div className="absolute inset-0 z-0">
            <img src={settings.banner_image_url} alt="Banner"
              className="w-full h-full object-cover opacity-60"/>
            <div className="absolute inset-0" style={{background:"linear-gradient(to bottom,#0B0F1Aaa,#0B0F1A)"}}/>
          </div>
        )}
        {!settings.banner_image_url && (
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0" style={{
              background:"radial-gradient(ellipse at 50% 40%,rgba(0,245,255,0.08) 0%,transparent 60%), radial-gradient(ellipse at 80% 80%,rgba(168,85,247,0.07) 0%,transparent 50%)"
            }}/>
          </div>
        )}

        <div className="relative z-10 text-center w-full max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/30 text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-6"
            style={{background:"rgba(0,245,255,0.08)"}}>
            <span>🔬</span> National Science Competition 2026
          </div>

          {/* Title */}
          <h1 className="font-extrabold text-white leading-tight mb-3"
            style={{fontSize:"clamp(2rem,8vw,4rem)"}}>
            {settings.event_title?.split("—")[0]?.trim() || "Spark Fest"}
          </h1>
          {settings.event_title?.includes("—") && (
            <p className="font-bold text-cyan-400 mb-4"
              style={{fontSize:"clamp(1rem,4vw,1.75rem)"}}>
              — {settings.event_title.split("—")[1]?.trim()}
            </p>
          )}

          <p className="text-gray-400 mb-8 px-2" style={{fontSize:"clamp(0.85rem,3vw,1rem)"}}>
            Organized by Agrodut · Jamalpur Zilla School Science Club
          </p>

          {/* Countdown */}
          {date && (
            <div className="mb-6">
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-5">Event Begins In</p>
              <Countdown targetDate={date}/>
              <p className="text-gray-400 text-sm mt-5 flex items-center justify-center gap-2 flex-wrap">
                <span>📅</span>
                <span>Event Date:</span>
                <span className="text-white font-semibold">
                  {new Date(date).toLocaleDateString("en-GB",{
                    weekday:"long", day:"numeric", month:"long", year:"numeric"
                  })}
                </span>
              </p>
            </div>
          )}

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8 px-4">
            <Link to="/register"
              className="px-6 py-3 rounded-xl font-bold text-base transition-all text-center"
              style={{background:"#06b6d4",color:"#000",boxShadow:"0 0 24px rgba(0,245,255,0.35)"}}>
              ✦ Register Now
            </Link>
            <Link to="/status"
              className="px-6 py-3 rounded-xl font-bold text-base border text-center transition-all hover:bg-white/5"
              style={{borderColor:"rgba(168,85,247,0.5)",color:"#a855f7"}}>
              Check Status
            </Link>
          </div>
        </div>
      </section>

      {/* ── NOTICES SECTION ───────────────────────────────────── */}
      {notices.length > 0 && (
        <section className="px-4 py-16 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="w-1 h-7 rounded-full inline-block" style={{background:"#06b6d4"}}/>
              Latest Notices
            </h2>
            <Link to="/notices" className="text-cyan-400 text-sm hover:underline">View all →</Link>
          </div>

          <div className="space-y-4">
            {notices.slice(0, 3).map((n, i) => {
              // Check if notice has a YouTube link
              const ytMatch = n.content && n.content.match(
                /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
              );
              const ytId = ytMatch ? ytMatch[1] : null;

              return (
                <div key={i} className="glass-card p-5 border-l-4 border-cyan-400/40 hover:border-cyan-400/70 transition-all">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="font-bold text-white text-base leading-snug">{n.title}</h3>
                    <span className="text-gray-500 text-xs whitespace-nowrap shrink-0">
                      {new Date(n.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}
                    </span>
                  </div>

                  {/* YouTube thumbnail in home page notice preview */}
                  {ytId && (
                    <a href={n.content.match(/(https?:\/\/[^\s]*youtu[^\s]*)/)?.[0]||"#"}
                      target="_blank" rel="noreferrer"
                      className="block rounded-xl overflow-hidden border border-white/10 hover:border-cyan-400/40 transition-all group relative mb-3"
                      style={{maxWidth:"360px"}}>
                      <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                        alt="YouTube thumbnail" className="w-full object-cover" style={{aspectRatio:"16/9"}}/>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all"/>
                      <div className="absolute bottom-0 left-0 right-0 px-3 py-2"
                        style={{background:"linear-gradient(transparent,rgba(0,0,0,0.75))"}}>
                        <p className="text-white text-xs font-medium flex items-center gap-1.5">
                          <svg width="12" height="9" viewBox="0 0 24 17" fill="red">
                            <path d="M23.5 2.5s-.3-1.8-1.1-2.6c-1-.8-2.2-.8-2.7-.9C16.7 0 12 0 12 0S7.3 0 4.3.1c-.5 0-1.7.1-2.7.9C.8.8.5 2.5.5 2.5S.2 4.6.2 6.7v2c0 2.1.3 4.2.3 4.2s.3 1.8 1.1 2.6c1 .8 2.4.8 3 .9C6.5 16.5 12 16.5 12 16.5s4.7 0 7.7-.2c.5 0 1.7-.1 2.7-.9.8-.8 1.1-2.6 1.1-2.6s.3-2.1.3-4.2v-2C23.8 4.6 23.5 2.5 23.5 2.5zM9.7 11.5V5l6.6 3.3-6.6 3.2z"/>
                          </svg>
                          Watch on YouTube
                        </p>
                      </div>
                    </a>
                  )}

                  {/* Text content preview */}
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
                    {n.content.replace(/(https?:\/\/[^\s]+)/g, "").trim()}
                  </p>
                </div>
              );
            })}
          </div>

          {notices.length > 3 && (
            <div className="text-center mt-6">
              <Link to="/notices"
                className="px-6 py-2.5 rounded-lg border border-cyan-400/30 text-cyan-400 text-sm font-semibold hover:bg-cyan-400/10 transition-all inline-block">
                View All Notices ({notices.length}) →
              </Link>
            </div>
          )}
        </section>
      )}

      {/* ── EVENTS SECTION ────────────────────────────────────── */}
      <section className="px-4 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">🎯 Events</h2>
          <p className="text-gray-400 text-sm">Four exciting competitions — register now!</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon:"🧩", title:"Quiz Competition",          color:"#00f5ff", fee:"300 BDT", type:"Group (1-3)" },
            { icon:"🔭", title:"Science Olympiad",          color:"#a855f7", fee:"100 BDT/segment", type:"Individual" },
            { icon:"🔬", title:"Science Project Showcasing",color:"#f59e0b", fee:"150 BDT", type:"Group (1-3)" },
            { icon:"🌌", title:"Astro Photography",         color:"#06b6d4", fee:"FREE",    type:"Individual" },
          ].map((ev, i) => (
            <Link key={i} to="/register"
              className="glass-card p-5 text-center hover:border-white/30 transition-all duration-300 group block"
              style={{textDecoration:"none"}}>
              <div className="text-4xl mb-3">{ev.icon}</div>
              <h3 className="font-bold text-sm mb-2 leading-tight" style={{color:ev.color}}>{ev.title}</h3>
              <p className="text-gray-400 text-xs mb-1">{ev.type}</p>
              <p className="font-bold text-sm" style={{color:ev.color}}>{ev.fee}</p>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}