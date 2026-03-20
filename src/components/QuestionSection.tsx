"use client";

import { Section, AnswerMap } from "@/lib/types";
import QuestionCard from "./QuestionCard";

interface QuestionSectionProps {
  section: Section;
  answers: AnswerMap;
  onAnswer: (questionId: string, optionIndex: number) => void;
  onNext: () => void;
  onBack?: () => void;
  accentColor: string;
  primaryColor?: string;
  isLastSection: boolean;
}

export default function QuestionSection({
  section,
  answers,
  onAnswer,
  onNext,
  onBack,
  accentColor,
  primaryColor = "#01305C",
  isLastSection,
}: QuestionSectionProps) {
  const allAnswered = section.questions.every((q) => answers[q.id] !== undefined);

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      {/* Section title with left accent bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          marginBottom: "36px",
          paddingBottom: "18px",
          borderBottom: "1px solid #ECEEF2",
        }}
      >
        <div
          style={{
            width: "4px",
            height: "28px",
            borderRadius: "2px",
            backgroundColor: primaryColor,
            flexShrink: 0,
          }}
        />
        <h2
          className="font-display"
          style={{
            fontSize: "clamp(22px, 3vw, 26px)",
            fontWeight: 700,
            color: "#1B2B3A",
            lineHeight: 1.2,
          }}
        >
          {section.title}
        </h2>
      </div>

      {/* Questions */}
      <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
        {section.questions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            selectedIndex={answers[question.id]}
            onSelect={(idx) => onAnswer(question.id, idx)}
            accentColor={accentColor}
            primaryColor={primaryColor}
          />
        ))}
      </div>

      {/* Navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: onBack ? "space-between" : "flex-end",
          marginTop: "44px",
          paddingTop: "24px",
          borderTop: "1px solid #ECEEF2",
          gap: "16px",
        }}
      >
        {onBack && (
          <button
            onClick={onBack}
            style={{
              display: "block",
              minHeight: "48px",
              padding: "12px 24px",
              fontSize: "15px",
              fontWeight: 600,
              color: "#6B7580",
              backgroundColor: "transparent",
              border: "1.5px solid #DDE1E8",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Back
          </button>
        )}

        <button
          onClick={onNext}
          disabled={!allAnswered}
          style={{
            display: "block",
            minHeight: "54px",
            padding: "15px 36px",
            fontSize: "17px",
            fontWeight: 700,
            color: "#FFFFFF",
            backgroundColor: allAnswered ? accentColor : "#C5CAD3",
            border: "none",
            borderRadius: "8px",
            cursor: allAnswered ? "pointer" : "not-allowed",
            opacity: allAnswered ? 1 : 0.6,
          }}
        >
          {isLastSection ? "See My Results" : "Next"}
        </button>
      </div>

      {!allAnswered && (
        <p
          style={{
            marginTop: "10px",
            fontSize: "13px",
            color: "#A0A7B3",
            textAlign: "right",
            fontWeight: 500,
          }}
        >
          Answer all questions above to continue.
        </p>
      )}
    </div>
  );
}
