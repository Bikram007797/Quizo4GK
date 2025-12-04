import { getSubjectBySlug, getChaptersBySubjectId, getChallengeTitle } from '@/lib/quiz-helpers';
import type { ChallengeType } from '@/lib/types';
import { AppHeader } from '@/components/app-header';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { notFound } from 'next/navigation';
import Link from 'next/link';

type SubjectPageProps = {
  params: {
    challengeType: ChallengeType;
    subjectSlug: string;
  };
};

export default function SubjectPage({ params }: SubjectPageProps) {
  const { challengeType, subjectSlug } = params;
  const subject = getSubjectBySlug(subjectSlug);
  const challengeTitle = getChallengeTitle(challengeType);
  
  if (!subject) {
    notFound();
  }
  
  const chapters = getChaptersBySubjectId(subject.id);

  return (
    <>
      <AppHeader title={`${challengeTitle}: ${subject.title}`} />
      <main className="flex-1">
        <div className="container py-8 px-4 md:px-6">
          <h2 className="mb-6 text-2xl font-bold tracking-tight font-headline">Select a Chapter</h2>
          <div className="grid gap-4">
            {chapters.map(chapter => (
              <Link key={chapter.id} href={`/challenges/${challengeType}/${subject.slug}/${chapter.slug}`}>
                <Card className="group transition-all hover:bg-card/90 hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="font-headline">{chapter.title}</CardTitle>
                    <CardDescription>{chapter.quizSetIds.length} quiz sets</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
