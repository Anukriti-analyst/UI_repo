# Requirements

## 1) Roles & Access
### Roles
- General
- Admin (has all General rights + admin-only configuration)

### Authentication
- SSO login (preferred), role-based authorization.

## 2) Admin capabilities
Admin can:
- create/update a master list of questions + associated subquestions (conditional logic)
- create/update master list of sections
- create/manage list of forms (per territory)
- create/update categories & limits per form (appendix/reference tables)
- map master questions to forms and order/sequence them within sections
- update an existing form => create a NEW VERSION
- view versions for each form and activate one as current

## 3) General user capabilities
General can:
- view dashboard with forms they filled (draft/submitted) and key metadata
- open any submission (from dashboard row hyperlink) and see all details for that submission regardless of the current active form version
- download as PDF or email to FM Essentials support mailbox
- start “Fill New Form” wizard:
  - choose which form to fill
  - complete wizard sections (responsive UX)
  - save draft / submit

## 4) Form section model (must-have)
Forms are divided into:
1. Request & Submission Details
2. Insured & Policy Information
3. Coverage, Terms & Deductibles
4. Forms, Supporting Information & Distribution
5. Appendix / Reference Tables

## 5) Versioning requirements (critical)
- Form updates MUST create new FormVersion.
- Submissions MUST store FormVersionId so historical submissions render correctly.
- Admin can set which version is active.

## 6) Integration requirements
### Inbound
- Event Grid feeds category limits/values from GBS/GPM into our system (CategoryValues updates).

### Outbound
- Event Grid publishes submission events by topic so other applications can subscribe.

## 7) Non-functional requirements
- Responsive design: laptop, iPad, mobile.
- Auditability: versioning + traceability + (recommended) audit logs for admin changes.
- Performance: dashboard load and form rendering should be fast (indexes + caching recommended).
- Reliability: event processing should be idempotent.
- Security: least privilege, admin-only configuration endpoints.
