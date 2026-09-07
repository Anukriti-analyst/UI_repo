# FM Essentials — Frontend (React) Development Guide

> **Document Purpose:** This is the single source of truth for building the FM Essentials React UI.  
> **Created By:** Solution Architect  
> **Last Updated:** 2025-07  
> **API Base URL:** `http://localhost:5000/api/v1`  
> **Target:** React 18+ with TypeScript, Vite, TailwindCSS

---

## 1. Problem Statement

### What exists today
FM Essential currently relies on **multiple Word-based intake forms** that:
- Differ by **territory** (AU, US, UK, CA, SG, HK, DE, FR)
- Require **frequent manual updates** by admins
- Have **no version control** — users may fill outdated templates
- Are **not mobile-friendly** — brokers and underwriters work remotely
- Are **impossible to centralize, govern, or integrate** with downstream systems

### Pain points
- High administrative overhead maintaining individual Word documents per territory
- Inconsistent data collection across regions
- No audit trail of changes
- No dashboard for users to track their submissions
- No PDF export or email capability from a centralized platform

---

## 2. Solution — What the UI Must Deliver

### Two portals, one application

| Portal | Users | Core Purpose |
|--------|-------|-------------|
| **Admin Portal** | Form administrators | Configure forms, questions, sections, versions, categories |
| **General Portal** | Brokers, underwriters, salespeople | Fill forms via wizard, view dashboard, export/email |

### Key capabilities the UI must support

| # | Capability | Priority |
|---|-----------|----------|
| 1 | **Dashboard** — list all user submissions with status, metadata, clickable rows | Must-have |
| 2 | **Form Wizard** — multi-step form filling experience (section-by-section) | Must-have |
| 3 | **Draft Save** — auto-save / manual save while filling | Must-have |
| 4 | **Submit** — finalize a submission (irreversible) | Must-have |
| 5 | **View Submission** — open any historical submission (renders against original version) | Must-have |
| 6 | **PDF Download** — download submission as PDF | Must-have |
| 7 | **Email Submission** — email to support or custom address | Must-have |
| 8 | **Admin: Manage Questions** — CRUD master questions + sub-questions | Must-have |
| 9 | **Admin: Manage Sections** — CRUD master sections | Must-have |
| 10 | **Admin: Manage Forms** — create forms, create versions, activate versions | Must-have |
| 11 | **Admin: Form Builder** — map sections to versions, map questions to sections | Must-have |
| 12 | **Admin: Categories** — manage category groups, categories, values | Must-have |
| 13 | **Responsive Design** — Desktop, Laptop, iPad, Mobile | Must-have |
| 14 | **Role-based UI** — Admin sees admin nav items; General does not | Must-have |

---

## 3. Mandatory Action Items & Practices

### Before writing any code

- [ ] Initialize project with `Vite + React + TypeScript` template
- [ ] Install and configure: `TailwindCSS`, `React Router v6`, `React Query (TanStack Query)`, `Axios`, `React Hook Form`, `Zod` (validation), `Lucide React` (icons)
- [ ] Set up folder structure (see Section 5)
- [ ] Create the API interceptor (see Section 10)
- [ ] Create the `ApiResponse<T>` type that mirrors the backend contract
- [ ] Set up environment variables (`.env`) for API base URL
- [ ] Configure ESLint + Prettier with strict TypeScript rules

### During development

- [ ] **Never hardcode API URLs** — always use the centralized API client
- [ ] **Never use `any` type** — always define interfaces for API responses
- [ ] **Always handle loading, error, and empty states** in every component
- [ ] **Always use the standard error toast/notification** from the interceptor
- [ ] **Always make components responsive-first** (mobile → desktop)
- [ ] **Always use semantic HTML** (`<main>`, `<nav>`, `<section>`, `<article>`)
- [ ] **Always use `aria-*` attributes** for accessibility
- [ ] **Never store sensitive data in localStorage** — use httpOnly cookies for tokens (when auth is added)

---

## 4. Coding Standards & Design Patterns

### TypeScript Standards

