import { useMemo } from "react";
import { BadgeCheck, Trash2 } from "lucide-react";
import { clearRightAnswers, type QuizRightLog } from "@/lib/quizStorage";
import type { VocabEntry } from "@/types";

type ReviewCorrectProps = {
  right: QuizRightLog[];
  items: VocabEntry[];
};

const formatAt = (iso: string) => {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
};

export const ReviewCorrect = ({ right, items }: ReviewCorrectProps) => {
  const byId = useMemo(() => {
    const m = new Map<number, VocabEntry>();
    items.forEach((e) => m.set(e.id, e));
    return m;
  }, [items]);

  const onClearAllHandler = () => {
    clearRightAnswers();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-paper/90">
          <BadgeCheck className="h-6 w-6 text-emerald-400" aria-hidden />
          <h2 className="text-xl font-semibold tracking-tight">Correct answers</h2>
        </div>
        {right.length > 0 ? (
          <button
            type="button"
            onClick={onClearAllHandler}
            className="ml-auto inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-950/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50"
            aria-label="Clear correct-answer history"
          >
            <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
            Clear history
          </button>
        ) : null}
      </div>
      <p className="text-sm text-white/55">
        Every time you answer correctly in the quiz, it is logged here (newest first). Clearing does
        not affect wrong answers.
      </p>
      {right.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-ink-800/50 py-12 text-center text-white/55">
          No correct answers logged yet. Your quiz wins will show up here.
        </p>
      ) : (
        <ul className="space-y-3" aria-label="Correct answer history">
          {right.map((r) => {
            const entry = byId.get(r.vocabId);
            return (
              <li
                key={`${r.vocabId}-${r.at}`}
                className="rounded-2xl border border-emerald-500/25 bg-emerald-950/20 p-4 shadow-sm"
              >
                {entry ? (
                  <>
                    <p className="text-xs font-medium uppercase tracking-wide text-emerald-300/80">
                      {entry.topic}
                    </p>
                    <p className="mt-1 font-korean text-lg font-semibold text-paper">{entry.ko}</p>
                    <p className="mt-0.5 text-base text-paper/90">{entry.en}</p>
                    {entry.rom ? (
                      <p className="mt-2 text-sm italic text-white/50">{entry.rom}</p>
                    ) : null}
                  </>
                ) : (
                  <p className="text-sm text-white/60">
                    Entry no longer in glossary (id {r.vocabId})
                  </p>
                )}
                <p className="mt-3 text-xs text-emerald-200/70">{formatAt(r.at)}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
