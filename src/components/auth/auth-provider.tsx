"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, getRedirectResult, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  continueAsGuest: () => void;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isGuest: false,
  continueAsGuest: () => {},
  signOutUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check if guest mode was previously selected
    if (typeof window !== 'undefined') {
      const storedGuest = localStorage.getItem('chrono_is_guest') === 'true';
      if (storedGuest) {
        setIsGuest(true);
      }
    }

    // Handle redirect sign-in results (e.g. on mobile devices)
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
          setIsGuest(false);
          localStorage.removeItem('chrono_is_guest');
        }
      })
      .catch((error) => {
        console.warn('Redirect sign-in check:', error);
      });

    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsGuest(false);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('chrono_is_guest');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const continueAsGuest = () => {
    setIsGuest(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('chrono_is_guest', 'true');
    }
    router.push('/');
  };

  const signOutUser = async () => {
    try {
      setIsGuest(false);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('chrono_is_guest');
      }
      await signOut(auth);
      router.push('/login');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  useEffect(() => {
    if (loading) return;

    const normalizedPath = (pathname || '').replace(/\/$/, '') || '/';
    const isAuthPage = normalizedPath === '/login';

    const isAuthenticatedOrGuest = Boolean(user || isGuest);

    if (!isAuthenticatedOrGuest && !isAuthPage) {
      router.push('/login');
    } else if (isAuthenticatedOrGuest && isAuthPage) {
      router.push('/');
    }
  }, [user, isGuest, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent shadow-lg" />
          <p className="text-xs text-muted-foreground animate-pulse font-medium">
            Connecting to ChronoCanvas...
          </p>
        </div>
      </div>
    );
  }

  const normalizedPath = (pathname || '').replace(/\/$/, '') || '/';
  const isAuthPage = normalizedPath === '/login';
  const isAuthenticatedOrGuest = Boolean(user || isGuest);

  if (!isAuthenticatedOrGuest && !isAuthPage) {
    return null;
  }
  if (isAuthenticatedOrGuest && isAuthPage) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isGuest,
        continueAsGuest,
        signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
