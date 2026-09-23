# Security Audit & Hardening Guide

## Current Security Implementations

### ✅ Authentication & Authorization
- **JWT-based authentication** with refresh token rotation
- **Argon2 password hashing** (memory-hard, resistant to GPU attacks)
- **Session management** with secure token storage
- **Authentication middleware** on all protected routes
- **User-scoped data access** - users can only access their own data

### ✅ Data Protection
- **AES-256-GCM encryption** for API keys and credentials at rest
- **Environment variable secrets** for encryption keys
- **No credential exposure** - API keys never returned in responses
- **Masked credentials in UI** - only shows last 4 characters
- **HTTPS enforcement** in production (via Nginx)

### ✅ API Security
- **Rate limiting** via Redis (configurable per endpoint)
- **CORS protection** with whitelist
- **Helmet middleware** for security headers
- **Input validation** with Zod schemas
- **SQL injection prevention** via Prisma ORM (parameterized queries)
- **XSS prevention** via input sanitization

### ✅ Infrastructure Security
- **Docker containerization** with non-root users
- **Environment separation** (dev/staging/prod)
- **Secrets management** via .env files (not committed)
- **Database connection pooling** with timeout limits
- **Logging without sensitive data** (PII redaction)

## Security Audit Checklist

### Task 23: Items to Review and Harden

#### 1. SSRF (Server-Side Request Forgery) Protection

**Current Risk**: Custom provider URLs could be exploited

**Action Items**:
```typescript
// Add to server/src/utils/urlValidation.ts
export function validateProviderUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    // Block private/internal networks
    const blockedHosts = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '169.254.169.254', // AWS metadata
      '::1',
    ];
    
    if (blockedHosts.some(blocked => parsed.hostname.includes(blocked))) {
      throw new Error('Internal URLs are not allowed');
    }
    
    // Block private IP ranges
    const ipv4 = parsed.hostname.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
    if (ipv4) {
      const [_, a, b, c, d] = ipv4.map(Number);
      // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
      if (a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) {
        throw new Error('Private IP ranges are not allowed');
      }
    }
    
    // Only HTTPS in production
    if (process.env.NODE_ENV === 'production' && parsed.protocol !== 'https:') {
      throw new Error('Only HTTPS URLs allowed in production');
    }
    
    return true;
  } catch (error) {
    throw new Error(`Invalid URL: ${error.message}`);
  }
}
```

**Apply in**: ProvidersService.addProvider() before saving

#### 2. Rate Limit Bypass Prevention

**Current Implementation**: Redis-backed rate limiting

**Hardening**:
- Add IP-based rate limiting (not just user-based)
- Implement sliding window algorithm
- Add exponential backoff for repeated violations
- Monitor and alert on rate limit abuse

```typescript
// Enhanced rate limiting config
const rateLimitConfig = {
  auth: { max: 5, window: '15m', skipSuccessfulRequests: true },
  api: { max: 100, window: '15m', ban: '1h' },
  aiGeneration: { max: 50, window: '1h', ban: '24h' },
};
```

#### 3. Credential Leak Audit

**Areas to Check**:
- [ ] No API keys in logs (check logger.ts)
- [ ] No credentials in error messages
- [ ] No tokens in client-side localStorage (use httpOnly cookies)
- [ ] Environment variables not exposed in client build
- [ ] No secrets in git history (use git-secrets tool)

**Test**:
```bash
# Search for potential leaks
git log -p | grep -i "api_key\|secret\|password"
grep -r "console.log.*key\|token\|password" server/src
```

#### 4. SQL Injection Testing

**Current Protection**: Prisma ORM with parameterized queries

**Test Cases**:
```typescript
// Test malicious inputs
const maliciousInputs = [
  "'; DROP TABLE users; --",
  "1' OR '1'='1",
  "admin'--",
  "<script>alert('xss')</script>",
];

// All should be safely escaped by Prisma
```

#### 5. Dependency Vulnerabilities

**Action Items**:
```bash
# Run security audits
npm audit --audit-level=moderate
npm audit fix

# Check for outdated packages
npx npm-check-updates

# Add to CI/CD pipeline
npm audit --audit-level=high --production
```

#### 6. Content Security Policy (CSP)

**Add to server/src/index.ts**:
```typescript
server.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", process.env.API_URL],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // For API flexibility
});
```

#### 7. Session Security

**Enhancements**:
- Add session invalidation on password change
- Implement "Sign out all devices" functionality
- Add suspicious activity detection
- Implement concurrent session limits per user

#### 8. Input Sanitization

