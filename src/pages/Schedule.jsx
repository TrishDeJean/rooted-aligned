import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, addDays, subDays } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ScheduleCard from "@/components/schedule/ScheduleCard";

function timeGroup(time) {
  if (!time) return "morning";
  const [h] = time.split(":").map(Number);
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

const GROUP_EMOJIS = { morning: "🌤", afternoon: "🌿", evening: "🌙" };

function ScheduleGrouped({ entries, kids, onToggle, onEdit }) {
  const groups = { morning: [], afternoon: [], evening: [] };
  entries.forEach(e => groups[timeGroup(e.start_time)].push(e));
  const labels = { morning: "Morning", afternoon: "Afternoon", evening: "Evening" };
  const completed = entries.filter(e => e.completed).length;
  const total = entries.length;
  const [collapsed, setCollapsed] = useState({});

  const toggle = (g) => setCollapsed(prev => ({ ...prev, [g]: !prev[g] }));

  return (
    <div className="space-y-4">
      {total > 0 && (
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary/50 rounded-full transition-all duration-700"
            style={{ width: `${(completed / total) * 100}%` }}
          />
        </div>
      )}
      {["morning", "afternoon", "evening"].map(group => {
        if (!groups[group].length) return null;
        const isCollapsed = collapsed[group];
        const doneInGroup = groups[group].filter(e => e.completed).length;
        const totalInGroup = groups[group].length;
        return (
          <div key={group} className="space-y-2">
            <button
              onClick={() => toggle(group)}
              className="flex items-center gap-2 w-full text-left"
            >
              <span className="text-sm">{GROUP_EMOJIS[group]}</span>
              <p className="text-[11px] font-semibold text-muted-foreground/60 tracking-widest uppercase flex-1">{labels[group]}</p>
              <span className="text-[10px] text-muted-foreground/40">{doneInGroup}/{totalInGroup}</span>
              <span className={`text-muted-foreground/30 transition-transform text-xs ${isCollapsed ? "" : "rotate-180"}`}>▲</span>
            </button>
            {!isCollapsed && groups[group].map(entry => (
              <ScheduleCard
                key={entry.id}
                entry={entry}
                kids={kids}
                onToggleComplete={onToggle}
                onEdit={onEdit}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
import AddScheduleDialog from "@/components/schedule/AddScheduleDialog";

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editEntry, setEditEntry] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const queryClient = useQueryClient();
  const dateStr = format(selectedDate, "yyyy-MM-dd");

  const { data: entriesForDate = [] } = useQuery({
    queryKey: ["scheduleEntries", dateStr],
    queryFn: () => base44.entities.ScheduleEntry.filter({ date: dateStr }, "start_time"),
  });

  const { data: recurringEntries = [], isLoading } = useQuery({
    queryKey: ["recurringEntries"],
    queryFn: () => base44.entities.ScheduleEntry.filter({ is_recurring: true }),
  });

  const dayOfWeek = selectedDate.getDay(); // 0=Sun..6=Sat
  const recurringForDay = recurringEntries.filter(e => {
    const d = new Date(e.date + "T00:00:00");
    return d.getDay() === dayOfWeek && e.date !== dateStr;
  });

  const seen = new Set();
  const entries = [
    ...entriesForDate,
    ...recurringForDay.filter(r => !entriesForDate.some(e => e.id === r.id))
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

  const isToday = format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
  const presentKidIds = kids.filter(k => k.is_present !== false).map(k => k.id);

  // Generate week days for the date strip
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(
      subDays(selectedDate, selectedDate.getDay()),
      i
    );
    return date;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your Flow</h2>
          <p className="text-sm text-muted-foreground/70 italic">Move gently through today.</p>
        </div>

        {!isToday && (
          <Button variant="ghost" size="sm" onClick={() => setSelectedDate(new Date())}>
            <CalendarDays className="h-4 w-4 mr-1" />
            Today
          </Button>
        )}
      </div>

      {/* Date Navigator */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => setSelectedDate(prev => subDays(prev, 7))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 flex gap-1 justify-between">
          {weekDays.map((date) => {
            const isSelected = format(date, "yyyy-MM-dd") === dateStr;
            const isTodayDate = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-all flex-1 ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : isTodayDate
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <span className="text-[10px] font-medium uppercase">{format(date, "EEE")}</span>
                <span className="text-sm font-bold">{format(date, "d")}</span>
              </button>
            );
          })}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => setSelectedDate(prev => addDays(prev, 7))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Date label + tagline */}
      <div>
        <p className="text-sm font-medium text-muted-foreground">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
        <p className="text-xs text-muted-foreground/50 italic mt-0.5">Here's how your day is unfolding.</p>
      </div>

      {/* Schedule List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="h-20 animate-pulse bg-muted/50" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <CalendarDays className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground font-medium">Nothing scheduled</p>
          <p className="text-xs text-muted-foreground mt-1">Tap + to add an activity</p>
        </Card>
      ) : (
        <ScheduleGrouped
          entries={entries.filter(entry => !entry.kids?.length || entry.kids.some(id => presentKidIds.includes(id)))}
          kids={kids}
          onToggle={(id, completed) => toggleMutation.mutate({ id, completed })}
          onEdit={(e) => { setEditEntry(e); setShowEdit(true); }}
        />
      )}

      <AddScheduleDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        editEntry={editEntry}
      />
    </div>
  );
}