import { useState } from "react";

const OPTIONS = [
  { key: "breath", title: "3 deep breaths", sub: "Inhale slowly, exhale gently" },
  { key: "look", title: "Look around", sub: "Name 3 things you can see" },
  { key: "sit", title: "Just sit", sub: "No doing. Just be." },
];

export default function TakeAMoment() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen flex flex-col px-5 pt-10 pb-16 space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Take a moment</h2>
        <p className="text-sm text-muted-foreground/70 italic">Breathe. You're allowed to pause.</p>
      </div>

      <div className="space-y-3">
        {OPTIONS.map(({ key, title, sub }) => (
          <button
            key={key}
            onClick={() => setSelected(selected === key ? null : key)}
            className={`w-full text-left p-5 rounded-2xl border transition-all ${
              selected === key
                ? "bg-primary/10 border-primary/30"
                : "bg-card border-border/40 hover:border-primary/20"
            }`}
          >
            <p className="font-semibold text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{sub}</p>
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground/50 italic text-center mt-auto pt-8">
        You don't need to do everything. One moment is enough.
      </p>
    </div>
  );
}