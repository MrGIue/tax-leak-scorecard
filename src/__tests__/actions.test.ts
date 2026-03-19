import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ScorecardConfig, AnswerMap, ContactInfo } from "@/lib/types";

// Minimal config for testing
const mockConfig: ScorecardConfig = {
  clientSlug: "test-client",
  clientName: "Test Client",
  scorecardTitle: "Test Scorecard",
  scorecardDescription: "Test",
  branding: { primaryColor: "#000", accentColor: "#fff" },
  bookingUrl: "https://example.com/book",
  bookingCtaText: "Book Now",
  webhookEnvKey: "WEBHOOK_URL_TEST_CLIENT",
  sections: [
    {
      title: "Section 1",
      questions: [
        {
          id: "q1",
          text: "Question 1",
          options: [
            { text: "Option A", score: 3 },
            { text: "Option B", score: 1 },
          ],
        },
      ],
    },
  ],
  tiers: [
    { label: "Low Risk", min: 2, max: 3, color: "#16a34a", message: "Good" },
    { label: "High Risk", min: 0, max: 1, color: "#dc2626", message: "Bad" },
  ],
};

const mockContact: ContactInfo = {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
};

const mockAnswers: AnswerMap = { q1: 0 }; // score: 3

describe("submitResults", () => {
  let submitResults: (
    config: ScorecardConfig,
    contact: ContactInfo,
    answers: AnswerMap
  ) => Promise<{ success: boolean }>;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import("@/lib/actions");
    submitResults = mod.submitResults;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns { success: false } when env var is missing", async () => {
    // Ensure env var is not set
    delete process.env["WEBHOOK_URL_TEST_CLIENT"];

    const result = await submitResults(mockConfig, mockContact, mockAnswers);

    expect(result).toEqual({ success: false });
  });

  it("returns { success: true } on successful POST", async () => {
    process.env["WEBHOOK_URL_TEST_CLIENT"] = "https://hook.make.com/test";

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await submitResults(mockConfig, mockContact, mockAnswers);

    expect(result).toEqual({ success: true });
    expect(mockFetch).toHaveBeenCalledOnce();
    expect(mockFetch).toHaveBeenCalledWith(
      "https://hook.make.com/test",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );
  });

  it("returns { success: false } on network error without throwing", async () => {
    process.env["WEBHOOK_URL_TEST_CLIENT"] = "https://hook.make.com/test";

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network failure")));

    const result = await submitResults(mockConfig, mockContact, mockAnswers);

    expect(result).toEqual({ success: false });
  });
});
