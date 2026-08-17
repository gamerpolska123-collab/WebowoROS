# Security Policy

## Reporting Security Issues

If you discover a security vulnerability, please do NOT open an issue. Email: security@weboworos.pl

## Post-Audit Security Status (2026-08-17)

### Fixed Vulnerabilities

| ID | Severity | Description | Fix |
|----|----------|-------------|-----|
| SEC-001 | CRITICAL | `.env` files committed to repository | Removed + updated `.gitignore` |
| SEC-002 | HIGH | WebSocket Gateway without authentication | Added JWT verify in `handleConnection` |
| SEC-003 | HIGH | Dashboard middleware with hardcoded secret | Removed fallback, env-only |
| SEC-004 | MEDIUM | No rate limiting on auth endpoints | Added `@Throttle(5, 60)` on login |
| SEC-005 | MEDIUM | File upload without validation | Added size, MIME, extension, magic bytes checks |
| SEC-006 | MEDIUM | No CORS configuration | Added `app.enableCors()` with whitelist |
| SEC-007 | MEDIUM | No idempotency check for orders | Added `idempotencyKey` to Order DTO |

### Required Actions Before Production

1. **Regenerate ALL secrets**
   ```bash
   openssl rand -base64 32  # JWT_SECRET
   openssl rand -base64 24  # DB_PASSWORD
   ```

2. **Clean git history of .env files**
   ```bash
   java -jar bfg.jar --delete-files .env WebowoROS.git
   ```

3. **Run security scan**
   ```bash
   npm audit
   docker scan weboworos/api
   ```
