import type { VocabEntry } from "@/types";

export const shuffleInPlace = <T,>(arr: T[]): T[] => {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const pickRandom = <T,>(arr: T[], n: number, exclude?: T): T[] => {
  const pool = exclude === undefined ? [...arr] : arr.filter((x) => x !== exclude);
  shuffleInPlace(pool);
  return pool.slice(0, n);
};

export const buildMcOptions = (
  all: VocabEntry[],
  correct: VocabEntry,
  direction: "koToEn" | "enToKo",
  count: number,
): string[] => {
  const label = (e: VocabEntry) => (direction === "koToEn" ? e.en : e.ko);
  const sameTopic = all.filter((e) => e.id !== correct.id && e.topic === correct.topic);
  const rest = all.filter((e) => e.id !== correct.id && e.topic !== correct.topic);
  shuffleInPlace(sameTopic);
  shuffleInPlace(rest);
  const picks: VocabEntry[] = [];
  for (const e of sameTopic) {
    if (picks.length >= count - 1) {
      break;
    }
    if (!picks.some((x) => label(x) === label(e))) {
      picks.push(e);
    }
  }
  for (const e of rest) {
    if (picks.length >= count - 1) {
      break;
    }
    if (!picks.some((x) => label(x) === label(e))) {
      picks.push(e);
    }
  }
  const opts = [label(correct), ...picks.map(label)].slice(0, count);
  shuffleInPlace(opts);
  return opts;
};
