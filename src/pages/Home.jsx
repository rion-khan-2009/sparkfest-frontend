import { Link } from "react-router-dom";
import { useApi } from "../context/ApiContext";
import Countdown from "../components/Countdown";

export default function Home() {
  const { settings, notices, loading } = useApi();

  const banner = settings.banner_image_url;
  const date   = settings.countdown_date || "2026-09-15";
  const title  = settings.event_title    || "Spark Fest — Ignite Your Curiosity";

  return (
    <div className="min-h-screen">

      {/* HERO BANNER */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {banner ? (
          <img src={banner} alt="Banner"
            className="absolute inset-0 w-full h-full object-cover opacity-30" />
        ) : (
          <div className="absolute inset-0"
            style={{ background:"linear-gradient(135deg,#0B0F1A,#111827,#1a0533)" }} />
        )}

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage:"linear-gradient(rgba(0,245,255,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,255,0.3) 1px,transparent 1px)",
            backgroundSize:"60px 60px" }} />

        <div className="absolute inset-0" style={{ background:"rgba(11,15,26,0.6)" }} />

        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background:"radial-gradient(circle,#00f5ff,transparent)",
            animation:"float 3s ease-in-out infinite" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background:"radial-gradient(circle,#a855f7,transparent)",
            animation:"float 3s ease-in-out infinite", animationDelay:"1.5s" }} />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-block px-4 py-1 rounded-full mb-6 text-cyan-400 text-sm font-medium tracking-widest uppercase"
            style={{ border:"1px solid rgba(0,245,255,0.3)", background:"rgba(0,245,255,0.1)" }}>
            🔬 National Science Competition 2026
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-tight">
            {title.split("—")[0]?.trim() || "SPARK FEST"}
          </h1>

          <p className="text-cyan-400 text-xl md:text-3xl font-bold mb-2"
            style={{ textShadow:"0 0 20px rgba(0,245,255,0.8)" }}>
            — {title.split("—")[1]?.trim() || "Ignite Your Curiosity"}
          </p>

          <p className="text-gray-400 text-lg mb-10">
            Organized by Agrodut · Jamalpur Zilla School Science Club
          </p>

          {/* Countdown & Event Date */}
          <div className="mb-10">
            <p className="text-gray-500 text-sm uppercase tracking-widest mb-4">
              Event Begins In
            </p>
            <Countdown targetDate={date} />
            {date && (
              <p className="text-gray-400 text-sm mt-5 flex items-center justify-center gap-2">
                <span className="text-cyan-400">📅</span>
                Event Date:
                <span className="text-white font-semibold ml-1">
                  {new Date(date).toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </span>
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="neon-btn-cyan text-center">
              ✦ Register Now
            </Link>
            <Link to="/status" className="neon-btn-purple text-center">
              Check Status
            </Link>
          </div>
        </div>
      </section>

      {/* LATEST NOTICES */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-cyan-400 text-sm uppercase tracking-widest mb-2">Updates</p>
          <h2 className="section-title">📢 Latest Notices</h2>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="h-4 rounded mb-3 w-3/4" style={{ background:"rgba(255,255,255,0.1)" }} />
                <div className="h-3 rounded mb-2"        style={{ background:"rgba(255,255,255,0.1)" }} />
                <div className="h-3 rounded w-2/3"       style={{ background:"rgba(255,255,255,0.1)" }} />
              </div>
            ))}
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-5xl mb-4">📭</div>
            <p>No notices published yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {notices.slice(0,3).map((n,i) => (
              <div key={i} className="glass-card p-6 hover:border-cyan-400/30 transition-all duration-300"
                style={{ animationDelay:`${i*0.1}s` }}>
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">📌</span>
                  <h3 className="font-semibold text-white text-lg leading-snug">{n.title}</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed"
                  style={{ display:"-webkit-box", WebkitLineClamp:3,
                    WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                  {n.content}
                </p>
                <p className="text-gray-600 text-xs mt-4">
                  {new Date(n.created_at).toLocaleDateString("en-GB",
                    { day:"numeric", month:"long", year:"numeric" })}
                </p>
              </div>
            ))}
          </div>
        )}

        {notices.length > 3 && (
          <div className="text-center mt-8">
            <Link to="/notices" className="neon-btn-cyan inline-block">
              View All Notices →
            </Link>
          </div>
        )}
      </section>

      {/* COMPETITIONS */}
      <section className="py-20 px-4" style={{ background:"rgba(17,24,39,0.5)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">🏆 Competitions</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">

            <div className="glass-card p-8 hover:border-cyan-400/30 transition-all duration-300">
              <div className="text-5xl mb-4">🧩</div>
              <h3 className="text-2xl font-bold text-cyan-400 mb-3">Quiz Competition</h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                Team-based science quiz. Form a team of 2–3 members and battle through exciting rounds.
              </p>
              <ul className="space-y-2 text-sm text-gray-300 mb-8">
                <li className="flex items-center gap-2"><span className="text-cyan-400">✓</span> Team of 2–3 members</li>
                <li className="flex items-center gap-2"><span className="text-cyan-400">✓</span> Multiple rounds</li>
                <li className="flex items-center gap-2"><span className="text-cyan-400">✓</span> Amazing prizes</li>
              </ul>
              <Link to="/register?type=quiz" className="neon-btn-cyan inline-block">
                Register for Quiz
              </Link>
            </div>

            <div className="glass-card p-8 hover:border-purple-400/30 transition-all duration-300">
              <div className="text-5xl mb-4">🔭</div>
              <h3 className="text-2xl font-bold text-purple-400 mb-3">Science Olympiad</h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                Individual multi-subject olympiad. Choose your subjects and compete at the highest level.
              </p>
              <ul className="space-y-2 text-sm text-gray-300 mb-8">
                <li className="flex items-center gap-2"><span className="text-purple-400">✓</span> Individual participation</li>
                <li className="flex items-center gap-2"><span className="text-purple-400">✓</span> Multiple subjects</li>
                <li className="flex items-center gap-2"><span className="text-purple-400">✓</span> Subject-wise prizes</li>
              </ul>
              <Link to="/register?type=olympiad" className="neon-btn-purple inline-block">
                Register for Olympiad
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-4 border-t border-white/5 text-center">
        <p className="text-gray-500 text-sm">
          © Copyright 2026. <span className="text-cyan-400">Agrodut</span>. All Rights Reserved.
        </p>
        <p className="text-gray-600 text-xs mt-1">Jamalpur Zilla School Science Club</p>
        {settings.facebook_url && (
          <a href={settings.facebook_url} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 mt-3 text-blue-400 hover:text-blue-300 text-sm transition-colors">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Follow us on Facebook
          </a>
        )}
      </footer>

    </div>
  );
}