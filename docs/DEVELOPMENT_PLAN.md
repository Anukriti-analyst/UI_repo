# FM Essentials UI — Development Plan

> **Created:** 2026-05-28  
> **Purpose:** Phased development plan with checkpoints, prerequisites, and strict guidelines  
> **Priority:** User-friendliness, responsiveness, minimal design (white + FM blue)

---

## Table of Contents

1. [Color Palette & Design Philosophy](#1-color-palette--design-philosophy)
2. [Prerequisites (Before Any Development)](#2-prerequisites-before-any-development)
3. [Coding Standards & Naming Conventions](#3-coding-standards--naming-conventions)
4. [Responsive Design Guidelines](#4-responsive-design-guidelines)
5. [**DRY Rules — Master CSS & Reusable Components**](#5-dry-rules--master-css--reusable-components)
6. [Phase 1 — Project Scaffolding & Foundation](#6-phase-1--project-scaffolding--foundation)
7. [Phase 2 — Layout Shell & Navigation](#7-phase-2--layout-shell--navigation)
8. [Phase 3 — General User: Dashboard & Submissions](#8-phase-3--general-user-dashboard--submissions)
9. [Phase 4 — General User: Form Wizard](#9-phase-4--general-user-form-wizard)
10. [Phase 5 — Admin: Questions & Sections Management](#10-phase-5--admin-questions--sections-management)
11. [Phase 6 — Admin: Forms, Versions & Builder](#11-phase-6--admin-forms-versions--builder)
11. [Phase 7 — Admin: Categories & Reference Data](#11-phase-7--admin-categories--reference-data)
12. [Phase 8 — Polish, Accessibility & Final QA](#12-phase-8--polish-accessibility--final-qa)

---

## 1. Color Palette & Design Philosophy

### Minimal Color System (White + FM Blue)

| Token | Hex | Usage |
|-------|-----|-------|
| **White** | `#FFFFFF` | Page backgrounds, cards, containers |
| **FM Navy (Primary)** | `#383B54` | Primary buttons, sidebar text, headings, active states |
| **FM Navy Dark** | `#0D102B` | Hover states, emphasis text |
| **FM Navy Light** | `#F2F2F5` | Subtle backgrounds, hover highlights, table alternating rows |
| **FM Blue Accent** | `#0073E6` | Links, info badges, focus rings |
| **Border Gray** | `#E0E0E5` | Borders, dividers, card outlines |
| **Text Primary** | `#000000` | Body text |
| **Text Secondary** | `#666666` | Muted/helper text, timestamps |
| **Success** | `#16B041` | Success badges, confirmation toasts |
| **Danger** | `#DD2647` | Error states, destructive actions |
| **Caution** | `#E6BC00` | Warning badges (minimal use) |
| **Surface Background** | `#F8F7F4` | App background (warm neutral) |

### Design Principles

| Principle | Rule |
|-----------|------|
| **Minimal** | White cards on light surface background. No gradients, no shadows heavier than `shadow-sm`. |
| **Clean typography** | FM Review Web font. Clear hierarchy: page title → section title → body. |
| **Generous whitespace** | `p-6` for page containers, `p-4` for cards, `gap-4` between elements. |
| **One primary action** | Each page has exactly ONE primary (filled) button. Others are secondary/ghost. |
| **Blue for interaction** | Links, focus rings, active nav indicators — all use FM Blue Accent. |
| **No decoration** | No icons without labels (except well-known: search, close). No ornamental borders. |

---

## 2. Prerequisites (Before Any Development)

### Environment Setup

- [ ] Node.js 18+ installed
- [ ] npm 9+ or pnpm installed
- [ ] VS Code with extensions: ESLint, Prettier, Tailwind CSS IntelliSense
- [ ] Backend API running at `http://localhost:5000/api/v1` (or mock server ready)
- [ ] Git initialized with `.gitignore` for `node_modules`, `dist`, `.env`

### Project Initialization Checklist

- [ ] Vite + React + TypeScript template initialized
- [ ] TailwindCSS configured with custom FM color tokens
- [ ] RDS Web Components loaded (font + stylesheet + component registration)
- [ ] TypeScript declarations for `rds-*` custom elements created
- [ ] ESLint + Prettier configured (strict mode)
- [ ] Folder structure created per Section 3
- [ ] `.env.development` created with `VITE_API_BASE_URL`
- [ ] Axios client with interceptors scaffolded
- [ ] React Router v6 configured with lazy-loaded routes
- [ ] React Query (TanStack Query) provider set up
- [ ] Dev auth headers configured (`X-User-Id`, `X-User-Email`, `X-User-Role`)

### API Readiness

- [ ] `GET /territories` returns data
- [ ] `GET /forms?territoryCode=XX` returns data
- [ ] At minimum, mock responses via MSW (Mock Service Worker) if backend isn't ready

---

## 3. Coding Standards & Naming Conventions

### File & Folder Naming

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase `.tsx` | `Dashboard.tsx`, `FormWizard.tsx` |
| Hooks | camelCase `use` prefix `.ts` | `useSubmissions.ts`, `useForms.ts` |
| Services/API | camelCase `.ts` | `submissionService.ts` |
| Types/Interfaces | camelCase `.types.ts` | `submission.types.ts` |
| Utils | camelCase `.ts` | `formatDate.ts` |
| Pages | PascalCase `.tsx` | `ManageQuestions.tsx` |
| Constants | UPPER_SNAKE_CASE inside file | `API_ENDPOINTS`, `SUBMISSION_STATUS` |

### TypeScript Rules (Strict)

```typescript
// ✅ ALWAYS
- Use `interface` for API contracts and component props
- Use `type` for unions, intersections, utility types
- Use `as const` for constant objects/enums
- Use named exports (never default exports)
- Use generic types for reusable components
- Use `unknown` instead of `any` for untyped externals
- Explicitly type function return values for public APIs

// ❌ NEVER
- Never use `any`
- Never use class components
- Never use default exports
- Never use `var`
- Never ignore TypeScript errors with @ts-ignore (use @ts-expect-error with explanation if absolutely necessary)
- Never use inline styles (use Tailwind classes or RDS tokens)
```

### React Patterns (Mandatory)

| Pattern | When to Use |
|---------|------------|
| Custom Hooks | ALL API calls, ALL reusable logic |
| React Query | ALL server state (GET, mutations) |
| React Hook Form + Zod | ALL forms (wizard, admin CRUD) |
| Error Boundaries | Wrap each route-level component |
| Suspense + lazy | All route-level page components |
| Context | Global state only (auth, notifications, theme) |
| Composition | Prefer composition over prop drilling (slots, children) |

### Component Structure Template

```tsx
// 1. Imports (external → internal → types → styles)
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';

import type { SubmissionSummaryDto } from '@/api/types/submission.types';

// 2. Component (named export)
export function Dashboard() {
  // 3. Hooks first
  const { data, isLoading, error } = useSubmissions();

  // 4. Early returns (loading, error, empty)
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error.message} />;
  if (!data?.length) return <EmptyState title="No submissions yet" />;

  // 5. Main render
  return (
    <section aria-label="Submissions dashboard">
      {/* content */}
    </section>
  );
}
```

### Import Aliases

```typescript
// tsconfig paths
"@/*" → "src/*"
"@/api/*" → "src/api/*"
"@/components/*" → "src/components/*"
"@/hooks/*" → "src/hooks/*"
"@/pages/*" → "src/pages/*"
"@/utils/*" → "src/utils/*"
"@/types/*" → "src/api/types/*"
```

### Git Commit Convention

```
feat: add dashboard submission table
fix: correct wizard step navigation on mobile
refactor: extract QuestionRenderer into separate component
style: adjust card padding for tablet breakpoint
docs: update development plan phase 3 checkpoint
```

---

## 4. Responsive Design Guidelines

### Breakpoints

| Breakpoint | Device | Width | Layout Behavior |
|-----------|--------|-------|----------------|
| `sm` | Mobile | < 640px | Single column, bottom nav, cards instead of tables |
| `md` | iPad/Tablet | 640–1024px | Collapsed sidebar (icons), 1-2 columns |
| `lg` | Laptop | 1024–1440px | Full sidebar, multi-column layouts |
| `xl` | Desktop | > 1440px | Full sidebar, max-width content container |

### Layout Rules

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| **Navigation** | Bottom tab bar (3 items) | Collapsed sidebar (icons) | Full sidebar with labels |
| **Page container** | `px-4 py-4` | `px-6 py-6` | `px-8 py-6` max-w-7xl |
| **Cards** | Full width, stacked | 2-column grid | 3-4 column grid where appropriate |
| **Tables** | Convert to card list | Horizontal scroll or hide columns | Full table with all columns |
| **Forms** | Single column | Single column | Two columns where logical |
| **Wizard** | Full screen, one question visible | Standard stepper | Standard stepper |
| **Buttons** | Full width on mobile | Auto width | Auto width |
| **Touch targets** | Min 44×44px | Min 44×44px | Standard |

### Mobile-First CSS Approach

```css
/* Always write mobile-first, then add breakpoints */
.container {
  @apply px-4 py-4;          /* mobile */
  @apply md:px-6 md:py-6;    /* tablet */
  @apply lg:px-8 lg:py-6;    /* desktop */
}
```

---

## 5. DRY Rules — Master CSS & Reusable Components

> **Rule:** If the same markup, style, or logic appears more than once — extract it. No exceptions.

---

### 5.1 Master CSS Class System

All shared visual patterns are defined as Tailwind `@apply` utility groups in a single master stylesheet (`src/styles/master.css`). **Never repeat raw Tailwind class strings across components** — use these named classes instead.

#### Layout Classes

```css
/* Page wrapper — used on every page's root element */
.fm-page          { @apply px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-6 max-w-7xl mx-auto; }

/* Content card */
.fm-card          { @apply bg-white border border-[#E0E0E5] rounded-lg shadow-sm; }
.fm-card-header   { @apply px-6 py-4 border-b border-[#E0E0E5]; }
.fm-card-body     { @apply px-6 py-4; }
.fm-card-footer   { @apply px-6 py-4 border-t border-[#E0E0E5] flex items-center justify-end gap-3; }

/* Section spacing */
.fm-section       { @apply mb-6; }
.fm-section-gap   { @apply flex flex-col gap-4; }
```

#### Typography Classes

```css
.fm-page-title    { @apply text-2xl font-bold text-[#383B54] mb-1; }
.fm-page-subtitle { @apply text-sm text-[#666666] mb-6; }
.fm-section-title { @apply text-lg font-semibold text-[#383B54] mb-3; }
.fm-label         { @apply text-sm font-medium text-[#383B54] mb-1 block; }
.fm-helper-text   { @apply text-xs text-[#666666] mt-1; }
.fm-error-text    { @apply text-xs text-[#DD2647] mt-1; }
```

#### Form Field Classes

```css
/* Wraps a label + input + helper/error — used by every form field */
.fm-field         { @apply flex flex-col gap-1 mb-4; }
.fm-field-row     { @apply grid grid-cols-1 md:grid-cols-2 gap-4; }

/* Sub-question indent (conditional reveal) */
.fm-sub-question  { @apply pl-4 border-l-2 border-[#0073E6] mt-2 ml-2; }
```

#### Table Classes

```css
.fm-table-wrapper { @apply w-full overflow-x-auto; }
.fm-table         { @apply w-full text-sm text-left border-collapse; }
.fm-table-th      { @apply px-4 py-3 font-semibold text-[#383B54] bg-[#F2F2F5] border-b border-[#E0E0E5]; }
.fm-table-td      { @apply px-4 py-3 text-[#000000] border-b border-[#E0E0E5]; }
.fm-table-row     { @apply hover:bg-[#F8F7F4] cursor-pointer transition-colors; }
.fm-table-row-alt { @apply bg-[#F2F2F5] hover:bg-[#E0E0E5]; }
```

#### State Classes

```css
.fm-empty-state   { @apply flex flex-col items-center justify-center py-16 text-center gap-3; }
.fm-loading       { @apply flex items-center justify-center py-16; }
.fm-error-state   { @apply flex flex-col items-center justify-center py-12 gap-3 text-[#DD2647]; }
```

#### Badge / Status Classes

```css
.fm-badge         { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium; }
.fm-badge-draft   { @apply fm-badge bg-[#F2F2F5] text-[#383B54]; }
.fm-badge-submit  { @apply fm-badge bg-[#E6F2EA] text-[#0E8C35]; }
.fm-badge-cancel  { @apply fm-badge bg-[#FAE8ED] text-[#B31E38]; }
.fm-badge-active  { @apply fm-badge bg-[#EFF6FE] text-[#0057CA]; }
```

---

### 5.2 Reusable Component Catalog

All components below **must exist in `src/components/common/`** before any page-level development begins. Pages consume them — they never reimplement the same pattern.

#### Feedback & State Components

| Component | File | Props | When to Use |
|-----------|------|-------|------------|
| `LoadingSpinner` | `LoadingSpinner.tsx` | `size?: 'sm'│'md'│'lg'` | Every loading state |
| `SkeletonLoader` | `SkeletonLoader.tsx` | `rows?: number; cols?: number` | Table/list loading |
| `EmptyState` | `EmptyState.tsx` | `title, description?, actionLabel?, onAction?` | Empty lists |
| `ErrorState` | `ErrorState.tsx` | `message, onRetry?` | API errors |
| `PageHeading` | `PageHeading.tsx` | `title, subtitle?, actions?` | Every page's top heading |

#### Data Display Components

| Component | File | Props | When to Use |
|-----------|------|-------|------------|
| `StatusBadge` | `StatusBadge.tsx` | `status: 'Draft'│'Submitted'│'Cancelled'` | Submission status display |
| `DataTable` | `DataTable.tsx` | `columns, data, onRowClick?, isLoading?` | Every list/table view |
| `ConfirmModal` | `ConfirmModal.tsx` | `title, message, onConfirm, onCancel, danger?` | All destructive/irreversible actions |
| `FormModal` | `FormModal.tsx` | `title, children, onClose, size?` | Admin CRUD create/edit modals |

#### Form Field Components (Critical — No Repetition)

These wrap RDS components with consistent label, error, and helper text layout:

| Component | File | Wraps | When to Use |
|-----------|------|-------|------------|
| `FieldWrapper` | `FieldWrapper.tsx` | — | Wraps label + control + error text |
| `TextInput` | `TextInput.tsx` | `<rds-input>` | Single-line text, email, URL |
| `TextareaInput` | `TextareaInput.tsx` | `<rds-textarea>` | Multi-line text |
| `NumberInput` | `NumberInput.tsx` | `<rds-input type="number">` | Numeric fields |
| `SelectInput` | `SelectInput.tsx` | `<rds-select>` | Dropdowns |
| `RadioGroupInput` | `RadioGroupInput.tsx` | `<rds-radio-button-group>` | Radio button groups |
| `CheckboxGroupInput` | `CheckboxGroupInput.tsx` | `<rds-checkbox-group>` | Multi-select via checkboxes |
| `ToggleInput` | `ToggleInput.tsx` | `<rds-toggle>` | Boolean toggle |
| `DateInput` | `DateInput.tsx` | `<rds-input-date-picker>` | Date fields |

> **All field components accept:** `label`, `required`, `disabled`, `error`, `helpText`, and React Hook Form's `...register()` spread.

---

### 5.3 QuestionRenderer — The Central Form Engine

`QuestionRenderer` is the **single most critical reusable component** in this codebase. It is the only place that maps a `FormDefinitionQuestionDto` to a UI control. It must **never be duplicated or reimplemented**.

```
src/components/wizard/QuestionRenderer.tsx
```

**Responsibilities:**
1. Receive a `FormDefinitionQuestionDto` (from the API form definition)
2. Select the correct field component based on `questionType` + `renderHint`
3. Wire React Hook Form's `control` + `name` + `rules`
4. Render any conditional `subQuestions` with animation (slide-in/out)
5. Apply `fm-sub-question` indent class to sub-questions

**Mapping Logic:**

```typescript
// QuestionRenderer decides which field component to render:

questionType === 'Text'        → <TextInput> or <TextareaInput> (if long)
questionType === 'Number'      → <NumberInput>
questionType === 'Date'        → <DateInput>
questionType === 'Boolean'
  renderHint === 'radio'       → <RadioGroupInput options={['Yes', 'No']}>
  renderHint === 'toggle'      → <ToggleInput>
  renderHint === 'checkbox'    → <CheckboxInput>  (single)
questionType === 'Select'
  renderHint === 'radio'       → <RadioGroupInput options={question.options}>
  default                      → <SelectInput>
questionType === 'MultiSelect' → <CheckboxGroupInput>
```

**Sub-question behavior:**
- Watch parent field value via `useWatch`
- Compare against `subQuestion.triggerValue`
- Show sub-question with CSS height transition when matched
- Clear sub-question value when hidden

---

### 5.4 DRY Enforcement Rules

| Rule | What It Prevents |
|------|-----------------|
| All field rendering goes through `QuestionRenderer` | No duplicated input logic in wizard vs admin vs review |
| All status display uses `StatusBadge` | No scattered inline badge colors |
| All table rendering uses `DataTable` | No duplicated thead/tbody/loading patterns |
| All modals use `ConfirmModal` or `FormModal` | No ad-hoc dialog implementations |
| All page headings use `PageHeading` | No duplicated title+subtitle+actions pattern |
| All Tailwind patterns use `fm-*` CSS classes | No long repeated class strings |
| All API calls live in hooks (`use*.ts`) | No raw axios calls in components |
| All Zod schemas live in `src/api/types/` | No scattered inline validation |

### 5.5 Pre-Phase Checklist (Before Phase 1 Starts)

- [ ] `src/styles/master.css` created with all `fm-*` class definitions
- [ ] `master.css` imported in `main.tsx` (after Tailwind)
- [ ] All common components stubbed (even if just returning a `<div>`)
- [ ] `QuestionRenderer` skeleton created with switch/case structure
- [ ] `DataTable`, `StatusBadge`, `ConfirmModal`, `FormModal` created
- [ ] `FieldWrapper` and all field components created
- [ ] Component stories or snapshot tests written for common components

---

### Scope
Set up the complete project infrastructure so all future development has a solid base.

### Deliverables

| # | Task | Details |
|---|------|---------|
| 1.1 | Initialize Vite project | React + TypeScript template, clean out boilerplate |
| 1.2 | Install dependencies | tailwindcss, react-router-dom, @tanstack/react-query, axios, react-hook-form, zod, lucide-react |
| 1.3 | Configure Tailwind | Custom colors (FM palette), font family (FM Review Web), spacing scale |
| 1.4 | Configure Vite for RDS | Custom element recognition, path aliases |
| 1.5 | Create folder structure | Full `src/` tree as defined in FRONTEND_GUIDE |
| 1.6 | RDS integration | Load font, add type declarations for all `rds-*` elements |
| 1.7 | API client | Axios instance with request/response interceptors |
| 1.8 | Auth context | Dev-mode context with hardcoded X-User headers |
| 1.9 | Notification context | Toast/snackbar provider |
| 1.10 | Router shell | React Router with lazy routes, 404 fallback |
| 1.11 | Environment config | `.env.development`, `.env.example` |
| 1.12 | ESLint + Prettier | Strict config, pre-commit ready |

### Prerequisites for Phase 1
- Node.js and npm installed
- VS Code with recommended extensions
- Access to RDS Storybook for reference

### Checkpoint ✅

- [ ] `npm run dev` starts without errors
- [ ] Tailwind utility classes render correctly
- [ ] RDS components (`<rds-button>`, `<rds-input>`) render on screen
- [ ] API client makes a test request to backend (or MSW mock returns data)
- [ ] Path aliases resolve (`@/components/...`)
- [ ] No TypeScript errors (`npx tsc --noEmit` passes)
- [ ] ESLint passes with zero warnings

---

## 6. Phase 2 — Layout Shell & Navigation

### Scope
Build the app shell (sidebar, header, content area) that persists across all pages.

### Deliverables

| # | Task | Details |
|---|------|---------|
| 2.1 | AppShell component | Uses `<rds-app-layout>` with sidebar + main slots |
| 2.2 | Sidebar navigation | `<rds-nav>` with role-based items (General vs Admin) |
| 2.3 | Header | `<rds-header>` with app name "FM Essentials", user avatar |
| 2.4 | Mobile bottom nav | 3 tabs: Dashboard, New Form, Profile |
| 2.5 | Responsive sidebar | Full → collapsed → hidden based on breakpoint |
| 2.6 | Active route highlighting | Current nav item highlighted with FM blue indicator |
| 2.7 | Page transition | Smooth content transition on route change |

### Design Specifications

```
┌──────────────────────────────────────────────┐
│  HEADER: "FM Essentials"          [Avatar]   │
├────────┬─────────────────────────────────────┤
│        │                                     │
│  NAV   │         MAIN CONTENT                │
│        │                                     │
│  📊    │    (page renders here)              │
│  ➕    │                                     │
│  ──    │                                     │
│  📝    │                                     │
│  📋    │                                     │
│  📄    │                                     │
│  🏷️    │                                     │
│        │                                     │
├────────┴─────────────────────────────────────┤
│  FOOTER: © FM Global                         │
└──────────────────────────────────────────────┘
```

### Navigation Items

| Item | Route | Icon | Role |
|------|-------|------|------|
| Dashboard | `/` | `home` | General + Admin |
| New Submission | `/submissions/new` | `plus-circle` | General + Admin |
| Questions | `/admin/questions` | `question-mark-circle` | Admin only |
| Sections | `/admin/sections` | `rectangle-stack` | Admin only |
| Forms | `/admin/forms` | `document-text` | Admin only |
| Categories | `/admin/categories` | `tag` | Admin only |

### Prerequisites for Phase 2
- Phase 1 complete (all checkpoints pass)
- RDS `<rds-app-layout>`, `<rds-nav>`, `<rds-header>` rendering correctly

### Checkpoint ✅

- [ ] App shell renders with sidebar + header + content area
- [ ] Sidebar shows correct items based on user role
- [ ] Active route is highlighted in nav
- [ ] Mobile: sidebar hidden, bottom nav visible
- [ ] Tablet: sidebar collapsed (icons only)
- [ ] Desktop: sidebar fully expanded
- [ ] Navigation between routes works without full page reload
- [ ] Footer visible at bottom of page

---

## 7. Phase 3 — General User: Dashboard & Submissions

### Scope
Build the dashboard (submission list) and submission detail view (read-only).

### Deliverables

| # | Task | Details |
|---|------|---------|
| 3.1 | Dashboard page | Table/card list of user's submissions |
| 3.2 | Submission table | Columns: Form Name, Territory, Version, Status, Submitted Date, Reference # |
| 3.3 | Status badges | Draft (neutral), Submitted (success), Cancelled (danger) |
| 3.4 | Click-to-view | Row click → navigates to `/submissions/:id` |
| 3.5 | Empty state | "No submissions yet" with CTA to start new |
| 3.6 | Loading state | Skeleton loader while fetching |
| 3.7 | Submission detail page | Read-only view of all sections + answers |
| 3.8 | PDF download | Button triggers `GET /submissions/{id}/pdf` → browser download |
| 3.9 | Email submission | Button → modal → optional email → sends |
| 3.10 | Mobile dashboard | Cards instead of table rows |

### API Hooks Required

```typescript
useSubmissions()        → GET /submissions
useSubmissionDetail(id) → GET /submissions/{id}
useDownloadPdf(id)      → GET /submissions/{id}/pdf
useEmailSubmission(id)  → POST /submissions/{id}/email
```

### UX Requirements

- Dashboard loads in < 2 seconds (skeleton while loading)
- Status badges use color coding: Draft=neutral gray, Submitted=green, Cancelled=red
- "New Submission" button always visible (top-right on desktop, FAB on mobile)
- Submission detail shows data grouped by section with clear headings
- PDF button shows spinner while generating
- Email success/failure shows toast notification

### Prerequisites for Phase 3
- Phase 2 complete (app shell working)
- Backend `GET /submissions` endpoint returning data (or MSW mock)
- API types defined: `SubmissionSummaryDto`, `SubmissionDetailDto`

### Checkpoint ✅

- [ ] Dashboard renders submission list from API
- [ ] Loading skeleton appears while data loads
- [ ] Empty state shows when no submissions exist
- [ ] Status badges display correct colors
- [ ] Clicking a row navigates to detail page
- [ ] Detail page shows all sections and answers (read-only)
- [ ] PDF download triggers file download
- [ ] Email modal opens, sends, shows success toast
- [ ] Mobile: cards layout, touch-friendly
- [ ] Tablet: responsive table with fewer columns
- [ ] Desktop: full table with all columns

---

## 8. Phase 4 — General User: Form Wizard

### Scope
Build the multi-step form wizard: form selection → section-by-section filling → review → submit.

### Deliverables

| # | Task | Details |
|---|------|---------|
| 4.1 | Select Form page | Territory dropdown → form list → click to start |
| 4.2 | Wizard container | `<rds-stepper>` + step content area |
| 4.3 | QuestionRenderer | Renders correct input based on `questionType` + `renderHint` |
| 4.4 | Conditional sub-questions | Show/hide based on parent answer matching `triggerValue` |
| 4.5 | Save & Continue | Saves current section answers → advances to next |
| 4.6 | Save Draft | Available on every step, saves without advancing |
| 4.7 | Back navigation | Go to previous section, no data loss |
| 4.8 | Review step | Final step: read-only summary of all answers |
| 4.9 | Submit | Confirmation dialog → POST submit → redirect to dashboard |
| 4.10 | Validation | Required fields enforced, error messages displayed |
| 4.11 | Auto-save | Debounced (2s) auto-save of current answers |

### Question Type → Component Mapping

| QuestionType | RenderHint | Component |
|-------------|-----------|-----------|
| `Text` | — | `<rds-input>` or `<rds-textarea>` |
| `Number` | — | `<rds-input type="number">` |
| `Date` | — | `<rds-input-date-picker>` |
| `Boolean` | `radio` | `<rds-radio-button-group>` Yes/No |
| `Boolean` | `toggle` | `<rds-toggle>` |
| `Boolean` | `checkbox` | `<rds-checkbox>` |
| `Select` | `dropdown` | `<rds-select>` |
| `Select` | `radio` | `<rds-radio-button-group>` |
| `MultiSelect` | — | `<rds-checkbox-group>` |

### Wizard Flow

```
[Select Form] → [Step 1: Section 1] → [Step 2: Section 2] → ... → [Review] → [Submit]
     ↓                   ↓                     ↓                       ↓
  Territory       Save & Continue        Save & Continue          Confirm
  Form List       Save Draft             Save Draft               Submit
                  Back                    Back                     Back
```

### UX Requirements

- Step indicator always visible at top (shows completed ✓, current, remaining)
- "Save Draft" button in secondary style, always accessible
- Validation errors appear inline below the field (red text)
- Sub-questions slide in with animation (height transition)
- On submit: "Are you sure? This cannot be undone." confirmation
- Mobile: full-width fields, step indicator becomes compact (dots)

### Prerequisites for Phase 4
- Phase 3 complete
- Backend endpoints ready: `GET /form-versions/{id}/definition`, `POST /submissions`, `PUT /submissions/{id}/answers`, `POST /submissions/{id}/submit`
- Form definition types defined: `FormDefinitionDto`, `FormDefinitionSectionDto`, `FormDefinitionQuestionDto`

### Checkpoint ✅

- [ ] Territory dropdown loads territories from API
- [ ] Form list shows forms for selected territory
- [ ] Clicking a form creates a draft submission and opens wizard
- [ ] Stepper shows correct number of steps (= sections + review)
- [ ] Each question type renders the correct RDS component
- [ ] Required field validation works (prevents advancing without filling)
- [ ] Conditional sub-questions appear/disappear based on parent answer
- [ ] "Save & Continue" saves to API and advances
- [ ] "Save Draft" saves without advancing
- [ ] "Back" returns to previous section with data intact
- [ ] Review step shows all answers read-only
- [ ] Submit shows confirmation → calls API → redirects to dashboard
- [ ] Works on mobile (full-width, touch-friendly)

---

## 9. Phase 5 — Admin: Questions & Sections Management

### Scope
Admin CRUD pages for master questions (with sub-questions) and master sections.

### Deliverables

| # | Task | Details |
|---|------|---------|
| 5.1 | Questions list page | Table with search, showing question text + type + status |
| 5.2 | Create question modal | Form: text, type dropdown |
| 5.3 | Edit question | Inline or modal edit |
| 5.4 | Sub-questions | Expandable section under each question; add/view sub-questions |
| 5.5 | Sections list page | Table with section name + display order + status |
| 5.6 | Create section modal | Form: name, display order |
| 5.7 | Edit section | Inline or modal edit |
| 5.8 | Deactivate/reactivate | Toggle `isActive` with confirmation |

### UX Requirements

- Search/filter bar at top of list pages
- Inline status toggle (active/inactive) with confirmation
- Sub-questions shown in accordion or expandable row
- "Create" button as primary action (top-right)
- Success toasts on CRUD operations
- Pagination for long lists (> 20 items)

### Prerequisites for Phase 5
- Phase 2 complete (app shell with admin nav items visible)
- Backend admin endpoints ready: `GET/POST/PUT /admin/questions`, `GET/POST/PUT /admin/sections`
- Admin role header configured in API client

### Checkpoint ✅

- [ ] Questions list loads and displays all questions
- [ ] Create question → appears in list
- [ ] Edit question → changes reflected
- [ ] Add sub-question to a question → visible in expanded view
- [ ] Sections list loads and displays all sections
- [ ] Create/edit section works correctly
- [ ] Deactivate shows confirmation, updates status badge
- [ ] All actions show success/error toasts
- [ ] Responsive on tablet and desktop (admin hint on mobile)
- [ ] No TypeScript errors

---

## 10. Phase 6 — Admin: Forms, Versions & Builder

### Scope
Admin management of forms, version creation/activation, and the form builder (mapping sections + questions to versions).

### Deliverables

| # | Task | Details |
|---|------|---------|
| 6.1 | Forms list page | Table: name, territory, active version, status |
| 6.2 | Create form modal | Territory dropdown + name + description |
| 6.3 | Form versions page | List versions for a form, show active badge |
| 6.4 | Create version | Button → creates new version |
| 6.5 | Activate version | Button with confirmation dialog |
| 6.6 | Form Builder page | Two-panel: available sections/questions ↔ current version structure |
| 6.7 | Add section to version | Select from master sections, set display order |
| 6.8 | Add question to section | Select from master questions, set order + required + renderHint |
| 6.9 | Reorder | Manual display order input (drag-and-drop is nice-to-have) |
| 6.10 | Preview | "Preview" button opens wizard in read-only mode |

### Form Builder Layout

```
┌─────────────────────────────────────────────────────────┐
│  Form: AU Essential | Version: 3 (Draft)                │
├──────────────────────┬──────────────────────────────────┤
│  AVAILABLE           │  CURRENT VERSION STRUCTURE       │
│                      │                                  │
│  Sections:           │  Section 1: Request Details      │
│  □ Request Details   │    ├ Q: Due Date (Date) *        │
│  □ Policy Info       │    ├ Q: Office (Select)          │
│  □ Coverage Terms    │    └ Q: Reference (Text) *       │
│                      │                                  │
│  Questions:          │  Section 2: Policy Info          │
│  □ Due Date          │    ├ Q: Insured Name (Text) *    │
│  □ Office            │    └ Q: Territory (Select) *     │
│  □ Insured Name      │                                  │
│  □ ...               │  [+ Add Section]                 │
│                      │                                  │
└──────────────────────┴──────────────────────────────────┘
```

### Prerequisites for Phase 6
- Phase 5 complete (questions and sections exist in system)
- Backend endpoints: `POST/PUT /admin/forms`, `POST /admin/forms/{id}/versions`, `POST .../activate`, `POST /admin/form-versions/{id}/sections`, `POST /admin/form-sections/{id}/questions`

### Checkpoint ✅

- [ ] Forms list shows all forms with territory and active version
- [ ] Create form works with territory selection
- [ ] Versions page shows all versions with active indicator
- [ ] "Create Version" adds a new version
- [ ] "Activate" changes active version (with confirmation)
- [ ] Form Builder shows two-panel layout
- [ ] Can add sections to version with display order
- [ ] Can add questions to sections with order + required flag
- [ ] Preview opens wizard view of the version
- [ ] All operations show feedback (toasts, badge updates)

---

## 11. Phase 7 — Admin: Categories & Reference Data

### Scope
Admin management of category groups, categories, and category values (used for appendix/reference tables in forms).

### Deliverables

| # | Task | Details |
|---|------|---------|
| 7.1 | Category groups list | Grouped by form version, showing source (GBS/GPM/Manual) |
| 7.2 | Create category group | Form: formVersionId, groupName, groupType, source |
| 7.3 | Categories within group | Expandable list showing categoryKey + dataType |
| 7.4 | Create category | Form: categoryKey, displayName, dataType |
| 7.5 | Category values | Table per category showing territory-specific values |
| 7.6 | Upsert value | Form: territory, numericValue, currency, unit, qualifier, textValue |
| 7.7 | Effective dating | Show effectiveFrom, support setting new effective date |

### Prerequisites for Phase 7
- Phase 6 complete (forms and versions exist)
- Backend endpoints: `GET/POST /admin/category-groups`, `POST /admin/category-groups/{id}/categories`, `GET/POST /admin/categories/{id}/values`

### Checkpoint ✅

- [ ] Category groups list loads for a form version
- [ ] Create group with correct source indicator
- [ ] Categories visible within groups
- [ ] Values table shows territory-specific data
- [ ] Upsert value works with success feedback
- [ ] Effective dating displayed correctly
- [ ] Responsive layout (table scrolls on mobile)

---

## 12. Phase 8 — Polish, Accessibility & Final QA

### Scope
Final pass for UX polish, accessibility compliance, performance, and cross-device testing.

### Deliverables

| # | Task | Details |
|---|------|---------|
| 8.1 | Accessibility audit | WCAG 2.1 AA compliance check |
| 8.2 | Keyboard navigation | All flows completable via keyboard |
| 8.3 | Screen reader testing | aria-labels, live regions, focus management |
| 8.4 | Performance | Lighthouse score > 90, lazy loading, bundle optimization |
| 8.5 | Cross-browser testing | Chrome, Edge, Safari, Firefox |
| 8.6 | Device testing | Physical/emulated: iPhone, iPad, laptop, desktop |
| 8.7 | Error edge cases | Network errors, timeouts, 404s, malformed data |
| 8.8 | Loading states | Every page has skeleton/spinner |
| 8.9 | Empty states | Every list page has empty state with CTA |
| 8.10 | Toast notifications | Consistent success/error feedback |
| 8.11 | Final responsive pass | Verify all breakpoints on all pages |

### Accessibility Checklist

- [ ] All images have alt text
- [ ] All form inputs have labels
- [ ] Color contrast ratio ≥ 4.5:1
- [ ] Focus order is logical
- [ ] Focus indicators visible (2px solid FM blue)
- [ ] Skip-to-content link present
- [ ] Dynamic content announced via `aria-live`
- [ ] Modals trap focus correctly
- [ ] Errors associated with fields via `aria-describedby`

### Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3.5s |
| Bundle size (gzipped) | < 200KB initial |
| Lighthouse Performance | > 90 |
| Lighthouse Accessibility | > 95 |

### Checkpoint ✅

- [ ] Zero accessibility violations (axe-core scan)
- [ ] All pages keyboard-navigable
- [ ] Lighthouse scores meet targets
- [ ] All devices tested and screenshots captured
- [ ] No console errors in production build
- [ ] Error boundaries catch all unhandled errors
- [ ] Toast notifications work for all API operations
- [ ] PDF download works across browsers
- [ ] App works with slow network (3G simulation)

---

## Cross-Phase Rules (Apply Always)

### Every Component Must Have

1. **Loading state** — skeleton or spinner
2. **Error state** — retry button + user-friendly message
3. **Empty state** — illustration/icon + message + action button
4. **Responsive behavior** — tested at all 4 breakpoints
5. **Accessibility** — aria attributes, keyboard support

### Every API Call Must Have

1. **React Query hook** — no raw axios calls in components
2. **Type safety** — request and response typed
3. **Error handling** — interceptor handles + component can override
4. **Loading indicator** — managed by React Query `isLoading`
5. **Optimistic updates** — where appropriate (drafts, toggles)

### Every Form Must Have

1. **Zod schema** — mirrors backend validation
2. **Inline errors** — shown below field on blur/submit
3. **Submit disabled** — while submitting (prevent double-submit)
4. **Success feedback** — toast + redirect/refresh
5. **Confirmation** — for destructive actions (delete, submit, activate)

### Design Consistency Rules

| Element | Specification |
|---------|--------------|
| Page title | `<rds-headline level="1">` — bold, FM Navy |
| Section title | `<rds-headline level="2">` — semibold, FM Navy |
| Body text | `<rds-text size="md">` — black |
| Helper text | `<rds-text size="sm" color="secondary">` — gray |
| Primary button | `<rds-button variant="primary">` — FM Navy fill, white text |
| Secondary button | `<rds-button variant="secondary">` — white fill, FM Navy border + text |
| Danger button | `<rds-button variant="danger">` — red fill, white text (destructive only) |
| Cards | White background, 1px border (#E0E0E5), rounded-lg, shadow-sm |
| Table rows | Alternating: white / FM Navy Light (#F2F2F5) |
| Active nav | Left border indicator in FM Blue Accent |

---

## Dependency Chain

```
Phase 1 (Foundation)
  └── Phase 2 (Layout Shell)
        ├── Phase 3 (Dashboard & Submissions)
        │     └── Phase 4 (Form Wizard)
        │
        ├── Phase 5 (Admin: Questions & Sections)
        │     └── Phase 6 (Admin: Forms & Builder)
        │           └── Phase 7 (Admin: Categories)
        │
        └── Phase 8 (Polish & QA) — after all above
```

> **Note:** Phases 3-4 (General user flow) and Phases 5-7 (Admin flow) can be developed in parallel after Phase 2 is complete.

---

## Quick Reference: Key Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build
npx tsc --noEmit         # Type check
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix lint issues

# Testing
npm run test             # Run unit tests (Vitest)
npm run test:coverage    # Coverage report
npm run e2e              # E2E tests (Playwright)
```

---

*This plan is a living document. Update checkpoints as phases complete.*
