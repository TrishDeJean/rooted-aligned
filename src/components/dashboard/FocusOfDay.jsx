import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const FOCUS_LABELS = [
  "Keep it simple", "Bake day", "Care day", "Home reset",
  "Creative day", "Rest & restore", "Catch up", "Slow morning",
];

const today = format(new Date(), "yyyy-MM-dd");

export default function FocusOfDay() {
  const queryClient = useQueryClient();
  const [editingTask, setEditingTask] = useState(null);
  const [taskDraft, setTaskDraft] = useState("");

  const { data: focus } = useQuery({
    queryKey: ["dailyFocus", today],
    queryFn: async () => {
      const results = await base44.entities.DailyFocus.filter({ date: today });
      return results?.[0] ?? null;
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data) =>
      focus?.id
        ? base44.entities.DailyFocus.update(focus.id, data)
        : base44.entities.DailyFocus.create({ date: today, ...data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dailyFocus", today] }),
  });

  const setFocusLabel = (label) =>
    saveMutation.mutate({ focus_label: label === focus?.focus_label ? null : label });

  const saveTask = (field) => {
    const trimmed = taskDraft.trim();
    if (trimmed !== (focus?.[field] || "")) {
      saveMutation.mutate({ [field]: trimmed || null });
    }
    setEditingTask(null);
  };

  const tasks = [
    { field: "task_1", value: focus?.task_1 },
    { field: "task_2", value: focus?.task_2 },
    { field: "task_3", value: focus?.task_3 },
  ];

  return (
    <div className="space-y-3">
      {/* Focus label chips */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground tracking-wide mb-2">Focus of the day</p>
        <div className="flex flex-wrap gap-2">
          {FOCUS_LABELS.map(label => (
            <button
              key={label}
              onClick={() => setFocusLabel(label)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                focus?.focus_label === label
                  ? "bg-primary/20 border-primary/40 text-primary font-medium"
                  : "bg-card border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 tasks */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground tracking-wide mb-2">Top 3 today</p>
        <Card className="divide-y divide-border/40">
          {tasks.map(({ field, value }, idx) => (
            <div key={field} className="flex items-center gap-3 px-4 py-3">
              <div className={`h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center text-[10px] font-bold transition-all ${
                value
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-muted-foreground/20 text-muted-foreground/30"
              }`}>
                {idx + 1}
              </div>

              {editingTask === field ? (
                <Input
                  value={taskDraft}
                  onChange={e => setTaskDraft(e.target.value)}
                  onBlur={() => saveTask(field)}
                  onKeyDown={e => {
                    if (e.key === "Enter") saveTask(field);
                    if (e.key === "Escape") setEditingTask(null);
                  }}
                  placeholder={`Priority ${idx + 1}...`}
                  className="h-7 text-sm border-0 bg-transparent p-0 focus-visible:ring-0 placeholder:text-muted-foreground/40"
                  autoFocus
                />
              ) : (
                <button
                  className="flex-1 text-left text-sm"
                  onClick={() => { setEditingTask(field); setTaskDraft(value || ""); }}
                >
                  {value
                    ? <span className="text-foreground">{value}</span>
                    : <span className="text-muted-foreground/35 italic">Tap to add...</span>
                  }
                </button>
              )}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}