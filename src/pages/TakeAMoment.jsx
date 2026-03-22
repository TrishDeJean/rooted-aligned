import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BreathingExperience from "@/components/BreathingExperience";

const OPTIONS = [
  { key: "breath", title: "3 deep breaths", sub: "Inhale slowly, exhale gently" },
  { key: "look", title: "Look around", sub: "Name 3 things you can see" },
  { key: "sit", title: "Just sit", sub: "No doing. Just be." },
];

export default function TakeAMoment() {
  const [selected, setSelected] = useState(null);
  const [showBreathing, setShowBreathing] = useState(false);
  const navigate = useNavigate();

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
            className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 ${
              selected === key
                ? "bg-[#A8B5A2] border-[#A8B5A2]"
                : "bg-card border-border/40 hover:border-primary/20"
            }`}
          >
            <p className={`font-semibold ${selected === key ? "text-[#2d3a2d]" : "text-foreground"}`}>{title}</p>
            <p className={`text-sm mt-0.5 ${selected === key ? "text-[#3a4a3a]/80" : "text-muted-foreground"}`}>{sub}</p>
          </button>
        ))}
      </div>

      <div className="mt-auto pt-4 flex flex-col items-center gap-4">
        <p className="text-xs text-muted-foreground/50 italic text-center">
          You don't need to do everything. One moment is enough.
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