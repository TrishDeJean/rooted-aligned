import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle } from "lucide-react";

const STEPS = [
  { key: "dough_started", label: "Dough Started", emoji: "🌿", description: "Autolyse or mix your dough" },
  { key: "stretch_fold_1", label: "First Fold", emoji: "🤲", description: "Gentle folds, 30 min after mix" },
  { key: "stretch_fold_2", label: "Second Fold", emoji: "🤲", description: "30 min later" },
  { key: "stretch_fold_3", label: "Third Fold", emoji: "🤲", description: "30 min later" },
  { key: "stretch_fold_4", label: "Final Fold", emoji: "🤲", description: "30 min later" },
  { key: "bulk_ferment", label: "Bulk Ferment", emoji: "⏳", description: "Until doubled & bubbly" },
  { key: "shape", label: "Shape", emoji: "🫳", description: "Pre-shape, bench rest, final shape" },
  { key: "bake_time", label: "Bake", emoji: "🔥", description: "Into the oven it goes" },
];

export default function BakeFlow() {
  const [completed, setCompleted] = useState([]);
  const queryClient = useQueryClient();

  const logMutation = useMutation({
    mutationFn: (step) => base44.entities.NourishLog.create({
      log_type: "bake_step",
      bake_step: step,
      notes: `Completed: ${STEPS.find(s => s.key === step)?.label}`,
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["nourishLogs"] }),
  });

  const toggle = (key) => {
    if (completed.includes(key)) {
      setCompleted(c => c.filter(k => k !== key));
    } else {
      setCompleted(c => [...c, key]);
      logMutation.mutate(key);
    }
  };

  const reset = () => setCompleted([]);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground/70 italic">{["Slow and steady.", "Trust the process.", "Good bread takes time."][new Date().getDay() % 3]}</p>
      {STEPS.map(({ key, label, emoji, description }) => {
        const done = completed.includes(key);
        return (
          <Card
            key={key}
            className={`p-4 flex items-center gap-3 cursor-pointer transition-all active:scale-[0.98] ${
              done ? "bg-primary/10 border-primary/30" : "hover:border-border"
            }`}
            onClick={() => toggle(key)}
          >
            <div className={`h-5 w-5 rounded-full shrink-0 flex items-center justify-center border-2 transition-all ${
              done ? "bg-primary border-primary" : "border-muted-foreground/30"
            }`}>
              {done && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
            </div>
            <div className="flex-1">
              <p className={`font-medium text-sm ${done ? "line-through text-muted-foreground" : ""}`}>
                <span className="opacity-60">{emoji}</span> {label}
              </p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </Card>
        );
      })}
      {completed.length > 0 && (
        <Button variant="ghost" size="sm" onClick={reset} className="w-full text-muted-foreground">
          Reset Flow
        </Button>
      )}
    </div>
  );
}