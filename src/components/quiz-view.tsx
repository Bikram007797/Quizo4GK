'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { QuizSet } from '@/lib/types';
import { useAppContext } from '@/contexts/app-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Bookmark, Loader2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  POINTS_PER_CORRECT_ANSWER,
  COINS_PER_CORRECT_ANSWER,
  XP_PER_COMPLETED_SET,
  XP_BONUS_FOR_PERFECT_SCORE,
} from '@/lib/constants';

type QuizViewProps = {
  quizSet: QuizSet;
};

export function QuizView({ quizSet }: QuizViewProps) {
  const router = useRouter();
  const {
    addAttempt,
    updateStats,
    toggleBookmark,
    isBookmarked,
    markSetAsCompleted,
  } = useAppContext();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    Array(quizSet.questions.length).fill(null)
  );
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setStartTime(Date.now());
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const currentQuestion = quizSet.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizSet.questions.length) * 100;
  
  const handleOptionSelect = (optionIndex: number) => {
    setSelectedAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestionIndex] = optionIndex;
      return newAnswers;
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizSet.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    let score = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === quizSet.questions[index].correctOptionIndex) {
        score++;
      }
    });

    const accuracy = (score / quizSet.questions.length) * 100;
    const pointsEarned = score * POINTS_PER_CORRECT_ANSWER;
    const coinsEarned = score * COINS_PER_CORRECT_ANSWER;
    let xpEarned = accuracy > 0 ? XP_PER_COMPLETED_SET : 0;
    if (accuracy === 100) {
        xpEarned += XP_BONUS_FOR_PERFECT_SCORE;
        markSetAsCompleted(quizSet.id);
    }

    addAttempt({
      quizSetId: quizSet.id,
      score,
      timeTaken,
      accuracy,
      timestamp: Date.now(),
    });

    updateStats({
      points: pointsEarned,
      coins: coinsEarned,
      xp: xpEarned
    });

    const userAnswersParam = encodeURIComponent(JSON.stringify(selectedAnswers));
    router.push(
      `/quiz/${quizSet.id}/results?score=${score}&total=${quizSet.questions.length}&time=${timeTaken}&answers=${userAnswersParam}`
    );
  };
  
  const selectedOption = selectedAnswers[currentQuestionIndex];
  const bookmarked = isBookmarked(currentQuestion.id);
  
  const handleToggleBookmark = useCallback(() => {
      toggleBookmark(currentQuestion.id);
  }, [toggleBookmark, currentQuestion.id]);
  
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
            <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-muted-foreground">
                <Clock className="h-5 w-5"/>
                <span>{formatTime(elapsedTime)}</span>
              </div>
              <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleBookmark}
                  aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark question'}
              >
                  <Bookmark className={cn(bookmarked ? 'fill-primary text-primary' : 'text-muted-foreground')} />
              </Button>
            </div>
        </div>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent className="pt-4">
         <CardDescription className="mb-6 text-base">{currentQuestion.questionText}</CardDescription>
        <RadioGroup
          value={selectedOption !== null ? selectedOption.toString() : ''}
          onValueChange={(value) => handleOptionSelect(parseInt(value))}
          className="space-y-4"
        >
          {currentQuestion.options.map((option, index) => (
            <Label
              key={index}
              htmlFor={`option-${index}`}
              className={cn(
                "flex items-center space-x-3 rounded-lg border p-4 transition-all cursor-pointer",
                selectedOption === index ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
              )}
            >
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <span className="flex-1 cursor-pointer text-base">{option}</span>
            </Label>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter className="justify-end">
        {currentQuestionIndex < quizSet.questions.length - 1 ? (
          <Button onClick={handleNext} disabled={selectedOption === null} size="lg">Next Question</Button>
        ) : (
          <Button onClick={handleSubmit} disabled={selectedOption === null || isSubmitting} size="lg">
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Quiz
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
