import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ChevronRight, ListOrdered, PencilLine } from "lucide-react";
import type { NumbersSystemFilter, QuizDirection, VocabEntry } from "@/types";
import { answersMatch } from "@/lib/normalize";
import { entryMatchesNumbersFilter, isNumbersTopic } from "@/lib/numbersTopic";
import { buildMcOptions, shuffleInPlace } from "@/lib/quiz";
import { recordQuizOutcome } from "@/lib/quizStorage";
import { HintPanel } from "@/components/HintPanel";

type QuizMode = "mc" | "type";

type QuizSessionProps = {
  items: VocabEntry[];
  topicFilter: string | null;
  direction: QuizDirection;
  numbersSystemFilter?: NumbersSystemFilter;
};

export const QuizSession = ({
  items,
  topicFilter,
  direction,
  numbersSystemFilter = "all",
}: QuizSessionProps) => {
  const [mode, setMode] = useState<QuizMode>(() => "mc");
  const [pool, setPool] = useState<VocabEntry[]>(() => []);
  const [index, setIndex] = useState(() => 0);
  const [mcOptions, setMcOptions] = useState<string[]>(() => []);
  const [selected, setSelected] = useState<string | null>(() => null);
  const [typed, setTyped] = useState(() => "");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(() => null);
  const [score, setScore] = useState(() => ({ right: 0, total: 0 }));
  const [hintTier, setHintTier] = useState(() => 0);

  const source = useMemo(() => {
    let list = topicFilter ? items.filter((e) => e.topic === topicFilter) : items;
    if (topicFilter && isNumbersTopic(topicFilter)) {
      list = list.filter((e) => entryMatchesNumbersFilter(e, numbersSystemFilter));
    }
    return list;
  }, [items, topicFilter, numbersSystemFilter]);

  const startNewRound = useCallback(
    (list: VocabEntry[], at: number) => {
      const entry = list[at];
      if (!entry) {
        return;
      }
      setHintTier(() => 0);
      setSelected(() => null);
      setTyped(() => "");
      setFeedback(() => null);
      if (mode === "mc") {
        const dir = direction === "koToEn" ? "koToEn" : "enToKo";
        setMcOptions(() => buildMcOptions(list, entry, dir, 4));
      }
    },
    [mode, direction],
  );

  useEffect(() => {
    if (source.length === 0) {
      setPool(() => []);
      return;
    }
    const copy = [...source];
    shuffleInPlace(copy);
    setPool(() => copy);
    setIndex(() => 0);
  }, [source, direction, mode]);

  useEffect(() => {
    if (pool.length === 0) {
      return;
    }
    startNewRound(pool, index);
  }, [pool, index, startNewRound]);

  const current = pool[index];

  const correctAnswer = current
    ? direction === "koToEn"
      ? current.en
      : current.ko
    : "";

  const onModeMcHandler = () => {
    setMode(() => "mc");
  };

  const onModeTypeHandler = () => {
    setMode(() => "type");
  };

  const onHintClickHandler = () => {
    setHintTier((t) => Math.min(3, t + 1));
  };

  const onSelectMcHandler = (opt: string) => {
    if (!current || feedback !== null) {
      return;
    }
    setSelected(() => opt);
    const ok =
      direction === "koToEn"
        ? answersMatch(opt, current.en, "en")
        : answersMatch(opt, current.ko, "ko");
    setFeedback(() => (ok ? "correct" : "wrong"));
    setScore((s) => ({
      right: s.right + (ok ? 1 : 0),
      total: s.total + 1,
    }));
    recordQuizOutcome({
      correct: ok,
      entry: current,
      userAnswer: opt,
      direction,
      mode: "mc",
    });
  };

  const onTypedChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTyped(() => e.target.value);
  };

  const onSubmitTypeHandler = () => {
    if (!current || feedback !== null) {
      return;
    }
    const ok =
      direction === "koToEn"
        ? answersMatch(typed, current.en, "en")
        : answersMatch(typed, current.ko, "ko");
    setFeedback(() => (ok ? "correct" : "wrong"));
    setScore((s) => ({
      right: s.right + (ok ? 1 : 0),
      total: s.total + 1,
    }));
    recordQuizOutcome({
      correct: ok,
      entry: current,
      userAnswer: typed,
      direction,
      mode: "type",
    });
  };

  const onNextHandler = () => {
    if (pool.length === 0) {
      return;
    }
    setIndex((i) => (i + 1) % pool.length);
  };

  const prompt =
    current && direction === "koToEn" ? (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <p className="font-korean text-2xl font-semibold leading-snug text-paper sm:text-3xl">
          {current.ko}
        </p>
        {current.rom ? (
          <p
            className="shrink-0 text-base italic leading-snug text-white/55 sm:max-w-[45%] sm:pt-1 sm:text-right sm:text-lg"
            aria-label={`Pronunciation: ${current.rom}`}
          >
            {current.rom}
          </p>
        ) : null}
      </div>
    ) : current ? (
      <p className="text-2xl font-semibold leading-snug text-paper sm:text-3xl">{current.en}</p>
    ) : null;

  const promptLabel =
    direction === "koToEn" ? "What does this mean in English?" : "Type the Korean:";

  if (source.length === 0) {
    return (
      <p className="rounded-2xl border border-white/10 bg-ink-800/50 p-6 text-center text-white/70">
        No entries for this topic. Choose another topic or “All topics”.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-2xl border border-white/10 bg-ink-800/80 p-1">
          <button
            type="button"
            onClick={onModeMcHandler}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-mint ${
              mode === "mc" ? "bg-accent text-white" : "text-paper/80 hover:bg-white/5"
            }`}
            aria-pressed={mode === "mc"}
          >
            <ListOrdered className="h-4 w-4" aria-hidden />
            Multiple choice
          </button>
          <button
            type="button"
            onClick={onModeTypeHandler}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-mint ${
              mode === "type" ? "bg-accent text-white" : "text-paper/80 hover:bg-white/5"
            }`}
            aria-pressed={mode === "type"}
          >
            <PencilLine className="h-4 w-4" aria-hidden />
            Type answer
          </button>
        </div>
        <div className="ml-auto text-sm text-white/60">
          Score {score.right}/{score.total}
        </div>
      </div>

      {current ? (
        <article className="rounded-3xl border border-white/10 bg-gradient-to-b from-ink-800/90 to-ink-900/90 p-5 shadow-xl sm:p-8">
          <p className="text-sm font-medium text-mint">{promptLabel}</p>
          <div className="mt-3">{prompt}</div>
          <div className="mt-6">
            <HintPanel
              entry={current}
              direction={direction}
              hintTier={hintTier}
              onHintClickHandler={onHintClickHandler}
            />
          </div>
          {mode === "mc" ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2" role="group" aria-label="Answer choices">
              {mcOptions.map((opt) => {
                const isSel = selected === opt;
                const showCorrect =
                  feedback !== null &&
                  (direction === "koToEn"
                    ? answersMatch(opt, current.en, "en")
                    : answersMatch(opt, current.ko, "ko"));
                const showWrong = feedback !== null && isSel && !showCorrect;
                const optionRom =
                  direction === "enToKo" ? pool.find((e) => e.ko === opt)?.rom ?? "" : "";
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={feedback !== null}
                    onClick={() => onSelectMcHandler(opt)}
                    className={`rounded-2xl border px-4 py-4 text-left text-base font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 ${
                      showCorrect
                        ? "border-emerald-500/70 bg-emerald-950/50 text-emerald-100 focus-visible:ring-emerald-500/50"
                        : showWrong
                          ? "border-red-500/70 bg-red-950/50 text-red-100 focus-visible:ring-red-500/50"
                          : isSel
                            ? "border-white/30 bg-white/10 text-paper focus-visible:ring-white/30"
                            : "border-white/10 bg-ink-900/40 text-paper/95 hover:border-white/20 focus-visible:ring-mint/40"
                    }`}
                  >
                    {direction === "enToKo" ? (
                      <span className="flex w-full items-start justify-between gap-3">
                        <span className="min-w-0 flex-1 font-korean text-lg leading-snug">{opt}</span>
                        {optionRom ? (
                          <span
                            className={`max-w-[48%] shrink-0 text-right text-sm font-normal italic leading-snug ${
                              showCorrect
                                ? "text-emerald-200/80"
                                : showWrong
                                  ? "text-red-200/80"
                                  : "text-white/50"
                            }`}
                            aria-label={`Pronunciation: ${optionRom}`}
                          >
                            {optionRom}
                          </span>
                        ) : null}
                      </span>
                    ) : (
                      opt
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              <label className="sr-only" htmlFor="quiz-type-input">
                Your answer
              </label>
              <input
                id="quiz-type-input"
                value={typed}
                onChange={onTypedChangeHandler}
                disabled={feedback !== null}
                autoComplete="off"
                lang={direction === "enToKo" ? "ko" : "en"}
                placeholder={direction === "enToKo" ? "한국어로 입력…" : "Type English…"}
                className={`w-full rounded-2xl border bg-ink-900/60 px-4 py-3.5 text-base text-paper placeholder:text-white/35 focus:outline-none focus:ring-2 ${
                  feedback === "wrong"
                    ? "border-red-500/50 focus:border-red-500/60 focus:ring-red-500/25"
                    : feedback === "correct"
                      ? "border-emerald-500/50 focus:border-emerald-500/60 focus:ring-emerald-500/25"
                      : "border-white/10 focus:border-mint/50 focus:ring-mint/30"
                }`}
              />
              <button
                type="button"
                onClick={onSubmitTypeHandler}
                disabled={feedback !== null || !typed.trim()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-mint py-3.5 text-base font-semibold text-white transition hover:bg-mint/90 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Check className="h-5 w-5" aria-hidden />
                Check
              </button>
            </div>
          )}
          {feedback !== null ? (
            <div
              className={`mt-6 space-y-3 rounded-2xl border p-4 ${
                feedback === "correct"
                  ? "border-emerald-500/45 bg-emerald-950/35"
                  : "border-red-500/45 bg-red-950/35"
              }`}
            >
              <p
                className={
                  feedback === "correct"
                    ? "font-semibold text-emerald-300"
                    : "font-semibold text-red-300"
                }
              >
                {feedback === "correct" ? "Correct!" : "Not quite — compare with the answer below."}
              </p>
              {direction === "enToKo" && current.rom ? (
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <p className="text-sm text-white/80">
                    <span
                      className={feedback === "correct" ? "text-emerald-200/90" : "text-red-200/90"}
                    >
                      Answer:{" "}
                    </span>
                    <span
                      className={`font-korean text-lg ${feedback === "correct" ? "text-emerald-100" : "text-red-100"}`}
                    >
                      {correctAnswer}
                    </span>
                  </p>
                  <p
                    className={`shrink-0 text-sm italic sm:max-w-[45%] sm:pt-0.5 sm:text-right ${
                      feedback === "correct" ? "text-emerald-200/75" : "text-red-200/75"
                    }`}
                    aria-label={`Pronunciation: ${current.rom}`}
                  >
                    {current.rom}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-white/80">
                  <span className={feedback === "correct" ? "text-emerald-200/90" : "text-red-200/90"}>
                    Answer:{" "}
                  </span>
                  <span
                    className={
                      direction === "enToKo"
                        ? `font-korean text-lg ${feedback === "correct" ? "text-emerald-100" : "text-red-100"}`
                        : feedback === "correct"
                          ? "text-emerald-100"
                          : "text-red-100"
                    }
                  >
                    {correctAnswer}
                  </span>
                </p>
              )}
              {current.rom && direction === "koToEn" ? (
                <p className="text-sm text-white/55">
                  Romanization: <span className="italic">{current.rom}</span>
                </p>
              ) : null}
              <button
                type="button"
                onClick={onNextHandler}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 ${
                  feedback === "correct"
                    ? "bg-emerald-800/50 text-emerald-50 hover:bg-emerald-800/65 focus-visible:ring-emerald-500/50"
                    : "bg-red-900/45 text-red-50 hover:bg-red-900/60 focus-visible:ring-red-500/50"
                }`}
              >
                Next
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ) : null}
        </article>
      ) : null}
    </div>
  );
};
