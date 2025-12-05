
import { getQuizSetById, getQuizSetsByChapterId } from '@/lib/quiz-helpers';
import { notFound } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { chapters } from '@/data/quiz-data';
import { ResultsClientPage } from './results-client-page';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export async function generateStaticParams() {
  const quizSets = chapters.flatMap(c => getQuizSetsByChapterId(c.id));
  return quizSets.map(set => ({
    quizSetId: set.id,
  }));
}

type ResultsPageProps = {
  params: {
    quizSetId: string;
  };
};

export default function ResultsPage({ params }: ResultsPageProps) {
  const quizSet = getQuizSetById(params.quizSetId);

  if (!quizSet) {
    notFound();
  }

  return (
    <>
      <AppHeader title={`Results: ${quizSet.title}`} />
      <main className="flex-1">
        <div className="container py-8 px-4 md:px-6">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <ResultsClientPage quizSet={quizSet} />
          </Suspense>
        </div>
      </main>
    </>
  );
}
