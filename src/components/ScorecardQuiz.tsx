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
  const accentColor = config.branding.accentColor;

  const isWelcome = step.type === "welcome";
  const isResults = step.type === "results";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: isResults ? "clamp(16px, 2vh, 28px)" : isWelcome ? "clamp(48px, 8vh, 100px)" : "clamp(32px, 5vh, 60px)",
        paddingBottom: isResults ? "24px" : "48px",
        paddingLeft: "16px",
        paddingRight: "16px",
        background: "#F5F6F8",
      }}
    >
      {/* Title lockup — shown on welcome and quiz steps, hidden on results */}
      {!isResults && (
        <div
          className="animate-fade-in"
          style={{
            textAlign: "center",
            marginBottom: isWelcome ? "0" : "24px",
            display: isWelcome ? "none" : "block",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase" as const,
              letterSpacing: "0.14em",
              color: accentColor,
              marginBottom: "6px",
            }}
          >
            {config.clientName}
          </p>
          <h1
            className="font-display"
            style={{
              fontSize: "clamp(24px, 3.5vw, 30px)",
              fontWeight: 700,
              color: primaryColor,
              lineHeight: 1.2,
            }}
          >
            {config.scorecardTitle}
          </h1>
        </div>
      )}

      {/* Progress bar — during quiz steps */}
      {currentProgressStep !== null && (
        <div
          style={{
            width: "100%",
            maxWidth: "840px",
            marginBottom: "20px",
          }}
        >
          <ProgressBar
            currentStep={currentProgressStep}
            labels={progressLabels}
            accentColor={accentColor}
            primaryColor={primaryColor}
          />
        </div>
      )}

      {/* Main content card */}
      <div
        key={JSON.stringify(step)}
        className="animate-fade-in"
        style={{
          width: "100%",
          maxWidth: "840px",
          backgroundColor: "#FFFFFF",
          borderRadius: isResults ? "16px" : "14px",
          overflow: "hidden",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)",
        }}
      >
        {step.type === "welcome" && (
          <WelcomeScreen config={config} onStart={handleStart} />
        )}

        {step.type === "contact" && (
          <div style={{ padding: "clamp(28px, 4vw, 48px) clamp(24px, 4vw, 56px)" }}>
            <ContactForm
              onSubmit={handleContactSubmit}
              accentColor={accentColor}
            />
          </div>
        )}

        {step.type === "section" && (
          <div style={{ padding: "clamp(28px, 4vw, 48px) clamp(24px, 4vw, 56px)" }}>
            <QuestionSection
              section={config.sections[step.index]}
              answers={answers}
              onAnswer={handleAnswer}
              onNext={handleNext}
              onBack={handleBack}
              accentColor={accentColor}
              primaryColor={primaryColor}
              isLastSection={step.index === config.sections.length - 1}
            />
          </div>
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

      {/* Footer */}
      <p
        style={{
          marginTop: "24px",
          fontSize: "12px",
          color: "#A0A7B3",
          textAlign: "center",
          letterSpacing: "0.02em",
        }}
      >
        Powered by {config.clientName}
      </p>
    </div>
  );
}
