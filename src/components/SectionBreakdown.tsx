"use client";

import { ScorecardConfig, AnswerMap } from "@/lib/types";

interface SectionBreakdownProps {
  config: ScorecardConfig;
  answers: AnswerMap;
}

function getSectionScore(
  config: ScorecardConfig,
  sectionIndex: number,
  answers: AnswerMap
): { earned: number; max: number } {
  const section = config.sections[sectionIndex];
  let earned = 0;
  let max = 0;

  for (const q of section.questions) {
    const selectedIndex = answers[q.id];
    if (selectedIndex !== undefined && q.options[selectedIndex]) {
      earned += q.options[selectedIndex].score;
    }
    max += Math.max(...q.options.map((o) => o.score));
  }

  return { earned, max };
}

function getBarColor(percentage: number): string {
  if (percentage >= 0.75) return "#16a34a";
  if (percentage >= 0.5) return "#ca8a04";
  return "#dc2626";
}

function getLabel(percentage: number): string {
  if (percentage >= 0.75) return "Strong";
  if (percentage >= 0.5) return "Moderate";
  return "Needs Attention";
}

export default function SectionBreakdown({ config, answers }: SectionBreakdownProps) {
  return (
    <div style={{ width: "100%" }}>
      <h3
        style={{
          fontSize: "12px",
          fontWeight: 700,
          textTransform: "uppercase" as const,
          letterSpacing: "0.1em",
          color: "#8B95A5",
          marginBottom: "24px",
        }}
      >
        Your Breakdown by Category
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {config.sections.map((section, i) => {
          const { earned, max } = getSectionScore(config, i, answers);
          const percentage = max > 0 ? earned / max : 0;
          const barColor = getBarColor(percentage);
          const label = getLabel(percentage);

          return (
            <div key={i}>
              {/* Section name + score */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: 500,
                    color: "#1B2B3A",
                    lineHeight: 1.3,
                    flex: 1,
                    paddingRight: "12px",
                  }}
                >
                  {section.title}
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: barColor,
                    whiteSpace: "nowrap",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    backgroundColor: `${barColor}10`,
                  }}
                >
                  {label} ({earned}/{max})
                </span>
              </div>

              {/* Bar track */}
              <div
                style={{
                  width: "100%",
                  height: "6px",
                  backgroundColor: "#ECEEF2",
                  borderRadius: "3px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.max(percentage * 100, 3)}%`,
                    height: "100%",
                    backgroundColor: barColor,
                    borderRadius: "3px",
                    transition: "width 0.8s ease-out",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
