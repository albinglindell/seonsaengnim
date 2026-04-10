export type VocabEntry = {
  id: number;
  topic: string;
  en: string;
  ko: string;
  rom: string;
};

export type QuizDirection = "koToEn" | "enToKo";

export type NumbersSystemFilter = "all" | "sino" | "native";