```typescript
// ✅ DO: Use interfaces for all API contracts
interface TerritoryDto {
  territoryId: number;
  code: string;
  name: string;
  isActive: boolean;
}

// ✅ DO: Use const assertions for enums
const SubmissionStatus = {
  Draft: 'Draft',
  Submitted: 'Submitted',
  Cancelled: 'Cancelled',
} as const;

// ❌ DON'T: Use `any`
// ❌ DON'T: Use class components
// ❌ DON'T: Use default exports (use named exports)
```

### React Patterns

| Pattern | Usage |
|---------|-------|
| **Custom Hooks** | All API calls wrapped in custom hooks (`useSubmissions`, `useForms`, etc.) |
| **Compound Components** | Form wizard steps, modal dialogs |
| **Render Props / Children** | Layout wrappers (AdminLayout, GeneralLayout) |
| **Context + useReducer** | Global state (current user, theme, notifications) |
| **React Query** | Server state (caching, refetching, optimistic updates) |
| **React Hook Form + Zod** | All form validation (client-side mirrors server-side rules) |
| **Error Boundaries** | Wrap each route in error boundary |
| **Suspense** | Loading states for lazy-loaded routes |

### File Naming Convention

```
components/       → PascalCase.tsx (e.g., SubmissionCard.tsx)
hooks/            → camelCase.ts (e.g., useSubmissions.ts)
services/         → camelCase.ts (e.g., submissionService.ts)
types/            → camelCase.ts (e.g., submission.types.ts)
pages/            → PascalCase.tsx (e.g., Dashboard.tsx)
utils/            → camelCase.ts (e.g., formatDate.ts)
```

### State Management Rules

| State Type | Tool | Example |
|-----------|------|---------|
| Server state (API data) | React Query | Submissions list, form definitions |
| Form state | React Hook Form | Wizard inputs, admin forms |
| UI state (local) | useState | Modal open/close, accordion expand |
| Global UI state | Context | Current user, notifications, sidebar collapse |

---

## 5. Project Structure

```
src/
├── api/
│   ├── client.ts              — Axios instance + interceptor
│   ├── endpoints.ts           — All API endpoint constants
│   └── types/
│       ├── common.types.ts    — ApiResponse<T>, PaginatedResult<T>
│       ├── territory.types.ts
│       ├── form.types.ts
│       ├── submission.types.ts
│       ├── question.types.ts
│       ├── section.types.ts
│       └── category.types.ts
│
├── hooks/
│   ├── useTerritories.ts
│   ├── useForms.ts
│   ├── useFormDefinition.ts
│   ├── useSubmissions.ts
│   ├── useQuestions.ts
│   ├── useSections.ts
│   └── useCategories.ts
│
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorState.tsx
│   │   ├── DataTable.tsx
│   │   ├── Pagination.tsx
│   │   └── Badge.tsx
│   │
│   ├── layout/
│   │   ├── AppShell.tsx         — Main layout (sidebar + topbar + content)
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── MobileNav.tsx
│   │
│   ├── wizard/
│   │   ├── FormWizard.tsx       — Multi-step form container
│   │   ├── WizardStep.tsx       — Single step wrapper
│   │   ├── WizardProgress.tsx   — Step indicator
│   │   └── QuestionRenderer.tsx — Renders question by type
│   │
│   └── admin/
│       ├── QuestionForm.tsx
│       ├── SectionForm.tsx
│       ├── FormBuilder.tsx
│       └── CategoryManager.tsx
│
├── pages/
│   ├── general/
│   │   ├── Dashboard.tsx
│   │   ├── NewSubmission.tsx
│   │   ├── SubmissionDetail.tsx
│   │   └── SelectForm.tsx
│   │
│   └── admin/
│       ├── ManageQuestions.tsx
│       ├── ManageSections.tsx
│       ├── ManageForms.tsx
│       ├── FormVersions.tsx
│       ├── FormBuilder.tsx
│       └── ManageCategories.tsx
│
├── context/
│   ├── AuthContext.tsx
│   └── NotificationContext.tsx
│
├── utils/
│   ├── formatDate.ts
│   ├── formatStatus.ts
│   └── downloadFile.ts
│
├── App.tsx
├── Router.tsx
└── main.tsx
```

