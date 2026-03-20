import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfWeek, addDays } from "date-fns";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const DAYS = [
  { label: "Sunday",    key: "sun" },
  { label: "Monday",    key: "mon" },
  { label: "Tuesday",   key: "tue" },
  { label: "Wednesday", key: "wed" },
  { label: "Thursday",  key: "thu" },
  { label: "Friday",    key: "fri" },
  { label: "Saturday",  key: "sat" },
];

const MEALS = [
  { key: "breakfast", label: "Breakfast", emoji: "🌤" },
  { key: "lunch",     label: "Lunch",     emoji: "🌿" },
  { key: "dinner",    label: "Dinner",    emoji: "🌙" },
  { key: "snacks",    label: "Snacks",    emoji: "🍎" },
];

function getWeekStart(offset = 0) {
  const base = startOfWeek(new Date(), { weekStartsOn: 0 });
  return addDays(base, offset * 7);
}

function useDebounce(fn, delay = 900) {
  const timer = useRef(null);
  return (...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  };
}

function MealField({ label, emoji, value, onChange }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold text-muted-foreground tracking-wide uppercase flex items-center gap-1">
        <span>{emoji}</span> {label}
      </p>
      <Textarea
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        placeholder={`What's for ${label.toLowerCase()}?`}
        rows={2}
        className="resize-none text-sm bg-background/60 border-border/50 rounded-xl placeholder:text-muted-foreground/30 focus:border-primary/40 focus:ring-primary/10"
      />
    </div>
  );
}

export default function KitchenPlan() {
  const [weekOffset, setWeekOffset] = useState(0);
  const weekStart = getWeekStart(weekOffset);
  const weekStartStr = format(weekStart, "yyyy-MM-dd");
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const queryClient = useQueryClient();

  const { data: plan, isLoading } = useQuery({
    queryKey: ["mealPlan", weekStartStr],
    queryFn: async () => {
      const results = await base44.entities.MealPlan.filter({ week_start: weekStartStr });
      return results[0] ?? null;
    },
  });

  const [local, setLocal] = useState({});

  useEffect(() => {
    if (plan) {
      setLocal(plan);
    } else {
      setLocal({ week_start: weekStartStr });
    }
  }, [plan, weekStartStr]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (data.id) {
        return base44.entities.MealPlan.update(data.id, data);
      } else {
        return base44.entities.MealPlan.create(data);
      }
    },
    onSuccess: (saved) => {
      setLocal(saved);
      queryClient.invalidateQueries({ queryKey: ["mealPlan", weekStartStr] });
      queryClient.invalidateQueries({ queryKey: ["mealPlanToday"] });
    },
  });

  const debouncedSave = useDebounce((data) => saveMutation.mutate(data), 1000);

  const handleChange = (field, value) => {
    const updated = { ...local, [field]: value };
    setLocal(updated);
    debouncedSave(updated);
  };

  const weekLabel = weekOffset === 0
    ? "This week"
    : weekOffset === 1
    ? "Next week"
    : weekOffset === -1
    ? "Last week"
    : format(weekStart, "MMM d");

  return (
    <div className="space-y-8 pb-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Kitchen Plan 🍞</h2>
          <p className="text-sm text-muted-foreground italic">A gentle plan for the week</p>
        </div>
        <Link
          to="/KitchenList"
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors border border-border/60 rounded-xl px-3 py-1.5"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          Kitchen List
        </Link>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWeekOffset(w => w - 1)}
          className="h-9 w-9 rounded-xl border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium text-foreground/70">{weekLabel}</span>
        <button
          onClick={() => setWeekOffset(w => w + 1)}
          className="h-9 w-9 rounded-xl border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-all"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Intentions */}
      <Card className="p-4 space-y-2 bg-accent/5 border-accent/20">
        <p className="text-sm font-semibold text-foreground">Keep it simple this week</p>
        <p className="text-xs text-muted-foreground/60">e.g. easy meals, use what we have, comfort foods</p>
        <Textarea
          value={local.intentions || ""}
          onChange={e => handleChange("intentions", e.target.value)}
          placeholder="A thought or two about this week's meals…"
          rows={2}
          className="resize-none text-sm bg-background/60 border-border/40 rounded-xl placeholder:text-muted-foreground/30 focus:border-primary/40"
        />
      </Card>

      {/* Days */}
      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <Card key={i} className="h-48 animate-pulse bg-muted/40" />)}
        </div>
      ) : (
        <div className="space-y-5">
          {DAYS.map(({ label, key }, idx) => {
            const date = addDays(weekStart, idx);
            const dateStr = format(date, "yyyy-MM-dd");
            const isToday = dateStr === todayStr;
            return (
              <Card
                key={key}
                className={`p-5 space-y-4 transition-all ${
                  isToday
                    ? "border-primary/30 bg-primary/5 shadow-sm"
                    : "border-border/50 bg-card"
                }`}
              >
                <div className="flex items-center gap-2">
                  <h3 className={`font-bold text-base ${isToday ? "text-primary" : "text-foreground"}`}>
                    {label}
                  </h3>
                  <span className="text-xs text-muted-foreground/50">{format(date, "MMM d")}</span>
                  {isToday && (
                    <span className="ml-auto text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Today
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {MEALS.map(({ key: mKey, label: mLabel, emoji }) => (
                    <MealField
                      key={mKey}
                      label={mLabel}
                      emoji={emoji}
                      value={local[`${key}_${mKey}`]}
                      onChange={val => handleChange(`${key}_${mKey}`, val)}
                    />
                  ))}
                </div>
                <div className="space-y-1 pt-1 border-t border-border/30">
                  <p className="text-[11px] font-semibold text-muted-foreground tracking-wide uppercase flex items-center gap-1">
                    🛒 Need this week
                  </p>
                  <Textarea
                    value={local[`${key}_groceries`] || ""}
                    onChange={e => handleChange(`${key}_groceries`, e.target.value)}
                    placeholder={"One item per line…"}
                    rows={2}
                    className="resize-none text-sm bg-background/60 border-border/50 rounded-xl placeholder:text-muted-foreground/30 focus:border-primary/40 focus:ring-primary/10"
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground/40 italic pt-2">
        This is here to support you, not to pressure you.
      </p>
    </div>
  );
}