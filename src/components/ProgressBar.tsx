"use client";

interface ProgressBarProps {
  currentStep: number;
  labels: string[];
  accentColor: string;
  primaryColor?: string;
}

export default function ProgressBar({
  currentStep,
  labels,
  accentColor,
  primaryColor = "#01305C",
}: ProgressBarProps) {
  const totalSteps = labels.length;
  const currentLabel = labels[currentStep] || "";
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div
      role="progressbar"
      aria-valuenow={currentStep + 1}
      aria-valuemax={totalSteps}
      aria-label={`Quiz progress: step ${currentStep + 1} of ${totalSteps}`}
      style={{ width: "100%" }}
    >
      {/* Step counter + section name */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: "10px",
          gap: "12px",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: primaryColor,
            letterSpacing: "0.01em",
            whiteSpace: "nowrap",
          }}
        >
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: "#6B7580",
            textAlign: "right",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {currentLabel}
        </span>
      </div>

      {/* Progress track */}
      <div
        style={{
          width: "100%",
          height: "4px",
          backgroundColor: "#E3E6EB",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progressPercent}%`,
            height: "100%",
            backgroundColor: accentColor,
            borderRadius: "2px",
            transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </div>
    </div>
  );
}