---

## 6. Design Philosophy — User Friendliness

### Core Principles

| Principle | Implementation |
|-----------|---------------|
| **Clarity over cleverness** | Labels, not icons alone. Explicit button text ("Save Draft", not just 💾) |
| **Progressive disclosure** | Show only what's needed at each step. Wizard pattern, not one giant form |
| **Immediate feedback** | Toast on save, loading spinners, disabled buttons during API calls |
| **Error prevention** | Client-side validation before submit, confirmation dialogs for destructive actions |
| **Forgiveness** | "Save Draft" always available, "Are you sure?" on submit |
| **Consistency** | Same button styles, same table layouts, same error patterns everywhere |

### Visual Design Guidelines

| Element | Guideline |
|---------|-----------|
| **Colors** | Primary: Blue (#2563EB). Success: Green. Error: Red. Neutral: Gray scale. Minimal palette. |
| **Typography** | Inter or system font. 14px body, 16px inputs, 24px page titles, 18px section titles |
| **Spacing** | 8px grid system. Consistent padding (p-4 for cards, p-6 for page containers) |
| **Cards** | White background, subtle shadow (`shadow-sm`), rounded corners (`rounded-lg`) |
| **Tables** | Alternating row colors, sticky headers on scroll, responsive (horizontal scroll on mobile) |
| **Forms** | Single column on mobile. Two columns on desktop where logical. Always show label above input. |
| **Buttons** | Primary (filled blue), Secondary (outlined), Danger (red), Ghost (text only) |
| **Empty states** | Always show illustration + message + action button (never a blank page) |

### Wizard UX Requirements

1. **Step indicator at top** — shows current step, completed steps (checkmark), remaining steps
2. **Section name as step title** — matches the form definition sections
3. **Render questions dynamically by type** (see QuestionRenderer below)
4. **"Save & Continue" button** — saves draft after each section, advances to next
5. **"Back" button** — navigate to previous section (no data loss)
6. **"Save Draft" button** — visible on every step, saves current state
7. **Final step: Review** — read-only summary of all answers, then "Submit" button
8. **Keyboard navigation** — Tab through fields, Enter to advance

### Question Type → UI Component Mapping

| QuestionType (API) | RenderHint | UI Component |
|-------------------|-----------|-------------|
| `Text` | — | `<input type="text">` or `<textarea>` if long |
| `Number` | — | `<input type="number">` |
| `Date` | — | Date picker |
| `Boolean` | `radio` | Radio group: Yes / No |
| `Boolean` | `toggle` | Toggle switch |
| `Boolean` | `checkbox` | Single checkbox |
| `Select` | `dropdown` (default) | Dropdown `<select>` |
| `Select` | `radio` | Radio button group |
| `MultiSelect` | — | Multi-select / checkboxes |

### Conditional Sub-Questions

When a question has `subQuestions` and the user's answer matches a `triggerValue`:
- **Slide in** the sub-question below the parent (animate height)
- Sub-questions are indented visually (left border + padding)
- If the user changes their answer away from the trigger value, **hide** the sub-question and **clear** its answer

---

## 7. Responsiveness — Breakpoints & Behavior

| Breakpoint | Device | Sidebar | Layout | Tables |
|-----------|--------|---------|--------|--------|
| `< 640px` (sm) | Mobile | Hidden (hamburger menu) | Single column | Cards or horizontal scroll |
| `640-1024px` (md) | iPad/Tablet | Collapsed (icons only) | Single or 2-column | Responsive columns |
| `> 1024px` (lg) | Laptop/Desktop | Full (expanded with labels) | Multi-column where appropriate | Full table |

### Mobile-specific rules
- Wizard: Full-width, one question per visible area, swipe-friendly
- Dashboard: Submission cards (not table rows)
- Admin: Accessible but optimized for desktop (show "best viewed on desktop" hint on mobile)
- All touch targets: minimum 44×44px
- Bottom navigation bar on mobile (Dashboard, New Form, Profile)

---

## 8. API Reference — Complete Endpoint Documentation

### Standard Response Contract

Every API response follows this shape:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  traceId: string | null;
  errorCode: string | null;
  message: string | null;
  details: string[];
}
```

**Error codes to handle:**
| Code | HTTP Status | UI Action |
|------|-------------|-----------|
| `NOT_FOUND` | 404 | Show "not found" page or toast |
| `VALIDATION_ERROR` | 400 | Highlight invalid fields, show details[] |
| `CONFLICT` | 409 | Show conflict message (e.g., "Already submitted") |
| `INTERNAL_ERROR` | 500 | Show generic error toast, log traceId |
| `EMAIL_SEND_FAILED` | 400 | Show "email failed" toast with retry option |

---

### 8.1 Territories

| Method | Endpoint | Use Case | Parameters |
|--------|----------|----------|-----------|
| `GET` | `/territories` | Populate territory dropdown when creating form or selecting form to fill | — |
| `GET` | `/territories/{id}` | Get single territory details | `id: number` (path) |
| `GET` | `/territories/by-code/{code}` | Lookup by code | `code: string` (path, e.g. "AU") |

**Response: `TerritoryDto`**
```typescript
interface TerritoryDto {
  territoryId: number;
  code: string;
  name: string;
  isActive: boolean;
}
```

---

### 8.2 Forms (General)

| Method | Endpoint | Use Case | Parameters |
|--------|----------|----------|-----------|
| `GET` | `/forms?territoryCode=AU` | List forms for a territory (form selection screen) | `territoryCode?: string` (query, optional) |
| `GET` | `/forms/{formId}` | Get form details | `formId: number` (path) |
| `GET` | `/forms/{formId}/active-version` | Get the currently active version for a form | `formId: number` (path) |
| `GET` | `/forms/{formId}/versions` | List all versions (admin reference) | `formId: number` (path) |

**Response: `FormDto`**
```typescript
interface FormDto {
  formId: number;
  territoryId: number;
  territoryName: string;
  territoryCode: string;
  formName: string;
  description: string | null;
  isActive: boolean;
  createdAt: string; // ISO date
}

