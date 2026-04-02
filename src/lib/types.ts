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
  phone?: string;
}

export type QuizStep =
  | { type: "welcome" }
  | { type: "contact" }
  | { type: "section"; index: number }
  | { type: "results" };
