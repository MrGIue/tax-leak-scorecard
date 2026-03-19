"use client";

import { Question } from "@/lib/types";

interface QuestionCardProps {
  question: Question;
  selectedIndex: number | undefined;
  onSelect: (index: number) => void;
  accentColor: string;
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
}: QuestionCardProps) {
  const rgb = hexToRgb(accentColor);

  return (
    <div style={{ width: "100%" }}>
      {/* Question text */}
      <h2
        style={{
          fontSize: "20px",
          fontWeight: 700,
          color: "#111827",
          lineHeight: "1.4",
          marginBottom: "20px",
        }}
      >
        {question.text}
      </h2>

      {/* Answer options */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {question.options.map((option, i) => {
          const isSelected = selectedIndex === i;
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              style={{
                display: "flex",
                alignItems: "center",
                minHeight: "60px",
                width: "100%",
                padding: "14px 18px",
                textAlign: "left",
                cursor: "pointer",
                borderRadius: "10px",
                border: isSelected
                  ? `2px solid ${accentColor}`
                  : "2px solid #E5E7EB",
                borderLeft: isSelected
                  ? `5px solid ${accentColor}`
                  : "5px solid transparent",
                backgroundColor: isSelected
                  ? `rgba(${rgb}, 0.06)`
                  : "#FFFFFF",
                boxShadow: isSelected
                  ? `0 0 0 1px rgba(${rgb}, 0.15)`
                  : "0 1px 3px rgba(0,0,0,0.06)",
                transition: "all 0.15s ease",
                outline: "none",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = `rgba(${rgb}, 0.4)`;
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = `rgba(${rgb}, 0.02)`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E7EB";
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#FFFFFF";
                }
              }}
            >
              {/* Option letter indicator */}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "28px",
                  height: "28px",
                  minWidth: "28px",
                  borderRadius: "50%",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginRight: "14px",
                  backgroundColor: isSelected ? accentColor : "#F3F4F6",
                  color: isSelected ? "#FFFFFF" : "#6B7280",
                  transition: "all 0.15s ease",
                }}
              >
                {String.fromCharCode(65 + i)}
              </span>

              {/* Option text */}
              <span
                style={{
                  fontSize: "16px",
                  lineHeight: "1.45",
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? "#111827" : "#374151",
                  transition: "all 0.15s ease",
                }}
              >
                {option.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
