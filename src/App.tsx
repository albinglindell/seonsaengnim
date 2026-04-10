import { useMemo, useState } from "react";
import { BadgeCheck, BookOpen, CircleAlert, GraduationCap, Languages } from "lucide-react";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useQuizLog } from "@/hooks/useQuizLog";
import { GlossaryBrowser } from "@/components/GlossaryBrowser";
import { NumbersTopicInfobox } from "@/components/NumbersTopicInfobox";
import { QuizSession } from "@/components/QuizSession";
import { ReviewCorrect } from "@/components/ReviewCorrect";
import { ReviewMistakes } from "@/components/ReviewMistakes";
import { SearchableTopicSelect } from "@/components/SearchableTopicSelect";
import { isNumbersTopic } from "@/lib/numbersTopic";
import type { NumbersSystemFilter, QuizDirection } from "@/types";

type Tab = "glossary" | "quiz" | "review" | "correct";

const App = () => {
  const { items, error } = useVocabulary();
  const quizLog = useQuizLog();
  const [tab, setTab] = useState<Tab>(() => "glossary");
  const [quizTopic, setQuizTopic] = useState<string | null>(() => null);
  const [quizNumbersFilter, setQuizNumbersFilter] = useState<NumbersSystemFilter>(() => "all");
  const [direction, setDirection] = useState<QuizDirection>(() => "koToEn");

  const topics = useMemo(() => {
    if (!items) {
      return [];
    }
    const s = new Set<string>();
    items.forEach((i) => s.add(i.topic));
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [items]);

  const onTabGlossaryHandler = () => {
    setTab(() => "glossary");
  };

  const onTabQuizHandler = () => {
    setTab(() => "quiz");
  };

  const onTabReviewHandler = () => {
    setTab(() => "review");
  };

  const onTabCorrectHandler = () => {
    setTab(() => "correct");
  };

  const onDirectionKoEnHandler = () => {
    setDirection(() => "koToEn");
  };

  const onDirectionEnKoHandler = () => {
    setDirection(() => "enToKo");
  };

  const onQuizTopicSelectChangeHandler = (next: string | null) => {
    setQuizTopic(() => next);
    if (!isNumbersTopic(next)) {
      setQuizNumbersFilter(() => "all");
    }
  };

  const onQuizNumbersFilterChangeHandler = (value: NumbersSystemFilter) => {
    setQuizNumbersFilter(() => value);
  };

  return (
    <div className="min-h-dvh pb-16">
      <header className="border-b border-white/10 bg-ink-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:py-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">
              Collins Korean
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-paper sm:text-3xl">
              Words &amp; phrases
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60">
              Browse the glossary from your PDF extract, then quiz yourself with hints and
              romanization from the book.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap justify-end gap-2 rounded-2xl border border-white/10 bg-ink-800/60 p-1">
            <button
              type="button"
              onClick={onTabGlossaryHandler}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-mint min-[420px]:flex-none min-[420px]:px-4 ${
                tab === "glossary"
                  ? "bg-accent text-white shadow"
                  : "text-paper/80 hover:bg-white/5"
              }`}
              aria-pressed={tab === "glossary"}
            >
              <BookOpen className="h-4 w-4 shrink-0" aria-hidden />
              Glossary
            </button>
            <button
              type="button"
              onClick={onTabQuizHandler}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-mint min-[420px]:flex-none min-[420px]:px-4 ${
                tab === "quiz"
                  ? "bg-accent text-white shadow"
                  : "text-paper/80 hover:bg-white/5"
              }`}
              aria-pressed={tab === "quiz"}
            >
              <GraduationCap className="h-4 w-4 shrink-0" aria-hidden />
              Quiz
            </button>
            <button
              type="button"
              onClick={onTabReviewHandler}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-mint min-[420px]:flex-none min-[420px]:px-4 ${
                tab === "review"
                  ? "bg-accent text-white shadow"
                  : "text-paper/80 hover:bg-white/5"
              }`}
              aria-pressed={tab === "review"}
            >
              <CircleAlert className="h-4 w-4 shrink-0" aria-hidden />
              <span className="whitespace-nowrap">Review</span>
              {quizLog.wrong.length > 0 ? (
                <span className="min-w-[1.25rem] rounded-full bg-red-500/35 px-1.5 text-center text-xs font-bold tabular-nums text-red-100">
                  {quizLog.wrong.length > 99 ? "99+" : quizLog.wrong.length}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              onClick={onTabCorrectHandler}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-mint min-[420px]:flex-none min-[420px]:px-4 ${
                tab === "correct"
                  ? "bg-accent text-white shadow"
                  : "text-paper/80 hover:bg-white/5"
              }`}
              aria-pressed={tab === "correct"}
            >
              <BadgeCheck className="h-4 w-4 shrink-0" aria-hidden />
              <span className="whitespace-nowrap">Correct</span>
              {quizLog.right.length > 0 ? (
                <span className="min-w-[1.25rem] rounded-full bg-emerald-500/35 px-1.5 text-center text-xs font-bold tabular-nums text-emerald-100">
                  {quizLog.right.length > 99 ? "99+" : quizLog.right.length}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {error ? (
          <p className="rounded-2xl border border-accent/40 bg-accent/10 p-6 text-center text-paper">
            {error}
          </p>
        ) : null}
        {!items && !error ? (
          <p className="rounded-2xl border border-white/10 bg-ink-800/40 p-8 text-center text-white/60">
            Loading vocabulary…
          </p>
        ) : null}
        {items ? (
          tab === "glossary" ? (
            <GlossaryBrowser items={items} />
          ) : tab === "review" ? (
            <ReviewMistakes wrong={quizLog.wrong} />
          ) : tab === "correct" ? (
            <ReviewCorrect right={quizLog.right} items={items} />
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-paper/90">
                  <Languages className="h-6 w-6 text-accent" aria-hidden />
                  <h2 className="text-xl font-semibold tracking-tight">Quiz</h2>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <SearchableTopicSelect
                    topics={topics}
                    value={quizTopic}
                    onChangeHandler={onQuizTopicSelectChangeHandler}
                    totalEntryCount={items.length}
                    accessibilityLabel="Filter quiz by topic"
                  />
                  <div
                    className="inline-flex w-full rounded-2xl border border-white/10 bg-ink-800/80 p-1 sm:w-auto"
                    role="group"
                    aria-label="Quiz direction"
                  >
                    <button
                      type="button"
                      onClick={onDirectionKoEnHandler}
                      className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-mint sm:flex-none sm:py-2 ${
                        direction === "koToEn"
                          ? "bg-mint text-white"
                          : "text-paper/80 hover:bg-white/5"
                      }`}
                      aria-pressed={direction === "koToEn"}
                    >
                      Korean → English
                    </button>
                    <button
                      type="button"
                      onClick={onDirectionEnKoHandler}
                      className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-mint sm:flex-none sm:py-2 ${
                        direction === "enToKo"
                          ? "bg-mint text-white"
                          : "text-paper/80 hover:bg-white/5"
                      }`}
                      aria-pressed={direction === "enToKo"}
                    >
                      English → Korean
                    </button>
                  </div>
                </div>
              </div>
              {isNumbersTopic(quizTopic) ? (
                <NumbersTopicInfobox
                  numbersFilter={quizNumbersFilter}
                  onNumbersFilterChangeHandler={onQuizNumbersFilterChangeHandler}
                />
              ) : null}
              <QuizSession
                items={items}
                topicFilter={quizTopic}
                direction={direction}
                numbersSystemFilter={quizNumbersFilter}
              />
            </div>
          )
        ) : null}
      </main>
    </div>
  );
};

export default App;
