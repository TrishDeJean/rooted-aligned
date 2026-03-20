import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ChevronRight, RotateCcw } from "lucide-react";
import { format, addMinutes, differenceInMinutes } from "date-fns";

const STEPS = [
  { key: "dough_started",  label: "Dough Started",  emoji: "🌿", description: "Autolyse or mix your dough",          next_in: 30 },
  { key: "stretch_fold_1", label: "First Fold",      emoji: "🤲", description: "Gentle stretch & fold",              next_in: 30 },
  { key: "stretch_fold_2", label: "Second Fold",     emoji: "🤲", description: "30 min after first fold",            next_in: 30 },
  { key: "stretch_fold_3", label: "Third Fold",      emoji: "🤲", description: "30 min after second fold",           next_in: 30 },
  { key: "stretch_fold_4", label: "Final Fold",      emoji: "🤲", description: "Last fold — bulk ferment begins",    next_in: 30 },
  { key: "bulk_ferment",   label: "Bulk Ferment",    emoji: "⏳", description: "Until doubled & bubbly (~4 hrs)",   next_in: 240 },
  { key: "shape",          label: "Shape",           emoji: "🫳", description: "Pre-shape, bench rest, final shape", next_in: 45 },
  { key: "bake_time",      label: "Bake",            emoji: "🔥", description: "Into the oven — you did it",        next_in: 45 },
];

const STORAGE_KEY = `bakeflow-${format(new Date(), "yyyy-MM-dd")}`;

function loadTimestamps() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}

export default function BakeFlow() {
  const [timestamps, setTimestamps] = useState(loadTimestamps);
  const [now, setNow] = useState(new Date());
  const queryClient = useQueryClient();

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const logMutation = useMutation({
    mutationFn: (step) => base44.entities.NourishLog.create({
      log_type: "bake_step",
      bake_step: step,
      notes: `${STEPS.find(s => s.key === step)?.label} at ${format(new Date(), "h:mm a")}`,
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["nourishLogs"] }),
  });

  const logStep = (key) => {
    if (timestamps[key]) return;
    const updated = { ...timestamps, [key]: new Date().toISOString() };
    setTimestamps(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    logMutation.mutate(key);
  };

  const undoStep = (key) => {
    const updated = { ...timestamps };
    delete updated[key];
    setTimestamps(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const reset = () => {
    setTimestamps({});
    localStorage.removeItem(STORAGE_KEY);
  };

  const getCountdown = (stepIndex) => {
    if (stepIndex === 0) return null;
    const prev = STEPS[stepIndex - 1];
    const prevTime = timestamps[prev.key];
    if (!prevTime) return null;
    const dueAt = addMinutes(new Date(prevTime), prev.next_in);
    const diff = differenceInMinutes(dueAt, now);
    if (diff <= 0) return "Ready now ✨";
    if (diff < 60) return `in ${diff} min`;
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    return `in ${hrs}h${mins > 0 ? ` ${mins}m` : ""}`;
  };

  const nextStepIndex = STEPS.findIndex(s => !timestamps[s.key]);
  const hasStarted = Object.keys(timestamps).length > 0;
  const allDone = nextStepIndex === -1;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground/70 italic">
        {["Slow and steady.", "Trust the process.", "Good bread takes time."][new Date().getDay() % 3]}
      </p>

      {/* Next step banner */}
      {hasStarted && !allDone && nextStepIndex > 0 && (
        <Card className="p-3 bg-primary/5 border-primary/20 flex items-center gap-3">
          <ChevronRight className="h-4 w-4 text-primary shrink-0" />
          <div>
            <p className="text-[11px] text-muted-foreground mb-0.5">Next step</p>
            <p className="text-sm font-medium text-foreground">
              {STEPS[nextStepIndex].emoji} {STEPS[nextStepIndex].label}
              {(() => {
                const c = getCountdown(nextStepIndex);
                if (!c) return null;
                return (
                  <span className={`ml-2 text-xs font-normal ${c === "Ready now ✨" ? "text-primary" : "text-muted-foreground"}`}>
                    {c}
                  </span>
                );
              })()}
            </p>
          </div>
        </Card>
      )}

      {allDone && (
        <Card className="p-3 bg-primary/5 border-primary/20 text-center">
          <p className="text-sm font-medium text-primary">🎉 Bake complete — beautiful work.</p>
        </Card>
      )}

      {/* Steps */}
      {STEPS.map(({ key, label, emoji, description, next_in }, idx) => {
        const ts = timestamps[key];
        const done = !!ts;
        const isNext = idx === nextStepIndex;
        const countdown = getCountdown(idx);

        return (
          <Card
            key={key}
            className={`p-4 transition-all ${
              done ? "bg-primary/5 border-primary/20 opacity-75"
              : isNext ? "border-primary/30 shadow-sm"
              : "opacity-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                className={`h-6 w-6 rounded-full shrink-0 mt-0.5 flex items-center justify-center border-2 transition-all ${
                  done ? "bg-primary border-primary"
                  : isNext ? "border-primary/60"
                  : "border-muted-foreground/20"
                }`}
                onClick={() => done ? undoStep(key) : logStep(key)}
                title={done ? "Tap to undo" : "Tap to log this step"}
              >
                {done && <div className="h-2.5 w-2.5 rounded-full bg-white" />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`font-medium text-sm ${done ? "line-through text-muted-foreground" : isNext ? "text-foreground" : "text-muted-foreground"}`}>
                    <span className="opacity-70">{emoji}</span> {label}
                  </p>
                  {ts && (
                    <span className="text-xs text-muted-foreground flex items-center gap-0.5 shrink-0">
                      <Clock className="h-2.5 w-2.5" />
                      {format(new Date(ts), "h:mm a")}
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground/70 mt-0.5">{description}</p>

                {!done && isNext && countdown && (
                  <p className={`text-xs mt-1 font-medium ${countdown === "Ready now ✨" ? "text-primary" : "text-muted-foreground"}`}>
                    {countdown}
                  </p>
                )}
                {done && idx < STEPS.length - 1 && (
                  <p className="text-xs text-muted-foreground/40 mt-0.5">
                    {STEPS[idx + 1].label} {next_in < 60 ? `~${next_in} min` : `~${next_in / 60}h`} later
                  </p>
                )}
              </div>
            </div>
          </Card>
        );
      })}

      {hasStarted && (
        <Button variant="ghost" size="sm" onClick={reset} className="w-full text-muted-foreground">
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Start fresh
        </Button>
      )}
    </div>
  );
}