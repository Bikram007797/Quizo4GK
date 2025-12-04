'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AppContextType, AppTheme, UserData, Attempt, UserStats } from '@/lib/types';
import { INITIAL_USER_DATA, LEVEL_THRESHOLDS } from '@/lib/constants';
import { useToast } from "@/hooks/use-toast";


const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData>(INITIAL_USER_DATA);
  const [theme, setThemeState] = useState<AppTheme>('system');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedUserData = localStorage.getItem('quizo_userData');
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      }
      
      const storedTheme = localStorage.getItem('quizo_theme') as AppTheme | null;
      if (storedTheme) {
        setThemeState(storedTheme);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('quizo_userData', JSON.stringify(userData));
      } catch (error) {
        console.error("Failed to save user data to localStorage", error);
      }
    }
  }, [userData, isLoading]);
  
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

        const currentLevel = newStats.level;
        const newLevel = LEVEL_THRESHOLDS.findIndex(xp => newStats.xp < xp);

        if (newLevel > currentLevel || (newLevel === -1 && currentLevel < LEVEL_THRESHOLDS.length)) {
            const calculatedLevel = newLevel === -1 ? LEVEL_THRESHOLDS.length : newLevel;
            if (calculatedLevel > currentLevel) {
                newStats.level = calculatedLevel;
                 toast({
                    title: "Level Up!",
                    description: `Congratulations, you've reached Level ${newStats.level}!`,
                });
            }
        } else if (newLevel === 1 && currentLevel === 0) { // From 0 to 1
             newStats.level = 1;
             toast({
                title: "Level Up!",
                description: `Congratulations, you've reached Level ${newStats.level}!`,
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
      const newBookmarks = prev.bookmarks.includes(questionId)
        ? prev.bookmarks.filter(id => id !== questionId)
        : [...prev.bookmarks, questionId];
      toast({
        title: newBookmarks.includes(questionId) ? "Bookmarked!" : "Bookmark Removed",
        description: newBookmarks.includes(questionId) 
          ? "You can review this question later in your bookmarks." 
          : "The question has been removed from your bookmarks.",
      });
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
    isLoading
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
