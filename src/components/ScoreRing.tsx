"use client";

import { useEffect, useRef, useState } from "react";

interface ScoreRingProps {
  score: number;
  maxScore: number;
  color: string;
  size?: number;
  lightText?: boolean;
}

export default function ScoreRing({
  score,
  maxScore,
  color,
  size = 220,
  lightText = false,
}: ScoreRingProps) {
  const [progress, setProgress] = useState(0);
  const [displayedScore, setDisplayedScore] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const duration = 1800;

  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetProgress = maxScore > 0 ? score / maxScore : 0;

  useEffect(() => {
    startTimeRef.current = null;
    setProgress(0);
    setDisplayedScore(0);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setProgress(targetProgress);
      setDisplayedScore(score);
      return;
    }

    function tick(timestamp: number) {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);

      setProgress(eased * targetProgress);
      setDisplayedScore(Math.round(eased * score));

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [score, maxScore, targetProgress]);

  const dashOffset = circumference * (1 - progress);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={lightText ? "rgba(255,255,255,0.15)" : "#ECEEF2"}
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke 0.3s ease" }}
        />
      </svg>
      {/* Center content */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          className="font-display"
          style={{
            fontSize: size * 0.3,
            fontWeight: 700,
            color: lightText ? "#FFFFFF" : color,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {displayedScore}
        </span>
        <span
          style={{
            fontSize: size * 0.075,
            color: lightText ? "rgba(255,255,255,0.6)" : "#A0A7B3",
            fontWeight: 500,
            marginTop: 6,
            letterSpacing: "0.04em",
          }}
        >
          out of {maxScore}
        </span>
      </div>
    </div>
  );
}
