# System Monitoring and Health Checks

## Overview

This document outlines the comprehensive monitoring and health check system for the AI Skills platform. Our monitoring strategy ensures high availability, performance, and reliability through proactive monitoring, alerting, and automated health checks.

## Table of Contents

1. [Health Check Endpoints](#health-check-endpoints)
2. [Monitoring Architecture](#monitoring-architecture)
3. [Key Metrics](#key-metrics)
4. [Alerting Strategy](#alerting-strategy)
5. [Dashboard Configuration](#dashboard-configuration)
6. [Operational Procedures](#operational-procedures)
7. [Troubleshooting](#troubleshooting)

## Health Check Endpoints

### Basic Health Check

**Endpoint**: `GET /health`

**Purpose**: Basic system availability check

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "uptime": 86400,
  "services": {
    "database": "healthy",
    "cache": "healthy",
    "llm": "healthy",
    "auth": "healthy"
  }
}
```

### Detailed Health Check

**Endpoint**: `GET /health/detailed`

**Purpose**: Comprehensive system health assessment

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "uptime": 86400,
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": 15,
      "connections": 45,
      "maxConnections": 100
    },
    "cache": {
      "status": "healthy",
      "responseTime": 2,
      "memoryUsage": "75%",
      "hitRate": "92%"
    },
    "llm": {
      "status": "healthy",
      "responseTime": 1500,
      "queueLength": 5,
      "providers": {
        "openai": "healthy",
        "anthropic": "healthy"
      }
    },
    "auth": {
      "status": "healthy",
      "responseTime": 25,
      "activeSessions": 1250
    }
  },
  "system": {
    "cpu": "45%",
    "memory": "68%",
    "disk": "32%",
    "network": "healthy"
  }
}
```

### Readiness Check

**Endpoint**: `GET /health/ready`

**Purpose**: Kubernetes readiness probe

**Response**:
```json
{
  "status": "ready",
  "timestamp": "2024-01-15T10:30:00Z",
  "checks": {
    "database": "ready",
    "cache": "ready",
    "llm": "ready",
    "auth": "ready"
  }
}
```

### Liveness Check

**Endpoint**: `GET /health/live`

**Purpose**: Kubernetes liveness probe

**Response**:
```json
{
  "status": "alive",
  "timestamp": "2024-01-15T10:30:00Z",
  "pid": 12345,
  "uptime": 86400
}
```

### GraphQL Health Check

**Endpoint**: `POST /graphql`

**Purpose**: GraphQL endpoint health verification

**Query**:
```graphql
query HealthCheck {
  __schema {
    types {
      name
    }
  }
}
```

**Response**:
```json
{
  "data": {
    "__schema": {
      "types": [...]
    }
  }
}
```

## Monitoring Architecture

### Monitoring Stack

#### Infrastructure Monitoring
- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and dashboards
- **AlertManager**: Alert routing and notification
- **Node Exporter**: System metrics collection

#### Application Monitoring
- **Custom Metrics**: Application-specific metrics
- **Error Tracking**: Sentry for error monitoring
- **Performance Monitoring**: Custom APM solution
- **Log Aggregation**: ELK Stack (Elasticsearch, Logstash, Kibana)

#### External Monitoring
- **Uptime Monitoring**: Pingdom, UptimeRobot
- **Synthetic Monitoring**: Custom health check scripts
- **Real User Monitoring**: Browser performance metrics

### Monitoring Components

#### Metrics Collection
```javascript
// Example metrics collection
const metrics = {
  http_requests_total: new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'endpoint', 'status']
  }),
  
  http_request_duration: new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'endpoint'],
    buckets: [0.1, 0.5, 1, 2, 5, 10]
  }),
  
  active_users: new Gauge({
    name: 'active_users',
    help: 'Number of currently active users'
  }),
  
  lesson_completions: new Counter({
    name: 'lesson_completions_total',
    help: 'Total number of lesson completions',
    labelNames: ['lesson_id', 'difficulty']
  })
};
```

#### Health Check Implementation
```javascript
// Health check service
class HealthCheckService {
  async checkDatabase() {
    try {
      const start = Date.now();
      await db.query('SELECT 1');
      const responseTime = Date.now() - start;
      
      return {
        status: 'healthy',
        responseTime,
        connections: db.pool.length,
        maxConnections: db.pool.max
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
  
  async checkCache() {
    try {
      const start = Date.now();
      await cache.ping();
      const responseTime = Date.now() - start;
      
      return {
        status: 'healthy',
        responseTime,
        memoryUsage: await cache.info('memory'),
        hitRate: await cache.info('stats')
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
  
  async checkLLM() {
    try {
      const start = Date.now();
      await llmService.healthCheck();
      const responseTime = Date.now() - start;
      
      return {
        status: 'healthy',
        responseTime,
        queueLength: await llmService.getQueueLength(),
        providers: await llmService.getProviderStatus()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}
```

## Key Metrics

### Application Metrics

#### Request Metrics
- **Request Rate**: Requests per second by endpoint
- **Response Time**: P50, P95, P99 response times
- **Error Rate**: Percentage of failed requests
- **Throughput**: Bytes transferred per second

#### Business Metrics
- **Active Users**: Concurrent active users
- **Lesson Completions**: Lessons completed per hour/day
- **Project Submissions**: Projects submitted per hour/day
- **User Registrations**: New user signups per day
- **Retention Rate**: Daily/weekly/monthly retention

#### Performance Metrics
- **Database Performance**: Query response times, connection pool usage
- **Cache Performance**: Hit rate, miss rate, eviction rate
- **LLM Performance**: Response times, queue length, provider availability
- **Memory Usage**: Heap usage, garbage collection frequency
- **CPU Usage**: CPU utilization by service

### Infrastructure Metrics

#### System Metrics
- **CPU Usage**: Percentage CPU utilization
- **Memory Usage**: RAM usage and swap usage
- **Disk Usage**: Disk space and I/O operations
- **Network Usage**: Bandwidth and packet loss

#### Container Metrics
- **Container Health**: Container status and restart count
- **Resource Usage**: CPU, memory, and network per container
- **Pod Status**: Kubernetes pod health and readiness

### Custom Metrics

#### Learning Platform Metrics
```javascript
// Custom metrics for learning platform
const learningMetrics = {
  // User engagement
  daily_active_users: new Gauge({
    name: 'daily_active_users',
    help: 'Number of daily active users'
  }),
  
  // Learning progress
  lesson_completion_rate: new Histogram({
    name: 'lesson_completion_rate',
    help: 'Lesson completion rate by difficulty',
    labelNames: ['difficulty'],
    buckets: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
  }),
  
  // Project evaluation
  project_evaluation_time: new Histogram({
    name: 'project_evaluation_time_seconds',
    help: 'Time taken to evaluate projects',
    buckets: [30, 60, 120, 300, 600, 1200]
  }),
  
  // Achievement tracking
  achievement_unlocks: new Counter({
    name: 'achievement_unlocks_total',
    help: 'Total number of achievement unlocks',
    labelNames: ['achievement_type']
  }),
  
  // Spaced repetition
  review_sessions: new Counter({
    name: 'review_sessions_total',
    help: 'Total number of spaced repetition review sessions',
    labelNames: ['difficulty']
  })
};
```

## Alerting Strategy

### Alert Severity Levels

#### Critical (P0)
- **Service Down**: Complete service unavailability
- **Database Unavailable**: Database connection failures
- **High Error Rate**: >5% error rate for 5 minutes
- **Security Breach**: Unauthorized access attempts

#### High (P1)
- **High Response Time**: P95 > 2s for 10 minutes
- **High CPU Usage**: >80% CPU for 10 minutes
- **High Memory Usage**: >85% memory usage
- **Cache Miss Rate**: >20% cache miss rate

#### Medium (P2)
- **Elevated Error Rate**: >2% error rate for 15 minutes
- **Slow Response Time**: P95 > 1s for 15 minutes
- **Disk Space**: >80% disk usage
- **Queue Backlog**: LLM queue > 50 items

#### Low (P3)
- **Warning Thresholds**: Approaching limits
- **Performance Degradation**: Minor performance issues
- **Informational**: System updates and maintenance

### Alert Rules

#### Prometheus Alert Rules
```yaml
groups:
  - name: ai-skills-alerts
    rules:
      # Service down alerts
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.instance }} is down"
          description: "Service has been down for more than 1 minute"
      
      # High error rate
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"
      
      # High response time
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 10m
        labels:
          severity: high
        annotations:
          summary: "High response time detected"
          description: "P95 response time is {{ $value }}s"
      
      # Database connection issues
      - alert: DatabaseConnectionIssues
        expr: database_connections_active / database_connections_max > 0.8
        for: 5m
        labels:
          severity: high
        annotations:
          summary: "High database connection usage"
          description: "{{ $value | humanizePercentage }} of connections are active"
      
      # LLM queue backlog
      - alert: LLMQueueBacklog
        expr: llm_queue_length > 50
        for: 10m
        labels:
          severity: medium
        annotations:
          summary: "LLM queue backlog detected"
          description: "Queue length is {{ $value }} items"
```

### Notification Channels

#### Slack Notifications
```yaml
route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'slack-notifications'

receivers:
  - name: 'slack-notifications'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/...'
        channel: '#ai-skills-alerts'
        title: '{{ template "slack.title" . }}'
        text: '{{ template "slack.text" . }}'
        actions:
          - type: button
            text: 'View in Grafana'
            url: '{{ template "slack.grafana_url" . }}'
```

#### Email Notifications
```yaml
receivers:
  - name: 'email-notifications'
    email_configs:
      - to: 'ops@aiskills.com'
        from: 'alerts@aiskills.com'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'alerts@aiskills.com'
        auth_password: 'password'
        subject: '{{ template "email.subject" . }}'
        html: '{{ template "email.html" . }}'
```

#### PagerDuty Integration
```yaml
receivers:
  - name: 'pagerduty-critical'
    pagerduty_configs:
      - routing_key: 'critical-service-key'
        description: '{{ template "pagerduty.description" . }}'
        severity: '{{ if eq .GroupLabels.severity "critical" }}critical{{ else }}warning{{ end }}'
```

## Dashboard Configuration

### Grafana Dashboards

#### Main Operations Dashboard
```json
{
  "dashboard": {
    "title": "AI Skills Operations Dashboard",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      },
      {
        "title": "Response Time (P95)",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m]) / rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      },
      {
        "title": "Active Users",
        "type": "stat",
        "targets": [
          {
            "expr": "active_users"
          }
        ]
      }
    ]
  }
}
```

#### Service Health Dashboard
```json
{
  "dashboard": {
    "title": "Service Health Dashboard",
    "panels": [
      {
        "title": "Service Status",
        "type": "stat",
        "targets": [
          {
            "expr": "up",
            "legendFormat": "{{instance}}"
          }
        ]
      },
      {
        "title": "Database Connections",
        "type": "graph",
        "targets": [
          {
            "expr": "database_connections_active",
            "legendFormat": "Active Connections"
          },
          {
            "expr": "database_connections_max",
            "legendFormat": "Max Connections"
          }
        ]
      },
      {
        "title": "Cache Hit Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "cache_hit_rate",
            "legendFormat": "Hit Rate"
          }
        ]
      },
      {
        "title": "LLM Queue Length",
        "type": "graph",
        "targets": [
          {
            "expr": "llm_queue_length",
            "legendFormat": "Queue Length"
          }
        ]
      }
    ]
  }
}
```

### Custom Dashboards

#### Learning Analytics Dashboard
```json
{
  "dashboard": {
    "title": "Learning Analytics Dashboard",
    "panels": [
      {
        "title": "Daily Active Users",
        "type": "graph",
        "targets": [
          {
            "expr": "daily_active_users",
            "legendFormat": "DAU"
          }
        ]
      },
      {
        "title": "Lesson Completions",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(lesson_completions_total[1h])",
            "legendFormat": "{{difficulty}}"
          }
        ]
      },
      {
        "title": "Project Submissions",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(project_submissions_total[1h])",
            "legendFormat": "Submissions/Hour"
          }
        ]
      },
      {
        "title": "Achievement Unlocks",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(achievement_unlocks_total[1h])",
            "legendFormat": "{{achievement_type}}"
          }
        ]
      }
    ]
  }
}
```

## Operational Procedures

### Incident Response

#### Incident Severity Matrix

| Severity | Response Time | Update Frequency | Escalation |
|----------|---------------|------------------|------------|
| Critical | 15 minutes | Every 30 minutes | Immediate |
| High | 30 minutes | Every 2 hours | 2 hours |
| Medium | 2 hours | Every 4 hours | 4 hours |
| Low | 4 hours | Daily | 24 hours |

#### Incident Response Process

1. **Detection**: Automated monitoring detects issue
2. **Alert**: Alert sent to on-call engineer
3. **Acknowledgment**: Engineer acknowledges alert within SLA
4. **Investigation**: Engineer investigates and identifies root cause
5. **Resolution**: Engineer implements fix or workaround
6. **Verification**: Verify issue is resolved
7. **Communication**: Update stakeholders
8. **Post-mortem**: Document incident and lessons learned

#### Runbooks

##### Database Connection Issues
```markdown
# Database Connection Issues

## Symptoms
- High error rate on database-dependent endpoints
- Database health check failing
- Connection pool exhausted

## Immediate Actions
1. Check database server status
2. Verify network connectivity
3. Check connection pool configuration
4. Restart application if necessary

## Investigation Steps
1. Check database logs for errors
2. Monitor connection pool metrics
3. Check for long-running queries
4. Verify database server resources

## Resolution Steps
1. Kill long-running queries if necessary
2. Increase connection pool size if needed
3. Restart database server if required
4. Implement connection retry logic

## Prevention
1. Set up connection pool monitoring
2. Implement query timeout limits
3. Regular database maintenance
4. Load testing with realistic scenarios
```

##### High Response Time
```markdown
# High Response Time

## Symptoms
- P95 response time > 2s
- User complaints about slow performance
- Increased error rates

## Immediate Actions
1. Check system resources (CPU, memory, disk)
2. Verify external service dependencies
3. Check for recent deployments
4. Scale up resources if necessary

## Investigation Steps
1. Analyze slow query logs
2. Check for memory leaks
3. Monitor external API response times
4. Review recent code changes

## Resolution Steps
1. Optimize slow queries
2. Add caching where appropriate
3. Scale horizontally if needed
4. Implement circuit breakers

## Prevention
1. Regular performance testing
2. Query optimization reviews
3. Resource monitoring
4. Load balancing optimization
```

### Maintenance Procedures

#### Scheduled Maintenance
```markdown
# Scheduled Maintenance Checklist

## Pre-Maintenance
- [ ] Notify users 24 hours in advance
- [ ] Create maintenance window (2 hours)
- [ ] Prepare rollback plan
- [ ] Verify backup systems

## During Maintenance
- [ ] Put system in maintenance mode
- [ ] Perform database migrations
- [ ] Update application code
- [ ] Run health checks
- [ ] Verify all services are healthy

## Post-Maintenance
- [ ] Remove maintenance mode
- [ ] Monitor system for 1 hour
- [ ] Verify all functionality
- [ ] Send completion notification
- [ ] Update documentation
```

#### Backup Procedures
```markdown
# Backup Procedures

## Database Backups
- **Frequency**: Daily full backup, hourly incremental
- **Retention**: 30 days
- **Location**: Multiple geographic regions
- **Verification**: Weekly restore tests

## Application Backups
- **Configuration**: Version controlled
- **User Data**: Encrypted backups
- **Code**: Git repositories with multiple remotes
- **Documentation**: Version controlled

## Recovery Procedures
1. **Database Recovery**: 4-hour RTO, 1-hour RPO
2. **Application Recovery**: 2-hour RTO
3. **Full System Recovery**: 8-hour RTO
```

## Troubleshooting

### Common Issues

#### Health Check Failures
```bash
# Check service status
curl -f http://localhost:4000/health

# Check detailed health
curl -f http://localhost:4000/health/detailed

# Check logs
docker logs ai-skills-app

# Check system resources
htop
df -h
free -h
```

#### Performance Issues
```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:4000/health

# Check database performance
docker exec -it ai-skills-db psql -U postgres -c "SELECT * FROM pg_stat_activity;"

# Check cache performance
docker exec -it ai-skills-redis redis-cli info memory

# Check network connectivity
ping google.com
traceroute api.openai.com
```

#### Monitoring Issues
```bash
# Check Prometheus status
curl http://localhost:9090/-/healthy

# Check Grafana status
curl http://localhost:3000/api/health

# Check AlertManager status
curl http://localhost:9093/-/healthy

# Check metrics endpoint
curl http://localhost:4000/metrics
```

### Debugging Tools

#### Application Debugging
```javascript
// Enable debug logging
DEBUG=* npm start

// Check memory usage
node --inspect app.js

// Profile performance
node --prof app.js

// Check for memory leaks
node --inspect --expose-gc app.js
```

#### Database Debugging
```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check connection usage
SELECT count(*) as active_connections 
FROM pg_stat_activity 
WHERE state = 'active';

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### Network Debugging
```bash
# Check network connections
netstat -tulpn | grep :4000

# Check SSL certificates
openssl s_client -connect api.aiskills.com:443

# Check DNS resolution
nslookup api.aiskills.com

# Check firewall rules
iptables -L
```

### Recovery Procedures

#### Service Recovery
```bash
# Restart application
docker-compose restart app

# Restart database
docker-compose restart db

# Restart cache
docker-compose restart redis

# Check all services
docker-compose ps
```

#### Data Recovery
```bash
# Restore database from backup
pg_restore -d ai_skills backup.sql

# Restore user files
tar -xzf user_files_backup.tar.gz

# Verify data integrity
npm run verify-data
```

#### Configuration Recovery
```bash
# Restore configuration from git
git checkout HEAD -- config/

# Restore environment variables
cp .env.backup .env

# Restart services
docker-compose down && docker-compose up -d
```

---

## Support and Contacts

### Emergency Contacts
- **On-Call Engineer**: +1-555-0123 (24/7)
- **System Administrator**: admin@aiskills.com
- **DevOps Team**: devops@aiskills.com

### Documentation
- **Runbooks**: [runbooks.aiskills.com](https://runbooks.aiskills.com)
- **Architecture**: [docs.aiskills.com](https://docs.aiskills.com)
- **API Documentation**: [api.aiskills.com](https://api.aiskills.com)

### Monitoring Tools
- **Grafana**: [grafana.aiskills.com](https://grafana.aiskills.com)
- **Prometheus**: [prometheus.aiskills.com](https://prometheus.aiskills.com)
- **AlertManager**: [alerts.aiskills.com](https://alerts.aiskills.com) 