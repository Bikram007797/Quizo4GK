
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { AppContextType, AppTheme, UserData, UserStats, Attempt } from '@/lib/types';
import { INITIAL_USER_DATA, LEVEL_THRESHOLDS } from '@/lib/constants';
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc, updateDoc, onSnapshot, increment } from 'firebase/firestore';

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData>(INITIAL_USER_DATA);
  const [theme, setThemeState] = useState<AppTheme>('system');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const firestore = useFirestore();
  const { user: firebaseUser, isUserLoading } = useUser();

  // Load theme from localStorage on initial mount
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem('quizo_theme') as AppTheme | null;
      if (storedTheme) {
        setThemeState(storedTheme);
      }
    } catch (error) {
      console.warn("Could not load theme from localStorage", error);
    }
  }, []);
  
  // Apply theme to DOM
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    let effectiveTheme = theme;
    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    root.classList.add(effectiveTheme);
    try {
      localStorage.setItem('quizo_theme', theme);
    } catch (error)      {
      console.warn("Could not save theme to localStorage", error);
    }
  }, [theme]);


  // Effect to manage user data loading and synchronization
  useEffect(() => {
    if (isUserLoading) {
      setIsLoading(true);
      return;
    }
  
    if (firebaseUser) {
      const userDocRef = doc(firestore, 'users', firebaseUser.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserData(docSnap.data() as UserData);
        } else {
           const newUserData = {
            ...INITIAL_USER_DATA,
            id: firebaseUser.uid,
            username: firebaseUser.displayName || 'New User',
            email: firebaseUser.email || '',
          };
          setUserData(newUserData);
        }
        setIsLoading(false);
      }, (error) => {
        console.error("Error listening to user document:", error);
        setIsLoading(false);
      });
  
      return () => unsubscribe();
    } else {
      setUserData(INITIAL_USER_DATA);
      setIsLoading(false);
    }
  }, [firebaseUser, isUserLoading, firestore]);


  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
  };
  
  const updateStats = useCallback(async (updates: Partial<UserStats>) => {
    if (!firebaseUser) return;

    const userDocRef = doc(firestore, 'users', firebaseUser.uid);
    
    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const currentStats = docSnap.data().stats as UserStats;
        const pointsUpdate = updates.points || 0;
        const xpUpdate = updates.xp || 0;
        const coinsUpdate = updates.coins || 0;

        const statUpdates: Record<string, any> = {
          'stats.points': increment(pointsUpdate),
          'stats.dailyPoints': increment(pointsUpdate),
          'stats.weeklyPoints': increment(pointsUpdate),
          'stats.monthlyPoints': increment(pointsUpdate),
          'stats.xp': increment(xpUpdate),
          'stats.coins': increment(coinsUpdate),
        };

        const newXp = (currentStats.xp || 0) + xpUpdate;
        const currentLevel = currentStats.level || 1;
        const newLevel = LEVEL_THRESHOLDS.filter(xp => newXp >= xp).length || 1;
        
        if (newLevel > currentLevel) {
          statUpdates['stats.level'] = newLevel;
          toast({
            title: "Level Up!",
            description: `Congratulations! You've reached Level ${newLevel}.`,
          });
        }
        
        await updateDoc(userDocRef, statUpdates);
      }
    } catch (error) {
      console.error("Failed to update stats:", error);
    }
  }, [firebaseUser, firestore, toast]);

  const addAttempt = useCallback(async (attempt: Attempt) => {
    if (!firebaseUser) return;

    const userDocRef = doc(firestore, 'users', firebaseUser.uid);
    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const currentAttempts = docSnap.data().attempts || {};
        const existingAttempts = currentAttempts[attempt.quizSetId] || [];
        await updateDoc(userDocRef, {
          [`attempts.${attempt.quizSetId}`]: [...existingAttempts, attempt]
        });
      }
    } catch (error) {
      console.error("Failed to add attempt:", error);
    }
  }, [firebaseUser, firestore]);

  const toggleBookmark = useCallback(async (questionId: string) => {
    if (!firebaseUser) return;

    const userDocRef = doc(firestore, 'users', firebaseUser.uid);
    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const currentBookmarks = docSnap.data().bookmarks || [];
        const isBookmarked = currentBookmarks.includes(questionId);
        const newBookmarks = isBookmarked
          ? currentBookmarks.filter((id:string) => id !== questionId)
          : [...currentBookmarks, questionId];
        await updateDoc(userDocRef, { bookmarks: newBookmarks });
        
        toast({
          title: isBookmarked ? "Bookmark Removed" : "Bookmarked!",
          description: isBookmarked
            ? "The question has been removed from your bookmarks."
            : "You can find this question in your bookmarks to review later.",
        });
      }
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
    }
  }, [firebaseUser, firestore, toast]);


  const isBookmarked = useCallback((questionId: string) => {
    return userData.bookmarks.includes(questionId);
  }, [userData.bookmarks]);

  const markSetAsCompleted = useCallback(async (quizSetId: string) => {
    if (userData.completedSets.includes(quizSetId) || !firebaseUser) return;
    
    const userDocRef = doc(firestore, 'users', firebaseUser.uid);
    try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            const completed = docSnap.data().completedSets || [];
            if (!completed.includes(quizSetId)) {
                await updateDoc(userDocRef, { completedSets: [...completed, quizSetId] });
            }
        }
    } catch(error) {
      console.error("Failed to mark set as completed:", error);
    }
  }, [firebaseUser, firestore, userData.completedSets]);

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
