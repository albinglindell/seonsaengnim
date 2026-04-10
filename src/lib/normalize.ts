const punctRe = /[\u200B-\u200D\uFEFF]/g;

export const normalizeLatin = (s: string): string =>
  s
    .normalize("NFKC")
    .replace(punctRe, "")
    .toLowerCase()
    .replace(/['’]/g, "'")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const normalizeKorean = (s: string): string =>
  s
    .normalize("NFC")
    .replace(punctRe, "")
    .replace(/\s+/g, " ")
    .trim();

export const answersMatch = (guess: string, target: string, direction: "en" | "ko"): boolean => {
  const g = direction === "en" ? normalizeLatin(guess) : normalizeKorean(guess);
  const t = direction === "en" ? normalizeLatin(target) : normalizeKorean(target);
  if (!g || !t) {
    return false;
  }
  if (g === t) {
    return true;
  }
  const gw = g.split(" ");
  const tw = t.split(" ");
  if (gw.length === tw.length && gw.every((w, i) => w === tw[i])) {
    return true;
  }
  if (t.includes(g) && g.length >= Math.min(4, t.length * 0.6)) {
    return true;
  }
  return false;
};
