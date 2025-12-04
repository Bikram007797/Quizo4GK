'use client';

import { useEffect, useState } from 'react';
import { getSubjectBySlug, getChapterBySlug, getQuizSetsByChapterId, getChallengeTitle } from '@/lib/quiz-helpers';
import type { ChallengeType, QuizSet as QuizSetType } from '@/lib/types';
import { AppHeader } from '@/components/app-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Medal, Repeat, CheckCircle2, Play, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useAppContext } from '@/contexts/app-provider';
import { Skeleton } from '@/components/ui/skeleton';

export default function ChapterPage() {
  const params = useParams();
  const { challengeType, subjectSlug, chapterSlug } = params as {
    challengeType: ChallengeType;
    subjectSlug: string;
    chapterSlug: string;
  };

  const { getBestScore, getAttemptsCount, userData, isLoading, getLastAttempt } = useAppContext();
  
  const [subject, setSubject] = useState<ReturnType<typeof getSubjectBySlug>>(undefined);
  const [chapter, setChapter] = useState<ReturnType<typeof getChapterBySlug>>(undefined);
  const [quizSets, setQuizSets] = useState<QuizSetType[]>([]);

  useEffect(() => {
    const foundSubject = getSubjectBySlug(subjectSlug);
    if (foundSubject) {
      setSubject(foundSubject);
      const foundChapter = getChapterBySlug(foundSubject.id, chapterSlug);
      if (foundChapter) {
        setChapter(foundChapter);
        setQuizSets(getQuizSetsByChapterId(foundChapter.id));
      } else {
        notFound();
      }
    } else {
      notFound();
    }
  }, [subjectSlug, chapterSlug]);


  if (!subject || !chapter) {
    return null; // or a loading state
  }

  const challengeTitle = getChallengeTitle(challengeType);

  const PageTitle = (
    <div>
      <div className="text-lg md:text-xl font-bold">{chapter.title}</div>
      <div className="text-xs text-muted-foreground">{`${challengeTitle}: ${subject.title}`}</div>
    </div>
  );

  return (
    <>
      <AppHeader title={PageTitle} />
      <main className="flex-1">
        <div className="container py-8 px-4 md:px-6">
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
                        <Link href={`/quiz/${set.id}/results?score=${lastAttempt.score}&total=${set.questions.length}&time=${lastAttempt.timeTaken}&answers=${encodeURIComponent(JSON.stringify(lastAttempt.userAnswers))}`} passHref>
                            <Button size="lg" variant="outline">
                                <BookOpen className="mr-2 h-5 w-5" />
                                View Solutions
                            </Button>
                        </Link>
                       )}
                      <Link href={`/quiz/${set.id}`} passHref>
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
        </div>
      </main>
    </>
  );
}
