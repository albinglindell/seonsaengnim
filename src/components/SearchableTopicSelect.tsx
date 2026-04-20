import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

type SearchableTopicSelectProps = {
  topics: string[];
  value: string | null;
  onChangeHandler: (topic: string | null) => void;
  totalEntryCount: number;
  accessibilityLabel?: string;
};

export const SearchableTopicSelect = ({
  topics,
  value,
  onChangeHandler,
  totalEntryCount,
  accessibilityLabel = "Filter glossary by topic",
}: SearchableTopicSelectProps) => {
  const [isOpen, setIsOpen] = useState(() => false);
  const [listQuery, setListQuery] = useState(() => "");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const q = listQuery.trim().toLowerCase();
  const filteredTopics = q
    ? topics.filter((t) => t.toLowerCase().includes(q))
    : topics;

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onDocumentMouseDownHandler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(() => false);
        setListQuery(() => "");
      }
    };
    document.addEventListener("mousedown", onDocumentMouseDownHandler);
    return () => document.removeEventListener("mousedown", onDocumentMouseDownHandler);
  }, [isOpen]);

  const onTriggerClickHandler = () => {
    setListQuery(() => "");
    setIsOpen((open) => !open);
  };

  const onTriggerKeyDownHandler = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onTriggerClickHandler();
    }
    if (e.key === "Escape" && isOpen) {
      e.preventDefault();
      setIsOpen(() => false);
      setListQuery(() => "");
    }
  };

  const onListQueryChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setListQuery(() => e.target.value);
  };

  const onSelectTopicHandler = (t: string | null) => {
    onChangeHandler(t);
    setIsOpen(() => false);
    setListQuery(() => "");
  };

  const onInputKeyDownHandler = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(() => false);
      setListQuery(() => "");
    }
  };

  const label = value ?? `All topics (${totalEntryCount})`;

  return (
    <div ref={rootRef} className="relative w-full">
      <span id={`${listboxId}-label`} className="sr-only">
        {accessibilityLabel}
      </span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-labelledby={`${listboxId}-label`}
        onClick={onTriggerClickHandler}
        onKeyDown={onTriggerKeyDownHandler}
        className="flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-ink-800 py-3 pl-4 pr-3 text-left text-base text-paper transition hover:border-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-mint/40"
      >
        <span className="min-w-0 flex-1 truncate font-medium">{label}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-white/45 transition ${isOpen ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {isOpen ? (
        <div
          className="absolute left-0 right-0 z-20 mt-2 max-h-[min(22rem,70vh)] overflow-hidden rounded-2xl border border-white/10 bg-ink-800 shadow-xl ring-1 ring-black/20"
          role="presentation"
        >
          <div className="border-b border-white/10 p-2">
            <input
              ref={inputRef}
              type="search"
              value={listQuery}
              onChange={onListQueryChangeHandler}
              onKeyDown={onInputKeyDownHandler}
              placeholder="Search topics…"
              aria-label="Search topics"
              className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2.5 text-base text-paper placeholder:text-white/35 focus:border-mint/50 focus:outline-none focus:ring-2 focus:ring-mint/25"
            />
          </div>
          <ul
            id={listboxId}
            role="listbox"
            aria-label="Topics"
            className="max-h-60 overflow-y-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <li role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={value === null}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSelectTopicHandler(null)}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-base text-paper hover:bg-white/10 focus:bg-white/10 focus:outline-none"
              >
                {value === null ? (
                  <Check className="h-4 w-4 shrink-0 text-mint" aria-hidden />
                ) : (
                  <span className="w-4 shrink-0" aria-hidden />
                )}
                <span>All topics ({totalEntryCount})</span>
              </button>
            </li>
            {filteredTopics.map((t) => (
              <li key={t} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={value === t}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onSelectTopicHandler(t)}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-base text-paper hover:bg-white/10 focus:bg-white/10 focus:outline-none"
                >
                  {value === t ? (
                    <Check className="h-4 w-4 shrink-0 text-mint" aria-hidden />
                  ) : (
                    <span className="w-4 shrink-0" aria-hidden />
                  )}
                  <span className="truncate">{t}</span>
                </button>
              </li>
            ))}
            {q && filteredTopics.length === 0 ? (
              <li className="px-3 py-4 text-center text-base text-white/45">No topic matches.</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
};
