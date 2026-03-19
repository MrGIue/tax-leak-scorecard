# Tax Leak Scorecard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a multi-tenant, config-driven scored quiz app. First client: Bob Ward / Oaks Financial Services — 12-question "Tax Leak Scorecard."

**Architecture:** Next.js 14+ App Router with TypeScript. Config-driven via JSON files per client. Dynamic routes via `[clientSlug]`. Webhook notifications via Next.js server action calling Make.com. Stateless — no database.

**Tech Stack:** Next.js 14+, TypeScript, Tailwind CSS, Vercel, Make.com webhooks

**Spec:** `docs/superpowers/specs/2026-03-19-tax-leak-scorecard-design.md`

---

## File Map

| File | Responsibility |
|------|---------------|
| `src/lib/types.ts` | All TypeScript interfaces (ScorecardConfig, Section, Question, Option, Tier, QuizState, AnswerMap) |
| `src/lib/scoring.ts` | calculateScore(), getTier() — pure functions, no side effects |
| `src/lib/config.ts` | loadConfig(), getAllClientSlugs() — reads JSON configs at build time |
| `src/lib/actions.ts` | submitResults() server action — reads webhook URL from env, POSTs to Make.com. (Spec names this `webhook.ts`; renamed to `actions.ts` to follow Next.js server action conventions — either name works.) |
| `src/configs/oaks.json` | Bob Ward's full 12-question scorecard config |
| `src/components/WelcomeScreen.tsx` | Branded intro screen with "Start" CTA |
| `src/components/ContactForm.tsx` | First name, last name, email — validates before proceeding |
| `src/components/ProgressBar.tsx` | Visual step indicator across sections |
| `src/components/QuestionCard.tsx` | Single question with selectable answer cards |
| `src/components/QuestionSection.tsx` | Renders all questions in a section, back/next navigation |
| `src/components/ScoreAnimation.tsx` | Animated counter that counts up to the final score |
| `src/components/ResultsScreen.tsx` | Tier badge, message, score animation, booking CTA |
| `src/components/ScorecardQuiz.tsx` | Main client component — quiz state machine, orchestrates all screens |
| `src/app/layout.tsx` | Root layout with fonts and metadata |
| `src/app/page.tsx` | Root page — 404/redirect |
| `src/app/[clientSlug]/page.tsx` | Dynamic route — loads config, renders ScorecardQuiz |
| `src/__tests__/scoring.test.ts` | Tests for scoring logic |
| `src/__tests__/actions.test.ts` | Tests for webhook server action |

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `.gitignore`, `src/app/layout.tsx`, `src/app/globals.css`

- [ ] **Step 1: Initialize Next.js project**

Run: `cd ~/projects/tax-leak-scorecard && npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack`

Note: Project directory already has a git repo and docs folder. The scaffolder may ask about existing files — accept overwrite for config files, it won't touch docs/.

- [ ] **Step 2: Verify the scaffold works**

Run: `cd ~/projects/tax-leak-scorecard && npm run dev`
Expected: Dev server starts on localhost:3000, default Next.js page loads.
Kill the dev server after verifying.

- [ ] **Step 3: Clean up boilerplate**

Remove the default content from `src/app/page.tsx` (replace with a simple "Not Found" message — this is the root route which shows 404 per spec). Remove default styles from `src/app/globals.css` except the Tailwind directives.

`src/app/page.tsx`:
```tsx
export default function RootPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-semibold text-gray-600">Page not found</h1>
    </div>
  );
}
```

`src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 4: Commit**

```bash
cd ~/projects/tax-leak-scorecard
git add -A
git commit -m "Scaffold Next.js project with TypeScript and Tailwind"
```

---

## Task 2: Types and Config Loader

**Files:**
- Create: `src/lib/types.ts`, `src/lib/config.ts`

- [ ] **Step 1: Create types**

`src/lib/types.ts`:
```typescript
export interface ScorecardConfig {
  clientSlug: string;
  clientName: string;
  scorecardTitle: string;
  scorecardDescription: string;
  branding: {
    primaryColor: string;
    accentColor: string;
    logo?: string;
  };
  bookingUrl: string;
  bookingCtaText: string;
  webhookEnvKey: string;
  sections: Section[];
  tiers: Tier[];
}

export interface Section {
  title: string;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
}

export interface Option {
  text: string;
  score: number;
}

export interface Tier {
  label: string;
  min: number;
  max: number;
  color: string;
  message: string;
}

