import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfWeek } from "date-fns";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ShoppingBag, Check, Share2, Copy, CheckCheck, Trash2 } from "lucide-react";
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
  const queryClient = useQueryClient();

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
  const [copied, setCopied] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearMessage, setClearMessage] = useState(null);
  const [undoTimeout, setUndoTimeout] = useState(null);
  const [backupStates, setBackupStates] = useState(null);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      if (!plan?.id) return;
      return base44.entities.MealPlan.update(plan.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlan", weekStartStr] });
    },
  });

  const handleClearList = () => {
    setBackupStates(itemStates);
    setItemStates({});
    updateMutation.mutate({ week_groceries: "", running_low: "" });
    setShowClearConfirm(false);
    setClearMessage(true);

    const timeout = setTimeout(() => setClearMessage(null), 3000);
    setUndoTimeout(timeout);
  };

  const handleUndo = () => {
    if (backupStates) {
      setItemStates(backupStates);
      if (plan?.id) {
        updateMutation.mutate({ week_groceries: plan.week_groceries, running_low: plan.running_low });
      }
      setClearMessage(null);
      if (undoTimeout) clearTimeout(undoTimeout);
    }
  };

  const buildShareText = () => {
    const hour = new Date().getHours();
    const timeLabel = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
    const dayLabel = format(new Date(), "EEEE");
    let text = `Kitchen List 🧺\nUpdated: ${dayLabel} ${timeLabel}\n`;

    CATEGORIES.forEach(({ key, label }) => {
      const catItems = grouped[key] || [];
      if (!catItems.length) return;
      text += `\n${label.replace(/^[^\s]+\s/, "")}\n`; // strip emoji for cleaner text
      catItems.forEach(item => {
        const sub = item.context || (item.source === "running low" ? "running low" : null);
        text += `- ${item.name}${sub ? ` (${sub})` : ""}\n`;
      });
    });

    return text.trim();
  };

  const handleShare = async () => {
    const text = buildShareText();
    if (navigator.share) {
      navigator.share({ title: "Kitchen List 🧺", text });
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <Link to="/KitchenPlan" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-accent" />
            Kitchen List
          </h2>
          <p className="text-sm text-muted-foreground italic">What you might need this week</p>
        </div>
        {items.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              title="Copy list"
              className="h-8 w-8 rounded-xl border border-border/60 bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
            >
              {copied ? <CheckCheck className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border border-accent/40 bg-accent/10 text-accent-foreground hover:bg-accent/20 transition-all"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share list
            </button>
          </div>
        )}
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

      {/* Clear Message / Undo */}
      {clearMessage && (
        <Card className="p-3 bg-secondary/40 border-border/40 flex items-center justify-between">
          <p className="text-sm text-foreground">Kitchen List cleared.</p>
          <button
            onClick={handleUndo}
            className="text-xs font-medium text-primary hover:underline"
          >
            Undo
          </button>
        </Card>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-end z-50">
          <Card className="w-full rounded-t-2xl p-5 space-y-4 bg-card border-t border-border/40">
            <div>
              <p className="text-base font-semibold text-foreground">Clear this grocery list?</p>
              <p className="text-sm text-muted-foreground mt-1">This will remove all current grocery items.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 text-sm font-medium py-2.5 rounded-lg border border-border/60 bg-background text-foreground hover:bg-muted/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearList}
                className="flex-1 text-sm font-medium py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Confirm clear
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Clear Button */}
      {items.length > 0 && !showClearConfirm && !clearMessage && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear list
          </button>
        </div>
      )}
    </div>
  );
}