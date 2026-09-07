# Development Roadmap

## Phase 1 — Foundation
- Repository brain docs + Copilot instructions
- API project structure (Clean Architecture)
- Auth scaffolding (SSO-ready)
- DB setup (local dev) + DB-first schema apply
- Basic reference APIs (territories/forms/active version)

## Phase 2 — Form runtime
- Form definition endpoint (sections/questions)
- Submission create draft / save answers / submit
- Dashboard + submission details
- PDF export + email dispatch

## Phase 3 — Admin configuration
- CRUD: Questions/SubQuestions/Sections/Forms
- Version creation + activation
- Category management UI + APIs

## Phase 4 — Eventing
- Inbound Event Grid handler for limits/values
- Outbound publisher for submission events

## Phase 5 — Hardening
- Audit logs, observability, perf (indexes, caching)
- Security review (role checks everywhere)
- Test coverage improvements
