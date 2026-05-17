"use client";

import { createContext, useContext, useState } from "react";

type QuizContextType = { quizOpen: boolean; setQuizOpen: (v: boolean) => void };

const QuizContext = createContext<QuizContextType>({ quizOpen: false, setQuizOpen: () => {} });

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [quizOpen, setQuizOpen] = useState(false);
  return <QuizContext.Provider value={{ quizOpen, setQuizOpen }}>{children}</QuizContext.Provider>;
}

export function useQuiz() {
  return useContext(QuizContext);
}
