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

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col items-center justify-center px-4 py-10">
      <h1
        style={{
          fontSize: "clamp(26px, 4vw, 34px)",
          fontWeight: 700,
          color: config.branding.primaryColor,
          letterSpacing: "-0.5px",
          marginBottom: "24px",
          textAlign: "center",
        }}
      >
        {config.scorecardTitle}
      </h1>

      {currentProgressStep !== null && (
        <div className="w-full max-w-[720px] mb-6">
          <ProgressBar
            currentStep={currentProgressStep}
            labels={progressLabels}
            accentColor={config.branding.accentColor}
          />
        </div>
      )}

      <div key={JSON.stringify(step)} className="w-full max-w-[720px] mx-auto p-6 md:p-10 bg-white rounded-2xl shadow-sm min-h-[400px]">
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
    </div>
  );
}
