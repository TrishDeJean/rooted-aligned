import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { format, addDays, startOfWeek } from "date-fns";
import KidAvatar from "./KidAvatar";
import CategoryBadge from "@/components/schedule/CategoryBadge";
import { Clock } from "lucide-react";

function formatTime(time) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function KidScheduleDrawer({ kid, open, onClose }) {
  const [view, setView] = useState("today");
  const today = format(new Date(), "yyyy-MM-dd");
  const user = useCurrentUser();

  const { data: allEntries = [] } = useQuery({
    queryKey: ["allEntries", kid?.id, user?.email],
    queryFn: () => base44.entities.ScheduleEntry.filter({ created_by: user.email }),
    enabled: !!kid && !!user,
  });

  if (!kid) return null;

  const kidEntries = allEntries.filter(e => e.kids?.includes(kid.id));

  const weekStart = startOfWeek(new Date());
  const weekDates = Array.from({ length: 7 }, (_, i) =>
    format(addDays(weekStart, i), "yyyy-MM-dd")
  );

  const filtered = view === "today"
    ? kidEntries.filter(e => e.date === today || (e.is_recurring && new Date(e.date + "T00:00:00").getDay() === new Date().getDay()))
    : kidEntries.filter(e => weekDates.includes(e.date) || e.is_recurring);

  const dedupedEntries = (() => {
    const seen = new Set();
    return filtered
      .sort((a, b) => (a.date || "").localeCompare(b.date || "") || (a.start_time || "").localeCompare(b.start_time || ""))
      .filter(e => {
        const key = `${e.title}-${e.start_time}-${e.date}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  })();

  const grouped = view === "week"
    ? dedupedEntries.reduce((acc, e) => {
        const key = e.date;
        if (!acc[key]) acc[key] = [];
        acc[key].push(e);
        return acc;
      }, {})
    : null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl overflow-y-auto">
        <SheetHeader className="mb-4">
          <div className="flex items-center gap-3">
            <KidAvatar name={kid.name} color={kid.avatar_color} size="lg" />
            <div>
              <SheetTitle className="text-xl">{kid.name}</SheetTitle>
              <p className="text-sm text-muted-foreground capitalize">{kid.type?.replace("_", " ")}</p>
            </div>
          </div>
        </SheetHeader>

        {/* Toggle */}
        <div className="flex gap-2 mb-4">
          {["today", "week"].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all capitalize ${
                view === v ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {v === "today" ? "Today" : "This Week"}
            </button>
          ))}
        </div>

        {/* Entries */}
        {dedupedEntries.length === 0 ? (
          <Card className="p-6 text-center border-dashed">
            <p className="text-muted-foreground">No activities for {kid.name.split(" ")[0]} {view === "today" ? "today" : "this week"}</p>
          </Card>
        ) : view === "today" ? (
          <div className="space-y-2">
            {dedupedEntries.map(e => (
              <EntryRow key={e.id} entry={e} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([date, dayEntries]) => (
              <div key={date}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  {format(new Date(date + "T00:00:00"), "EEEE, MMM d")}
                </p>
                <div className="space-y-2">
                  {dayEntries.map(e => <EntryRow key={e.id} entry={e} />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function EntryRow({ entry }) {
  return (
    <Card className="p-3 flex items-center gap-3">
      <CategoryBadge category={entry.category} showLabel={false} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground">{entry.title}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatTime(entry.start_time)}{entry.end_time ? ` – ${formatTime(entry.end_time)}` : ""}
        </p>
      </div>
    </Card>
  );
}