import { useState } from "react";
import { useApi } from "../context/ApiContext";
import { API_URL } from "../context/ApiContext";

// ─── Constants ───────────────────────────────────────────────
const CLASSES = ["Class 6","Class 7","Class 8","Class 9","Class 10","SSC 26"];

// ICT removed
const OLYMPIAD_SEGMENTS = [
  { id:"mathematics",        label:"Mathematics Olympiad",        fee:100 },
  { id:"physics",            label:"Physics Olympiad",            fee:100 },
  { id:"chemistry",          label:"Chemistry Olympiad",          fee:100 },
  { id:"biology",            label:"Biology Olympiad",            fee:100 },
  { id:"linguistic_science", label:"Linguistic Science Olympiad", fee:100 },
];

const QUIZ_RULES = `QUIZ COMPETITION — RULES & GUIDELINES

• This is a GROUP competition. Each team must have 1 to 3 members.
• Eligible classes: Class 6 to SSC '26.
• Registration fee: 300 BDT per team (non-refundable).
• All team members must be from the same institution.
• Topics include: Physics, Chemistry, Biology, Mathematics, General Science & ICT.
• Teams must bring their registration confirmation on event day.
• No replacement of team members after registration.
• Decision of the judges will be final.`;

const OLYMPIAD_RULES = `OLYMPIAD COMPETITION — RULES & GUIDELINES

• This is an INDIVIDUAL competition. No teams allowed.
• Eligible classes: Class 6 to SSC '26.
• Registration fee: 100 BDT per segment (non-refundable).
• A participant may register for multiple segments.
• Each segment has a separate written exam.
• Participants must bring their registration confirmation on event day.
• Use of calculators or electronic devices is not allowed.
• Decision of the judges will be final.`;

// ─── Helpers ─────────────────────────────────────────────────
function formatMobile(val) {
  return val.replace(/\D/g, "").slice(0, 11);
}
function isValidMobile(val) {
  return /^01[0-9]{9}$/.test(val);
}
function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

function MobileInput({ value, onChange, required }) {
  return (
    <div className="flex">
      <span className="flex items-center px-3 rounded-l-lg border border-r-0 border-white/10 text-gray-400 text-sm shrink-0"
        style={{ background:"#0f172a" }}>+88</span>
      <input type="tel" className="input-dark rounded-l-none flex-1"
        placeholder="01XXXXXXXXX" maxLength={11} value={value} required={required}
        onChange={e => onChange(formatMobile(e.target.value))} />
    </div>
  );
}

async function validateCardCode(code, expectedType) {
  try {
    const res = await fetch(API_URL, {
      method:"POST", redirect:"follow",
      headers:{"Content-Type":"text/plain"},
      body: JSON.stringify({ action:"validateCard", card_code: code.trim(), expected_type: expectedType })
    });
    return await res.json();
  } catch {
    return { valid:false, message:"Network error. Please try again." };
  }
}

