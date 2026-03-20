import { useState } from "react";

const ITEMS = [
  "Make your bed",
  "Clear one surface",
  "Quick tidy (5–10 min)",
  "Refresh your space",
];

export default function ResetYourSpace() {
  const [checked, setChecked] = useState([]);

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
              className={`w-full text-left p-5 rounded-2xl border flex items-center gap-4 transition-all ${
                done ? "bg-primary/10 border-primary/30 opacity-70" : "bg-card border-border/40 hover:border-primary/20"
              }`}
            >
              <div className={`h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                done ? "bg-primary border-primary" : "border-muted-foreground/30"
              }`}>
                {done && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
              </div>
              <p className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {item}
              </p>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground/50 italic text-center mt-auto pt-8">
        You don't have to do it all.
      </p>
    </div>
  );
}