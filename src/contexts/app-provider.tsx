
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AppContextType, AppTheme, UserData, Attempt, UserStats } from '@/lib/types';
import { INITIAL_USER_DATA, LEVEL_THRESHOLDS } from '@/lib/constants';
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore, useUser } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData>(INITIAL_USER_DATA);
  const [theme, setThemeState] = useState<AppTheme>('system');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const auth = useAuth();
  const firestore = useFirestore();
  const { user: firebaseUser, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && !firebaseUser) {
      signInAnonymously(auth);
    }
  }, [isUserLoading, firebaseUser, auth]);


  useEffect(() => {
    async function loadUserData() {
      if (firebaseUser && firestore) {
        setIsLoading(true);
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data() as UserData);
          } else {
            // No document yet, create one with initial data
            await setDoc(userDocRef, INITIAL_USER_DATA);
            setUserData(INITIAL_USER_DATA);
          }
        } catch (error) {
          console.error("Failed to load user data from Firestore", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Not logged in, or services not ready
        setIsLoading(false);
      }
    }

    loadUserData();

    try {
      const storedTheme = localStorage.getItem('quizo_theme') as AppTheme | null;
      if (storedTheme) {
        setThemeState(storedTheme);
      }
    } catch (error) {
      console.error("Failed to load theme from localStorage", error);
    }
  }, [firebaseUser, firestore]);

  useEffect(() => {
    async function saveUserData() {
      if (!isLoading && firebaseUser && firestore && userData !== INITIAL_USER_DATA) {
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        try {
          await setDoc(userDocRef, userData, { merge: true });
        } catch (error) {
          console.error("Failed to save user data to Firestore", error);
        }
      }
    }
    saveUserData();
  }, [userData, isLoading, firebaseUser, firestore]);
  
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    let effectiveTheme = theme;
    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    root.classList.add(effectiveTheme);
    localStorage.setItem('quizo_theme', theme);
  }, [theme]);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
  };
  
  const updateStats = useCallback((updates: Partial<UserStats>) => {
    setUserData(prev => {
        const newStats: UserStats = {
            level: prev.stats.level,
            xp: prev.stats.xp + (updates.xp || 0),
            points: prev.stats.points + (updates.points || 0),
            coins: prev.stats.coins + (updates.coins || 0),
        };

        const currentLevel = prev.stats.level;
        const newLevelThresholdIndex = LEVEL_THRESHOLDS.findIndex(xp => newStats.xp < xp);
        let newLevel = newStats.level;

        if (newLevelThresholdIndex === -1) { // XP exceeds all thresholds
            newLevel = LEVEL_THRESHOLDS.length;
        } else {
            newLevel = newLevelThresholdIndex;
        }
        
        if (newLevel > currentLevel) {
            newStats.level = newLevel;
            toast({
              title: "Level Up!",
              description: `Congratulations! You've reached Level ${newLevel}.`,
            });
        }
      
      return { ...prev, stats: newStats };
    });
  }, [toast]);

  const addAttempt = useCallback((attempt: Attempt) => {
    setUserData(prev => {
      const existingAttempts = prev.attempts[attempt.quizSetId] || [];
      return {
        ...prev,
        attempts: {
          ...prev.attempts,
          [attempt.quizSetId]: [...existingAttempts, attempt],
        },
      };
    });
  }, []);

  const toggleBookmark = useCallback((questionId: string) => {
    setUserData(prev => {
      const isCurrentlyBookmarked = prev.bookmarks.includes(questionId);
      const newBookmarks = isCurrentlyBookmarked
        ? prev.bookmarks.filter(id => id !== questionId)
        : [...prev.bookmarks, questionId];
      
      if (!isCurrentlyBookmarked) {
        toast({
            title: "Bookmarked!",
            description: "You can find this question in your bookmarks to review later.",
        });
      } else {
        toast({
            title: "Bookmark Removed",
            description: "The question has been removed from your bookmarks.",
        });
      }

      return { ...prev, bookmarks: newBookmarks };
    });
  }, [toast]);


  const isBookmarked = useCallback((questionId: string) => {
    return userData.bookmarks.includes(questionId);
  }, [userData.bookmarks]);

  const markSetAsCompleted = useCallback((quizSetId: string) => {
    setUserData(prev => {
      if (prev.completedSets.includes(quizSetId)) {
        return prev;
      }
      return {
        ...prev,
        completedSets: [...prev.completedSets, quizSetId],
      };
    });
  }, []);

  const getBestScore = useCallback((quizSetId: string) => {
    const attempts = userData.attempts[quizSetId];
    if (!attempts || attempts.length === 0) return null;
    return Math.max(...attempts.map(a => a.score));
  }, [userData.attempts]);

  const getAttemptsCount = useCallback((quizSetId: string) => {
    return userData.attempts[quizSetId]?.length || 0;
  }, [userData.attempts]);

  const getLastAttempt = useCallback((quizSetId: string): Attempt | null => {
    const attempts = userData.attempts[quizSetId];
    if (!attempts || attempts.length === 0) return null;
    return attempts.sort((a, b) => b.timestamp - a.timestamp)[0];
  }, [userData.attempts]);

  const value = {
    userData,
    theme,
    setTheme,
    updateStats,
    addAttempt,
    toggleBookmark,
    isBookmarked,
    markSetAsCompleted,
    getBestScore,
    getAttemptsCount,
    getLastAttempt,
    isLoading: isLoading || isUserLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
