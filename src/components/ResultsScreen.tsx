"use client";

import { ScorecardConfig, Tier } from "@/lib/types";
import ScoreAnimation from "./ScoreAnimation";

interface ResultsScreenProps {
  config: ScorecardConfig;
  score: number;
  maxScore: number;
  tier: Tier;
}

function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

export default function ResultsScreen({ config, score, maxScore, tier }: ResultsScreenProps) {
  const { branding, bookingUrl, bookingCtaText, clientName } = config;
  const tierRgb = hexToRgb(tier.color);

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "48px 24px 56px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      {/* Score animation */}
      <div style={{ marginBottom: "32px" }}>
        <ScoreAnimation score={score} maxScore={maxScore} color={tier.color} />
      </div>

      {/* Tier badge */}
      <div
        style={{
          display: "inline-block",
          padding: "10px 28px",
          borderRadius: "999px",
          backgroundColor: `rgba(${tierRgb}, 0.15)`,
          marginBottom: "24px",
        }}
      >
        <span
          style={{
            fontSize: "20px",
            fontWeight: 800,
            color: tier.color,
            letterSpacing: "0.3px",
          }}
        >
          {tier.label}
        </span>
      </div>

      {/* Tier message */}
      <p
        style={{
          fontSize: "18px",
          lineHeight: "1.65",
          color: "#374151",
          maxWidth: "500px",
          marginBottom: "44px",
        }}
      >
        {tier.message}
      </p>

      {/* Divider */}
      <div
        style={{
          width: "64px",
          height: "3px",
          borderRadius: "2px",
          backgroundColor: "#E5E7EB",
          marginBottom: "44px",
        }}
      />

      {/* CTA button */}
      <a
        href={bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          maxWidth: "400px",
          minHeight: "56px",
          padding: "16px 40px",
          fontSize: "18px",
          fontWeight: 700,
          color: "#FFFFFF",
          backgroundColor: branding.primaryColor,
          textDecoration: "none",
          borderRadius: "10px",
          boxShadow: "0 4px 18px rgba(0,0,0,0.15)",
          transition: "opacity 0.15s ease, transform 0.15s ease",
          lineHeight: "1.3",
          boxSizing: "border-box",
        } as React.CSSProperties}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.opacity = "0.88";
          (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
          (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
        }}
      >
        {bookingCtaText}
      </a>

      {/* Confirmation note */}
      <p
        style={{
          marginTop: "20px",
          fontSize: "14px",
          color: "#9CA3AF",
          lineHeight: "1.55",
        }}
      >
        Your detailed results have been sent to the {clientName} team.
      </p>
    </div>
  );
}
