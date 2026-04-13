"use server";

import { ScorecardConfig, AnswerMap, ContactInfo } from "./types";
import { calculateScore, calculateMaxScore, getTier } from "./scoring";

const APP_BASE_URL =
  process.env.PUBLIC_APP_URL ?? "https://tax-leak-scorecard.vercel.app";

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

  const sectionBreakdown = config.sections.map((section) => {
    let earned = 0;
    let max = 0;
    for (const q of section.questions) {
      const selectedIndex = answers[q.id];
      if (selectedIndex !== undefined && q.options[selectedIndex]) {
        earned += q.options[selectedIndex].score;
      }
      max += Math.max(...q.options.map((o) => o.score));
    }
    return { title: section.title, earned, max };
  });

  const answersFormatted = config.sections.map((section) => {
    const questionLines = section.questions.map((q) => {
      const selectedIndex = answers[q.id];
      const selectedOption = selectedIndex !== undefined ? q.options[selectedIndex] : null;
      return `Q: ${q.text}\nA: ${selectedOption?.text ?? "Not answered"} (${selectedOption?.score ?? 0}/3)`;
    }).join("\n\n");
    return `--- ${section.title} ---\n${questionLines}`;
  }).join("\n\n");

  const escapeHtml = (s: string): string =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const answersHtml = config.sections
    .map((section) => {
      const questionBlocks = section.questions
        .map((q) => {
          const selectedIndex = answers[q.id];
          const selectedOption =
            selectedIndex !== undefined ? q.options[selectedIndex] : null;
          const answerText = selectedOption?.text ?? "Not answered";
          const answerScore = selectedOption?.score ?? 0;
          return `<p style="margin:0 0 4px 0;"><strong style="color:#1B2B3A;">${escapeHtml(q.text)}</strong></p><p style="margin:0 0 14px 0;color:#475569;"><em>${escapeHtml(answerText)}</em> <span style="color:#94A3B8;font-style:normal;font-size:12px;">(${answerScore}/3)</span></p>`;
        })
        .join("");
      return `<h4 style="color:#01305C;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;margin:20px 0 10px 0;border-bottom:1px solid #ECEEF2;padding-bottom:6px;">${escapeHtml(section.title)}</h4>${questionBlocks}`;
    })
    .join("");

  const sectionsEncoded = Buffer.from(JSON.stringify(sectionBreakdown)).toString("base64url");

  const imageParams = new URLSearchParams({
    score: String(totalScore),
    max: String(maxScore),
    tier: tier.label,
    tierColor: tier.color,
    primary: config.branding.primaryColor,
    client: config.clientName,
    sections: sectionsEncoded,
    first: contact.firstName,
    last: contact.lastName,
  });
  const imageUrl = `${APP_BASE_URL}/api/result-image?${imageParams.toString()}`;

  const payload = {
    clientSlug: config.clientSlug,
    clientName: config.clientName,
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    phone: contact.phone,
    totalScore,
    maxScore,
    tier: tier.label,
    tierColor: tier.color,
    tierMessage: tier.message,
    primaryColor: config.branding.primaryColor,
    sections: sectionBreakdown,
    answers: answersFormatted,
    answersHtml,
    imageUrl,
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
