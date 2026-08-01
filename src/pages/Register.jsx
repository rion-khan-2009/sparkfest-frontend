import { useState } from "react";
import { useApi } from "../context/ApiContext";
import { API_URL } from "../context/ApiContext";

// ─── Constants ───────────────────────────────────────────────
const CLASSES = ["Class 6","Class 7","Class 8","Class 9","Class 10","SSC 26"];

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
• Use of calculators or electronic devices is not allowed.
• Decision of the judges will be final.`;

const SCIENCE_PROJECT_RULES = `SCIENCE PROJECT SHOWCASING — RULES & GUIDELINES

• This is a GROUP event. Each team may have 1 to 3 members.
• Eligible classes: Class 6 to SSC '26.
• Registration fee: 150 BDT per team (non-refundable).
• All team members must be from the same institution.
• Teams must bring their project and registration confirmation on event day.
• Projects must be related to science or technology.
• No replacement of team members or project after registration.
• Decision of the judges will be final.`;

const ASTRO_RULES = `ASTRO PHOTOGRAPHY — RULES & GUIDELINES

• This is a FREE individual event. No registration fee.
• Eligible classes: Class 6 to SSC '26.
• Each participant must submit ONE astronomy photograph.
• The photograph must be taken by the participant themselves.
• Submit via Google Drive public link (instructions on next page).
• Image must not be AI-generated or heavily edited.
• Decision of the judges will be final.`;

// ─── Helpers ─────────────────────────────────────────────────
function formatMobile(val) { return val.replace(/\D/g,"").slice(0,11); }
function isValidMobile(val) { return /^01[0-9]{9}$/.test(val); }
function isValidEmail(val)  { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val); }

function MobileInput({ value, onChange, required }) {
  return (
    <div className="flex">
      <span className="flex items-center px-3 rounded-l-lg border border-r-0 border-white/10 text-gray-400 text-sm shrink-0"
        style={{background:"#0f172a"}}>+88</span>
      <input type="tel" className="input-dark rounded-l-none flex-1"
        placeholder="01XXXXXXXXX" maxLength={11} value={value} required={required}
        onChange={e=>onChange(formatMobile(e.target.value))}/>
    </div>
  );
}

async function validateCardCode(code, expectedType) {
  try {
    const res = await fetch(API_URL, {
      method:"POST", redirect:"follow",
      headers:{"Content-Type":"text/plain"},
      body: JSON.stringify({ action:"validateCard", card_code:code.trim(), expected_type:expectedType })
    });
    return await res.json();
  } catch { return { valid:false, message:"Network error. Please try again." }; }
}

// ─── Step bar ────────────────────────────────────────────────
function StepBar({ current, total, color="#00f5ff" }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({length:total}).map((_,i)=>(
        <div key={i} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all"
            style={{
              borderColor: i<=current?color:"rgba(255,255,255,0.15)",
              background:  i<current?color:i===current?color+"22":"transparent",
              color:       i<=current?(i<current?"#000":color):"rgba(255,255,255,0.3)",
            }}>
            {i<current?"✓":i+1}
          </div>
          {i<total-1&&<div className="flex-1 h-0.5 w-8" style={{background:i<current?color:"rgba(255,255,255,0.1)"}}/>}
        </div>
      ))}
    </div>
  );
}

// ─── Success screen ──────────────────────────────────────────
function SuccessScreen({ regId, payMethod, accent, color="#000" }) {
  return (
    <div className="min-h-screen pt-24 flex items-center justify-center px-4">
      <div className="glass-card p-10 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2" style={{color:accent}}>Registration Successful!</h2>
        <p className="text-gray-400 mb-4">
          {payMethod==="card"||!payMethod
            ? "Your registration is confirmed. See you at Spark Fest!"
            : "Registration submitted. Admin will verify payment within 24 hours."}
        </p>
        <div className="rounded-lg p-4 mb-4 text-left" style={{background:"#1a2035"}}>
          <p className="text-xs text-gray-500 mb-1">Registration ID</p>
          <p className="font-mono font-bold" style={{color:accent}}>{regId}</p>
          <p className="text-xs text-gray-500 mt-2">Status</p>
          <p className={payMethod==="card"||!payMethod?"text-green-400 font-bold":"text-yellow-400 font-bold"}>
            {payMethod==="card"||!payMethod?"✅ CONFIRMED":"⏳ PENDING — Awaiting payment verification"}
          </p>
        </div>
        <button onClick={()=>window.location.href="/status"}
          className="w-full py-3 rounded-lg font-bold transition-all"
          style={{background:accent,color}}>
          Check Status →
        </button>
      </div>
    </div>
  );
}

// ─── Payment step (reusable) ─────────────────────────────────
function PaymentStep({ fee, payMethod, setPayMethod, bkashSender, setBkashSender,
  bkashTxn, setBkashTxn, cardCode, setCardCode, cardError, setCardError,
  accent, cardType, onNext, error, setError }) {
  const [cardChecking, setCardChecking] = useState(false);

  if (!payMethod) return (
    <div className="grid sm:grid-cols-2 gap-4">
      <button onClick={()=>setPayMethod("bkash")}
        className="glass-card p-6 text-left hover:border-pink-400/50 transition-all" style={{cursor:"pointer"}}>
        <div className="text-4xl mb-3">📱</div>
        <h3 className="font-bold text-pink-400 mb-1">Bkash Payment</h3>
        <p className="text-gray-400 text-sm">Send {fee} BDT via Bkash.</p>
      </button>
      <button onClick={()=>setPayMethod("card")}
        className="glass-card p-6 text-left hover:border-cyan-400/50 transition-all" style={{cursor:"pointer"}}>
        <div className="text-4xl mb-3">🎴</div>
        <h3 className="font-bold text-cyan-400 mb-1">Registration Card</h3>
        <p className="text-gray-400 text-sm">Use a physical registration card.</p>
      </button>
    </div>
  );

  if (payMethod==="bkash") return (
    <div className="glass-card p-6 space-y-4">
      <button onClick={()=>setPayMethod(null)} className="text-gray-500 text-sm hover:text-white">← Change method</button>
      <div className="rounded-lg p-4 border border-pink-500/30" style={{background:"rgba(236,72,153,0.08)"}}>
        <p className="text-pink-400 font-bold mb-1">📱 Bkash Payment</p>
        <p className="text-gray-300 text-sm">Send <span className="text-white font-bold">{fee} BDT</span> to:</p>
        <p className="text-pink-400 font-mono text-2xl font-bold my-2">01710176301</p>
        <p className="text-gray-400 text-sm">Type: <span className="text-white">Personal</span> · Ref: <span className="text-white">SparkFest2026</span></p>
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Sender Bkash Number <span className="text-red-400">*</span></label>
        <MobileInput value={bkashSender} onChange={setBkashSender} required/>
        {bkashSender&&!isValidMobile(bkashSender)&&<p className="text-red-400 text-xs mt-1">⚠️ Must be 11 digits starting with 01</p>}
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Transaction ID (TrxID) <span className="text-red-400">*</span></label>
        <input className="input-dark" placeholder="e.g. 8AB12CD345" value={bkashTxn} onChange={e=>setBkashTxn(e.target.value)}/>
      </div>
      <div className="rounded-lg p-3 border border-yellow-500/20 text-yellow-400 text-xs" style={{background:"rgba(234,179,8,0.08)"}}>
        ⚠️ The registration fee of {fee} BDT is non-refundable.
      </div>
      {error&&<p className="text-red-400 text-sm">❌ {error}</p>}
      <button onClick={()=>{
        if(!isValidMobile(bkashSender)) return setError("Please enter a valid 11-digit Bkash number.");
        if(!bkashTxn.trim()) return setError("Please enter the Transaction ID.");
        setError(""); onNext();
      }} className="w-full py-3 rounded-lg font-bold" style={{background:accent,color:"#000"}}>
        Next: Contact Info →
      </button>
    </div>
  );

  if (payMethod==="card") return (
    <div className="glass-card p-6 space-y-4">
      <button onClick={()=>setPayMethod(null)} className="text-gray-500 text-sm hover:text-white">← Change method</button>
      <div className="rounded-lg p-4 border border-cyan-500/30" style={{background:"rgba(0,245,255,0.05)"}}>
        <p className="text-cyan-400 font-bold mb-1">🎴 Registration Card</p>
        <p className="text-gray-400 text-sm">Enter the unique 16-character code on your registration card.</p>
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Card Code <span className="text-red-400">*</span></label>
        <input className="input-dark font-mono" placeholder="XXXX-XXXX-XXXX-XXXX"
          value={cardCode} onChange={e=>{setCardCode(e.target.value);setCardError("");}}/>
        {cardError&&<p className="text-red-400 text-xs mt-1">❌ {cardError}</p>}
      </div>
      <button disabled={cardChecking||!cardCode.trim()}
        onClick={async()=>{
          setCardChecking(true); setCardError("");
          const res = await validateCardCode(cardCode, cardType);
          setCardChecking(false);
          if(res.valid) onNext();
          else setCardError(res.message||"Invalid or already used card code.");
        }}
        className="w-full py-3 rounded-lg font-bold transition-all"
        style={{background:accent,color:"#000",opacity:cardChecking||!cardCode.trim()?0.6:1}}>
        {cardChecking?"⏳ Verifying...":"Verify Card & Continue →"}
      </button>
    </div>
  );

  return null;
}

// ──────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────
export default function Register() {
  const [competitionType, setCompetitionType] = useState(null);
  if (!competitionType) return <CompetitionSelect onSelect={setCompetitionType}/>;
  if (competitionType==="quiz")           return <QuizRegistration          onBack={()=>setCompetitionType(null)}/>;
  if (competitionType==="olympiad")       return <OlympiadRegistration       onBack={()=>setCompetitionType(null)}/>;
  if (competitionType==="science_project")return <ScienceProjectRegistration  onBack={()=>setCompetitionType(null)}/>;
  if (competitionType==="astro_photo")    return <AstroPhotoRegistration      onBack={()=>setCompetitionType(null)}/>;
  return null;
}

// ─── Competition selector ─────────────────────────────────────
function CompetitionSelect({ onSelect }) {
  const events = [
    { id:"quiz",            icon:"🧩", title:"Quiz Competition",           color:"#00f5ff",
      desc:"Group competition for teams of up to 3 members.",
      details:["👥 1–3 members per team","📚 Class 6 – SSC '26","💳 Fee: 300 BDT per team"] },
    { id:"olympiad",        icon:"🔭", title:"Science Olympiad",           color:"#a855f7",
      desc:"Individual competition across 5 science segments.",
      details:["👤 Individual","📚 Class 6 – SSC '26","💳 Fee: 100 BDT per segment"] },
    { id:"science_project", icon:"🔬", title:"Science Project Showcasing", color:"#f59e0b",
      desc:"Showcase your science project with your team.",
      details:["👥 1–3 members per team","📚 Class 6 – SSC '26","💳 Fee: 150 BDT per team"] },
    { id:"astro_photo",     icon:"🌌", title:"Astro Photography",          color:"#06b6d4",
      desc:"Submit your astronomy photograph. Free event!",
      details:["👤 Individual","📚 Class 6 – SSC '26","💳 FREE — No registration fee"] },
  ];
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">📝 Registration</h1>
          <p className="text-gray-400">Select the event you want to register for</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {events.map(ev=>(
            <button key={ev.id} onClick={()=>onSelect(ev.id)}
              className="glass-card p-7 text-left hover:border-white/30 transition-all duration-300 group"
              style={{cursor:"pointer"}}>
              <div className="text-5xl mb-4">{ev.icon}</div>
              <h2 className="text-xl font-bold mb-2" style={{color:ev.color}}>{ev.title}</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">{ev.desc}</p>
              <div className="space-y-1 text-sm mb-6">
                {ev.details.map((d,i)=><p key={i} className="text-gray-300">{d}</p>)}
              </div>
              <div className="w-full py-2.5 rounded-lg text-center font-semibold text-sm border transition-all"
                style={{borderColor:ev.color+"66",color:ev.color}}>
                Register →
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// QUIZ REGISTRATION
// ══════════════════════════════════════════════════════════════
function QuizRegistration({ onBack }) {
  const {post}=useApi();
  const [step,setStep]=useState(0);
  const [payMethod,setPayMethod]=useState(null);
  const accent="#00f5ff";
  const [teamName,setTeamName]=useState("");
  const [institution,setInstitution]=useState("");
  const [m1name,setM1name]=useState(""); const [m1class,setM1class]=useState("");
  const [m2name,setM2name]=useState(""); const [m2class,setM2class]=useState("");
  const [m3name,setM3name]=useState(""); const [m3class,setM3class]=useState("");
  const [bkashSender,setBkashSender]=useState(""); const [bkashTxn,setBkashTxn]=useState("");
  const [cardCode,setCardCode]=useState(""); const [cardError,setCardError]=useState("");
  const [mobile,setMobile]=useState(""); const [email,setEmail]=useState("");
  const [submitting,setSubmitting]=useState(false);
  const [error,setError]=useState("");
  const [regId,setRegId]=useState("");

  if(step===0) return (
    <div className="min-h-screen pt-24 pb-16 px-4"><div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="text-gray-400 hover:text-white text-sm mb-6">← Back</button>
      <div className="text-center mb-8"><div className="text-5xl mb-3">🧩</div>
        <h1 className="text-2xl font-bold text-cyan-400">Quiz Competition</h1></div>
      <div className="glass-card p-6 mb-6"><pre className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">{QUIZ_RULES}</pre></div>
      <button onClick={()=>setStep(1)} className="w-full py-4 rounded-lg font-bold text-lg"
        style={{background:accent,color:"#000"}}>I understand — Proceed →</button>
    </div></div>
  );

  if(step===1) return (
    <div className="min-h-screen pt-24 pb-16 px-4"><div className="max-w-2xl mx-auto">
      <StepBar current={1} total={5} color={accent}/>
      <h2 className="text-xl font-bold text-white mb-6">Team Information</h2>
      <div className="glass-card p-6 space-y-4">
        <div><label className="block text-sm text-gray-400 mb-1">Team Name <span className="text-red-400">*</span></label>
          <input className="input-dark" placeholder="e.g. The Einsteins" value={teamName} onChange={e=>setTeamName(e.target.value)}/></div>
        <div><label className="block text-sm text-gray-400 mb-1">Institution <span className="text-red-400">*</span></label>
          <input className="input-dark" placeholder="School name" value={institution} onChange={e=>setInstitution(e.target.value)}/></div>
        <div className="border-t border-white/10 pt-4">
          <p className="text-cyan-400 font-semibold text-sm mb-3">👤 Member 1 <span className="text-red-400 text-xs ml-1">*Required</span></p>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm text-gray-400 mb-1">Name <span className="text-red-400">*</span></label>
              <input className="input-dark" placeholder="Full name" value={m1name} onChange={e=>setM1name(e.target.value)}/></div>
            <div><label className="block text-sm text-gray-400 mb-1">Class <span className="text-red-400">*</span></label>
              <select className="input-dark" value={m1class} onChange={e=>setM1class(e.target.value)}>
                <option value="">Select</option>{CLASSES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
          </div>
        </div>
        {[{n:m2name,setN:setM2name,c:m2class,setC:setM2class,num:2},{n:m3name,setN:setM3name,c:m3class,setC:setM3class,num:3}].map(m=>(
          <div key={m.num} className="border-t border-white/10 pt-4">
            <p className="text-cyan-400 font-semibold text-sm mb-1">👤 Member {m.num} <span className="text-gray-500 text-xs ml-1">(Optional)</span></p>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div><label className="block text-sm text-gray-400 mb-1">Name</label>
                <input className="input-dark" placeholder="Full name (optional)" value={m.n} onChange={e=>m.setN(e.target.value)}/></div>
              <div><label className="block text-sm text-gray-400 mb-1">Class</label>
                <select className="input-dark" value={m.c} onChange={e=>m.setC(e.target.value)} disabled={!m.n}>
                  <option value="">Select</option>{CLASSES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
            </div>
          </div>
        ))}
        {(m2name&&!m2class)||(m3name&&!m3class)?<p className="text-yellow-400 text-xs">⚠️ Please select class for added members.</p>:null}
        {error&&<p className="text-red-400 text-sm">❌ {error}</p>}
        <button onClick={()=>{
          if(!teamName||!institution) return setError("Please fill team name and institution.");
          if(!m1name||!m1class) return setError("Please fill Member 1 name and class.");
          if(m2name&&!m2class) return setError("Please select class for Member 2.");
          if(m3name&&!m3class) return setError("Please select class for Member 3.");
          setError("");setStep(2);
        }} className="w-full py-3 rounded-lg font-bold" style={{background:accent,color:"#000"}}>
          Next: Payment →
        </button>
      </div>
    </div></div>
  );

  if(step===2) return (
    <div className="min-h-screen pt-24 pb-16 px-4"><div className="max-w-2xl mx-auto">
      <StepBar current={2} total={5} color={accent}/>
      <h2 className="text-xl font-bold text-white mb-6">Payment Method</h2>
      <PaymentStep fee={300} payMethod={payMethod} setPayMethod={setPayMethod}
        bkashSender={bkashSender} setBkashSender={setBkashSender}
        bkashTxn={bkashTxn} setBkashTxn={setBkashTxn}
        cardCode={cardCode} setCardCode={setCardCode}
        cardError={cardError} setCardError={setCardError}
        accent={accent} cardType="quiz" onNext={()=>setStep(3)} error={error} setError={setError}/>
    </div></div>
  );

  if(step===3) return (
    <div className="min-h-screen pt-24 pb-16 px-4"><div className="max-w-2xl mx-auto">
      <StepBar current={3} total={5} color={accent}/>
      <h2 className="text-xl font-bold text-white mb-6">Contact Information</h2>
      <div className="glass-card p-6 space-y-4">
        <div><label className="block text-sm text-gray-400 mb-1">Mobile Number <span className="text-red-400">*</span></label>
          <MobileInput value={mobile} onChange={setMobile} required/>
          {mobile&&!isValidMobile(mobile)&&<p className="text-red-400 text-xs mt-1">⚠️ Must be 11 digits starting with 01</p>}</div>
        <div><label className="block text-sm text-gray-400 mb-1">Email <span className="text-red-400">*</span></label>
          <input className="input-dark" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/>
          {email&&!isValidEmail(email)&&<p className="text-red-400 text-xs mt-1">⚠️ Please enter a valid email</p>}</div>
        {error&&<p className="text-red-400 text-sm">❌ {error}</p>}
        <button onClick={()=>{
          if(!isValidMobile(mobile)) return setError("Please enter a valid 11-digit mobile number.");
          if(!isValidEmail(email)) return setError("Please enter a valid email address.");
          setError("");setStep(4);
        }} className="w-full py-3 rounded-lg font-bold" style={{background:accent,color:"#000"}}>
          Next: Review →
        </button>
      </div>
    </div></div>
  );

  if(step===4) {
    const R=({label,value})=>value?(<div className="flex justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-white text-sm font-medium text-right max-w-[60%]">{value}</span>
    </div>):null;
    async function handleSubmit() {
      setSubmitting(true);setError("");
      try {
        const d=await post({action:"registerQuiz",team_name:teamName,institution,
          member1_name:m1name,member1_class:m1class,
          member2_name:m2name||"",member2_class:m2class||"",
          member3_name:m3name||"",member3_class:m3class||"",
          contact_mobile:mobile,email,payment_method:payMethod,
          bkash_number:bkashSender,bkash_txn_id:bkashTxn,card_code:cardCode});
        if(d.success){setRegId(d.reg_id);setStep(5);}else setError(d.message);
      }catch{setError("Network error.");}finally{setSubmitting(false);}
    }
    return (
      <div className="min-h-screen pt-24 pb-16 px-4"><div className="max-w-2xl mx-auto">
        <StepBar current={4} total={5} color={accent}/>
        <h2 className="text-xl font-bold text-white mb-6">Review Registration</h2>
        <div className="glass-card p-6 mb-4">
          <p className="text-cyan-400 font-semibold text-sm mb-3">🧩 Quiz Competition</p>
          <R label="Team Name" value={teamName}/><R label="Institution" value={institution}/>
          <R label="Member 1" value={`${m1name} (${m1class})`}/>
          {m2name&&<R label="Member 2" value={`${m2name}${m2class?` (${m2class})`:""}`}/>}
          {m3name&&<R label="Member 3" value={`${m3name}${m3class?` (${m3class})`:""}`}/>}
          <R label="Payment" value={payMethod==="bkash"?"Bkash":"Registration Card"}/>
          {payMethod==="bkash"&&<><R label="Bkash Sender" value={bkashSender}/><R label="TrxID" value={bkashTxn}/></>}
          <R label="Mobile" value={mobile}/><R label="Email" value={email}/>
          <R label="Fee" value="300 BDT"/>
        </div>
        <div className="flex items-start gap-3 mb-4 p-4 rounded-lg border border-white/10" style={{background:"rgba(255,255,255,0.03)"}}>
          <input type="checkbox" id="c1" className="mt-1 accent-cyan-400" onChange={e=>setError(e.target.checked?"":"err")}/>
          <label htmlFor="c1" className="text-gray-300 text-sm" style={{cursor:"pointer"}}>I confirm all information is correct and I agree to the competition rules.</label>
        </div>
        {error&&error!=="err"&&<p className="text-red-400 text-sm mb-3">❌ {error}</p>}
        <button onClick={handleSubmit} disabled={submitting} className="w-full py-4 rounded-lg font-bold text-lg"
          style={{background:accent,color:"#000",opacity:submitting?0.6:1}}>
          {submitting?"⏳ Submitting...":"✅ Confirm & Submit"}
        </button>
      </div></div>
    );
  }
  return <SuccessScreen regId={regId} payMethod={payMethod} accent={accent} color="#000"/>;
}

// ══════════════════════════════════════════════════════════════
// OLYMPIAD REGISTRATION
// ══════════════════════════════════════════════════════════════
function OlympiadRegistration({ onBack }) {
  const {post}=useApi();
  const [step,setStep]=useState(0);
  const [payMethod,setPayMethod]=useState(null);
  const accent="#a855f7";
  const [name,setName]=useState(""); const [className,setClassName]=useState(""); const [institution,setInstitution]=useState("");
  const [segments,setSegments]=useState([]);
  const [bkashSender,setBkashSender]=useState(""); const [bkashTxn,setBkashTxn]=useState("");
  const [cardCodes,setCardCodes]=useState([""]); const [cardErrors,setCardErrors]=useState([]);
  const [cardChecking,setCardChecking]=useState(false);
  const [mobile,setMobile]=useState(""); const [email,setEmail]=useState("");
  const [submitting,setSubmitting]=useState(false);
  const [error,setError]=useState("");
  const [regId,setRegId]=useState("");
  const totalFee=segments.length*100;

  function toggleSegment(id){
    setSegments(prev=>{
      const next=prev.includes(id)?prev.filter(s=>s!==id):[...prev,id];
      setCardCodes(Array(next.length).fill("").map((_,i)=>cardCodes[i]||""));
      return next;
    });
  }

  if(step===0) return (
    <div className="min-h-screen pt-24 pb-16 px-4"><div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="text-gray-400 hover:text-white text-sm mb-6">← Back</button>
      <div className="text-center mb-8"><div className="text-5xl mb-3">🔭</div>
        <h1 className="text-2xl font-bold text-purple-400">Science Olympiad</h1></div>
      <div className="glass-card p-6 mb-6"><pre className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">{OLYMPIAD_RULES}</pre></div>
      <button onClick={()=>setStep(1)} className="w-full py-4 rounded-lg font-bold text-lg"
        style={{background:accent,color:"#fff"}}>I understand — Proceed →</button>
    </div></div>
  );

  if(step===1) return (
    <div className="min-h-screen pt-24 pb-16 px-4"><div className="max-w-2xl mx-auto">
      <StepBar current={1} total={6} color={accent}/>
      <h2 className="text-xl font-bold text-white mb-6">Personal Information</h2>
      <div className="glass-card p-6 space-y-4">
        <div><label className="block text-sm text-gray-400 mb-1">Full Name <span className="text-red-400">*</span></label>
          <input className="input-dark" placeholder="Your full name" value={name} onChange={e=>setName(e.target.value)}/></div>
        <div><label className="block text-sm text-gray-400 mb-1">Class <span className="text-red-400">*</span></label>
          <select className="input-dark" value={className} onChange={e=>setClassName(e.target.value)}>
            <option value="">Select</option>{CLASSES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
        <div><label className="block text-sm text-gray-400 mb-1">Institution <span className="text-red-400">*</span></label>
          <input className="input-dark" placeholder="School name" value={institution} onChange={e=>setInstitution(e.target.value)}/></div>
        {error&&<p className="text-red-400 text-sm">❌ {error}</p>}
        <button onClick={()=>{
          if(!name||!className||!institution) return setError("Please fill all fields.");
          setError("");setStep(2);
        }} className="w-full py-3 rounded-lg font-bold" style={{background:accent,color:"#fff"}}>Next: Segments →</button>
      </div>
    </div></div>
  );

  if(step===2) return (
    <div className="min-h-screen pt-24 pb-16 px-4"><div className="max-w-2xl mx-auto">
      <StepBar current={2} total={6} color={accent}/>
      <h2 className="text-xl font-bold text-white mb-2">Select Olympiad Segments</h2>
      <p className="text-gray-400 text-sm mb-6">100 BDT per segment. You may select multiple.</p>
      <div className="space-y-3 mb-6">
        {OLYMPIAD_SEGMENTS.map(seg=>(
          <button key={seg.id} onClick={()=>toggleSegment(seg.id)}
            className="w-full glass-card p-4 flex items-center gap-4 hover:border-purple-400/40 transition-all text-left"
            style={{cursor:"pointer",borderColor:segments.includes(seg.id)?"#a855f7":""}}>
            <div className="w-6 h-6 rounded border-2 flex items-center justify-center shrink-0"
              style={{borderColor:segments.includes(seg.id)?accent:"rgba(255,255,255,0.2)",background:segments.includes(seg.id)?accent:"transparent"}}>
              {segments.includes(seg.id)&&<span className="text-white text-xs font-bold">✓</span>}
            </div>
            <p className="text-white font-medium flex-1">{seg.label}</p>
            <span className="text-purple-400 font-bold text-sm shrink-0">100 BDT</span>
          </button>
        ))}
      </div>
      {segments.length>0&&<div className="rounded-lg p-4 mb-4 border border-purple-500/30" style={{background:"rgba(168,85,247,0.08)"}}>
        <p className="text-purple-400 font-bold">Selected: {segments.length} segment(s)</p>
        <p className="text-white text-lg font-bold mt-1">Total: {totalFee} BDT</p>
      </div>}
      {error&&<p className="text-red-400 text-sm mb-3">❌ {error}</p>}
      <button onClick={()=>{
        if(segments.length===0) return setError("Please select at least one segment.");
        setError("");setStep(3);
      }} className="w-full py-3 rounded-lg font-bold" style={{background:accent,color:"#fff",opacity:segments.length===0?0.5:1}}>
        Next: Payment →
      </button>
    </div></div>
  );

  if(step===3) return (
    <div className="min-h-screen pt-24 pb-16 px-4"><div className="max-w-2xl mx-auto">
      <StepBar current={3} total={6} color={accent}/>
      <h2 className="text-xl font-bold text-white mb-6">Payment Method</h2>
      {!payMethod&&(
        <div className="grid sm:grid-cols-2 gap-4">
          <button onClick={()=>setPayMethod("bkash")} className="glass-card p-6 text-left hover:border-pink-400/50 transition-all" style={{cursor:"pointer"}}>
            <div className="text-4xl mb-3">📱</div><h3 className="font-bold text-pink-400 mb-1">Bkash Payment</h3>
            <p className="text-gray-400 text-sm">Send {totalFee} BDT via Bkash.</p>
          </button>
          <button onClick={()=>setPayMethod("card")} className="glass-card p-6 text-left hover:border-purple-400/50 transition-all" style={{cursor:"pointer"}}>
            <div className="text-4xl mb-3">🎴</div><h3 className="font-bold text-purple-400 mb-1">Registration Card</h3>
            <p className="text-gray-400 text-sm">{segments.length>1?`You need ${segments.length} card codes.`:"Enter your card code."}</p>
          </button>
        </div>
      )}
      {payMethod==="bkash"&&(
        <div className="glass-card p-6 space-y-4">
          <button onClick={()=>setPayMethod(null)} className="text-gray-500 text-sm hover:text-white">← Change method</button>
          <div className="rounded-lg p-4 border border-pink-500/30" style={{background:"rgba(236,72,153,0.08)"}}>
            <p className="text-pink-400 font-bold mb-1">📱 Bkash</p>
            <p className="text-gray-300 text-sm">Send <span className="text-white font-bold">{totalFee} BDT</span> to:</p>
            <p className="text-pink-400 font-mono text-2xl font-bold my-2">01710176301</p>
          </div>
          <div><label className="block text-sm text-gray-400 mb-1">Sender Bkash Number <span className="text-red-400">*</span></label>
            <MobileInput value={bkashSender} onChange={setBkashSender} required/>
            {bkashSender&&!isValidMobile(bkashSender)&&<p className="text-red-400 text-xs mt-1">⚠️ 11 digits starting with 01</p>}</div>
          <div><label className="block text-sm text-gray-400 mb-1">TrxID <span className="text-red-400">*</span></label>
            <input className="input-dark" placeholder="e.g. 8AB12CD345" value={bkashTxn} onChange={e=>setBkashTxn(e.target.value)}/></div>
          {error&&<p className="text-red-400 text-sm">❌ {error}</p>}
          <button onClick={()=>{
            if(!isValidMobile(bkashSender)) return setError("Enter valid Bkash number.");
            if(!bkashTxn.trim()) return setError("Enter Transaction ID.");
            setError("");setStep(4);
          }} className="w-full py-3 rounded-lg font-bold" style={{background:accent,color:"#fff"}}>Next →</button>
        </div>
      )}
      {payMethod==="card"&&(
        <div className="glass-card p-6 space-y-4">
          <button onClick={()=>setPayMethod(null)} className="text-gray-500 text-sm hover:text-white">← Change method</button>
          <p className="text-gray-400 text-sm">Enter <span className="text-white font-bold">{segments.length}</span> unique card code(s) — one per segment.</p>
          {segments.map((segId,i)=>{
            const seg=OLYMPIAD_SEGMENTS.find(s=>s.id===segId);
            return (<div key={segId}>
              <label className="block text-sm text-gray-400 mb-1">Card {i+1} — <span className="text-purple-400">{seg?.label}</span> <span className="text-red-400">*</span></label>
              <input className="input-dark font-mono" placeholder="16-character code"
                value={cardCodes[i]||""}
                onChange={e=>{
                  const next=[...cardCodes];next[i]=e.target.value;setCardCodes(next);
                  const errs=[...cardErrors];
                  const val=e.target.value.trim().toUpperCase();
                  if(val){const dup=next.findIndex((c,idx)=>idx!==i&&c.trim().toUpperCase()===val);
                    errs[i]=dup!==-1?`Same as Card ${dup+1}. Use a different card.`:"";}
                  else errs[i]="";
                  setCardErrors(errs);
                }}/>
              {cardErrors[i]&&<p className="text-red-400 text-xs mt-1">❌ {cardErrors[i]}</p>}
            </div>);
          })}
          <button disabled={cardChecking||cardCodes.some(c=>!c.trim())||cardErrors.some(e=>e)}
            onClick={async()=>{
              const trimmed=cardCodes.map(c=>c.trim().toUpperCase());
              const dupErrs=Array(segments.length).fill("");let hasDup=false;
              trimmed.forEach((code,i)=>{const fi=trimmed.findIndex(c=>c===code);if(fi!==i){dupErrs[i]=`Same as Card ${fi+1}`;hasDup=true;}});
              if(hasDup){setCardErrors(dupErrs);return;}
              setCardChecking(true);
              const newErrs=Array(segments.length).fill("");let allOk=true;
              for(let i=0;i<segments.length;i++){
                const res=await validateCardCode(cardCodes[i],"olympiad");
                if(!res.valid){newErrs[i]=res.message||"Invalid or used code.";allOk=false;}
              }
              setCardErrors(newErrs);setCardChecking(false);
              if(allOk)setStep(4);
            }}
            className="w-full py-3 rounded-lg font-bold transition-all"
            style={{background:accent,color:"#fff",opacity:cardChecking||cardCodes.some(c=>!c.trim())?0.6:1}}>
            {cardChecking?"⏳ Verifying...":"Verify All Cards →"}
          </button>
        </div>
      )}
    </div></div>
  );

  if(step===4) return (
    <div className="min-h-screen pt-24 pb-16 px-4"><div className="max-w-2xl mx-auto">
      <StepBar current={4} total={6} color={accent}/>
      <h2 className="text-xl font-bold text-white mb-6">Contact Information</h2>
      <div className="glass-card p-6 space-y-4">
        <div><label className="block text-sm text-gray-400 mb-1">Mobile <span className="text-red-400">*</span></label>
          <MobileInput value={mobile} onChange={setMobile} required/>
          {mobile&&!isValidMobile(mobile)&&<p className="text-red-400 text-xs mt-1">⚠️ 11 digits starting with 01</p>}</div>
        <div><label className="block text-sm text-gray-400 mb-1">Email <span className="text-red-400">*</span></label>
          <input className="input-dark" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/>
          {email&&!isValidEmail(email)&&<p className="text-red-400 text-xs mt-1">⚠️ Valid email required</p>}</div>
        {error&&<p className="text-red-400 text-sm">❌ {error}</p>}
        <button onClick={()=>{
          if(!isValidMobile(mobile)) return setError("Valid mobile required.");
          if(!isValidEmail(email)) return setError("Valid email required.");
          setError("");setStep(5);
        }} className="w-full py-3 rounded-lg font-bold" style={{background:accent,color:"#fff"}}>Next: Review →</button>
      </div>
    </div></div>
  );

  if(step===5){
    const R=({label,value})=>value?(<div className="flex justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-white text-sm font-medium text-right max-w-[60%]">{value}</span>
    </div>):null;
    async function handleSubmit(){
      setSubmitting(true);setError("");
      try{
        const d=await post({action:"registerOlympiad",participant_name:name,student_class:className,institution,
          subjects:segments.join(","),contact_mobile:mobile,email,payment_method:payMethod,
          bkash_number:bkashSender,bkash_txn_id:bkashTxn,card_codes:cardCodes.join(",")});
        if(d.success){setRegId(d.reg_id);setStep(6);}else setError(d.message);
      }catch{setError("Network error.");}finally{setSubmitting(false);}
    }
    return (
      <div className="min-h-screen pt-24 pb-16 px-4"><div className="max-w-2xl mx-auto">
        <StepBar current={5} total={6} color={accent}/>
        <h2 className="text-xl font-bold text-white mb-6">Review Registration</h2>
        <div className="glass-card p-6 mb-4">
          <p className="text-purple-400 font-semibold text-sm mb-3">🔭 Science Olympiad</p>
          <R label="Name" value={name}/><R label="Class" value={className}/><R label="Institution" value={institution}/>
          <R label="Segments" value={segments.map(id=>OLYMPIAD_SEGMENTS.find(s=>s.id===id)?.label).join(", ")}/>
          <R label="Payment" value={payMethod==="bkash"?"Bkash":"Registration Card"}/>
          {payMethod==="bkash"&&<><R label="Bkash Sender" value={bkashSender}/><R label="TrxID" value={bkashTxn}/></>}
          <R label="Mobile" value={mobile}/><R label="Email" value={email}/>
          <R label="Total Fee" value={`${totalFee} BDT`}/>
        </div>
        <div className="flex items-start gap-3 mb-4 p-4 rounded-lg border border-white/10" style={{background:"rgba(255,255,255,0.03)"}}>
          <input type="checkbox" id="c2" className="mt-1 accent-purple-400" onChange={e=>setError(e.target.checked?"":"err")}/>
          <label htmlFor="c2" className="text-gray-300 text-sm" style={{cursor:"pointer"}}>I confirm all information is correct and I agree to the rules.</label>
        </div>
        {error&&error!=="err"&&<p className="text-red-400 text-sm mb-3">❌ {error}</p>}
        <button onClick={handleSubmit} disabled={submitting} className="w-full py-4 rounded-lg font-bold text-lg"
          style={{background:accent,color:"#fff",opacity:submitting?0.6:1}}>
          {submitting?"⏳ Submitting...":"✅ Confirm & Submit"}
        </button>
      </div></div>
    );
  }
  return <SuccessScreen regId={regId} payMethod={payMethod} accent={accent} color="#fff"/>;
}

// ══════════════════════════════════════════════════════════════
// SCIENCE PROJECT SHOWCASING REGISTRATION
// ══════════════════════════════════════════════════════════════
function ScienceProjectRegistration({ onBack }) {
  const {post}=useApi();
  const [step,setStep]=useState(0);
  const [payMethod,setPayMethod]=useState(null);
  const accent="#f59e0b";
  const [teamName,setTeamName]=useState(""); const [institution,setInstitution]=useState("");
  const [projectName,setProjectName]=useState("");
  const [m1name,setM1name]=useState(""); const [m1class,setM1class]=useState("");
  const [m2name,setM2name]=useState(""); const [m2class,setM2class]=useState("");
  const [m3name,setM3name]=useState(""); const [m3class,setM3class]=useState("");
  const [bkashSender,setBkashSender]=useState(""); const [bkashTxn,setBkashTxn]=useState("");
  const [cardCode,setCardCode]=useState(""); const [cardError,setCardError]=useState("");
  const [mobile,setMobile]=useState(""); const [email,setEmail]=useState("");
  const [submitting,setSubmitting]=useState(false);
  const [error,setError]=useState("");
  const [regId,setRegId]=useState("");

  if(step===0) return (
    <div className="min-h-screen pt-24 pb-16 px-4"><div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="text-gray-400 hover:text-white text-sm mb-6">← Back</button>
      <div className="text-center mb-8"><div className="text-5xl mb-3">🔬</div>
        <h1 className="text-2xl font-bold" style={{color:accent}}>Science Project Showcasing</h1></div>
      <div className="glass-card p-6 mb-6"><pre className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">{SCIENCE_PROJECT_RULES}</pre></div>
      <button onClick={()=>setStep(1)} className="w-full py-4 rounded-lg font-bold text-lg"
        style={{background:accent,color:"#000"}}>I understand — Proceed →</button>
    </div></div>
  );

  if(step===1) return (
    <div className="min-h-screen pt-24 pb-16 px-4"><div className="max-w-2xl mx-auto">
      <StepBar current={1} total={5} color={accent}/>
      <h2 className="text-xl font-bold text-white mb-6">Team & Project Information</h2>
      <div className="glass-card p-6 space-y-4">
        <div><label className="block text-sm text-gray-400 mb-1">Team Name <span className="text-red-400">*</span></label>
          <input className="input-dark" placeholder="Your team name" value={teamName} onChange={e=>setTeamName(e.target.value)}/></div>
        <div><label className="block text-sm text-gray-400 mb-1">Institution <span className="text-red-400">*</span></label>
          <input className="input-dark" placeholder="School name" value={institution} onChange={e=>setInstitution(e.target.value)}/></div>
        <div><label className="block text-sm text-gray-400 mb-1">Project Name <span className="text-red-400">*</span></label>
          <input className="input-dark" placeholder="Name of your science project" value={projectName} onChange={e=>setProjectName(e.target.value)}/></div>
        <div className="border-t border-white/10 pt-4">
          <p className="font-semibold text-sm mb-3" style={{color:accent}}>👤 Member 1 <span className="text-red-400 text-xs ml-1">*Required</span></p>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm text-gray-400 mb-1">Name <span className="text-red-400">*</span></label>
              <input className="input-dark" placeholder="Full name" value={m1name} onChange={e=>setM1name(e.target.value)}/></div>
            <div><label className="block text-sm text-gray-400 mb-1">Class <span className="text-red-400">*</span></label>
              <select className="input-dark" value={m1class} onChange={e=>setM1class(e.target.value)}>
                <option value="">Select</option>{CLASSES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
          </div>
        </div>
        {[{n:m2name,setN:setM2name,c:m2class,setC:setM2class,num:2},{n:m3name,setN:setM3name,c:m3class,setC:setM3class,num:3}].map(m=>(
          <div key={m.num} className="border-t border-white/10 pt-4">
            <p className="font-semibold text-sm mb-1" style={{color:accent}}>👤 Member {m.num} <span className="text-gray-500 text-xs ml-1">(Optional)</span></p>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div><label className="block text-sm text-gray-400 mb-1">Name</label>
                <input className="input-dark" placeholder="Optional" value={m.n} onChange={e=>m.setN(e.target.value)}/></div>
              <div><label className="block text-sm text-gray-400 mb-1">Class</label>
                <select className="input-dark" value={m.c} onChange={e=>m.setC(e.target.value)} disabled={!m.n}>
                  <option value="">Select</option>{CLASSES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
            </div>
          </div>
        ))}
        {error&&<p className="text-red-400 text-sm">❌ {error}</p>}
        <button onClick={()=>{
          if(!teamName||!institution||!projectName) return setError("Please fill team name, institution, and project name.");
          if(!m1name||!m1class) return setError("Please fill Member 1 details.");
          if(m2name&&!m2class) return setError("Please select class for Member 2.");
          if(m3name&&!m3class) return setError("Please select class for Member 3.");
          setError("");setStep(2);
        }} className="w-full py-3 rounded-lg font-bold" style={{background:accent,color:"#000"}}>
          Next: Payment →
        </button>
      </div>
    </div></div>
  );

  if(step===2) return (
    <div className="min-h-screen pt-24 pb-16 px-4"><div className="max-w-2xl mx-auto">
      <StepBar current={2} total={5} color={accent}/>
      <h2 className="text-xl font-bold text-white mb-6">Payment Method</h2>
      <PaymentStep fee={150} payMethod={payMethod} setPayMethod={setPayMethod}
        bkashSender={bkashSender} setBkashSender={setBkashSender}
        bkashTxn={bkashTxn} setBkashTxn={setBkashTxn}
        cardCode={cardCode} setCardCode={setCardCode}
        cardError={cardError} setCardError={setCardError}
        accent={accent} cardType="science_project" onNext={()=>setStep(3)} error={error} setError={setError}/>
    </div></div>
  );

  if(step===3) return (
    <div className="min-h-screen pt-24 pb-16 px-4"><div className="max-w-2xl mx-auto">
      <StepBar current={3} total={5} color={accent}/>
      <h2 className="text-xl font-bold text-white mb-6">Contact Information</h2>
      <div className="glass-card p-6 space-y-4">
        <div><label className="block text-sm text-gray-400 mb-1">Mobile <span className="text-red-400">*</span></label>
          <MobileInput value={mobile} onChange={setMobile} required/>
          {mobile&&!isValidMobile(mobile)&&<p className="text-red-400 text-xs mt-1">⚠️ 11 digits starting with 01</p>}</div>
        <div><label className="block text-sm text-gray-400 mb-1">Email <span className="text-red-400">*</span></label>
          <input className="input-dark" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/>
          {email&&!isValidEmail(email)&&<p className="text-red-400 text-xs mt-1">⚠️ Valid email required</p>}</div>
        {error&&<p className="text-red-400 text-sm">❌ {error}</p>}
        <button onClick={()=>{
          if(!isValidMobile(mobile)) return setError("Valid mobile required.");
          if(!isValidEmail(email)) return setError("Valid email required.");
          setError("");setStep(4);
        }} className="w-full py-3 rounded-lg font-bold" style={{background:accent,color:"#000"}}>Next: Review →</button>
      </div>
    </div></div>
  );

  if(step===4){
    const R=({label,value})=>value?(<div className="flex justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-white text-sm font-medium text-right max-w-[60%]">{value}</span>
    </div>):null;
    async function handleSubmit(){
      setSubmitting(true);setError("");
      try{
        const d=await post({action:"registerScienceProject",team_name:teamName,institution,
          project_name:projectName,
          member1_name:m1name,member1_class:m1class,
          member2_name:m2name||"",member2_class:m2class||"",
          member3_name:m3name||"",member3_class:m3class||"",
          contact_mobile:mobile,email,payment_method:payMethod,
          bkash_number:bkashSender,bkash_txn_id:bkashTxn,card_code:cardCode});
        if(d.success){setRegId(d.reg_id);setStep(5);}else setError(d.message);
      }catch{setError("Network error.");}finally{setSubmitting(false);}
    }
    return (
      <div className="min-h-screen pt-24 pb-16 px-4"><div className="max-w-2xl mx-auto">
        <StepBar current={4} total={5} color={accent}/>
        <h2 className="text-xl font-bold text-white mb-6">Review Registration</h2>
        <div className="glass-card p-6 mb-4">
          <p className="font-semibold text-sm mb-3" style={{color:accent}}>🔬 Science Project Showcasing</p>
          <R label="Team Name" value={teamName}/><R label="Institution" value={institution}/>
          <R label="Project Name" value={projectName}/>
          <R label="Member 1" value={`${m1name} (${m1class})`}/>
          {m2name&&<R label="Member 2" value={`${m2name}${m2class?` (${m2class})`:""}`}/>}
          {m3name&&<R label="Member 3" value={`${m3name}${m3class?` (${m3class})`:""}`}/>}
          <R label="Payment" value={payMethod==="bkash"?"Bkash":"Registration Card"}/>
          {payMethod==="bkash"&&<><R label="Bkash Sender" value={bkashSender}/><R label="TrxID" value={bkashTxn}/></>}
          <R label="Mobile" value={mobile}/><R label="Email" value={email}/>
          <R label="Fee" value="150 BDT"/>
        </div>
        <div className="flex items-start gap-3 mb-4 p-4 rounded-lg border border-white/10" style={{background:"rgba(255,255,255,0.03)"}}>
          <input type="checkbox" id="c3" className="mt-1" onChange={e=>setError(e.target.checked?"":"err")} style={{accentColor:accent}}/>
          <label htmlFor="c3" className="text-gray-300 text-sm" style={{cursor:"pointer"}}>I confirm all information is correct and I agree to the rules.</label>
        </div>
        {error&&error!=="err"&&<p className="text-red-400 text-sm mb-3">❌ {error}</p>}
        <button onClick={handleSubmit} disabled={submitting} className="w-full py-4 rounded-lg font-bold text-lg"
          style={{background:accent,color:"#000",opacity:submitting?0.6:1}}>
          {submitting?"⏳ Submitting...":"✅ Confirm & Submit"}
        </button>
      </div></div>
    );
  }
  return <SuccessScreen regId={regId} payMethod={payMethod} accent={accent} color="#000"/>;
}

// ══════════════════════════════════════════════════════════════
// ASTRO PHOTOGRAPHY REGISTRATION (FREE)
// ══════════════════════════════════════════════════════════════
function AstroPhotoRegistration({ onBack }) {
  const {post}=useApi();
  const [step,setStep]=useState(0);
  const accent="#06b6d4";
  const [name,setName]=useState(""); const [institution,setInstitution]=useState("");
  const [className,setClassName]=useState(""); const [mobile,setMobile]=useState("");
  const [email,setEmail]=useState(""); const [photoName,setPhotoName]=useState("");
  const [photoLink,setPhotoLink]=useState("");
  const [submitting,setSubmitting]=useState(false);
  const [error,setError]=useState("");
  const [regId,setRegId]=useState("");

  if(step===0) return (
    <div className="min-h-screen pt-24 pb-16 px-4"><div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="text-gray-400 hover:text-white text-sm mb-6">← Back</button>
      <div className="text-center mb-8"><div className="text-5xl mb-3">🌌</div>
        <h1 className="text-2xl font-bold" style={{color:accent}}>Astro Photography</h1>
        <p className="text-green-400 font-bold mt-2">✨ FREE Event — No Registration Fee</p></div>
      <div className="glass-card p-6 mb-6"><pre className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">{ASTRO_RULES}</pre></div>
      <button onClick={()=>setStep(1)} className="w-full py-4 rounded-lg font-bold text-lg"
        style={{background:accent,color:"#000"}}>I understand — Proceed →</button>
    </div></div>
  );

  if(step===1) return (
    <div className="min-h-screen pt-24 pb-16 px-4"><div className="max-w-2xl mx-auto">
      <StepBar current={1} total={3} color={accent}/>
      <h2 className="text-xl font-bold text-white mb-6">Personal Information</h2>
      <div className="glass-card p-6 space-y-4">
        <div><label className="block text-sm text-gray-400 mb-1">Full Name <span className="text-red-400">*</span></label>
          <input className="input-dark" placeholder="Your full name" value={name} onChange={e=>setName(e.target.value)}/></div>
        <div><label className="block text-sm text-gray-400 mb-1">Institution <span className="text-red-400">*</span></label>
          <input className="input-dark" placeholder="School name" value={institution} onChange={e=>setInstitution(e.target.value)}/></div>
        <div><label className="block text-sm text-gray-400 mb-1">Class <span className="text-red-400">*</span></label>
          <select className="input-dark" value={className} onChange={e=>setClassName(e.target.value)}>
            <option value="">Select</option>{CLASSES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
        <div><label className="block text-sm text-gray-400 mb-1">Mobile Number <span className="text-red-400">*</span></label>
          <MobileInput value={mobile} onChange={setMobile} required/>
          {mobile&&!isValidMobile(mobile)&&<p className="text-red-400 text-xs mt-1">⚠️ 11 digits starting with 01</p>}</div>
        <div><label className="block text-sm text-gray-400 mb-1">Email <span className="text-red-400">*</span></label>
          <input className="input-dark" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/>
          {email&&!isValidEmail(email)&&<p className="text-red-400 text-xs mt-1">⚠️ Valid email required</p>}</div>
        {error&&<p className="text-red-400 text-sm">❌ {error}</p>}
        <button onClick={()=>{
          if(!name||!institution||!className) return setError("Please fill all fields.");
          if(!isValidMobile(mobile)) return setError("Please enter a valid 11-digit mobile number.");
          if(!isValidEmail(email)) return setError("Please enter a valid email address.");
          setError("");setStep(2);
        }} className="w-full py-3 rounded-lg font-bold" style={{background:accent,color:"#000"}}>
          Next: Submit Photo →
        </button>
      </div>
    </div></div>
  );

  if(step===2) return (
    <div className="min-h-screen pt-24 pb-16 px-4"><div className="max-w-2xl mx-auto">
      <StepBar current={2} total={3} color={accent}/>
      <h2 className="text-xl font-bold text-white mb-6">Submit Your Photo</h2>

      {/* Instructions */}
      <div className="glass-card p-6 mb-5 border-l-4" style={{borderColor:accent}}>
        <h3 className="font-bold text-white mb-3" style={{color:accent}}>📸 How to submit your photo</h3>
        <ol className="space-y-3 text-sm text-gray-300">
          <li className="flex gap-3"><span className="font-bold shrink-0" style={{color:accent}}>1.</span>
            <span>Go to <a href="https://drive.google.com" target="_blank" rel="noreferrer" className="underline" style={{color:accent}}>Google Drive</a> and log in with your Google account.</span></li>
          <li className="flex gap-3"><span className="font-bold shrink-0" style={{color:accent}}>2.</span>
            <span>Click <strong className="text-white">+ New → File Upload</strong> and upload your astronomy photo.</span></li>
          <li className="flex gap-3"><span className="font-bold shrink-0" style={{color:accent}}>3.</span>
            <span>After upload, <strong className="text-white">right-click</strong> the file → click <strong className="text-white">"Share"</strong>.</span></li>
          <li className="flex gap-3"><span className="font-bold shrink-0" style={{color:accent}}>4.</span>
            <span>Under "General access", change to <strong className="text-white">"Anyone with the link"</strong>, then click <strong className="text-white">"Copy link"</strong>.</span></li>
          <li className="flex gap-3"><span className="font-bold shrink-0" style={{color:accent}}>5.</span>
            <span>Paste that link in the field below.</span></li>
        </ol>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div><label className="block text-sm text-gray-400 mb-1">Photo / Work Title <span className="text-red-400">*</span></label>
          <input className="input-dark" placeholder="e.g. Milky Way over Jamalpur" value={photoName} onChange={e=>setPhotoName(e.target.value)}/></div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Google Drive Public Link <span className="text-red-400">*</span></label>
          <input className="input-dark" placeholder="https://drive.google.com/file/d/..." value={photoLink} onChange={e=>setPhotoLink(e.target.value)}/>
          {photoLink&&!photoLink.includes("drive.google.com")&&<p className="text-yellow-400 text-xs mt-1">⚠️ Please paste a Google Drive link</p>}
        </div>
        <div className="rounded-lg p-3 border border-cyan-500/20 text-cyan-400 text-xs" style={{background:"rgba(6,182,212,0.08)"}}>
          ℹ️ Make sure the link is public ("Anyone with the link can view") before submitting.
        </div>
        {error&&<p className="text-red-400 text-sm">❌ {error}</p>}
        <button onClick={async()=>{
          if(!photoName.trim()) return setError("Please enter a photo/work title.");
          if(!photoLink.trim()) return setError("Please paste your Google Drive link.");
          if(!photoLink.includes("drive.google.com")) return setError("Please use a valid Google Drive link.");
          setSubmitting(true);setError("");
          try{
            const d=await post({action:"registerAstroPhoto",participant_name:name,institution,student_class:className,
              contact_mobile:mobile,email,photo_name:photoName,photo_link:photoLink});
            if(d.success){setRegId(d.reg_id);setStep(3);}else setError(d.message);
          }catch{setError("Network error.");}finally{setSubmitting(false);}
        }} disabled={submitting} className="w-full py-4 rounded-lg font-bold text-lg"
          style={{background:accent,color:"#000",opacity:submitting?0.6:1}}>
          {submitting?"⏳ Submitting...":"✅ Submit Registration"}
        </button>
      </div>
    </div></div>
  );

  // Success
  return (
    <div className="min-h-screen pt-24 flex items-center justify-center px-4">
      <div className="glass-card p-10 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🌌</div>
        <h2 className="text-2xl font-bold mb-2" style={{color:accent}}>Registration Successful!</h2>
        <p className="text-gray-400 mb-4">Your Astro Photography submission has been received!</p>
        <div className="rounded-lg p-4 mb-4 text-left" style={{background:"#1a2035"}}>
          <p className="text-xs text-gray-500 mb-1">Registration ID</p>
          <p className="font-mono font-bold" style={{color:accent}}>{regId}</p>
          <p className="text-xs text-gray-500 mt-2">Status</p>
          <p className="text-green-400 font-bold">✅ REGISTERED</p>
        </div>
        <button onClick={()=>window.location.href="/status"}
          className="w-full py-3 rounded-lg font-bold" style={{background:accent,color:"#000"}}>
          Check Status →
        </button>
      </div>
    </div>
  );
}