import { Info } from "lucide-react";
import type { NumbersSystemFilter } from "@/types";

type NumbersTopicInfoboxProps = {
  numbersFilter: NumbersSystemFilter;
  onNumbersFilterChangeHandler: (value: NumbersSystemFilter) => void;
};

const filterOptions: { value: NumbersSystemFilter; label: string }[] = [
  { value: "all", label: "All numbers" },
  { value: "sino", label: "Sino-Korean" },
  { value: "native", label: "Native" },
];

export const NumbersTopicInfobox = ({
  numbersFilter,
  onNumbersFilterChangeHandler,
}: NumbersTopicInfoboxProps) => {
  return (
    <aside
      className="rounded-2xl border border-mint/30 bg-mint/10 p-4 sm:p-5"
      aria-label="About Korean number systems"
    >
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint/25 text-mint">
          <Info className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-3 text-sm leading-relaxed text-paper/90">
          <p className="font-semibold text-paper">Native vs Sino-Korean numbers</p>
          <p>
            <span className="font-medium text-mint">Sino-Korean</span> (일, 이, 삼…) comes from
            Chinese numerals. In daily Korean it is used for dates, money, phone numbers, minutes,
            and many formal or large-scale counts.
          </p>
          <p>
            <span className="font-medium text-accent">Native Korean</span> (하나, 둘, 셋…) is the
            older Korean system. Use it with most <span className="text-paper/80">counters</span>{" "}
            when counting things (한 개, 두 명), for age, and for hours on the clock — while minutes
            often stay Sino-Korean.
          </p>
          <p className="text-xs text-white/55">
            In this list, entries labeled <strong className="text-paper/70">Sino-Korean</strong> vs{" "}
            <strong className="text-paper/70">native Korean</strong> match those two systems.
          </p>
          <div
            className="border-t border-mint/25 pt-4"
            role="radiogroup"
            aria-label="Filter by number system"
          >
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/50">Show</p>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={numbersFilter === value}
                  onClick={() => onNumbersFilterChangeHandler(value)}
                  className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-mint ${
                    numbersFilter === value
                      ? "bg-mint text-white shadow-sm"
                      : "bg-ink-900/40 text-paper/85 hover:bg-ink-900/60"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
