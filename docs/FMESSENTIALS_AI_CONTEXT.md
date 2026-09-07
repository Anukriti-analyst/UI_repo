# FM Essentials – AI Context (Use This As Copilot Brain)

## 1) What this system is
This repo implements the **FM Essentials Intake Platform**:
- A configurable, version-controlled intake platform for multiple territories.
- Users fill structured forms (wizard flow), save drafts, submit, view dashboard, reopen any submission (even older versions), and export/email as PDF.
- Admins configure master questions, sections, form templates, mappings, and version activation.

## 2) Roles & permissions
### General user
- Can view dashboard of submissions.
- Can create new submission via wizard: select form → fill sections → save draft → submit.
- Can open any saved submission and see data exactly as captured under its form version.
- Can download submission as PDF and/or email to FM Essentials Support mailbox.

### Admin user
- Has all General rights, plus:
- Create/update master questions and subquestions (conditional).
- Create/update master sections.
- Create/update forms.
- Map questions to forms and sequence them within sections.
- Update existing form → creates a NEW VERSION (do not mutate active version).
- View versions and set one version active.
- Manage categories/appendix reference data used for validations.

## 3) Must-have functional modules
- Auth + Role-based access (SSO-ready).
- Admin configuration portal services:
  - Sections, Questions/SubQuestions, Forms, Versions, Mapping (FormSections, FormQuestions)
  - Category Groups / Categories / Category Values (for validation)
- General user flow:
  - Dashboard (list submissions)
  - Submission details (open + export PDF + email)
  - Wizard (create new submission)
- Event-driven integration:
  - Ingest updates from GBS/GPM (limits / qualifiers / deductibles) → update CategoryValues.
  - Publish outbound events on submission created/updated/submitted (topic-based).

## 4) Data model direction (DB-first)
Key tables:
- Users, Roles, UserRoles
- Territories
- Sections
- Questions, SubQuestions
- Forms, FormVersions, FormSections, FormQuestions
- CategoryGroups, Categories, CategoryValues
- Submissions, SubmissionSections, SubmissionAnswers
- AuditLogs

### Category model rule (no JSON)
Appendix rows are stored as atomic categories so validations can run while filling forms.
CategoryValues MUST support:
- NumericValue + Currency (limits, deductibles)
- Unit (hours/days/months)
- Qualifier (Combined Annual Aggregate, Per Location, PD Per Occurrence, etc.)
- TextValue for non-numeric values (e.g., "Policy Limit")

## 5) API design conventions
- REST endpoints under: /api/v1/...
- Use DTOs; do not expose EF entities directly.
- Always validate inputs (FluentValidation preferred).
- Standard error contract:
  - traceId
  - errorCode
  - message
  - details[]

## 6) Clean Architecture boundaries (strict)
- Domain: entities, value objects, domain rules (no EF, no HTTP).
- Application: use cases, interfaces, DTOs, validation, orchestration.
- Infrastructure: EF Core, repositories, event publishing, external clients.
- Api: controllers, auth, DI, versioning, swagger.

## 7) Coding standards
- C# nullable enabled, warnings treated as errors.
- Async all the way.
- Use CancellationToken for all IO.
- Use UTC for timestamps.
- Add unit tests for application use cases and validators.

## 8) Recommended endpoint set (initial)
### Reference/master data
- GET /api/v1/territories
- GET /api/v1/forms?territoryCode=AU
- GET /api/v1/forms/{formId}/active-version
- GET /api/v1/forms/{formId}/versions

### Form definition (admin)
- POST/PUT /api/v1/admin/questions
- POST/PUT /api/v1/admin/sections
- POST/PUT /api/v1/admin/forms
- POST /api/v1/admin/forms/{formId}/versions (create version)
- POST /api/v1/admin/forms/{formId}/versions/{version}/activate
- POST/PUT /api/v1/admin/categories (groups/categories/values)

### Submission flow (general)
- GET /api/v1/submissions (current user)
- GET /api/v1/submissions/{submissionId}
- POST /api/v1/submissions (create draft from formVersionId)
- PUT /api/v1/submissions/{submissionId}/answers
- POST /api/v1/submissions/{submissionId}/submit
- GET /api/v1/submissions/{submissionId}/pdf
- POST /api/v1/submissions/{submissionId}/email

## 9) “Don’t do this”
- Do not update an existing FormVersion in-place.
- Do not store appendix/categories as JSON blobs.
- Do not leak internal exception details in API responses.

---
This file is the authoritative “AI brain” for Copilot. Keep it updated when requirements evolve.
