'use client';

import { AppHeader } from '@/components/app-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Gem, Star, ShieldCheck, Trophy, TrendingUp } from 'lucide-react';
import { useAppContext } from '@/contexts/app-provider';
import { LEVEL_THRESHOLDS } from '@/lib/constants';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { userData, isLoading } = useAppContext();
  const { stats } = userData;

  const currentLevelXP = LEVEL_THRESHOLDS[stats.level - 1] ?? 0;
  const nextLevelXP = LEVEL_THRESHOLDS[stats.level] ?? stats.xp;
  const xpForCurrentLevel = stats.xp - currentLevelXP;
  const xpForNextLevel = nextLevelXP - currentLevelXP;
  const levelProgress = xpForNextLevel > 0 ? (xpForCurrentLevel / xpForNextLevel) * 100 : 100;

  const statsCards = [
    { icon: ShieldCheck, label: 'Level', value: stats.level },
    { icon: BarChart, label: 'XP', value: stats.xp },
    { icon: Star, label: 'Points', value: stats.points },
    { icon: Gem, label: 'Coins', value: stats.coins },
  ];
  
  if (isLoading) {
    return (
     <>
        <AppHeader title="Profile & Rewards" />
        <main className="flex-1">
          <div className="container py-8 px-4 md:px-6 grid gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </main>
      </>
    )
  }


  return (
    <>
      <AppHeader title="Profile & Rewards" />
      <main className="flex-1">
        <div className="container py-8 px-4 md:px-6">
          <div className="grid gap-6">
             <Card>
              <CardHeader>
                <CardTitle>My Stats</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statsCards.map(stat => (
                   <div key={stat.label} className="flex flex-col items-center justify-center rounded-lg bg-muted p-4">
                     <stat.icon className="h-8 w-8 text-accent" />
                     <p className="mt-2 text-2xl font-bold">{stat.value}</p>
                     <p className="text-sm text-muted-foreground">{stat.label}</p>
                   </div>
                ))}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Level Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-medium">
                      <span>Level {stats.level}</span>
                      <span className="text-muted-foreground">{stats.xp} / {nextLevelXP} XP</span>
                      <span>Level {stats.level + 1}</span>
                  </div>
                  <Progress value={levelProgress} className="h-4" />
                  <p className="text-center text-muted-foreground text-sm">
                      {xpForNextLevel > 0
                        ? `${nextLevelXP - stats.xp} XP to next level`
                        : 'You are at the maximum level!'}
                  </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center gap-4 text-center text-muted-foreground p-8">
                  <Trophy className="h-16 w-16" />
                  <p className="text-lg font-medium">Achievements are on the way!</p>
                  <p>Earn badges and rewards for your accomplishments.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
