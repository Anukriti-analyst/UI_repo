# FM Essential Intake Platform – Solution Design Document

## 1. Problem Statement

FM Essential currently relies on **multiple Word-based intake forms** that:
- Differ by **territory**
- Require **frequent manual updates**
- Lack **version control and auditability**
- Are **not mobile friendly**
- Are difficult to **centralize, govern, and integrate**

This leads to:
- High administrative overhead
- Inconsistent data collection
- Risk of users filling outdated templates
- Poor experience for brokers and underwriters working remotely

The challenge is to **modernize the intake mechanism** into a **centralized, configurable, responsive, and version‑controlled platform** that can scale across regions and integrate with downstream systems such as **GBS / GPM**. [2](https://fmglobal.sharepoint.com/teams/FMIndiaTeam/Shared%20Documents/General/Hackathon%202.0/Problem%20Statements%20+%20Artifacts/Problem%20Statement%203_FM%20Essentials/Solution%20requirement%20document%20For%20Participants%20%20Add%20column/Hackathon%202.0-%20PS3%20-%20FM%20essential%20Intake.pdf?web=1)

---

## 2. Proposed Solution (High‑Level)

We propose a **web‑based FM Essential Intake Platform** that provides:

- **Configurable Form Engine**
- **Role‑based Admin & General User experiences**
- **Form Versioning & Audit Trail**
- **Responsive UI (Laptop, iPad, Mobile)**
- **SSO‑based authentication**
- **Event‑driven integration using Event Grid**
- **Centralized data storage with integration‑ready APIs**

This solution eliminates manual Word documents and enables **future‑proof extensibility**. [3](https://fmglobal.sharepoint.com/teams/FMIndiaTeam/_layouts/15/Doc.aspx?sourcedoc=%7BB0761E8B-E65D-41F6-BF13-C8857CC0FAA1%7D&file=Hackathon%202.0-%20PS3%20-%20FM%20essential%20Intake.docx&action=default&mobileredirect=true&DefaultItemOpen=1)

---

## 3. Design Principles & Standards

### Architecture Principles
- Clean Architecture (Separation of Concerns)
- Modular Monolith (Hackathon‑friendly, Microservice‑ready)
- Configuration over Code
- API‑First Design

### Technical Standards
- **Backend**: .NET Core Web API
- **Frontend**: React (Hooks, Component‑driven)
- **Database**: SQL Server (3NF, indexed)
- **Auth**: Azure AD / SSO
- **Integration**: Azure Event Grid
- **Security**: Role‑based access control (RBAC)

---

## 4. User Roles & Capabilities

### 4.1 Roles

| Role    | Description |
|--------|-------------|
| Admin  | Full access, configuration & governance |
| General | Can fill, view, download, and email forms |

Admin **inherits all General capabilities**, but not vice‑versa.

---

## 5. Core Functional Features

### 5.1 Admin Features

Admin users can:

- Create / update **Master Questions**
- Maintain **Sub‑Questions**
- Create / update **Sections**
- Define **Forms**
- Define **Categories per Form**
- Set **limits per category** (via GBS/GPM)
- Map questions to forms
- Define section & question sequence
- Update existing forms → **creates a new version**
- View **all versions**
- Activate / deactivate versions

Versioning is mandatory and immutable once published. [2](https://fmglobal.sharepoint.com/teams/FMIndiaTeam/Shared%20Documents/General/Hackathon%202.0/Problem%20Statements%20+%20Artifacts/Problem%20Statement%203_FM%20Essentials/Solution%20requirement%20document%20For%20Participants%20%20Add%20column/Hackathon%202.0-%20PS3%20-%20FM%20essential%20Intake.pdf?web=1)

---

### 5.2 General User Features

General users can:

- View a **Dashboard** showing:
  - Filled forms
  - Completed forms
  - Status & metadata
- Click any form row to:
  - Open the saved form
  - View it in the **exact version** used
- Download form as **PDF**
- Email form to **FM Essentials support mailbox**
- Fill a **New Form** using a **Wizard Flow**
  - Select form
  - Complete sections step‑by‑step

---

## 6. Form Structure (Business Sections)

Each form is divided into structured sections:

### 1. Request & Submission Details
- Due Date
- Essential Office
- Policy Term
- Anticipated Bind Date
- Email Subject / Submission Reference

### 2. Insured & Policy Information
- First Named Insured
- Additional Insureds
- Territory
- Broker Commission
- Policy Currency
- Policy Limit
- Estimated Annual Premium
- Coinsurance
- FM Share

### 3. Coverage, Terms & Deductibles
- Terms & Conditions
- Sub‑Limits
- Deductibles
- Earth Movement
- Special Terms

### 4. Forms, Supporting Info & Distribution
- Index of Forms
- Underlyer Policies
- Third‑Party Interests
- Mailing Instructions
- CC Recipients

### 5. Appendix / Reference Tables
- AU Coverage Table
- Limits
- Deductibles
- Qualifying Periods

---

## 7. Database Design (Complete & Final)

### 7.1 Core Tables

Users
Roles
UserRoles
Forms
FormVersions
FormSections
FormCategories
MasterQuestions
SubQuestions
FormQuestions
FormSubmissions
FormSubmissionAnswers
Categories
CategoryLimits
AuditLogs

### 7.2 Key Relationships

- Form → many FormVersions
- FormVersion → many Sections
- Section → many Questions
- Question → many Answers
- Submission → linked to exactly one FormVersion
- Categories → linked to limits from GBS/GPM

All entities are normalized to **3NF** and indexed on:
- FormId
- VersionId
- SubmissionId
- UserId

---

## 8. API Design

### 8.1 Admin APIs

| API | Purpose |
|---|---|
| POST /api/forms | Create form |
| PUT /api/forms/{id} | Update form (new version) |
| GET /api/forms/{id}/versions | List versions |
| POST /api/questions | Create master questions |
| POST /api/sections | Create sections |
| POST /api/forms/{id}/map | Map questions |
| POST /api/categories | Create categories |
| PUT /api/categories/{id}/limits | Update limits |

---

### 8.2 General User APIs

| API | Purpose |
|---|---|
| GET /api/dashboard | User dashboard |
| GET /api/forms/active | List active forms |
| POST /api/submissions | Submit form |
| GET /api/submissions/{id} | View submission |
| GET /api/submissions/{id}/pdf | Download PDF |
| POST /api/submissions/{id}/email | Email submission |

---

## 9. Event Grid Integration

### Inbound Events
- Fetch category limits from **GBS / GPM**

### Outbound Events
- SubmissionCreated
- SubmissionUpdated
- VersionActivated

Events are published with **topics**, enabling any downstream system to subscribe. [1](https://fmglobal.sharepoint.com/teams/FMIndiaTeam/_layouts/15/Doc.aspx?sourcedoc=%7B53F1F1B3-C6A0-4673-993A-1578CB363FF5%7D&file=Meeting%20Notes.docx&action=default&mobileredirect=true&DefaultItemOpen=1)

---

## 10. Frontend Design (React)

### Component Structure


/pages
Dashboard
FormWizard
SubmissionDetails
AdminPanel
/components
FormRenderer
SectionRenderer
QuestionControl
VersionSelector
/services
apiClient

### UX Highlights
- Responsive layouts
- Wizard‑based form filling
- Read‑only historical versions
- Mobile‑first design

---

## 11. End‑to‑End Flow

1. Admin configures form → publishes version
2. General user selects form → fills wizard
3. Submission saved with version reference
4. Event published to Event Grid
5. User can later view / download / email exact version

---

## 12. Ensuring Complete Functionality

✅ Version‑safe submissions  
✅ Territory & category extensibility  
✅ Mobile accessibility  
✅ Admin governance  
✅ Auditability  
✅ Integration‑ready APIs  
✅ Event‑driven architecture  

All requirements from the problem statement and stakeholder discussions are fully addressed. [2](https://fmglobal.sharepoint.com/teams/FMIndiaTeam/Shared%20Documents/General/Hackathon%202.0/Problem%20Statements%20+%20Artifacts/Problem%20Statement%203_FM%20Essentials/Solution%20requirement%20document%20For%20Participants%20%20Add%20column/Hackathon%202.0-%20PS3%20-%20FM%20essential%20Intake.pdf?web=1)[3](https://fmglobal.sharepoint.com/teams/FMIndiaTeam/_layouts/15/Doc.aspx?sourcedoc=%7BB0761E8B-E65D-41F6-BF13-C8857CC0FAA1%7D&file=Hackathon%202.0-%20PS3%20-%20FM%20essential%20Intake.docx&action=default&mobileredirect=true&DefaultItemOpen=1)

---

## 13. Conclusion

This solution **modernizes FM Essential Intake** into a **scalable, governed, user‑friendly, and future‑ready platform**, significantly reducing manual effort while improving accuracy, usability, and integration readiness.