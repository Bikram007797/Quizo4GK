import type { UserData } from './types';

export const POINTS_PER_CORRECT_ANSWER = 10;
export const COINS_PER_CORRECT_ANSWER = 2;
export const BONUS_COINS_FOR_TIMELY_COMPLETION = 5;
export const XP_PER_COMPLETED_SET = 15;
export const XP_BONUS_FOR_PERFECT_SCORE = 10;

export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000,
];

export const INITIAL_USER_DATA: UserData = {
  id: '',
  username: 'Anonymous',
  stats: {
    points: 0,
    dailyPoints: 0,
    weeklyPoints: 0,
    monthlyPoints: 0,
    coins: 0,
    xp: 0,
    level: 1,
  },
  attempts: {},
  bookmarks: [],
  completedSets: [],
};

export const APP_NAME = 'QUIZO';
export const APP_TAGLINE = 'Learn. Play. Level Up.';
export const DEVELOPER_CREDIT = 'Developed by Bikr@m';

export const CHALLENGE_TYPES: { type: 'daily' | 'weekly'; title: string }[] = [
  { type: 'daily', title: 'Daily Challenge' },
  { type: 'weekly', title: 'Weekly Challenge' },
];
