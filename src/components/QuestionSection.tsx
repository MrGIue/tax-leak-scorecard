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
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              minHeight: "48px",
              padding: "12px 22px",
              fontSize: "15px",
              fontWeight: 600,
              color: "#6B7580",
              backgroundColor: "transparent",
              border: "1.5px solid #DDE1E8",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.18s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#3D4A5C";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#B0B8C4";
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F5F6F8";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#6B7580";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#DDE1E8";
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
        )}

        <button
          onClick={onNext}
          disabled={!allAnswered}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            minHeight: "54px",
            padding: "15px 36px",
            fontSize: "17px",
            fontWeight: 700,
            color: "#FFFFFF",
            backgroundColor: allAnswered ? accentColor : "#C5CAD3",
            border: "none",
            borderRadius: "10px",
            cursor: allAnswered ? "pointer" : "not-allowed",
            letterSpacing: "0.01em",
            boxShadow: allAnswered ? "0 4px 14px rgba(0,0,0,0.1)" : "none",
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            opacity: allAnswered ? 1 : 0.7,
          }}
          onMouseEnter={(e) => {
            if (allAnswered) {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(0,0,0,0.14)";
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = allAnswered ? "0 4px 14px rgba(0,0,0,0.1)" : "none";
          }}
        >
          {isLastSection ? "See My Results" : "Next"}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M4 9H14M14 9L9.5 4.5M14 9L9.5 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
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
