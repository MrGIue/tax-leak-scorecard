"use client";

import { useEffect, useRef, useState } from "react";

interface ScoreAnimationProps {
  score: number;
  maxScore: number;
  color: string;
}

export default function ScoreAnimation({ score, maxScore, color }: ScoreAnimationProps) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const duration = 1500; // ms

  useEffect(() => {
    // Reset and re-animate whenever score changes
    startTimeRef.current = null;
    setDisplayed(0);

    function tick(timestamp: number) {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for a natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * score);

      setDisplayed(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [score]);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: "6px",
      }}
    >
      <span
        style={{
          fontSize: "64px",
          fontWeight: 800,
          lineHeight: "1",
          color: color,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-1px",
        }}
      >
        {displayed}
      </span>
      <span
        style={{
          fontSize: "28px",
          fontWeight: 400,
          color: "#9CA3AF",
          lineHeight: "1",
        }}
      >
        / {maxScore}
      </span>
    </div>
  );
}
