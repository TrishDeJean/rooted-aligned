import { useState, useEffect } from "react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const DAILY_SECTIONS = [
  {
    emoji: "🌿",
    title: "Reset your space",
    tasks: ["Clear one surface", "Quick tidy", "Kitchen reset", "Check starters / feed if needed (optional)"],
  },
  {
    emoji: "🌸",
    title: "Reset yourself",
    tasks: ["Wash up / refresh", "Skincare", "Take a breath"],
  },
  {
    emoji: "🌙",
    title: "Reset your mind",
    tasks: ["Review your day", "Look at tomorrow", "Add anything to 'On your mind'"],
  },
];

const SUNDAY_SECTIONS = [
  {
    emoji: "🧺",
    title: "Reset your space",
    tasks: ["Make beds", "Laundry refresh", "Tidy main areas", "Kitchen reset", "Set up for Monday"],
  },
  {
    emoji: "🌸",
    title: "Reset yourself",
    tasks: ["Shower / everything shower", "Skincare", "Hair care", "Prep outfits", "Quiet moment"],
  },
  {
    emoji: "🍞",
    title: "Nourish your kitchen",
    tasks: ["Feed starters", "Check discard", "Plan bakes", "Prep dough (optional)"],
  },
  {
    emoji: "🌿",
    title: "Prepare your week",
    tasks: ["Review upcoming schedule", "Check kids' activities", "Plan meals (light, flexible)", "Set Top 3 for Monday"],
  },
];

const DAY_CONTEXT = {
  0: "Resetting for the week ahead",
  1: "Starting the week with intention",
  2: "A gentle midweek reset",
  3: "A gentle midweek reset",
  4: "Closing the week gently",
  5: "Slowing things down",
  6: "Slowing things down",
};

const CLOSING_MESSAGES = [
  "Your space feels softer now 🤍",
  "Your week has room to breathe 🌿",
  "You did what mattered 💫",
  "You're ready for what's ahead 🌙",
];

