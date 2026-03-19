"use client";

import { ScorecardConfig } from "@/lib/types";

interface WelcomeScreenProps {
  config: ScorecardConfig;
  onStart: () => void;
}

export default function WelcomeScreen({ config, onStart }: WelcomeScreenProps) {
  const { branding, scorecardTitle, scorecardDescription, clientName } = config;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100%",
        padding: "48px 24px",
        textAlign: "center",
        maxWidth: "640px",
        margin: "0 auto",
      }}
    >
      {/* Title */}
      <h1
        style={{
          fontSize: "clamp(32px, 5vw, 40px)",
          fontWeight: 800,
          color: "#111827",
          lineHeight: "1.2",
          letterSpacing: "-0.5px",
          marginBottom: "20px",
        }}
      >
        {scorecardTitle}
      </h1>

      {/* Description */}
      <p
        style={{
          fontSize: "18px",
          lineHeight: "1.65",
          color: "#4B5563",
          marginBottom: "48px",
          maxWidth: "520px",
        }}
      >
        {scorecardDescription}
      </p>

      {/* Start button */}
      <button
        onClick={onStart}
        style={{
          display: "block",
          width: "100%",
          maxWidth: "360px",
          minHeight: "56px",
          padding: "16px 40px",
          fontSize: "18px",
          fontWeight: 700,
          color: "#FFFFFF",
          backgroundColor: branding.primaryColor,
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          letterSpacing: "0.2px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
          transition: "opacity 0.15s ease, transform 0.15s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.opacity = "0.88";
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.opacity = "1";
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
        }}
      >
        Get Started
      </button>

      {/* Estimated time */}
      <p
        style={{
          marginTop: "16px",
          fontSize: "14px",
          color: "#9CA3AF",
        }}
      >
        Takes about 3 minutes
      </p>
    </div>
  );
}
