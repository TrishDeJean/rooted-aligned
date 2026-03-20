import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ITEMS = [
  "Make your bed",
  "Clear one surface",
  "Quick tidy (5–10 min)",
  "Refresh your space",
];

export default function ResetYourSpace() {
  const [checked, setChecked] = useState([]);
  const navigate = useNavigate();

  const toggle = (item) =>
    setChecked(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);

  return (
    <div className="min-h-screen flex flex-col px-5 pt-10 pb-16 space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Reset your space</h2>
        <p className="text-sm text-muted-foreground/70 italic">Just a small reset is enough.</p>
      </div>

      <div className="space-y-3">
        {ITEMS.map(item => {
          const done = checked.includes(item);
          return (
            <button
              key={item}
              onClick={() => toggle(item)}
              className={`w-full text-left p-5 rounded-2xl border flex items-center gap-4 transition-all duration-300 ${
                done ? "bg-[#A8B5A2]/20 border-[#A8B5A2]/40 opacity-40" : "bg-card border-border/40 hover:border-primary/20"
              }`}
            >
              <div className={`h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-300 ${
                done ? "bg-[#A8B5A2] border-[#A8B5A2]" : "border-muted-foreground/30"
              }`}>
                {done && (
                  <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <p className={`text-sm font-medium transition-all duration-300 ${done ? "line-through text-muted-foreground/50" : "text-foreground"}`}>
                {item}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-4 flex flex-col items-center gap-4">
        <p className="text-xs text-muted-foreground/50 italic text-center">
          You don't have to do it all.
        </p>
        <button
          onClick={() => navigate("/Account")}
          className="text-sm text-muted-foreground/60 hover:text-foreground transition-colors underline-offset-2 hover:underline"
        >
          Back to today
        </button>
      </div>
    </div>
  );
}