import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { gql } from '@apollo/client';
import { ENV, STORAGE_KEYS, ERROR_MESSAGES, REQUEST_CONFIG } from './constants';

// GraphQL Queries
export const GET_DAILY_LESSON = gql`
  query GetDailyLesson {
    getDailyLesson {
      id
      title
      description
      content {
        sections {
          id
          title
          content
          order
          type
          metadata
        }
        resources {
          id
          title
          type
          url
          description
        }
        quiz {
          id
          questions {
            id
            question
            type
            options
            correctAnswer
            explanation
            points
          }
          timeLimit
          passingScore
        }
      }
      difficulty
      duration
      tags
      category
      prerequisites
      objectives
      estimatedTime
      createdAt
      updatedAt
    }
  }
`;

export const GET_USER_PROGRESS = gql`
  query GetUserProgress {
    userProgress {
      userId
      lessonsCompleted
      totalLessons
      currentStreak
      longestStreak
      totalXp
      level
      achievements {
        id
        title
        description
        icon
        category
        rarity
        xpReward
        unlockedAt
        progress {
          current
          target
          percentage
        }
      }
      recentActivity {
        id
        type
        title
        description
        xpEarned
        timestamp
        metadata
      }
      weeklyProgress {
        weekStart
        lessonsCompleted
        xpEarned
        streakDays
        goals {
          id
          title
          target
          current
          type
          deadline
          completed
        }
      }
      monthlyProgress {
        month
        lessonsCompleted
        xpEarned
        averageStreak
        topCategories {
          category
          lessonsCompleted
          totalLessons
          averageScore
        }
      }
    }
  }
`;

// GraphQL Mutations
export const SUBMIT_QUIZ = gql`
  mutation SubmitQuiz($input: QuizSubmissionInput!) {
    submitQuiz(input: $input) {
      score
      totalPoints
      percentage
      passed
      feedback {
        questionId
        correct
        explanation
        pointsEarned
      }
      timeSpent
      submittedAt
    }
  }
`;

export const SWITCH_TONE = gql`
  mutation SwitchTone($input: ToneSwitchInput!) {
    switchTone(input: $input) {
      success
      newTone
      message
    }
  }
`;

export const MARK_LESSON_COMPLETE = gql`
  mutation MarkLessonComplete($input: LessonCompletionInput!) {
    markLessonComplete(input: $input) {
      success
      xpEarned
      achievements {
        id
        title
        description
        icon
      }
    }
  }
`;

// HTTP Link
const httpLink = createHttpLink({
  uri: ENV.GRAPHQL_ENDPOINT,
});

// Auth Link - adds authentication headers
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

// Error Link - handles GraphQL and network errors
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
      
      // Handle authentication errors
      if (message.includes('Unauthorized') || message.includes('Forbidden')) {
        // Clear invalid token and redirect to login
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        window.location.href = '/login';
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    
    // Handle network errors
    if (networkError.statusCode === 401) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      window.location.href = '/login';
    }
  }
});

// Retry Link - retries failed requests
const retryLink = new RetryLink({
  delay: {
    initial: REQUEST_CONFIG.RETRY_DELAY,
    max: REQUEST_CONFIG.TIMEOUT,
    jitter: true
  },
  attempts: {
    max: REQUEST_CONFIG.RETRY_ATTEMPTS,
    retryIf: (error, _operation) => {
      // Retry on network errors, but not on GraphQL errors
      return !!error && !error.graphQLErrors;
    }
  }
});

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: from([
    errorLink,
    retryLink,
    authLink,
    httpLink
  ]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Configure cache policies for specific queries
          getDailyLesson: {
            merge: false, // Don't merge, always replace
          },
          userProgress: {
            merge: false,
          },
          leaderboard: {
            merge: false,
          }
        }
      }
    }
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

// Helper function to clear cache
export const clearApolloCache = () => {
  apolloClient.clearStore();
};

// Helper function to reset store (clears cache and refetches active queries)
export const resetApolloStore = () => {
  apolloClient.resetStore();
};

// Export the client as default
export default apolloClient;