import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const INHALE = 4000;
const EXHALE = 6000;
const CYCLE = INHALE + EXHALE;
const CYCLES_BEFORE_DONE = 4;

export default function BreathingExperience({ onClose }) {
  const [phase, setPhase] = useState("inhale"); // "inhale" | "exhale"
  const [cycleCount, setCycleCount] = useState(0);
  const [showDone, setShowDone] = useState(false);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    let timeout;

    const tick = (currentPhase, count) => {
      if (currentPhase === "inhale") {
        timeout = setTimeout(() => {
          setPhase("exhale");
          tick("exhale", count);
        }, INHALE);
      } else {
        timeout = setTimeout(() => {
          const newCount = count + 1;
          setCycleCount(newCount);
          if (newCount >= CYCLES_BEFORE_DONE) {
            setShowDone(true);
            setTimeout(() => setCanClose(true), 2000);
          } else {
            setPhase("inhale");
            tick("inhale", newCount);
          }
        }, EXHALE);
      }
    };

    tick("inhale", 0);
    return () => clearTimeout(timeout);
  }, []);

  const handleTap = () => {
    if (canClose) onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      onClick={handleTap}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "hsl(28 38% 95%)" }}
    >
      {/* Breathing circle */}
      <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
        {/* Outer glow ring */}
        <motion.div
          animate={{
            scale: phase === "inhale" ? 1.15 : 0.85,
            opacity: phase === "inhale" ? 0.15 : 0.07,
          }}
          transition={{
            duration: phase === "inhale" ? INHALE / 1000 : EXHALE / 1000,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full"
          style={{ background: "hsl(101 11% 67%)" }}
        />
        {/* Main circle */}
        <motion.div
          animate={{
            scale: phase === "inhale" ? 1 : 0.68,
          }}
          transition={{
            duration: phase === "inhale" ? INHALE / 1000 : EXHALE / 1000,
            ease: "easeInOut",
          }}
          className="rounded-full"
          style={{
            width: 160,
            height: 160,
            background: "radial-gradient(circle at 40% 35%, hsl(101 18% 78%), hsl(101 11% 60%))",
          }}
        />
      </div>

      {/* Phase label */}
      <AnimatePresence mode="wait">
        {!showDone && (
          <motion.p
            key={phase}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="mt-10 text-sm tracking-widest"
            style={{
              color: "hsl(101 11% 45%)",
              fontWeight: 300,
              letterSpacing: "0.18em",
            }}
          >
            {phase === "inhale" ? "inhale" : "exhale"}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Done message */}
      <AnimatePresence>
        {showDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="mt-10 text-center space-y-3"
          >
            <p
              className="text-base"
              style={{ color: "hsl(18 12% 42%)", fontWeight: 300 }}
            >
              that's enough 🤍
            </p>
            {canClose && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="text-xs"
                style={{ color: "hsl(18 8% 60%)" }}
              >
                tap anywhere to return
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}