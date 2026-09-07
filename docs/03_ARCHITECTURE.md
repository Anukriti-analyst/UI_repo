# Architecture

## 1) Architecture goals
- Centralized, configurable form management (reduce manual effort)
- Responsive UX across mobile/tablet/laptop
- Version control and traceability
- Role-based access (SSO preferred)
- Integration-ready design (GBS/GPM + eventing)

## 2) Proposed solution architecture (recommended)
**Modular monolith** (single deployable API + web UI) with clear boundaries, integration-ready, can evolve to microservices later if needed.

### Components
1) Web UI (React)
- Admin portal (configure forms/questions/versions/categories)
- General portal (dashboard, wizard, submission details, export/email)

2) API (.NET Web API)
- REST endpoints (/api/v1)
- AuthN/AuthZ (SSO-ready)
- Form runtime engine endpoints (fetch active form definition, save answers, submit)
- Admin configuration endpoints (create versions, activate versions)
- PDF export / email dispatch
- Event ingress/egress adapters

3) Database (SQL)
- Normalized schema storing:
  - master definitions (questions, sections, categories)
  - form templates + versions
  - submissions tied to versions
  - audit logs

4) Eventing (Event Grid)
- Inbound: category limit updates from GBS/GPM => update CategoryValues
- Outbound: submission events (created/updated/submitted) by topic

## 3) Clean Architecture boundaries
- Domain: entities + rules (no EF, no HTTP)
- Application: use cases + ports (interfaces), DTOs, validators
- Infrastructure: EF Core, repositories, event grid clients, email/PDF adapters
- API: controllers, auth, DI, versioning, swagger

## 4) Key flows (text sequence)
### A) General user: Fill new form
UI -> API: get territories/forms
UI -> API: get active FormVersion + sections + questions
UI -> API: save draft answers (partial)
UI -> API: submit
API -> DB: store submission snapshot
API -> EventGrid: publish submission-submitted event

### B) Admin: Update form
UI -> API: create new FormVersion
UI -> API: map questions/sequence/sections
UI -> API: activate version
API -> DB: mark active version (only one active per form)

### C) Inbound limit update
EventGrid -> API worker endpoint: receive category update
API -> DB: upsert CategoryValues for territory/category
