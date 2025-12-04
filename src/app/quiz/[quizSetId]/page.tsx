import { getQuizSetById } from '@/lib/quiz-helpers';
import { notFound } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { QuizView } from '@/components/quiz-view';

type QuizPageProps = {
  params: {
    quizSetId: string;
  };
};

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
          <QuizView quizSet={quizSet} />
        </div>
      </main>
    </>
  );
}
