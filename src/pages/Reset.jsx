import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

const DAILY_SECTIONS = [
  {
    emoji: "🌿",
    title: "Reset your space",
    tasks: ["Clear one surface", "Quick tidy", "Kitchen reset"],
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

const CLOSING_MESSAGES = [
  "Your space feels softer now 🤍",
  "Your week has room to breathe 🌿",
  "You did what mattered 💫",
  "You're ready for what's ahead 🌙",
];

function ResetSection({ emoji, title, tasks, index, isSunday }) {
  const [open, setOpen] = useState(index === 0);

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
          {tasks.map((task, i) => (
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

export default function Reset() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const isSunday = dayOfWeek === 0;
  const dayName = format(today, "EEEE");

  const [completed, setCompleted] = useState(false);
  const [closingMessage] = useState(
    CLOSING_MESSAGES[Math.floor(Math.random() * CLOSING_MESSAGES.length)]
  );

  const sections = isSunday ? SUNDAY_SECTIONS : DAILY_SECTIONS;
  const completionText = isSunday 
    ? "You showed up for yourself. That's enough."
    : "You did what you could today. That's enough.";
  const closingDisplay = isSunday 
    ? closingMessage
    : "You're ready for tomorrow 🤍";

  const flowGuides = isSunday
    ? ["Start with your space", "Now take a moment for yourself", "Let's look ahead to your week"]
    : ["Start small", "Take a moment for yourself", "Close the day gently"];

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Day */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">{dayName} Reset</h2>
        <p className="text-sm text-muted-foreground italic">A moment to reset and realign</p>
      </div>

      {!completed ? (
        <>
          {/* Flow guidance */}
          {sections.map((_, idx) => (
            <div key={idx}>
              {idx > 0 && (
                <p className="text-xs text-muted-foreground/50 text-center italic mb-3">
                  {flowGuides[Math.min(idx, flowGuides.length - 1)]}
                </p>
              )}
              <ResetSection
                key={sections[idx].title}
                {...sections[idx]}
                index={idx}
                isSunday={isSunday}
              />
            </div>
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
    </div>
  );
}