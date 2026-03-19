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
      {/* Navy hero section */}
      <div
        style={{
          background: `linear-gradient(145deg, ${branding.primaryColor} 0%, ${branding.primaryColor}E0 100%)`,
          padding: "clamp(36px, 5vw, 56px) clamp(24px, 4vw, 48px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* Label */}
        <h2
          style={{
            fontSize: "12px",
            fontWeight: 600,
            textTransform: "uppercase" as const,
            letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.55)",
            marginBottom: "28px",
          }}
        >
          Your Tax Leak Score
        </h2>

        {/* Score Ring — larger, on navy */}
        <ScoreRing
          score={score}
          maxScore={maxScore}
          color={tier.color}
          size={220}
          lightText={true}
        />

        {/* Tier Badge */}
        <div
          style={{
            marginTop: "28px",
            padding: "8px 28px",
            borderRadius: "999px",
            backgroundColor: `rgba(${hexToRgb(tier.color)}, 0.2)`,
            border: `1.5px solid rgba(${hexToRgb(tier.color)}, 0.4)`,
          }}
        >
          <span
            style={{
              fontSize: "16px",
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
            fontSize: "16px",
            lineHeight: 1.65,
            color: "rgba(255,255,255,0.78)",
            maxWidth: "460px",
          }}
        >
          {tier.message}
        </p>
      </div>

      {/* Section Breakdown */}
      <div style={{ padding: "clamp(32px, 4vw, 44px) clamp(24px, 4vw, 48px)" }}>
        <SectionBreakdown config={config} answers={answers} />
      </div>

      {/* Separator */}
      <div style={{ height: "1px", backgroundColor: "#ECEEF2", margin: "0 clamp(24px, 4vw, 48px)" }} />

      {/* CTA Section */}
      <div
        style={{
          padding: "clamp(32px, 4vw, 44px) clamp(24px, 4vw, 48px) clamp(36px, 5vw, 52px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <h3
          className="font-display"
          style={{
            fontSize: "clamp(22px, 3vw, 28px)",
            fontWeight: 700,
            color: "#1B2B3A",
            marginBottom: "10px",
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
            fontSize: "15px",
            lineHeight: 1.65,
            color: "#6B7580",
            maxWidth: "460px",
            marginBottom: "32px",
          }}
        >
          {percentage < 60
            ? "Your score suggests meaningful tax savings are available. A complimentary review with our team can identify exactly where \u2014 and how much \u2014 you could keep."
            : percentage < 83
            ? "You\u2019re doing several things right, but a few gaps could be costing you. A quick conversation can pinpoint the opportunities."
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
            gap: "10px",
            width: "100%",
            maxWidth: "440px",
            minHeight: "60px",
            padding: "18px 40px",
            fontSize: "18px",
            fontWeight: 700,
            color: "#FFFFFF",
            backgroundColor: branding.primaryColor,
            textDecoration: "none",
            borderRadius: "10px",
            boxShadow: `0 4px 20px rgba(${hexToRgb(branding.primaryColor)}, 0.25)`,
            transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 6px 28px rgba(${hexToRgb(branding.primaryColor)}, 0.32)`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 4px 20px rgba(${hexToRgb(branding.primaryColor)}, 0.25)`;
          }}
        >
          {bookingCtaText}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M4.5 10H15.5M15.5 10L10.5 5M15.5 10L10.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>

        {/* Confirmation note */}
        <p
          style={{
            marginTop: "20px",
            fontSize: "13px",
            color: "#A0A7B3",
            lineHeight: 1.5,
          }}
        >
          Your detailed results have been sent to the {clientName} team.
        </p>
      </div>
    </div>
  );
}
