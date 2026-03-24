import { useState, useEffect } from "react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser, userKey } from "@/hooks/useCurrentUser";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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

const COMPLETION_MESSAGES = [
  "You did what you could today. That's enough.",
  "You showed up today. That matters.",
  "That was enough for today.",
  "You're allowed to rest now.",
  "You're doing just fine 🤍",
  "This is what mattered today.",
  "This was enough for today.",
  "This is what you showed up for today.",
];

const STARTER_MESSAGES = [
  "Your starters are cared for 🤍",
  "Your kitchen is alive and well 🤍",
  "Everything is resting as it should 🤍",
];

const CLOSING_MESSAGES = [
  "Your space feels softer now 🤍",
  "Your week has room to breathe 🌿",
  "You did what mattered 💫",
  "You're ready for what's ahead 🌙",
];

function ResetSection({ emoji, title, tasks, index, isSunday, completed, onTaskChange }) {
  const [open, setOpen] = useState(index === 0);
  const [taskStates, setTaskStates] = useState(completed || {});
  const [mindInput, setMindInput] = useState("");
  const [showMindInput, setShowMindInput] = useState(false);
  const queryClient = useQueryClient();

  const createNoteMutation = useMutation({
    mutationFn: (content) => base44.entities.Note.create({ content, is_reminder: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setMindInput("");
      setShowMindInput(false);
    },
  });

  const handleToggle = (taskIndex) => {
    const newStates = { ...taskStates, [taskIndex]: !taskStates[taskIndex] };
    setTaskStates(newStates);
    onTaskChange(index, newStates);
  };

  const handleAddMind = () => {
    if (mindInput.trim()) {
      createNoteMutation.mutate(mindInput);
    }
  };

  const requiredTasks = tasks.map((t, i) => ({ task: t, index: i })).filter(({ task }) => !task.includes("(optional)"));
  const optionalTasks = tasks.map((t, i) => ({ task: t, index: i })).filter(({ task }) => task.includes("(optional)"));
  
  const completedRequired = requiredTasks.filter(({ index: i }) => taskStates[i]).length;
  const totalRequired = requiredTasks.length;
  const isComplete = completedRequired === totalRequired;

  return (
    <>
      <motion.div
        animate={{
          opacity: isComplete ? 0.6 : 1,
        }}
        transition={{ duration: 0.5 }}
      >
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
              {completedRequired > 0 && (
                <span className="text-xs text-muted-foreground/60">
                  {completedRequired}/{totalRequired}
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
                <label key={i} className={cn("flex items-center gap-2.5 cursor-pointer group", isComplete && "opacity-60")}>
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

              {/* Inline input for "On your mind" */}
              {title === "Reset your mind" && !showMindInput && (
                <button
                  onClick={() => setShowMindInput(true)}
                  className="mt-3 text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1 pt-2 border-t border-border/20"
                >
                  <Plus className="h-3 w-3" />
                  Add anything to "On your mind"
                </button>
              )}

              {title === "Reset your mind" && showMindInput && (
                <div className="mt-3 space-y-2 pt-2 border-t border-border/20">
                  <input
                    autoFocus
                    value={mindInput}
                    onChange={(e) => setMindInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddMind();
                    }}
                    type="text"
                    placeholder="What's on your mind?"
                    className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background text-sm placeholder:text-muted-foreground/40 focus:border-primary/40 focus:ring-primary/10 outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowMindInput(false);
                        setMindInput("");
                      }}
                      className="flex-1 text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddMind}
                      disabled={!mindInput.trim()}
                      className="flex-1 text-xs font-medium py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </motion.div>

      {isComplete && index < (isSunday ? 3 : 2) && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          className="text-xs text-muted-foreground/50 text-center italic"
        >
          {index === 0 && "Now take a moment for yourself"}
          {index === 1 && isSunday && "Let's look ahead to your week"}
          {index === 1 && !isSunday && "Close the day gently"}
        </motion.p>
      )}
    </>
  );
}

function ConfirmStartOver({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-end z-50">
      <Card className="w-full rounded-t-2xl p-5 space-y-4 bg-card border-t border-border/40">
        <div>
          <p className="text-base font-semibold text-foreground">Start this reset again?</p>
          <p className="text-sm text-muted-foreground mt-1">This will clear today's progress.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 text-sm font-medium py-2.5 rounded-lg border border-border/60 bg-background text-foreground hover:bg-muted/30 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 text-sm font-medium py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Start over
          </button>
        </div>
      </Card>
    </div>
  );
}

export default function Reset() {
  const user = useCurrentUser();
  const today = new Date();
  const dayOfWeek = today.getDay();
  const isSunday = dayOfWeek === 0;
  const dayName = format(today, "EEEE");
  const todayStr = format(today, "yyyy-MM-dd");
  const storageKey = userKey(user, `resetProgress_${todayStr}`);
  const lastDateKey = userKey(user, "resetLastDate");

  const [completed, setCompleted] = useState(false);
  const [sectionStates, setSectionStates] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [reflection, setReflection] = useState("");
  const [showReflection, setShowReflection] = useState(false);

  const completionMessageIndex = Math.floor(Math.random() * COMPLETION_MESSAGES.length);
  const [completionMessage] = useState(
    COMPLETION_MESSAGES[completionMessageIndex]
  );
  const [closingMessage] = useState(
    CLOSING_MESSAGES[Math.floor(Math.random() * CLOSING_MESSAGES.length)]
  );

  // Check if starter was completed
  const starterWasCompleted = Object.values(sectionStates).some(
    (sectionTasks) =>
      Object.entries(sectionTasks).some(
        ([taskIdx, completed]) =>
          completed &&
          (DAILY_SECTIONS[0]?.tasks[taskIdx]?.includes("Check starters") ||
            SUNDAY_SECTIONS[0]?.tasks[taskIdx]?.includes("Feed starters"))
      )
  );

  const shouldShowStarterMsg = starterWasCompleted && Math.random() > 0.4;

  // Load from user-scoped storage once key is ready
  useEffect(() => {
    try {
      setSectionStates(JSON.parse(localStorage.getItem(storageKey) || "{}"));
    } catch {
      setSectionStates({});
    }
    const lastResetDate = localStorage.getItem(lastDateKey);
    if (lastResetDate !== todayStr) {
      localStorage.setItem(lastDateKey, todayStr);
      localStorage.removeItem(storageKey);
      setSectionStates({});
    }
  }, [storageKey, lastDateKey, todayStr]);

  // Persist section states
  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(sectionStates));
  }, [sectionStates, storageKey]);

  const sections = isSunday ? SUNDAY_SECTIONS : DAILY_SECTIONS;
  const contextLine = DAY_CONTEXT[dayOfWeek];
  const closingDisplay = isSunday
    ? closingMessage
    : "You're ready for tomorrow 🤍";

  const handleTaskChange = (sectionIndex, taskStates) => {
    setSectionStates((prev) => ({
      ...prev,
      [sectionIndex]: taskStates,
    }));
  };

  const handleStartOver = () => {
    setSectionStates({});
    setCompleted(false);
    setShowConfirm(false);
  };

  // Calculate overall progress
  const totalRequired = sections.reduce((acc, section) => {
    const required = section.tasks.filter(t => !t.includes("(optional)")).length;
    return acc + required;
  }, 0);

  const totalCompleted = Object.values(sectionStates).reduce((acc, sectionTasks) => {
    return acc + Object.values(sectionTasks).filter(Boolean).length;
  }, 0);

  const progressPercent = totalRequired > 0 ? totalCompleted / totalRequired : 0;
  const buttonOpacity = Math.min(0.4 + progressPercent * 0.6, 1);

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Day */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">{dayName} Reset</h2>
        <p className="text-sm text-muted-foreground italic">{contextLine}</p>
      </div>

      {!completed ? (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Sections */}
          {sections.map((section, idx) => (
            <ResetSection
              key={section.title}
              {...section}
              index={idx}
              isSunday={isSunday}
              completed={sectionStates[idx] || {}}
              onTaskChange={handleTaskChange}
            />
          ))}

          {/* Completion Button with progressive visibility */}
          <motion.button
            onClick={() => setCompleted(true)}
            animate={{ opacity: buttonOpacity }}
            transition={{ duration: 0.5 }}
            className="w-full py-3 rounded-xl border border-primary/30 bg-primary/5 text-primary font-medium text-sm hover:bg-primary/10 transition-colors mt-6"
          >
            This is enough 🤍
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          {/* Completion State */}
          <Card className="p-8 text-center space-y-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <p className="text-lg font-semibold text-foreground">
              {completionMessage}
            </p>
          </Card>

          {/* Starter message (occasional) */}
          {shouldShowStarterMsg && (
            <Card className="p-4 text-center bg-secondary/30 border-border/40">
              <p className="text-sm text-foreground">
                {STARTER_MESSAGES[Math.floor(Math.random() * STARTER_MESSAGES.length)]}
              </p>
            </Card>
          )}

          {/* Optional reflection */}
          {!showReflection ? (
            <button
              onClick={() => setShowReflection(true)}
              className="w-full text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors py-2"
            >
              What felt good today? (optional)
            </button>
          ) : (
            <Card className="p-4 border-border/40">
              <input
                autoFocus
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                type="text"
                placeholder="Something that felt good…"
                className="w-full px-3 py-2 bg-background text-sm placeholder:text-muted-foreground/40 outline-none"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    setShowReflection(false);
                    setReflection("");
                  }}
                  className="flex-1 text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5"
                >
                  Skip
                </button>
                <button
                  onClick={() => setShowReflection(false)}
                  className="flex-1 text-xs font-medium py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Done
                </button>
              </div>
            </Card>
          )}

          {/* Closing Message */}
          <Card className="p-6 text-center space-y-3 bg-secondary/30 border-border/40">
            <p className="text-base font-semibold text-foreground">
              {closingDisplay}
            </p>
          </Card>

          {/* "See you tomorrow" message (occasional) */}
          {Math.random() > 0.3 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-xs text-muted-foreground/40 text-center italic pt-2"
            >
              See you tomorrow
            </motion.p>
          )}

          {/* Reset Button */}
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors py-2"
          >
            Start over
          </button>
        </motion.div>
      )}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <ConfirmStartOver
          onConfirm={handleStartOver}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}