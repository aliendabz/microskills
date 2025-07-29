import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { authManager, getAuthToken, getCurrentUser, logout as authLogout } from '@/lib/auth';
import { handleError } from '@/utils/errorHandling';
import type { 
  LoginCredentials, 
  LoginResponse, 
  User, 
  UserPreferences,
  RefreshTokenResponse 
} from '@/types/api';

// Authentication state interface
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

// Authentication actions interface
export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (user: Partial<User>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  clearError: () => void;
}

// Hook return type
export type UseAuthReturn = AuthState & AuthActions;

// Query keys
const AUTH_QUERY_KEYS = {
  user: ['auth', 'user'],
  preferences: ['auth', 'preferences'],
  session: ['auth', 'session'],
} as const;

export function useAuth(): UseAuthReturn {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get current user query
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
    refetch: refetchUser
  } = useQuery({
    queryKey: AUTH_QUERY_KEYS.user,
    queryFn: async (): Promise<User> => {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const response = await apiClient.getUserProfile();
      return response.data;
    },
    enabled: !!getAuthToken(),
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Get user preferences query
  const {
    data: preferences,
    isLoading: isLoadingPreferences,
    refetch: refetchPreferences
  } = useQuery({
    queryKey: AUTH_QUERY_KEYS.preferences,
    queryFn: async (): Promise<UserPreferences> => {
      const response = await apiClient.getUserPreferences();
      return response.data;
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<LoginResponse> => {
      const response = await apiClient.login(credentials);
      return response.data;
    },
    onSuccess: async (data) => {
      // Store authentication data
      authManager.handleLoginResponse(data);
      
      // Invalidate and refetch user data
      await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.user });
      await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.preferences });
      
      // Clear any previous errors
      setError(null);
      
      // Track login event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:login', { detail: { user: data.user } }));
      }
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      handleError(error, { action: 'login' });
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      try {
        await apiClient.logout();
      } catch (error) {
        // Continue with logout even if API call fails
        console.warn('Logout API call failed:', error);
      }
    },
    onSuccess: () => {
      // Clear authentication data
      authLogout();
      
      // Clear all queries
      queryClient.clear();
      
      // Clear error state
      setError(null);
      
      // Track logout event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
    },
    onError: (error: any) => {
      // Force logout even if API call fails
      authLogout();
      queryClient.clear();
      setError(null);
      handleError(error, { action: 'logout' });
    }
  });

  // Refresh token mutation
  const refreshTokenMutation = useMutation({
    mutationFn: async (): Promise<RefreshTokenResponse> => {
      const response = await apiClient.refreshToken();
      return response.data;
    },
    onSuccess: (data) => {
      // Update token data
      authManager.setTokenData({
        token: data.token,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        userId: getCurrentUser()?.id || '',
      });
      
      // Invalidate queries to refetch with new token
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.user });
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.preferences });
    },
    onError: (error: any) => {
      // If refresh fails, logout the user
      handleError(error, { action: 'refresh-token' });
      logoutMutation.mutate();
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<User>): Promise<User> => {
      const response = await apiClient.updateUserProfile(userData);
      return response.data;
    },
    onSuccess: (updatedUser) => {
      // Update user in cache
      queryClient.setQueryData(AUTH_QUERY_KEYS.user, updatedUser);
      
      // Update user in auth manager
      authManager.updateUser(updatedUser);
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to update user profile');
      handleError(error, { action: 'update-user' });
    }
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferencesData: Partial<UserPreferences>): Promise<UserPreferences> => {
      const response = await apiClient.updateUserPreferences(preferencesData);
      return response.data;
    },
    onSuccess: (updatedPreferences) => {
      // Update preferences in cache
      queryClient.setQueryData(AUTH_QUERY_KEYS.preferences, updatedPreferences);
      
      // Update user with new preferences
      if (user) {
        const updatedUser = { ...user, preferences: updatedPreferences };
        queryClient.setQueryData(AUTH_QUERY_KEYS.user, updatedUser);
        authManager.updateUser(updatedUser);
      }
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to update preferences');
      handleError(error, { action: 'update-preferences' });
    }
  });

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getAuthToken();
        const currentUser = getCurrentUser();
        
        if (token && currentUser) {
          // Check if token needs refresh
          if (authManager.shouldRefreshToken()) {
            await refreshTokenMutation.mutateAsync();
          }
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Handle authentication errors
  useEffect(() => {
    if (userError) {
      const errorMessage = userError.message || 'Failed to load user data';
      setError(errorMessage);
      
      // If it's an authentication error, logout
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        logoutMutation.mutate();
      }
    }
  }, [userError]);

  // Set up token refresh listener
  useEffect(() => {
    const handleTokenRefresh = () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.user });
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.preferences });
    };

    authManager.onTokenRefresh(handleTokenRefresh);
    
    return () => {
      authManager.offTokenRefresh(handleTokenRefresh);
    };
  }, [queryClient]);

  // Authentication actions
  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    await loginMutation.mutateAsync(credentials);
  }, [loginMutation]);

  const logout = useCallback(async (): Promise<void> => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const refreshToken = useCallback(async (): Promise<void> => {
    await refreshTokenMutation.mutateAsync();
  }, [refreshTokenMutation]);

  const updateUser = useCallback(async (userData: Partial<User>): Promise<void> => {
    await updateUserMutation.mutateAsync(userData);
  }, [updateUserMutation]);

  const updatePreferences = useCallback(async (preferencesData: Partial<UserPreferences>): Promise<void> => {
    await updatePreferencesMutation.mutateAsync(preferencesData);
  }, [updatePreferencesMutation]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Determine authentication state
  const isAuthenticated = !!user && !!getAuthToken();
  const isLoading = isLoadingUser || isLoadingPreferences || 
                   loginMutation.isPending || 
                   logoutMutation.isPending || 
                   refreshTokenMutation.isPending ||
                   !isInitialized;

  return {
    // State
    isAuthenticated,
    user: user || null,
    isLoading,
    error,
    isInitialized,
    
    // Actions
    login,
    logout,
    refreshToken,
    updateUser,
    updatePreferences,
    clearError,
  };
}

// Export hook as default
export default useAuth;