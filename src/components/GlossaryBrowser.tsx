import { useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import type { NumbersSystemFilter, VocabEntry } from "@/types";
import { NumbersTopicInfobox } from "@/components/NumbersTopicInfobox";
import { SearchableTopicSelect } from "@/components/SearchableTopicSelect";
import { entryMatchesNumbersFilter, isNumbersTopic } from "@/lib/numbersTopic";

type GlossaryBrowserProps = {
  items: VocabEntry[];
};

export const GlossaryBrowser = ({ items }: GlossaryBrowserProps) => {
  const [query, setQuery] = useState(() => "");
  const [topic, setTopic] = useState<string | null>(() => null);
  const [numbersFilter, setNumbersFilter] = useState<NumbersSystemFilter>(() => "all");

  const topics = useMemo(() => {
    const s = new Set<string>();
    items.forEach((i) => s.add(i.topic));
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((e) => {
      if (topic && e.topic !== topic) {
        return false;
      }
      if (isNumbersTopic(topic) && !entryMatchesNumbersFilter(e, numbersFilter)) {
        return false;
      }
      if (!q) {
        return true;
      }
      return (
        e.en.toLowerCase().includes(q) ||
        e.ko.includes(query.trim()) ||
        e.rom.toLowerCase().includes(q) ||
        e.topic.toLowerCase().includes(q)
      );
    });
  }, [items, query, topic, numbersFilter]);

  const onQueryChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(() => e.target.value);
  };

  const onTopicSelectChangeHandler = (t: string | null) => {
    setTopic(() => t);
    if (!isNumbersTopic(t)) {
      setNumbersFilter(() => "all");
    }
  };

  const onNumbersFilterChangeHandler = (value: NumbersSystemFilter) => {
    setNumbersFilter(() => value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-paper/90">
        <BookOpen className="h-6 w-6 text-accent" aria-hidden />
        <h2 className="text-xl font-semibold tracking-tight">Glossary</h2>
        <span className="ml-auto text-sm text-white/50">{filtered.length} entries</span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <SearchableTopicSelect
          topics={topics}
          value={topic}
          onChangeHandler={onTopicSelectChangeHandler}
          totalEntryCount={items.length}
        />
        <div className="relative min-w-0">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={onQueryChangeHandler}
            placeholder="Search English, Korean, romanization…"
            aria-label="Search glossary"
            className="w-full rounded-2xl border border-white/10 bg-ink-800 py-3.5 pl-12 pr-4 text-base text-paper placeholder:text-white/35 focus:border-mint/50 focus:outline-none focus:ring-2 focus:ring-mint/30"
          />
        </div>
      </div>
      {isNumbersTopic(topic) ? (
        <NumbersTopicInfobox
          numbersFilter={numbersFilter}
          onNumbersFilterChangeHandler={onNumbersFilterChangeHandler}
        />
      ) : null}
      <ul className="space-y-3" aria-label="Glossary entries">
        {filtered.map((e) => (
          <li
            key={e.id}
            className="rounded-2xl border border-white/10 bg-ink-800/50 p-4 shadow-sm backdrop-blur-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-accent/90">{e.topic}</p>
            <p className="mt-1 font-korean text-lg font-semibold text-paper">{e.ko}</p>
            <p className="mt-0.5 text-base text-paper/90">{e.en}</p>
            {e.rom ? (
              <p className="mt-2 text-sm italic text-white/55">{e.rom}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
};
