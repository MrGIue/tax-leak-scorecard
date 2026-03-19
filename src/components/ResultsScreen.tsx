"use client";

import { ScorecardConfig, Tier, AnswerMap } from "@/lib/types";
import ScoreRing from "./ScoreRing";
import SectionBreakdown from "./SectionBreakdown";

interface ResultsScreenProps {
  config: ScorecardConfig;
  score: number;
  maxScore: number;
  tier: Tier;
  answers: AnswerMap;
}

function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

export default function ResultsScreen({
  config,
  score,
  maxScore,
  tier,
  answers,
}: ResultsScreenProps) {
  const { branding, bookingUrl, bookingCtaText, clientName } = config;
  const tierRgb = hexToRgb(tier.color);
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  return (
    <div
      style={{
        maxWidth: "640px",
        margin: "0 auto",
        padding: "16px 0 24px",
      }}
    >
      {/* ── Hero: Score Ring + Tier ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "32px 24px 40px",
        }}
      >
        {/* Heading */}
        <h2
          style={{
            fontSize: "14px",
            fontWeight: 600,
            textTransform: "uppercase" as const,
            letterSpacing: "0.1em",
            color: "#9CA3AF",
            marginBottom: "28px",
          }}
        >
          Your Tax Leak Score
        </h2>

        {/* Score Ring */}
        <ScoreRing score={score} maxScore={maxScore} color={tier.color} size={200} />

        {/* Tier Badge */}
        <div
          style={{
            marginTop: "28px",
            padding: "10px 32px",
            borderRadius: "999px",
            backgroundColor: `rgba(${tierRgb}, 0.12)`,
            border: `1.5px solid rgba(${tierRgb}, 0.25)`,
          }}
        >
          <span
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: tier.color,
              letterSpacing: "0.02em",
            }}
          >
            {tier.label}
          </span>
        </div>

        {/* Tier message */}
        <p
          style={{
            marginTop: "20px",
            fontSize: "17px",
            lineHeight: 1.65,
            color: "#374151",
            maxWidth: "480px",
          }}
        >
          {tier.message}
        </p>
      </div>

      {/* ── Separator ── */}
      <div
        style={{
          height: "1px",
          backgroundColor: "#E5E7EB",
          margin: "0 24px",
        }}
      />

      {/* ── Section Breakdown ── */}
      <div style={{ padding: "36px 24px" }}>
        <SectionBreakdown config={config} answers={answers} />
      </div>

      {/* ── Separator ── */}
      <div
        style={{
          height: "1px",
          backgroundColor: "#E5E7EB",
          margin: "0 24px",
        }}
      />

      {/* ── CTA Section ── */}
      <div
        style={{
          padding: "40px 24px 32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* Context-aware CTA headline */}
        <h3
          style={{
            fontSize: "22px",
            fontWeight: 700,
            color: "#111827",
            marginBottom: "10px",
            lineHeight: 1.3,
          }}
        >
          {percentage < 60
            ? "Don't Leave Money on the Table"
            : percentage < 83
            ? "There's Room to Optimize"
            : "Confirm Your Strategy Is Airtight"}
        </h3>

        <p
          style={{
            fontSize: "15px",
            lineHeight: 1.6,
            color: "#6B7280",
            maxWidth: "440px",
            marginBottom: "28px",
          }}
        >
          {percentage < 60
            ? "Your score suggests meaningful tax savings are available. A complimentary review with our team can identify exactly where — and how much — you could keep."
            : percentage < 83
            ? "You're doing several things right, but a few gaps could be costing you. A quick conversation can pinpoint the opportunities."
            : "Your tax strategy is strong. A brief check-in can confirm nothing is being overlooked as rules and markets change."}
        </p>

        {/* CTA Button */}
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            maxWidth: "420px",
            minHeight: "58px",
            padding: "16px 40px",
            fontSize: "18px",
            fontWeight: 700,
            color: "#FFFFFF",
            backgroundColor: branding.primaryColor,
            textDecoration: "none",
            borderRadius: "10px",
            boxShadow: `0 4px 20px rgba(${hexToRgb(branding.primaryColor)}, 0.3)`,
            transition: "opacity 0.15s ease, transform 0.15s ease",
            lineHeight: 1.3,
            boxSizing: "border-box" as const,
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.opacity = "0.9";
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
            marginTop: "18px",
            fontSize: "13px",
            color: "#9CA3AF",
            lineHeight: 1.5,
          }}
        >
          Your detailed results have been sent to the {clientName} team.
        </p>
      </div>
    </div>
  );
}
