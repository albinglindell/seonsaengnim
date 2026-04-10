import { useMemo, useState } from "react";
import { BookOpen, GraduationCap, Languages } from "lucide-react";
import { useVocabulary } from "@/hooks/useVocabulary";
import { GlossaryBrowser } from "@/components/GlossaryBrowser";
import { NumbersTopicInfobox } from "@/components/NumbersTopicInfobox";
import { QuizSession } from "@/components/QuizSession";
import { isNumbersTopic } from "@/lib/numbersTopic";
import type { NumbersSystemFilter, QuizDirection } from "@/types";

type Tab = "glossary" | "quiz";

const App = () => {
  const { items, error } = useVocabulary();
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

  const onDirectionKoEnHandler = () => {
    setDirection(() => "koToEn");
  };

  const onDirectionEnKoHandler = () => {
    setDirection(() => "enToKo");
  };

  const onQuizTopicChangeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    const next = v === "__all__" ? null : v;
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
          <div className="flex shrink-0 gap-2 rounded-2xl border border-white/10 bg-ink-800/60 p-1">
            <button
              type="button"
              onClick={onTabGlossaryHandler}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-mint sm:flex-none ${
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
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-mint sm:flex-none ${
                tab === "quiz"
                  ? "bg-accent text-white shadow"
                  : "text-paper/80 hover:bg-white/5"
              }`}
              aria-pressed={tab === "quiz"}
            >
              <GraduationCap className="h-4 w-4 shrink-0" aria-hidden />
              Quiz
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
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-center gap-2 text-paper/90">
                  <Languages className="h-6 w-6 text-accent" aria-hidden />
                  <h2 className="text-xl font-semibold tracking-tight">Quiz</h2>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label className="text-xs font-medium uppercase tracking-wide text-white/45">
                    Topic
                    <select
                      value={quizTopic ?? "__all__"}
                      onChange={onQuizTopicChangeHandler}
                      aria-label="Filter quiz by topic"
                      className="mt-1 block w-full rounded-xl border border-white/10 bg-ink-800 px-3 py-2.5 text-sm text-paper focus:border-mint/50 focus:outline-none focus:ring-2 focus:ring-mint/30 sm:mt-0 sm:ml-2 sm:inline-block sm:w-56"
                    >
                      <option value="__all__">All topics ({items.length})</option>
                      {topics.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div
                    className="inline-flex rounded-2xl border border-white/10 bg-ink-800/80 p-1"
                    role="group"
                    aria-label="Quiz direction"
                  >
                    <button
                      type="button"
                      onClick={onDirectionKoEnHandler}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-mint ${
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
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-mint ${
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
