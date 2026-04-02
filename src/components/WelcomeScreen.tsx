"use client";

import { ScorecardConfig } from "@/lib/types";

interface WelcomeScreenProps {
  config: ScorecardConfig;
  onStart: () => void;
}

export default function WelcomeScreen({ config, onStart }: WelcomeScreenProps) {
  const { branding, scorecardTitle, scorecardDescription, clientName } = config;

  return (
    <div style={{ width: "100%" }}>
      {/* Navy hero header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.primaryColor}E8 100%)`,
          padding: "clamp(44px, 6vw, 72px) clamp(28px, 5vw, 64px)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "13px",
            fontWeight: 600,
            textTransform: "uppercase" as const,
            letterSpacing: "0.16em",
            color: branding.accentColor,
            marginBottom: "14px",
          }}
        >
          {clientName}
        </p>
        <h1
          className="font-display"
          style={{
            fontSize: "clamp(32px, 5vw, 48px)",
            fontWeight: 700,
            color: "#FFFFFF",
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
          }}
        >
          {scorecardTitle}
        </h1>
      </div>

      {/* Sage accent line */}
      <div
        style={{
          height: "3px",
          background: `linear-gradient(90deg, ${branding.accentColor}, ${branding.accentColor}80)`,
        }}
      />

      {/* Content area */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "clamp(40px, 5vw, 64px) clamp(28px, 5vw, 64px) clamp(44px, 5vw, 72px)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "clamp(19px, 2.8vw, 22px)",
            lineHeight: 1.6,
            fontWeight: 400,
            color: "#3D4A5C",
            maxWidth: "520px",
            marginBottom: "24px",
          }}
        >
          {scorecardDescription}
        </p>

        {/* Instructional note for non-retirees */}
        <div
          style={{
            maxWidth: "520px",
            padding: "14px 20px",
            marginBottom: "36px",
            borderRadius: "8px",
            backgroundColor: `${branding.accentColor}12`,
            borderLeft: `3px solid ${branding.accentColor}`,
            textAlign: "left",
          }}
        >
          <p style={{ fontSize: "14px", lineHeight: 1.5, color: "#3D4A5C", margin: 0 }}>
            <strong style={{ color: branding.primaryColor }}>Not yet retired?</strong>{" "}
            Answer as if you were taking distributions today.
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={onStart}
          style={{
            display: "block",
            width: "100%",
            maxWidth: "380px",
            minHeight: "56px",
            padding: "16px 40px",
            fontSize: "18px",
            fontWeight: 700,
            color: "#FFFFFF",
            backgroundColor: branding.accentColor,
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Get Started
        </button>

        {/* Time estimate badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginTop: "20px",
            padding: "6px 14px",
            borderRadius: "20px",
            backgroundColor: "#F0F2F5",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="6" stroke="#8B95A5" strokeWidth="1.2"/>
            <path d="M7 4V7.5L9.5 9" stroke="#8B95A5" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: "13px", color: "#6B7580", fontWeight: 500 }}>
            Takes about 3 minutes
          </span>
        </div>
      </div>
    </div>
  );
}
