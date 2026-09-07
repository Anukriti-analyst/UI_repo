# Problem Statement

## Business problem
The current intake mechanism uses multiple territory-specific Word templates with fill-ins, which are difficult to maintain consistently, require frequent manual updates, and are hard to distribute so users always have the latest version. This drives inefficiency and errors, especially as coverage limits and markets change.

## Evidence from workshop / meeting notes
- Intake forms differ by territory and are Word documents with fill-ins; updates must be made individually for each form.
- Updates are manual and require tracking down users to ensure they have the latest version.
- Templates are stored on individual drives (no centralized repository), making distribution and change management difficult.
- Mobile access is a key requirement for salespeople and brokers who travel.
- There is interest in integrating with backend systems like GBS/GPM and enabling guided entry (e.g., selecting territory populates relevant fields) and dynamic updates.

## Hackathon objective
Build a configurable, responsive UI (mobile/tablet/laptop) and version-controlled intake platform that:
- centralizes form management
- reduces admin effort
- supports territory customization (shared + specific)
- provides version control and traceability
- is integration-ready (data model and architecture)
- supports role-based access (SSO preferred)

(See docs/02_REQUIREMENTS.md for detailed requirements and acceptance criteria.)
