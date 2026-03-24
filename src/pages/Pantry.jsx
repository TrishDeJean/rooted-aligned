import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfWeek } from "date-fns";
import { Card } from "@/components/ui/card";
import { ChevronLeft, Plus, X, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { key: "staples",      label: "Staples",        emoji: "🧂", desc: "everyday essentials" },
  { key: "pantry",       label: "Pantry",          emoji: "🫙", desc: "dry goods & cans" },
  { key: "fridge_freezer", label: "Fridge & Freezer", emoji: "🧊", desc: "cold & frozen items" },
];

const STATUS_CYCLE = { stocked: "low", low: "out", out: "stocked" };
const STATUS_CONFIG = {
  stocked: { label: "Stocked", color: "bg-primary/10 text-primary border-primary/20" },
  low:     { label: "Low",     color: "bg-accent/30 text-accent-foreground border-accent/30" },
  out:     { label: "Out",     color: "bg-destructive/10 text-destructive border-destructive/20" },
};

function getWeekStart() {
  return format(startOfWeek(new Date(), { weekStartsOn: 0 }), "yyyy-MM-dd");
}

export default function Pantry() {
  const queryClient = useQueryClient();
  const weekStartStr = getWeekStart();
  const [newItemSection, setNewItemSection] = useState(null);
  const [newItemName, setNewItemName] = useState("");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["pantryItems"],
    queryFn: () => base44.entities.PantryItem.list(),
  });

  const { data: plan } = useQuery({
    queryKey: ["mealPlan", weekStartStr],
    queryFn: async () => {
      const results = await base44.entities.MealPlan.filter({ week_start: weekStartStr });
      return results[0] ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PantryItem.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pantryItems"] }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PantryItem.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pantryItems"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PantryItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pantryItems"] }),
  });

  const planMutation = useMutation({
    mutationFn: (data) =>
      plan?.id
        ? base44.entities.MealPlan.update(plan.id, data)
        : base44.entities.MealPlan.create({ week_start: weekStartStr, ...data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mealPlan", weekStartStr] }),
  });

  const cycleStatus = (item) => {
    updateMutation.mutate({ id: item.id, data: { status: STATUS_CYCLE[item.status || "stocked"] } });
  };

  const addItem = (section) => {
    const name = newItemName.trim();
    if (!name) { setNewItemSection(null); return; }
    createMutation.mutate({ name, section, status: "stocked" });
    setNewItemName("");
    setNewItemSection(null);
  };

  const addToGroceryList = (item) => {
    const existing = plan?.running_low || "";
    const lines = existing.split("\n").map(l => l.trim()).filter(Boolean);
    if (!lines.includes(item.name)) {
      const updated = [...lines, item.name].join("\n");
      planMutation.mutate({ running_low: updated });
    }
  };

  const needsRestocking = items.filter(i => i.status === "low" || i.status === "out");

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <Link to="/KitchenPlan" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pantry</h2>
          <p className="text-sm text-muted-foreground/60 italic">A gentle overview of what you have</p>
        </div>
      </div>

      {needsRestocking.length > 0 && (
        <Card className="p-4 bg-accent/10 border-accent/20 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground tracking-wide">Running low or out</p>
          <div className="flex flex-wrap gap-2">
            {needsRestocking.map(item => (
              <button
                key={item.id}
                onClick={() => addToGroceryList(item)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border/60 bg-background/80 text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                <ShoppingBag className="h-3 w-3 text-primary/60" />
                {item.name}
                <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full border", STATUS_CONFIG[item.status]?.color)}>
                  {STATUS_CONFIG[item.status]?.label}
                </span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground/40 italic">Tap an item to add it to your grocery list</p>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">{[1,2,3].map(i => <Card key={i} className="h-32 animate-pulse bg-muted/40" />)}</div>
      ) : (
        <div className="space-y-6">
          {SECTIONS.map(({ key, label, emoji, desc }) => {
            const sectionItems = items.filter(i => (i.section || "pantry") === key);
            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <span>{emoji}</span> {label}
                    </p>
                    <p className="text-[10px] text-muted-foreground/40 italic">{desc}</p>
                  </div>
                  <button
                    onClick={() => { setNewItemSection(key); setNewItemName(""); }}
                    className="text-[10px] text-muted-foreground/40 hover:text-primary transition-colors flex items-center gap-0.5"
                  >
                    <Plus className="h-3 w-3" /> add
                  </button>
                </div>

                <Card className="overflow-hidden divide-y divide-border/30">
                  {sectionItems.length === 0 && newItemSection !== key && (
                    <p className="text-xs text-muted-foreground/40 italic text-center py-4">Nothing here yet — tap + to add</p>
                  )}
                  {sectionItems.map(item => {
                    const cfg = STATUS_CONFIG[item.status || "stocked"];
                    return (
                      <div key={item.id} className="flex items-center gap-3 px-4 py-3 group">
                        <span className="text-sm text-foreground flex-1">{item.name}</span>
                        <button
                          onClick={() => cycleStatus(item)}
                          className={cn("text-[10px] font-medium px-2.5 py-1 rounded-full border transition-all", cfg.color)}
                        >
                          {cfg.label}
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(item.id)}
                          className="text-muted-foreground/20 hover:text-destructive/60 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                  {newItemSection === key && (
                    <div className="flex items-center gap-2 px-4 py-2">
                      <Input
                        value={newItemName}
                        onChange={e => setNewItemName(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") addItem(key); if (e.key === "Escape") setNewItemSection(null); }}
                        placeholder="Item name…"
                        className="h-7 text-sm border-0 bg-transparent p-0 focus-visible:ring-0 placeholder:text-muted-foreground/30 flex-1"
                        autoFocus
                      />
                      <button onClick={() => addItem(key)} className="text-xs text-primary font-medium hover:text-primary/80">Save</button>
                      <button onClick={() => setNewItemSection(null)} className="text-muted-foreground/40 hover:text-muted-foreground"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  )}
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}