export type AnswerMap = Record<string, number>; // questionId -> selected option index

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
}

export type QuizStep =
  | { type: "welcome" }
  | { type: "contact" }
  | { type: "section"; index: number }
  | { type: "results" };
```

- [ ] **Step 2: Create config loader**

`src/lib/config.ts`:
```typescript
import fs from "fs";
import path from "path";
import { ScorecardConfig } from "./types";

const configDir = path.join(process.cwd(), "src", "configs");

export function getAllClientSlugs(): string[] {
  const files = fs.readdirSync(configDir);
  return files
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""));
}

export function loadConfig(slug: string): ScorecardConfig | null {
  const filePath = path.join(configDir, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as ScorecardConfig;
}
```

- [ ] **Step 3: Commit**

```bash
cd ~/projects/tax-leak-scorecard
git add src/lib/types.ts src/lib/config.ts
git commit -m "Add TypeScript types and config loader"
```

---

## Task 3: Scoring Logic (TDD)

**Files:**
- Create: `src/lib/scoring.ts`, `src/__tests__/scoring.test.ts`

- [ ] **Step 1: Install test dependencies**

Run: `cd ~/projects/tax-leak-scorecard && npm install -D vitest @testing-library/react @testing-library/jest-dom`

Add to `package.json` scripts: `"test": "vitest run", "test:watch": "vitest"`

Create `vitest.config.ts`:
```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 2: Write failing tests**

`src/__tests__/scoring.test.ts`:
```typescript
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
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd ~/projects/tax-leak-scorecard && npm test`
Expected: FAIL — modules don't exist yet.

- [ ] **Step 4: Implement scoring**

`src/lib/scoring.ts`:
```typescript
import { ScorecardConfig, AnswerMap, Tier } from "./types";

export function calculateScore(config: ScorecardConfig, answers: AnswerMap): number {
  let total = 0;
  for (const section of config.sections) {
    for (const question of section.questions) {
      const selectedIndex = answers[question.id];
      if (selectedIndex !== undefined && question.options[selectedIndex]) {
        total += question.options[selectedIndex].score;
      }
    }
  }
  return total;
}

export function calculateMaxScore(config: ScorecardConfig): number {
  let max = 0;
  for (const section of config.sections) {
    for (const question of section.questions) {
      const maxOption = Math.max(...question.options.map((o) => o.score));
      max += maxOption;
    }
  }
  return max;
}

export function getTier(config: ScorecardConfig, score: number): Tier {
  for (const tier of config.tiers) {
    if (score >= tier.min && score <= tier.max) {
      return tier;
    }
  }
  return config.tiers[config.tiers.length - 1];
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd ~/projects/tax-leak-scorecard && npm test`
Expected: All 6 tests PASS.

- [ ] **Step 6: Commit**

```bash
cd ~/projects/tax-leak-scorecard
git add src/lib/scoring.ts src/__tests__/scoring.test.ts vitest.config.ts package.json package-lock.json
git commit -m "Add scoring logic with tests"
```

---

## Task 4: Webhook Server Action (TDD)

**Files:**
- Create: `src/lib/actions.ts`, `src/__tests__/actions.test.ts`

- [ ] **Step 1: Write failing tests**

`src/__tests__/actions.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

// We test the logic by extracting the payload-building and fetch call.
// Since server actions can't be directly imported in vitest without Next.js,
// we test the core logic by importing the module in node environment.

describe("submitResults", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns { success: false } when env var is missing", async () => {
    // Clear the env var
    delete process.env.WEBHOOK_URL_TEST;
    const { submitResults } = await import("@/lib/actions");
    const config = {
      clientSlug: "test", clientName: "Test", scorecardTitle: "Test",
      scorecardDescription: "Test", branding: { primaryColor: "#000", accentColor: "#fff" },
      bookingUrl: "https://example.com", bookingCtaText: "Book",
      webhookEnvKey: "WEBHOOK_URL_TEST",
      sections: [{ title: "S1", questions: [{ id: "q1", text: "Q", options: [{ text: "A", score: 3 }] }] }],
      tiers: [{ label: "Low", min: 0, max: 3, color: "#16a34a", message: "Good" }],
    };
    const result = await submitResults(config, { firstName: "J", lastName: "D", email: "j@d.com" }, { q1: 0 });
    expect(result.success).toBe(false);
  });

  it("returns { success: true } on successful POST", async () => {
    process.env.WEBHOOK_URL_TEST = "https://hook.example.com/test";
    global.fetch = vi.fn().mockResolvedValue({ ok: true });
    // Re-import to pick up env change
    vi.resetModules();
    const { submitResults } = await import("@/lib/actions");
    const config = {
      clientSlug: "test", clientName: "Test", scorecardTitle: "Test",
      scorecardDescription: "Test", branding: { primaryColor: "#000", accentColor: "#fff" },
      bookingUrl: "https://example.com", bookingCtaText: "Book",
      webhookEnvKey: "WEBHOOK_URL_TEST",
      sections: [{ title: "S1", questions: [{ id: "q1", text: "Q", options: [{ text: "A", score: 3 }] }] }],
      tiers: [{ label: "Low", min: 0, max: 3, color: "#16a34a", message: "Good" }],
    };
    const result = await submitResults(config, { firstName: "J", lastName: "D", email: "j@d.com" }, { q1: 0 });
    expect(result.success).toBe(true);
  });

  it("returns { success: false } on network error without throwing", async () => {
    process.env.WEBHOOK_URL_TEST = "https://hook.example.com/test";
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
    vi.resetModules();
    const { submitResults } = await import("@/lib/actions");
    const config = {
      clientSlug: "test", clientName: "Test", scorecardTitle: "Test",
      scorecardDescription: "Test", branding: { primaryColor: "#000", accentColor: "#fff" },
      bookingUrl: "https://example.com", bookingCtaText: "Book",
      webhookEnvKey: "WEBHOOK_URL_TEST",
      sections: [{ title: "S1", questions: [{ id: "q1", text: "Q", options: [{ text: "A", score: 3 }] }] }],
      tiers: [{ label: "Low", min: 0, max: 3, color: "#16a34a", message: "Good" }],
    };
    const result = await submitResults(config, { firstName: "J", lastName: "D", email: "j@d.com" }, { q1: 0 });
    expect(result.success).toBe(false);
  });
});
```

Note: The `"use server"` directive may need to be handled. If vitest can't import the server action directly, remove the directive for testing or mock it. The implementing agent should adjust as needed — the key behaviors to test are: missing env var → false, successful fetch → true, failed fetch → false (no throw).

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd ~/projects/tax-leak-scorecard && npm test -- src/__tests__/actions.test.ts`
Expected: FAIL — module doesn't exist yet.

- [ ] **Step 3: Implement server action**

`src/lib/actions.ts`:
```typescript
"use server";

import { ScorecardConfig, AnswerMap, ContactInfo } from "./types";
import { calculateScore, calculateMaxScore, getTier } from "./scoring";

export async function submitResults(
  config: ScorecardConfig,
  contact: ContactInfo,
  answers: AnswerMap
): Promise<{ success: boolean }> {
  const webhookUrl = process.env[config.webhookEnvKey];

  if (!webhookUrl) {
    console.error(`Missing env var: ${config.webhookEnvKey}`);
    return { success: false };
  }

  const totalScore = calculateScore(config, answers);
  const maxScore = calculateMaxScore(config);
  const tier = getTier(config, totalScore);

  const answerDetails = config.sections.flatMap((section) =>
    section.questions.map((q) => {
      const selectedIndex = answers[q.id];
      const selectedOption = selectedIndex !== undefined ? q.options[selectedIndex] : null;
      return {
        questionId: q.id,
        questionText: q.text,
        selectedAnswer: selectedOption?.text ?? "Not answered",
        score: selectedOption?.score ?? 0,
      };
    })
  );

  const payload = {
    clientSlug: config.clientSlug,
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    totalScore,
    maxScore,
    tier: tier.label,
    answers: answerDetails,
    completedAt: new Date().toISOString(),
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(`Webhook failed: ${res.status} ${res.statusText}`);
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    console.error("Webhook error:", err);
    return { success: false };
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd ~/projects/tax-leak-scorecard && npm test -- src/__tests__/actions.test.ts`
Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd ~/projects/tax-leak-scorecard
git add src/lib/actions.ts src/__tests__/actions.test.ts
git commit -m "Add webhook server action with tests"
```

---

## Task 5: Bob Ward's Config (All 12 Questions)

**Files:**
- Create: `src/configs/oaks.json`

- [ ] **Step 1: Create the full config file**

Create the complete `src/configs/oaks.json` with this exact content:

```json
{
  "clientSlug": "oaks",
  "clientName": "Oaks Financial Services",
  "scorecardTitle": "Tax Leak Scorecard",
  "scorecardDescription": "Answer 12 quick questions to find out if you're losing money to avoidable taxes in retirement.",
  "branding": {
    "primaryColor": "#1B3A5C",
    "accentColor": "#C9A84C"
  },
  "bookingUrl": "https://calendly.com/placeholder",
  "bookingCtaText": "Schedule Your Free Tax Leak Review",
  "webhookEnvKey": "WEBHOOK_URL_OAKS",
  "sections": [
    {
      "title": "Income Sources & Withdrawal Order",
      "questions": [
        {
          "id": "q1",
          "text": "Do you have a clear plan for the order in which you'll draw from your various retirement accounts (401k, IRA, Roth, brokerage)?",
          "options": [
            { "text": "Yes, I follow a specific, tax-optimized withdrawal sequence", "score": 3 },
            { "text": "I have a general idea but haven't formalized a strategy", "score": 2 },
            { "text": "I mostly withdraw based on immediate need", "score": 1 },
            { "text": "I'm not sure what the most tax-efficient approach would be", "score": 0 }
          ]
        },
        {
          "id": "q2",
          "text": "Are you aware of how different income sources (pensions, Social Security, IRA withdrawals, investment gains) interact to affect your total tax bill?",
          "options": [
            { "text": "Yes, I actively manage the mix to minimize taxes", "score": 3 },
            { "text": "I understand the basics but don't actively manage it", "score": 2 },
            { "text": "I know some income is taxed differently but haven't looked into it deeply", "score": 1 },
            { "text": "I haven't really thought about how they interact", "score": 0 }
          ]
        },
        {
          "id": "q3",
          "text": "Have you evaluated whether taking some income earlier in retirement (before Social Security or RMDs begin) could reduce your lifetime tax burden?",
          "options": [
            { "text": "Yes, I've modeled different scenarios with a professional", "score": 3 },
            { "text": "I've thought about it but haven't run the numbers", "score": 2 },
            { "text": "I've heard this might help but haven't explored it", "score": 1 },
            { "text": "No, I plan to defer income as long as possible", "score": 0 }
          ]
        }
      ]
    },
    {
      "title": "Social Security Timing & Tax Interaction",
      "questions": [
        {
          "id": "q4",
          "text": "Have you analyzed how the timing of your Social Security benefits affects the taxation of those benefits?",
          "options": [
            { "text": "Yes, I've optimized my claiming strategy with taxes in mind", "score": 3 },
            { "text": "I know timing matters but haven't done a detailed analysis", "score": 2 },
            { "text": "I plan to claim based on age preference, not tax impact", "score": 1 },
            { "text": "I didn't know Social Security timing affected my taxes", "score": 0 }
          ]
        },
        {
          "id": "q5",
          "text": "Do you know what percentage of your Social Security benefits will be taxable based on your combined income?",
          "options": [
            { "text": "Yes, and I'm managing other income to minimize the taxable portion", "score": 3 },
            { "text": "I know some of it is taxable but not the exact percentage", "score": 2 },
            { "text": "I assume most or all of it will be taxed", "score": 1 },
            { "text": "I didn't know Social Security benefits could be taxed", "score": 0 }
          ]
        }
      ]
    },
    {
      "title": "Roth Conversion Opportunities",
      "questions": [
        {
          "id": "q6",
          "text": "Have you explored whether converting some traditional IRA or 401(k) funds to a Roth IRA could save you money in the long run?",
          "options": [
            { "text": "Yes, I do strategic Roth conversions based on tax bracket analysis", "score": 3 },
            { "text": "I've looked into it but haven't pulled the trigger", "score": 2 },
            { "text": "I've heard about Roth conversions but don't understand the benefit", "score": 1 },
            { "text": "No, I haven't considered this", "score": 0 }
          ]
        },
        {
          "id": "q7",
          "text": "Are you aware of the 'tax bracket gap' — years when your income is lower (e.g., between retirement and Social Security/RMDs) that create a window for low-cost Roth conversions?",
          "options": [
            { "text": "Yes, I'm actively using this window for conversions", "score": 3 },
            { "text": "I've heard about this but haven't acted on it", "score": 2 },
            { "text": "I'm not sure when my income will be lower", "score": 1 },
            { "text": "This is the first I'm hearing about this", "score": 0 }
          ]
        }
      ]
    },
    {
      "title": "RMD Readiness & Tax Exposure",
      "questions": [
        {
          "id": "q8",
          "text": "Do you have a plan in place to manage Required Minimum Distributions (RMDs) so they don't push you into a higher tax bracket?",
          "options": [
            { "text": "Yes, I've been proactively reducing my pre-tax balance before RMDs start", "score": 3 },
            { "text": "I know RMDs are coming but haven't planned for the tax impact", "score": 2 },
            { "text": "I'll deal with RMDs when I have to", "score": 1 },
            { "text": "I'm not sure what RMDs are or when they start", "score": 0 }
          ]
        },
        {
          "id": "q9",
          "text": "Have you calculated how your RMDs (combined with other income) could affect your Medicare premiums through IRMAA surcharges?",
          "options": [
            { "text": "Yes, I factor IRMAA thresholds into my withdrawal planning", "score": 3 },
            { "text": "I know higher income can increase Medicare costs but haven't planned for it", "score": 2 },
            { "text": "I've heard of IRMAA but don't know how it applies to me", "score": 1 },
            { "text": "I didn't know retirement income could affect Medicare premiums", "score": 0 }
          ]
        }
      ]
    },
    {
      "title": "Capital Gains & Portfolio Tax Efficiency",
      "questions": [
        {
          "id": "q10",
          "text": "Are you strategically managing capital gains in your taxable investment accounts — for example, harvesting losses or timing sales to stay in lower brackets?",
          "options": [
            { "text": "Yes, I actively manage gains and losses for tax efficiency", "score": 3 },
            { "text": "I try to be mindful but don't have a formal strategy", "score": 2 },
            { "text": "I sell investments when I need the money without considering tax impact", "score": 1 },
            { "text": "I haven't thought about capital gains management", "score": 0 }
          ]
        },
        {
          "id": "q11",
          "text": "Is your investment portfolio structured with tax efficiency in mind — for example, holding tax-inefficient assets (bonds, REITs) in tax-advantaged accounts?",
          "options": [
            { "text": "Yes, my portfolio uses asset location strategies", "score": 3 },
            { "text": "I have some awareness but haven't optimized placement", "score": 2 },
            { "text": "My investments are spread without much thought to tax efficiency", "score": 1 },
            { "text": "I'm not sure what asset location means", "score": 0 }
          ]
        }
      ]
    },
    {
      "title": "Overall Tax Planning",
      "questions": [
        {
          "id": "q12",
          "text": "Do you work with a financial advisor or tax professional who creates a multi-year tax projection for your retirement?",
          "options": [
            { "text": "Yes, I have a comprehensive, forward-looking tax plan reviewed annually", "score": 3 },
            { "text": "My advisor addresses taxes but we don't do multi-year projections", "score": 2 },
            { "text": "I rely on my tax preparer at filing time but don't plan ahead", "score": 1 },
            { "text": "I don't currently work with anyone on retirement tax planning", "score": 0 }
          ]
        }
      ]
    }
  ],
  "tiers": [
    {
      "label": "Low Tax Leak",
      "min": 30,
      "max": 36,
      "color": "#16a34a",
      "message": "Your tax strategy looks solid. A quick review could confirm you're not leaving anything on the table."
    },
    {
      "label": "Moderate Tax Leak",
      "min": 22,
      "max": 29,
      "color": "#ca8a04",
      "message": "There may be tax-saving opportunities you're not taking advantage of. A conversation could uncover them."
    },
    {
      "label": "High Tax Leak",
      "min": 0,
      "max": 21,
      "color": "#dc2626",
      "message": "You could be losing significant money to avoidable taxes. A professional review is strongly recommended."
    }
  ]
}
```

Note: `logo` field is intentionally omitted — Bob has not provided a logo asset yet. The WelcomeScreen component renders the client name as text when no logo is present.

- [ ] **Step 2: Verify config parses correctly**

Run: `cd ~/projects/tax-leak-scorecard && node -e "const c = require('./src/configs/oaks.json'); console.log(c.sections.length, 'sections,', c.sections.reduce((a,s) => a + s.questions.length, 0), 'questions')"`
Expected: `6 sections, 12 questions`

- [ ] **Step 3: Commit**

```bash
cd ~/projects/tax-leak-scorecard
git add src/configs/oaks.json
git commit -m "Add Bob Ward / Oaks Financial Services scorecard config"
```

---

## Task 6: UI Components — ProgressBar, QuestionCard, ScoreAnimation

**Files:**
- Create: `src/components/ProgressBar.tsx`, `src/components/QuestionCard.tsx`, `src/components/ScoreAnimation.tsx`

These are the leaf-level UI components with no dependencies on other custom components.

- [ ] **Step 1: Build ProgressBar**

`src/components/ProgressBar.tsx` — Takes `currentStep` (number), `labels` (string[]), and `accentColor` (hex string).

Total steps = `sections.length + 1`. Labels array = `["Contact Info", ...sections.map(s => s.title)]`. `currentStep` = 0 during contact form, 1 through N during question sections.

Renders a horizontal bar with filled/unfilled segments. Each segment is a rounded rectangle. Current and completed segments use `accentColor` via inline style. Width: full container. Height: 8px segments. Step labels displayed below each segment (truncated with ellipsis if text overflows).

- [ ] **Step 2: Build QuestionCard**

`src/components/QuestionCard.tsx` — Takes `question` (Question), `selectedIndex` (number | undefined), `onSelect` (callback with option index), and `accentColor` (hex). Renders the question text as a heading, then answer options as large tappable cards stacked vertically. Selected card gets a colored left border + light background tint using `accentColor`. Cards should be at minimum 60px tall with generous padding. Text should be 16-18px. Mobile-friendly tap targets.

- [ ] **Step 3: Build ScoreAnimation**

`src/components/ScoreAnimation.tsx` — Takes `score` (number), `maxScore` (number), `color` (hex). Animates a counter from 0 to `score` over ~1.5 seconds using requestAnimationFrame. Displays as `{score} / {maxScore}`. The score number should be large (48-64px), bold, colored with the tier color via inline style. The `/ {maxScore}` part is smaller and gray.

- [ ] **Step 4: Commit**

```bash
cd ~/projects/tax-leak-scorecard
git add src/components/ProgressBar.tsx src/components/QuestionCard.tsx src/components/ScoreAnimation.tsx
git commit -m "Add ProgressBar, QuestionCard, and ScoreAnimation components"
```

---

## Task 7: UI Components — WelcomeScreen, ContactForm, QuestionSection, ResultsScreen

**Files:**
- Create: `src/components/WelcomeScreen.tsx`, `src/components/ContactForm.tsx`, `src/components/QuestionSection.tsx`, `src/components/ResultsScreen.tsx`

- [ ] **Step 1: Build WelcomeScreen**

`src/components/WelcomeScreen.tsx` — Takes `config` (ScorecardConfig) and `onStart` callback. Displays: client logo (if present, otherwise client name as text), scorecard title (large, bold), scorecard description, and a "Start" button styled with `primaryColor`. Clean, centered layout. Generous whitespace. The title should be 32-40px. Mobile: full-width button.

- [ ] **Step 2: Build ContactForm**

`src/components/ContactForm.tsx` — Takes `onSubmit` callback (receives ContactInfo), `accentColor` (hex). Three fields: first name, last name, email. All required. Basic validation: email must contain `@` and `.`. Fields are stacked vertically with labels. Submit button says "Continue" and uses `accentColor`. Shows inline error messages under fields that fail validation. Inputs should be large (min 48px height) for mobile.

- [ ] **Step 3: Build QuestionSection**

`src/components/QuestionSection.tsx` — Takes `section` (Section), `answers` (AnswerMap), `onAnswer` callback, `onNext` callback, `onBack` callback (optional — hidden on first section), `accentColor` (hex), `isLastSection` (boolean). Renders section title, then a QuestionCard for each question in the section. "Back" and "Next" buttons at bottom. "Next" is disabled until all questions in the section are answered. If `isLastSection`, the "Next" button says "See My Results" instead. Back button is a text/ghost button, Next is solid with `accentColor`.

- [ ] **Step 4: Build ResultsScreen**

`src/components/ResultsScreen.tsx` — Takes `config` (ScorecardConfig), `score` (number), `maxScore` (number), `tier` (Tier). Renders: ScoreAnimation at top, tier label as a large badge (pill shape, background uses `tier.color` at 15% opacity, text uses `tier.color`), tier message below, then a prominent CTA button linking to `config.bookingUrl` with text `config.bookingCtaText`. Button uses `config.branding.primaryColor`. Below the CTA, small text: "Your detailed results have been sent to the {config.clientName} team."

- [ ] **Step 5: Commit**

```bash
cd ~/projects/tax-leak-scorecard
git add src/components/WelcomeScreen.tsx src/components/ContactForm.tsx src/components/QuestionSection.tsx src/components/ResultsScreen.tsx
git commit -m "Add WelcomeScreen, ContactForm, QuestionSection, ResultsScreen components"
```

---

## Task 8: Quiz Orchestrator (ScorecardQuiz)

**Files:**
- Create: `src/components/ScorecardQuiz.tsx`

- [ ] **Step 1: Build the main quiz state machine**

`src/components/ScorecardQuiz.tsx` — Client component ("use client"). Takes `config` (ScorecardConfig) as prop.

State (useState):
- `step: QuizStep` — starts at `{ type: "welcome" }`
- `contact: ContactInfo` — populated after contact form
- `answers: AnswerMap` — populated as questions are answered
- `score: number | null` — calculated on completion

Ref (useRef, NOT useState — avoids re-render, prevents double-fire):
- `submitted: React.useRef<boolean>(false)` — webhook dedup guard, checked before calling submitResults

Flow:
1. Welcome → user clicks Start → step becomes `{ type: "contact" }`
2. Contact → user submits form → step becomes `{ type: "section", index: 0 }`
3. Section N → user clicks Next → if last section, calculate score, fire webhook via `submitResults` server action (once, using useRef guard), step becomes `{ type: "results" }`. Otherwise step becomes `{ type: "section", index: N+1 }`
4. Section N → user clicks Back → step becomes previous section or contact
5. Results → display results. No back navigation from here (though browser back is fine — answers preserved).

Renders a ProgressBar (visible during contact + sections, hidden on welcome + results) and the appropriate screen component based on `step`.

The container should be max-width 720px, centered, with padding. White background card with subtle shadow on non-white page background (use a very light gray, e.g., `#f9fafb`).

- [ ] **Step 2: Commit**

```bash
cd ~/projects/tax-leak-scorecard
git add src/components/ScorecardQuiz.tsx
git commit -m "Add ScorecardQuiz orchestrator component"
```

---

## Task 9: App Routes

**Files:**
- Create: `src/app/[clientSlug]/page.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Build the dynamic route page**

`src/app/[clientSlug]/page.tsx`:
```typescript
import { notFound } from "next/navigation";
import { loadConfig, getAllClientSlugs } from "@/lib/config";
import ScorecardQuiz from "@/components/ScorecardQuiz";

export async function generateStaticParams() {
  return getAllClientSlugs().map((slug) => ({ clientSlug: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ clientSlug: string }> }) {
  const { clientSlug } = await params;
  const config = loadConfig(clientSlug);
  if (!config) return { title: "Not Found" };
  return {
    title: `${config.scorecardTitle} | ${config.clientName}`,
    description: config.scorecardDescription,
  };
}

export default async function ScorecardPage({ params }: { params: Promise<{ clientSlug: string }> }) {
  const { clientSlug } = await params;
  const config = loadConfig(clientSlug);
  if (!config) notFound();
  return <ScorecardQuiz config={config} />;
}
```

- [ ] **Step 2: Update root layout**

`src/app/layout.tsx` — Set up with a clean system font stack. No custom Google fonts needed for v1 (keeps it fast, professional). Set the body background to `#f9fafb`.

- [ ] **Step 3: Verify locally**

Run: `cd ~/projects/tax-leak-scorecard && npm run dev`
Visit `http://localhost:3000/oaks` — should render the full quiz flow.
Visit `http://localhost:3000` — should show "Page not found".
Visit `http://localhost:3000/nonexistent` — should 404.

Walk through the entire quiz: welcome → contact → all 6 sections → results.

- [ ] **Step 4: Commit**

```bash
cd ~/projects/tax-leak-scorecard
git add src/app/
git commit -m "Add dynamic client routes and root layout"
```

---

## Task 10: Design Polish Pass

**Files:**
- Modify: All component files as needed

Before this task, invoke the `frontend-design` skill and `ui-ux-pro-max` design system generator for a financial services quiz targeting 50-70 year old pre-retirees.

- [ ] **Step 1: Run ui-ux-pro-max**

Run: `python ~/.claude/skills/ui-ux-pro-max/scripts/search.py --design-system "scored quiz assessment tool for financial advisors targeting pre-retiree prospects aged 50-70"`

Apply recommended fonts, spacing, and style patterns to the components.

- [ ] **Step 2: Invoke frontend-design skill**

Load the frontend-design skill and review all components against its guidelines for typography, spacing, color, and mobile responsiveness.

- [ ] **Step 3: Run /critique**

Evaluate the overall design quality.

- [ ] **Step 4: Run /audit**

Check accessibility (contrast ratios, ARIA labels, keyboard navigation), responsive behavior, and performance.

- [ ] **Step 5: Fix all audit findings**

Address every issue found in the audit.

- [ ] **Step 6: Run /polish**

Final quality pass.

- [ ] **Step 7: Commit**

```bash
cd ~/projects/tax-leak-scorecard
git add -A
git commit -m "Design polish: typography, spacing, accessibility, responsiveness"
```

---

## Task 11: Build Verification

- [ ] **Step 1: Run tests**

Run: `cd ~/projects/tax-leak-scorecard && npm test`
Expected: All tests pass.

- [ ] **Step 2: Run production build**

Run: `cd ~/projects/tax-leak-scorecard && npm run build`
Expected: Build succeeds. Static pages generated for `/oaks`.

- [ ] **Step 3: Test production build locally**

Run: `cd ~/projects/tax-leak-scorecard && npm start`
Walk through the full quiz at `http://localhost:3000/oaks`. Verify:
- Welcome screen renders with Oaks branding
- Contact form validates and collects info
- All 12 questions render across 6 sections
- Progress bar updates correctly
- Back navigation preserves answers
- Results screen shows animated score, correct tier, and booking CTA
- Mobile viewport (use browser devtools, 375px width) — everything is usable

- [ ] **Step 4: Commit any final fixes**

```bash
cd ~/projects/tax-leak-scorecard
git add -A
git commit -m "Final build verification fixes"
```

---

## Task 12: Deploy

**Files:**
- None (infrastructure only)

- [ ] **Step 1: Create GitHub repo and push**

Run: `cd ~/projects/tax-leak-scorecard && gh repo create MrGIue/tax-leak-scorecard --public --source=. --push`

- [ ] **Step 2: Link to Vercel and connect GitHub**

Run: `cd ~/projects/tax-leak-scorecard && npx vercel link --yes --team team_2MUsZZ5m8D4xst2FfKm2UjXg`

After linking, confirm in the Vercel dashboard that the project is connected to the `MrGIue/tax-leak-scorecard` GitHub repo for auto-deploys.

- [ ] **Step 3: Set environment variable**

Add `WEBHOOK_URL_OAKS` to Vercel env vars. Value will be the Make.com webhook URL (to be created in Task 13).

For now, set a placeholder:
Run: `npx vercel env add WEBHOOK_URL_OAKS production`
Value: `https://hook.us2.make.com/placeholder`

- [ ] **Step 4: Deploy to production**

Run: `cd ~/projects/tax-leak-scorecard && npx vercel --prod --yes --team team_2MUsZZ5m8D4xst2FfKm2UjXg`

- [ ] **Step 5: Verify live site**

Visit the Vercel URL `/oaks` and walk through the full quiz.

- [ ] **Step 6: Report the live URL to Joe**

---

## Task 13: Make.com Webhook Setup

**Files:**
- None (Make.com configuration)

- [ ] **Step 1: Create Make.com scenario**

Create a new scenario in Make.com (Org 129329, Team 51059):
- Trigger: Webhook (Custom webhook)
- Name the webhook: "Tax Leak Scorecard — Oaks"
- Module 1: Parse the incoming JSON payload
- Module 2: Send email to Bob's team with formatted results (name, email, score, tier, all answers)

- [ ] **Step 2: Get the webhook URL**

Copy the webhook URL from Make.com.

- [ ] **Step 3: Update Vercel env var**

Replace the placeholder `WEBHOOK_URL_OAKS` with the real Make.com webhook URL.

- [ ] **Step 4: Redeploy**

Run: `cd ~/projects/tax-leak-scorecard && npx vercel --prod --yes --team team_2MUsZZ5m8D4xst2FfKm2UjXg`

- [ ] **Step 5: End-to-end test**

Fill out the scorecard on the live site. Verify Bob's team receives the email with correct data.

---

## Summary

| Task | What | Depends On |
|------|------|------------|
| 1 | Project scaffolding | — |
| 2 | Types + config loader | 1 |
| 3 | Scoring logic (TDD) | 2 |
| 4 | Webhook server action | 2, 3 |
| 5 | Bob's full config | 2 |
| 6 | Leaf UI components | 1 |
| 7 | Screen components | 6 |
| 8 | Quiz orchestrator | 3, 4, 7 |
| 9 | App routes | 5, 8 |
| 10 | Design polish | 9 |
| 11 | Build verification | 10 |
| 12 | Deploy | 11 |
| 13 | Make.com webhook | 12 |

**Parallelizable:** Tasks 3, 4, 5, and 6 can all run in parallel after Task 2. Task 7 can start as soon as 6 is done.
