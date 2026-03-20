import { useState } from "react";

const MOODS = ["Calm", "Tired", "Overwhelmed", "Good", "Scattered"];

export default function CheckIn() {
  const [mood, setMood] = useState(null);
  const [note, setNote] = useState("");

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
            onClick={() => setMood(mood === m ? null : m)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-all ${
              mood === m
                ? "bg-primary text-primary-foreground border-primary"
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

      <p className="text-xs text-muted-foreground/50 italic text-center mt-auto pt-8">
        Whatever you're feeling is okay.
      </p>
    </div>
  );
}