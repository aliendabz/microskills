# AI Skills API Documentation

## Overview

The AI Skills API provides a comprehensive set of endpoints for managing user authentication, lessons, projects, analytics, and more. The API supports both REST and GraphQL interfaces.

**Base URL**: `https://api.aiskills.com` (Production)  
**GraphQL Endpoint**: `https://api.aiskills.com/graphql`  
**API Version**: v1.0  
**Authentication**: Bearer Token (JWT)

## Table of Contents

1. [Authentication](#authentication)
2. [REST API Endpoints](#rest-api-endpoints)
3. [GraphQL API](#graphql-api)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Webhooks](#webhooks)
7. [SDKs and Libraries](#sdks-and-libraries)
8. [Examples](#examples)

## Authentication

### JWT Bearer Token

All API requests require authentication using a JWT Bearer token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Getting an Access Token

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh-token-here",
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://example.com/avatar.jpg"
    }
  }
}
```

#### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh-token-here"
}
```

### OAuth Providers

The API supports OAuth authentication through Supabase:

- **Google**: `GET /auth/google`
- **GitHub**: `GET /auth/github`
- **Microsoft**: `GET /auth/microsoft`

## REST API Endpoints

### Health Check

#### Get API Health Status

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "cache": "healthy",
    "llm": "healthy"
  }
}
```

### Authentication Endpoints

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

#### Verify Email

```http
POST /auth/verify-email
Content-Type: application/json

{
  "token": "verification-token"
}
```

#### Forgot Password

```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Reset Password

```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset-token",
  "password": "newpassword"
}
```

#### Logout

```http
POST /auth/logout
Authorization: Bearer <token>
```

### User Management

#### Get User Profile

```http
GET /user/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2024-01-01T00:00:00Z",
    "lastActive": "2024-01-15T10:30:00Z"
  }
}
```

#### Update User Profile

```http
PUT /user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

#### Get User Preferences

```http
GET /user/preferences
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "learningStyle": "visual",
    "difficulty": "intermediate",
    "notifications": {
      "email": true,
      "push": true,
      "sms": false
    },
    "timezone": "America/New_York",
    "language": "en"
  }
}
```

#### Update User Preferences

```http
PUT /user/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "learningStyle": "auditory",
  "difficulty": "advanced",
  "notifications": {
    "email": true,
    "push": false,
    "sms": false
  }
}
```

#### Get User Progress

```http
GET /user/progress
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "completedLessons": 25,
    "totalXP": 1250,
    "currentStreak": 7,
    "longestStreak": 14,
    "averageScore": 85.5,
    "timeSpent": 3600,
    "lastActive": "2024-01-15T10:30:00Z",
    "achievements": [
      {
        "id": "achievement-1",
        "name": "First Lesson",
        "description": "Completed your first lesson",
        "unlockedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "lessonHistory": [
      {
        "lessonId": "lesson-1",
        "completedAt": "2024-01-15T10:00:00Z",
        "score": 90,
        "timeSpent": 300
      }
    ]
  }
}
```

### Lesson Management

#### Get Daily Lesson

```http
GET /lessons/daily
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "lesson-123",
    "title": "Introduction to React Hooks",
    "content": "React Hooks are functions that allow you to use state and other React features...",
    "difficulty": "intermediate",
    "estimatedTime": 1800,
    "topics": ["react", "hooks", "state"],
    "quiz": {
      "id": "quiz-123",
      "questions": [
        {
          "id": "q1",
          "question": "What is the purpose of useState hook?",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "A"
        }
      ]
    }
  }
}
```

#### Submit Quiz

```http
POST /lessons/quiz
Authorization: Bearer <token>
Content-Type: application/json

{
  "lessonId": "lesson-123",
  "answers": [
    {
      "questionId": "q1",
      "answer": "A"
    }
  ],
  "timeSpent": 300
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 90,
    "feedback": "Great job! You answered 9 out of 10 questions correctly.",
    "correctAnswers": 9,
    "totalQuestions": 10,
    "timeSpent": 300,
    "xpEarned": 50
  }
}
```

#### Switch Lesson Tone

```http
POST /lessons/tone
Authorization: Bearer <token>
Content-Type: application/json

{
  "lessonId": "lesson-123",
  "tone": "professional"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "newTone": "professional",
    "updatedContent": "React Hooks represent a fundamental shift in how we approach state management..."
  }
}
```

#### Stream Lesson Content

```http
GET /lessons/stream/lesson-123
Authorization: Bearer <token>
Accept: text/event-stream
```

**Server-Sent Events Response:**
```
event: lesson-chunk
data: {"chunk": "React Hooks are functions that allow you to use state..."}

event: lesson-chunk
data: {"chunk": "The useState hook is the most basic hook..."}

