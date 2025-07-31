# Load Testing with k6

This directory contains comprehensive load testing setup for the AI Skills application using k6.

## Overview

The load testing suite includes:
- **Smoke Tests**: Basic functionality verification
- **Load Tests**: Normal expected load scenarios
- **Stress Tests**: Beyond normal capacity testing
- **Spike Tests**: Sudden increase in load testing
- **Soak Tests**: Long duration sustained load testing
- **GraphQL Tests**: Specific GraphQL endpoint testing

## Prerequisites

1. **Install k6**: Follow the [official k6 installation guide](https://k6.io/docs/getting-started/installation/)

   **Windows (using Chocolatey):**
   ```bash
   choco install k6
   ```

   **macOS (using Homebrew):**
   ```bash
   brew install k6
   ```

   **Linux:**
   ```bash
   sudo gpg -k
   sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
   echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
   sudo apt-get update
   sudo apt-get install k6
   ```

2. **Start the backend server**: Ensure your API server is running on `http://localhost:4000`

## Configuration

### Environment Variables

The load tests use the following environment variables:

- `BASE_URL`: API base URL (default: `http://localhost:4000`)
- `GRAPHQL_URL`: GraphQL endpoint (default: `http://localhost:4000/graphql`)
- `TEST_USER_EMAIL`: Test user email (default: `test@example.com`)
- `TEST_USER_PASSWORD`: Test user password (default: `testpassword123`)
- `ENABLE_AUTH`: Enable authentication tests (default: `true`)
- `ENABLE_GRAPHQL`: Enable GraphQL tests (default: `true`)

### Test Configuration

The `k6.config.js` file contains:
- **Scenarios**: Different test types (smoke, load, stress, spike, soak)
- **Thresholds**: Performance requirements and pass/fail criteria
- **Global options**: Timeouts, logging, and other settings

## Running Tests

### Quick Start

```bash
# Run smoke test (1 minute, 1 user)
npm run load:smoke

# Run load test (9 minutes, up to 10 users)
npm run load:test

# Run stress test (9 minutes, up to 20 users)
npm run load:stress

# Run spike test (5 minutes, up to 50 users)
npm run load:spike

# Run soak test (30 minutes, 5 users)
npm run load:soak

# Run all tests sequentially
npm run load:all

# Run GraphQL-specific tests
npm run load:graphql
```

### Custom Configuration

```bash
# Run with custom base URL
k6 run --env BASE_URL=https://api.example.com load-tests/main.js

# Run specific scenario
k6 run --scenario load load-tests/main.js

# Run with custom thresholds
k6 run --env BASE_URL=http://localhost:4000 --threshold http_req_duration=p(95)<1000 load-tests/main.js

# Run with output to file
k6 run --out json=results.json load-tests/main.js
```

## Test Scenarios

### 1. Smoke Test
- **Duration**: 1 minute
- **Users**: 1 constant user
- **Purpose**: Verify basic functionality
- **Thresholds**: 
  - Response time < 500ms for health checks
  - Response time < 1000ms for GraphQL
  - Error rate < 0.1%

### 2. Load Test
- **Duration**: 9 minutes (2m ramp-up, 5m steady, 2m ramp-down)
- **Users**: 0-10 users
- **Purpose**: Test normal expected load
- **Thresholds**:
  - Response time < 2000ms (95th percentile)
  - Error rate < 1%
  - Throughput > 20 req/s

### 3. Stress Test
- **Duration**: 9 minutes (2m ramp-up, 5m steady, 2m ramp-down)
- **Users**: 0-20 users
- **Purpose**: Test beyond normal capacity
- **Thresholds**:
  - Response time < 5000ms (95th percentile)
  - Error rate < 1%
  - Throughput > 30 req/s

### 4. Spike Test
- **Duration**: 5 minutes
- **Users**: 5 → 50 → 5 users
- **Purpose**: Test sudden load increases
- **Thresholds**:
  - Response time < 3000ms (95th percentile)
  - Error rate < 1%
  - Throughput > 10 req/s

### 5. Soak Test
- **Duration**: 30 minutes
- **Users**: 5 constant users
- **Purpose**: Test long-term stability
- **Thresholds**:
  - Response time < 3000ms (95th percentile)
  - Error rate < 1%
  - Memory usage stable

## API Endpoints Tested

### REST API Endpoints
- `GET /health` - Health check
- `POST /auth/login` - User authentication
- `POST /auth/refresh` - Token refresh
- `GET /user/profile` - User profile
- `GET /user/preferences` - User preferences
- `GET /user/progress` - User progress
- `GET /lessons/daily` - Daily lesson
- `POST /lessons/quiz` - Quiz submission
- `POST /lessons/tone` - Tone switching
- `GET /lessons/stream/:id` - Lesson streaming
- `POST /projects/submit` - Project submission
- `GET /projects/status/:id` - Project status
- `GET /projects/history` - Project history
- `POST /llm/evaluate` - LLM evaluation
- `POST /certificates/generate` - Certificate generation
- `POST /analytics/events` - Analytics tracking

### GraphQL Endpoints
- `query GetDailyLesson` - Get daily lesson
- `query GetUserProfile` - Get user profile
- `query GetUserProgress` - Get user progress
- `query GetProjectHistory` - Get project history
- `query GetLeaderboard` - Get leaderboard
- `mutation SubmitQuiz` - Submit quiz
- `mutation SwitchTone` - Switch lesson tone
- `mutation SubmitProject` - Submit project
- `mutation ShareBadge` - Share badge
- `mutation TrackEvent` - Track analytics event

## Performance Thresholds

### Response Time Thresholds
- **Health checks**: < 500ms
- **Authentication**: < 1000ms
- **User operations**: < 1500ms
- **Lesson operations**: < 3000ms
- **Project operations**: < 5000ms
- **GraphQL queries**: < 2000ms
- **GraphQL mutations**: < 3000ms

### Error Rate Thresholds
- **Smoke tests**: < 0.1%
- **All other tests**: < 1%

### Throughput Thresholds
- **Minimum**: > 10 req/s
- **Load test**: > 20 req/s
- **Stress test**: > 30 req/s

## Custom Metrics

The tests track custom metrics:
- `auth_success_rate` - Authentication success rate
- `lesson_load_time` - Lesson loading time
- `project_submission_time` - Project submission time
- `graphql_query_time` - GraphQL query time
- `graphql_mutation_time` - GraphQL mutation time
- `api_error_rate` - API error rate
- `active_users` - Number of active users

## Output and Reporting

### Console Output
```bash
# Run with detailed console output
k6 run --console-output=text load-tests/main.js
```

### JSON Output
```bash
# Save results to JSON file
k6 run --out json=results.json load-tests/main.js
```

### InfluxDB Output
```bash
# Send results to InfluxDB
k6 run --out influxdb=http://localhost:8086/k6 load-tests/main.js
```

### Grafana Dashboard
```bash
# Run with Grafana Cloud
k6 run --out cloud load-tests/main.js
```

## Troubleshooting

### Common Issues

1. **Connection refused**: Ensure the backend server is running
2. **Authentication failures**: Check test user credentials
3. **Timeout errors**: Increase timeout values in config
4. **Memory issues**: Reduce number of virtual users

### Debug Mode
```bash
# Enable debug logging
k6 run --http-debug load-tests/main.js
```

### Verbose Output
```bash
# Enable verbose output
k6 run --verbose load-tests/main.js
```

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: Load Testing
on: [push, pull_request]
jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install k6
        run: |
          sudo gpg -k
          sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6
      - name: Start backend
        run: npm run start:backend
      - name: Run smoke test
        run: k6 run --config k6.config.js --scenario smoke load-tests/main.js
```

## Best Practices

1. **Start with smoke tests** before running heavy load tests
2. **Monitor system resources** during testing
3. **Use realistic test data** that matches production
4. **Set appropriate thresholds** based on business requirements
5. **Run tests in isolated environments** to avoid affecting production
6. **Document performance baselines** and track improvements
7. **Automate load testing** in your CI/CD pipeline

## Contributing

When adding new tests:
1. Follow the existing naming conventions
2. Add appropriate checks and assertions
3. Update the README with new endpoints
4. Set realistic performance thresholds
5. Test thoroughly before committing

## Support

For issues with k6:
- [k6 Documentation](https://k6.io/docs/)
- [k6 Community](https://community.k6.io/)
- [k6 GitHub](https://github.com/grafana/k6) 