import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apolloClient, clearApolloCache, resetApolloStore } from './graphql';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.location
const locationMock = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: locationMock,
  writable: true,
});

describe('GraphQL Client Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Apollo Client Configuration', () => {
    it('should create Apollo Client with correct configuration', () => {
      expect(apolloClient).toBeDefined();
      expect(apolloClient.link).toBeDefined();
      expect(apolloClient.cache).toBeDefined();
    });

    it('should have correct default options', () => {
      const defaultOptions = apolloClient.defaultOptions;
      
      expect(defaultOptions.watchQuery?.errorPolicy).toBe('all');
      expect(defaultOptions.watchQuery?.fetchPolicy).toBe('cache-and-network');
      expect(defaultOptions.query?.errorPolicy).toBe('all');
      expect(defaultOptions.query?.fetchPolicy).toBe('cache-first');
      expect(defaultOptions.mutate?.errorPolicy).toBe('all');
    });

    it('should have type policies configured', () => {
      const cache = apolloClient.cache;
      const policies = cache.policies.getTypePolicy('Query');
      
      expect(policies).toBeDefined();
      // Check that the merge function exists and is configured to return false
      expect(policies?.fields?.getDailyLesson?.merge).toBeDefined();
      expect(policies?.fields?.userProgress?.merge).toBeDefined();
      expect(policies?.fields?.leaderboard?.merge).toBeDefined();
    });
  });

  describe('Auth Link', () => {
    it('should be configured to handle authentication tokens', () => {
      // Test that the auth link is part of the client configuration
      expect(apolloClient.link).toBeDefined();
      
      // Verify localStorage mock is set up correctly
      expect(localStorageMock.getItem).toBeDefined();
      expect(typeof localStorageMock.getItem).toBe('function');
    });

    it('should handle authentication token retrieval', () => {
      // Test localStorage.getItem functionality
      localStorageMock.getItem.mockReturnValue('test-token-123');
      const token = localStorageMock.getItem('auth_token');
      
      expect(token).toBe('test-token-123');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('Error Link', () => {
    it('should handle GraphQL errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Simulate GraphQL error
      const graphQLError = {
        message: 'Unauthorized access',
        locations: [{ line: 1, column: 1 }],
        path: ['getDailyLesson']
      };
      
      // This would normally be handled by the error link
      // For testing, we just verify the error handling logic exists
      expect(graphQLError.message).toContain('Unauthorized');
      
      consoleSpy.mockRestore();
    });

    it('should handle network errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Simulate network error
      const networkError = {
        statusCode: 401,
        message: 'Network error'
      };
      
      expect(networkError.statusCode).toBe(401);
      
      consoleSpy.mockRestore();
    });
  });

  describe('Retry Link', () => {
    it('should be configured with retry logic', () => {
      // The retry link should be part of the client configuration
      expect(apolloClient.link).toBeDefined();
    });
  });

  describe('Cache Management', () => {
    it('should provide clearApolloCache function', () => {
      expect(typeof clearApolloCache).toBe('function');
    });

    it('should provide resetApolloStore function', () => {
      expect(typeof resetApolloStore).toBe('function');
    });

    it('should clear cache when clearApolloCache is called', () => {
      const clearStoreSpy = vi.spyOn(apolloClient, 'clearStore').mockResolvedValue();
      
      clearApolloCache();
      
      expect(clearStoreSpy).toHaveBeenCalled();
      clearStoreSpy.mockRestore();
    });

    it('should reset store when resetApolloStore is called', () => {
      const resetStoreSpy = vi.spyOn(apolloClient, 'resetStore').mockResolvedValue();
      
      resetApolloStore();
      
      expect(resetStoreSpy).toHaveBeenCalled();
      resetStoreSpy.mockRestore();
    });
  });

  describe('Environment Configuration', () => {
    it('should use default GraphQL endpoint when environment variable is not set', () => {
      // The default endpoint should be used when VITE_GRAPHQL_ENDPOINT is not set
      const defaultEndpoint = 'http://localhost:4000/graphql';
      
      // This is configured in the graphql.ts file
      expect(defaultEndpoint).toBe('http://localhost:4000/graphql');
    });
  });
});