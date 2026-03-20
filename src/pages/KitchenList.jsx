import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, startOfWeek, addDays } from "date-fns";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ShoppingBag, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const CATEGORIES = [
  { key: "produce",   label: "🥦 Produce" },
  { key: "dairy",     label: "🥛 Dairy" },
  { key: "pantry",    label: "🫙 Pantry" },
  { key: "baking",    label: "🍞 Bread & Baking" },
  { key: "snacks",    label: "🍎 Snacks" },
  { key: "freezer",   label: "❄️ Freezer" },
  { key: "other",     label: "🛒 Other" },
];

function getWeekStart() {
  return format(startOfWeek(new Date(), { weekStartsOn: 0 }), "yyyy-MM-dd");
}

function parseItems(plan) {
  const all = [];
  DAYS.forEach(day => {
    const raw = plan?.[`${day}_groceries`] || "";
    raw.split("\n").forEach(line => {
      const text = line.trim();
      if (text) all.push(text);
    });
  });
  // dedupe
  return [...new Set(all)];
}

export default function KitchenList() {
  const weekStartStr = getWeekStart();
  const storageKey = `kitchenList_${weekStartStr}`;

  const { data: plan } = useQuery({
    queryKey: ["mealPlan", weekStartStr],
    queryFn: async () => {
      const results = await base44.entities.MealPlan.filter({ week_start: weekStartStr });
      return results[0] ?? null;
    },
  });

  // itemStates: { [text]: { checked: bool, category: string } }
  const [itemStates, setItemStates] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "{}"); }
    catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(itemStates));
  }, [itemStates, storageKey]);

  const items = parseItems(plan);

  const toggle = (text) => {
    setItemStates(prev => ({
      ...prev,
      [text]: { ...prev[text], checked: !prev[text]?.checked }
    }));
  };

  const setCategory = (text, category) => {
    setItemStates(prev => ({
      ...prev,
      [text]: { ...prev[text], category }
    }));
  };

  // group items by category
  const grouped = {};
  CATEGORIES.forEach(c => { grouped[c.key] = []; });
  items.forEach(text => {
    const cat = itemStates[text]?.category || "other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(text);
  });

  const checkedCount = items.filter(t => itemStates[t]?.checked).length;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <Link to="/KitchenPlan" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-accent" />
            Kitchen List
          </h2>
          <p className="text-sm text-muted-foreground italic">What you might need this week</p>
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="p-8 text-center border-dashed space-y-2">
          <p className="text-muted-foreground font-medium">Nothing here yet</p>
          <p className="text-xs text-muted-foreground/60">
            Add items under "Need this week" in your Kitchen Plan
          </p>
          <Link to="/KitchenPlan" className="text-xs text-primary hover:underline block mt-1">
            Go to Kitchen Plan →
          </Link>
        </Card>
      ) : (
        <>
          {checkedCount > 0 && (
            <p className="text-xs text-muted-foreground/60 text-center">
              {checkedCount} of {items.length} picked up ✓
            </p>
          )}

          <div className="space-y-5">
            {CATEGORIES.map(({ key, label }) => {
              const catItems = grouped[key] || [];
              if (catItems.length === 0) return null;
              return (
                <div key={key} className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground tracking-wide uppercase px-1">{label}</p>
                  <Card className="divide-y divide-border/40 overflow-hidden">
                    {catItems.map(text => {
                      const state = itemStates[text] || {};
                      return (
                        <div key={text} className={cn("flex items-center gap-3 px-4 py-3 group", state.checked && "bg-muted/30")}>
                          <button
                            onClick={() => toggle(text)}
                            className={cn(
                              "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                              state.checked
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-border/60 hover:border-primary/50"
                            )}
                          >
                            {state.checked && <Check className="h-3 w-3" />}
                          </button>
                          <span className={cn("flex-1 text-sm", state.checked && "line-through text-muted-foreground/50")}>
                            {text}
                          </span>
                          <select
                            value={state.category || "other"}
                            onChange={e => setCategory(text, e.target.value)}
                            className="text-[10px] text-muted-foreground/50 bg-transparent border-none outline-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {CATEGORIES.map(c => (
                              <option key={c.key} value={c.key}>{c.label}</option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </Card>
                </div>
              );
            })}
          </div>

          {checkedCount === items.length && items.length > 0 && (
            <Card className="p-4 text-center bg-primary/5 border-primary/20">
              <p className="text-sm font-medium text-primary">All picked up 🧺</p>
              <p className="text-xs text-muted-foreground mt-0.5">You're all set for the week.</p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}