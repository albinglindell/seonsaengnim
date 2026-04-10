import { CircleAlert, Trash2, X } from "lucide-react";
import { clearWrongAnswers, removeWrongEntry, type QuizWrongLog } from "@/lib/quizStorage";

type ReviewMistakesProps = {
  wrong: QuizWrongLog[];
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

export const ReviewMistakes = ({ wrong }: ReviewMistakesProps) => {
  const onClearAllHandler = () => {
    clearWrongAnswers();
  };

  const onRemoveEntryHandler = (vocabId: number) => {
    removeWrongEntry(vocabId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-paper/90">
          <CircleAlert className="h-6 w-6 text-red-400" aria-hidden />
          <h2 className="text-xl font-semibold tracking-tight">Wrong answers</h2>
        </div>
        {wrong.length > 0 ? (
          <button
            type="button"
            onClick={onClearAllHandler}
            className="ml-auto inline-flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-950/30 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-950/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
            aria-label="Clear all saved mistakes"
          >
            <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
            Clear all
          </button>
        ) : null}
      </div>
      <p className="text-sm text-white/55">
        Entries you miss in the quiz are saved here until you answer them correctly or remove them.
      </p>
      {wrong.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-ink-800/50 py-12 text-center text-white/55">
          No mistakes saved yet. Keep practicing in Quiz — wrong answers show up here.
        </p>
      ) : (
        <ul className="space-y-3" aria-label="Saved mistakes">
          {wrong.map((w) => (
            <li
              key={w.vocabId}
              className="relative rounded-2xl border border-red-500/25 bg-red-950/20 p-4 pr-12 shadow-sm"
            >
              <button
                type="button"
                onClick={() => onRemoveEntryHandler(w.vocabId)}
                className="absolute right-3 top-3 rounded-lg p-1.5 text-white/45 transition hover:bg-white/10 hover:text-paper focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
                aria-label={`Remove ${w.ko} from mistakes list`}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
              <p className="text-xs font-medium uppercase tracking-wide text-red-300/80">{w.topic}</p>
              <p className="mt-1 font-korean text-lg font-semibold text-paper">{w.ko}</p>
              <p className="mt-0.5 text-base text-paper/90">{w.en}</p>
              {w.rom ? (
                <p className="mt-2 text-sm italic text-white/50">{w.rom}</p>
              ) : null}
              <p className="mt-3 text-sm text-red-200/90">
                <span className="font-medium text-red-300">Your answer: </span>
                <span className={w.direction === "enToKo" ? "font-korean" : ""}>
                  {w.userAnswer || "(empty)"}
                </span>
              </p>
              <p className="mt-2 text-xs text-white/40">
                {w.direction === "koToEn" ? "Korean → English" : "English → Korean"} ·{" "}
                {w.mode === "mc" ? "Multiple choice" : "Typed"} · {formatAt(w.at)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