interface FormVersionDto {
  formVersionId: number;
  formId: number;
  versionNumber: number;
  isActive: boolean;
  createdAt: string;
}
```

---

### 8.3 Form Definition (Wizard Rendering)

| Method | Endpoint | Use Case | Parameters |
|--------|----------|----------|-----------|
| `GET` | `/form-versions/{formVersionId}/definition` | **Critical** — fetches the full form tree for wizard rendering | `formVersionId: number` (path) |

**Response: `FormDefinitionDto`** — the core data structure for the wizard
```typescript
interface FormDefinitionDto {
  formVersionId: number;
  formId: number;
  formName: string;
  versionNumber: number;
  sections: FormDefinitionSectionDto[];
}

interface FormDefinitionSectionDto {
  formSectionId: number;
  sectionName: string;
  displayOrder: number;
  questions: FormDefinitionQuestionDto[];
}

interface FormDefinitionQuestionDto {
  formQuestionId: number;
  questionId: number;
  questionText: string;
  questionType: 'Text' | 'Number' | 'Select' | 'MultiSelect' | 'Date' | 'Boolean';
  displayOrder: number;
  isRequired: boolean;
  renderHint: string | null; // "radio", "toggle", "checkbox", "dropdown"
  subQuestions: FormDefinitionSubQuestionDto[];
}

interface FormDefinitionSubQuestionDto {
  subQuestionId: number;
  subQuestionText: string;
  triggerValue: string;
}
```

**UI Usage:** Each `section` = one wizard step. Each `question` = one form field rendered by `QuestionRenderer`. Sub-questions appear conditionally.

---

### 8.4 Submissions (General User — Core Flow)

| Method | Endpoint | Use Case | Parameters | Validations |
|--------|----------|----------|-----------|-------------|
| `GET` | `/submissions` | Dashboard — list current user's submissions | — (uses X-User-Id header) | — |
| `GET` | `/submissions/{id}` | View full submission detail (read-only) | `id: guid` (path) | — |
| `POST` | `/submissions` | Create a new draft | Body: `{ formVersionId: number }` | formVersionId must be active |
| `PUT` | `/submissions/{id}/answers` | Save answers (can call multiple times) | Body: `SaveAnswersRequest` | Status must be Draft |
| `POST` | `/submissions/{id}/submit` | Finalize submission | — | Status must be Draft |
| `GET` | `/submissions/{id}/pdf` | Download PDF | — | Returns `application/pdf` binary |
| `POST` | `/submissions/{id}/email` | Email submission | Body: `{ toEmail?: string }` | — |

**Request: `SaveAnswersRequest`**
```typescript
interface SaveAnswersRequest {
  sections: SaveAnswersSectionDto[];
}

