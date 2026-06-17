import { useState, useEffect } from "react";

export default function Countdown({ targetDate }) {
  const [time, setTime] = useState(getTime());

  function getTime() {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return { days:0, hours:0, minutes:0, seconds:0 };
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000)  / 60000),
      seconds: Math.floor((diff % 60000)    / 1000),
    };
  }

  useEffect(() => {
    const t = setInterval(() => setTime(getTime()), 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  const Box = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <div className="rounded-xl px-4 py-3 md:px-6 md:py-4 min-w-[70px] md:min-w-[90px] text-center"
        style={{ background:"rgba(17,24,39,0.8)", border:"1px solid rgba(0,245,255,0.3)",
          boxShadow:"0 0 20px rgba(0,245,255,0.15)" }}>
        <span className="text-3xl md:text-5xl font-bold text-cyan-400"
          style={{ textShadow:"0 0 20px rgba(0,245,255,0.8)" }}>
          {String(value).padStart(2,"0")}
        </span>
      </div>
      <span className="text-gray-400 text-xs mt-2 uppercase tracking-widest">{label}</span>
    </div>
  );

  return (
    <div className="flex gap-3 md:gap-6 justify-center items-end">
      <Box value={time.days}    label="Days"    />
      <span className="text-cyan-400 text-3xl font-bold mb-8">:</span>
      <Box value={time.hours}   label="Hours"   />
      <span className="text-cyan-400 text-3xl font-bold mb-8">:</span>
      <Box value={time.minutes} label="Minutes" />
      <span className="text-cyan-400 text-3xl font-bold mb-8">:</span>
      <Box value={time.seconds} label="Seconds" />
    </div>
  );
}