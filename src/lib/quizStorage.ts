import type { QuizDirection, VocabEntry } from "@/types";

const STORAGE_KEY = "collins-korean-quiz-v1";
const MAX_RIGHT = 2000;
const MAX_WRONG = 500;

export const QUIZ_LOG_EVENT = "collins-quiz-log-updated";

export type QuizWrongLog = {
  vocabId: number;
  topic: string;
  en: string;
  ko: string;
  rom: string;
  direction: QuizDirection;
  userAnswer: string;
  mode: "mc" | "type";
  at: string;
};

export type QuizRightLog = {
  vocabId: number;
  at: string;
};

export type QuizPersisted = {
  right: QuizRightLog[];
  wrong: QuizWrongLog[];
};

export const loadQuizLog = (): QuizPersisted => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { right: [], wrong: [] };
    }
    const p = JSON.parse(raw) as Partial<QuizPersisted>;
    return {
      right: Array.isArray(p.right) ? p.right : [],
      wrong: Array.isArray(p.wrong) ? p.wrong : [],
    };
  } catch {
    return { right: [], wrong: [] };
  }
};

const persist = (data: QuizPersisted) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent(QUIZ_LOG_EVENT));
  } catch {
    /* quota or private mode */
  }
};

export const recordQuizOutcome = (params: {
  correct: boolean;
  entry: VocabEntry;
  userAnswer: string;
  direction: QuizDirection;
  mode: "mc" | "type";
}) => {
  const data = loadQuizLog();
  const at = new Date().toISOString();
  if (params.correct) {
    data.right.unshift({ vocabId: params.entry.id, at });
    data.right = data.right.slice(0, MAX_RIGHT);
    data.wrong = data.wrong.filter((w) => w.vocabId !== params.entry.id);
  } else {
    const rec: QuizWrongLog = {
      vocabId: params.entry.id,
      topic: params.entry.topic,
      en: params.entry.en,
      ko: params.entry.ko,
      rom: params.entry.rom,
      direction: params.direction,
      userAnswer: params.userAnswer.trim(),
      mode: params.mode,
      at,
    };
    data.wrong = data.wrong.filter((w) => w.vocabId !== params.entry.id);
    data.wrong.unshift(rec);
    data.wrong = data.wrong.slice(0, MAX_WRONG);
  }
  persist(data);
};

export const clearWrongAnswers = () => {
  const data = loadQuizLog();
  data.wrong = [];
  persist(data);
};

export const removeWrongEntry = (vocabId: number) => {
  const data = loadQuizLog();
  data.wrong = data.wrong.filter((w) => w.vocabId !== vocabId);
  persist(data);
};

export const clearRightAnswers = () => {
  const data = loadQuizLog();
  data.right = [];
  persist(data);
};
