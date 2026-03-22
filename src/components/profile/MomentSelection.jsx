import { motion, AnimatePresence } from "framer-motion";

const OPTIONS = [
  {
    key: "breath",
    title: "3 deep breaths",
    sub: "inhale slowly, exhale gently",
  },
  {
    key: "look",
    title: "look around",
    sub: "name 3 things you can see",
  },
  {
    key: "sit",
    title: "just sit",
    sub: "no doing. just be.",
  },
];

export default function MomentSelection({ selected, onSelect, onBreath, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-40 flex flex-col items-center justify-center px-6"
      style={{ background: "hsl(28 38% 95%)" }}
    >
      <div className="w-full max-w-sm space-y-6">
        <p className="text-sm text-center italic" style={{ color: "hsl(18 8% 52%)" }}>
          what feels right, right now?
        </p>

        <div className="space-y-2">
          {OPTIONS.map(({ key, title, sub }) => (
            <button
              key={key}
              onClick={() => {
                if (key === "breath") {
                  onBreath();
                } else {
                  onSelect(key);
                }
              }}
              className="w-full text-left px-5 py-4 rounded-2xl border transition-all active:scale-[0.98]"
              style={{
                background: selected === key ? "hsl(101 11% 67% / 0.15)" : "hsl(33 30% 97%)",
                borderColor: selected === key ? "hsl(101 11% 67% / 0.4)" : "hsl(30 22% 86%)",
              }}
            >
              <p className="text-sm" style={{ color: "hsl(18 12% 30%)", fontWeight: 400 }}>{title}</p>
              <p className="text-xs mt-0.5" style={{ color: "hsl(18 8% 56%)" }}>{sub}</p>
            </button>
          ))}
        </div>

        {/* Quiet message when look/sit selected */}
        <AnimatePresence>
          {selected === "look" && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="text-xs text-center italic"
              style={{ color: "hsl(18 8% 56%)" }}
            >
              slow down. look. one thing at a time.
            </motion.p>
          )}
          {selected === "sit" && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="text-xs text-center italic"
              style={{ color: "hsl(18 8% 56%)" }}
            >
              you don't have to do anything right now.
            </motion.p>
          )}
        </AnimatePresence>

        <button
          onClick={onClose}
          className="w-full text-xs text-center pt-2 transition-colors"
          style={{ color: "hsl(18 8% 60%)" }}
        >
          maybe later
        </button>
      </div>
    </motion.div>
  );
}