'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { AppContextType, AppTheme, UserData, Attempt, UserStats } from '@/lib/types';
import { INITIAL_USER_DATA, LEVEL_THRESHOLDS } from '@/lib/constants';
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore, useUser } from '@/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData>(INITIAL_USER_DATA);
  const [theme, setThemeState] = useState<AppTheme>('system');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const auth = useAuth();
  const firestore = useFirestore();
  const { user: firebaseUser, isUserLoading } = useUser();

  const loadInitialTheme = useCallback(() => {
    try {
      const storedTheme = localStorage.getItem('quizo_theme') as AppTheme | null;
      if (storedTheme) {
        setThemeState(storedTheme);
      }
    } catch (error) {
      console.warn("Could not load theme from localStorage", error);
    }
  }, []);

  const loadAnonymousData = useCallback(() => {
    try {
      const localData = localStorage.getItem('quizo_anonymous_data');
      if (localData) {
        return JSON.parse(localData);
      }
    } catch (error) {
      console.warn("Could not parse anonymous user data from localStorage", error);
    }
    return INITIAL_USER_DATA;
  }, []);

  const saveAnonymousData = useCallback((data: UserData) => {
    try {
      localStorage.setItem('quizo_anonymous_data', JSON.stringify(data));
    } catch (error) {
      console.warn("Could not save anonymous user data to localStorage", error);
    }
  }, []);

  const mergeAnonymousData = useCallback(async (userId: string, anonData: UserData) => {
    if (!firestore) return;
    const userDocRef = doc(firestore, 'users', userId);
    
    try {
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) return;
      
      const cloudData = userDocSnap.data() as UserData;

      const newStats: UserStats = {
        points: cloudData.stats.points + anonData.stats.points,
        dailyPoints: (cloudData.stats.dailyPoints || 0) + (anonData.stats.dailyPoints || 0),
        weeklyPoints: (cloudData.stats.weeklyPoints || 0) + (anonData.stats.weeklyPoints || 0),
        monthlyPoints: (cloudData.stats.monthlyPoints || 0) + (anonData.stats.monthlyPoints || 0),
        coins: cloudData.stats.coins + anonData.stats.coins,
        xp: cloudData.stats.xp + anonData.stats.xp,
        level: 1,
      };
      
      const newBookmarks = [...new Set([...cloudData.bookmarks, ...anonData.bookmarks])];
      const newCompletedSets = [...new Set([...cloudData.completedSets, ...anonData.completedSets])];

      const newAttempts = { ...cloudData.attempts };
      for (const quizSetId in anonData.attempts) {
        const existingAttempts = newAttempts[quizSetId] || [];
        newAttempts[quizSetId] = [...existingAttempts, ...anonData.attempts[quizSetId]];
      }
      
      const finalData: Partial<UserData> = {
        stats: newStats,
        bookmarks: newBookmarks,
        completedSets: newCompletedSets,
        attempts: newAttempts,
      };

      const newLevel = LEVEL_THRESHOLDS.filter(xp => finalData.stats!.xp >= xp).length;
      finalData.stats!.level = Math.max(1, newLevel);
      
      await updateDoc(userDocRef, finalData);
      
      localStorage.removeItem('quizo_anonymous_data');

      // Return the merged data to be set in state
      return { ...cloudData, ...finalData } as UserData;

    } catch (error) {
      console.error("Error merging anonymous data:", error);
      return null;
    }
  }, [firestore]);


  useEffect(() => {
    loadInitialTheme();

    if (isUserLoading) {
      setIsLoading(true);
      return;
    }

    if (firebaseUser) {
      const userDocRef = doc(firestore, 'users', firebaseUser.uid);
      setIsLoading(true);
      
      getDoc(userDocRef).then(async (userDocSnap) => {
        let finalUserData: UserData | null = null;

        if (userDocSnap.exists()) {
          const loadedData = userDocSnap.data() as UserData;
          
          if (!firebaseUser.isAnonymous && localStorage.getItem('quizo_anonymous_data')) {
            const anonData = loadAnonymousData();
            const mergedData = await mergeAnonymousData(firebaseUser.uid, anonData);
            // After merge, we need to refetch the data to have the absolute latest state
            const freshSnap = await getDoc(userDocRef);
            finalUserData = freshSnap.data() as UserData;
          } else {
            finalUserData = loadedData;
          }
        } else {
           // This case is for a user who exists in Auth but not Firestore (e.g., failed signup)
           // Or a new anonymous user. We set the document here.
           const initialData = { ...INITIAL_USER_DATA, id: firebaseUser.uid, username: firebaseUser.displayName || 'Anonymous' };
           await setDoc(userDocRef, initialData);
           finalUserData = initialData;
        }

        if(finalUserData) {
          setUserData(finalUserData);
        }

      }).catch(error => {
        console.error("Failed to load user data from Firestore", error);
        setUserData(INITIAL_USER_DATA);
      }).finally(() => {
        setIsLoading(false);
      });

    } else {
      // No user at all, sign in anonymously.
      signInAnonymously(auth).catch(err => {
        console.error("Anonymous sign in failed:", err);
        setIsLoading(false);
      });
    }
  }, [firebaseUser, isUserLoading, firestore, auth, loadInitialTheme, loadAnonymousData, mergeAnonymousData]);


  useEffect(() => {
    if (isLoading || isUserLoading || !firebaseUser) return;
  
    // Only save if the userData is not the initial template state
    const isInitial = JSON.stringify(userData.stats) === JSON.stringify(INITIAL_USER_DATA.stats) && userData.bookmarks.length === 0 && userData.completedSets.length === 0;
  
    if (!isInitial) {
      if (firebaseUser.isAnonymous) {
        saveAnonymousData(userData);
      } else {
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        // Use setDoc with merge to avoid overwriting data from other clients
        setDoc(userDocRef, userData, { merge: true }).catch(error => {
          console.error("Failed to save user data to Firestore", error);
        });
      }
    }
  }, [userData, firebaseUser, isUserLoading, isLoading, firestore, saveAnonymousData]);


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
    } catch (error) {
      console.warn("Could not save theme to localStorage", error);
    }
  }, [theme]);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
  };
  
  const updateStats = useCallback((updates: Partial<UserStats>) => {
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
        
        if (newLevel > currentLevel) {
            newStats.level = newLevel;
            toast({
              title: "Level Up!",
              description: `Congratulations! You've reached Level ${newLevel}.`,
            });
        } else {
            newStats.level = currentLevel;
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
      
      setTimeout(() => {
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
      }, 0);

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
