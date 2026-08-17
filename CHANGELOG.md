# Changelog

## [1.0.0-audit] — 2026-08-17

### Security
- Removed all `.env` files from repository
- Added JWT auth to WebSocket Gateway
- Added rate limiting to auth endpoints
- Fixed dashboard middleware
- Added upload validation
- Added CORS configuration

### Infrastructure
- Created root `package.json` with workspaces
- Created `pnpm-workspace.yaml`
- Enabled TypeScript strict mode in API

### Bug Fixes
- Fixed broken import `webApi` -> `api`

### Added
- loading.tsx, not-found.tsx
- robots.txt, sitemap.xml, humans.txt
- AUDYT.md, NEXT-STEPS.md, PLAN-ETAP-3.md

## [0.9.0] — Pre-audit
- Backend Core, Design System, Infrastructure, Dashboard prototype, Web prototype