event: lesson-complete
data: {"lessonId": "lesson-123", "totalChunks": 10}
```

### Project Management

#### Submit Project

```http
POST /projects/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "web-app",
  "title": "Todo Application",
  "description": "A simple todo application built with React",
  "code": "function TodoApp() { ... }",
  "requirements": ["useState", "useEffect", "CRUD operations"],
  "language": "javascript"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "projectId": "project-123",
    "status": "queued",
    "estimatedCompletionTime": 300,
    "queuePosition": 5
  }
}
```

#### Get Project Status

```http
GET /projects/status/project-123
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "project-123",
    "status": "completed",
    "score": 85,
    "feedback": "Excellent implementation! Good use of React hooks...",
    "completedAt": "2024-01-15T10:30:00Z",
    "requirements": {
      "useState": "passed",
      "useEffect": "passed",
      "CRUD operations": "passed"
    }
  }
}
```

#### Get Project History

```http
GET /projects/history
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "project-123",
      "title": "Todo Application",
      "type": "web-app",
      "status": "completed",
      "submittedAt": "2024-01-15T10:00:00Z",
      "completedAt": "2024-01-15T10:30:00Z",
      "score": 85,
      "feedback": "Excellent implementation!"
    }
  ]
}
```

### LLM Integration

#### Evaluate Code

```http
POST /llm/evaluate
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "function fibonacci(n) { return n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2); }",
  "requirements": ["efficiency", "readability", "correctness"],
  "language": "javascript"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 85,
    "feedback": "Good implementation of the Fibonacci function...",
    "evaluation": {
      "efficiency": "Good - O(n) time complexity",
      "readability": "Excellent - Clear and well-structured",
      "correctness": "Perfect - Handles all edge cases"
    }
  }
}
```

#### Analyze Code

```http
POST /llm/analyze
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "function bubbleSort(arr) { ... }",
  "language": "javascript"
}
```

#### Generate Feedback

```http
POST /llm/feedback
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "function sort(arr) { ... }",
  "score": 75,
  "language": "javascript"
}
```

### Certificate Management

#### Generate Certificate

```http
POST /certificates/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "trackId": "track-123",
  "userId": "user-123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "certificateId": "cert-123",
    "downloadUrl": "https://api.aiskills.com/certificates/cert-123/download",
    "shareUrl": "https://api.aiskills.com/certificates/cert-123/share"
  }
}
```

#### Share Badge

```http
POST /certificates/share
Authorization: Bearer <token>
Content-Type: application/json

{
  "certificateId": "cert-123",
  "platform": "linkedin",
  "message": "Just completed the AI Skills course!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shareUrl": "https://www.linkedin.com/sharing/share-offsite/?url=...",
    "platform": "linkedin",
    "sharedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Analytics

#### Track Event

```http
POST /analytics/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "event": "lesson_completed",
  "properties": {
    "lessonId": "lesson-123",
    "timeSpent": 1800,
    "score": 90
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "eventId": "event-123",
    "trackedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Get Analytics Funnels

```http
GET /analytics/funnels
Authorization: Bearer <token>
```

#### Get Retention Data

```http
GET /analytics/retention
Authorization: Bearer <token>
```

### Notifications

#### Update Notification Preferences

```http
PUT /notifications/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": true,
  "push": true,
  "sms": false,
  "frequency": "daily"
}
```

#### Send Notification

```http
POST /notifications/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user-123",
  "type": "lesson_reminder",
  "title": "Time for your daily lesson!",
  "message": "Don't break your streak - complete today's lesson.",
  "data": {
    "lessonId": "lesson-123"
  }
}
```

## GraphQL API

### Schema Overview

The GraphQL API provides a type-safe interface for querying and mutating data. All GraphQL operations require authentication via the `Authorization` header.

### Queries

#### Get Daily Lesson

```graphql
query GetDailyLesson {
  getDailyLesson {
    id
    title
    content
    difficulty
    estimatedTime
    topics
    quiz {
      id
      questions {
        id
        question
        options
        correctAnswer
      }
    }
  }
}
```

#### Get User Profile

```graphql
query GetUserProfile {
  getUserProfile {
    id
    email
    name
    avatar
    preferences {
      learningStyle
      difficulty
      notifications
    }
    progress {
      completedLessons
      totalXP
      currentStreak
      achievements {
        id
        name
        description
        unlockedAt
      }
    }
  }
}
```

#### Get User Progress

```graphql
query GetUserProgress {
  getUserProgress {
    completedLessons
    totalXP
    currentStreak
    longestStreak
    averageScore
    timeSpent
    lastActive
    achievements {
      id
      name
      description
      unlockedAt
    }
    lessonHistory {
      lessonId
      completedAt
      score
      timeSpent
    }
  }
}
```

#### Get Project History

```graphql
query GetProjectHistory {
  getProjectHistory {
    id
    title
    type
    status
    submittedAt
    completedAt
    score
    feedback
    requirements
  }
}
```

#### Get Leaderboard

```graphql
query GetLeaderboard {
  getLeaderboard {
    rank
    user {
      id
      name
      avatar
    }
    totalXP
    completedLessons
    currentStreak
  }
}
```

### Mutations

#### Submit Quiz

```graphql
mutation SubmitQuiz($input: QuizSubmissionInput!) {
  submitQuiz(input: $input) {
    success
    score
    feedback
    correctAnswers
    totalQuestions
    timeSpent
    xpEarned
  }
}
```

**Variables:**
```json
{
  "input": {
    "lessonId": "lesson-123",
    "answers": [
      {
        "questionId": "q1",
        "answer": "A"
      }
    ],
    "timeSpent": 300
  }
}
```

#### Switch Tone

```graphql
mutation SwitchTone($input: ToneSwitchInput!) {
  switchTone(input: $input) {
    success
    newTone
    updatedContent
  }
}
```

#### Submit Project

```graphql
mutation SubmitProject($input: ProjectSubmissionInput!) {
  submitProject(input: $input) {
    success
    projectId
    status
    estimatedCompletionTime
    queuePosition
  }
}
```

#### Share Badge

```graphql
mutation ShareBadge($input: BadgeShareInput!) {
  shareBadge(input: $input) {
    success
    shareUrl
    platform
    sharedAt
  }
}
```

#### Track Event

```graphql
mutation TrackEvent($input: EventTrackingInput!) {
  trackEvent(input: $input) {
    success
    eventId
    trackedAt
  }
}
```

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error
- `502` - Bad Gateway
- `503` - Service Unavailable

### Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "status": 422,
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

### Common Error Codes

- `AUTHENTICATION_FAILED` - Invalid credentials
- `TOKEN_EXPIRED` - JWT token has expired
- `VALIDATION_ERROR` - Request validation failed
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_SERVER_ERROR` - Server error

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **Authentication endpoints**: 5 requests per minute
- **General endpoints**: 100 requests per minute
- **Heavy operations** (LLM, project submission): 10 requests per minute

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248600
```

## Webhooks

The API supports webhooks for real-time notifications:

### Webhook Events

- `user.registered` - New user registration
- `lesson.completed` - Lesson completion
- `project.submitted` - Project submission
- `project.completed` - Project evaluation completed
- `achievement.unlocked` - Achievement unlocked
- `certificate.generated` - Certificate generated

### Webhook Configuration

```http
POST /webhooks
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://your-app.com/webhooks",
  "events": ["lesson.completed", "project.completed"],
  "secret": "webhook-secret"
}
```

### Webhook Payload

```json
{
  "event": "lesson.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "userId": "user-123",
    "lessonId": "lesson-123",
    "score": 90,
    "timeSpent": 1800
  }
}
```

## SDKs and Libraries

### JavaScript/TypeScript

```bash
npm install @aiskills/api-client
```

```javascript
import { AISkillsAPI } from '@aiskills/api-client';

