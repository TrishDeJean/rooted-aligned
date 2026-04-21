import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { format, subDays, startOfMonth } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Flame, Plus, X, Check, ChevronLeft } from "lucide-react";
import MonthGrid from "@/components/habits/MonthGrid";
import { cn } from "@/lib/utils";

const EMOJIS = ["🌿","💧","🧘","✍️","📖","🌞","🏃","🎶","🍎","😴","🫁","❤️","🧹","📝","🙏"];
const COLORS = ["purple","peach","teal","pink","amber","sky","lime"];

function calcStreak(logs, habitId) {
  const days = new Set(logs.filter(l => l.habit_id === habitId).map(l => l.date));
  let streak = 0;
  let cursor = new Date();
  while (true) {
    const d = format(cursor, "yyyy-MM-dd");
    if (days.has(d)) {
      streak++;
      cursor = subDays(cursor, 1);
    } else if (streak === 0 && d === format(new Date(), "yyyy-MM-dd")) {
      cursor = subDays(cursor, 1);
      const yesterday = format(cursor, "yyyy-MM-dd");
      if (days.has(yesterday)) {
        streak++;
        cursor = subDays(cursor, 1);
      } else break;
    } else break;
  }
  return streak;
}

export default function Habits() {
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("🌿");
  const [expandedHabit, setExpandedHabit] = useState(null);

  const { data: habits = [], isLoading } = useQuery({
    queryKey: ["habits", user?.email],
    queryFn: () => base44.entities.Habit.filter({ created_by: user.email, is_active: true }),
    enabled: !!user,
  });

  const { data: logs = [] } = useQuery({
    queryKey: ["habitLogs30", user?.email],
    queryFn: () => base44.entities.HabitLog.filter({ created_by: user.email }, "-date", 200),
    enabled: !!user,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["habits", user?.email] });
    queryClient.invalidateQueries({ queryKey: ["habitLogs30", user?.email] });
  };

  const createHabit = useMutation({
    mutationFn: (data) => base44.entities.Habit.create(data),
    onSuccess: invalidate,
  });

  const archiveHabit = useMutation({
    mutationFn: (id) => base44.entities.Habit.update(id, { is_active: false }),
    onSuccess: invalidate,
  });

  const toggleLog = useMutation({
    mutationFn: async ({ habitId, date }) => {
      const existing = logs.find(l => l.habit_id === habitId && l.date === date);
      if (existing) {
        await base44.entities.HabitLog.delete(existing.id);
      } else {
        await base44.entities.HabitLog.create({ habit_id: habitId, date });
      }
    },
    onSuccess: invalidate,
  });

  const handleAddHabit = () => {
    if (!newName.trim()) return;
    createHabit.mutate({ name: newName.trim(), emoji: newEmoji, is_active: true });
    setNewName("");
    setNewEmoji("🌿");
    setShowAdd(false);
  };

  const todayLogs = new Set(logs.filter(l => l.date === today).map(l => l.habit_id));
  const thisMonth = startOfMonth(new Date());

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Daily Rituals</h2>
          <p className="text-sm text-muted-foreground/60 italic">Small acts, consistent love</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(v => !v)} variant={showAdd ? "outline" : "default"}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      {/* Add habit form */}
      {showAdd && (
        <Card className="p-4 space-y-3">
          <p className="text-sm font-medium">New ritual</p>
          <div className="flex gap-2">
            <Input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="e.g. Morning water, Journal..."
              onKeyDown={e => { if (e.key === "Enter") handleAddHabit(); if (e.key === "Escape") setShowAdd(false); }}
              autoFocus
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Pick an emoji</p>
            <div className="flex flex-wrap gap-1.5">
              {EMOJIS.map(em => (
                <button
                  key={em}
                  onClick={() => setNewEmoji(em)}
                  className={cn("text-xl p-1 rounded-lg transition-all", newEmoji === em ? "bg-primary/15 ring-1 ring-primary/40 scale-110" : "opacity-50 hover:opacity-100")}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAddHabit} disabled={!newName.trim()}>Save</Button>
          </div>
        </Card>
      )}

      {/* Today's check-ins */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground tracking-wide mb-3">
          {format(new Date(), "EEEE, MMMM d")} · {todayLogs.size}/{habits.length} done
        </p>

        {isLoading ? (
          <div className="space-y-2">{[1,2,3].map(i => <Card key={i} className="h-16 animate-pulse bg-muted/40" />)}</div>
        ) : habits.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <p className="text-muted-foreground text-sm">No rituals yet — tap Add to begin</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {habits.map(habit => {
              const done = todayLogs.has(habit.id);
              const streak = calcStreak(logs, habit.id);
              const expanded = expandedHabit === habit.id;
              return (
                <Card
                  key={habit.id}
                  className={cn("overflow-hidden transition-all", done && "border-primary/20 bg-primary/5")}
                >
                  <div className="flex items-center gap-3 p-3">
                    <button
                      onClick={() => toggleLog.mutate({ habitId: habit.id, date: today })}
                      className={cn(
                        "h-9 w-9 rounded-xl flex items-center justify-center text-xl shrink-0 transition-all",
                        done ? "bg-primary/20 scale-110" : "bg-muted/60 opacity-60 hover:opacity-100"
                      )}
                    >
                      {done ? <Check className="h-4 w-4 text-primary" /> : <span>{habit.emoji || "⭕"}</span>}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium", done && "text-primary")}>{habit.name}</p>
                      {streak > 0 && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Flame className="h-3 w-3 text-orange-400" />
                          <span className="text-[11px] text-orange-400 font-semibold">{streak} day{streak !== 1 ? "s" : ""}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setExpandedHabit(expanded ? null : habit.id)}
                        className="text-xs text-muted-foreground/50 hover:text-muted-foreground px-2 py-1"
                      >
                        {expanded ? "hide" : "history"}
                      </button>
                      <button
                        onClick={() => archiveHabit.mutate(habit.id)}
                        className="text-muted-foreground/20 hover:text-destructive/60 transition-colors p-1"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Month grid */}
                  {expanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-border/30">
                      <p className="text-xs text-muted-foreground/60 mb-2">{format(thisMonth, "MMMM yyyy")}</p>
                      <MonthGrid logs={logs} habitId={habit.id} month={thisMonth} />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}