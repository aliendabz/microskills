// Environment configuration
export const ENV = {
  // API Endpoints
  GRAPHQL_ENDPOINT: import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  
  // Authentication
  AUTH_DOMAIN: import.meta.env.VITE_AUTH_DOMAIN || 'localhost',
  AUTH_CLIENT_ID: import.meta.env.VITE_AUTH_CLIENT_ID || '',
  
  // Supabase Configuration
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  
  // Analytics
  POSTHOG_KEY: import.meta.env.VITE_POSTHOG_KEY || '',
  POSTHOG_HOST: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
  
  // Notifications
  FIREBASE_CONFIG: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  },
  
  // LLM Configuration
  LLM_PROVIDER: import.meta.env.VITE_LLM_PROVIDER || 'openai',
  LLM_API_KEY: import.meta.env.VITE_LLM_API_KEY || '',
  LLM_MODEL: import.meta.env.VITE_LLM_MODEL || 'gpt-4',
  LLM_BASE_URL: import.meta.env.VITE_LLM_BASE_URL || '',
  LLM_TIMEOUT: parseInt(import.meta.env.VITE_LLM_TIMEOUT || '30000'),
  LLM_MAX_RETRIES: parseInt(import.meta.env.VITE_LLM_MAX_RETRIES || '3'),
  
  // Feature Flags
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_NOTIFICATIONS: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
  ENABLE_DEBUG_MODE: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
  
  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'AI Skills',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  NODE_ENV: import.meta.env.MODE || 'development',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // GraphQL
  GRAPHQL: ENV.GRAPHQL_ENDPOINT,
  
  // REST API endpoints
  AUTH: {
    LOGIN: `${ENV.API_BASE_URL}/auth/login`,
    LOGOUT: `${ENV.API_BASE_URL}/auth/logout`,
    REFRESH: `${ENV.API_BASE_URL}/auth/refresh`,
    REGISTER: `${ENV.API_BASE_URL}/auth/register`,
    VERIFY_EMAIL: `${ENV.API_BASE_URL}/auth/verify-email`,
    FORGOT_PASSWORD: `${ENV.API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${ENV.API_BASE_URL}/auth/reset-password`,
  },
  
  USER: {
    PROFILE: `${ENV.API_BASE_URL}/user/profile`,
    PREFERENCES: `${ENV.API_BASE_URL}/user/preferences`,
    PROGRESS: `${ENV.API_BASE_URL}/user/progress`,
    ACHIEVEMENTS: `${ENV.API_BASE_URL}/user/achievements`,
  },
  
  LESSONS: {
    DAILY: `${ENV.API_BASE_URL}/lessons/daily`,
    PROGRESS: `${ENV.API_BASE_URL}/lessons/progress`,
    SUBMIT_QUIZ: `${ENV.API_BASE_URL}/lessons/quiz`,
    SWITCH_TONE: `${ENV.API_BASE_URL}/lessons/tone`,
    STREAM: `${ENV.API_BASE_URL}/lessons/stream`,
  },
  
  PROJECTS: {
    SUBMIT: `${ENV.API_BASE_URL}/projects/submit`,
    STATUS: `${ENV.API_BASE_URL}/projects/status`,
    HISTORY: `${ENV.API_BASE_URL}/projects/history`,
  },
  
  LLM: {
    EVALUATE: `${ENV.API_BASE_URL}/llm/evaluate`,
    ANALYZE: `${ENV.API_BASE_URL}/llm/analyze`,
    FEEDBACK: `${ENV.API_BASE_URL}/llm/feedback`,
    HEALTH: `${ENV.API_BASE_URL}/llm/health`,
  },
  
  CERTIFICATES: {
    GENERATE: `${ENV.API_BASE_URL}/certificates/generate`,
    SHARE: `${ENV.API_BASE_URL}/certificates/share`,
    VERIFY: `${ENV.API_BASE_URL}/certificates/verify`,
  },
  
  ANALYTICS: {
    EVENTS: `${ENV.API_BASE_URL}/analytics/events`,
    FUNNELS: `${ENV.API_BASE_URL}/analytics/funnels`,
    RETENTION: `${ENV.API_BASE_URL}/analytics/retention`,
  },
  
  NOTIFICATIONS: {
    PREFERENCES: `${ENV.API_BASE_URL}/notifications/preferences`,
    SEND: `${ENV.API_BASE_URL}/notifications/send`,
    SCHEDULE: `${ENV.API_BASE_URL}/notifications/schedule`,
  },
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. You do not have permission for this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'An internal server error occurred. Please try again later.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  LESSON_PROGRESS: 'lesson_progress',
  ANALYTICS_EVENTS: 'analytics_events',
  NOTIFICATION_SETTINGS: 'notification_settings',
} as const;

// Request Configuration
export const REQUEST_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
} as const;

// Feature Flags
export const FEATURES = {
  SPACED_REPETITION: true,
  REAL_TIME_LESSONS: true,
  PROJECT_GRADING: true,
  ACHIEVEMENTS: true,
  LEADERBOARD: true,
  BADGE_SHARING: true,
  PUSH_NOTIFICATIONS: ENV.ENABLE_NOTIFICATIONS,
  ANALYTICS: ENV.ENABLE_ANALYTICS,
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
} as const;

// App Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  LESSONS: '/lessons',
  PROJECTS: '/projects',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  LEADERBOARD: '/leaderboard',
  ACHIEVEMENTS: '/achievements',
  CERTIFICATES: '/certificates',
  ADMIN: '/admin',
} as const;