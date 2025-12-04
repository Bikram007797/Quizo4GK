'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { QuizSet } from '@/lib/types';
import { useAppContext } from '@/contexts/app-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Bookmark, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  POINTS_PER_CORRECT_ANSWER,
  COINS_PER_CORRECT_ANSWER,
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

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

    addAttempt({
      quizSetId: quizSet.id,
      score,
      timeTaken,
      accuracy,
      timestamp: Date.now(),
    });

    updateStats({
      points: score * POINTS_PER_CORRECT_ANSWER,
      coins: score * COINS_PER_CORRECT_ANSWER,
    });
    
    if (accuracy === 100) {
        markSetAsCompleted(quizSet.id);
    }

    // Pass results state to the results page
    router.push(
      `/quiz/${quizSet.id}/results?score=${score}&total=${quizSet.questions.length}&time=${timeTaken}`
    );
  };
  
  const selectedOption = selectedAnswers[currentQuestionIndex];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleBookmark(currentQuestion.id)}
                aria-label={isBookmarked(currentQuestion.id) ? 'Remove bookmark' : 'Bookmark question'}
            >
                <Bookmark className={cn(isBookmarked(currentQuestion.id) ? 'fill-primary text-primary' : 'text-muted-foreground')} />
            </Button>
        </div>
        <CardDescription>{currentQuestion.questionText}</CardDescription>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedOption !== null ? selectedOption.toString() : ''}
          onValueChange={(value) => handleOptionSelect(parseInt(value))}
          className="space-y-4"
        >
          {currentQuestion.options.map((option, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center space-x-3 rounded-lg border p-4 transition-all cursor-pointer",
                selectedOption === index ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
              )}
              onClick={() => handleOptionSelect(index)}
            >
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">{option}</Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter className="justify-between">
        {currentQuestionIndex < quizSet.questions.length - 1 ? (
          <Button onClick={handleNext} disabled={selectedOption === null}>Next Question</Button>
        ) : (
          <Button onClick={handleSubmit} disabled={selectedOption === null || isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Quiz
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
