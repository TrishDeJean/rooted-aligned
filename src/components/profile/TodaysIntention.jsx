import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "todays_intention";

export default function TodaysIntention() {
  const [value, setValue] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const today = new Date().toISOString().slice(0, 10);
      return stored.date === today ? stored.text : "";
    } catch { return ""; }
  });
  const timer = useRef(null);

  const handleChange = (text) => {
    setValue(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: new Date().toISOString().slice(0, 10), text }));
    }, 600);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div className="space-y-1 pt-1">
      <p className="text-xs text-muted-foreground/50 italic">Today's intention</p>
      <input
        type="text"
        value={value}
        onChange={e => handleChange(e.target.value)}
        placeholder="One small, gentle thing…"
        className="w-full text-sm bg-transparent border-0 border-b border-border/40 pb-1 outline-none placeholder:text-muted-foreground/30 text-foreground focus:border-primary/40 transition-colors"
      />
    </div>
  );
}