'use client';

import { AppHeader } from '@/components/app-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookMarked, Trash2 } from 'lucide-react';
import { useAppContext } from '@/contexts/app-provider';
import { getQuestionById } from '@/lib/quiz-helpers';

export default function BookmarksPage() {
  const { userData, toggleBookmark } = useAppContext();
  const bookmarkedQuestions = userData.bookmarks
    .map(questionId => getQuestionById(questionId))
    .filter(Boolean); // Filter out any undefined results

  return (
    <>
      <AppHeader title="Bookmarks" />
      <main className="flex-1">
        <div className="container py-8 px-4 md:px-6">
          <Card>
            <CardHeader>
              <CardTitle>My Bookmarked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              {bookmarkedQuestions.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {bookmarkedQuestions.map(({ question, quizSet }, index) => (
                    <AccordionItem value={`item-${index}`} key={question.id}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-2 text-left">
                          <span>{`Q${index + 1}: ${question.questionText}`}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pl-8">
                        <div>
                          <p className="font-semibold">Options:</p>
                          <ul className="list-disc pl-5 text-muted-foreground">
                            {question.options.map((option, i) => (
                              <li key={i}>{option}</li>
                            ))}
                          </ul>
                        </div>
                        <p>
                          <strong>Correct Answer:</strong>{' '}
                          <span className="text-green-600">{question.options[question.correctOptionIndex]}</span>
                        </p>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                          <strong>Explanation:</strong> {question.explanation}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleBookmark(question.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove Bookmark
                        </Button>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 text-center text-muted-foreground p-8">
                  <BookMarked className="h-16 w-16" />
                  <p className="text-lg font-medium">No bookmarks yet!</p>
                  <p>You can bookmark questions during a quiz to review them here later.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
