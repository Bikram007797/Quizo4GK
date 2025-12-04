import { getSubjects, getChallengeTitle } from '@/lib/quiz-helpers';
import type { ChallengeType } from '@/lib/types';
import { AppHeader } from '@/components/app-header';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type ChallengesPageProps = {
  params: {
    challengeType: ChallengeType;
  };
};

export default function ChallengesPage({ params }: ChallengesPageProps) {
  const { challengeType } = params;
  const subjects = getSubjects();
  const title = getChallengeTitle(challengeType);

  if (!['daily', 'weekly'].includes(challengeType)) {
    notFound();
  }

  return (
    <>
      <AppHeader title={title} />
      <main className="flex-1">
        <div className="container py-8 px-4 md:px-6">
          <h2 className="mb-6 text-2xl font-bold tracking-tight font-headline">Select a Subject</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {subjects.map((subject) => (
              <Link key={subject.id} href={`/challenges/${challengeType}/${subject.slug}/`}>
                <Card className="group flex h-full items-center justify-between p-6 transition-all hover:bg-card/90 hover:shadow-lg">
                  <div className="flex items-center gap-4">
                    <subject.icon className="h-10 w-10 text-primary" />
                    <div>
                      <h3 className="text-lg font-semibold font-headline">{subject.title}</h3>
                      <p className="text-sm text-muted-foreground">{subject.chapterIds.length} Chapters</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
