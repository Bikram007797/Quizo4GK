'use client';

import Link from 'next/link';
import type { QuizSet, Question } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CheckCircle, XCircle, Clock, BarChart, Trophy, Star, Gem, TrendingUp, HelpCircle, Bookmark } from 'lucide-react';
import {
  COINS_PER_CORRECT_ANSWER,
  POINTS_PER_CORRECT_ANSWER,
  XP_PER_COMPLETED_SET,
  XP_BONUS_FOR_PERFECT_SCORE
} from '@/lib/constants';
import { useAppContext } from '@/contexts/app-provider';
import { cn } from '@/lib/utils';
import { useCallback } from 'react';

type QuizResultsProps = {
  quizSet: QuizSet;
  score: number;
  totalQuestions: number;
  timeTaken: number; // in seconds
  userAnswers: (number | null)[];
};

export function QuizResults({
  quizSet,
  score,
  totalQuestions,
  timeTaken,
  userAnswers,
}: QuizResultsProps) {
  const { isBookmarked, toggleBookmark } = useAppContext();

  const accuracy = Math.round((score / totalQuestions) * 100);
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;

  const pointsEarned = score * POINTS_PER_CORRECT_ANSWER;
  const coinsEarned = score * COINS_PER_CORRECT_ANSWER;
  let xpEarned = score > 0 ? XP_PER_COMPLETED_SET : 0;
  if (accuracy === 100) {
      xpEarned += XP_BONUS_FOR_PERFECT_SCORE;
  }
  
  const getOptionText = (question: Question, index: number | null) => {
    if (index === null) return 'Not Answered';
    return question.options[index];
  }

  const QuestionReviewItem = ({ question, userAnswerIndex, index }: { question: Question, userAnswerIndex: number | null, index: number }) => {
    const isCorrect = userAnswerIndex === question.correctOptionIndex;
    const bookmarked = isBookmarked(question.id);
  
    const handleToggleBookmark = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        toggleBookmark(question.id);
    }, [toggleBookmark, question.id]);

    return (
      <AccordionItem value={`item-${index}`} key={question.id}>
        <AccordionTrigger>
          <div className="flex flex-1 items-center justify-between gap-2 text-left">
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              )}
              <span>{`Q${index + 1}: ${question.questionText}`}</span>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="space-y-3 pl-8">
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleBookmark}
              aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark question'}
            >
              <Bookmark className={cn('mr-2 h-4 w-4', bookmarked ? 'fill-primary text-primary' : 'text-muted-foreground')} />
              {bookmarked ? 'Bookmarked' : 'Bookmark'}
            </Button>
          </div>
          <p><strong>Your Answer:</strong> <span className={isCorrect ? 'text-green-600' : 'text-destructive'}>{getOptionText(question, userAnswerIndex)}</span></p>
          {!isCorrect && <p><strong>Correct Answer:</strong> <span className="text-green-600">{getOptionText(question, question.correctOptionIndex)}</span></p>}
          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md"><strong>Explanation:</strong> {question.explanation}</p>
        </AccordionContent>
      </AccordionItem>
    );
  };


  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <Trophy className="mx-auto h-16 w-16 text-yellow-500" />
          <CardTitle className="text-3xl font-bold mt-4">Quiz Completed!</CardTitle>
          <CardDescription>Here's your performance breakdown.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="flex flex-col items-center justify-center rounded-lg bg-muted p-4">
                <Star className="h-8 w-8 text-yellow-400" />
                <p className="mt-2 text-2xl font-bold">{pointsEarned}</p>
                <p className="text-sm text-muted-foreground">Points Earned</p>
              </div>
              <div className="flex flex-col items-center justify-center rounded-lg bg-muted p-4">
                <Gem className="h-8 w-8 text-teal-400" />
                <p className="mt-2 text-2xl font-bold">{coinsEarned}</p>
                <p className="text-sm text-muted-foreground">Coins Earned</p>
              </div>
              <div className="flex flex-col items-center justify-center rounded-lg bg-muted p-4">
                <TrendingUp className="h-8 w-8 text-indigo-500" />
                <p className="mt-2 text-2xl font-bold">{xpEarned}</p>
                <p className="text-sm text-muted-foreground">XP Gained</p>
              </div>
               <div className="flex flex-col items-center justify-center rounded-lg bg-muted p-4">
                <HelpCircle className="h-8 w-8 text-gray-500" />
                <p className="mt-2 text-xl font-bold">Level Info</p>
                 <p className="text-xs text-muted-foreground">Check Profile</p>
              </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1">
              <Link href={`/quiz/${quizSet.id}/`}>Retry Quiz</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Detailed Review</CardTitle>
            <CardDescription>Expand each question to see the solution.</CardDescription>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full">
                {quizSet.questions.map((question, index) => (
                    <QuestionReviewItem
                        key={question.id}
                        question={question}
                        userAnswerIndex={userAnswers[index]}
                        index={index}
                    />
                ))}
            </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
