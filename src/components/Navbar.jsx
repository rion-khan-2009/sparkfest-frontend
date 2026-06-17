import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useApi } from "../context/ApiContext";

export default function Navbar() {
  const { settings } = useApi();
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  const links = [
    { to:"/",          label:"Home"     },
    { to:"/register",  label:"Register" },
    { to:"/status",    label:"Status"   },
    { to:"/notices",   label:"Notices"  },
    { to:"/results",   label:"Results"  },
    { to:"/about",     label:"About"    },
    { to:"/contact",   label:"Contact"  },
  ];

  const active = (path) =>
    loc.pathname === path
      ? "text-cyan-400 border-b-2 border-cyan-400"
      : "text-gray-300 hover:text-cyan-400 transition-colors";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#111827]/95 backdrop-blur border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          {settings.logo_url ? (
            <img src={settings.logo_url} alt="Agrodut Logo"
              className="h-10 w-10 object-contain rounded-lg" />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600
              flex items-center justify-center font-bold text-white text-sm">
              AG
            </div>
          )}
          <span className="font-bold text-white text-lg hidden sm:block">
            AGRODUT
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <Link key={l.to} to={l.to}
              className={`text-sm font-medium pb-1 ${active(l.to)}`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)}
          className="md:hidden text-gray-300 hover:text-cyan-400 p-2">
          <div className={`w-5 h-0.5 bg-current mb-1 transition-all ${open?"rotate-45 translate-y-1.5":""}`}/>
          <div className={`w-5 h-0.5 bg-current mb-1 transition-all ${open?"opacity-0":""}`}/>
          <div className={`w-5 h-0.5 bg-current transition-all ${open?"-rotate-45 -translate-y-1.5":""}`}/>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#111827] border-t border-white/5 px-4 py-4 flex flex-col gap-4">
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              className={`text-sm font-medium ${active(l.to)}`}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}