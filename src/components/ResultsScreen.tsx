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
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  return (
    <div style={{ width: "100%" }}>
      {/* Navy hero — compact, horizontal layout */}
      <div
        style={{
          background: `linear-gradient(145deg, ${branding.primaryColor} 0%, ${branding.primaryColor}E0 100%)`,
          padding: "clamp(24px, 3vw, 36px) clamp(24px, 4vw, 48px)",
          display: "flex",
          alignItems: "center",
          gap: "clamp(20px, 3vw, 36px)",
          flexWrap: "wrap" as const,
          justifyContent: "center",
        }}
      >
        {/* Score Ring — compact */}
        <div style={{ flexShrink: 0 }}>
          <ScoreRing
            score={score}
            maxScore={maxScore}
            color={tier.color}
            size={150}
            lightText={true}
          />
        </div>

        {/* Tier info — beside the ring */}
        <div
          style={{
            flex: "1 1 240px",
            minWidth: 0,
            textAlign: "left",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase" as const,
              letterSpacing: "0.14em",
              color: "rgba(255,255,255,0.5)",
              marginBottom: "8px",
            }}
          >
            Your Tax Leak Score
          </p>

          {/* Tier Badge */}
          <div
            style={{
              display: "inline-block",
              padding: "5px 18px",
              borderRadius: "999px",
              backgroundColor: `rgba(${hexToRgb(tier.color)}, 0.2)`,
              border: `1.5px solid rgba(${hexToRgb(tier.color)}, 0.4)`,
              marginBottom: "12px",
            }}
          >
            <span
              style={{
                fontSize: "15px",
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
              fontSize: "14px",
              lineHeight: 1.55,
              color: "rgba(255,255,255,0.85)",
              maxWidth: "380px",
            }}
          >
            {tier.message}
          </p>
        </div>
      </div>

      {/* Section Breakdown — tighter */}
      <div style={{ padding: "clamp(20px, 3vw, 28px) clamp(24px, 4vw, 48px)" }}>
        <SectionBreakdown config={config} answers={answers} compact />
      </div>

      {/* CTA Section — compact */}
      <div
        style={{
          padding: "clamp(16px, 2vw, 24px) clamp(24px, 4vw, 48px) clamp(24px, 3vw, 32px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          backgroundColor: "#FAFBFC",
          borderTop: "1px solid #ECEEF2",
          borderRadius: "0 0 16px 16px",
        }}
      >
        <h3
          className="font-display"
          style={{
            fontSize: "clamp(18px, 2.5vw, 22px)",
            fontWeight: 700,
            color: "#1B2B3A",
            marginBottom: "6px",
            lineHeight: 1.25,
          }}
        >
          {percentage < 60
            ? "Don\u2019t Leave Money on the Table"
            : percentage < 83
            ? "There\u2019s Room to Optimize"
            : "Confirm Your Strategy Is Airtight"}
        </h3>

        <p
          style={{
            fontSize: "14px",
            lineHeight: 1.5,
            color: "#6B7580",
            maxWidth: "440px",
            marginBottom: "18px",
          }}
        >
          {percentage < 60
            ? "A complimentary review can identify exactly where you could save."
            : percentage < 83
            ? "A quick conversation can pinpoint the opportunities."
            : "A brief check-in can confirm nothing is being overlooked."}
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
            minHeight: "54px",
            padding: "15px 36px",
            fontSize: "17px",
            fontWeight: 700,
            color: "#FFFFFF",
            backgroundColor: branding.primaryColor,
            textDecoration: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          {bookingCtaText}
        </a>

        {/* Confirmation note */}
        <p
          style={{
            marginTop: "12px",
            fontSize: "12px",
            color: "#A0A7B3",
            lineHeight: 1.4,
          }}
        >
          Your results have been sent to the {clientName} team.
        </p>
      </div>
    </div>
  );
}