interface SaveAnswersSectionDto {
  sectionName: string;
  displayOrder: number;
  answers: SaveAnswersAnswerDto[];
}

interface SaveAnswersAnswerDto {
  questionText: string;
  answerValue: string | null;
}
```

**Response: `SubmissionSummaryDto`** (for list/create)
```typescript
interface SubmissionSummaryDto {
  submissionId: string; // GUID
  formName: string;
  territoryName: string;
  versionNumber: number;
  status: 'Draft' | 'Submitted' | 'Cancelled';
  referenceNumber: string | null;
  submittedAt: string | null;
}
```

**Response: `SubmissionDetailDto`** (for detail view)
```typescript
interface SubmissionDetailDto {
  submissionId: string;
  formVersionId: number;
  formName: string;
  territoryName: string;
  versionNumber: number;
  status: string;
  referenceNumber: string | null;
  submittedAt: string | null;
  sections: SubmissionSectionDto[];
}

interface SubmissionSectionDto {
  submissionSectionId: string;
  sectionName: string;
  displayOrder: number;
  answers: SubmissionAnswerDto[];
}

interface SubmissionAnswerDto {
  submissionAnswerId: string;
  questionText: string;
  answerValue: string | null;
}
```

**Important UX rules for submissions:**
- `PUT /answers` should be called on "Save Draft" and on "Next Step" (save each section incrementally)
- The `questionText` field in answers is a **snapshot** — always send the literal question text, not an ID
- PDF download: use `window.open()` or create a blob URL from response
- Email: show success toast on 200, error toast with retry on failure

---

### 8.5 Admin — Questions

| Method | Endpoint | Use Case | Parameters | Validations |
|--------|----------|----------|-----------|-------------|
| `GET` | `/admin/questions` | List all master questions | — | — |
| `GET` | `/admin/questions/{id}` | Get question with sub-questions | `id: number` | — |
| `POST` | `/admin/questions` | Create question | Body: `CreateQuestionRequest` | QuestionType must be valid enum |
| `PUT` | `/admin/questions/{id}` | Update question | Body: `UpdateQuestionRequest` | — |
| `POST` | `/admin/questions/{id}/subquestions` | Add conditional sub-question | Body: `CreateSubQuestionRequest` | TriggerValue required |

```typescript
interface CreateQuestionRequest {
  questionText: string;              // Required
  questionType: string;              // Required: Text|Number|Select|MultiSelect|Date|Boolean
}

interface UpdateQuestionRequest {
  questionText: string;
  questionType: string;
  isActive: boolean;
}

interface CreateSubQuestionRequest {
  subQuestionText: string;           // Required
  triggerValue: string;              // Required, max 100 chars
}
```

---

### 8.6 Admin — Sections

| Method | Endpoint | Use Case | Parameters | Validations |
|--------|----------|----------|-----------|-------------|
| `GET` | `/admin/sections` | List all master sections | — | — |
| `POST` | `/admin/sections` | Create section | Body: `CreateSectionRequest` | SectionName required, max 255 |
| `PUT` | `/admin/sections/{id}` | Update section | Body: `UpdateSectionRequest` | — |

```typescript
interface CreateSectionRequest {
  sectionName: string;     // Required, max 255
  displayOrder: number;    // >= 0
}

