'use client';

import { useAppContext } from '@/contexts/app-provider';
import { useUser } from '@/firebase';
import { Gem, Star, ShieldCheck, BarChart, LogOut, LogIn } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getAuth, signOut } from "firebase/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}


export function UserStats() {
  const { userData, isLoading } = useAppContext();
  const { user, isUserLoading } = useUser();
  const auth = getAuth();
  
  const { stats } = userData;

  const handleLogout = async () => {
      await signOut(auth);
  }

  if (isLoading || isUserLoading) {
    return <Skeleton className="h-9 w-64 rounded-md" />;
  }

  if (!user || user.isAnonymous) {
      return (
        <Button asChild>
            <Link href="/login">
                <LogIn className="mr-2 h-4 w-4"/>
                Login / Sign Up
            </Link>
        </Button>
      )
  }

  return (
    <div className="flex items-center gap-4">
      <div className="hidden sm:flex items-center gap-3 rounded-full border bg-card/50 px-3 py-1 text-sm font-medium text-card-foreground shadow-sm">
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={`https://api.dicebear.com/8.x/lorelei/svg?seed=${user.displayName}`} />
              <AvatarFallback>{getInitials(user.displayName || '..')}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
