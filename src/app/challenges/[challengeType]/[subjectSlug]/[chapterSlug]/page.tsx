
import { getSubjectBySlug, getChapterBySlug, getChallengeTitle, getSubjects, getChaptersBySubjectId } from '@/lib/quiz-helpers';
import type { ChallengeType } from '@/lib/types';
import { AppHeader } from '@/components/app-header';
import { notFound } from 'next/navigation';
import { CHALLENGE_TYPES } from '@/lib/constants';
import { ChapterClientPage } from './chapter-client-page';

export async function generateStaticParams() {
    const subjects = getSubjects();
    const paths = [];

    for (const challenge of CHALLENGE_TYPES) {
        for (const subject of subjects) {
            const chapters = getChaptersBySubjectId(subject.id);
            for (const chapter of chapters) {
                paths.push({
                    challengeType: challenge.type,
                    subjectSlug: subject.slug,
                    chapterSlug: chapter.slug,
                });
            }
        }
    }
    return paths;
}

type ChapterPageProps = {
  params: {
    challengeType: ChallengeType;
    subjectSlug: string;
    chapterSlug: string;
  };
};

export default function ChapterPage({ params }: ChapterPageProps) {
  const { challengeType, subjectSlug, chapterSlug } = params;

  const subject = getSubjectBySlug(subjectSlug);
  if (!subject) {
    notFound();
  }
  
  const chapter = getChapterBySlug(subject.id, chapterSlug);
  if (!chapter) {
    notFound();
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
          <ChapterClientPage chapter={chapter} />
        </div>
      </main>
    </>
  );
}
