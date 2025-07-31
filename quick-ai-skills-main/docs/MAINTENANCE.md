# Maintenance Procedures and Runbooks

## Overview

This document provides comprehensive maintenance procedures and runbooks for the AI Skills platform. These procedures ensure system reliability, security, and optimal performance through routine maintenance, emergency response, and operational tasks.

## Table of Contents

1. [Routine Maintenance](#routine-maintenance)
2. [Emergency Procedures](#emergency-procedures)
3. [Operational Runbooks](#operational-runbooks)
4. [Security Procedures](#security-procedures)
5. [Backup and Recovery](#backup-and-recovery)
6. [Performance Optimization](#performance-optimization)
7. [Deployment Procedures](#deployment-procedures)

## Routine Maintenance

### Daily Maintenance Tasks

#### System Health Check
```bash
#!/bin/bash
# Daily health check script

echo "=== Daily Health Check - $(date) ==="

# Check service status
echo "1. Checking service status..."
curl -f http://localhost:4000/health || echo "ERROR: Health check failed"

# Check database connections
echo "2. Checking database connections..."
docker exec ai-skills-db psql -U postgres -c "SELECT count(*) as active_connections FROM pg_stat_activity WHERE state = 'active';"

# Check disk usage
echo "3. Checking disk usage..."
df -h | grep -E "(Filesystem|/dev/)"

# Check memory usage
echo "4. Checking memory usage..."
free -h

# Check log files for errors
echo "5. Checking recent errors..."
docker logs --since 24h ai-skills-app | grep -i error | tail -10

echo "=== Health check completed ==="
```

#### Log Rotation and Cleanup
```bash
#!/bin/bash
# Log rotation script

echo "=== Log Rotation - $(date) ==="

# Rotate application logs
docker exec ai-skills-app logrotate /etc/logrotate.conf

# Clean up old log files (keep 30 days)
find /var/log/ai-skills -name "*.log.*" -mtime +30 -delete

# Compress old logs
find /var/log/ai-skills -name "*.log.*" -not -name "*.gz" -exec gzip {} \;

echo "=== Log rotation completed ==="
```

### Weekly Maintenance Tasks

#### Database Maintenance
```sql
-- Weekly database maintenance script

-- Update table statistics
ANALYZE;

-- Vacuum tables to reclaim space
VACUUM ANALYZE;

-- Check for long-running queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
```

#### Security Updates
```bash
#!/bin/bash
# Weekly security update script

echo "=== Security Updates - $(date) ==="

# Update system packages
apt-get update
apt-get upgrade -y

# Update Docker images
docker-compose pull

# Check for security vulnerabilities
npm audit --audit-level moderate

# Update SSL certificates if needed
certbot renew --quiet

echo "=== Security updates completed ==="
```

### Monthly Maintenance Tasks

#### Performance Review
```bash
#!/bin/bash
# Monthly performance review

echo "=== Monthly Performance Review - $(date) ==="

# Generate performance report
echo "1. Generating performance metrics..."
curl -s http://localhost:9090/api/v1/query?query=rate\(http_requests_total\[30d\]\) | jq .

# Check slow queries
echo "2. Analyzing slow queries..."
docker exec ai-skills-db psql -U postgres -c "
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;"

# Review resource usage
echo "3. Reviewing resource usage..."
docker stats --no-stream

echo "=== Performance review completed ==="
```

#### Backup Verification
```bash
#!/bin/bash
# Monthly backup verification

echo "=== Backup Verification - $(date) ==="

# Test database restore
echo "1. Testing database restore..."
pg_restore --dry-run backup.sql

# Verify backup integrity
echo "2. Verifying backup integrity..."
sha256sum backup.sql

# Test application configuration restore
echo "3. Testing configuration restore..."
git checkout HEAD -- config/

echo "=== Backup verification completed ==="
```

## Emergency Procedures

### Service Outage Response

#### Immediate Response Checklist
```markdown
# Service Outage Response Checklist

## Immediate Actions (0-5 minutes)
- [ ] Acknowledge the alert
- [ ] Check service status: curl -f http://localhost:4000/health
- [ ] Check system resources: htop, df -h, free -h
- [ ] Check recent deployments or changes
- [ ] Notify team lead and stakeholders

## Investigation (5-15 minutes)
- [ ] Check application logs: docker logs ai-skills-app --tail 100
- [ ] Check database status: docker exec ai-skills-db pg_isready
- [ ] Check cache status: docker exec ai-skills-redis redis-cli ping
- [ ] Check network connectivity: ping google.com
- [ ] Identify root cause

## Resolution (15-60 minutes)
- [ ] Implement immediate fix or workaround
- [ ] Restart services if necessary: docker-compose restart
- [ ] Verify service recovery: curl -f http://localhost:4000/health
- [ ] Monitor for 15 minutes
- [ ] Update stakeholders

## Post-Incident (1-24 hours)
- [ ] Document incident details
- [ ] Schedule post-mortem meeting
- [ ] Implement preventive measures
- [ ] Update runbooks if needed
```

#### Database Outage Response
```markdown
# Database Outage Response

## Symptoms
- High error rate on database-dependent endpoints
- Database health check failing
- Connection pool exhausted
- Slow response times

## Immediate Actions
1. Check database server status
2. Verify network connectivity
3. Check connection pool configuration
4. Restart database if necessary

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

### Security Incident Response

#### Security Breach Response
```markdown
# Security Breach Response

## Immediate Actions
1. **Isolate the affected system**
   - Disconnect from network if necessary
   - Stop affected services
   - Preserve evidence

2. **Assess the scope**
   - Identify affected systems and data
   - Determine breach timeline
   - Assess data sensitivity

3. **Notify stakeholders**
   - Security team
   - Legal team
   - Management
   - Users (if required by law)

## Investigation Steps
1. **Preserve evidence**
   - Take system snapshots
   - Collect logs
   - Document timeline

2. **Analyze the breach**
   - Identify attack vector
   - Determine attacker capabilities
   - Assess damage

3. **Contain the threat**
   - Remove attacker access
   - Patch vulnerabilities
   - Update security controls

## Recovery Steps
1. **Clean and restore systems**
   - Remove malware
   - Restore from clean backups
   - Verify system integrity

2. **Implement additional security**
   - Update passwords
   - Enable additional monitoring
   - Review access controls

3. **Communicate with users**
   - Provide clear information
   - Offer support
   - Maintain transparency
```

#### Data Breach Response
```markdown
# Data Breach Response

## Immediate Actions
1. **Contain the breach**
   - Stop data exfiltration
   - Secure affected systems
   - Preserve evidence

2. **Assess the damage**
   - Identify compromised data
   - Determine data sensitivity
   - Assess regulatory impact

3. **Legal compliance**
   - Notify legal team
   - Assess reporting requirements
   - Prepare user notifications

## Investigation Steps
1. **Forensic analysis**
   - Analyze system logs
   - Identify attack timeline
   - Determine data accessed

2. **Impact assessment**
   - Evaluate data sensitivity
   - Assess user impact
   - Determine business impact

## Recovery Steps
1. **Secure systems**
   - Patch vulnerabilities
   - Update security controls
   - Implement monitoring

2. **User communication**
   - Notify affected users
   - Provide guidance
   - Offer support

3. **Regulatory compliance**
   - File required reports
   - Cooperate with authorities
   - Document response
```

## Operational Runbooks

### Application Deployment

#### Production Deployment
```bash
#!/bin/bash
# Production deployment script

set -e

echo "=== Production Deployment - $(date) ==="

# Pre-deployment checks
echo "1. Running pre-deployment checks..."
npm run test
npm run build
npm run lint

# Backup current deployment
echo "2. Creating backup..."
docker-compose exec app tar -czf /backup/app-$(date +%Y%m%d-%H%M%S).tar.gz /app

# Deploy new version
echo "3. Deploying new version..."
git pull origin main
docker-compose build
docker-compose up -d

# Health checks
echo "4. Running health checks..."
sleep 30
curl -f http://localhost:4000/health || exit 1

# Post-deployment verification
echo "5. Post-deployment verification..."
npm run test:smoke

echo "=== Deployment completed successfully ==="
```

#### Rollback Procedure
```bash
#!/bin/bash
# Rollback script

set -e

echo "=== Rollback Procedure - $(date) ==="

# Stop current deployment
echo "1. Stopping current deployment..."
docker-compose down

# Restore previous version
echo "2. Restoring previous version..."
git checkout HEAD~1
docker-compose build
docker-compose up -d

# Health checks
echo "3. Running health checks..."
sleep 30
curl -f http://localhost:4000/health || exit 1

echo "=== Rollback completed successfully ==="
```

### Database Operations

#### Database Migration
```bash
#!/bin/bash
# Database migration script

set -e

echo "=== Database Migration - $(date) ==="

# Create backup
echo "1. Creating database backup..."
docker exec ai-skills-db pg_dump -U postgres ai_skills > backup-$(date +%Y%m%d-%H%M%S).sql

# Run migrations
echo "2. Running migrations..."
npm run migrate

# Verify migration
echo "3. Verifying migration..."
npm run migrate:status

# Update schema
echo "4. Updating schema..."
npm run db:update

echo "=== Migration completed successfully ==="
```

#### Database Backup
```bash
#!/bin/bash
# Database backup script

set -e

echo "=== Database Backup - $(date) ==="

# Create full backup
echo "1. Creating full backup..."
docker exec ai-skills-db pg_dump -U postgres -Fc ai_skills > /backup/full-$(date +%Y%m%d-%H%M%S).dump

# Create incremental backup
echo "2. Creating incremental backup..."
docker exec ai-skills-db pg_dump -U postgres -Fc --since="$(date -d '1 day ago' -Iseconds)" ai_skills > /backup/incremental-$(date +%Y%m%d-%H%M%S).dump

# Compress backups
echo "3. Compressing backups..."
gzip /backup/full-*.dump
gzip /backup/incremental-*.dump

# Clean up old backups (keep 30 days)
echo "4. Cleaning up old backups..."
find /backup -name "*.dump.gz" -mtime +30 -delete

echo "=== Backup completed successfully ==="
```

### Monitoring and Alerting

#### Alert Investigation
```markdown
# Alert Investigation Runbook

## High Error Rate Alert

### Initial Assessment
1. **Check alert details**
   - Error rate percentage
   - Affected endpoints
   - Time duration

2. **Verify the alert**
   - Check current error rate
   - Compare with baseline
   - Determine if false positive

### Investigation Steps
1. **Check application logs**
   ```bash
   docker logs ai-skills-app --since 10m | grep -i error
   ```

2. **Check system resources**
   ```bash
   htop
   df -h
   free -h
   ```

3. **Check external dependencies**
   ```bash
   curl -f http://localhost:4000/health/detailed
   ```

4. **Check recent changes**
   - Review recent deployments
   - Check configuration changes
   - Review code changes

### Resolution Steps
1. **Immediate actions**
   - Restart affected services
   - Scale up resources if needed
   - Implement circuit breakers

2. **Root cause analysis**
   - Identify the root cause
   - Document findings
   - Implement fixes

3. **Prevention**
   - Update monitoring thresholds
   - Implement additional checks
   - Review deployment procedures
```

#### Performance Investigation
```markdown
# Performance Investigation Runbook

## High Response Time Alert

### Initial Assessment
1. **Check performance metrics**
   - Current response times
   - Historical trends
   - Affected endpoints

2. **Identify patterns**
   - Time-based patterns
   - User load patterns
   - Resource usage patterns

### Investigation Steps
1. **Check system resources**
   ```bash
   # CPU usage
   top -p $(pgrep -f node)
   
   # Memory usage
   free -h
   
   # Disk I/O
   iostat -x 1 5
   ```

2. **Check application performance**
   ```bash
   # Node.js profiling
   node --inspect app.js
   
   # Memory profiling
   node --inspect --expose-gc app.js
   ```

3. **Check database performance**
   ```sql
   -- Slow queries
   SELECT query, mean_time, calls 
   FROM pg_stat_statements 
   ORDER BY mean_time DESC 
   LIMIT 10;
   
   -- Connection usage
   SELECT count(*) as active_connections 
   FROM pg_stat_activity 
   WHERE state = 'active';
   ```

### Resolution Steps
1. **Immediate optimization**
   - Optimize slow queries
   - Add caching
   - Scale resources

2. **Long-term improvements**
   - Code optimization
   - Database optimization
   - Infrastructure scaling
```

## Security Procedures

### Access Management

#### User Access Review
```bash
#!/bin/bash
# Monthly user access review

echo "=== User Access Review - $(date) ==="

# Review active users
echo "1. Reviewing active users..."
docker exec ai-skills-db psql -U postgres -c "
SELECT username, last_login, is_active 
FROM users 
WHERE last_login > now() - interval '30 days'
ORDER BY last_login DESC;"

# Review admin access
echo "2. Reviewing admin access..."
docker exec ai-skills-db psql -U postgres -c "
SELECT username, role, created_at 
FROM users 
WHERE role = 'admin'
ORDER BY created_at DESC;"

# Review API keys
echo "3. Reviewing API keys..."
docker exec ai-skills-db psql -U postgres -c "
SELECT key_name, created_at, last_used 
FROM api_keys 
WHERE last_used > now() - interval '30 days'
ORDER BY last_used DESC;"

echo "=== Access review completed ==="
```

#### Security Audit
```bash
#!/bin/bash
# Quarterly security audit

echo "=== Security Audit - $(date) ==="

# Check for security vulnerabilities
echo "1. Checking for vulnerabilities..."
npm audit --audit-level moderate

# Review SSL certificates
echo "2. Reviewing SSL certificates..."
certbot certificates

# Check file permissions
echo "3. Checking file permissions..."
find /app -type f -exec ls -la {} \; | grep -E "(-rwxrwxrwx|-rw-rw-rw-)"

# Review access logs
echo "4. Reviewing access logs..."
docker logs ai-skills-app --since 7d | grep -i "unauthorized\|forbidden\|error" | tail -50

echo "=== Security audit completed ==="
```

### Incident Response

#### Security Incident Response
```markdown
# Security Incident Response

## Phishing Attack Response

### Immediate Actions
1. **Isolate affected accounts**
   - Disable compromised accounts
   - Change passwords
   - Review access logs

2. **Assess the damage**
   - Identify affected users
   - Determine data accessed
   - Assess business impact

### Investigation Steps
1. **Analyze the attack**
   - Review email headers
   - Check for malware
   - Identify attack vector

2. **Contain the threat**
   - Remove malicious emails
   - Update security filters
   - Educate users

### Recovery Steps
1. **Secure systems**
   - Update security policies
   - Implement additional controls
   - Monitor for similar attacks

2. **User communication**
   - Notify affected users
   - Provide guidance
   - Offer support
```

## Backup and Recovery

### Backup Procedures

#### Automated Backup
```bash
#!/bin/bash
# Automated backup script

set -e

echo "=== Automated Backup - $(date) ==="

# Database backup
echo "1. Creating database backup..."
docker exec ai-skills-db pg_dump -U postgres -Fc ai_skills > /backup/db-$(date +%Y%m%d-%H%M%S).dump

# Application backup
echo "2. Creating application backup..."
docker exec ai-skills-app tar -czf /backup/app-$(date +%Y%m%d-%H%M%S).tar.gz /app

# Configuration backup
echo "3. Creating configuration backup..."
tar -czf /backup/config-$(date +%Y%m%d-%H%M%S).tar.gz config/ .env

# Upload to cloud storage
echo "4. Uploading to cloud storage..."
aws s3 cp /backup/ s3://ai-skills-backups/ --recursive --exclude "*" --include "*-$(date +%Y%m%d)*"

# Clean up local backups (keep 7 days)
echo "5. Cleaning up local backups..."
find /backup -name "*.dump" -mtime +7 -delete
find /backup -name "*.tar.gz" -mtime +7 -delete

echo "=== Backup completed successfully ==="
```

#### Backup Verification
```bash
#!/bin/bash
# Backup verification script

set -e

echo "=== Backup Verification - $(date) ==="

# Test database restore
echo "1. Testing database restore..."
pg_restore --dry-run /backup/db-$(date +%Y%m%d)*.dump

# Verify backup integrity
echo "2. Verifying backup integrity..."
sha256sum /backup/*-$(date +%Y%m%d)*

# Test configuration restore
echo "3. Testing configuration restore..."
tar -tzf /backup/config-$(date +%Y%m%d)*.tar.gz

echo "=== Backup verification completed ==="
```

### Recovery Procedures

#### Full System Recovery
```bash
#!/bin/bash
# Full system recovery script

set -e

echo "=== Full System Recovery - $(date) ==="

# Stop all services
echo "1. Stopping all services..."
docker-compose down

# Restore database
echo "2. Restoring database..."
docker exec -i ai-skills-db pg_restore -U postgres -d ai_skills < /backup/db-$(date +%Y%m%d)*.dump

# Restore application
echo "3. Restoring application..."
docker exec -i ai-skills-app tar -xzf /backup/app-$(date +%Y%m%d)*.tar.gz

# Restore configuration
echo "4. Restoring configuration..."
tar -xzf /backup/config-$(date +%Y%m%d)*.tar.gz

# Start services
echo "5. Starting services..."
docker-compose up -d

# Health checks
echo "6. Running health checks..."
sleep 30
curl -f http://localhost:4000/health || exit 1

echo "=== Recovery completed successfully ==="
```

#### Data Recovery
```bash
#!/bin/bash
# Data recovery script

set -e

echo "=== Data Recovery - $(date) ==="

# Identify backup to restore
BACKUP_DATE=$1
if [ -z "$BACKUP_DATE" ]; then
    echo "Usage: $0 YYYYMMDD"
    exit 1
fi

# Restore database
echo "1. Restoring database from $BACKUP_DATE..."
docker exec -i ai-skills-db pg_restore -U postgres -d ai_skills < /backup/db-$BACKUP_DATE*.dump

# Verify data integrity
echo "2. Verifying data integrity..."
docker exec ai-skills-db psql -U postgres -c "SELECT count(*) as user_count FROM users;"

echo "=== Data recovery completed successfully ==="
```

## Performance Optimization

### Performance Monitoring

#### Performance Baseline
```bash
#!/bin/bash
# Performance baseline script

echo "=== Performance Baseline - $(date) ==="

# System metrics
echo "1. Collecting system metrics..."
echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}')"
echo "Memory Usage: $(free | grep Mem | awk '{printf "%.2f%%", $3/$2 * 100.0}')"
echo "Disk Usage: $(df -h / | awk 'NR==2 {print $5}')"

# Application metrics
echo "2. Collecting application metrics..."
curl -s http://localhost:4000/metrics | grep -E "(http_requests_total|http_request_duration)"

# Database metrics
echo "3. Collecting database metrics..."
docker exec ai-skills-db psql -U postgres -c "
SELECT 
    count(*) as active_connections,
    sum(case when state = 'idle' then 1 else 0 end) as idle_connections
FROM pg_stat_activity;"

echo "=== Performance baseline completed ==="
```

#### Performance Tuning
```bash
#!/bin/bash
# Performance tuning script

echo "=== Performance Tuning - $(date) ==="

# Optimize database
echo "1. Optimizing database..."
docker exec ai-skills-db psql -U postgres -c "VACUUM ANALYZE;"

# Clear cache
echo "2. Clearing cache..."
docker exec ai-skills-redis redis-cli FLUSHALL

# Restart services
echo "3. Restarting services..."
docker-compose restart

# Verify improvements
echo "4. Verifying improvements..."
sleep 30
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:4000/health

echo "=== Performance tuning completed ==="
```

## Deployment Procedures

### Blue-Green Deployment

#### Blue-Green Deployment Script
```bash
#!/bin/bash
# Blue-green deployment script

set -e

echo "=== Blue-Green Deployment - $(date) ==="

# Determine current environment
CURRENT_ENV=$(docker-compose ps | grep -q "blue" && echo "blue" || echo "green")
NEW_ENV=$([ "$CURRENT_ENV" = "blue" ] && echo "green" || echo "blue")

echo "Current environment: $CURRENT_ENV"
echo "New environment: $NEW_ENV"

# Deploy to new environment
echo "1. Deploying to $NEW_ENV environment..."
docker-compose -f docker-compose.$NEW_ENV.yml up -d

# Health checks for new environment
echo "2. Running health checks for $NEW_ENV..."
sleep 30
curl -f http://localhost:4000/health-$NEW_ENV || exit 1

# Switch traffic
echo "3. Switching traffic to $NEW_ENV..."
# Update load balancer configuration
# This would typically involve updating nginx config or cloud load balancer

# Verify switch
echo "4. Verifying traffic switch..."
sleep 10
curl -f http://localhost:4000/health || exit 1

# Stop old environment
echo "5. Stopping $CURRENT_ENV environment..."
docker-compose -f docker-compose.$CURRENT_ENV.yml down

echo "=== Blue-green deployment completed successfully ==="
```

### Canary Deployment

#### Canary Deployment Script
```bash
#!/bin/bash
# Canary deployment script

set -e

echo "=== Canary Deployment - $(date) ==="

# Deploy canary
echo "1. Deploying canary..."
docker-compose -f docker-compose.canary.yml up -d

# Health checks
echo "2. Running health checks..."
sleep 30
curl -f http://localhost:4000/health-canary || exit 1

# Monitor canary
echo "3. Monitoring canary for 5 minutes..."
for i in {1..30}; do
    curl -s http://localhost:4000/health-canary > /dev/null
    if [ $? -ne 0 ]; then
        echo "Canary health check failed, rolling back..."
        docker-compose -f docker-compose.canary.yml down
        exit 1
    fi
    sleep 10
done

# Promote canary
echo "4. Promoting canary to production..."
docker-compose down
docker-compose up -d

# Clean up canary
echo "5. Cleaning up canary..."
docker-compose -f docker-compose.canary.yml down

echo "=== Canary deployment completed successfully ==="
```

---

## Support and Contacts

### Emergency Contacts
- **On-Call Engineer**: +1-555-0123 (24/7)
- **System Administrator**: admin@aiskills.com
- **DevOps Team**: devops@aiskills.com
- **Security Team**: security@aiskills.com

### Documentation
- **Runbooks**: [runbooks.aiskills.com](https://runbooks.aiskills.com)
- **Architecture**: [docs.aiskills.com](https://docs.aiskills.com)
- **API Documentation**: [api.aiskills.com](https://api.aiskills.com)

### Tools and Resources
- **Monitoring**: [grafana.aiskills.com](https://grafana.aiskills.com)
- **Logs**: [logs.aiskills.com](https://logs.aiskills.com)
- **Backups**: [backups.aiskills.com](https://backups.aiskills.com) 