// ─── Step bar ─────────────────────────────────────────────────
function StepBar({ current, total, color="#00f5ff" }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all"
            style={{
              borderColor: i <= current ? color : "rgba(255,255,255,0.15)",
              background:  i <  current ? color : i === current ? color+"22" : "transparent",
              color:       i <= current ? (i < current ? "#000" : color) : "rgba(255,255,255,0.3)",
            }}>
            {i < current ? "✓" : i + 1}
          </div>
          {i < total - 1 && (
            <div className="flex-1 h-0.5 w-8"
              style={{ background: i < current ? color : "rgba(255,255,255,0.1)" }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════
export default function Register() {
  const [competitionType, setCompetitionType] = useState(null);
  if (!competitionType) return <CompetitionSelect onSelect={setCompetitionType} />;
  return competitionType === "quiz"
    ? <QuizRegistration    onBack={() => setCompetitionType(null)} />
    : <OlympiadRegistration onBack={() => setCompetitionType(null)} />;
}

// ─── Competition selector ─────────────────────────────────────
function CompetitionSelect({ onSelect }) {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">📝 Registration</h1>
          <p className="text-gray-400">Select the competition you want to register for</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <button onClick={() => onSelect("quiz")}
            className="glass-card p-8 text-left hover:border-cyan-400/50 transition-all duration-300 group"
            style={{ cursor:"pointer" }}>
            <div className="text-5xl mb-4">🧩</div>
            <h2 className="text-2xl font-bold text-cyan-400 mb-2">Quiz Competition</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Group competition for teams of up to 3 members. Test your science knowledge across multiple rounds.
            </p>
            <div className="space-y-1 text-sm mb-6">
              <p className="text-gray-300">👥 1–3 members per team</p>
              <p className="text-gray-300">📚 Class 6 – SSC '26</p>
              <p className="text-cyan-400 font-bold">💳 Fee: 300 BDT per team</p>
            </div>
            <div className="w-full py-2.5 rounded-lg text-center font-semibold text-sm border border-cyan-400/40 text-cyan-400 group-hover:bg-cyan-400 group-hover:text-black transition-all">
              Register for Quiz →
            </div>
          </button>

          <button onClick={() => onSelect("olympiad")}
            className="glass-card p-8 text-left hover:border-purple-400/50 transition-all duration-300 group"
            style={{ cursor:"pointer" }}>
            <div className="text-5xl mb-4">🔭</div>
            <h2 className="text-2xl font-bold text-purple-400 mb-2">Science Olympiad</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Individual competition across 5 science segments. You may enter multiple segments.
            </p>
            <div className="space-y-1 text-sm mb-6">
              <p className="text-gray-300">👤 Individual participation</p>
              <p className="text-gray-300">📚 Class 6 – SSC '26</p>
              <p className="text-purple-400 font-bold">💳 Fee: 100 BDT per segment</p>
            </div>
            <div className="w-full py-2.5 rounded-lg text-center font-semibold text-sm border border-purple-400/40 text-purple-400 group-hover:bg-purple-400 group-hover:text-white transition-all">
              Register for Olympiad →
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// QUIZ REGISTRATION
// Steps: 0=Rules | 1=Team Info | 2=Payment | 3=Contact | 4=Review | 5=Success
// Member 1 required, Member 2 & 3 optional
// ══════════════════════════════════════════════════════════════
function QuizRegistration({ onBack }) {
  const { post }  = useApi();
  const [step, setStep]       = useState(0);
  const [payMethod, setPayMethod] = useState(null);
  const accent = "#00f5ff";

  // Team info
  const [teamName,    setTeamName]    = useState("");
  const [institution, setInstitution] = useState("");
  const [m1name,  setM1name]  = useState("");
  const [m1class, setM1class] = useState("");
  const [m2name,  setM2name]  = useState("");
  const [m2class, setM2class] = useState("");
  const [m3name,  setM3name]  = useState("");
  const [m3class, setM3class] = useState("");

  // Payment
  const [bkashSender, setBkashSender] = useState("");
  const [bkashTxn,    setBkashTxn]    = useState("");
  const [cardCode,    setCardCode]     = useState("");
  const [cardError,   setCardError]    = useState("");
  const [cardChecking,setCardChecking] = useState(false);

  // Contact
  const [mobile, setMobile] = useState("");
  const [email,  setEmail]  = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [regId,      setRegId]      = useState("");

  // ── step 0: rules ──
  if (step === 0) return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-2">← Back</button>
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🧩</div>
          <h1 className="text-2xl font-bold text-cyan-400">Quiz Competition</h1>
          <p className="text-gray-400 text-sm mt-1">Please read the rules carefully before registering</p>
        </div>
        <div className="glass-card p-6 mb-6">
          <pre className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">{QUIZ_RULES}</pre>
        </div>
        <button onClick={() => setStep(1)}
          className="w-full py-4 rounded-lg font-bold text-lg transition-all"
          style={{ background:accent, color:"#000", boxShadow:`0 0 20px ${accent}44` }}>
          I understand — Proceed to Registration →
        </button>
      </div>
    </div>
  );

  // ── step 1: team info ──
  if (step === 1) return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <StepBar current={1} total={5} color={accent} />
        <h2 className="text-xl font-bold text-white mb-6">Team Information</h2>
        <div className="glass-card p-6 space-y-4">

          {/* Team basics */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Team Name <span className="text-red-400">*</span></label>
            <input className="input-dark" placeholder="e.g. The Einsteins"
              value={teamName} onChange={e => setTeamName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Institution / School <span className="text-red-400">*</span></label>
            <input className="input-dark" placeholder="School name"
              value={institution} onChange={e => setInstitution(e.target.value)} />
          </div>

          {/* Member 1 — REQUIRED */}
          <div className="border-t border-white/10 pt-4">
            <p className="text-cyan-400 font-semibold text-sm mb-3">
              👤 Member 1 <span className="text-red-400 text-xs ml-1">*Required</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name <span className="text-red-400">*</span></label>
                <input className="input-dark" placeholder="Full name"
                  value={m1name} onChange={e => setM1name(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Class <span className="text-red-400">*</span></label>
                <select className="input-dark" value={m1class} onChange={e => setM1class(e.target.value)}>
                  <option value="">Select class</option>
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Member 2 — OPTIONAL */}
          <div className="border-t border-white/10 pt-4">
            <p className="text-cyan-400 font-semibold text-sm mb-1">
              👤 Member 2 <span className="text-gray-500 text-xs ml-1">(Optional)</span>
            </p>
            <p className="text-gray-600 text-xs mb-3">Leave blank if team has only 1 member</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input className="input-dark" placeholder="Full name (optional)"
                  value={m2name} onChange={e => setM2name(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Class</label>
                <select className="input-dark" value={m2class} onChange={e => setM2class(e.target.value)}
                  disabled={!m2name}>
                  <option value="">Select class</option>
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Member 3 — OPTIONAL */}
          <div className="border-t border-white/10 pt-4">
            <p className="text-cyan-400 font-semibold text-sm mb-1">
              👤 Member 3 <span className="text-gray-500 text-xs ml-1">(Optional)</span>
            </p>
            <p className="text-gray-600 text-xs mb-3">Leave blank if team has only 1 or 2 members</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input className="input-dark" placeholder="Full name (optional)"
                  value={m3name} onChange={e => setM3name(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Class</label>
                <select className="input-dark" value={m3class} onChange={e => setM3class(e.target.value)}
                  disabled={!m3name}>
                  <option value="">Select class</option>
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Validation warning for optional members */}
          {(m2name && !m2class) && <p className="text-yellow-400 text-xs">⚠️ Please select a class for Member 2.</p>}
          {(m3name && !m3class) && <p className="text-yellow-400 text-xs">⚠️ Please select a class for Member 3.</p>}

          {error && <p className="text-red-400 text-sm">❌ {error}</p>}

          <button onClick={() => {
            if (!teamName || !institution) return setError("Please fill team name and institution.");
            if (!m1name || !m1class)       return setError("Please fill Member 1 name and class.");
            if (m2name && !m2class)        return setError("Please select a class for Member 2.");
            if (m3name && !m3class)        return setError("Please select a class for Member 3.");
            setError(""); setStep(2);
          }}
          className="w-full py-3 rounded-lg font-bold transition-all mt-2"
          style={{ background:accent, color:"#000" }}>
            Next: Payment Method →
          </button>
        </div>
      </div>
    </div>
  );

  // ── step 2: payment ──
  if (step === 2) return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <StepBar current={2} total={5} color={accent} />
        <h2 className="text-xl font-bold text-white mb-6">Payment Method</h2>

        {!payMethod && (
          <div className="grid sm:grid-cols-2 gap-4">
            <button onClick={() => setPayMethod("bkash")}
              className="glass-card p-6 text-left hover:border-pink-400/50 transition-all" style={{cursor:"pointer"}}>
              <div className="text-4xl mb-3">📱</div>
              <h3 className="font-bold text-pink-400 mb-1">Bkash Payment</h3>
              <p className="text-gray-400 text-sm">Send 300 BDT via Bkash and enter transaction details.</p>
            </button>
            <button onClick={() => setPayMethod("card")}
              className="glass-card p-6 text-left hover:border-cyan-400/50 transition-all" style={{cursor:"pointer"}}>
              <div className="text-4xl mb-3">🎴</div>
              <h3 className="font-bold text-cyan-400 mb-1">Registration Card</h3>
              <p className="text-gray-400 text-sm">Use a physical card purchased offline. Enter the 16-character code.</p>
            </button>
          </div>
        )}

        {payMethod === "bkash" && (
          <div className="glass-card p-6 space-y-4">
            <button onClick={() => setPayMethod(null)} className="text-gray-500 text-sm hover:text-white">← Change method</button>
            <div className="rounded-lg p-4 border border-pink-500/30" style={{background:"rgba(236,72,153,0.08)"}}>
              <p className="text-pink-400 font-bold mb-1">📱 Bkash Payment</p>
              <p className="text-gray-300 text-sm">Send <span className="text-white font-bold">300 BDT</span> to:</p>
              <p className="text-pink-400 font-mono text-2xl font-bold my-2">01710176301</p>
              <p className="text-gray-400 text-sm">Type: <span className="text-white">Personal</span> &nbsp;|&nbsp; Ref: <span className="text-white">SparkFest2026</span></p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Sender Bkash Number <span className="text-red-400">*</span></label>
              <MobileInput value={bkashSender} onChange={setBkashSender} required />
              {bkashSender && !isValidMobile(bkashSender) && <p className="text-red-400 text-xs mt-1">⚠️ Must be 11 digits starting with 01</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Transaction ID (TrxID) <span className="text-red-400">*</span></label>
              <input className="input-dark" placeholder="e.g. 8AB12CD345"
                value={bkashTxn} onChange={e => setBkashTxn(e.target.value)} />
            </div>
            <div className="rounded-lg p-3 border border-yellow-500/20 text-yellow-400 text-xs" style={{background:"rgba(234,179,8,0.08)"}}>
              ⚠️ The registration fee of 300 BDT is non-refundable under any circumstances.
            </div>
            {error && <p className="text-red-400 text-sm">❌ {error}</p>}
            <button onClick={() => {
              if (!isValidMobile(bkashSender)) return setError("Please enter a valid 11-digit Bkash number.");
              if (!bkashTxn.trim()) return setError("Please enter the Transaction ID.");
              setError(""); setStep(3);
            }}
            className="w-full py-3 rounded-lg font-bold transition-all"
            style={{ background:accent, color:"#000" }}>
              Next: Contact Info →
            </button>
          </div>
        )}

        {payMethod === "card" && (
          <div className="glass-card p-6 space-y-4">
            <button onClick={() => setPayMethod(null)} className="text-gray-500 text-sm hover:text-white">← Change method</button>
            <div className="rounded-lg p-4 border border-cyan-500/30" style={{background:"rgba(0,245,255,0.05)"}}>
              <p className="text-cyan-400 font-bold mb-1">🎴 Registration Card</p>
              <p className="text-gray-400 text-sm">Enter the unique code printed on your registration card.</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Card Code <span className="text-red-400">*</span></label>
              <input className="input-dark font-mono" placeholder="16-character card code"
                value={cardCode} onChange={e => { setCardCode(e.target.value); setCardError(""); }} />
              {cardError && <p className="text-red-400 text-xs mt-1">❌ {cardError}</p>}
            </div>
            <button disabled={cardChecking || !cardCode.trim()}
              onClick={async () => {
                setCardChecking(true); setCardError("");
                const res = await validateCardCode(cardCode, "quiz");
                setCardChecking(false);
                if (res.valid) setStep(3);
                else setCardError(res.message || "Invalid or already used card code.");
              }}
              className="w-full py-3 rounded-lg font-bold transition-all"
              style={{ background:accent, color:"#000", opacity: cardChecking || !cardCode.trim() ? 0.6 : 1 }}>
              {cardChecking ? "⏳ Verifying..." : "Verify Card & Continue →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // ── step 3: contact ──
  if (step === 3) return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <StepBar current={3} total={5} color={accent} />
        <h2 className="text-xl font-bold text-white mb-6">Contact Information</h2>
        <div className="glass-card p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Contact Mobile Number <span className="text-red-400">*</span></label>
            <MobileInput value={mobile} onChange={setMobile} required />
            {mobile && !isValidMobile(mobile) && <p className="text-red-400 text-xs mt-1">⚠️ Must be 11 digits starting with 01</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email Address <span className="text-red-400">*</span></label>
            <input className="input-dark" type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} />
            {email && !isValidEmail(email) && <p className="text-red-400 text-xs mt-1">⚠️ Please enter a valid email address</p>}
          </div>
          <p className="text-gray-500 text-xs">This mobile and email will be used to check your registration status.</p>
          {error && <p className="text-red-400 text-sm">❌ {error}</p>}
          <button onClick={() => {
            if (!isValidMobile(mobile)) return setError("Please enter a valid 11-digit mobile number.");
            if (!isValidEmail(email))   return setError("Please enter a valid email address.");
            setError(""); setStep(4);
          }}
          className="w-full py-3 rounded-lg font-bold transition-all"
          style={{ background:accent, color:"#000" }}>
            Next: Review →
          </button>
        </div>
      </div>
    </div>
  );

  // ── step 4: review ──
  if (step === 4) {
    const Row = ({ label, value }) => value ? (
      <div className="flex justify-between items-start py-2 border-b border-white/5 last:border-0">
        <span className="text-gray-400 text-sm">{label}</span>
        <span className="text-white text-sm font-medium text-right max-w-[60%]">{value}</span>
      </div>
    ) : null;

    async function handleSubmit() {
      setSubmitting(true); setError("");
      try {
        const data = await post({
          action: "registerQuiz",
          team_name: teamName, institution,
          member1_name: m1name, member1_class: m1class,
          member2_name: m2name || "", member2_class: m2class || "",
          member3_name: m3name || "", member3_class: m3class || "",
          contact_mobile: mobile, email,
          payment_method: payMethod,
          bkash_number:  bkashSender, bkash_txn_id: bkashTxn,
          card_code:     cardCode,
        });
        if (data.success) { setRegId(data.reg_id); setStep(5); }
        else setError(data.message);
      } catch { setError("Network error. Please try again."); }
      finally { setSubmitting(false); }
    }

    const memberCount = [m1name, m2name, m3name].filter(Boolean).length;

    return (
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <StepBar current={4} total={5} color={accent} />
          <h2 className="text-xl font-bold text-white mb-6">Review Your Registration</h2>
          <div className="glass-card p-6 space-y-0 mb-4">
            <p className="text-cyan-400 font-semibold text-sm mb-3">🧩 Quiz Competition</p>
            <Row label="Team Name"    value={teamName} />
            <Row label="Institution"  value={institution} />
            <Row label={`Member 1`}   value={`${m1name} (${m1class})`} />
            {m2name && <Row label="Member 2" value={`${m2name}${m2class ? ` (${m2class})` : ""}`} />}
            {m3name && <Row label="Member 3" value={`${m3name}${m3class ? ` (${m3class})` : ""}`} />}
            <Row label="Total Members" value={`${memberCount} member${memberCount > 1 ? "s" : ""}`} />
            <Row label="Payment"      value={payMethod === "bkash" ? "Bkash" : "Registration Card"} />
            {payMethod === "bkash" && <>
              <Row label="Bkash Sender" value={bkashSender} />
              <Row label="TrxID"        value={bkashTxn} />
            </>}
            {payMethod === "card" && <Row label="Card Code" value={cardCode} />}
            <Row label="Mobile"  value={mobile} />
            <Row label="Email"   value={email} />
            <Row label="Fee"     value="300 BDT" />
          </div>
          <div className="flex items-start gap-3 mb-4 p-4 rounded-lg border border-white/10"
            style={{background:"rgba(255,255,255,0.03)"}}>
            <input type="checkbox" id="confirm" className="mt-1 accent-cyan-400"
              onChange={e => setError(e.target.checked ? "" : "Please confirm to submit.")} />
            <label htmlFor="confirm" className="text-gray-300 text-sm leading-relaxed" style={{cursor:"pointer"}}>
              I confirm that all the above information is correct and I agree to the competition rules.
            </label>
          </div>
          {error && <p className="text-red-400 text-sm mb-3">❌ {error}</p>}
          <button onClick={handleSubmit} disabled={submitting}
            className="w-full py-4 rounded-lg font-bold text-lg transition-all"
            style={{ background:accent, color:"#000", boxShadow:`0 0 20px ${accent}44`, opacity:submitting?0.6:1 }}>
            {submitting ? "⏳ Submitting..." : "✅ Confirm & Submit Registration"}
          </button>
        </div>
      </div>
    );
  }

  // ── step 5: success ──
  return (
    <div className="min-h-screen pt-24 flex items-center justify-center px-4">
      <div className="glass-card p-10 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-cyan-400 mb-2">Registration Successful!</h2>
        <p className="text-gray-400 mb-4">
          {payMethod === "card"
            ? "Your registration is confirmed. See you at Spark Fest!"
            : "Registration submitted. Admin will verify payment within 24 hours."}
        </p>
        <div className="rounded-lg p-4 mb-4 text-left" style={{background:"#1a2035"}}>
          <p className="text-xs text-gray-500 mb-1">Registration ID</p>
          <p className="font-mono text-cyan-400 font-bold">{regId}</p>
          <p className="text-xs text-gray-500 mt-2">Status</p>
          <p className={payMethod === "card" ? "text-green-400 font-bold" : "text-yellow-400 font-bold"}>
            {payMethod === "card" ? "✅ CONFIRMED" : "⏳ PENDING — Awaiting payment verification"}
          </p>
        </div>
        <p className="text-gray-500 text-xs mb-6">Save your Registration ID to check status later.</p>
        <button onClick={() => window.location.href = "/status"}
          className="w-full py-3 rounded-lg font-bold transition-all"
          style={{ background:accent, color:"#000" }}>
          Check Status →
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// OLYMPIAD REGISTRATION
// Steps: 0=Rules | 1=Personal | 2=Segments | 3=Payment | 4=Contact | 5=Review | 6=Success
// ICT removed from segments
// ══════════════════════════════════════════════════════════════
function OlympiadRegistration({ onBack }) {
  const { post }   = useApi();
  const [step, setStep]       = useState(0);
  const [payMethod, setPayMethod] = useState(null);
  const accent = "#a855f7";

  const [name,        setName]        = useState("");
  const [className,   setClassName]   = useState("");
  const [institution, setInstitution] = useState("");
  const [segments,    setSegments]    = useState([]);

  const [bkashSender, setBkashSender] = useState("");
  const [bkashTxn,    setBkashTxn]    = useState("");
  const [cardCodes,   setCardCodes]   = useState([""]);
  const [cardErrors,  setCardErrors]  = useState([]);
  const [cardChecking,setCardChecking]= useState(false);

  const [mobile, setMobile] = useState("");
  const [email,  setEmail]  = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [regId,      setRegId]      = useState("");

  const totalFee = segments.length * 100;

  function toggleSegment(id) {
    setSegments(prev => {
      const next = prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id];
      setCardCodes(Array(next.length).fill("").map((_, i) => cardCodes[i] || ""));
      return next;
    });
  }

  // ── step 0: rules ──
  if (step === 0) return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="text-gray-400 hover:text-white text-sm mb-6">← Back</button>
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔭</div>
          <h1 className="text-2xl font-bold text-purple-400">Science Olympiad</h1>
          <p className="text-gray-400 text-sm mt-1">Please read the rules carefully before registering</p>
        </div>
        <div className="glass-card p-6 mb-6">
          <pre className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">{OLYMPIAD_RULES}</pre>
        </div>
        <button onClick={() => setStep(1)}
          className="w-full py-4 rounded-lg font-bold text-lg transition-all"
          style={{ background:accent, color:"#fff", boxShadow:`0 0 20px ${accent}44` }}>
          I understand — Proceed to Registration →
        </button>
      </div>
    </div>
  );

  // ── step 1: personal info ──
  if (step === 1) return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <StepBar current={1} total={6} color={accent} />
        <h2 className="text-xl font-bold text-white mb-6">Personal Information</h2>
        <div className="glass-card p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Full Name <span className="text-red-400">*</span></label>
            <input className="input-dark" placeholder="Your full name"
              value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Class <span className="text-red-400">*</span></label>
            <select className="input-dark" value={className} onChange={e => setClassName(e.target.value)}>
              <option value="">Select your class</option>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Institution / School <span className="text-red-400">*</span></label>
            <input className="input-dark" placeholder="School / College name"
              value={institution} onChange={e => setInstitution(e.target.value)} />
          </div>
          {error && <p className="text-red-400 text-sm">❌ {error}</p>}
          <button onClick={() => {
            if (!name || !className || !institution) return setError("Please fill all fields.");
            setError(""); setStep(2);
          }}
          className="w-full py-3 rounded-lg font-bold transition-all"
          style={{ background:accent, color:"#fff" }}>
            Next: Select Segments →
          </button>
        </div>
      </div>
    </div>
  );

  // ── step 2: segment selection ──
  if (step === 2) return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <StepBar current={2} total={6} color={accent} />
        <h2 className="text-xl font-bold text-white mb-2">Select Olympiad Segments</h2>
        <p className="text-gray-400 text-sm mb-6">You may select one or more segments. Fee: 100 BDT per segment.</p>
        <div className="space-y-3 mb-6">
          {OLYMPIAD_SEGMENTS.map(seg => (
            <button key={seg.id} onClick={() => toggleSegment(seg.id)}
              className="w-full glass-card p-4 flex items-center gap-4 hover:border-purple-400/40 transition-all text-left"
              style={{ cursor:"pointer", borderColor: segments.includes(seg.id) ? "#a855f7" : "" }}>
              <div className="w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 transition-all"
                style={{
                  borderColor: segments.includes(seg.id) ? accent : "rgba(255,255,255,0.2)",
                  background:  segments.includes(seg.id) ? accent : "transparent",
                }}>
                {segments.includes(seg.id) && <span className="text-white text-xs font-bold">✓</span>}
              </div>
              <p className="text-white font-medium flex-1">{seg.label}</p>
              <span className="text-purple-400 font-bold text-sm shrink-0">100 BDT</span>
            </button>
          ))}
        </div>

        {segments.length > 0 && (
          <div className="rounded-lg p-4 mb-4 border border-purple-500/30" style={{background:"rgba(168,85,247,0.08)"}}>
            <p className="text-purple-400 font-bold">Selected: {segments.length} segment(s)</p>
            <p className="text-white text-lg font-bold mt-1">Total Fee: {totalFee} BDT</p>
          </div>
        )}

        {error && <p className="text-red-400 text-sm mb-3">❌ {error}</p>}
        <button onClick={() => {
          if (segments.length === 0) return setError("Please select at least one segment.");
          setError(""); setStep(3);
        }}
        className="w-full py-3 rounded-lg font-bold transition-all"
        style={{ background:accent, color:"#fff", opacity: segments.length === 0 ? 0.5 : 1 }}>
          Next: Payment Method →
        </button>
      </div>
    </div>
  );

  // ── step 3: payment ──
  if (step === 3) return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <StepBar current={3} total={6} color={accent} />
        <h2 className="text-xl font-bold text-white mb-6">Payment Method</h2>

        {!payMethod && (
          <div className="grid sm:grid-cols-2 gap-4">
            <button onClick={() => setPayMethod("bkash")}
              className="glass-card p-6 text-left hover:border-pink-400/50 transition-all" style={{cursor:"pointer"}}>
              <div className="text-4xl mb-3">📱</div>
              <h3 className="font-bold text-pink-400 mb-1">Bkash Payment</h3>
              <p className="text-gray-400 text-sm">Send {totalFee} BDT via Bkash.</p>
            </button>
            <button onClick={() => setPayMethod("card")}
              className="glass-card p-6 text-left hover:border-purple-400/50 transition-all" style={{cursor:"pointer"}}>
              <div className="text-4xl mb-3">🎴</div>
              <h3 className="font-bold text-purple-400 mb-1">Registration Card</h3>
              <p className="text-gray-400 text-sm">
                {segments.length > 1 ? `You need ${segments.length} card codes.` : "Enter your card code."}
              </p>
            </button>
          </div>
        )}

        {payMethod === "bkash" && (
          <div className="glass-card p-6 space-y-4">
            <button onClick={() => setPayMethod(null)} className="text-gray-500 text-sm hover:text-white">← Change method</button>
            <div className="rounded-lg p-4 border border-pink-500/30" style={{background:"rgba(236,72,153,0.08)"}}>
              <p className="text-pink-400 font-bold mb-1">📱 Bkash Payment</p>
              <p className="text-gray-300 text-sm">Send <span className="text-white font-bold">{totalFee} BDT</span> ({segments.length} × 100 BDT) to:</p>
              <p className="text-pink-400 font-mono text-2xl font-bold my-2">01710176301</p>
              <p className="text-gray-400 text-sm">Ref: <span className="text-white">SparkFest2026</span></p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Sender Bkash Number <span className="text-red-400">*</span></label>
              <MobileInput value={bkashSender} onChange={setBkashSender} required />
              {bkashSender && !isValidMobile(bkashSender) && <p className="text-red-400 text-xs mt-1">⚠️ Must be 11 digits starting with 01</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Transaction ID (TrxID) <span className="text-red-400">*</span></label>
              <input className="input-dark" placeholder="e.g. 8AB12CD345"
                value={bkashTxn} onChange={e => setBkashTxn(e.target.value)} />
            </div>
            <div className="rounded-lg p-3 border border-yellow-500/20 text-yellow-400 text-xs" style={{background:"rgba(234,179,8,0.08)"}}>
              ⚠️ The registration fee of {totalFee} BDT is non-refundable under any circumstances.
            </div>
            {error && <p className="text-red-400 text-sm">❌ {error}</p>}
            <button onClick={() => {
              if (!isValidMobile(bkashSender)) return setError("Please enter a valid 11-digit Bkash number.");
              if (!bkashTxn.trim()) return setError("Please enter the Transaction ID.");
              setError(""); setStep(4);
            }}
            className="w-full py-3 rounded-lg font-bold"
            style={{ background:accent, color:"#fff" }}>
              Next: Contact Info →
            </button>
          </div>
        )}

        {payMethod === "card" && (
          <div className="glass-card p-6 space-y-4">
            <button onClick={() => setPayMethod(null)} className="text-gray-500 text-sm hover:text-white">← Change method</button>
            <div className="rounded-lg p-4 border border-purple-500/30" style={{background:"rgba(168,85,247,0.05)"}}>
              <p className="text-purple-400 font-bold mb-1">🎴 Registration Cards</p>
              <p className="text-gray-400 text-sm">
                You selected <span className="text-white font-bold">{segments.length}</span> segment(s).
                Enter <span className="text-white font-bold">{segments.length}</span> unique card code(s).
              </p>
            </div>
            {segments.map((segId, i) => {
              const seg = OLYMPIAD_SEGMENTS.find(s => s.id === segId);
              return (
                <div key={segId}>
                  <label className="block text-sm text-gray-400 mb-1">
                    Card {i + 1} — <span className="text-purple-400">{seg?.label}</span> <span className="text-red-400">*</span>
                  </label>
                  <input className="input-dark font-mono" placeholder="16-character card code"
                    value={cardCodes[i] || ""}
                    onChange={e => {
                      const newVal = e.target.value;
                      const next = [...cardCodes]; next[i] = newVal; setCardCodes(next);

                      // ✅ Real-time duplicate check হিসেবে দেখাও
                      const errs = [...cardErrors];
                      const trimmedNew = newVal.trim().toUpperCase();
                      if (trimmedNew) {
                        const dupIndex = next.findIndex((c, idx) => idx !== i && c.trim().toUpperCase() === trimmedNew);
                        errs[i] = dupIndex !== -1
                          ? `This card code is already used in Card ${dupIndex + 1}. Use a different card.`
                          : "";
                      } else {
                        errs[i] = "";
                      }
                      setCardErrors(errs);
                    }} />
                  {cardErrors[i] && <p className="text-red-400 text-xs mt-1">❌ {cardErrors[i]}</p>}
                </div>
              );
            })}
            <button disabled={cardChecking || cardCodes.some(c => !c.trim())}
              onClick={async () => {
                // ✅ প্রথমে duplicate check করো — same code একাধিক field এ থাকলে আটকাও
                const trimmed = cardCodes.map(c => c.trim().toUpperCase());
                const dupErrors = Array(segments.length).fill("");
                let hasDuplicate = false;
                trimmed.forEach((code, i) => {
                  const firstIndex = trimmed.findIndex(c => c === code);
                  if (firstIndex !== i) {
                    dupErrors[i] = "This card code is already used in Card " + (firstIndex + 1) + ". Each segment needs a different card.";
                    hasDuplicate = true;
                  }
                });
                if (hasDuplicate) {
                  setCardErrors(dupErrors);
                  return;
                }

                // তারপর backend এ একে একে validate করো
                setCardChecking(true);
                const newErrors = Array(segments.length).fill("");
                let allValid = true;
                for (let i = 0; i < segments.length; i++) {
                  const res = await validateCardCode(cardCodes[i], "olympiad");
                  if (!res.valid) { newErrors[i] = res.message || "Invalid or used code."; allValid = false; }
                }
                setCardErrors(newErrors); setCardChecking(false);
                if (allValid) setStep(4);
              }}
              className="w-full py-3 rounded-lg font-bold transition-all"
              style={{ background:accent, color:"#fff", opacity: cardChecking || cardCodes.some(c=>!c.trim()) ? 0.6 : 1 }}>
              {cardChecking ? "⏳ Verifying cards..." : "Verify All Cards & Continue →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // ── step 4: contact ──
  if (step === 4) return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <StepBar current={4} total={6} color={accent} />
        <h2 className="text-xl font-bold text-white mb-6">Contact Information</h2>
        <div className="glass-card p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Mobile Number <span className="text-red-400">*</span></label>
            <MobileInput value={mobile} onChange={setMobile} required />
            {mobile && !isValidMobile(mobile) && <p className="text-red-400 text-xs mt-1">⚠️ Must be 11 digits starting with 01</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email Address <span className="text-red-400">*</span></label>
            <input className="input-dark" type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} />
            {email && !isValidEmail(email) && <p className="text-red-400 text-xs mt-1">⚠️ Please enter a valid email address</p>}
          </div>
          {error && <p className="text-red-400 text-sm">❌ {error}</p>}
          <button onClick={() => {
            if (!isValidMobile(mobile)) return setError("Please enter a valid 11-digit mobile number.");
            if (!isValidEmail(email))   return setError("Please enter a valid email address.");
            setError(""); setStep(5);
          }}
          className="w-full py-3 rounded-lg font-bold"
          style={{ background:accent, color:"#fff" }}>
            Next: Review →
          </button>
        </div>
      </div>
    </div>
  );

  // ── step 5: review ──
  if (step === 5) {
    const Row = ({ label, value }) => value ? (
      <div className="flex justify-between items-start py-2 border-b border-white/5 last:border-0">
        <span className="text-gray-400 text-sm">{label}</span>
        <span className="text-white text-sm font-medium text-right max-w-[60%]">{value}</span>
      </div>
    ) : null;

    async function handleSubmit() {
      setSubmitting(true); setError("");
      try {
        const data = await post({
          action: "registerOlympiad",
          name, class: className, institution,
          subjects: segments.join(","),
          contact_mobile: mobile, email,
          payment_method: payMethod,
          bkash_number:  bkashSender, bkash_txn_id: bkashTxn,
          card_codes:    cardCodes.join(","),
        });
        if (data.success) { setRegId(data.reg_id); setStep(6); }
        else setError(data.message);
      } catch { setError("Network error. Please try again."); }
      finally { setSubmitting(false); }
    }

    return (
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <StepBar current={5} total={6} color={accent} />
          <h2 className="text-xl font-bold text-white mb-6">Review Your Registration</h2>
          <div className="glass-card p-6 space-y-0 mb-4">
            <p className="text-purple-400 font-semibold text-sm mb-3">🔭 Science Olympiad</p>
            <Row label="Name"        value={name} />
            <Row label="Class"       value={className} />
            <Row label="Institution" value={institution} />
            <Row label="Segments"    value={segments.map(id => OLYMPIAD_SEGMENTS.find(s => s.id === id)?.label).join(", ")} />
            <Row label="Payment"     value={payMethod === "bkash" ? "Bkash" : "Registration Card"} />
            {payMethod === "bkash" && <>
              <Row label="Bkash Sender" value={bkashSender} />
              <Row label="TrxID"        value={bkashTxn} />
            </>}
            <Row label="Mobile"    value={mobile} />
            <Row label="Email"     value={email} />
            <Row label="Total Fee" value={`${totalFee} BDT`} />
          </div>
          <div className="flex items-start gap-3 mb-4 p-4 rounded-lg border border-white/10"
            style={{background:"rgba(255,255,255,0.03)"}}>
            <input type="checkbox" id="confirm2" className="mt-1 accent-purple-400"
              onChange={e => setError(e.target.checked ? "" : "err")} />
            <label htmlFor="confirm2" className="text-gray-300 text-sm leading-relaxed" style={{cursor:"pointer"}}>
              I confirm all information is correct and I agree to the competition rules.
            </label>
          </div>
          {error && error !== "err" && <p className="text-red-400 text-sm mb-3">❌ {error}</p>}
          <button onClick={handleSubmit} disabled={submitting}
            className="w-full py-4 rounded-lg font-bold text-lg transition-all"
            style={{ background:accent, color:"#fff", boxShadow:`0 0 20px ${accent}44`, opacity:submitting?0.6:1 }}>
            {submitting ? "⏳ Submitting..." : "✅ Confirm & Submit Registration"}
          </button>
        </div>
      </div>
    );
  }

  // ── step 6: success ──
  return (
    <div className="min-h-screen pt-24 flex items-center justify-center px-4">
      <div className="glass-card p-10 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-purple-400 mb-2">Registration Successful!</h2>
        <p className="text-gray-400 mb-4">
          {payMethod === "card"
            ? "Your registration is confirmed. See you at Spark Fest!"
            : "Registration submitted. Admin will verify payment within 24 hours."}
        </p>
        <div className="rounded-lg p-4 mb-4 text-left" style={{background:"#1a2035"}}>
          <p className="text-xs text-gray-500 mb-1">Registration ID</p>
          <p className="font-mono text-purple-400 font-bold">{regId}</p>
          <p className="text-xs text-gray-500 mt-2">Status</p>
          <p className={payMethod === "card" ? "text-green-400 font-bold" : "text-yellow-400 font-bold"}>
            {payMethod === "card" ? "✅ CONFIRMED" : "⏳ PENDING"}
          </p>
        </div>
        <button onClick={() => window.location.href = "/status"}
          className="w-full py-3 rounded-lg font-bold"
          style={{ background:accent, color:"#fff" }}>
          Check Status →
        </button>
      </div>
    </div>
  );
}