import { subjects, chapters, quizSets } from '@/data/quiz-data';
import type { Subject, Chapter, QuizSet, Question, ChallengeType } from './types';

export function getSubjects(): Subject[] {
  return subjects;
}

export function getSubjectBySlug(slug: string): Subject | undefined {
  return subjects.find(s => s.slug === slug);
}

export function getChaptersBySubjectId(subjectId: string): Chapter[] {
  return chapters.filter(c => c.subjectId === subjectId);
}

export function getChapterBySlug(subjectId: string, chapterSlug: string): Chapter | undefined {
    return chapters.find(c => c.subjectId === subjectId && c.slug === chapterSlug);
}


export function getQuizSetsByChapterId(chapterId: string): QuizSet[] {
  return quizSets.filter(qs => qs.chapterId === chapterId);
}

export function getQuizSetById(id: string): QuizSet | undefined {
  return quizSets.find(qs => qs.id === id);
}

export function getQuestionById(questionId: string): { question: Question, quizSet: QuizSet } | undefined {
  for (const quizSet of quizSets) {
    const question = quizSet.questions.find(q => q.id === questionId);
    if (question) {
      return { question, quizSet };
    }
  }
  return undefined;
}

export function getChallengeTitle(type: ChallengeType): string {
  return type === 'daily' ? 'Daily Challenge' : 'Weekly Challenge';
}
