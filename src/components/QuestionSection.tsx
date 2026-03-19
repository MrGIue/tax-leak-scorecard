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
  isLastSection: boolean;
}

export default function QuestionSection({
  section,
  answers,
  onAnswer,
  onNext,
  onBack,
  accentColor,
  isLastSection,
}: QuestionSectionProps) {
  const allAnswered = section.questions.every((q) => answers[q.id] !== undefined);

  return (
    <div
      style={{
        maxWidth: "680px",
        margin: "0 auto",
        padding: "40px 24px 48px",
      }}
    >
      {/* Section title */}
      <h2
        style={{
          fontSize: "24px",
          fontWeight: 800,
          color: "#111827",
          marginBottom: "32px",
          letterSpacing: "-0.3px",
          paddingBottom: "16px",
          borderBottom: "2px solid #F3F4F6",
        }}
      >
        {section.title}
      </h2>

      {/* Questions */}
      <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
        {section.questions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            selectedIndex={answers[question.id]}
            onSelect={(idx) => onAnswer(question.id, idx)}
            accentColor={accentColor}
          />
        ))}
      </div>

      {/* Navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: onBack ? "space-between" : "flex-end",
          marginTop: "48px",
          gap: "16px",
        }}
      >
        {/* Back button — only shown when onBack is provided */}
        {onBack && (
          <button
            onClick={onBack}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              minHeight: "48px",
              padding: "12px 20px",
              fontSize: "16px",
              fontWeight: 600,
              color: "#6B7280",
              backgroundColor: "transparent",
              border: "2px solid #E5E7EB",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "color 0.15s ease, border-color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#374151";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#9CA3AF";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#6B7280";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E7EB";
            }}
          >
            ← Back
          </button>
        )}

        {/* Next / See Results button */}
        <button
          onClick={onNext}
          disabled={!allAnswered}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            minHeight: "52px",
            padding: "14px 32px",
            fontSize: "17px",
            fontWeight: 700,
            color: "#FFFFFF",
            backgroundColor: allAnswered ? accentColor : "#D1D5DB",
            border: "none",
            borderRadius: "8px",
            cursor: allAnswered ? "pointer" : "not-allowed",
            letterSpacing: "0.2px",
            boxShadow: allAnswered ? "0 4px 14px rgba(0,0,0,0.13)" : "none",
            transition: "opacity 0.15s ease, transform 0.15s ease, background-color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            if (allAnswered) {
              (e.currentTarget as HTMLButtonElement).style.opacity = "0.88";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = "1";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
          }}
        >
          {isLastSection ? "See My Results →" : "Next →"}
        </button>
      </div>

      {/* Prompt to answer remaining questions */}
      {!allAnswered && (
        <p
          style={{
            marginTop: "12px",
            fontSize: "14px",
            color: "#9CA3AF",
            textAlign: "right",
          }}
        >
          Answer all questions above to continue.
        </p>
      )}
    </div>
  );
}