**Add HTML sanitizer for user-generated content**:
```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

```typescript
import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
    ALLOWED_ATTR: [],
  });
}
```

#### 9. API Response Headers

**Security headers to verify**:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000; includeSubDomains
- Referrer-Policy: strict-origin-when-cross-origin

#### 10. Secrets Rotation

**Implement rotation strategy**:
- JWT secret rotation every 90 days
- Database password rotation
- Encryption key versioning
- Provider API key re-validation

## Penetration Testing Checklist

### Authentication Tests
- [ ] Brute force protection working
- [ ] Token expiration enforced
- [ ] Refresh token one-time use
- [ ] Password reset flow secure
- [ ] Session fixation prevented

### Authorization Tests
- [ ] Vertical privilege escalation blocked
- [ ] Horizontal privilege escalation blocked
- [ ] IDOR (Insecure Direct Object Reference) prevented
- [ ] API endpoint authorization consistent

### Injection Tests
- [ ] SQL injection blocked
- [ ] NoSQL injection blocked (if applicable)
- [ ] Command injection blocked
- [ ] LDAP injection blocked (if applicable)

### Data Exposure Tests
- [ ] Sensitive data not in URLs
- [ ] No data leakage in error messages
- [ ] PII properly masked in logs
- [ ] API keys not exposed

### Business Logic Tests
- [ ] Rate limits enforced
- [ ] File upload restrictions working
- [ ] Export size limits enforced
- [ ] Concurrent operation handling

## Security Monitoring

### Implement Logging
```typescript
// Add security event logging
logger.warn({
  event: 'failed_login_attempt',
  userId: attemptedEmail,
  ip: request.ip,
  userAgent: request.headers['user-agent'],
});

logger.error({
  event: 'rate_limit_exceeded',
  userId: user.id,
  endpoint: request.url,
  limit: limitConfig.max,
});
```

### Alerting Rules
- More than 5 failed login attempts in 5 minutes
- Rate limit exceeded repeatedly
- Unusual API key usage patterns
- Database query failures
- Unexpected error spike

## Compliance Considerations

### GDPR Compliance
- [ ] User data export functionality
- [ ] User data deletion (right to be forgotten)
- [ ] Clear consent for data collection
- [ ] Privacy policy accessible
- [ ] Cookie consent implementation

### CCPA Compliance
- [ ] Data collection disclosure
- [ ] Opt-out mechanism
- [ ] Personal data access request handling

## Security Best Practices

### For Deployment
1. Use strong, unique secrets (256-bit minimum)
2. Enable HTTPS only (no HTTP fallback)
3. Use environment-specific configs
4. Implement database backup encryption
5. Enable audit logging
6. Set up intrusion detection
7. Regular security updates
8. Implement DDoS protection (Cloudflare, AWS Shield)

### For Development
1. Never commit secrets to git
2. Use .env.example for documentation
3. Rotate development secrets regularly
4. Use separate databases per environment
5. Implement security code reviews
6. Run security tests in CI/CD

## Incident Response Plan

### Detection
1. Monitor logs for suspicious activity
2. Set up automated alerts
3. Regular security scans

### Response
1. Isolate affected systems
2. Revoke compromised credentials
3. Investigate breach scope
4. Notify affected users
5. Document incident

### Recovery
1. Patch vulnerabilities
2. Restore from clean backups
3. Reset all credentials
4. Re-deploy with fixes

### Post-Incident
1. Conduct post-mortem
2. Update security procedures
3. Train team on lessons learned
4. Implement preventive measures

## Tools for Security Testing

```bash
# Static analysis
npm install --save-dev eslint-plugin-security
npx eslint --plugin security server/src

# Dependency scanning
npm audit
npx snyk test

# OWASP ZAP for penetration testing
# (run against staging environment)

# SSL/TLS testing
npx ssllabs-scan your-domain.com
```

## Security Scorecard

Track security implementation:
- [x] Authentication implemented
- [x] Authorization implemented
- [x] Encryption at rest
- [x] Encryption in transit
- [x] Input validation
- [x] Rate limiting
- [ ] SSRF protection
- [ ] CSP headers
- [ ] Security monitoring
- [ ] Incident response plan
- [ ] Regular security audits
- [ ] Penetration testing

## Next Steps

1. Implement SSRF validation
2. Add enhanced rate limiting
3. Set up security monitoring
4. Conduct penetration testing
5. Implement CSP headers
6. Add security alerts
7. Document incident response
8. Schedule regular audits

---

**Last Updated**: Current build
**Review Frequency**: Quarterly
**Contact**: Security team
