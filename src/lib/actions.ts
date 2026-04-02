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

  const answersFormatted = config.sections.map((section) => {
    const questionLines = section.questions.map((q) => {
      const selectedIndex = answers[q.id];
      const selectedOption = selectedIndex !== undefined ? q.options[selectedIndex] : null;
      return `Q: ${q.text}\nA: ${selectedOption?.text ?? "Not answered"} (${selectedOption?.score ?? 0}/3)`;
    }).join("\n\n");
    return `--- ${section.title} ---\n${questionLines}`;
  }).join("\n\n");

  const payload = {
    clientSlug: config.clientSlug,
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    phone: contact.phone,
    totalScore,
    maxScore,
    tier: tier.label,
    answers: answersFormatted,
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
