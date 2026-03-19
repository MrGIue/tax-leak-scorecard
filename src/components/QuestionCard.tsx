"use client";

import { Question } from "@/lib/types";

interface QuestionCardProps {
  question: Question;
  selectedIndex: number | undefined;
  onSelect: (index: number) => void;
  accentColor: string;
  primaryColor?: string;
}

function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

export default function QuestionCard({
  question,
  selectedIndex,
  onSelect,
  accentColor,
  primaryColor = "#01305C",
}: QuestionCardProps) {
  const primaryRgb = hexToRgb(primaryColor);

  return (
    <div style={{ width: "100%" }}>
      {/* Question text */}
      <h2
        id={`question-heading-${question.id}`}
        style={{
          fontSize: "clamp(17px, 2.2vw, 19px)",
          fontWeight: 600,
          color: "#1B2B3A",
          lineHeight: 1.5,
          marginBottom: "16px",
        }}
      >
        {question.text}
      </h2>

      {/* Answer options */}
      <div
        role="radiogroup"
        aria-labelledby={`question-heading-${question.id}`}
        aria-label={question.text}
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        {question.options.map((option, i) => {
          const isSelected = selectedIndex === i;
          return (
            <button
              key={i}
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(i)}
              style={{
                display: "flex",
                alignItems: "center",
                minHeight: "56px",
                width: "100%",
                padding: "14px 18px",
                textAlign: "left",
                cursor: "pointer",
                borderRadius: "10px",
                border: isSelected
                  ? `1.5px solid ${primaryColor}`
                  : "1.5px solid #E3E6EB",
                borderLeft: isSelected
                  ? `4px solid ${primaryColor}`
                  : "4px solid transparent",
                backgroundColor: isSelected
                  ? `rgba(${primaryRgb}, 0.04)`
                  : "#FAFBFC",
                boxShadow: isSelected
                  ? `0 0 0 1px rgba(${primaryRgb}, 0.08)`
                  : "none",
                transition: "all 0.18s ease",
                outline: "none",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#C5CAD3";
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F5F6F8";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#E3E6EB";
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#FAFBFC";
                }
              }}
            >
              {/* Letter indicator */}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "30px",
                  height: "30px",
                  minWidth: "30px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 700,
                  marginRight: "14px",
                  backgroundColor: isSelected ? primaryColor : "#E8ECF0",
                  color: isSelected ? "#FFFFFF" : "#6B7580",
                  transition: "all 0.18s ease",
                  letterSpacing: "0.02em",
                }}
              >
                {String.fromCharCode(65 + i)}
              </span>

              {/* Option text */}
              <span
                style={{
                  fontSize: "15px",
                  lineHeight: 1.5,
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? "#1B2B3A" : "#3D4A5C",
                  transition: "all 0.18s ease",
                }}
              >
                {option.text}
              </span>

              {/* Checkmark for selected */}
              {isSelected && (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                  style={{ marginLeft: "auto", minWidth: "20px" }}
                >
                  <circle cx="10" cy="10" r="10" fill={accentColor} />
                  <path d="M6 10.5L8.5 13L14 7.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
