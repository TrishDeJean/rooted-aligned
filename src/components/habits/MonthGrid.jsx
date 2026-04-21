import { format, startOfMonth, endOfMonth, eachDayOfInterval, subDays } from "date-fns";
import { cn } from "@/lib/utils";

export default function MonthGrid({ logs, habitId, month }) {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({ start, end });
  const loggedDays = new Set(logs.filter(l => l.habit_id === habitId).map(l => l.date));
  const today = format(new Date(), "yyyy-MM-dd");

  // pad start of month
  const startDow = start.getDay(); // 0=Sun
  const blanks = Array.from({ length: startDow });

  return (
    <div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <div key={i} className="text-center text-[9px] text-muted-foreground/50 font-medium">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {blanks.map((_, i) => <div key={`b${i}`} />)}
        {days.map(day => {
          const dateStr = format(day, "yyyy-MM-dd");
          const done = loggedDays.has(dateStr);
          const isToday = dateStr === today;
          const isFuture = dateStr > today;
          return (
            <div
              key={dateStr}
              className={cn(
                "aspect-square rounded-sm flex items-center justify-center text-[9px] font-medium transition-all",
                done ? "bg-primary text-primary-foreground" : isFuture ? "bg-muted/20 text-muted-foreground/20" : "bg-muted/40 text-muted-foreground/40",
                isToday && !done && "ring-1 ring-primary/40"
              )}
            >
              {day.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}