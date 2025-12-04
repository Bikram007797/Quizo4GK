'use client';

import { useMemo, useState } from 'react';
import { AppHeader } from '@/components/app-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy } from 'lucide-react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { Skeleton } from '@/components/ui/skeleton';
import type { UserData } from '@/lib/types';
import { useMemoFirebase } from '@/firebase/provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

type LeaderboardTabProps = {
  period: 'daily' | 'weekly' | 'monthly' | 'allTime';
};

function LeaderboardTab({ period }: LeaderboardTabProps) {
  const firestore = useFirestore();
  const [pointsField, setPointsField] = useState('stats.points');

  useMemo(() => {
    switch (period) {
      case 'daily':
        setPointsField('stats.dailyPoints');
        break;
      case 'weekly':
        setPointsField('stats.weeklyPoints');
        break;
      case 'monthly':
        setPointsField('stats.monthlyPoints');
        break;
      default:
        setPointsField('stats.points');
        break;
    }
  }, [period]);

  const leaderboardQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'users'),
      orderBy(pointsField, 'desc'),
      limit(50)
    );
  }, [firestore, pointsField]);

  const { data: users, isLoading } = useCollection<UserData>(leaderboardQuery);

  const rankedUsers = useMemo(() => {
    // The query is already ordered by points, so we just need to add the rank
    // Filter out users named 'Anonymous' on the client side.
    const filteredUsers = users?.filter(user => user.username !== 'Anonymous') ?? [];
    return filteredUsers.map((user, index) => ({ ...user, rank: index + 1 }));
  }, [users]);
  
  const getPointsForPeriod = (user: UserData) => {
      switch (period) {
          case 'daily': return user.stats.dailyPoints || 0;
          case 'weekly': return user.stats.weeklyPoints || 0;
          case 'monthly': return user.stats.monthlyPoints || 0;
          default: return user.stats.points;
      }
  }

  return (
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Rank</TableHead>
            <TableHead>Player</TableHead>
            <TableHead className="text-right">Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-6 w-6 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-6 w-12 ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : (
            rankedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium text-lg">{user.rank}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={`https://api.dicebear.com/8.x/lorelei/svg?seed=${user.username}`} />
                      <AvatarFallback>{getInitials(user.username || '..')}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.username || 'Anonymous User'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold text-lg">{getPointsForPeriod(user)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {!isLoading && rankedUsers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No players on the leaderboard yet. Be the first!
        </div>
      )}
    </CardContent>
  );
}


export default function LeaderboardPage() {
  return (
    <>
      <AppHeader title="Leaderboard" />
      <main className="flex-1">
        <div className="container py-8 px-4 md:px-6">
          <Tabs defaultValue="all-time" className="w-full">
            <Card>
              <CardHeader className="text-center">
                <Trophy className="mx-auto h-12 w-12 text-yellow-400" />
                <CardTitle className="text-2xl font-bold">Rankings</CardTitle>
                <CardDescription>See who is at the top of the game!</CardDescription>
                <TabsList className="grid w-full grid-cols-4 mt-4">
                  <TabsTrigger value="daily">Daily</TabsTrigger>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="all-time">All-Time</TabsTrigger>
                </TabsList>
              </CardHeader>
              
              <TabsContent value="daily">
                <LeaderboardTab period="daily" />
              </TabsContent>
              <TabsContent value="weekly">
                <LeaderboardTab period="weekly" />
              </TabsContent>
              <TabsContent value="monthly">
                <LeaderboardTab period="monthly" />
              </TabsContent>
              <TabsContent value="all-time">
                 <LeaderboardTab period="allTime" />
              </TabsContent>

            </Card>
          </Tabs>
        </div>
      </main>
    </>
  );
}
