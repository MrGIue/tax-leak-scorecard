# Tax Leak Scorecard — Design Spec

## Overview

A multi-tenant, config-driven scored quiz web app. Prospects answer questions, get an instant score with a tier-based result, and are directed to book a call. The advisor's team receives full results via webhook.

First deployment: Bob Ward / Oaks Financial Services — "Tax Leak Scorecard" (12 questions, 6 sections).

## Business Model

- **For existing TA clients:** $500 setup + $50/month hosting/maintenance
- **For non-TA clients:** $1,000-1,500 setup + $50/month
- **Multi-tenant architecture:** New client = new config file + deploy. ~30 minutes of work per client.

## User Flow

```
Welcome Screen → Contact Info → Section 1 → Section 2 → ... → Section 6 → Results Screen
```

1. **Welcome screen** — client-branded headline, description, "Start" CTA
2. **Contact info** — first name, last name, email (required, collected before questions so lead is captured even on abandonment)
3. **Questions** — one section at a time, progress bar at top, answer options as selectable cards (not dropdowns)
4. **Results screen** — animated score counter, tier badge with color, personalized message, CTA to book a call

Navigation: back/next between sections. No skipping ahead. Can revise previous answers. Answer state persists across back-navigation — previously selected answers are shown as selected when revisiting a section.

Browser back button from results screen returns to the last quiz section (answers preserved). This is intentional.

## Scoring

