
'use client';

import { useEffect, useState } from 'react';
import { getQuizSetsByChapterId } from '@/lib/quiz-helpers';
import type { QuizSet as QuizSetType, Chapter } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Medal, Repeat, CheckCircle2, Play, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useAppContext } from '@/contexts/app-provider';
import { Skeleton } from '@/components/ui/skeleton';

type ChapterClientPageProps = {
    chapter: Chapter;
}

export function ChapterClientPage({ chapter }: ChapterClientPageProps) {
  const { getBestScore, getAttemptsCount, userData, isLoading, getLastAttempt } = useAppContext();
  const [quizSets, setQuizSets] = useState<QuizSetType[]>([]);

  useEffect(() => {
    setQuizSets(getQuizSetsByChapterId(chapter.id));
  }, [chapter.id]);

  return (
    <>
      <h2 className="mb-6 text-2xl font-bold tracking-tight font-headline">Quiz Sets</h2>
      <div className="grid gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </>
        ) : (
        quizSets.map(set => {
          const bestScore = getBestScore(set.id);
          const attempts = getAttemptsCount(set.id);
          const progress = bestScore !== null ? (bestScore / set.questions.length) * 100 : 0;
          const isCompleted = userData.completedSets.includes(set.id);
          const lastAttempt = getLastAttempt(set.id);

          return (
            <Card key={set.id} className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-3">
                  <h3 className="text-lg font-semibold font-headline">{set.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1" title="Attempts">
                      <Repeat className="h-4 w-4" />
                      <span>{attempts}</span>
                    </div>
                    <div className="flex items-center gap-1" title="Best Score">
                      <Medal className="h-4 w-4" />
                      <span>{bestScore !== null ? `${bestScore} / ${set.questions.length}` : 'N/A'}</span>
                    </div>
                    {isCompleted && (
                      <div className="flex items-center gap-1 text-green-500" title="Completed">
                         <CheckCircle2 className="h-4 w-4" />
                        <span>Completed</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
                <div className="flex items-center justify-start sm:justify-end gap-2">
                   {lastAttempt && (
                    <Link href={`/quiz/${set.id}/results/?score=${lastAttempt.score}&total=${set.questions.length}&time=${lastAttempt.timeTaken}&answers=${encodeURIComponent(JSON.stringify(lastAttempt.userAnswers))}`} passHref>
                        <Button size="lg" variant="outline">
                            <BookOpen className="mr-2 h-5 w-5" />
                            View Solutions
                        </Button>
                    </Link>
                   )}
                  <Link href={`/quiz/${set.id}/`} passHref>
                    <Button size="lg" className="w-full sm:w-auto">
                      <Play className="mr-2 h-5 w-5" />
                      {attempts > 0 ? 'Retry' : 'Play'}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          );
        })
        )}
      </div>
    </>
  );
}
