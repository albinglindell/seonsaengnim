import { useEffect, useState } from "react";
import { loadQuizLog, QUIZ_LOG_EVENT, type QuizPersisted } from "@/lib/quizStorage";

export const useQuizLog = (): QuizPersisted => {
  const [snapshot, setSnapshot] = useState<QuizPersisted>(() => loadQuizLog());

  useEffect(() => {
    const onUpdateHandler = () => {
      setSnapshot(() => loadQuizLog());
    };
    window.addEventListener(QUIZ_LOG_EVENT, onUpdateHandler);
    return () => window.removeEventListener(QUIZ_LOG_EVENT, onUpdateHandler);
  }, []);

  return snapshot;
};
