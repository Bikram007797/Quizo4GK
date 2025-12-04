'use client';

import Link from 'next/link';
import type { QuizSet } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, BarChart, Trophy } from 'lucide-react';

type QuizResultsProps = {
  quizSet: QuizSet;
  score: number;
  totalQuestions: number;
  timeTaken: number; // in seconds
};

export function QuizResults({
  quizSet,
  score,
  totalQuestions,
  timeTaken,
}: QuizResultsProps) {
  const accuracy = Math.round((score / totalQuestions) * 100);
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <Trophy className="mx-auto h-16 w-16 text-yellow-500" />
        <CardTitle className="text-3xl font-bold mt-4">Quiz Completed!</CardTitle>
        <CardDescription>You scored {score} out of {totalQuestions}.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="flex flex-col items-center justify-center rounded-lg bg-muted p-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <p className="mt-2 text-2xl font-bold">{score}</p>
            <p className="text-sm text-muted-foreground">Correct</p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg bg-muted p-4">
            <XCircle className="h-8 w-8 text-destructive" />
            <p className="mt-2 text-2xl font-bold">{totalQuestions - score}</p>
            <p className="text-sm text-muted-foreground">Incorrect</p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg bg-muted p-4">
            <BarChart className="h-8 w-8 text-blue-500" />
            <p className="mt-2 text-2xl font-bold">{accuracy}%</p>
            <p className="text-sm text-muted-foreground">Accuracy</p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg bg-muted p-4">
            <Clock className="h-8 w-8 text-purple-500" />
            <p className="mt-2 text-2xl font-bold">
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </p>
            <p className="text-sm text-muted-foreground">Time Taken</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="flex-1">
            <Link href={`/quiz/${quizSet.id}`}>Retry Quiz</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
