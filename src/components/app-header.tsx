import Link from 'next/link';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface AppHeaderProps {
  title?: string | ReactNode;
  rightContent?: ReactNode;
  showAppName?: boolean;
  className?: string;
}

export function AppHeader({ title, rightContent, showAppName = false, className }: AppHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm',
        className
      )}
    >
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          {showAppName && (
            <span className="hidden text-xl font-bold tracking-tight text-foreground sm:inline-block">
              {APP_NAME}
            </span>
          )}
        </Link>
        <div className="flex-1 text-center font-bold text-lg md:text-xl">
            {title}
        </div>
        <div className="flex items-center gap-2">
          {rightContent}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