Each question has 3-4 answer options, each worth 0-3 points. Total max score depends on config (Bob's version: 12 questions, max 36).

### Tiers (Bob Ward config)

| Tier | Range | Color | Label | Message |
|------|-------|-------|-------|---------|
| Low Tax Leak | 30-36 | Green | Strong | Your tax strategy looks solid. A quick review could confirm you're not leaving anything on the table. |
| Moderate Tax Leak | 22-29 | Yellow | Moderate | There may be tax-saving opportunities you're not taking advantage of. A conversation could uncover them. |
| High Tax Leak | 0-21 | Red | High | You could be losing significant money to avoidable taxes. A professional review is strongly recommended. |

Tiers are defined in the config file — different clients can have different tier ranges, colors, labels, and messages. Tier colors use hex values (e.g., `"color": "#16a34a"`) applied as inline styles, not Tailwind class names, to avoid build-time purge issues with dynamic classes.

## Architecture

### Tech Stack

- **Framework:** Next.js 14+ (App Router) with TypeScript
- **Styling:** Tailwind CSS
- **State management:** React useState/useReducer (no external state library needed)
- **Deployment:** Vercel
- **Notifications:** Make.com webhook (POST on submit)
- **Booking CTA:** Calendly link (configurable per client)

### Project Structure

```
tax-leak-scorecard/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Main app entry — loads config, renders quiz
│   │   └── [clientSlug]/
│   │       └── page.tsx            # Client-specific route (e.g., /oaks)
│   ├── components/
│   │   ├── WelcomeScreen.tsx       # Landing/intro screen
│   │   ├── ContactForm.tsx         # Name + email collection
│   │   ├── QuestionSection.tsx     # Renders one section of questions
│   │   ├── QuestionCard.tsx        # Single question with selectable answer options
│   │   ├── ProgressBar.tsx         # Visual progress indicator
│   │   ├── ResultsScreen.tsx       # Score reveal + tier + CTA
│   │   └── ScoreAnimation.tsx      # Animated counter for score reveal
│   ├── lib/
│   │   ├── types.ts                # TypeScript interfaces for config, answers, scores
│   │   ├── scoring.ts              # Score calculation logic
│   │   ├── webhook.ts              # Make.com webhook submission
│   │   └── config.ts               # Config loader
│   └── configs/
│       └── oaks.json               # Bob Ward's scorecard config
├── public/
│   └── (client logos if needed)
├── docs/
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── package.json
└── .gitignore
```

### Config File Structure

Each client gets a JSON config file:

```json
{
  "clientSlug": "oaks",
  "clientName": "Oaks Financial Services",
  "scorecardTitle": "Tax Leak Scorecard",
  "scorecardDescription": "Find out if you're losing money to avoidable taxes.",
  "branding": {
    "primaryColor": "#1B3A5C",
    "accentColor": "#C9A84C",
    "logo": "/logos/oaks.png"
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
        }
      ]
    }
  ],
  "tiers": [
    { "label": "Low Tax Leak", "min": 30, "max": 36, "color": "#16a34a", "message": "Your tax strategy looks solid..." },
    { "label": "Moderate Tax Leak", "min": 22, "max": 29, "color": "#ca8a04", "message": "There may be tax-saving opportunities..." },
    { "label": "High Tax Leak", "min": 0, "max": 21, "color": "#dc2626", "message": "You could be losing significant money..." }
  ]
}
```

### Multi-Tenant Routing

- `/oaks` loads `configs/oaks.json`
- `/other-client` loads `configs/other-client.json`
- Root `/` shows a 404 (no default client)
- Config is loaded server-side at build time via `generateStaticParams`. Adding a new client requires a Vercel redeploy to activate their route.

### Webhook Security

The `webhookUrl` is NOT stored in the config JSON (which is committed to a public GitHub repo). Instead, each config specifies a `webhookEnvKey` (e.g., `"WEBHOOK_URL_OAKS"`), and the actual URL is stored as a Vercel environment variable. The webhook is fired via a Next.js server action that reads the URL from `process.env`.

### Webhook Payload

POST to Make.com webhook via Next.js server action on form completion (NOT on results screen mount — prevents duplicate fires on refresh/back navigation). A `useRef` guard ensures the submission fires exactly once per quiz completion:

```json
{
  "clientSlug": "oaks",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "totalScore": 18,
  "maxScore": 36,
  "tier": "High Tax Leak",
  "answers": [
    { "questionId": "q1", "questionText": "Do you have a clear plan...", "selectedAnswer": "I mostly withdraw based on immediate need", "score": 1 }
  ],
  "completedAt": "2026-03-19T14:30:00Z"
}
```

### Error Handling

- **Webhook failure:** Score is shown to the prospect regardless. Webhook fires server-side via server action; if it fails, log to server console. No user-facing error.
- **Missing config:** 404 page for invalid client slugs.
- **Incomplete form:** Contact form validates required fields before proceeding. Questions require an answer before advancing to next section.

## TypeScript Interfaces

```typescript
interface ScorecardConfig {
  clientSlug: string;
  clientName: string;
  scorecardTitle: string;
  scorecardDescription: string;
  branding: {
    primaryColor: string;    // hex value, e.g., "#1B3A5C"
    accentColor: string;     // hex value
    logo?: string;           // path to logo in /public/logos/, optional — text header used if omitted
  };
  bookingUrl: string;
  bookingCtaText: string;
  webhookEnvKey: string;     // maps to a Vercel env var name
  sections: Section[];
  tiers: Tier[];
}

interface Section {
  title: string;
  questions: Question[];     // 1+ questions per section
}

interface Question {
  id: string;                // globally unique across all sections (used in webhook payload)
  text: string;
  options: Option[];         // 2-4 options per question
}

interface Option {
  text: string;
  score: number;             // 0-3, scores may repeat within a question
}

interface Tier {
  label: string;
  min: number;
  max: number;
  color: string;             // hex value for badge/accent color
  message: string;
}
```

## Design Direction

- Clean, professional, trustworthy — this targets 50-70 year old pre-retirees
- Large, readable text. High contrast. No trendy UI gimmicks.
- Answer options as large, tappable cards (not radio buttons or dropdowns)
- Mobile-first — many prospects will open this from an email on their phone
- Minimal branding: client logo + 2 colors from config. White/light background.
- Results screen should feel like a "reveal moment" — slight animation on the score counter, clear tier badge with color

## What V1 Does NOT Include

- No user auth or login
- No database — fully stateless, results only sent via webhook
- No email to the prospect (advisor follows up via GHL or manually)
- No gating score behind booking (score shown immediately — builds trust)
- No analytics/tracking (can add later)
- No A/B testing or question branching

## Adding a New Client

1. Create a new JSON config file in `src/configs/{clientSlug}.json`
2. Add client logo to `public/logos/` (optional — text header used if omitted)
3. Set up a Make.com webhook for their notification flow
4. Add `WEBHOOK_URL_{CLIENTSLUG}` to Vercel environment variables
5. Deploy to Vercel — triggers rebuild, new route goes live at `/{clientSlug}`

Estimated time per new client: ~30 minutes.
