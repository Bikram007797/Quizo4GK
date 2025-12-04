import { getQuizSetById } from '@/lib/quiz-helpers';
import { notFound } from 'next/navigation';
import { AppHeader } from '@/components/app-header';

type QuizPageProps = {
  params: {
    quizSetId: string;
  };
};

// This component will be a placeholder for the actual quiz.
// The interactive quiz logic will be in a client component.
export default async function QuizPage({ params }: QuizPageProps) {
  const quizSet = getQuizSetById(params.quizSetId);

  if (!quizSet) {
    notFound();
  }

  return (
    <>
      <AppHeader title={quizSet.title} />
      <main className="flex-1">
        <div className="container py-8 px-4 md:px-6">
            <p>Quiz screen coming soon...</p>
        </div>
      </main>
    </>
  );
}
