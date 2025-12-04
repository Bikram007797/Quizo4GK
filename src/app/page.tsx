'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { UserStats } from '@/components/user-stats';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookMarked, User, Calendar, CalendarDays, Trophy } from 'lucide-react';
import { DEVELOPER_CREDIT } from '@/lib/constants';

const menuItems = [
  {
    href: '/challenges/daily/',
    title: 'Daily Challenge',
    description: 'Test your skills with new daily quizzes.',
    icon: Calendar,
    color: 'text-blue-500',
  },
  {
    href: '/challenges/weekly/',
    title: 'Weekly Challenge',
    description: 'Take on tougher weekly quiz sets.',
    icon: CalendarDays,
    color: 'text-purple-500',
  },
  {
    href: '/leaderboard/',
    title: 'Leaderboard',
    description: 'See how you rank against others.',
    icon: Trophy,
    color: 'text-yellow-500',
  },
  {
    href: '/bookmarks/',
    title: 'Bookmarks',
    description: 'Review your saved questions.',
    icon: BookMarked,
    color: 'text-orange-500',
  },
  {
    href: '/profile/',
    title: 'Profile & Rewards',
    description: 'Check your progress and achievements.',
    icon: User,
    color: 'text-green-500',
  },
];


export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If auth state is not loading and user is not logged in (or is anonymous),
    // redirect to the login page.
    if (!isUserLoading && (!user || user.isAnonymous)) {
      router.replace('/login/');
    }
  }, [user, isUserLoading, router]);

  // While checking auth, show a loading screen.
  // This prevents the page content from flashing before the redirect.
  if (isUserLoading || !user || user.isAnonymous) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your experience...</p>
      </div>
    );
  }
  
  const HomeHeaderTitle = (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl font-headline">{APP_NAME}</h1>
      <p className="text-xs text-muted-foreground">{DEVELOPER_CREDIT}</p>
    </div>
  );

  return (
    <>
      <AppHeader
        showAppName={true}
        title={HomeHeaderTitle}
        rightContent={<UserStats />}
      />
      <main className="flex-1">
        <div className="container py-8 px-4 md:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {menuItems.map((item) => (
              <Card
                key={item.href}
                className="group transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <Link href={item.href} className="flex h-full flex-col justify-between p-6">
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <item.icon className={`h-8 w-8 ${item.color}`} />
                        <CardTitle className="font-headline">{item.title}</CardTitle>
                        <CardDescription>{item.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-end text-sm font-semibold text-primary">
                    Go <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
