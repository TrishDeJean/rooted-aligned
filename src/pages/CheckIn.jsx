import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";

const MOODS = ["Calm", "Tired", "Overwhelmed", "Good", "Scattered"];

export default function CheckIn() {
  const [mood, setMood] = useState(null);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.CheckInLog.create(data),
    onSuccess: () => setSaved(true),
  });

  const handleMood = (m) => {
    const next = mood === m ? null : m;
    setMood(next);
    setSaved(false);
    if (next) {
      saveMutation.mutate({ mood: next, note, checked_at: new Date().toISOString() });
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-5 pt-10 pb-16 space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Check in with yourself</h2>
        <p className="text-sm text-muted-foreground/70 italic">How are you feeling right now?</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {MOODS.map(m => (
          <button
            key={m}
            onClick={() => handleMood(m)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
              mood === m
                ? "bg-[#A8B5A2] text-[#2d3a2d] border-[#A8B5A2] shadow-sm"
                : "bg-card border-border/40 text-foreground hover:border-primary/30"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-card border border-border/40 overflow-hidden">
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Want to write anything?"
          rows={5}
          className="w-full p-4 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none"
        />
      </div>

      <div className="mt-auto pt-4 flex flex-col items-center gap-4">
        <p className="text-xs text-muted-foreground/50 italic text-center">
          Whatever you're feeling is okay.
        </p>
        <button
          onClick={() => navigate("/Account")}
          className="text-sm text-muted-foreground/60 hover:text-foreground transition-colors underline-offset-2 hover:underline"
        >
          I'm ready to go back
        </button>
      </div>
    </div>
  );
}