interface UpdateSectionRequest {
  sectionName: string;
  displayOrder: number;
  isActive: boolean;
}
```

---

### 8.7 Admin — Forms & Versions

| Method | Endpoint | Use Case | Parameters | Validations |
|--------|----------|----------|-----------|-------------|
| `POST` | `/admin/forms` | Create form | Body: `CreateFormRequest` | TerritoryId > 0, FormName required |
| `PUT` | `/admin/forms/{id}` | Update form | Body: `UpdateFormRequest` | FormName required |
| `POST` | `/admin/forms/{id}/versions` | Create new version | Body: `{ notes?: string }` | — |
| `POST` | `/admin/forms/{id}/versions/{versionId}/activate` | Activate version | — | Version must belong to form |

```typescript
interface CreateFormRequest {
  territoryId: number;       // Required, > 0
  formName: string;          // Required, max 255
  description?: string;      // Optional, max 500
}

interface UpdateFormRequest {
  formName: string;
  description?: string;
  isActive: boolean;
}
```

**UX: Version activation**
- Show confirmation dialog: "Activating Version X will deactivate the current active version. Continue?"
- After activation, refresh the versions list to show updated `isActive` badges

---

### 8.8 Admin — Form Builder (Mapping)

| Method | Endpoint | Use Case | Parameters |
|--------|----------|----------|-----------|
| `POST` | `/admin/form-versions/{formVersionId}/sections` | Map a section to a version | Body: `{ sectionId: number, displayOrder: number }` |
| `POST` | `/admin/form-sections/{formSectionId}/questions` | Map a question to a section | Body: `AddQuestionToSectionRequest` |

```typescript
interface AddSectionToVersionRequest {
  sectionId: number;         // Required
  displayOrder: number;
}

interface AddQuestionToSectionRequest {
  questionId: number;        // Required
  displayOrder: number;
  isRequired: boolean;
  renderHint?: string;       // "radio", "toggle", "checkbox", "dropdown"
}
```

**UX: Form Builder page**
- Left panel: available master sections and questions (draggable)
- Right panel: current form version structure (droppable)
- Drag-and-drop ordering or manual displayOrder input
- Live preview button: "Preview Form" opens the wizard in read-only mode

---

### 8.9 Admin — Categories

| Method | Endpoint | Use Case | Parameters |
|--------|----------|----------|-----------|
| `GET` | `/admin/category-groups` | List all groups | — |
| `GET` | `/admin/form-versions/{id}/category-groups` | Groups for a version | `id: number` |
| `GET` | `/admin/category-groups/{id}` | Group with categories | `id: number` |
| `POST` | `/admin/category-groups` | Create group | Body: `CreateCategoryGroupRequest` |
| `POST` | `/admin/category-groups/{id}/categories` | Create category in group | Body: `CreateCategoryRequest` |
| `GET` | `/admin/categories/{id}/values` | Get active values | `id: number` |
| `POST` | `/admin/categories/{id}/values` | Upsert value | Body: `UpsertCategoryValueRequest` |

```typescript
interface CreateCategoryGroupRequest {
  formVersionId: number;
  groupName: string;         // max 255
  groupType: string;         // max 50
  source: string;            // max 50, e.g. "GBS", "GPM", "Manual"
}

interface CreateCategoryRequest {
  categoryKey: string;       // max 255
  displayName?: string;
  dataType: string;          // max 50, e.g. "Currency", "Percentage", "Text"
}

