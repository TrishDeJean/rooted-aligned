import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Card } from "@/components/ui/card";
import { format, subDays } from "date-fns";
import { Link } from "react-router-dom";
import { Flame } from "lucide-react";

function calcStreak(logs, habitId) {
  const days = new Set(logs.filter(l => l.habit_id === habitId).map(l => l.date));
  let streak = 0;
  let cursor = new Date();
  // allow today to count even if not yet logged
  while (true) {
    const d = format(cursor, "yyyy-MM-dd");
    if (days.has(d)) {
      streak++;
      cursor = subDays(cursor, 1);
    } else if (streak === 0 && d === format(new Date(), "yyyy-MM-dd")) {
      // today not yet logged — check yesterday to keep streak alive
      cursor = subDays(cursor, 1);
      const yesterday = format(cursor, "yyyy-MM-dd");
      if (days.has(yesterday)) {
        // streak starts from yesterday
        streak++;
        cursor = subDays(cursor, 1);
      } else {
        break;
      }
    } else {
      break;
    }
  }
  return streak;
}

export default function HabitStreakCard() {
  const user = useCurrentUser();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: habits = [] } = useQuery({
    queryKey: ["habits", user?.email],
    queryFn: () => base44.entities.Habit.filter({ created_by: user.email, is_active: true }),
    enabled: !!user,
  });

  const { data: logs = [] } = useQuery({
    queryKey: ["habitLogs30", user?.email],
    queryFn: async () => {
      const from = format(subDays(new Date(), 30), "yyyy-MM-dd");
      return base44.entities.HabitLog.filter({ created_by: user.email }, "-date", 200);
    },
    enabled: !!user,
  });

  if (!habits.length) return null;

  const todayLogs = new Set(logs.filter(l => l.date === today).map(l => l.habit_id));
  const completedToday = habits.filter(h => todayLogs.has(h.id)).length;

  return (
    <Link to="/Habits">
      <Card className="p-4 bg-gradient-to-br from-accent/10 to-primary/5 border-accent/20 hover:border-primary/30 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-foreground">Daily Rituals</p>
          <span className="text-xs text-muted-foreground">{completedToday}/{habits.length} today</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {habits.map(habit => {
            const streak = calcStreak(logs, habit.id);
            const done = todayLogs.has(habit.id);
            return (
              <div key={habit.id} className="flex items-center gap-1.5">
                <span className={`text-lg ${done ? "opacity-100" : "opacity-30"}`}>{habit.emoji || "⭕"}</span>
                <div>
                  <p className="text-xs font-medium text-foreground leading-none">{habit.name}</p>
                  {streak > 0 && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <Flame className="h-2.5 w-2.5 text-orange-400" />
                      <span className="text-[10px] text-orange-400 font-semibold">{streak}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </Link>
  );
}