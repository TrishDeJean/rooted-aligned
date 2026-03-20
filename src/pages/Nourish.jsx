import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Leaf, Clock, ChefHat, Zap } from "lucide-react";
import { formatDistanceToNow, addHours } from "date-fns";
import StarterCard from "@/components/nourish/StarterCard";
import AddStarterDialog from "@/components/nourish/AddStarterDialog";
import BakeFlow from "@/components/nourish/BakeFlow";

const STARTER_NAMES = [
  "Lorelai", "Wynonna", "Dixie", "Georgia", "Rune",
  "Rogue", "Gaia", "Solene", "Amenadiel", "Ezekiel", "Celeste"
];

const QUICK_LOGS = [
  { key: "fed_all", label: "🌾 Fed all starters", type: "fed_all" },
  { key: "baked", label: "🍞 Baked 4 loaves", type: "baked_loaves", loaves_count: 4 },
  { key: "discard", label: "♻️ Discard used", type: "discard_used" },
];

export default function Nourish() {
  const [showAddStarter, setShowAddStarter] = useState(false);
  const [editStarter, setEditStarter] = useState(null);
  const [activeTab, setActiveTab] = useState("starters");
  const queryClient = useQueryClient();

  const { data: starters = [] } = useQuery({
    queryKey: ["starters"],
    queryFn: () => base44.entities.Starter.list("-updated_date"),
  });

  const { data: logs = [] } = useQuery({
    queryKey: ["nourishLogs"],
    queryFn: () => base44.entities.NourishLog.list("-created_date", 20),
  });

  const logMutation = useMutation({
    mutationFn: (data) => base44.entities.NourishLog.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["nourishLogs"] }),
  });

  const feedAllMutation = useMutation({
    mutationFn: async () => {
      const now = new Date().toISOString();
      const nextFeed = addHours(new Date(), 12).toISOString();
      await Promise.all(starters.map(s =>
        base44.entities.Starter.update(s.id, { last_fed: now, next_feed_due: nextFeed })
      ));
      await base44.entities.NourishLog.create({ log_type: "fed_all", notes: "All starters fed" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["starters"] });
      queryClient.invalidateQueries({ queryKey: ["nourishLogs"] });
    },
  });

  const tabs = [
    { key: "starters", label: "Starters", icon: Leaf },
    { key: "bake", label: "Bake Flow", icon: ChefHat },
    { key: "log", label: "Quick Log", icon: Zap },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Nourish</h2>
          <p className="text-sm text-muted-foreground/70 italic">your starters, your rhythm</p>
        </div>
        {activeTab === "starters" && (
          <Button size="sm" onClick={() => { setEditStarter(null); setShowAddStarter(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Add Starter
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Starters Tab */}
      {activeTab === "starters" && (
        <div className="space-y-3">
          {starters.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <Leaf className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium">No starters yet</p>
              <p className="text-xs text-muted-foreground mt-1">Add your first living culture 🌿</p>
            </Card>
          ) : (
            <>
              {starters.length > 1 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => feedAllMutation.mutate()}
                  disabled={feedAllMutation.isPending}
                >
                  🌾 {feedAllMutation.isPending ? "Feeding..." : "Feed All Starters"}
                </Button>
              )}
              {starters.map(starter => (
                <StarterCard
                  key={starter.id}
                  starter={starter}
                  onEdit={(s) => { setEditStarter(s); setShowAddStarter(true); }}
                />
              ))}
            </>
          )}
        </div>
      )}

      {/* Bake Flow Tab */}
      {activeTab === "bake" && <BakeFlow />}

      {/* Quick Log Tab */}
      {activeTab === "log" && (
        <div className="space-y-4">
          <div className="space-y-2">
            {QUICK_LOGS.map(({ key, label, type, loaves_count }) => (
              <button
                key={key}
                onClick={() => logMutation.mutate({ log_type: type, loaves_count })}
                className="w-full text-left p-4 rounded-xl bg-card border border-border hover:border-primary/40 hover:bg-primary/5 transition-all active:scale-[0.98]"
              >
                <span className="font-medium text-sm">{label}</span>
              </button>
            ))}
          </div>

          {logs.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground tracking-wide">Recent</h3>
              {logs.slice(0, 8).map(log => (
                <Card key={log.id} className="p-3 flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium capitalize">{log.log_type.replace(/_/g, " ")}</p>
                    {log.notes && <p className="text-xs text-muted-foreground">{log.notes}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatDistanceToNow(new Date(log.created_date), { addSuffix: true })}
                  </span>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <AddStarterDialog
        open={showAddStarter}
        onOpenChange={setShowAddStarter}
        editStarter={editStarter}
        suggestedNames={STARTER_NAMES}
      />
    </div>
  );
}