import type { Subject, Chapter, QuizSet, Question } from '@/lib/types';
import { Globe, Landmark } from 'lucide-react';

const geographyQuestions: Omit<Question, 'id'>[] = [
  {
    questionText: 'Which continent has the most countries?',
    options: ['Africa', 'Asia', 'Europe', 'South America'],
    correctOptionIndex: 0,
    explanation: 'Africa has 54 recognized countries, making it the continent with the most nations.',
  },
  {
    questionText: 'Which is the largest desert in the world (by area)?',
    options: ['Sahara', 'Arabian', 'Gobi', 'Antarctic'],
    correctOptionIndex: 3,
    explanation: 'The Antarctic Polar Desert is the largest desert in the world, covering an area of around 14 million square kilometers.',
  },
  {
    questionText: 'Which river is the longest in the world?',
    options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'],
    correctOptionIndex: 1,
    explanation: 'The Nile River is traditionally considered the longest river in the world, flowing for about 6,650 kilometers.',
  },
  {
    questionText: 'The tectonic plates meet at the _______.',
    options: ['Mantle', 'Lithosphere', 'Asthenosphere', 'Crust'],
    correctOptionIndex: 1,
    explanation: 'Tectonic plates are massive pieces of Earth\'s lithosphere that move and interact with each other.',
  },
  {
    questionText: 'What is the term for the area where freshwater from a river mixes with seawater?',
    options: ['Estuary', 'Delta', 'Gulf', 'Basin'],
    correctOptionIndex: 0,
    explanation: 'An estuary is a partially enclosed coastal body of brackish water with one or more rivers or streams flowing into it, and with a free connection to the open sea.',
  },
];

const polityQuestions: Omit<Question, 'id'>[] = [
  {
    questionText: 'What is considered the supreme law of the land in India?',
    options: ['The President', 'The Constitution', 'The Parliament', 'The Supreme Court'],
    correctOptionIndex: 1,
    explanation: 'The Constitution of India is the supreme law of India, laying down the framework of the government and fundamental rights and duties of citizens.',
  },
  {
    questionText: 'Which article of the Indian Constitution deals with equality before the law?',
    options: ['Article 12', 'Article 14', 'Article 21', 'Article 19'],
    correctOptionIndex: 1,
    explanation: 'Article 14 of the Constitution of India guarantees to every person the right to equality before the law or the equal protection of the laws within the territory of India.',
  },
  {
    questionText: 'Under which Article can the President proclaim a Financial Emergency?',
    options: ['Article 352', 'Article 356', 'Article 360', 'Article 368'],
    correctOptionIndex: 2,
    explanation: 'Article 360 empowers the President to proclaim a Financial Emergency if a situation threatens India\'s financial stability.',
  },
  {
    questionText: 'The "Doctrine of Basic Structure" was propounded in which landmark case?',
    options: ['Golak Nath vs. State of Punjab', 'Kesavananda Bharati vs. State of Kerala', 'Minerva Mills vs. Union of India', 'S.R. Bommai vs. Union of India'],
    correctOptionIndex: 1,
    explanation: 'The Supreme Court introduced the "Doctrine of Basic Structure" in the Kesavananda Bharati case (1973), stating that Parliament cannot alter the fundamental framework of the Constitution.',
  },
  {
    questionText: 'The creation of a new state in India requires:',
    options: ["Parliament simple majority after President's recommendation.", 'Parliament two-thirds majority.', 'State Legislature resolution, then Parliament simple majority.', "Parliament simple majority after referral to State Legislature."],
    correctOptionIndex: 3,
    explanation: 'A new state is created by a bill in Parliament passed by a simple majority, but it must first be referred to the concerned state legislature for its views.',
  },
];

const generateQuestions = (baseQuestions: Omit<Question, 'id'>[], prefix: string): Question[] => 
  baseQuestions.map((q, i) => ({ ...q, id: `${prefix}-q${i + 1}` }));

export const quizSets: QuizSet[] = [
  {
    id: 'geo-c1-s1',
    chapterId: 'geo-c1',
    title: 'Set 1',
    questions: generateQuestions(geographyQuestions, 'geo-c1-s1'),
    difficulty: 'Easy',
  },
  {
    id: 'geo-c1-s2',
    chapterId: 'geo-c1',
    title: 'Set 2',
    questions: generateQuestions(geographyQuestions.slice().reverse(), 'geo-c1-s2'),
    difficulty: 'Easy',
  },
  {
    id: 'geo-c2-s1',
    chapterId: 'geo-c2',
    title: 'Set 1',
    questions: generateQuestions(geographyQuestions, 'geo-c2-s1'),
    difficulty: 'Medium',
  },
  {
    id: 'geo-c2-s2',
    chapterId: 'geo-c2',
    title: 'Set 2',
    questions: generateQuestions(geographyQuestions.slice().reverse(), 'geo-c2-s2'),
    difficulty: 'Medium',
  },
  {
    id: 'pol-c1-s1',
    chapterId: 'pol-c1',
    title: 'Set 1',
    questions: generateQuestions(polityQuestions, 'pol-c1-s1'),
    difficulty: 'Easy',
  },
  {
    id: 'pol-c1-s2',
    chapterId: 'pol-c1',
    title: 'Set 2',
    questions: generateQuestions(polityQuestions.slice().reverse(), 'pol-c1-s2'),
    difficulty: 'Easy',
  },
  {
    id: 'pol-c2-s1',
    chapterId: 'pol-c2',
    title: 'Set 1',
    questions: generateQuestions(polityQuestions, 'pol-c2-s1'),
    difficulty: 'Medium',
  },
  {
    id: 'pol-c2-s2',
    chapterId: 'pol-c2',
    title: 'Set 2',
    questions: generateQuestions(polityQuestions.slice().reverse(), 'pol-c2-s2'),
    difficulty: 'Medium',
  },
];

export const chapters: Chapter[] = [
  { id: 'geo-c1', subjectId: 'geography', title: 'Fundamentals of Physical Geography', slug: 'fundamentals-of-physical-geography', quizSetIds: ['geo-c1-s1', 'geo-c1-s2'] },
  { id: 'geo-c2', subjectId: 'geography', title: 'World Climatic Regions', slug: 'world-climatic-regions', quizSetIds: ['geo-c2-s1', 'geo-c2-s2'] },
  { id: 'pol-c1', subjectId: 'polity', title: 'The Indian Constitution', slug: 'the-indian-constitution', quizSetIds: ['pol-c1-s1', 'pol-c1-s2'] },
  { id: 'pol-c2', subjectId: 'polity', title: 'Union & State Executive', slug: 'union-state-executive', quizSetIds: ['pol-c2-s1', 'pol-c2-s2'] },
];

export const subjects: Subject[] = [
  { id: 'geography', title: 'GEOGRAPHY', slug: 'geography', chapterIds: ['geo-c1', 'geo-c2'], icon: Globe },
  { id: 'polity', title: 'POLITY', slug: 'polity', chapterIds: ['pol-c1', 'pol-c2'], icon: Landmark },
];
