import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TOTAL_CYCLES = 3;
const INHALE_DURATION = 4;
const EXHALE_DURATION = 6;

export default function BreathingExperience({ onClose }) {
  const [phase, setPhase] = useState("inhale"); // "inhale" | "exhale"
  const [cycle, setCycle] = useState(1);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;

    const duration = phase === "inhale" ? INHALE_DURATION : EXHALE_DURATION;
    const timer = setTimeout(() => {
      if (phase === "inhale") {
        setPhase("exhale");
      } else {
        if (cycle >= TOTAL_CYCLES) {
          setDone(true);
        } else {
          setCycle(c => c + 1);
          setPhase("inhale");
        }
      }
    }, duration * 1000);

    return () => clearTimeout(timer);
  }, [phase, cycle, done]);

  return (
    <div
      className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center"
      onClick={done ? onClose : undefined}
    >
      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div
            key="breathing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-10"
          >
            {/* Circle */}
            <motion.div
              animate={{
                width: phase === "inhale" ? 220 : 120,
                height: phase === "inhale" ? 220 : 120,
                opacity: phase === "inhale" ? 0.85 : 0.5,
              }}
              transition={{
                duration: phase === "inhale" ? INHALE_DURATION : EXHALE_DURATION,
                ease: "easeInOut",
              }}
              className="rounded-full bg-primary/40 border border-primary/20"
              style={{ width: 120, height: 120 }}
            />

            {/* Label */}
            <motion.p
              key={phase}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.5 }}
              className="text-base font-light text-muted-foreground tracking-widest italic"
            >
              {phase === "inhale" ? "inhale" : "exhale"}
            </motion.p>

            {/* Cycle dots */}
            <div className="flex gap-2">
              {Array.from({ length: TOTAL_CYCLES }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
                    i < cycle ? "bg-primary/60" : "bg-border"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center gap-4 text-center px-8"
          >
            <p className="text-xl font-semibold text-foreground">that's enough 🤍</p>
            <p className="text-xs text-muted-foreground/50 italic">tap anywhere to return</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}