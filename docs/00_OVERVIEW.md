# FM Essentials Intake Platform — Overview

## Why this exists
FM Essential relies on multiple intake forms tailored per territory, which creates inefficiencies in maintenance and usability. The forms are not mobile-friendly, and there is high admin effort to maintain/update them. The goal is to modernize this into a centralized configurable platform with versioning and integration readiness. (See docs/01_PROBLEM_STATEMENT.md)

## What we are building
A configurable, responsive (mobile/tablet/laptop) intake platform with:
- two roles: Admin and General (Admin superset)
- territory-specific forms with shared components
- version-controlled form templates; submissions are tied to the version used
- dashboard for General users (drafts + submitted)
- export/email submission (PDF)
- eventing integrations (inbound updates from GBS/GPM; outbound topic events on submission changes)

## High-level solution shape (recommended)
- Web UI (React) + REST API (.NET)
- SQL database (normalized schema for dynamic form definitions + submissions)
- Event Grid for inbound/outbound messaging

See:
- docs/03_ARCHITECTURE.md (target architecture)
- docs/04_DATABASE.md (DB-first tables & rules)
- docs/05_API_DESIGN.md (endpoint groups)
