import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { UserStats } from '@/components/user-stats';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookMarked, User, Calendar, CalendarDays } from 'lucide-react';
import { APP_NAME, DEVELOPER_CREDIT } from '@/lib/constants';

const menuItems = [
  {
    href: '/challenges/daily',
    title: 'Daily Challenge',
    description: 'Test your skills with new daily quizzes.',
    icon: Calendar,
    color: 'text-blue-500',
  },
  {
    href: '/challenges/weekly',
    title: 'Weekly Challenge',
    description: 'Take on tougher weekly quiz sets.',
    icon: CalendarDays,
    color: 'text-purple-500',
  },
  {
    href: '/bookmarks',
    title: 'Bookmarks',
    description: 'Review your saved questions.',
    icon: BookMarked,
    color: 'text-yellow-500',
  },
  {
    href: '/profile',
    title: 'Profile & Rewards',
    description: 'Check your progress and achievements.',
    icon: User,
    color: 'text-green-500',
  },
];

export default function Home() {
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
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
