import { useEffect, useState } from "react";
import type { VocabEntry } from "@/types";

export const useVocabulary = () => {
  const [items, setItems] = useState<VocabEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/vocabulary.json");
        if (!res.ok) {
          throw new Error("Could not load vocabulary");
        }
        const data = (await res.json()) as VocabEntry[];
        if (!cancelled) {
          setItems(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Load failed");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { items, error };
};
