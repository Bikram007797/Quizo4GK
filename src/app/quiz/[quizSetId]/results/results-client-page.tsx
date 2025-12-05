
'use client';

import { useSearchParams } from 'next/navigation';
import { QuizResults } from '@/components/quiz-results';
import { Skeleton } from '@/components/ui/skeleton';
import type { QuizSet } from '@/lib/types';

type ResultsClientPageProps = {
  quizSet: QuizSet;
};

export function ResultsClientPage({ quizSet }: ResultsClientPageProps) {
  const searchParams = useSearchParams();

  const score = searchParams.get('score');
  const total = searchParams.get('total');
  const time = searchParams.get('time');
  const answersParam = searchParams.get('answers');

  if (score === null || total === null || time === null || answersParam === null) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  let userAnswers: (number | null)[] = [];
  try {
    userAnswers = JSON.parse(decodeURIComponent(answersParam));
  } catch (e) {
    console.error("Failed to parse answers", e);
    // Handle error or show a message
  }

  return (
    <QuizResults
      quizSet={quizSet}
      score={parseInt(score)}
      totalQuestions={parseInt(total)}
      timeTaken={parseInt(time)}
      userAnswers={userAnswers}
    />
  );
}
