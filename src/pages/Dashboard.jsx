import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Sun, Moon, CloudSun, CheckCircle2, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";
import ScheduleCard from "@/components/schedule/ScheduleCard";
import AddScheduleDialog from "@/components/schedule/AddScheduleDialog";
import KidAvatar from "@/components/kids/KidAvatar";
import PullToRefresh from "@/components/PullToRefresh";
import KidScheduleDrawer from "@/components/kids/KidScheduleDrawer";
import NotesSection from "@/components/notes/NotesSection";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good Morning", Icon: Sun, color: "text-amber-500" };
  if (hour < 17) return { text: "Good Afternoon", Icon: CloudSun, color: "text-orange-500" };
  return { text: "Good Evening", Icon: Moon, color: "text-indigo-500" };
}

export default function Dashboard() {
  const today = format(new Date(), "yyyy-MM-dd");
  const greeting = getGreeting();
  const [editEntry, setEditEntry] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const queryClient = useQueryClient();

  const { data: entriesForToday = [] } = useQuery({
    queryKey: ["scheduleEntries", today],
    queryFn: () => base44.entities.ScheduleEntry.filter({ date: today }, "start_time"),
  });

  const { data: recurringEntries = [], isLoading: loadingEntries } = useQuery({
    queryKey: ["recurringEntries"],
    queryFn: () => base44.entities.ScheduleEntry.filter({ is_recurring: true }),
  });

  const todayDayOfWeek = new Date().getDay();
  const recurringForToday = recurringEntries.filter(e => {
    const d = new Date(e.date + "T00:00:00");
    return d.getDay() === todayDayOfWeek && e.date !== today;
  });

  const seen = new Set();
  const entries = [
    ...entriesForToday,
    ...recurringForToday.filter(r => !entriesForToday.some(e => e.id === r.id))
  ]
    .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""))
    .filter(e => {
      const key = `${e.title}-${e.start_time}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  const { data: kids = [] } = useQuery({
    queryKey: ["kids"],
    queryFn: () => base44.entities.Kid.list(),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }) => base44.entities.ScheduleEntry.update(id, { completed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["scheduleEntries"] }),
  });

  const completed = entries.filter(e => e.completed).length;
  const total = entries.length;
  const workKids = kids.filter(k => k.type === "work_kid");
  const homeBoys = kids.filter(k => k.type === "home_boy");
  const nieces = kids.filter(k => k.type === "niece" && k.is_present !== false);
  const presentKidIds = kids.filter(k => k.is_present !== false).map(k => k.id);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["scheduleEntries"] });
    queryClient.invalidateQueries({ queryKey: ["kids"] });
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="space-y-6">
      {/* Greeting */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <greeting.Icon className={`h-6 w-6 ${greeting.color}`} />
          <h2 className="text-2xl font-bold tracking-tight">{greeting.text}</h2>
        </div>
        <p className="text-muted-foreground">
          {format(new Date(), "EEEE, MMMM d")} · {total} {total === 1 ? "activity" : "activities"} today
        </p>
      </div>

      {/* Progress Card */}
      {total > 0 && (
        <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/10 border-primary/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Today's Progress</span>
            <span className="text-sm font-bold text-primary">{completed}/{total}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
            />
          </div>
        </Card>
      )}

      {/* Kids Quick View */}
      {kids.length > 0 && (
        <div className="space-y-3">
          {workKids.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Work</h3>
              <div className="flex gap-3">
                {workKids.map(kid => (
                  <div key={kid.id} className="flex flex-col items-center gap-1">
                    <KidAvatar name={kid.name} color={kid.avatar_color} size="md" />
                    <span className="text-xs font-medium text-foreground">{kid.name.split(" ")[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {homeBoys.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Home</h3>
              <div className="flex gap-3 flex-wrap">
                {homeBoys.map(kid => (
                  <div key={kid.id} className="flex flex-col items-center gap-1">
                    <KidAvatar name={kid.name} color={kid.avatar_color} size="md" />
                    <span className="text-xs font-medium text-foreground">{kid.name.split(" ")[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {nieces.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Nieces</h3>
              <div className="flex gap-3 flex-wrap">
                {nieces.map(kid => (
                  <div key={kid.id} className="flex flex-col items-center gap-1">
                    <KidAvatar name={kid.name} color={kid.avatar_color} size="md" />
                    <span className="text-xs font-medium text-foreground">{kid.name.split(" ")[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Today's Schedule */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold">Today's Schedule</h3>
        {loadingEntries ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="h-20 animate-pulse bg-muted/50" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <Circle className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground font-medium">No activities scheduled today</p>
            <p className="text-xs text-muted-foreground mt-1">Tap + to add one</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {entries
              .filter(entry => !entry.kids?.length || entry.kids.some(id => presentKidIds.includes(id)))
              .map(entry => (
                <ScheduleCard
                  key={entry.id}
                  entry={entry}
                  kids={kids}
                  onToggleComplete={(id, completed) => toggleMutation.mutate({ id, completed })}
                  onEdit={(e) => { setEditEntry(e); setShowEdit(true); }}
                />
              ))}
          </div>
        )}
      </div>

      {/* Completion Summary */}
      {total > 0 && completed === total && (
        <Card className="p-4 bg-emerald-50 border-emerald-200 text-center">
          <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
          <p className="font-semibold text-emerald-700">All done for today!</p>
        </Card>
      )}

      <AddScheduleDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        editEntry={editEntry}
      />
    </div>
    </PullToRefresh>
  );
}