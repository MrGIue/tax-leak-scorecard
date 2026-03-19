import { describe, it, expect } from "vitest";
import { calculateScore, getTier, calculateMaxScore } from "@/lib/scoring";
import { ScorecardConfig, AnswerMap } from "@/lib/types";

const mockConfig: ScorecardConfig = {
  clientSlug: "test",
  clientName: "Test",
  scorecardTitle: "Test",
  scorecardDescription: "Test",
  branding: { primaryColor: "#000", accentColor: "#fff" },
  bookingUrl: "https://example.com",
  bookingCtaText: "Book",
  webhookEnvKey: "WEBHOOK_URL_TEST",
  sections: [
    {
      title: "Section 1",
      questions: [
        { id: "q1", text: "Q1", options: [{ text: "A", score: 3 }, { text: "B", score: 1 }, { text: "C", score: 0 }] },
        { id: "q2", text: "Q2", options: [{ text: "A", score: 3 }, { text: "B", score: 2 }] },
      ],
    },
    {
      title: "Section 2",
      questions: [
        { id: "q3", text: "Q3", options: [{ text: "A", score: 3 }, { text: "B", score: 0 }] },
      ],
    },
  ],
  tiers: [
    { label: "Low", min: 7, max: 9, color: "#16a34a", message: "Good" },
    { label: "Medium", min: 4, max: 6, color: "#ca8a04", message: "OK" },
    { label: "High", min: 0, max: 3, color: "#dc2626", message: "Bad" },
  ],
};

describe("calculateScore", () => {
  it("sums scores from selected answers", () => {
    const answers: AnswerMap = { q1: 0, q2: 1, q3: 0 }; // scores: 3, 2, 3
    expect(calculateScore(mockConfig, answers)).toBe(8);
  });

  it("returns 0 for empty answers", () => {
    expect(calculateScore(mockConfig, {})).toBe(0);
  });

  it("handles partial answers", () => {
    const answers: AnswerMap = { q1: 2 }; // score: 0
    expect(calculateScore(mockConfig, answers)).toBe(0);
  });
});

describe("calculateMaxScore", () => {
  it("sums the max score per question", () => {
    expect(calculateMaxScore(mockConfig)).toBe(9); // 3 + 3 + 3
  });
});

describe("getTier", () => {
  it("returns correct tier for high score", () => {
    const tier = getTier(mockConfig, 8);
    expect(tier.label).toBe("Low");
  });

  it("returns correct tier for mid score", () => {
    const tier = getTier(mockConfig, 5);
    expect(tier.label).toBe("Medium");
  });

  it("returns correct tier for low score", () => {
    const tier = getTier(mockConfig, 2);
    expect(tier.label).toBe("High");
  });
});
