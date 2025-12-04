'use client';

import { Suspense } from 'react';
import { getQuizSetById } from '@/lib/quiz-helpers';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { QuizResults } from '@/components/quiz-results';
import { Skeleton } from '@/components/ui/skeleton';

function ResultsContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const quizSetId = params.quizSetId as string;

    const quizSet = getQuizSetById(quizSetId);

    if (!quizSet) {
        notFound();
    }

    const score = searchParams.get('score');
    const total = searchParams.get('total');
    const time = searchParams.get('time');

    if (score === null || total === null || time === null) {
      return (
        <div className="container py-8 px-4 md:px-6">
          <Skeleton className="h-[400px] w-full" />
        </div>
      );
    }

    return (
        <QuizResults
            quizSet={quizSet}
            score={parseInt(score)}
            totalQuestions={parseInt(total)}
            timeTaken={parseInt(time)}
        />
    );
}


export default function ResultsPage() {
    const params = useParams();
    const quizSetId = params.quizSetId as string;
    const quizSet = getQuizSetById(quizSetId);

    if (!quizSet) {
        notFound();
    }

    return (
        <>
            <AppHeader title={`Results: ${quizSet.title}`} />
            <main className="flex-1">
                 <div className="container py-8 px-4 md:px-6">
                    <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                        <ResultsContent />
                    </Suspense>
                </div>
            </main>
        </>
    );
}
