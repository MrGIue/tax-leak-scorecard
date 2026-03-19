"use client";

import React, { useState, useRef } from "react";
import { ScorecardConfig, QuizStep, AnswerMap, ContactInfo } from "@/lib/types";
import { calculateScore, calculateMaxScore, getTier } from "@/lib/scoring";
import { submitResults } from "@/lib/actions";
import WelcomeScreen from "./WelcomeScreen";
import ContactForm from "./ContactForm";
import QuestionSection from "./QuestionSection";
import ResultsScreen from "./ResultsScreen";
import ProgressBar from "./ProgressBar";

interface ScorecardQuizProps {
  config: ScorecardConfig;
}

export default function ScorecardQuiz({ config }: ScorecardQuizProps) {
  const [step, setStep] = useState<QuizStep>({ type: "welcome" });
  const [contact, setContact] = useState<ContactInfo>({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [score, setScore] = useState<number | null>(null);

  const submitted = useRef<boolean>(false);

  const progressLabels = [
    "Contact Info",
    ...config.sections.map((s) => s.title),
  ];

  const currentProgressStep =
    step.type === "contact"
      ? 0
      : step.type === "section"
      ? step.index + 1
      : null;

  function handleStart() {
    setStep({ type: "contact" });
  }

  function handleContactSubmit(info: ContactInfo) {
    setContact(info);
    setStep({ type: "section", index: 0 });
  }

  function handleAnswer(questionId: string, optionIndex: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  }

  function handleNext() {
    if (step.type !== "section") return;

    const isLast = step.index === config.sections.length - 1;

    if (isLast) {
      if (submitted.current) {
        setStep({ type: "results" });
        return;
      }

      const calculatedScore = calculateScore(config, answers);
      const tier = getTier(config, calculatedScore);

      submitted.current = true;

      // Fire and forget — do not await or block the UI
      submitResults(config, contact, answers);

      setScore(calculatedScore);
      setStep({ type: "results" });
    } else {
      setStep({ type: "section", index: step.index + 1 });
    }
  }

  function handleBack() {
    if (step.type !== "section") return;

    if (step.index === 0) {
      setStep({ type: "contact" });
    } else {
      setStep({ type: "section", index: step.index - 1 });
    }
  }

  const maxScore = calculateMaxScore(config);
  const tier =
    score !== null ? getTier(config, score) : null;

  const primaryColor = config.branding.primaryColor;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
        background: `linear-gradient(145deg, ${primaryColor}08 0%, #f0f2f5 35%, #f8f9fb 60%, ${primaryColor}05 100%)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle background decoration */}
      <div
        style={{
          position: "absolute",
          top: "-120px",
          right: "-120px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${primaryColor}06, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-80px",
          left: "-80px",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${config.branding.accentColor}08, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Title + subtitle lockup */}
      <div style={{ textAlign: "center", marginBottom: "28px", position: "relative" }}>
        <p
          style={{
            fontSize: "13px",
            fontWeight: 600,
            textTransform: "uppercase" as const,
            letterSpacing: "0.12em",
            color: config.branding.accentColor,
            marginBottom: "8px",
          }}
        >
          {config.clientName}
        </p>
        <h1
          style={{
            fontSize: "clamp(28px, 4.5vw, 38px)",
            fontWeight: 700,
            color: primaryColor,
            letterSpacing: "-0.5px",
            lineHeight: 1.15,
          }}
        >
          {config.scorecardTitle}
        </h1>
      </div>

      {/* Progress bar */}
      {currentProgressStep !== null && (
        <div style={{ width: "100%", maxWidth: "720px", marginBottom: "24px", position: "relative" }}>
          <ProgressBar
            currentStep={currentProgressStep}
            labels={progressLabels}
            accentColor={config.branding.accentColor}
          />
        </div>
      )}

      {/* Main card */}
      <div
        key={JSON.stringify(step)}
        style={{
          width: "100%",
          maxWidth: "720px",
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          padding: "24px",
          minHeight: "400px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)",
          borderTop: `3px solid ${primaryColor}`,
          position: "relative",
        }}
        className="md:p-10"
      >
        {step.type === "welcome" && (
          <WelcomeScreen config={config} onStart={handleStart} />
        )}

        {step.type === "contact" && (
          <ContactForm
            onSubmit={handleContactSubmit}
            accentColor={config.branding.accentColor}
          />
        )}

        {step.type === "section" && (
          <QuestionSection
            section={config.sections[step.index]}
            answers={answers}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onBack={handleBack}
            accentColor={config.branding.accentColor}
            isLastSection={step.index === config.sections.length - 1}
          />
        )}

        {step.type === "results" && score !== null && tier !== null && (
          <ResultsScreen
            config={config}
            score={score}
            maxScore={maxScore}
            tier={tier}
            answers={answers}
          />
        )}
      </div>

      {/* Footer note */}
      <p
        style={{
          marginTop: "20px",
          fontSize: "12px",
          color: "#B0B5BE",
          textAlign: "center",
          position: "relative",
        }}
      >
        Powered by {config.clientName}
      </p>
    </div>
  );
}
