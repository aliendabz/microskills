import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { apiClient } from '@/services/api';
import { handleError } from '@/utils/errorHandling';
import { useSpacedRepetition } from './useSpacedRepetition';
import type { 
  Lesson, 
  QuizSubmission, 
  QuizResult, 
  ToneSwitchRequest,
  ToneSwitchResponse,
  UserProgress,
  SpacedRepetitionItem 
} from '@/types/api';

// Lesson state interface
export interface LessonState {
  currentLesson: Lesson | null;
  lessonProgress: UserProgress | null;
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;
  isToneSwitching: boolean;
}

// Lesson actions interface
export interface LessonActions {
  getDailyLesson: () => Promise<Lesson>;
  submitQuiz: (submission: QuizSubmission) => Promise<QuizResult>;
  switchTone: (tone: string, lessonId?: string) => Promise<ToneSwitchResponse>;
  markLessonComplete: (lessonId: string, score?: number) => Promise<void>;
  getLessonProgress: () => Promise<UserProgress>;
  clearError: () => void;
}

// Hook return type
export type UseLessonsReturn = LessonState & LessonActions;

// Query keys
const LESSON_QUERY_KEYS = {
  dailyLesson: ['lessons', 'daily'],
  lessonProgress: ['lessons', 'progress'],
  lessonById: (id: string) => ['lessons', id],
  userProgress: ['user', 'progress'],
} as const;

