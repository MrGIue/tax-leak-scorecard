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
            marginBottom: "44px",
          }}
        >
          {scorecardDescription}
        </p>

        {/* CTA Button */}
        <button
          onClick={onStart}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            width: "100%",
            maxWidth: "380px",
            minHeight: "60px",
            padding: "18px 44px",
            fontSize: "18px",
            fontWeight: 700,
            color: "#FFFFFF",
            backgroundColor: branding.accentColor,
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            letterSpacing: "0.01em",
            boxShadow: `0 4px 16px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)`,
            transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 24px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)";
          }}
        >
          Get Started
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M4.5 10H15.5M15.5 10L10.5 5M15.5 10L10.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
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
