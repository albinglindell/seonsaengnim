import type { NumbersSystemFilter, VocabEntry } from "@/types";

const NUMBERS_TOPIC = "numbers";

export const isNumbersTopic = (t: string | null): boolean =>
  t !== null && t.toLowerCase() === NUMBERS_TOPIC;

export const entryMatchesNumbersFilter = (
  entry: VocabEntry,
  filter: NumbersSystemFilter,
): boolean => {
  if (filter === "all") {
    return true;
  }
  if (filter === "sino") {
    return entry.en.includes("(Sino-Korean)");
  }
  return entry.en.includes("(native Korean)");
};