export function useLessons(): UseLessonsReturn {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isToneSwitching, setIsToneSwitching] = useState(false);
  
  const { updateSpacedRepetition, getNextReview } = useSpacedRepetition();

  // Get daily lesson query
  const {
    data: currentLesson,
    isLoading: isLoadingLesson,
    error: lessonError,
    refetch: refetchDailyLesson
  } = useQuery({
    queryKey: LESSON_QUERY_KEYS.dailyLesson,
    queryFn: async (): Promise<Lesson> => {
      const response = await apiClient.getDailyLesson();
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Get user progress query
  const {
    data: lessonProgress,
    isLoading: isLoadingProgress,
    refetch: refetchProgress
  } = useQuery({
    queryKey: LESSON_QUERY_KEYS.lessonProgress,
    queryFn: async (): Promise<UserProgress> => {
      const response = await apiClient.getUserProgress();
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Submit quiz mutation
  const submitQuizMutation = useMutation({
    mutationFn: async (submission: QuizSubmission): Promise<QuizResult> => {
      setIsSubmitting(true);
      try {
        const response = await apiClient.submitQuiz(submission);
        return response.data;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: async (result, submission) => {
      // Update lesson progress
      await queryClient.invalidateQueries({ queryKey: LESSON_QUERY_KEYS.lessonProgress });
      await queryClient.invalidateQueries({ queryKey: LESSON_QUERY_KEYS.userProgress });
      
      // Update spaced repetition if quiz was passed
      if (result.passed && submission.quizId) {
        await updateSpacedRepetition({
          lessonId: submission.quizId,
          quality: result.percentage >= 80 ? 5 : result.percentage >= 60 ? 4 : 3,
        });
      }
      
      // Clear any previous errors
      setError(null);
      
      // Track quiz completion event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lesson:quiz-completed', { 
          detail: { 
            lessonId: submission.quizId,
            score: result.percentage,
            passed: result.passed 
          } 
        }));
      }
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to submit quiz. Please try again.';
      setError(errorMessage);
      handleError(error, { action: 'submit-quiz' });
    }
  });

  // Switch tone mutation
  const switchToneMutation = useMutation({
    mutationFn: async ({ tone, lessonId }: { tone: string; lessonId?: string }): Promise<ToneSwitchResponse> => {
      setIsToneSwitching(true);
      try {
        const request: ToneSwitchRequest = {
          tone,
          lessonId: lessonId || currentLesson?.id,
          sessionId: sessionStorage.getItem('session_id') || undefined,
        };
        
        const response = await apiClient.switchTone(request);
        return response.data;
      } finally {
        setIsToneSwitching(false);
      }
    },
    onSuccess: (result) => {
      // Invalidate lesson data to refetch with new tone
      queryClient.invalidateQueries({ queryKey: LESSON_QUERY_KEYS.dailyLesson });
      
      // Clear any previous errors
      setError(null);
      
      // Track tone switch event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lesson:tone-switched', { 
          detail: { 
            newTone: result.newTone,
            lessonId: currentLesson?.id 
          } 
        }));
      }
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to switch tone. Please try again.';
      setError(errorMessage);
      handleError(error, { action: 'switch-tone' });
    }
  });

  // Mark lesson complete mutation
  const markLessonCompleteMutation = useMutation({
    mutationFn: async ({ lessonId, score }: { lessonId: string; score?: number }): Promise<void> => {
      // This would typically call an API endpoint to mark the lesson as complete
      // For now, we'll just update the local state
      return Promise.resolve();
    },
    onSuccess: async (_, { lessonId, score }) => {
      // Update progress
      await queryClient.invalidateQueries({ queryKey: LESSON_QUERY_KEYS.lessonProgress });
      await queryClient.invalidateQueries({ queryKey: LESSON_QUERY_KEYS.userProgress });
      
      // Update spaced repetition
      if (score !== undefined) {
        await updateSpacedRepetition({
          lessonId,
          quality: score >= 80 ? 5 : score >= 60 ? 4 : 3,
        });
      }
      
      // Track lesson completion event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lesson:completed', { 
          detail: { 
            lessonId,
            score 
          } 
        }));
      }
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to mark lesson as complete.';
      setError(errorMessage);
      handleError(error, { action: 'mark-lesson-complete' });
    }
  });

  // Handle lesson errors
  const handleLessonError = useCallback((error: any) => {
    const errorMessage = error.message || 'Failed to load lesson data.';
    setError(errorMessage);
    
    // If it's an authentication error, it will be handled by the auth hook
    if (!errorMessage.includes('401') && !errorMessage.includes('Unauthorized')) {
      handleError(error, { action: 'load-lesson' });
    }
  }, []);

  // Handle progress errors
  const handleProgressError = useCallback((error: any) => {
    const errorMessage = error.message || 'Failed to load progress data.';
    setError(errorMessage);
    
    if (!errorMessage.includes('401') && !errorMessage.includes('Unauthorized')) {
      handleError(error, { action: 'load-progress' });
    }
  }, []);

  // Lesson actions
  const getDailyLesson = useCallback(async (): Promise<Lesson> => {
    try {
      const result = await refetchDailyLesson();
      if (result.data) {
        return result.data;
      }
      throw new Error('Failed to fetch daily lesson');
    } catch (error: any) {
      handleLessonError(error);
      throw error;
    }
  }, [refetchDailyLesson, handleLessonError]);

  const submitQuiz = useCallback(async (submission: QuizSubmission): Promise<QuizResult> => {
    return submitQuizMutation.mutateAsync(submission);
  }, [submitQuizMutation]);

  const switchTone = useCallback(async (tone: string, lessonId?: string): Promise<ToneSwitchResponse> => {
    return switchToneMutation.mutateAsync({ tone, lessonId });
  }, [switchToneMutation]);

  const markLessonComplete = useCallback(async (lessonId: string, score?: number): Promise<void> => {
    return markLessonCompleteMutation.mutateAsync({ lessonId, score });
  }, [markLessonCompleteMutation]);

  const getLessonProgress = useCallback(async (): Promise<UserProgress> => {
    try {
      const result = await refetchProgress();
      if (result.data) {
        return result.data;
      }
      throw new Error('Failed to fetch lesson progress');
    } catch (error: any) {
      handleProgressError(error);
      throw error;
    }
  }, [refetchProgress, handleProgressError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Determine loading state
  const isLoading = isLoadingLesson || isLoadingProgress || !isAuthenticated;

  // Handle errors from queries
  if (lessonError && !error) {
    handleLessonError(lessonError);
  }

  return {
    // State
    currentLesson: currentLesson || null,
    lessonProgress: lessonProgress || null,
    isLoading,
    error,
    isSubmitting,
    isToneSwitching,
    
    // Actions
    getDailyLesson,
    submitQuiz,
    switchTone,
    markLessonComplete,
    getLessonProgress,
    clearError,
  };
}

// Export hook as default
export default useLessons;