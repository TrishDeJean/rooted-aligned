import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";

const RESET_SECTIONS = [
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

const CLOSING_MESSAGES = [
  "Your space feels softer now 🤍",
  "Your week has room to breathe 🌿",
  "You did what mattered 💫",
  "You're ready for what's ahead 🌙",
];

function getPaceLabel(pace) {
  const labels = {
    slow: "Slow & gentle",
    steady: "Steady & focused",
    full: "Full reset mode",
  };
  return labels[pace] || pace;
}

function getTaskCount(pace) {
  const counts = { slow: 3, steady: 4, full: 5 };
  return counts[pace] || 5;
}

function ResetSection({ emoji, title, tasks, pace, index }) {
  const [open, setOpen] = useState(index === 0);
  const visibleTasks = tasks.slice(0, getTaskCount(pace));

  return (
    <Card className="p-4 border-border/40 bg-card hover:border-primary/20 transition-colors">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left"
      >
        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="text-lg">{emoji}</span>
          {title}
        </p>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground/50" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground/50" />
        )}
      </button>

      {open && (
        <div className="mt-3 space-y-2 pl-6 border-l-2 border-primary/20">
          {visibleTasks.map((task, i) => (
            <label key={i} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                className="h-4 w-4 rounded-full border-2 border-border/60 checked:bg-primary checked:border-primary accent-primary cursor-pointer"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {task}
              </span>
            </label>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function SundayReset() {
  const [pace, setPace] = useState(() => {
    try {
      return localStorage.getItem("sundayReset_pace") || "steady";
    } catch {
      return "steady";
    }
  });

  const [completed, setCompleted] = useState(false);
  const [closingMessage] = useState(
    CLOSING_MESSAGES[Math.floor(Math.random() * CLOSING_MESSAGES.length)]
  );

  useEffect(() => {
    localStorage.setItem("sundayReset_pace", pace);
  }, [pace]);

  const handleComplete = () => {
    setCompleted(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Sunday Reset</h2>
        <p className="text-sm text-muted-foreground italic">A gentle reset for the week ahead</p>
      </div>

      {!completed ? (
        <>
          {/* Pace Selection */}
          <Card className="p-4 space-y-3 bg-accent/5 border-accent/20">
            <p className="text-sm font-semibold text-foreground">How are you showing up today?</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "slow", label: "🌙 Slow & gentle" },
                { key: "steady", label: "🌿 Steady & focused" },
                { key: "full", label: "☀️ Full reset" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setPace(key)}
                  className={`text-xs font-medium py-2.5 px-3 rounded-lg border transition-all text-center ${
                    pace === key
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border/50 text-foreground hover:border-primary/30"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground/60 italic mt-2">
              {getPaceLabel(pace)} — showing {getTaskCount(pace)} tasks per section
            </p>
          </Card>

          {/* Flow guidance */}
          <p className="text-xs text-muted-foreground/50 text-center italic">Start with your space</p>

          {/* Reset Sections */}
          <div className="space-y-3">
            {RESET_SECTIONS.map((section, idx) => (
              <ResetSection
                key={idx}
                {...section}
                pace={pace}
                index={idx}
              />
            ))}
          </div>

          {/* This is Enough Button */}
          <button
            onClick={handleComplete}
            className="w-full py-3 rounded-xl border border-primary/30 bg-primary/5 text-primary font-medium text-sm hover:bg-primary/10 transition-colors mt-6"
          >
            This is enough for today 🤍
          </button>
        </>
      ) : (
        <>
          {/* Completion State */}
          <Card className="p-8 text-center space-y-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <p className="text-lg font-semibold text-foreground">
              You showed up for yourself.
            </p>
            <p className="text-sm text-muted-foreground">
              That's enough. 🤍
            </p>
          </Card>

          {/* Closing Message */}
          <Card className="p-6 text-center space-y-3 bg-secondary/30 border-border/40">
            <p className="text-base font-semibold text-foreground">
              {closingMessage}
            </p>
            <p className="text-sm text-muted-foreground">
              You're ready for the week ahead.
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
    </div>
  );
}