interface UpsertCategoryValueRequest {
  territoryId: number;       // Required
  numericValue?: number;
  currency?: string;         // max 10, e.g. "USD", "AUD"
  unit?: string;             // max 50, e.g. "hours", "days"
  qualifier?: string;        // max 255, e.g. "Per Occurrence"
  textValue?: string;        // max 255
  effectiveFrom?: string;    // ISO date, defaults to now
}
```

---

## 9. Request Headers (Dev Mode)

Until SSO/JWT is implemented, the UI must send these headers with every request:

```typescript
headers: {
  'X-User-Id': '00000000-0000-0000-0000-000000000001',  // Current user GUID
  'X-User-Email': 'admin@fm.com',
  'X-User-Role': 'Admin'  // or 'General'
}
```

Store these in a context/provider. When JWT auth is added later, these headers will be replaced by a `Bearer` token.

---

## 10. API Interceptor — Generic HTTP Client

Create a centralized Axios instance that handles:

### Features required:

| Feature | Implementation |
|---------|---------------|
| **Base URL** | Read from `VITE_API_BASE_URL` env variable |
| **Request interceptor** | Attach auth headers (X-User-Id, X-User-Role, X-User-Email) |
| **Response interceptor (success)** | Unwrap `ApiResponse<T>` — return `data` field directly to hooks |
| **Response interceptor (error)** | Parse error response, show toast notification, handle by error code |
| **401 handling** | Redirect to login (when auth is implemented) |
| **403 handling** | Show "Access Denied" toast, redirect to dashboard |
| **404 handling** | Let individual components handle (some show "not found" page) |
| **500 handling** | Show "Something went wrong" toast with traceId for support |
| **Request cancellation** | Use AbortController for navigation-cancelled requests |
| **Retry** | Retry 500 errors once with exponential backoff |
| **Loading state** | Managed by React Query, not the interceptor |

### Pseudocode:

```typescript
// src/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor
apiClient.interceptors.request.use((config) => {
  // Attach user headers from context/storage
  const userId = getUserId();
  const userEmail = getUserEmail();
  const userRole = getUserRole();

  if (userId) config.headers['X-User-Id'] = userId;
  if (userEmail) config.headers['X-User-Email'] = userEmail;
  if (userRole) config.headers['X-User-Role'] = userRole;

  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Unwrap ApiResponse envelope
    const apiResponse = response.data;
    if (apiResponse.success) {
      return apiResponse.data;
    }
    // Shouldn't happen (2xx with success=false) but handle gracefully
    return Promise.reject(apiResponse);
  },
  (error) => {
    const apiError = error.response?.data;
    const status = error.response?.status;

    // Show toast based on error type
    if (status === 401) redirectToLogin();
    else if (status === 403) showToast('Access denied', 'error');
    else if (status === 500) showToast(`Server error (${apiError?.traceId})`, 'error');
    else if (apiError?.message) showToast(apiError.message, 'error');

    return Promise.reject(apiError || error);
  }
);

export { apiClient };
```

---

## 11. Routing Structure

```typescript
// src/Router.tsx
const routes = [
  // General
  { path: '/', element: <Dashboard /> },
  { path: '/submissions/new', element: <SelectForm /> },
  { path: '/submissions/new/:formVersionId', element: <NewSubmission /> },
  { path: '/submissions/:submissionId', element: <SubmissionDetail /> },

  // Admin
  { path: '/admin/questions', element: <ManageQuestions /> },
  { path: '/admin/sections', element: <ManageSections /> },
  { path: '/admin/forms', element: <ManageForms /> },
  { path: '/admin/forms/:formId/versions', element: <FormVersions /> },
  { path: '/admin/forms/:formId/versions/:versionId/builder', element: <FormBuilder /> },
  { path: '/admin/categories', element: <ManageCategories /> },
];
```

### Navigation Structure

**Sidebar (General user):**
- 📊 Dashboard (`/`)
- ➕ New Submission (`/submissions/new`)

**Sidebar (Admin user — additional items):**
- 📝 Questions (`/admin/questions`)
- 📋 Sections (`/admin/sections`)
- 📄 Forms (`/admin/forms`)
- 🏷️ Categories (`/admin/categories`)

---

## 12. Key User Flows (Step-by-Step)

### Flow 1: Fill New Submission

```
Dashboard → "New Submission" button
  → Select Territory (dropdown)
  → Show available forms for territory (GET /forms?territoryCode=AU)
  → Click form → GET /forms/{id}/active-version → get formVersionId
  → POST /submissions { formVersionId } → creates Draft, get submissionId
  → GET /form-versions/{formVersionId}/definition → get full form tree
  → Render Wizard:
    Step 1: Section 1 questions → fill → "Save & Next" → PUT /submissions/{id}/answers
    Step 2: Section 2 questions → fill → "Save & Next" → PUT /submissions/{id}/answers
    ...
    Final Step: Review all answers → "Submit" → POST /submissions/{id}/submit
  → Redirect to Dashboard with success toast
