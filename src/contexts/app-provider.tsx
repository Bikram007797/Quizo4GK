
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { AppContextType, AppTheme, UserData, UserStats, Attempt } from '@/lib/types';
import { INITIAL_USER_DATA, LEVEL_THRESHOLDS } from '@/lib/constants';
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore, useUser } from '@/firebase';
import { doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData>(INITIAL_USER_DATA);
  const [theme, setThemeState] = useState<AppTheme>('system');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const auth = useAuth();
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
          // New user, data will be created on signup page.
          // Set a default state until the doc is created to avoid errors.
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
      // Handle anonymous user logic if needed, or just reset state
      setUserData(INITIAL_USER_DATA);
      setIsLoading(false);
    }
  }, [firebaseUser, isUserLoading, firestore]);


  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
  };
  
  const updateStats = useCallback((updates: Partial<UserStats>) => {
    if (!firebaseUser) { // Handle anonymous user case
      setUserData(prev => {
        const newStats: UserStats = {
          ...prev.stats,
          xp: (prev.stats.xp || 0) + (updates.xp || 0),
          points: (prev.stats.points || 0) + (updates.points || 0),
          coins: (prev.stats.coins || 0) + (updates.coins || 0),
          dailyPoints: (prev.stats.dailyPoints || 0) + (updates.points || 0),
          weeklyPoints: (prev.stats.weeklyPoints || 0) + (updates.points || 0),
          monthlyPoints: (prev.stats.monthlyPoints || 0) + (updates.points || 0),
        };
        const currentLevel = prev.stats.level || 1;
        const newLevel = LEVEL_THRESHOLDS.filter(xp => newStats.xp >= xp).length || 1;
        newStats.level = Math.max(currentLevel, newLevel);
        return { ...prev, stats: newStats };
      });
      return;
    }

    // Handle registered user
    const userDocRef = doc(firestore, 'users', firebaseUser.uid);
    getDoc(userDocRef).then(docSnap => {
      if (docSnap.exists()) {
        const currentStats = docSnap.data().stats as UserStats;
        const pointsUpdate = updates.points || 0;
        
        const newStats: Partial<UserData['stats']> = {
          xp: (currentStats.xp || 0) + (updates.xp || 0),
          points: (currentStats.points || 0) + pointsUpdate,
          coins: (currentStats.coins || 0) + (updates.coins || 0),
          dailyPoints: (currentStats.dailyPoints || 0) + pointsUpdate,
          weeklyPoints: (currentStats.weeklyPoints || 0) + pointsUpdate,
          monthlyPoints: (currentStats.monthlyPoints || 0) + pointsUpdate,
        };
        
        const newLevel = LEVEL_THRESHOLDS.filter(xp => newStats.xp! >= xp).length || 1;
        if (newLevel > currentStats.level) {
          newStats.level = newLevel;
          toast({
            title: "Level Up!",
            description: `Congratulations! You've reached Level ${newLevel}.`,
          });
        }
        
        updateDoc(userDocRef, { stats: { ...currentStats, ...newStats } });
      }
    });
  }, [firebaseUser, firestore, toast]);

  const addAttempt = useCallback((attempt: Attempt) => {
    if (!firebaseUser) { // Handle anonymous user
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
       return;
    }
    // Handle registered user
    const userDocRef = doc(firestore, 'users', firebaseUser.uid);
    getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
            const currentAttempts = docSnap.data().attempts || {};
            const existingAttempts = currentAttempts[attempt.quizSetId] || [];
            updateDoc(userDocRef, {
                [`attempts.${attempt.quizSetId}`]: [...existingAttempts, attempt]
            });
        }
    });
  }, [firebaseUser, firestore]);

  const toggleBookmark = useCallback((questionId: string) => {
    if (!firebaseUser) { // Handle anonymous user
        setUserData(prev => {
          const isBookmarked = prev.bookmarks.includes(questionId);
          const newBookmarks = isBookmarked
            ? prev.bookmarks.filter(id => id !== questionId)
            : [...prev.bookmarks, questionId];
          return { ...prev, bookmarks: newBookmarks };
        });
    } else { // Handle registered user
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        getDoc(userDocRef).then(docSnap => {
            if (docSnap.exists()) {
                const currentBookmarks = docSnap.data().bookmarks || [];
                const isBookmarked = currentBookmarks.includes(questionId);
                const newBookmarks = isBookmarked
                  ? currentBookmarks.filter((id:string) => id !== questionId)
                  : [...currentBookmarks, questionId];
                updateDoc(userDocRef, { bookmarks: newBookmarks });
            }
        });
    }

    setTimeout(() => {
        toast({
            title: userData.bookmarks.includes(questionId) ? "Bookmark Removed" : "Bookmarked!",
            description: userData.bookmarks.includes(questionId) 
              ? "The question has been removed from your bookmarks."
              : "You can find this question in your bookmarks to review later.",
        });
    }, 0);
  }, [firebaseUser, firestore, toast, userData.bookmarks]);


  const isBookmarked = useCallback((questionId: string) => {
    return userData.bookmarks.includes(questionId);
  }, [userData.bookmarks]);

  const markSetAsCompleted = useCallback((quizSetId: string) => {
    if (userData.completedSets.includes(quizSetId)) return;

    if (!firebaseUser) { // Handle anonymous user
       setUserData(prev => ({ ...prev, completedSets: [...prev.completedSets, quizSetId] }));
    } else { // Handle registered user
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        getDoc(userDocRef).then(docSnap => {
            if (docSnap.exists()) {
                const completed = docSnap.data().completedSets || [];
                if (!completed.includes(quizSetId)) {
                    updateDoc(userDocRef, { completedSets: [...completed, quizSetId] });
                }
            }
        });
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
