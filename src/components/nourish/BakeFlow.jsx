import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle } from "lucide-react";

const STEPS = [
  { key: "dough_started", label: "Dough Started", emoji: "🌿", description: "Autolyse or mix your dough" },
  { key: "stretch_folds", label: "Stretch & Folds", emoji: "🤲", description: "4 sets, 30 min apart" },
  { key: "bulk_ferment", label: "Bulk Ferment", emoji: "⏳", description: "Until doubled & bubbly" },
  { key: "bake_time", label: "Bake Time", emoji: "🔥", description: "Into the oven it goes" },
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
      <p className="text-sm text-muted-foreground/70 italic">Track your bake from start to finish</p>
      {STEPS.map(({ key, label, emoji, description }) => {
        const done = completed.includes(key);
        return (
          <Card
            key={key}
            className={`p-4 flex items-center gap-3 cursor-pointer transition-all active:scale-[0.98] ${
              done ? "bg-primary/5 border-primary/30" : "hover:border-border"
            }`}
            onClick={() => toggle(key)}
          >
            {done
              ? <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              : <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
            }
            <div className="flex-1">
              <p className={`font-medium text-sm ${done ? "line-through text-muted-foreground" : ""}`}>
                {emoji} {label}
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