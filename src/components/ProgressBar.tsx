"use client";

interface ProgressBarProps {
  currentStep: number;
  labels: string[];
  accentColor: string;
}

export default function ProgressBar({ currentStep, labels, accentColor }: ProgressBarProps) {
  const totalSteps = labels.length;

  return (
    <div
      role="progressbar"
      aria-valuenow={currentStep + 1}
      aria-valuemax={totalSteps}
      aria-label="Quiz progress"
      style={{ width: "100%" }}
    >
      {/* Segments */}
      <div style={{ display: "flex", gap: "4px", width: "100%" }}>
        {labels.map((_, i) => {
          const isCompleted = i < currentStep;
          const isCurrent = i === currentStep;
          const filled = isCompleted || isCurrent;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: "8px",
                borderRadius: "4px",
                backgroundColor: filled ? accentColor : "#E5E7EB",
                transition: "background-color 0.3s ease",
              }}
            />
          );
        })}
      </div>

      {/* Labels */}
      <div style={{ display: "flex", gap: "4px", width: "100%", marginTop: "6px" }}>
        {labels.map((label, i) => {
          const isCompleted = i < currentStep;
          const isCurrent = i === currentStep;
          const active = isCompleted || isCurrent;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                overflow: "hidden",
                textAlign: "center",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: "block",
                  fontSize: "11px",
                  lineHeight: "1.3",
                  fontWeight: isCurrent ? 600 : 400,
                  color: active ? accentColor : "#9CA3AF",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  transition: "color 0.3s ease",
                }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