function ResetSection({ emoji, title, tasks, index, isSunday, completed, onTaskChange, onOpenMindInput }) {
  const [open, setOpen] = useState(index === 0);
  const [taskStates, setTaskStates] = useState(completed || {});

  const handleToggle = (taskIndex) => {
    const newStates = { ...taskStates, [taskIndex]: !taskStates[taskIndex] };
    setTaskStates(newStates);
    onTaskChange(index, newStates);
  };

  const completedCount = Object.values(taskStates).filter(Boolean).length;
  const totalTasks = tasks.length;
  const isComplete = completedCount === totalTasks;

  return (
    <>
      <Card
        className={cn(
          "p-4 border-border/40 transition-all",
          isComplete
            ? "bg-primary/5 border-primary/30 shadow-sm"
            : "bg-card hover:border-primary/20"
        )}
      >
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between text-left"
        >
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="text-lg">{emoji}</span>
            {title}
          </p>
          <div className="flex items-center gap-3">
            {completedCount > 0 && (
              <span className="text-xs text-muted-foreground/60">
                {completedCount}/{totalTasks}
              </span>
            )}
            {open ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground/50" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground/50" />
            )}
          </div>
        </button>

        {open && (
          <div className="mt-3 space-y-2 pl-6 border-l-2 border-primary/20">
            {tasks.map((task, i) => (
              <label key={i} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={taskStates[i] || false}
                  onChange={() => handleToggle(i)}
                  className="h-4 w-4 rounded-full border-2 border-border/60 checked:bg-primary checked:border-primary accent-primary cursor-pointer"
                />
                <span
                  className={cn(
                    "text-sm transition-colors",
                    taskStates[i]
                      ? "line-through text-muted-foreground/40"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  {task}
                </span>
              </label>
            ))}

            {/* Quick-add for "On your mind" */}
            {title === "Reset your mind" && (
              <button
                onClick={() => onOpenMindInput()}
                className="mt-3 text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1 pt-2 border-t border-border/20"
              >
                <Plus className="h-3 w-3" />
                Quick add to "On your mind"
              </button>
            )}
          </div>
        )}
      </Card>

      {isComplete && index < 2 && (
        <p className="text-xs text-muted-foreground/50 text-center italic">
          Take a moment for yourself
        </p>
      )}
    </>
  );
}

function QuickAddMind({ onClose, onAdd }) {
  const [input, setInput] = useState("");
  const queryClient = useQueryClient();

  const createNoteMutation = useMutation({
    mutationFn: (content) => base44.entities.Note.create({ content, is_reminder: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      onAdd(input);
      setInput("");
    },
  });

  const handleAdd = async () => {
    if (input.trim()) {
      createNoteMutation.mutate(input);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-end z-50">
      <Card className="w-full rounded-t-2xl p-5 space-y-4 bg-card border-t border-border/40">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Add to "On your mind"</p>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3">
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
            type="text"
            placeholder="What's on your mind?"
            className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-background text-sm placeholder:text-muted-foreground/40 focus:border-primary/40 focus:ring-primary/10 outline-none"
          />
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 text-sm font-medium py-2.5 rounded-lg border border-border/60 bg-background text-foreground hover:bg-muted/30 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!input.trim()}
              className="flex-1 text-sm font-medium py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function Reset() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const isSunday = dayOfWeek === 0;
  const dayName = format(today, "EEEE");
  const todayStr = format(today, "yyyy-MM-dd");
  const storageKey = `resetProgress_${todayStr}`;

  const [completed, setCompleted] = useState(false);
  const [sectionStates, setSectionStates] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch {
      return {};
    }
  });
  const [showMindInput, setShowMindInput] = useState(false);
  const [closingMessage] = useState(
    CLOSING_MESSAGES[Math.floor(Math.random() * CLOSING_MESSAGES.length)]
  );

  // Persist section states
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(sectionStates));
  }, [sectionStates, storageKey]);

  // Check if it's a new day and reset states
  useEffect(() => {
    const lastResetDate = localStorage.getItem("resetLastDate");
    if (lastResetDate !== todayStr) {
      localStorage.setItem("resetLastDate", todayStr);
      localStorage.removeItem(storageKey);
      setSectionStates({});
    }
  }, [todayStr, storageKey]);

  const sections = isSunday ? SUNDAY_SECTIONS : DAILY_SECTIONS;
  const contextLine = DAY_CONTEXT[dayOfWeek];
  const completionText = isSunday
    ? "You showed up for yourself. That's enough."
    : "You did what you could today. That's enough.";
  const closingDisplay = isSunday
    ? closingMessage
    : "You're ready for tomorrow 🤍";

  const handleTaskChange = (sectionIndex, taskStates) => {
    setSectionStates((prev) => ({
      ...prev,
      [sectionIndex]: taskStates,
    }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Day */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">{dayName} Reset</h2>
        <p className="text-sm text-muted-foreground italic">{contextLine}</p>
      </div>

      {!completed ? (
        <>
          {/* Sections */}
          {sections.map((section, idx) => (
            <ResetSection
              key={section.title}
              {...section}
              index={idx}
              isSunday={isSunday}
              completed={sectionStates[idx] || {}}
              onTaskChange={handleTaskChange}
              onOpenMindInput={() => setShowMindInput(true)}
            />
          ))}

          {/* Completion Button */}
          <button
            onClick={() => setCompleted(true)}
            className="w-full py-3 rounded-xl border border-primary/30 bg-primary/5 text-primary font-medium text-sm hover:bg-primary/10 transition-colors mt-6"
          >
            This is enough 🤍
          </button>
        </>
      ) : (
        <>
          {/* Completion State */}
          <Card className="p-8 text-center space-y-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <p className="text-lg font-semibold text-foreground">
              {completionText}
            </p>
          </Card>

          {/* Closing Message */}
          <Card className="p-6 text-center space-y-3 bg-secondary/30 border-border/40">
            <p className="text-base font-semibold text-foreground">
              {closingDisplay}
            </p>
          </Card>

          {/* Reset Button */}
          <button
            onClick={() => setCompleted(false)}
            className="w-full text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors py-2"
          >
            Start over
          </button>
        </>
      )}

      {/* Quick-add Mind Modal */}
      {showMindInput && (
        <QuickAddMind
          onClose={() => setShowMindInput(false)}
          onAdd={() => setShowMindInput(false)}
        />
      )}
    </div>
  );
}