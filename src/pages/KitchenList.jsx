import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, startOfWeek } from "date-fns";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ShoppingBag, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { key: "produce",  label: "🥬 Produce" },
  { key: "dairy",    label: "🥛 Dairy" },
  { key: "pantry",   label: "🫙 Pantry" },
  { key: "bread",    label: "🍞 Bread & Baking" },
  { key: "snacks",   label: "🍎 Snacks" },
  { key: "freezer",  label: "❄️ Freezer" },
  { key: "other",    label: "🛒 Other" },
];

function getWeekStart() {
  return format(startOfWeek(new Date(), { weekStartsOn: 0 }), "yyyy-MM-dd");
}

function parseItems(plan) {
  const items = [];
  const seen = new Set();

  const addLines = (raw, source) => {
    (raw || "").split("\n").forEach(line => {
      const text = line.trim();
      if (!text) return;
      const sepIdx = text.indexOf(" — ");
      let name, context;
      if (sepIdx > -1) {
        name = text.slice(0, sepIdx).trim();
        context = text.slice(sepIdx + 3).trim();
      } else {
        name = text;
        context = null;
      }
      const key = name.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      items.push({ id: text, name, context, source });
    });
  };

  addLines(plan?.week_groceries, "meal plan");
  addLines(plan?.running_low, "running low");

  return items;
}

export default function KitchenList() {
  const weekStartStr = getWeekStart();
  const storageKey = `kitchenList_v2_${weekStartStr}`;

  const { data: plan } = useQuery({
    queryKey: ["mealPlan", weekStartStr],
    queryFn: async () => {
      const results = await base44.entities.MealPlan.filter({ week_start: weekStartStr });
      return results[0] ?? null;
    },
  });

  const [itemStates, setItemStates] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "{}"); }
    catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(itemStates));
  }, [itemStates, storageKey]);

  const items = parseItems(plan);

  const toggle = (id) =>
    setItemStates(prev => ({ ...prev, [id]: { ...prev[id], checked: !prev[id]?.checked } }));

  const setCategory = (id, category) =>
    setItemStates(prev => ({ ...prev, [id]: { ...prev[id], category } }));

  const grouped = {};
  CATEGORIES.forEach(c => { grouped[c.key] = []; });
  items.forEach(item => {
    const cat = itemStates[item.id]?.category || "other";
    (grouped[cat] = grouped[cat] || []).push(item);
  });

  const checkedCount = items.filter(i => itemStates[i.id]?.checked).length;
  const remaining = items.length - checkedCount;

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
          <p className="text-xs text-muted-foreground/60">Add items in your Kitchen Plan</p>
          <Link to="/KitchenPlan" className="text-xs text-primary hover:underline block mt-1">Go to Kitchen Plan →</Link>
        </Card>
      ) : (
        <>
          {/* Weekly overview */}
          <Card className="p-4 bg-secondary/30 border-border/40 space-y-2">
            <p className="text-sm font-semibold text-foreground">This week you need:</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">{remaining}</span>
              <span className="text-sm text-muted-foreground">item{remaining !== 1 ? "s" : ""} left to pick up</span>
            </div>
            {checkedCount > 0 && (
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary/60 rounded-full transition-all duration-500"
                  style={{ width: `${(checkedCount / items.length) * 100}%` }}
                />
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              {CATEGORIES.map(({ key, label }) => {
                const count = (grouped[key] || []).filter(i => !itemStates[i.id]?.checked).length;
                if (!count) return null;
                return (
                  <span key={key} className="text-[10px] px-2 py-0.5 rounded-full bg-background border border-border/50 text-muted-foreground">
                    {label} · {count}
                  </span>
                );
              })}
            </div>
          </Card>

          {/* Grouped list */}
          <div className="space-y-5">
            {CATEGORIES.map(({ key, label }) => {
              const catItems = grouped[key] || [];
              if (catItems.length === 0) return null;
              return (
                <div key={key} className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground tracking-wide uppercase px-1">{label}</p>
                  <Card className="divide-y divide-border/40 overflow-hidden">
                    {catItems.map(item => {
                      const state = itemStates[item.id] || {};
                      return (
                        <div
                          key={item.id}
                          className={cn("flex items-center gap-3 px-4 py-3 group transition-colors", state.checked && "bg-muted/30")}
                        >
                          <button
                            onClick={() => toggle(item.id)}
                            className={cn(
                              "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                              state.checked
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-border/60 hover:border-primary/50"
                            )}
                          >
                            {state.checked && <Check className="h-3 w-3" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-sm leading-snug", state.checked && "line-through text-muted-foreground/40")}>
                              {item.name}
                            </p>
                            {!state.checked && (item.context || item.source === "running low") && (
                              <p className="text-[10px] text-muted-foreground/40 mt-0.5">
                                {item.context || "running low"}
                              </p>
                            )}
                          </div>
                          <select
                            value={state.category || "other"}
                            onChange={e => setCategory(item.id, e.target.value)}
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