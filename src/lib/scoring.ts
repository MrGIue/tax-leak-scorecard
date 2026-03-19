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
