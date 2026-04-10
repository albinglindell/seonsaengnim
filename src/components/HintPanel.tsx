import { Lightbulb } from "lucide-react";
import type { VocabEntry } from "@/types";

type HintPanelProps = {
  entry: VocabEntry;
  direction: "koToEn" | "enToKo";
  hintTier: number;
  onHintClickHandler: () => void;
};

const countHangulSyllables = (s: string): number => {
  const m = s.match(/[\uac00-\ud7af]/g);
  return m ? m.length : 0;
};

export const HintPanel = ({ entry, direction, hintTier, onHintClickHandler }: HintPanelProps) => {
  const enWords = entry.en.trim().split(/\s+/).filter(Boolean).length;
  const koSyl = countHangulSyllables(entry.ko);
  const enFirst = entry.en.trim().charAt(0);
  const koFirstMatch = entry.ko.match(/[\uac00-\ud7af]/);
  const koFirst = koFirstMatch ? koFirstMatch[0] : entry.ko.charAt(0);

  const onKeyDownHandler = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onHintClickHandler();
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-mint/20 px-4 py-2.5 text-sm font-semibold text-mint transition hover:bg-mint/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-mint"
          aria-label={
            hintTier >= 3
              ? "All hints shown"
              : `Show hint, level ${hintTier + 1} of 3`
          }
          onClick={onHintClickHandler}
          onKeyDown={onKeyDownHandler}
          disabled={hintTier >= 3}
        >
          <Lightbulb className="h-5 w-5 shrink-0" aria-hidden />
          {hintTier >= 3 ? "All hints shown" : "Hint"}
        </button>
        <span className="text-xs text-white/50">
          Tap for a stronger hint (up to 3 levels).
        </span>
      </div>
      {hintTier >= 1 ? (
        <p className="mt-3 text-sm text-white/80">
          <span className="font-medium text-paper">Topic:</span> {entry.topic}
        </p>
      ) : null}
      {hintTier >= 2 ? (
        <p className="mt-2 text-sm text-white/80">
          {direction === "koToEn" ? (
            <>
              <span className="font-medium text-paper">English clue:</span> starts with “{enFirst}
              …” · {enWords} word{enWords === 1 ? "" : "s"}
            </>
          ) : (
            <>
              <span className="font-medium text-paper">Korean clue:</span> first character “{koFirst}”
              · about {koSyl} syllable{koSyl === 1 ? "" : "s"}
            </>
          )}
        </p>
      ) : null}
      {hintTier >= 3 ? (
        <p className="mt-2 text-sm text-white/80">
          <span className="font-medium text-paper">Romanization (from book):</span>{" "}
          {entry.rom ? (
            <span className="font-korean text-paper/95">{entry.rom}</span>
          ) : (
            <span className="italic text-white/50">not available for this line</span>
          )}
        </p>
      ) : null}
    </div>
  );
};
