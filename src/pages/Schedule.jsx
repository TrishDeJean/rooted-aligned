import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, addDays, subDays } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ScheduleCard from "@/components/schedule/ScheduleCard";
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

  const entries = [
    ...entriesForDate,
    ...recurringForDay.filter(r => !entriesForDate.some(e => e.id === r.id))
  ].sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));

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
        <h2 className="text-2xl font-bold tracking-tight">Schedule</h2>
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

      {/* Month label */}
      <p className="text-sm font-medium text-muted-foreground">
        {format(selectedDate, "EEEE, MMMM d, yyyy")}
      </p>

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

      <AddScheduleDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        editEntry={editEntry}
      />
    </div>
  );
}