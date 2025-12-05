export type Question = {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
};

export type QuizSet = {
  id: string;
  title: string;
  chapterId: string;
  questions: Question[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
};

export type Chapter = {
  id: string;
  title: string;
  subjectId: string;
  slug: string;
  quizSetIds: string[];
};

export type Subject = {
  id: string;
  title: 'GEOGRAPHY' | 'POLITY';
  slug: 'geography' | 'polity';
  chapterIds: string[];
  iconName: 'Globe' | 'Landmark';
};

export type ChallengeType = 'daily' | 'weekly';

export type UserStats = {
  points: number;
  dailyPoints?: number;
  weeklyPoints?: number;
  monthlyPoints?: number;
  coins: number;
  xp: number;
  level: number;
};

export type Attempt = {
  quizSetId: string;
  score: number;
  timeTaken: number; // in seconds
  accuracy: number; // percentage
  timestamp: number;
  userAnswers: (number | null)[];
};

export type UserData = {
  id: string;
  username: string;
  email?: string;
  stats: UserStats;
  attempts: { [quizSetId: string]: Attempt[] };
  bookmarks: string[]; // array of question IDs
  completedSets: string[]; // array of quizSet IDs
};

export type AppTheme = 'light' | 'dark' | 'system';

export type AppContextType = {
  userData: UserData;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  updateStats: (updates: Partial<UserStats>) => void;
  addAttempt: (attempt: Attempt) => void;
  toggleBookmark: (questionId: string) => void;
  isBookmarked: (questionId: string) => boolean;
  markSetAsCompleted: (quizSetId: string) => void;
  getBestScore: (quizSetId: string) => number | null;
  getAttemptsCount: (quizSetId: string) => number;
  getLastAttempt: (quizSetId: string) => Attempt | null;
  isLoading: boolean;
};
