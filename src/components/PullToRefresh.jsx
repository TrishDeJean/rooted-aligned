import { useState, useRef } from "react";
import { RefreshCw } from "lucide-react";

const THRESHOLD = 64;

export default function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef(null);

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) startYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (startYRef.current === null) return;
    const dist = e.touches[0].clientY - startYRef.current;
    if (dist > 0) setPullDistance(Math.min(dist * 0.5, THRESHOLD));
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= THRESHOLD * 0.9) {
      setRefreshing(true);
      await onRefresh?.();
      setRefreshing(false);
    }
    setPullDistance(0);
    startYRef.current = null;
  };

  const progress = Math.min(pullDistance / (THRESHOLD * 0.9), 1);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Indicator */}
      <div
        className="absolute left-0 right-0 flex justify-center items-center pointer-events-none overflow-hidden transition-all duration-150"
        style={{ height: pullDistance > 0 || refreshing ? 40 : 0, top: -(pullDistance > 0 || refreshing ? 0 : 40) }}
      >
        <RefreshCw
          className={`h-5 w-5 text-primary transition-transform ${refreshing ? "animate-spin" : ""}`}
          style={{ transform: `rotate(${progress * 360}deg)`, opacity: progress }}
        />
      </div>
      <div style={{ transform: `translateY(${pullDistance}px)`, transition: pullDistance === 0 ? "transform 0.2s" : "none" }}>
        {children}
      </div>
    </div>
  );
}