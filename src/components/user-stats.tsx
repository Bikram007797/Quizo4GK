'use client';

import { useAppContext } from '@/contexts/app-provider';
import { Gem, Star, ShieldCheck, BarChart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function UserStats() {
  const { userData, isLoading } = useAppContext();
  const { stats } = userData;

  if (isLoading) {
    return <Skeleton className="h-8 w-64 rounded-full" />;
  }

  return (
    <div className="flex items-center gap-3 rounded-full border bg-card/50 px-3 py-1 text-sm font-medium text-card-foreground shadow-sm">
      <div className="flex items-center gap-1" title={`${stats.level} Level`}>
        <ShieldCheck className="h-4 w-4 text-accent" />
        <span>{stats.level}</span>
      </div>
      <div className="flex items-center gap-1" title={`${stats.xp} XP`}>
        <BarChart className="h-4 w-4 text-accent" />
        <span>{stats.xp}</span>
      </div>
      <div className="flex items-center gap-1" title={`${stats.points} Points`}>
        <Star className="h-4 w-4 text-accent" />
        <span>{stats.points}</span>
      </div>
      <div className="flex items-center gap-1" title={`${stats.coins} Coins`}>
        <Gem className="h-4 w-4 text-accent" />
        <span>{stats.coins}</span>
      </div>
    </div>
  );
}