const api = new AISkillsAPI({
  baseURL: 'https://api.aiskills.com',
  token: 'your-jwt-token'
});

// Get daily lesson
const lesson = await api.lessons.getDaily();

// Submit quiz
const result = await api.lessons.submitQuiz({
  lessonId: 'lesson-123',
  answers: [{ questionId: 'q1', answer: 'A' }],
  timeSpent: 300
});
```

### Python

```bash
pip install aiskills-api
```

```python
from aiskills_api import AISkillsAPI

api = AISkillsAPI(
    base_url="https://api.aiskills.com",
    token="your-jwt-token"
)

# Get daily lesson
lesson = api.lessons.get_daily()

# Submit quiz
result = api.lessons.submit_quiz(
    lesson_id="lesson-123",
    answers=[{"questionId": "q1", "answer": "A"}],
    time_spent=300
)
```

## Examples

### Complete Authentication Flow

```javascript
// 1. Login
const loginResponse = await fetch('https://api.aiskills.com/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password'
  })
});

const { token } = await loginResponse.json();

// 2. Get daily lesson
const lessonResponse = await fetch('https://api.aiskills.com/lessons/daily', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const lesson = await lessonResponse.json();

// 3. Submit quiz
const quizResponse = await fetch('https://api.aiskills.com/lessons/quiz', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    lessonId: lesson.data.id,
    answers: [{ questionId: 'q1', answer: 'A' }],
    timeSpent: 300
  })
});

const result = await quizResponse.json();
```

### GraphQL Example

```javascript
const query = `
  query GetDailyLesson {
    getDailyLesson {
      id
      title
      content
      quiz {
        questions {
          id
          question
          options
        }
      }
    }
  }
`;

const response = await fetch('https://api.aiskills.com/graphql', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ query })
});

const data = await response.json();
```

### Error Handling Example

```javascript
try {
  const response = await fetch('https://api.aiskills.com/lessons/daily', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  const data = await response.json();
} catch (error) {
  if (error.message === 'TOKEN_EXPIRED') {
    // Refresh token
    await refreshToken();
  } else {
    console.error('API Error:', error.message);
  }
}
```

## Support

For API support and questions:

- **Documentation**: https://docs.aiskills.com
- **API Status**: https://status.aiskills.com
- **Support Email**: api-support@aiskills.com
- **Community**: https://community.aiskills.com

## Changelog

### v1.0.0 (2024-01-15)
- Initial API release
- Authentication endpoints
- Lesson management
- Project submission
- GraphQL support
- Webhook system 