"use client";

import { useAuth } from './auth-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '../ui/button';
import { LogOut, LogIn, UserCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function UserButton() {
  const { user, isGuest, signOutUser } = useAuth();
  const router = useRouter();

  if (!user && !isGuest) {
    return null;
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (isGuest && !user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-1 ring-border">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                G
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 font-body" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold leading-none text-foreground">Guest Explorer</p>
              <p className="text-xs leading-none text-muted-foreground">Notes saved locally</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/login')} className="text-primary font-medium">
            <LogIn className="mr-2 h-4 w-4" />
            <span>Sign in with Google</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={signOutUser} className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Exit Guest Mode</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-primary/40">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.photoURL ?? ''} alt={user?.displayName ?? 'User'} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">
              {getInitials(user?.displayName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 font-body" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none text-foreground">{user?.displayName}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOutUser} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
