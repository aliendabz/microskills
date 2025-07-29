import { useCallback } from 'react';

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
}

export const useAnalytics = () => {
  const track = useCallback((event: string, properties?: Record<string, any>) => {
    // Mock analytics - ready for PostHog integration
    console.log('Analytics Event:', { event, properties, timestamp: Date.now() });
    
    // Store for debugging
    const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    events.push({ event, properties, timestamp: Date.now() });
    localStorage.setItem('analytics_events', JSON.stringify(events.slice(-100))); // Keep last 100
  }, []);

  const identify = useCallback((userId: string, traits?: Record<string, any>) => {
    console.log('Analytics Identify:', { userId, traits });
    localStorage.setItem('analytics_user', JSON.stringify({ userId, traits }));
  }, []);

  return { track, identify };
};

// Common events
export const ANALYTICS_EVENTS = {
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  LESSON_STARTED: 'lesson_started',
  LESSON_COMPLETED: 'lesson_completed',
  TONE_SWITCHED: 'tone_switched',
  PROJECT_SUBMITTED: 'project_submitted',
  BADGE_SHARED: 'badge_shared',
  STREAK_ACHIEVED: 'streak_achieved',
} as const;