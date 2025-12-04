import { AppHeader } from '@/components/app-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Shield, Star, Gem, Trophy } from 'lucide-react';

export default function ProfilePage() {
  // This component is a placeholder for future implementation.
  // The logic to display user stats, achievements, and settings will be added later.

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
              <CardContent>
                <div className="flex flex-col items-center justify-center gap-4 text-center text-muted-foreground p-8">
                  <User className="h-16 w-16" />
                  <p className="text-lg font-medium">User statistics are coming soon!</p>
                  <p>Track your level, XP, points, and coins right here.</p>
                </div>
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
