import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfWeek, addDays } from "date-fns";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, ShoppingBag, Plus, X } from "lucide-react";
import { Link } from "react-router-dom";

const DAYS = [
  { label: "Sunday", key: "sun" },
  { label: "Monday", key: "mon" },
  { label: "Tuesday", key: "tue" },
  { label: "Wednesday", key: "wed" },
  { label: "Thursday", key: "thu" },
  { label: "Friday", key: "fri" },
  { label: "Saturday", key: "sat" },
];

const MEALS = [
  { key: "breakfast", label: "Breakfast", emoji: "🌤" },
  { key: "lunch",     label: "Lunch",     emoji: "🌿" },
  { key: "dinner",    label: "Dinner",    emoji: "🌙" },
  { key: "snacks",    label: "Snacks",    emoji: "🍎" },
];

function getWeekStart(offset = 0) {
  return addDays(startOfWeek(new Date(), { weekStartsOn: 0 }), offset * 7);
}

function useDebounce(fn, delay = 900) {
  const timer = useRef(null);
  return (...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  };
}

function MealField({ label, emoji, value, onChange, onAddIngredients, isSnacks }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const handleSave = () => {
    const lines = draft
      .split(/[\n,]+/)
      .map(l => l.trim())
      .filter(Boolean);
    if (lines.length) onAddIngredients(lines);
    setDraft("");
    setOpen(false);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-muted-foreground tracking-wide uppercase flex items-center gap-1">
          <span>{emoji}</span> {label}
        </p>
        <button
          onClick={() => setOpen(v => !v)}
          className="text-[10px] text-muted-foreground/40 hover:text-primary transition-colors flex items-center gap-0.5"
        >
          <Plus className="h-2.5 w-2.5" /> add to list
        </button>
      </div>
      <Textarea
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        placeholder={isSnacks ? "Little things to have on hand…" : `What's for ${label.toLowerCase()}?`}
        rows={2}
        className="resize-none text-sm bg-background/60 border-border/50 rounded-xl placeholder:text-muted-foreground/30 focus:border-primary/40 focus:ring-primary/10"
      />
      {open && (
        <div className="rounded-xl border border-border/50 bg-background/80 p-3 space-y-2 shadow-sm">
          <p className="text-[10px] text-muted-foreground/50 italic">One item per line, or separate by commas</p>
          <Textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder={"milk\neggs\ncheese…"}
            rows={4}
            autoFocus
            className="resize-none text-sm bg-background/60 border-border/40 rounded-xl placeholder:text-muted-foreground/30 focus:border-primary/40"
          />
          <div className="flex items-center justify-between">
            <button onClick={() => { setDraft(""); setOpen(false); }} className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors">cancel</button>
            <button
              onClick={handleSave}
              className="text-xs font-medium text-primary-foreground bg-primary/80 hover:bg-primary rounded-lg px-4 py-1.5 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
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
    if (plan) setLocal(plan);
    else setLocal({ week_start: weekStartStr });
  }, [plan, weekStartStr]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (data.id) return base44.entities.MealPlan.update(data.id, data);
      return base44.entities.MealPlan.create(data);
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

  const handleAddIngredients = (dayLabel, mealLabel, items) => {
    const lines = items.map(item => `${item} — for ${mealLabel} (${dayLabel})`).join("\n");
    const existing = local.week_groceries || "";
    const updated = existing ? `${existing}\n${lines}` : lines;
    handleChange("week_groceries", updated);
  };

  const weekLabel = weekOffset === 0 ? "This week"
    : weekOffset === 1 ? "Next week"
    : weekOffset === -1 ? "Last week"
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
          className="h-9 w-9 rounded-xl border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium text-foreground/70">{weekLabel}</span>
        <button
          onClick={() => setWeekOffset(w => w + 1)}
          className="h-9 w-9 rounded-xl border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
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
          {[1, 2, 3].map(i => <Card key={i} className="h-48 animate-pulse bg-muted/40" />)}
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
                  isToday ? "border-primary/30 bg-primary/5 shadow-sm" : "border-border/50 bg-card"
                }`}
              >
                <div className="flex items-center gap-2">
                  <h3 className={`font-bold text-base ${isToday ? "text-primary" : "text-foreground"}`}>{label}</h3>
                  <span className="text-xs text-muted-foreground/50">{format(date, "MMM d")}</span>
                  {isToday && (
                    <span className="ml-auto text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Today</span>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {MEALS.map(({ key: mKey, label: mLabel, emoji }) => (
                    <MealField
                      key={mKey}
                      label={mLabel}
                      emoji={emoji}
                      value={local[`${key}_${mKey}`]}
                      onChange={val => handleChange(`${key}_${mKey}`, val)}
                      onAddIngredients={(items) => handleAddIngredients(label, mLabel, items)}
                      isSnacks={mKey === "snacks"}
                    />
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Weekly grocery section */}
      <Card className="p-5 space-y-3 bg-secondary/30 border-border/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">🛒 Need this week</p>
            <p className="text-xs text-muted-foreground/50 mt-0.5">One item per line — feeds your Kitchen List</p>
          </div>
          <Link to="/KitchenList" className="text-xs text-primary hover:underline">View list →</Link>
        </div>
        <Textarea
          value={local.week_groceries || ""}
          onChange={e => handleChange("week_groceries", e.target.value)}
          placeholder={"milk\nbread\nlemon…"}
          rows={4}
          className="resize-none text-sm bg-background/60 border-border/40 rounded-xl placeholder:text-muted-foreground/30 focus:border-primary/40"
        />
      </Card>

      <p className="text-center text-xs text-muted-foreground/40 italic pt-2">
        This is here to support you, not to pressure you.
      </p>
    </div>
  );
}