```

### Flow 2: View & Export Submission

```
Dashboard → Click submission row
  → GET /submissions/{id} → render read-only detail
  → "Download PDF" button → GET /submissions/{id}/pdf → download
  → "Email" button → modal with optional email input → POST /submissions/{id}/email
```

### Flow 3: Admin — Create & Configure Form

```
Admin Forms page → "Create Form" button → modal
  → Fill: territory, name, description → POST /admin/forms
  → Forms list updates → click form row
  → Versions page → "Create Version" → POST /admin/forms/{id}/versions
  → Click version → Form Builder page
    → Add sections (POST /admin/form-versions/{versionId}/sections)
    → For each section: add questions (POST /admin/form-sections/{sectionId}/questions)
  → "Activate Version" button → confirmation → POST .../activate
```

---

## 13. Performance Optimization

| Technique | Where |
|-----------|-------|
| **React Query caching** | Cache form definitions (rarely change), territories (static) |
| **Stale-while-revalidate** | Submissions list (show cached, refetch in background) |
| **Lazy loading routes** | All admin pages lazy-loaded (`React.lazy`) |
| **Debounced auto-save** | Wizard: debounce 2s after last keystroke, then PUT answers |
| **Memoization** | `useMemo` for computed form definition transformations |
| **Virtual scrolling** | Admin question list if > 100 items (use `@tanstack/react-virtual`) |
| **Image optimization** | Use SVG for icons (Lucide), avoid raster images |
| **Bundle splitting** | Vendor chunk, admin chunk, general chunk |

---

## 14. Testing Strategy

| Type | Tool | Coverage Target |
|------|------|----------------|
| Unit | Vitest | Custom hooks, utility functions, validation schemas |
| Component | React Testing Library | Form components, wizard flow, conditional rendering |
| E2E | Playwright or Cypress | Full submission flow, admin CRUD flows |
| API Mock | MSW (Mock Service Worker) | All API calls mocked for component tests |

---

## 15. Environment Variables

```env
# .env.development
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_DEFAULT_USER_ID=00000000-0000-0000-0000-000000000001
VITE_DEFAULT_USER_EMAIL=admin@fm.com
VITE_DEFAULT_USER_ROLE=Admin

# .env.production
VITE_API_BASE_URL=https://api.fmessentials.com/api/v1
```

---

## 16. Accessibility (WCAG 2.1 AA)

| Requirement | Implementation |
|-------------|---------------|
| Keyboard navigation | All interactive elements focusable, logical tab order |
| Screen reader | `aria-label` on icons, `aria-describedby` for errors, `role` for dynamic regions |
| Color contrast | Minimum 4.5:1 for text, 3:1 for large text |
| Focus indicators | Visible focus ring (Tailwind `focus:ring-2`) |
| Form labels | Every input has associated `<label>` |
| Error announcements | `aria-live="polite"` on error messages |
| Skip navigation | "Skip to main content" link |

---

## 17. Deliverables Checklist

### MVP (Must ship)

- [ ] Dashboard with submission list (status badges, click to view)
- [ ] Form selection flow (territory → form → start wizard)
- [ ] Multi-step wizard with all question types rendered correctly
- [ ] Save draft (manual + on step transition)
- [ ] Submit with confirmation
- [ ] View submission detail (read-only, historical version)
- [ ] PDF download
- [ ] Email submission
- [ ] Admin: CRUD questions + sub-questions
- [ ] Admin: CRUD sections
- [ ] Admin: CRUD forms + versions + activate
- [ ] Admin: Form builder (map sections/questions)
- [ ] Admin: Category management
- [ ] Responsive across all breakpoints
- [ ] Error handling (toasts, validation highlights, empty states)

### Nice-to-have (post-MVP)

- [ ] Drag-and-drop form builder
- [ ] Dark mode toggle
- [ ] Submission search/filter on dashboard
- [ ] Bulk export submissions (admin)
- [ ] Form preview mode (admin sees what user will see)
- [ ] Offline draft support (service worker + IndexedDB)
