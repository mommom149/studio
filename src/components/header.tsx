'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function Header() {
  return (
    <header className="z-10 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              asChild
            >
              <Link href="/notifications" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2.5 block h-2 w-2 rounded-full bg-accent" />
              </Link>
            </Button>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
